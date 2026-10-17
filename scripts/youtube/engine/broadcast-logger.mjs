// scripts/youtube/engine/broadcast-logger.mjs
// Centralized persistent publication history & anti-duplication engine for VizhiTN YouTube
// Connects to Supabase 'youtube_broadcast_log' with dual-layer fallback to broadcast-history.json

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getTodayIst } from './calendar-reader.mjs';

const LOCAL_HISTORY_PATH = path.resolve('scripts/youtube/calendar/broadcast-history.json');

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
 * Loads the local file-based broadcast history
 */
function loadLocalHistory() {
  try {
    if (fs.existsSync(LOCAL_HISTORY_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_HISTORY_PATH, 'utf-8'));
    }
  } catch (_) {}
  return [];
}

/**
 * Saves a record to the local file-based history
 */
function saveLocalRecord(record) {
  try {
    const history = loadLocalHistory();
    history.push(record);
    const dir = path.dirname(LOCAL_HISTORY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[LOGGER WARN] Could not save to local broadcast-history.json:', err.message);
  }
}

/**
 * Checks if a specific broadcast format has ALREADY been published today
 * @param {'long-form' | 'podcast' | 'civic-shorts'} format
 * @param {string} [dateStr=today] - YYYY-MM-DD
 * @returns {Promise<{ published: boolean, existingRecord?: object }>}
 */
export async function isBroadcastCompletedToday(format, dateStr = getTodayIst()) {
  // 1. Try querying Supabase
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
      // Supabase query error, fallback to local file
    }
  }

  // 2. Fallback to local history file
  const localHistory = loadLocalHistory();
  const match = localHistory.find(r => r.broadcast_date === dateStr && r.format === format);
  if (match) {
    return { published: true, existingRecord: match };
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

  // Always save locally
  saveLocalRecord(record);

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
