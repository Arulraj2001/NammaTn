#!/usr/bin/env node
/**
 * scripts/auto-watchdog.mjs
 * VizhiTN Autonomous Publishing Watchdog
 *
 * Detects when a scheduled bot batch silently failed to publish (e.g. because GitHub
 * Actions could not provision a hosted runner — "The job was not acquired by Runner of
 * type hosted…" / "Internal server error") and backfills the missing content itself.
 *
 * It is DB-truth based: it queries Supabase for content created "today" (in IST) and,
 * only when a batch is missing, re-runs the corresponding poster script.
 *
 * Usage:
 *   node scripts/auto-watchdog.mjs --window=morning   # ~10:00 IST (04:30 UTC)
 *   node scripts/auto-watchdog.mjs --window=evening   # ~20:00 IST (14:30 UTC)
 *
 * Env (same as the poster bots):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, SITE_URL
 * Optional for issue notification:
 *   GITHUB_TOKEN, GITHUB_REPOSITORY (auto-injected in GitHub Actions)
 */

import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';

// Load .env.local if present locally
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const IST_OFFSET_MS = 5.5 * 3600 * 1000;
const ROOT = new URL('../', import.meta.url).pathname;

// Expected minimum content per bot for a given IST day. Thresholds are intentionally
// low so recovery only triggers on a REAL failure, not on partial variance.
const EXPECTED = {
  morning: { civic: { min: 5 }, tntoday: { min: 1 }, politics: { min: 0 } },
  evening: { civic: { min: 15 }, politics: { min: 1 }, tntoday: { min: 2 } },
};

const PULSE_ARG = {
  morning: { civic: '--pulse=morning', tntoday: '--pulse=morning' },
  evening: { civic: '--pulse=auto', tntoday: '--pulse=auto' },
};

const SCRIPT = {
  civic: 'scripts/auto-civic-poster.mjs',
  politics: 'scripts/auto-politics-poster.mjs',
  tntoday: 'scripts/auto-tntoday-poster.mjs',
};
const LABEL = { civic: 'Civic Bot', politics: 'Politics Bot', tntoday: 'TN Today Bot' };

function istDayBounds() {
  const now = new Date();
  const istMs = now.getTime() + IST_OFFSET_MS;
  const ist = new Date(istMs);
  const startUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return {
    todayStartISO: new Date(startUtc).toISOString(),
    todayEndISO: new Date(startUtc + 24 * 3600 * 1000).toISOString(),
  };
}

