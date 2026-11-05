#!/usr/bin/env node
// scripts/youtube/dispatch-broadcast.mjs
// VizhiTN Dedicated Broadcast Dispatcher & Anti-Delay Router
// Orchestrates the 6 Dedicated Daily Slots with YouTube API Quota Guards and WhatsApp Channel Sync.

import fs from 'fs';
import { spawn } from 'node:child_process';
import path from 'path';
import { getTodayIst, getNowIst, getScheduledUploadsForDate, getScheduledUploadForSlot, getExpectedUploadsSoFar, getEpisodeFromDatabase } from './engine/calendar-reader.mjs';
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
    'quiz-morning-q',
    'quiz-morning-a',
    'rights-shorts',
    'quiz-evening-q',
    'quiz-evening-a',
    'quiz-shorts',
    'quiz-morning',
    'quiz-evening',
    'emergency-alert',
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
    // 1. 06:45 AM IST — Live Civic Alert (School Holidays / TANGEDCO Power Cuts + WhatsApp Channel Sync)
    'civic-alert': { script: 'scripts/youtube/pipelines/generate-civic-alert.mjs', extraArgs: [] },
    'emergency-alert': { script: 'scripts/youtube/pipelines/generate-civic-alert.mjs', extraArgs: [] },

    // 2. 07:30 AM IST — TNPSC One-Mark Sure Shot Part 1 (Morning Question, Unanswered, Comment-Driven)
    'quiz-morning-q': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-q', '--mode=question'] },
    'quiz-morning': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-q', '--mode=question'] },
    'quiz-shorts': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-q', '--mode=question'] },

    // 3. 10:30 AM IST — TNPSC Samacheer Masterclass (Morning Deep Explanation: Who, When, Book, PYQ)
    'quiz-morning-a': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-a', '--mode=explanation'] },

    // 4. 01:30 PM IST — Citizen Legal Shield & Dispute Rights (Police, Tenant, Consumer, Auto-Crosspost to FB/IG)
    'rights-shorts': { script: 'scripts/youtube/pipelines/generate-rights-shorts.mjs', extraArgs: [] },

    // 5. 06:30 PM IST — TNPSC One-Mark Sure Shot Part 2 (Evening Question, Unanswered, Comment-Driven)
    'quiz-evening-q': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-evening-q', '--mode=question'] },
    'quiz-evening': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-evening-q', '--mode=question'] },

    // 6. 09:00 PM IST — TNPSC Samacheer Masterclass (Evening Deep Explanation: Who, When, Book, PYQ)
    'quiz-evening-a': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-evening-a', '--mode=explanation'] },

    // Other pipelines
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
  const todayIst = now.date;

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

  if (now.totalMinutes < 435) {
    // 00:00 to 07:15 IST -> Slot 1: Live Civic Alert (School Holidays / TANGEDCO Power Cut)
    targetFormat = 'civic-alert';
  } else if (now.totalMinutes < 570) {
    // 07:16 to 09:30 IST -> Slot 2: TNPSC Morning Question (Unanswered Challenge)
    targetFormat = 'quiz-morning-q';
  } else if (now.totalMinutes < 750) {
    // 09:31 to 12:30 IST -> Slot 3: TNPSC Morning Samacheer Masterclass (Deep Explanation)
    targetFormat = 'quiz-morning-a';
  } else if (now.totalMinutes < 1050) {
    // 12:31 to 17:30 IST -> Slot 4: Citizen Legal Shield & Dispute Rights
    targetFormat = 'rights-shorts';
  } else if (now.totalMinutes < 1230) {
    // 17:31 to 20:30 IST -> Slot 5: TNPSC Evening Question (Unanswered Challenge)
    targetFormat = 'quiz-evening-q';
  } else {
    // 20:31 to 23:59 IST -> Slot 6: TNPSC Evening Samacheer Masterclass (Deep Explanation)
    targetFormat = 'quiz-evening-a';
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
