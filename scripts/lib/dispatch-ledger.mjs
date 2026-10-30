// scripts/lib/dispatch-ledger.mjs
/**
 * VizhiTN Autonomous Cross-Platform Dispatch Ledger
 * Enforces 100% Zero-Duplicate and Anti-Stale Policies across all publishing channels.
 * Backed by Supabase `site_settings` for cross-runner persistence in GitHub Actions,
 * with local JSON fallback.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const LEDGER_DIR = path.resolve('scripts/data');
const LEDGER_FILE = path.join(LEDGER_DIR, 'broadcast-ledger.json');

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (_) {}
}

let inMemoryEntries = [];

function ensureLocalLedgerExists() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEDGER_FILE)) {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify({ entries: [] }, null, 2), 'utf-8');
  }
}

function readLocalLedger() {
  ensureLocalLedgerExists();
  try {
    const raw = fs.readFileSync(LEDGER_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.entries) ? parsed.entries : [];
  } catch (_) {
    return [];
  }
}

function writeLocalLedger(entries) {
  ensureLocalLedgerExists();
  try {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify({ entries: entries.slice(-1000) }, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[LEDGER WARN] Failed to save local dispatch ledger:', err.message);
  }
}

// ── Top-Level Sync from Supabase site_settings ─────────────────────────────
try {
  if (supabase) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('category', 'dispatch_ledger');

    if (!error && Array.isArray(data) && data.length > 0) {
      data.forEach(row => {
        try {
          const val = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          const [plat, ...rest] = (row.key || '').split(':');
          const slug = rest.join(':') || val?.slug;
          if (plat && slug) {
            inMemoryEntries.push({
              platform: plat.toLowerCase().trim(),
              slug: slug.toLowerCase().trim(),
              title: val?.title || '',
              district: val?.district || '',
              category: val?.category || '',
              dispatched_at: val?.time || val?.dispatched_at || new Date().toISOString()
            });
          }
        } catch (_) {}
      });
      console.log(`[LEDGER SYNC ✓] Loaded ${inMemoryEntries.length} historical dispatches from Supabase cloud ledger.`);
    }
  }
} catch (syncErr) {
  console.warn('[LEDGER WARN] Supabase sync notice:', syncErr.message);
}

// Merge any local ledger entries
const localEntries = readLocalLedger();
localEntries.forEach(le => {
  if (!inMemoryEntries.some(e => e.platform === le.platform && e.slug === le.slug)) {
    inMemoryEntries.push(le);
  }
});

/**
 * Checks if a post slug was already broadcast to a specific platform.
 * @param {string} platform - 'whatsapp' | 'twitter' | 'facebook' | 'instagram'
 * @param {string} slug - Unique post slug
 * @returns {boolean}
 */
export function isAlreadyDispatched(platform, slug) {
  if (!slug) return false;
  const cleanSlug = slug.toLowerCase().trim();
  const plat = platform.toLowerCase().trim();
  return inMemoryEntries.some(e => e.platform === plat && e.slug.toLowerCase().trim() === cleanSlug);
}

/**
 * Records a successful broadcast in the persistent ledger (both Supabase & local disk).
 * @param {string} platform - 'whatsapp' | 'twitter' | 'facebook' | 'instagram'
 * @param {string} slug - Unique post slug
 * @param {object} meta - Additional metadata { title, district, category }
 */
export async function recordDispatch(platform, slug, meta = {}) {
  if (!slug) return;
  const cleanSlug = slug.toLowerCase().trim();
  const plat = platform.toLowerCase().trim();

  // Avoid duplicate entries in ledger itself
  if (inMemoryEntries.some(e => e.platform === plat && e.slug.toLowerCase().trim() === cleanSlug)) {
    return;
  }

  const newEntry = {
    platform: plat,
    slug: cleanSlug,
    title: meta.title || '',
    district: meta.district || '',
    category: meta.category || '',
    dispatched_at: new Date().toISOString()
  };

  inMemoryEntries.push(newEntry);
  writeLocalLedger(inMemoryEntries);

  // Persist to Supabase site_settings for cross-runner persistence in GitHub Actions
  if (supabase) {
    try {
      const dbKey = `${plat}:${cleanSlug}`;
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id, key')
        .eq('key', dbKey)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from('site_settings')
          .insert({
            key: dbKey,
            category: 'dispatch_ledger',
            value: JSON.stringify(newEntry)
          });
      }
    } catch (dbErr) {
      console.warn(`[LEDGER WARN] Failed to persist dispatch to Supabase: ${dbErr.message}`);
    }
  }

  console.log(`[LEDGER ✓] Recorded "${cleanSlug}" as dispatched to [${plat.toUpperCase()}]. Total logged: ${inMemoryEntries.length}`);
}

/**
 * Filters an array of candidate posts, returning only those that have NOT
 * yet been broadcast to the specified platform.
 * @param {string} platform - 'whatsapp' | 'twitter' | 'facebook' | 'instagram'
 * @param {Array<object>} posts - List of candidate posts
 * @returns {Array<object>} Filtered unbroadcasted posts
 */
export function filterUnbroadcastedPosts(platform, posts = []) {
  const plat = platform.toLowerCase().trim();
  return posts.filter(post => {
    const slug = post?.slug;
    if (!slug) return false;
    const dispatched = isAlreadyDispatched(plat, slug);
    if (dispatched) {
      console.log(`[ANTI-DUP SKIP] "${slug}" already dispatched to ${plat}. Skipping.`);
    }
    return !dispatched;
  });
}

/**
 * Checks whether an event date is stale (i.e. strictly before today in IST).
 * @param {string} dateString - Date string (YYYY-MM-DD or readable)
 * @returns {boolean} True if stale (older than today)
 */
export function isEventStale(dateString) {
  if (!dateString) return false;
  try {
    const match = dateString.match(/\b(202\d-\d{2}-\d{2})\b/);
    if (match) {
      const istNow = new Date(Date.now() + 5.5 * 3600 * 1000);
      const todayIstStr = istNow.toISOString().slice(0, 10);
      return match[1] < todayIstStr;
    }
  } catch (_) {}
  return false;
}
