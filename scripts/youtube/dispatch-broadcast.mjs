#!/usr/bin/env node
// scripts/youtube/dispatch-broadcast.mjs
// VizhiTN 90-Day Intelligent Broadcast Dispatcher & Anti-Delay Router
// Resolves true IST clock, checks 90-day calendar, guards against duplicates via Supabase log.

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

  const isPillarShort = ['utility-shorts', 'scam-shorts', 'scheme-shorts', 'rights-shorts', 'current-affairs-shorts', 'current-affairs-bulletin'].includes(format);

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
    'current-affairs-bulletin': { script: 'scripts/youtube/pipelines/generate-current-affairs-bulletin.mjs', extraArgs: [] },
    'current-affairs-shorts': { script: 'scripts/youtube/pipelines/generate-current-affairs-shorts.mjs', extraArgs: [] },
    'podcast': { script: 'scripts/youtube/pipelines/generate-podcast.mjs', extraArgs: [] },
    'civic-shorts': { script: 'scripts/youtube/pipelines/generate-shorts.mjs', extraArgs: [] },
    'live-shorts': { script: 'scripts/youtube/pipelines/generate-live-shorts.mjs', extraArgs: [] },
    'utility-shorts': { script: 'scripts/youtube/pipelines/generate-shorts.mjs', extraArgs: ['--pillar=utility'] },
    'scam-shorts': { script: 'scripts/youtube/pipelines/generate-shorts.mjs', extraArgs: ['--pillar=scam'] },
    'scheme-shorts': { script: 'scripts/youtube/pipelines/generate-shorts.mjs', extraArgs: ['--pillar=scheme'] },
    'rights-shorts': { script: 'scripts/youtube/pipelines/generate-rights-shorts.mjs', extraArgs: [] }
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
 * Checks videos published >= 4 hours ago. If viewCount < 25 and Variant B exists,
 * automatically swaps the thumbnail to Variant B via YouTube Data API.
 */
