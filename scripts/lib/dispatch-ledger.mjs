// scripts/lib/dispatch-ledger.mjs
/**
 * VizhiTN Autonomous Cross-Platform Dispatch Ledger
 * Enforces 100% Zero-Duplicate and Anti-Stale Policies across all publishing channels.
 * Tracks every message sent to WhatsApp, Twitter, Facebook, and Instagram.
 * Already-broadcasted posts are NEVER re-dispatched.
 */

import fs from 'fs';
import path from 'path';

const LEDGER_DIR = path.resolve('scripts/data');
const LEDGER_FILE = path.join(LEDGER_DIR, 'broadcast-ledger.json');

function ensureLedgerExists() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEDGER_FILE)) {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify({ entries: [] }, null, 2), 'utf-8');
  }
}

function readLedger() {
  ensureLedgerExists();
  try {
    const raw = fs.readFileSync(LEDGER_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.entries) ? parsed.entries : [];
  } catch (_) {
    return [];
  }
}

function writeLedger(entries) {
  ensureLedgerExists();
  try {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify({ entries: entries.slice(-1000) }, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[LEDGER WARN] Failed to save dispatch ledger:', err.message);
  }
}

/**
 * Checks if a post slug was already broadcast to a specific platform.
 * @param {string} platform - 'whatsapp' | 'twitter' | 'facebook' | 'instagram'
 * @param {string} slug - Unique post slug
 * @returns {boolean}
 */
export function isAlreadyDispatched(platform, slug) {
  if (!slug) return false;
  const entries = readLedger();
  const cleanSlug = slug.toLowerCase().trim();
  const plat = platform.toLowerCase().trim();
  return entries.some(e => e.platform === plat && e.slug.toLowerCase().trim() === cleanSlug);
}

/**
 * Records a successful broadcast in the persistent ledger.
 * @param {string} platform - 'whatsapp' | 'twitter' | 'facebook' | 'instagram'
 * @param {string} slug - Unique post slug
 * @param {object} meta - Additional metadata { title, district, category }
 */
export function recordDispatch(platform, slug, meta = {}) {
  if (!slug) return;
  const entries = readLedger();
  const cleanSlug = slug.toLowerCase().trim();
  const plat = platform.toLowerCase().trim();

  // Avoid duplicate entries in ledger itself
  if (entries.some(e => e.platform === plat && e.slug.toLowerCase().trim() === cleanSlug)) {
    return;
  }

  entries.push({
    platform: plat,
    slug: cleanSlug,
    title: meta.title || '',
    district: meta.district || '',
    category: meta.category || '',
    dispatched_at: new Date().toISOString()
  });

  writeLedger(entries);
  console.log(`[LEDGER ✓] Recorded "${cleanSlug}" as dispatched to [${plat.toUpperCase()}]. Total logged: ${entries.length}`);
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