async function initSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!process.env.GEMINI_API_KEY) {
    console.error('[FATAL] GEMINI_API_KEY is required for recovery backfills.');
    process.exit(1);
  }
  if (!url || !key) {
    console.error('[FATAL] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// Count of ACTIVE civic posts (non-politics) created during today's IST day.
async function countCivicToday(client, bounds) {
  const { count, error } = await client
    .from('post')
    .select('id', { count: 'exact', head: true })
    .gte('created_date', bounds.todayStartISO)
    .lt('created_date', bounds.todayEndISO)
    .eq('status', 'active')
    .neq('category_slug', 'tn-politics');
  if (error) throw new Error(`civic count failed: ${error.message}`);
  return count ?? 0;
}

// Count of POLITICS posts created during today's IST day.
async function countPoliticsToday(client, bounds) {
  const { count, error } = await client
    .from('post')
    .select('id', { count: 'exact', head: true })
    .gte('created_date', bounds.todayStartISO)
    .lt('created_date', bounds.todayEndISO)
    .eq('status', 'active')
    .eq('category_slug', 'tn-politics');
  if (error) throw new Error(`politics count failed: ${error.message}`);
  return count ?? 0;
}

// Count of TN Today articles published during today's IST day.
async function countTntodayToday(client, bounds) {
  const { count, error } = await client
    .from('tn_today')
    .select('id', { count: 'exact', head: true })
    .gte('publish_date', bounds.todayStartISO)
    .lt('publish_date', bounds.todayEndISO)
    .eq('status', 'published');
  if (error) throw new Error(`tntoday count failed: ${error.message}`);
  return count ?? 0;
}

function runScript(key, args, timeoutMs = 55 * 60 * 1000) {
  return new Promise((resolve) => {
    console.log(`\n[WATCHDOG] Backfilling ${LABEL[key]} -> node ${SCRIPT[key]} ${args.join(' ')}`);
    const child = spawn(process.execPath, [SCRIPT[key], ...args], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    const timer = setTimeout(() => {
      console.warn(`[WATCHDOG] ${key} timed out after ${timeoutMs / 1000}s; killing.`);
      child.kill('SIGKILL');
    }, timeoutMs);
    child.on('close', (code) => {
      clearTimeout(timer);
      console.log(`[WATCHDOG] ${key} finished with exit code ${code}`);
      resolve(code === 0);
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      console.error(`[WATCHDOG] ${key} failed to spawn: ${err.message}`);
      resolve(false);
    });
  });
}

// Open a GitHub issue so the owner is alerted the same day a batch was missed + recovered.
async function notifyGithubIssue(summary) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) {
    console.log('[WATCHDOG] GITHUB_TOKEN/GITHUB_REPOSITORY not set; skipping issue creation.');
    return;
  }
  const body = [
    '## ⚠️ Scheduled batch was missed and auto-recovered',
    '',
    'One or more autonomous bot batches failed to publish on schedule (likely because GitHub Actions could not provision a hosted runner), and the watchdog backfilled them.',
    '',
    ...summary.map(s => `- **${s.label}** — found ${s.found}/${s.min}, backfilled: \`${s.backfilled ? 'yes' : 'no'}\``),
    '',
    'Review the workflow run logs for details.',
  ].join('\n');
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `[Watchdog] ${new Date().toISOString().slice(0, 16)} — missed batch auto-recovered`,
        body,
      }),
    });
    console.log(`[WATCHDOG] Issue notification ${res.ok ? 'created' : `failed (HTTP ${res.status})`}.`);
  } catch (err) {
    console.warn(`[WATCHDOG] Issue notification failed: ${err.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const window = (args.find(a => a.startsWith('--window=')) || '--window=morning').split('=')[1];
  const mode = window === 'evening' ? 'evening' : 'morning';

  console.log('====================================================');
  console.log(`   VizhiTN Publishing Watchdog  [window: ${mode}]`);
  console.log('====================================================');

  const client = await initSupabase();
  const bounds = istDayBounds();
  console.log(`[INFO] IST day window: ${bounds.todayStartISO} .. ${bounds.todayEndISO}`);

  const expectations = EXPECTED[mode];
  const countFns = { civic: countCivicToday, politics: countPoliticsToday, tntoday: countTntodayToday };
  const summary = [];
  const toRecover = [];

  for (const [key, min] of Object.entries(expectations)) {
    try {
      const found = await countFns[key](client, bounds);
      const needed = min > 0 && found < min;
      console.log(`[CHECK] ${LABEL[key]}: found ${found} today (min ${min}) -> ${needed ? 'MISSING, backfill' : 'ok'}`);
      summary.push({ label: LABEL[key], found, min, backfilled: false });
      if (needed) toRecover.push(key);
    } catch (err) {
      console.error(`[CHECK] ${LABEL[key]}: ${err.message}`);
    }
  }

  if (toRecover.length === 0) {
    console.log('\n[WATCHDOG] All expected batches present. No action needed.');
    return;
  }

  console.log(`\n[WATCHDOG] ${toRecover.length} missing batch(es): ${toRecover.join(', ')}`);
  for (const key of toRecover) {
    const pulse = PULSE_ARG[mode][key];
    const ok = await runScript(key, pulse ? [pulse] : []);
    const entry = summary.find(s => s.label === LABEL[key]);
    if (entry) entry.backfilled = ok;
  }

  await notifyGithubIssue(summary);
  console.log('\n[WATCHDOG] Done.');
}

main().catch(err => {
  console.error('[WATCHDOG FATAL]', err);
  process.exit(1);
});