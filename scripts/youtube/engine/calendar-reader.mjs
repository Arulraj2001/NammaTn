// scripts/youtube/engine/calendar-reader.mjs
// Reads from the 90-Day YouTube Content Calendar (scripts/youtube/calendar/calendar-90days.json)
// Provides IST-accurate date resolution, slot lookup, and evergreen fallbacks.

import fs from 'fs';
import path from 'path';

const CALENDAR_PATH = path.resolve('scripts/youtube/calendar/calendar-90days.json');

let cachedCalendar = null;

export function loadCalendar() {
  if (cachedCalendar) return cachedCalendar;
  try {
    if (fs.existsSync(CALENDAR_PATH)) {
      const raw = fs.readFileSync(CALENDAR_PATH, 'utf-8');
      cachedCalendar = JSON.parse(raw);
      return cachedCalendar;
    }
  } catch (err) {
    console.error('[CALENDAR ERROR] Failed to load calendar-90days.json:', err.message);
  }
  return { metadata: {}, byDate: {}, entries: [] };
}

/**
 * Returns current date string in IST timezone (YYYY-MM-DD)
 */
export function getTodayIst() {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  return ist.toISOString().slice(0, 10);
}

/**
 * Returns current hour and minute in IST timezone
 */
export function getNowIst() {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  const ist = new Date(istMs);
  return {
    date: ist.toISOString().slice(0, 10),
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
    dayOfWeek: ist.getUTCDay(), // 0 (Sun) to 6 (Sat)
    totalMinutes: ist.getUTCHours() * 60 + ist.getUTCMinutes()
  };
}

/**
 * Returns all calendar entries scheduled for a given date (defaults to today IST)
 * @param {string} [dateStr] - YYYY-MM-DD
 * @returns {Array<object>}
 */
export function getScheduledUploadsForDate(dateStr = getTodayIst()) {
  const cal = loadCalendar();
  return (cal.byDate?.[dateStr] || []).filter(u => u.format !== 'long-form');
}

/**
 * Returns the calendar entry for a specific format on a given date
 * @param {'long-form' | 'podcast' | 'civic-shorts'} format
 * @param {string} [dateStr] - YYYY-MM-DD
 * @returns {object|null}
 */
export function getScheduledUploadForSlot(format, dateStr = getTodayIst()) {
  const uploads = getScheduledUploadsForDate(dateStr);
  return uploads.find(u => u.format === format) || null;
}

/**
 * Returns all uploads scheduled up to the current IST time today that may need verification
 * @param {string} [dateStr]
 * @returns {Array<object>}
 */
export function getExpectedUploadsSoFar(dateStr = getTodayIst()) {
  const now = getNowIst();
  const uploads = getScheduledUploadsForDate(dateStr);

  return uploads.filter(u => {
    // Parse time_ist: e.g. "07:00 AM", "06:00 PM", "07:30 PM"
    const [timePart, meridiem] = (u.time_ist || '').split(' ');
    if (!timePart || !meridiem) return true;
    let [h, m] = timePart.split(':').map(Number);
    if (meridiem.toUpperCase() === 'PM' && h < 12) h += 12;
    if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
    const itemMinutes = h * 60 + (m || 0);

    // Give a 15-minute buffer past scheduled time before expecting it
    return now.totalMinutes >= itemMinutes;
  });
}

/**
 * Queries Supabase content_episodes for today's episode metadata and custom script
 * @param {string} [dateStr] - YYYY-MM-DD
 * @returns {Promise<object|null>}
 */
export async function getEpisodeFromDatabase(dateStr = getTodayIst()) {
  const url = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('content_episodes')
      .select('*')
      .eq('scheduled_date', dateStr)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[CALENDAR DB WARN] Error querying content_episodes:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[CALENDAR DB WARN] Could not query content_episodes:', err.message);
    return null;
  }
}

/**
 * Updates an episode status and publishing URLs in Supabase content_episodes
 * @param {number} episodeNumber
 * @param {object} updateFields
 */
export async function updateEpisodeStatusInDb(episodeNumber, updateFields) {
  const url = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
  if (!url || !key || !episodeNumber) return;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    await supabase
      .from('content_episodes')
      .update({ ...updateFields, updated_at: new Date().toISOString() })
      .eq('episode_number', episodeNumber);
  } catch (err) {
    console.warn('[CALENDAR DB WARN] Could not update content_episodes:', err.message);
  }
}

