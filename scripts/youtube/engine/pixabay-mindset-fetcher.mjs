// scripts/youtube/engine/pixabay-mindset-fetcher.mjs
/**
 * Pixabay Atmospheric Visuals Engine for Student Discipline & Mindset Videos
 * Fetches high-contrast, moody study & discipline B-roll photos and video clips
 * using PIXABAY_API_KEY with local disk caching and procedural fallback.
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('scripts/youtube/assets/broll_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Downloads binary file from URL to disk
 */
async function downloadFile(url, destPath, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 5000) throw new Error('File payload too small');
    fs.writeFileSync(destPath, buffer);
    return destPath;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Searches Pixabay for portrait/vertical study & discipline photos
 * Returns array of local file paths
 */
export async function fetchPixabayMindsetImages(queries = ['study desk books', 'focused student library'], count = 2) {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  const downloadedFiles = [];

  for (const query of queries.slice(0, count)) {
    const safeSlug = query.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const cachedFile = path.join(CACHE_DIR, `pixabay_${safeSlug}.jpg`);

    if (fs.existsSync(cachedFile) && fs.statSync(cachedFile).size > 10000) {
      console.log(`[PIXABAY CACHE ✓] Using cached image: ${path.basename(cachedFile)}`);
      downloadedFiles.push(cachedFile);
      continue;
    }

    if (pixabayKey) {
      try {
        console.log(`[PIXABAY] Searching images for "${query}"...`);
        const url = `https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&orientation=vertical&image_type=photo&per_page=6`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.hits && data.hits.length > 0) {
            // Pick the best or random top hit
            const hit = data.hits[Math.floor(Math.random() * Math.min(3, data.hits.length))];
            const imageUrl = hit.largeImageURL || hit.webformatURL;
            if (imageUrl) {
              await downloadFile(imageUrl, cachedFile);
              console.log(`[PIXABAY SUCCESS ✓] Downloaded: ${path.basename(cachedFile)}`);
              downloadedFiles.push(cachedFile);
              continue;
            }
          }
        }
      } catch (err) {
        console.warn(`[PIXABAY WARN] Failed to fetch "${query}": ${err.message}`);
      }
    }
  }

  return downloadedFiles;
}

/**
 * Converts local image file to base64 data URI to safely embed into HTML templates
 */
export function imageToDataUri(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const ext = path.extname(filePath).toLowerCase().replace('.', '') || 'jpg';
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    const b64 = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${b64}`;
  } catch {
    return null;
  }
}
