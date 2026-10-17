#!/usr/bin/env node
// scripts/youtube/dispatch-broadcast.mjs
// VizhiTN 90-Day Intelligent Broadcast Dispatcher & Anti-Delay Router
// Resolves true IST clock, checks 90-day calendar, guards against duplicates via Supabase log.

import { spawn } from 'node:child_process';
import path from 'path';
import { getTodayIst, getNowIst, getScheduledUploadsForDate, getScheduledUploadForSlot, getExpectedUploadsSoFar } from './engine/calendar-reader.mjs';
import { isBroadcastCompletedToday } from './engine/broadcast-logger.mjs';

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

  // For calendar-driven formats, ensure calendar entry exists unless forced
  if (format !== 'live-shorts' && !calEntry && !force) {
    console.log(`[DISPATCH] No calendar entry for format "${format}" on ${todayIst}. Skipping.`);
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
    'long-form': 'scripts/youtube/pipelines/generate-long-video.mjs',
    'podcast': 'scripts/youtube/pipelines/generate-podcast.mjs',
    'civic-shorts': 'scripts/youtube/pipelines/generate-shorts.mjs',
    'live-shorts': 'scripts/youtube/pipelines/generate-live-shorts.mjs'
  };

  const script = scriptMap[format];
  if (!script) {
    console.error(`[DISPATCH ERROR] Unknown format: ${format}`);
    return;
  }

  const args = [];
  if (isDryRun) args.push('--dry-run');

  console.log(`\n====================================================`);
  console.log(`VIZHITN BROADCAST EXECUTION: ${format.toUpperCase()}`);
  console.log(`Date: ${todayIst} | Title: "${calEntry?.title || 'Live Civic Alert'}"`);
  console.log(`====================================================\n`);

  await runPipeline(script, args);
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const isBackfill = process.argv.includes('--backfill');
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1] || 'auto';

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

    // If past 02:00 PM IST (840 mins), live-shorts should also have run
    if (now.totalMinutes >= 840) {
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
  let targetFormat = null;

  if (now.hours < 12) {
    // Morning window (06:30 - 11:59 IST): Long-Form
    targetFormat = 'long-form';
  } else if (now.hours < 16) {
    // Lunchtime window (12:00 - 15:59 IST): Live Civic Short
    targetFormat = 'live-shorts';
  } else if (now.hours < 19) {
    // Evening podcast window (16:00 - 18:59 IST): Vizhi Uncut Duo Podcast
    targetFormat = 'podcast';
  } else {
    // Night short window (19:00 - 23:59 IST): 90-Day Calendar Civic Short
    targetFormat = 'civic-shorts';
  }

  console.log(`[AUTO ROUTER] Target slot for ${now.hours}:${now.minutes} IST is: "${targetFormat}"`);
  await handleSlot(targetFormat, isDryRun, force);
}

main().catch(err => {
  console.error('[FATAL DISPATCH ERROR]:', err);
  process.exit(1);
});
