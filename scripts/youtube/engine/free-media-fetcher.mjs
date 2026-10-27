// scripts/youtube/engine/free-media-fetcher.mjs
// Unified Free Media & Stock Photo Engine for VizhiTN Videos
// Cascading Architecture:
// 1. Local Cache Check
// 2. Free Pexels Photo API (if PEXELS_API_KEY is present)
// 3. Wikimedia Commons Open Search (100% Free, Zero Key Required)
// 4. Pollinations AI FLUX Generation (100% Free, Zero Key Required)
// 5. Cloudflare Workers AI FLUX (if credentials present)
// 6. Curated High-Definition Category Asset Fallback

import fs from 'fs';
import path from 'path';

const MEDIA_CACHE_DIR = path.resolve('scripts/youtube/assets/media_cache');
if (!fs.existsSync(MEDIA_CACHE_DIR)) {
  fs.mkdirSync(MEDIA_CACHE_DIR, { recursive: true });
}

// Curated Category Search Keyword Map for Tamil Nadu Civic & Documentary News
const CATEGORY_SEARCH_MAP = {
  'electricity': ['power grid transformer', 'electric power substation', 'lineman electrical utility', 'high voltage tower'],
  'water-sanitation': ['water pipeline valve', 'water treatment plant', 'drinking water reservoir', 'city drainage canal'],
  'road-infrastructure': ['highway flyover construction', 'asphalt road work traffic', 'bridge concrete engineering', 'modern city road'],
  'transport': ['metro rail station train', 'public city bus transport', 'railway tracks express', 'traffic intersection road'],
  'public-safety': ['cyber security computer lock', 'police station siren night', 'court law gavel justice', 'forensic evidence investigation'],
  'healthcare': ['government hospital ward', 'doctor clinic stethoscope', 'medical pharmacy health', 'emergency ambulance'],
  'education': ['school classroom students', 'college university campus', 'exam books study desk', 'digital smart classroom'],
  'agriculture': ['tamil nadu paddy field', 'farmer agriculture harvest', 'irrigation canal water', 'rural agriculture crop'],
  'environment': ['river lake water nature', 'tree forest conservation', 'storm rain clouds weather', 'clean solar green energy'],
  'government-schemes': ['official documents seal stamp', 'citizen public office queue', 'welfare scheme card paper', 'bank transaction counter'],
  'local-development': ['urban development skyline', 'construction crane building', 'municipal ward infrastructure', 'community park development'],
  'general': ['tamil nadu chennai landmark', 'busy city street crowd', 'broadcasting news studio', 'newspaper press reporting']
};

/**
 * Downloads a binary media file from a URL to a local destination
 */
async function downloadMedia(url, destPath, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
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
 * Safe Image Source Helper:
 * Converts local image file to base64 data URI to prevent browser CORS / file path issues
 * Ensures safe quoting so it cannot break HTML attribute quotes.
 */
export function toSafeDataUri(filePathOrUrl) {
  if (!filePathOrUrl) return '';
  if (filePathOrUrl.startsWith('data:') || filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    return filePathOrUrl;
  }
  if (fs.existsSync(filePathOrUrl)) {
    try {
      const ext = path.extname(filePathOrUrl).toLowerCase().replace('.', '') || 'png';
      const mime = ext === 'webp' ? 'image/webp' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
      const b64 = fs.readFileSync(filePathOrUrl).toString('base64');
      return `data:${mime};base64,${b64}`;
    } catch (_) {}
  }
  return filePathOrUrl;
}

/**
 * Tier 1: Search Pexels Free Stock Photo API
 */
async function fetchFromPexels({ query, orientation = 'landscape', targetPath }) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=5&size=large`;
    console.log(`[PEXELS API] Searching stock photo for: "${query}" (${orientation})...`);
    const res = await fetch(url, {
      headers: { Authorization: apiKey }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0];
      const downloadUrl = photo.src?.large2x || photo.src?.large || photo.src?.original;
      if (downloadUrl) {
        await downloadMedia(downloadUrl, targetPath);
        console.log(`[PEXELS SUCCESS ✓] Stock photo cached: ${targetPath}`);
        return targetPath;
      }
    }
  } catch (err) {
    console.warn(`[PEXELS WARN] Search failed: ${err.message}`);
  }
  return null;
}

/**
 * Tier 2: Search Pixabay Free Stock Photo API
 */
async function fetchFromPixabay({ query, orientation = 'horizontal', targetPath }) {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return null;

  try {
    const pixabayOrientation = orientation === 'portrait' ? 'vertical' : 'horizontal';
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=${pixabayOrientation}&per_page=5&safesearch=true`;
    console.log(`[PIXABAY API] Searching stock photo for: "${query}" (${pixabayOrientation})...`);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      const hit = data.hits[0];
      const downloadUrl = hit.largeImageURL || hit.webformatURL;
      if (downloadUrl) {
        await downloadMedia(downloadUrl, targetPath);
        console.log(`[PIXABAY SUCCESS ✓] Stock photo cached: ${targetPath}`);
        return targetPath;
      }
    }
  } catch (err) {
    console.warn(`[PIXABAY WARN] Search failed: ${err.message}`);
  }
  return null;
}

/**
 * Tier 2: Search Wikimedia Commons Media Search (100% Free, Zero Key Required)
 */
