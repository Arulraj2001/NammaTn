// scripts/youtube/engine/broll-fetcher.mjs
// Autonomous Free B-Roll Video Fetcher
// Fetches high-quality 1080p royalty-free video clips via Pexels / Pixabay Free APIs
// Includes procedural motion fallbacks so rendering NEVER fails even without API keys.

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { getFfmpegBinaryPath } from './video-composer.mjs';

const BROLL_CACHE_DIR = path.resolve('scripts/youtube/assets/broll_cache');
if (!fs.existsSync(BROLL_CACHE_DIR)) fs.mkdirSync(BROLL_CACHE_DIR, { recursive: true });

// Curated Category Search Keyword Map for Tamil Nadu Civic & Documentary News
const CATEGORY_KEYWORDS = {
  'electricity': ['power lines', 'electrician wire', 'electricity transmission', 'substation night'],
  'water-sanitation': ['water pipe leak', 'rain city street', 'drinking water tap', 'water treatment'],
  'road-infrastructure': ['highway traffic india', 'road construction asphalt', 'bridge traffic aerial', 'city traffic cars'],
  'transport': ['metro train arriving', 'city bus street', 'railway tracks train', 'subway commuter crowd'],
  'public-safety': ['police car lights', 'court gavel law', 'cyber security computer', 'night street emergency'],
  'healthcare': ['hospital corridor doctor', 'ambulance siren', 'medicine clinic', 'pharmacy healthcare'],
  'education': ['school classroom children', 'college students books', 'writing paper examination', 'library study'],
  'agriculture': ['rice paddy field', 'farmer agriculture', 'irrigation canal green', 'harvest crop wheat'],
  'environment': ['river forest nature', 'lake pollution water', 'tree plantation green', 'rain storm clouds'],
  'government-schemes': ['official documents signing', 'indian currency money count', 'office desk stamps', 'queue people waiting'],
  'local-development': ['building construction crane', 'worker helmet architectural', 'urban development city', 'bridge infrastructure'],
  'general': ['tamil nadu city street', 'busy indian street crowd', 'news broadcasting camera', 'newspaper press printing']
};

/**
 * Downloads a video from a URL and saves it locally
 */
async function downloadVideo(url, targetPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed with status ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));
  return targetPath;
}

/**
 * Generates an ultra-smooth procedural B-roll loop using FFmpeg filters
 * Used when API keys are absent or network download fails.
 * Produces cinematic motion textures (newsroom scan, documentary bokeh, night lights).
 */
export function generateProceduralBroll(outputPath, durationSec = 10, aspectRatio = '9:16') {
  const ffmpeg = getFfmpegBinaryPath();
  const isShort = aspectRatio === '9:16';
  const width = isShort ? 1080 : 1920;
  const height = isShort ? 1920 : 1080;

  // Filter creates a rich, moving cinematic ambient background with floating particles & bokeh
  const filter = [
    `testsrc2=d=${durationSec}:s=${width}x${height}:r=30`,
    `boxblur=luma_radius=120:luma_power=3`,
    `hue=h=215:s=1.2`,
    `eq=contrast=1.3:brightness=-0.25`,
    `format=yuv420p`
  ].join(',');

  try {
    execFileSync(ffmpeg, [
      '-y',
      '-f', 'lavfi',
      '-i', filter,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      outputPath
    ], { stdio: 'pipe', timeout: 60000 });
    return outputPath;
  } catch (err) {
    console.warn(`[B-ROLL WARN] Procedural fallback error: ${err.message}`);
    return null;
  }
}

/**
 * Fetches a free royalty-free B-roll video clip matching category and keywords.
 * Checks local cache first, tries Pexels/Pixabay APIs, falls back to procedural motion.
 *
 * @param {Object} options
 * @param {string} options.category - Civic category slug
 * @param {string} [options.query] - Custom search keyword
 * @param {'9:16'|'16:9'} [options.aspectRatio='9:16']
 * @param {number} [options.durationSec=12]
 * @returns {Promise<string>} Path to local mp4 video clip
 */
export async function fetchFreeBrollClip({
  category = 'general',
  query = '',
  aspectRatio = '9:16',
  durationSec = 10
}) {
  const orientation = aspectRatio === '9:16' ? 'portrait' : 'landscape';
  const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS.general;
  const searchTerm = query || keywords[Math.floor(Math.random() * keywords.length)];
  const safeSlug = searchTerm.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const cachedFile = path.join(BROLL_CACHE_DIR, `broll_${safeSlug}_${orientation}.mp4`);

  // Return cached clip if already downloaded
  if (fs.existsSync(cachedFile) && fs.statSync(cachedFile).size > 100000) {
    console.log(`[B-ROLL CACHE ✓] Using cached clip: ${cachedFile}`);
    return cachedFile;
  }

  // 1. Try Pexels Free Video API if PEXELS_API_KEY is available
  const pexelsKey = process.env.PEXELS_API_KEY;
  if (pexelsKey) {
    try {
      console.log(`[B-ROLL] Searching Pexels for "${searchTerm}" (${orientation})...`);
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(searchTerm)}&orientation=${orientation}&per_page=5&size=medium`;
      const res = await fetch(url, {
        headers: { Authorization: pexelsKey }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
          const video = data.videos[0];
          // Find 1080p or best quality file
          const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
          if (videoFile && videoFile.link) {
            console.log(`[B-ROLL] Downloading HD clip from Pexels...`);
            await downloadVideo(videoFile.link, cachedFile);
            console.log(`[B-ROLL SUCCESS ✓] Downloaded: ${cachedFile}`);
            return cachedFile;
          }
        }
      }
    } catch (err) {
      console.warn(`[B-ROLL WARN] Pexels API failed: ${err.message}`);
    }
  }

  // 2. Try Pixabay Free Video API if PIXABAY_API_KEY is available
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (pixabayKey) {
    try {
      console.log(`[B-ROLL] Searching Pixabay for "${searchTerm}"...`);
      const url = `https://pixabay.com/api/videos/?key=${pixabayKey}&q=${encodeURIComponent(searchTerm)}&video_type=film&per_page=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.hits && data.hits.length > 0) {
          const hit = data.hits[0];
          const downloadUrl = hit.videos?.medium?.url || hit.videos?.small?.url;
          if (downloadUrl) {
            console.log(`[B-ROLL] Downloading clip from Pixabay...`);
            await downloadVideo(downloadUrl, cachedFile);
            return cachedFile;
          }
        }
      }
    } catch (err) {
      console.warn(`[B-ROLL WARN] Pixabay API failed: ${err.message}`);
    }
  }

  // 3. Fallback: Generate procedural motion clip via FFmpeg
  console.log(`[B-ROLL FALLBACK] Generating procedural cinematic motion loop for ${safeSlug}...`);
  const proceduralPath = path.join(BROLL_CACHE_DIR, `broll_procedural_${orientation}.mp4`);
  if (!fs.existsSync(proceduralPath) || fs.statSync(proceduralPath).size === 0) {
    generateProceduralBroll(proceduralPath, durationSec, aspectRatio);
  }

  return fs.existsSync(proceduralPath) ? proceduralPath : null;
}
