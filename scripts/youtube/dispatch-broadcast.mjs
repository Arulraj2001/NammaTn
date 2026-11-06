#!/usr/bin/env node
// scripts/youtube/dispatch-broadcast.mjs
// VizhiTN Dedicated Broadcast Dispatcher & Anti-Delay Router
// Orchestrates the 3 High-Yield Daily Slots:
// 1. 07:00 AM IST: Statewide Civic Lifeline Alert (Power Cuts & School Holidays + WhatsApp Channel Sync)
// 2. 01:30 PM IST: TN Mega Projects & Real Scam Exposes (Auto-sync to FB & IG Reels)
// 3. 07:00 PM IST: Tamil Nadu Untold Mysteries & Engineering Marvels

import fs from 'fs';
import { spawn } from 'node:child_process';
import path from 'path';
import { getTodayIst, getNowIst, getScheduledUploadForSlot, getEpisodeFromDatabase } from './engine/calendar-reader.mjs';
import { isBroadcastCompletedToday } from './engine/broadcast-logger.mjs';
import { setYouTubeThumbnail, getVideoStatistics } from './engine/youtube-client.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

function runPipeline(scriptRelativePath, args = []) {
  return new Promise((resolve, reject) => {
    const fullPath = path.resolve(scriptRelativePath);
    console.log(`[DISPATCH RUN] Starting node ${scriptRelativePath} ${args.join(' ')}`);
    const child = spawn('node', [fullPath, ...args], { stdio: 'inherit' });

    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Process ${scriptRelativePath} exited with code ${code}`));
    });

    child.on('error', err => reject(err));
  });
}

async function handleSlot(format, isDryRun, force) {
  const todayIst = getTodayIst();
  const calEntry = getScheduledUploadForSlot(format, todayIst);
  let dbEpisode = null;
  if (format === 'podcast') {
    try {
      dbEpisode = await getEpisodeFromDatabase(todayIst);
    } catch (_) {}
  }

  const isPillarShort = [
    'civic-alert',
    'emergency-alert',
    'infotainment-afternoon',
    'infotainment-evening',
    'mega-projects',
    'consumer-scams',
    'untold-mysteries',
    'rights-shorts',
    'scheme-shorts',
    'podcast'
  ].includes(format);

  // For calendar-driven formats, ensure calendar entry OR database episode exists unless forced or pillar short
  if (format !== 'live-shorts' && !isPillarShort && !calEntry && !dbEpisode && !force) {
    console.log(`[DISPATCH] No calendar entry or database episode for format "${format}" on ${todayIst}. Skipping.`);
    return;
  }

  // Deduplication check
  if (!force) {
    const status = await isBroadcastCompletedToday(format, todayIst);
    if (status.published) {
      console.log(`[DISPATCH GUARD ✓] Format "${format}" is ALREADY published today (${status.existingRecord?.youtube_video_id || 'logged'}). Exiting safely.`);
      return;
    }
  }

  const scriptMap = {
    // 1. 07:00 AM IST — Statewide Civic Lifeline Alert (Power Cuts & School Holidays + WhatsApp Channel Sync)
    'civic-alert': { script: 'scripts/youtube/pipelines/generate-civic-alert.mjs', extraArgs: [] },
    'emergency-alert': { script: 'scripts/youtube/pipelines/generate-civic-alert.mjs', extraArgs: [] },

    // 2. 01:30 PM IST — TN Mega Projects & Real Scams Exposed (Auto-sync to FB & IG Reels)
    'infotainment-afternoon': { script: 'scripts/youtube/pipelines/generate-infotainment-shorts.mjs', extraArgs: ['--slot=infotainment-afternoon'] },
    'mega-projects': { script: 'scripts/youtube/pipelines/generate-infotainment-shorts.mjs', extraArgs: ['--slot=infotainment-afternoon'] },
    'consumer-scams': { script: 'scripts/youtube/pipelines/generate-infotainment-shorts.mjs', extraArgs: ['--slot=infotainment-afternoon'] },
    'rights-shorts': { script: 'scripts/youtube/pipelines/generate-infotainment-shorts.mjs', extraArgs: ['--slot=infotainment-afternoon'] },

    // 3. 07:00 PM IST — Tamil Nadu Untold Mysteries & Engineering Marvels
    'infotainment-evening': { script: 'scripts/youtube/pipelines/generate-infotainment-shorts.mjs', extraArgs: ['--slot=infotainment-evening'] },
    'untold-mysteries': { script: 'scripts/youtube/pipelines/generate-infotainment-shorts.mjs', extraArgs: ['--slot=infotainment-evening'] },

    // Other supported pipelines
    'scheme-shorts': { script: 'scripts/youtube/pipelines/generate-scheme-shorts.mjs', extraArgs: [] },
    'podcast': { script: 'scripts/youtube/pipelines/generate-podcast.mjs', extraArgs: [] }
  };

  const entry = scriptMap[format];
  if (!entry) {
    console.error(`[DISPATCH ERROR] Unknown format: ${format}`);
    return;
  }

  const args = [...(entry.extraArgs || [])];
  if (isDryRun) args.push('--dry-run');

  const title = dbEpisode?.topic_title || dbEpisode?.title_ta || dbEpisode?.title_en || calEntry?.title || `${format.toUpperCase()} Broadcast`;
  console.log(`\n====================================================`);
  console.log(`VIZHITN BROADCAST EXECUTION: ${format.toUpperCase()}`);
  console.log(`Date: ${todayIst} | Title: "${title}"`);
  console.log(`====================================================\n`);

  await runPipeline(entry.script, args);
}

/**
 * Autonomous A/B Thumbnail Optimization Auditor
 */
async function auditAndAutoSwapThumbnails() {
  console.log('\n[A/B THUMBNAIL AUDITOR] Auditing recent broadcasts for CTR auto-swap...');
  try {
    const historyPath = path.resolve('scripts/youtube/calendar/broadcast-history.json');
    if (!fs.existsSync(historyPath)) return;
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    const candidates = history.filter(h => h.status === 'published' && h.youtube_video_id && !h.thumbnail_b_swapped && h.thumbnail_b_path);

    let swapCount = 0;
    for (const item of candidates) {
      const stats = await getVideoStatistics(item.youtube_video_id);
      if (stats && stats.viewCount < 25 && fs.existsSync(item.thumbnail_b_path)) {
        console.log(`[A/B SWAP] Video "${item.title}" has ${stats.viewCount} views. Auto-swapping to Variant B thumbnail...`);
        const ok = await setYouTubeThumbnail(item.youtube_video_id, item.thumbnail_b_path);
        if (ok) {
          item.thumbnail_b_swapped = true;
          item.thumbnail_b_swapped_at = new Date().toISOString();
          swapCount++;
        }
      }
    }
    if (swapCount > 0) {
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
      console.log(`[A/B THUMBNAIL AUDITOR ✓] Saved ${swapCount} thumbnail swap(s) to history.`);
    }
  } catch (err) {
    console.warn('[A/B THUMBNAIL AUDITOR ERROR]', err.message);
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1] || 'auto';

  if (process.argv.includes('--audit-thumbnails')) {
    await auditAndAutoSwapThumbnails();
    return;
  }

  const now = getNowIst();

  console.log('====================================================');
  console.log('VizhiTN Dedicated Broadcast Dispatcher');
  console.log(`Current IST: ${now.date} ${now.hours.toString().padStart(2, '0')}:${now.minutes.toString().padStart(2, '0')} (Total Minutes: ${now.totalMinutes})`);
  console.log('====================================================');

  // Mode 1: Explicit slot
  if (slotArg && slotArg !== 'auto') {
    await handleSlot(slotArg, isDryRun, force);
    return;
  }

  // Mode 2: Auto slot resolution based on real-world IST time
  console.log('[AUTO ROUTER] Determining active broadcast slot by IST time...');

  let targetFormat = null;

  if (now.totalMinutes < 600) {
    // 00:00 to 10:00 AM IST -> Slot 1: Statewide Civic Lifeline Alert (Power Cuts & School Holidays)
    targetFormat = 'civic-alert';
  } else if (now.totalMinutes < 960) {
    // 10:01 AM to 04:00 PM IST -> Slot 2: TN Mega Projects & Real Scam Exposes
    targetFormat = 'infotainment-afternoon';
  } else {
    // 04:01 PM to 11:59 PM IST -> Slot 3: Tamil Nadu Untold Mysteries & Engineering Marvels
    targetFormat = 'infotainment-evening';
  }

  console.log(`[AUTO ROUTER] Target slot for ${now.hours}:${now.minutes} IST is: "${targetFormat}"`);
  await handleSlot(targetFormat, isDryRun, force);

  // Passive A/B testing evaluation
  await auditAndAutoSwapThumbnails();
}

main().catch(err => {
  console.error('[FATAL DISPATCH ERROR]:', err);
  process.exit(1);
});