async function fetchFromWikimedia({ query, targetPath }) {
  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=imageinfo&iiprop=url|mime|size&format=json&origin=*`;
    console.log(`[WIKIMEDIA API] Searching open public domain image for: "${query}"...`);
    const res = await fetch(wikiUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (pages) {
      for (const pageId of Object.keys(pages)) {
        const info = pages[pageId]?.imageinfo?.[0];
        if (info && info.url && (info.mime === 'image/jpeg' || info.mime === 'image/png' || info.mime === 'image/webp')) {
          if (info.size > 20000) {
            await downloadMedia(info.url, targetPath);
            console.log(`[WIKIMEDIA SUCCESS ✓] Open image cached: ${targetPath}`);
            return targetPath;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[WIKIMEDIA WARN] Wikimedia fetch failed: ${err.message}`);
  }
  return null;
}


/**
 * Tier 4: Generate via Cloudflare Workers AI FLUX (if credentials exist)
 */
async function fetchFromCloudflare({ prompt, width, height, targetPath }) {
  const creds = [
    { id: process.env.YOUTUBE_CLOUDFLARE_ACCOUNT_ID, token: process.env.YOUTUBE_CLOUDFLARE_API_TOKEN },
    { id: process.env.CLOUDFLARE_ACCOUNT_ID, token: process.env.CLOUDFLARE_API_TOKEN }
  ].filter(c => c.id && c.token);

  if (creds.length === 0) return null;

  for (const cred of creds) {
    try {
      console.log(`[CLOUDFLARE FLUX] Calling Workers AI FLUX...`);
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cred.id}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cred.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `${prompt}, realistic documentary photo, 8k, journalistic proof, no text`,
          num_steps: 4
        })
      });

      if (!res.ok) continue;
      const data = await res.json();
      const b64 = data.result?.image;
      if (b64) {
        fs.writeFileSync(targetPath, Buffer.from(b64, 'base64'));
        console.log(`[CLOUDFLARE SUCCESS ✓] FLUX scene generated: ${targetPath}`);
        return targetPath;
      }
    } catch (err) {
      console.warn(`[CLOUDFLARE WARN] ${err.message}`);
    }
  }
  return null;
}

/**
 * Main Public Resolver: Fetches or generates authentic editorial visuals
 *
 * @param {Object} options
 * @param {string} [options.query] - Search keyword or topic
 * @param {string} [options.category='general'] - Category slug
 * @param {'16:9' | '9:16'} [options.aspectRatio='16:9']
 * @param {string} [options.prompt] - Optional custom AI prompt
 * @param {string} [options.actTag='evidence'] - Tag for filename indexing
 * @returns {Promise<string>} Local file path to the resolved image
 */
export async function fetchEditorialVisual({
  query = '',
  category = 'general',
  aspectRatio = '16:9',
  prompt = '',
  actTag = 'scene'
}) {
  const isLandscape = aspectRatio === '16:9';
  const width = isLandscape ? 1280 : 768;
  const height = isLandscape ? 720 : 1360;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Determine optimal search query
  const defaultKeywords = CATEGORY_SEARCH_MAP[category] || CATEGORY_SEARCH_MAP.general;
  const chosenQuery = query || defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
  const safeSlug = chosenQuery.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);

  const cachedFile = path.join(MEDIA_CACHE_DIR, `media_${category}_${safeSlug}_${actTag}_${orientation}.jpg`);
  if (fs.existsSync(cachedFile) && fs.statSync(cachedFile).size > 15000) {
    console.log(`[MEDIA CACHE ✓] Reusing cached visual: ${cachedFile}`);
    return cachedFile;
  }

  // Tier 1: Try Pexels Free Stock Photo API
  const pexelsRes = await fetchFromPexels({
    query: chosenQuery,
    orientation,
    targetPath: cachedFile
  });
  if (pexelsRes) return pexelsRes;

  // Tier 2: Try Pixabay Free Stock Photo API
  const pixabayRes = await fetchFromPixabay({
    query: chosenQuery,
    orientation,
    targetPath: cachedFile
  });
  if (pixabayRes) return pixabayRes;

  // Tier 3: Try Wikimedia Commons Open API (Tamil Nadu Civic / Government buildings)
  const wikiQuery = chosenQuery.includes('Tamil Nadu') ? chosenQuery : `${chosenQuery} Tamil Nadu India`;
  const wikiRes = await fetchFromWikimedia({
    query: wikiQuery,
    targetPath: cachedFile
  });
  if (wikiRes) return wikiRes;

  // Tier 3: Try Cloudflare Workers AI FLUX (if credentials configured)
  const aiPrompt = prompt || `Authentic ground reality documentary photograph of ${chosenQuery} in Tamil Nadu India, journalistic realism, high-detail`;
  const cfRes = await fetchFromCloudflare({
    prompt: aiPrompt,
    width,
    height,
    targetPath: cachedFile
  });
  if (cfRes) return cfRes;


  // Tier 5: Fallback to Curated Local Category Graphic Card
  const categoryCard = path.resolve(`public/images/categories/${category}.webp`);
  if (fs.existsSync(categoryCard)) {
    console.log(`[MEDIA FALLBACK] Using curated category asset: ${categoryCard}`);
    return categoryCard;
  }

  const generalCard = path.resolve('public/images/categories/general.webp');
  return fs.existsSync(generalCard) ? generalCard : cachedFile;
}