async function auditAndAutoSwapThumbnails() {
  console.log('\n[A/B THUMBNAIL AUDITOR] Auditing recent broadcasts for CTR auto-swap...');
  try {
    const historyPath = path.resolve('scripts/youtube/calendar/broadcast-history.json');
    if (!fs.existsSync(historyPath)) return;
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    const now = Date.now();
    let swapCount = 0;

    for (const record of history) {
      if (!record.youtube_video_id || record.youtube_video_id === 'DRY_RUN_MOCK_ID') continue;
      const meta = record.metadata || {};
      if (meta.ab_swapped) continue;
      if (!meta.thumbnail_b_path || !fs.existsSync(meta.thumbnail_b_path)) continue;

      // Check age: must be at least 4 hours old
      const publishedAt = new Date(record.created_at || record.broadcast_date).getTime();
      const ageHours = (now - publishedAt) / (1000 * 3600);
      if (ageHours < 4) {
        console.log(`[A/B AUDIT] Video ${record.youtube_video_id} is ${ageHours.toFixed(1)}h old (evaluates at >= 4h).`);
        continue;
      }

      console.log(`[A/B AUDIT] Checking video stats for ${record.youtube_video_id} ("${record.title}")...`);
      const stats = await getVideoStatistics(record.youtube_video_id);
      if (!stats) continue;

      console.log(`[A/B AUDIT] Video ${record.youtube_video_id} stats: ${stats.viewCount} views in ${ageHours.toFixed(1)} hours.`);
      if (stats.viewCount < 25) {
        console.warn(`[A/B THUMBNAIL SWAP ⚡] Video ${record.youtube_video_id} has < 25 views (${stats.viewCount}). Swapping to Variant B!`);
        await setYouTubeThumbnail(record.youtube_video_id, meta.thumbnail_b_path);
        meta.ab_swapped = true;
        meta.ab_swapped_at = new Date().toISOString();
        meta.views_at_swap = stats.viewCount;
        swapCount++;
      } else {
        console.log(`[A/B AUDIT ✓] Video ${record.youtube_video_id} performing well (${stats.viewCount} views). Retaining Variant A.`);
        meta.ab_swapped = true; // Evaluated
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
  const isBackfill = process.argv.includes('--backfill');
  const isAuditOnly = process.argv.includes('--audit-thumbnails');
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1] || 'auto';

  // Run autonomous A/B thumbnail audit
  if (isAuditOnly) {
    await auditAndAutoSwapThumbnails();
    return;
  }


  const now = getNowIst();
  const todayIst = now.date;

  console.log('====================================================');
  console.log('VizhiTN Intelligent Broadcast Dispatcher');
  console.log(`Current IST: ${now.date} ${now.hours.toString().padStart(2, '0')}:${now.minutes.toString().padStart(2, '0')} (Day ${now.dayOfWeek})`);
  console.log('====================================================');

  // Mode 1: Backfill mode (used by Watchdog)
  if (isBackfill) {
    console.log('[WATCHDOG MODE] Checking for any missed broadcasts today...');
    const expected = getExpectedUploadsSoFar(todayIst);

    // If past 01:30 PM IST (810 mins), live-shorts should also have run
    if (now.totalMinutes >= 810) {
      expected.push({ format: 'live-shorts', title: 'Daily Live Civic Short', time_ist: '01:30 PM' });
    }

    console.log(`[INFO] Found ${expected.length} broadcasts expected up to current time.`);

    for (const item of expected) {
      const status = await isBroadcastCompletedToday(item.format, todayIst);
      if (!status.published) {
        console.warn(`[WATCHDOG ALERT] Missed broadcast detected: ${item.format} ("${item.title}"). Backfilling now!`);
        await handleSlot(item.format, isDryRun, force);
      } else {
        console.log(`[WATCHDOG OK ✓] ${item.format} is verified published.`);
      }
    }
    return;
  }

  // Mode 2: Explicit slot
  if (slotArg && slotArg !== 'auto') {
    if (slotArg === 'all') {
      const scheduled = getScheduledUploadsForDate(todayIst);
      await handleSlot('live-shorts', isDryRun, force);
      for (const item of scheduled) {
        await handleSlot(item.format, isDryRun, force);
      }
      return;
    }
    await handleSlot(slotArg, isDryRun, force);
    return;
  }

  // Mode 3: Auto slot resolution based on real-world IST time & calendar
  console.log('[AUTO ROUTER] Determining active broadcast slot by IST hour...');

  // Autonomous Self-Healing: Verify if any earlier slot scheduled for today was missed!
  if (!force && !isDryRun) {
    const expected = getExpectedUploadsSoFar(todayIst);
    if (now.totalMinutes >= 810) {
      expected.push({ format: 'live-shorts', title: 'Daily Live Civic Short', time_ist: '01:30 PM' });
    }
    // Also include daily podcast if after 05:55 PM IST (1072 minutes) and in database or calendar
    if (now.totalMinutes >= 1072) {
      let ep = null;
      try { ep = await getEpisodeFromDatabase(todayIst); } catch (_) {}
      const hasPodcast = Boolean(ep || getScheduledUploadForSlot('podcast', todayIst));
      if (hasPodcast) {
        const pTitle = ep?.topic_title || ep?.title_ta || ep?.title_en || 'Daily Vizhi Uncut Podcast';
        expected.push({ format: 'podcast', title: pTitle, time_ist: '05:55 PM' });
      }
    }
    for (const item of expected) {
      const status = await isBroadcastCompletedToday(item.format, todayIst);
      if (!status.published) {
        console.warn(`[AUTO CATCH-UP] Detected missed broadcast for earlier slot today: ${item.format} ("${item.title}"). Catching up now!`);
        await handleSlot(item.format, isDryRun, false);
      }
    }
  }

  let targetFormat = null;

  if (now.hours >= 19 && now.hours < 21) {
    // Evening window (07:00 PM - 08:59 PM IST): Daily 8 PM TN 24H Current Affairs Bulletin
    targetFormat = 'current-affairs-bulletin';
  } else if (now.hours >= 12 && now.hours < 16) {
    // Afternoon window (12:00 PM - 03:59 PM IST): Afternoon Exam Prep Short (01:00 PM)
    targetFormat = 'current-affairs-shorts';
  } else if (now.hours >= 21) {
    // Night window (09:00 PM - 11:59 PM IST): Rapid Current Affairs Exam Recap Short (09:30 PM)
    targetFormat = 'current-affairs-shorts';
  } else if (now.hours < 12) {
    // Morning window (06:00 AM - 11:59 AM IST): High-Retention Utility & Money Hack Short
    targetFormat = 'utility-shorts';
  } else {
    targetFormat = 'current-affairs-shorts';
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
