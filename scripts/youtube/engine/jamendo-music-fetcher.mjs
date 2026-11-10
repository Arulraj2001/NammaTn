// scripts/youtube/engine/jamendo-music-fetcher.mjs
/**
 * Automated Jamendo Royalty-Free Background Music Engine
 * Fetches real studio-recorded cinematic, ambient, and motivational instrumental tracks
 * using JAMENDO_CLIENT_ID with local caching and zero copyright strikes.
 */

import fs from 'fs';
import path from 'path';

const MUSIC_CACHE_DIR = path.resolve('scripts/youtube/assets/music_cache');
if (!fs.existsSync(MUSIC_CACHE_DIR)) {
  fs.mkdirSync(MUSIC_CACHE_DIR, { recursive: true });
}

// Mood/Category mapping for student discipline topics
const TOPIC_MUSIC_TAGS = {
  'identity-shift': 'cinematic+epic+piano',
  'active-recall': 'ambient+electronic+focus',
  'dopamine-reset': 'cinematic+tension+dramatic',
  'regret-aversion': 'dark+cinematic+strings',
  'micro-habits': 'acoustic+inspiring+calm',
  'friction-design': 'ambient+drone+deep',
  'fear-extinguisher': 'inspirational+orchestral+triumph',
  'cognitive-science': 'ambient+electronic+chill',
  'default': 'cinematic+ambient'
};

/**
 * Downloads binary audio file from URL
 */
async function downloadAudio(url, destPath, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 50000) throw new Error('Audio file payload too small');
    fs.writeFileSync(destPath, buffer);
    return destPath;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Fetches or returns a cached high-quality instrumental music track matching category
 * 
 * @param {string} category - Mood or topic category
 * @returns {Promise<string|null>} Absolute path to local MP3 file
 */
export async function fetchJamendoMusicTrack(category = 'default') {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  const tags = TOPIC_MUSIC_TAGS[category] || TOPIC_MUSIC_TAGS.default;
  const safeTagSlug = tags.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const cachedFile = path.join(MUSIC_CACHE_DIR, `jamendo_${safeTagSlug}.mp3`);

  // Return cached file if already downloaded and valid
  if (fs.existsSync(cachedFile) && fs.statSync(cachedFile).size > 100000) {
    console.log(`[JAMENDO CACHE ✓] Using cached music track: ${path.basename(cachedFile)}`);
    return cachedFile;
  }

  if (!clientId) {
    console.warn('[JAMENDO NOTICE] JAMENDO_CLIENT_ID missing in environment. Using default ambient bed.');
    return null;
  }

  try {
    console.log(`[JAMENDO] Searching instrumental tracks for tags: "${tags}"...`);
    const apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&tags=${tags}&limit=5&order=popularity_total`;
    const res = await fetch(apiUrl);

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        // Pick one of the top popular tracks
        const track = data.results[Math.floor(Math.random() * Math.min(3, data.results.length))];
        const audioUrl = track.audio;

        if (audioUrl) {
          console.log(`[JAMENDO] Downloading track "${track.name}" by ${track.artist_name}...`);
          await downloadAudio(audioUrl, cachedFile);
          console.log(`[JAMENDO SUCCESS ✓] Downloaded and cached: ${path.basename(cachedFile)} (${(fs.statSync(cachedFile).size / (1024*1024)).toFixed(2)} MB)`);
          return cachedFile;
        }
      }
    }
  } catch (err) {
    console.warn(`[JAMENDO WARN] Could not fetch track: ${err.message}`);
  }

  // Fallback to default universal cinematic track
  const defaultTrack = path.join(MUSIC_CACHE_DIR, 'jamendo_default_cinematic.mp3');
  if (fs.existsSync(defaultTrack) && fs.statSync(defaultTrack).size > 100000) {
    console.log(`[JAMENDO FALLBACK ✓] Using default cinematic score: ${path.basename(defaultTrack)}`);
    return defaultTrack;
  }

  return fs.existsSync(cachedFile) ? cachedFile : null;
}

