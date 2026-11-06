#!/usr/bin/env node
// scripts/youtube/dispatch-broadcast.mjs
// VizhiTN Dedicated Broadcast Dispatcher & Anti-Delay Router
// Orchestrates the 5 Dedicated Daily Broadcast Slots (Option C):
// 1. 07:00 AM IST: Statewide Civic Lifeline Alert (Power Cuts & School Holidays + WhatsApp Channel Sync)
// 2. 07:30 AM IST: TNPSC One-Mark Sure Shot Part 1 (Morning Question Challenge - Unanswered, 5s Timer)
// 3. 10:30 AM IST: TNPSC Samacheer Masterclass Part 1 (Morning Deep Explanation - Who, When, Book, PYQ)
// 4. 06:30 PM IST: TNPSC One-Mark Sure Shot Part 2 (Evening Question Challenge - Unanswered, 5s Timer)
// 5. 09:00 PM IST: TNPSC Samacheer Masterclass Part 2 (Evening Deep Explanation - Who, When, Book, PYQ)

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
    'quiz-morning-q',
    'quiz-morning-a',
    'quiz-evening-q',
    'quiz-evening-a',
    'quiz-shorts',
    'quiz-morning',
    'quiz-evening',
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

    // 2. 07:30 AM IST — TNPSC One-Mark Sure Shot Part 1 (Morning Question, Unanswered Challenge, Comment-Driven)
    'quiz-morning-q': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-q', '--mode=question'] },
    'quiz-morning': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-q', '--mode=question'] },
    'quiz-shorts': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-q', '--mode=question'] },

    // 3. 10:30 AM IST — TNPSC Samacheer Masterclass (Morning Deep Explanation: Who, When, Book, PYQ)
    'quiz-morning-a': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-morning-a', '--mode=explanation'] },

    // 4. 06:30 PM IST — TNPSC One-Mark Sure Shot Part 2 (Evening Question, Unanswered Challenge, Comment-Driven)
    'quiz-evening-q': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-evening-q', '--mode=question'] },
    'quiz-evening': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-evening-q', '--mode=question'] },

    // 5. 09:00 PM IST — TNPSC Samacheer Masterclass (Evening Deep Explanation: Who, When, Book, PYQ)
    'quiz-evening-a': { script: 'scripts/youtube/pipelines/generate-quiz-shorts.mjs', extraArgs: ['--slot=quiz-evening-a', '--mode=explanation'] },

    // Other supported pipelines
    'rights-shorts': { script: 'scripts/youtube/pipelines/generate-rights-shorts.mjs', extraArgs: [] },
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

  if (now.totalMinutes < 435) {
    // 00:00 to 07:15 IST -> Slot 1: Statewide Civic Lifeline Alert (Power Cuts & School Holidays)
    targetFormat = 'civic-alert';
  } else if (now.totalMinutes < 570) {
    // 07:16 to 09:30 IST -> Slot 2: TNPSC Set 1 Morning Question (Unanswered Challenge)
    targetFormat = 'quiz-morning-q';
  } else if (now.totalMinutes < 840) {
    // 09:31 to 14:00 IST -> Slot 3: TNPSC Set 1 Morning Samacheer Masterclass (Deep Explanation)
    targetFormat = 'quiz-morning-a';
  } else if (now.totalMinutes < 1200) {
    // 14:01 to 20:00 IST -> Slot 4: TNPSC Set 2 Evening Question (Unanswered Challenge)
    targetFormat = 'quiz-evening-q';
  } else {
    // 20:01 to 23:59 IST -> Slot 5: TNPSC Set 2 Evening Samacheer Masterclass (Deep Explanation)
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
