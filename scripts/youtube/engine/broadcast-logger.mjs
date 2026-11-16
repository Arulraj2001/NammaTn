// scripts/youtube/engine/broadcast-logger.mjs
// Centralized persistent publication history & anti-duplication engine for VizhiTN YouTube
// Connects to Supabase 'youtube_broadcast_log' with dual-layer fallback to broadcast-history.json

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getTodayIst } from './calendar-reader.mjs';
import { isR2Configured, getJsonFromR2, saveJsonToR2 } from '../../lib/cloudflare-r2-storage.mjs';

const LOCAL_HISTORY_PATH = path.resolve('scripts/youtube/calendar/broadcast-history.json');
const R2_LEDGER_KEY = 'logs/broadcast-history.json';

// Initialize Supabase Client
let supabase = null;
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Loads the broadcast history across Cloudflare R2 and local disk
 */
export async function loadHistory() {
  // 1. Try Cloudflare R2 (Persistent across GitHub Actions runner instances)
  if (isR2Configured()) {
    try {
      const r2Data = await getJsonFromR2(R2_LEDGER_KEY);
      if (Array.isArray(r2Data)) return r2Data;
    } catch (_) {}
  }

  // 2. Fallback to local file
  try {
    if (fs.existsSync(LOCAL_HISTORY_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_HISTORY_PATH, 'utf-8'));
    }
  } catch (_) {}

  return [];
}

/**
 * Returns a Set of Question IDs that were already published within the past N days.
 * Prevents question recycling/duplication across automated cycles.
 */
export async function getRecentlyUsedQuestionIds(days = 30) {
  const history = await loadHistory();
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const used = new Set();

  for (const item of history) {
    if (item.broadcast_date >= cutoffDate) {
      if (item.metadata?.questionId) used.add(item.metadata.questionId);
      if (item.metadata?.question_id) used.add(item.metadata.question_id);
    }
  }

  return used;
}

/**
 * Returns a Set of Mindset Topic IDs published in the past N days.
 */
export async function getRecentlyUsedTopicIds(days = 30) {
  const history = await loadHistory();
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const used = new Set();

  for (const item of history) {
    if (item.broadcast_date >= cutoffDate) {
      if (item.metadata?.topicId) used.add(item.metadata.topicId);
      if (item.metadata?.topic_id) used.add(item.metadata.topic_id);
    }
  }

  return used;
}

/**
 * Saves a record to both Cloudflare R2 and local disk
 */
async function saveRecord(record) {
  let history = [];
  try {
    history = await loadHistory();
  } catch (_) {}

  history.push(record);

  // Save to local file
  try {
    const dir = path.dirname(LOCAL_HISTORY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[LOGGER WARN] Could not save to local broadcast-history.json:', err.message);
  }

  // Save to Cloudflare R2
  if (isR2Configured()) {
    try {
      await saveJsonToR2(R2_LEDGER_KEY, history);
      console.log(`[LOGGER ✓] Anti-duplication ledger saved to Cloudflare R2 (${R2_LEDGER_KEY}).`);
    } catch (err) {
      console.warn('[LOGGER WARN] Could not save to R2 ledger:', err.message);
    }
  }
}

/**
 * Checks if a specific broadcast format has ALREADY been published today
 * @param {'long-form' | 'podcast' | 'civic-shorts'} format
 * @param {string} [dateStr=today] - YYYY-MM-DD
 * @returns {Promise<{ published: boolean, existingRecord?: object }>}
 */
export async function isBroadcastCompletedToday(format, dateStr = getTodayIst()) {
  // 1. Try querying Cloudflare R2 Persistent Ledger (Fast & Independent of Supabase)
  const history = await loadHistory();
  const match = history.find(r => r.broadcast_date === dateStr && r.format === format);
  if (match) {
    return { published: true, existingRecord: match };
  }

  // 2. Try querying Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('youtube_broadcast_log')
        .select('*')
        .eq('broadcast_date', dateStr)
        .eq('format', format)
        .eq('status', 'published')
        .maybeSingle();

      if (!error && data) {
        return { published: true, existingRecord: data };
      }
    } catch (err) {
      // Supabase query error, fallback
    }
  }

  return { published: false };
}

/**
 * Records a successful YouTube broadcast
 * @param {object} params
 * @param {string} [params.broadcastDate] - YYYY-MM-DD
 * @param {'long-form' | 'podcast' | 'civic-shorts'} params.format
 * @param {string} params.timeIst
 * @param {string} params.title
 * @param {string} params.youtubeVideoId
 * @param {string} params.youtubeUrl
 * @param {string} [params.metaVideoId]
 * @param {string} [params.metaReelId]
 * @param {object} [params.metadata]
 */
export async function recordBroadcastSuccess({
  broadcastDate = getTodayIst(),
  format,
  timeIst,
  title,
  youtubeVideoId,
  youtubeUrl,
  metaVideoId = null,
  metaReelId = null,
  metadata = {}
}) {
  const record = {
    broadcast_date: broadcastDate,
    format,
    time_ist: timeIst,
    title,
    youtube_video_id: youtubeVideoId,
    youtube_url: youtubeUrl,
    meta_video_id: metaVideoId,
    meta_reel_id: metaReelId,
    status: 'published',
    metadata,
    created_at: new Date().toISOString()
  };

  // Always save locally & to Cloudflare R2
  await saveRecord(record);

  // Save to Supabase if accessible
  if (supabase) {
    try {
      const { error } = await supabase
        .from('youtube_broadcast_log')
        .insert(record);

      if (error) {
        console.warn('[LOGGER WARN] Supabase table insert notice:', error.message);
      } else {
        console.log(`[LOGGER ✓] Broadcast recorded in Supabase: ${format} -> ${youtubeVideoId}`);
      }
    } catch (err) {
      console.warn('[LOGGER WARN] Supabase connection notice:', err.message);
    }
  }

  console.log(`[BROADCAST LOGGED] "${title}" logged as published for ${broadcastDate} (${format})`);
  return record;
}
