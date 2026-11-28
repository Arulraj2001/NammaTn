// scripts/cloudflare/deploy-cron-worker.mjs
/**
 * Deploys VizhiTN Exact-Time IST Cron Dispatcher to Cloudflare Workers
 * using CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN from .env.local and
 * GH_DISPATCH_TOKEN (or `gh auth token` from GitHub CLI).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const SCRIPT_NAME = 'vizhitn-cron-dispatcher';
const WORKER_PATH = path.resolve('scripts/cloudflare/cron-dispatcher-worker.js');

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.YOUTUBE_CLOUDFLARE_ACCOUNT_ID;
  const cfToken = process.env.CLOUDFLARE_API_TOKEN || process.env.YOUTUBE_CLOUDFLARE_API_TOKEN;

  if (!accountId || !cfToken) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.');
  }

  let ghToken = process.env.GH_DISPATCH_TOKEN;
  if (!ghToken) {
    ghToken = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  }
  if (!ghToken) {
    throw new Error('Missing GH_DISPATCH_TOKEN and `gh auth token` returned empty.');
  }

  const workerCode = fs.readFileSync(WORKER_PATH, 'utf-8');
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify({ main_module: 'worker.js', compatibility_date: '2026-11-26' })], {
      type: 'application/json',
    })
  );
  form.append('worker.js', new Blob([workerCode], { type: 'application/javascript+module' }), 'worker.js');

  console.log(`[1/3] Uploading Worker "${SCRIPT_NAME}" to Cloudflare...`);
  const uploadRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${SCRIPT_NAME}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${cfToken}` },
      body: form,
    }
  );
  const uploadJson = await uploadRes.json();
  if (!uploadRes.ok || !uploadJson.success) {
    throw new Error(`Worker upload failed: ${JSON.stringify(uploadJson.errors || uploadJson)}`);
  }
  console.log(`[1/3 ✓] Uploaded Worker "${SCRIPT_NAME}" (etag=${uploadJson.result?.etag || 'ok'}).`);

  console.log('[2/3] Setting encrypted GH_DISPATCH_TOKEN secret...');
  const secretRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${SCRIPT_NAME}/secrets`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${cfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'GH_DISPATCH_TOKEN',
        text: ghToken,
        type: 'secret_text',
      }),
    }
  );
  const secretJson = await secretRes.json();
  if (!secretRes.ok || !secretJson.success) {
    throw new Error(`Secret update failed: ${JSON.stringify(secretJson.errors || secretJson)}`);
  }
  console.log('[2/3 ✓] Encrypted secret GH_DISPATCH_TOKEN stored on Worker.');

  console.log('[3/3] Attaching 15-minute Cron Trigger (*/15 * * * *)...');
  const schedRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${SCRIPT_NAME}/schedules`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${cfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ cron: '*/15 * * * *' }]),
    }
  );
  const schedJson = await schedRes.json();
  if (!schedRes.ok || !schedJson.success) {
    throw new Error(`Schedule attach failed: ${JSON.stringify(schedJson.errors || schedJson)}`);
  }
  console.log('[3/3 ✓] Cron Trigger active:', JSON.stringify(schedJson.result));
}

main().catch(err => {
  console.error('[DEPLOY FAILED ❌]', err.message);
  process.exit(1);
});
