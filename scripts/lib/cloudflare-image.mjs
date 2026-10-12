// scripts/lib/cloudflare-image.mjs
/**
 * VizhiTN Autonomous AI Image Generator
 * Powered by Cloudflare Workers AI (FLUX.1 Schnell) with 3-tier resilient fallback and sharp compression.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_IMAGE_MODEL = process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';

/**
 * Create a photojournalistic prompt based on post details.
 */
export function createCivicPhotoPrompt(post = {}) {
  const category = (post.category_slug || '').toLowerCase();
  const district = (post.district_slug || 'Tamil Nadu').replace(/-/g, ' ');
  const title = post.title_en || post.title_ta || '';

  if (category === 'electricity' || title.toLowerCase().includes('power') || title.toLowerCase().includes('tangedco')) {
    return `Photojournalistic documentary photograph of Tamil Nadu TANGEDCO electrical substation technicians in yellow safety helmets inspecting utility transformers and cables in ${district}, South India, realistic daytime news photography, 35mm lens`;
  }
  if (category === 'transport' || title.toLowerCase().includes('metro') || title.toLowerCase().includes('bus')) {
    return `Documentary photograph of public transportation in ${district}, Tamil Nadu, modern metro rail station or government state transport bus on city road with commuters, realistic natural daylight, editorial news photo`;
  }
  if (category === 'water-sanitation' || title.toLowerCase().includes('water') || title.toLowerCase().includes('drain')) {
    return `Documentary photograph of municipal drinking water supply pipeline maintenance or metro water infrastructure in ${district}, Tamil Nadu, realistic civic journalism shot`;
  }
  if (category === 'road-infrastructure' || title.toLowerCase().includes('flyover') || title.toLowerCase().includes('road')) {
    return `Editorial news photograph of road infrastructure construction and asphalt paving machinery in ${district}, Tamil Nadu, realistic urban civil engineering, daytime`;
  }
  if (category === 'education' || title.toLowerCase().includes('school') || title.toLowerCase().includes('college')) {
    return `Documentary photograph of a Tamil Nadu government school or college campus exterior with green trees, clean architecture, realistic daylight editorial photo`;
  }
  if (category === 'tn-politics' || title.toLowerCase().includes('secretariat') || title.toLowerCase().includes('assembly')) {
    return `Official documentary style photograph of the Tamil Nadu Secretariat Fort St. George government administrative headquarters building in Chennai, prominent Indian flag, grand colonial architecture, sunny day news photo`;
  }
  if (category === 'government-schemes') {
    return `Realistic news photograph of Tamil Nadu citizen service center e-Sevai centre with computer screens and citizens receiving government welfare cards, dignified documentary`;
  }
  if (category === 'public-safety') {
    return `Documentary photograph of Tamil Nadu police station exterior or civic traffic safety control center with patrol vehicle in ${district}, realistic news photography`;
  }

  return `Documentary photograph representing civic infrastructure and community in ${district}, Tamil Nadu, South India, realistic photojournalism, crisp natural light`;
}

/**
 * Generate a photojournalist-style image matching the story.
 * Includes automatic 3-tier fallback and sharp compression.
 *
 * @param {string} prompt - Image generation prompt
 * @param {object} options - Options { width, height, outputFilename }
 * @returns {Promise<{ buffer: Buffer, filePath: string, sizeKb: number }>}
 */
export async function generateStoryPhoto(prompt, options = {}) {
  const {
    outputFilename = `story-${Date.now()}.jpg`,
    quality = 82
  } = options;

  console.log(`[CloudflareAI] Generating photo for prompt:\n"${prompt.slice(0, 100)}..."`);

  let rawBuffer = null;

  // Tier 1: Cloudflare Workers AI (Primary)
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.result && data.result.image) {
          rawBuffer = Buffer.from(data.result.image, 'base64');
          console.log('[CloudflareAI] Successfully generated photo via Cloudflare FLUX!');
        }
      } else {
        const arrayBuf = await res.arrayBuffer();
        rawBuffer = Buffer.from(arrayBuf);
        console.log('[CloudflareAI] Successfully generated binary photo via Cloudflare FLUX!');
      }
    } else {
      const errText = await res.text();
      console.warn('[CloudflareAI] Tier 1 Cloudflare failed:', res.status, errText);
    }
  } catch (err) {
    console.warn('[CloudflareAI] Tier 1 Cloudflare exception:', err.message);
  }

  // Tier 2: Open Flux Fallback (If Tier 1 fails)
  if (!rawBuffer) {
    try {
      console.log('[CloudflareAI] Attempting Tier 2 Fallback (Open Flux gateway)...');
      const openUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&nologo=true`;
      const fallbackRes = await fetch(openUrl);
      if (fallbackRes.ok) {
        const arrayBuf = await fallbackRes.arrayBuffer();
        rawBuffer = Buffer.from(arrayBuf);
        console.log('[CloudflareAI] Tier 2 Fallback succeeded!');
      }
    } catch (fErr) {
      console.warn('[CloudflareAI] Tier 2 Fallback failed:', fErr.message);
    }
  }

  // Tier 3: Local High-Res Fallback (Zero crash guarantee)
  if (!rawBuffer) {
    console.log('[CloudflareAI] Using Tier 3 Local asset fallback.');
    const defaultAsset = path.resolve('public/images/test-cf-flux.jpg');
    if (fs.existsSync(defaultAsset)) {
      rawBuffer = fs.readFileSync(defaultAsset);
    } else {
      throw new Error('All image generation tiers failed');
    }
  }

  // Compress through sharp (reduces size by ~85% to protect Supabase free tier)
  const compressedBuffer = await sharp(rawBuffer)
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  const outDir = path.resolve('public/images/posts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, outputFilename);
  fs.writeFileSync(outPath, compressedBuffer);

  const sizeKb = Number((compressedBuffer.length / 1024).toFixed(1));
  console.log(`[CloudflareAI] Compressed photo saved to: ${outPath} (${sizeKb} KB)`);

  return {
    buffer: compressedBuffer,
    filePath: outPath,
    fileName: outputFilename,
    sizeKb
  };
}

/**
 * Create a Discover-optimized editorial 16:9 photojournalism prompt.
 */
export function createEditorialPrompt({ title = '', category = 'general', district = 'Tamil Nadu' } = {}) {
  const cat = (category || '').toLowerCase();
  const dist = String(district || 'Tamil Nadu').replace(/-/g, ' ');
  const t = (title || '').toLowerCase();

  if (cat.includes('transport') || t.includes('metro') || t.includes('rail') || t.includes('bus')) {
    return `Cinematic documentary photojournalism of modern public transit in ${dist}, Tamil Nadu, modern metro rail elevated viaduct or state transport bus on city road, commuters, realistic daylight editorial photography, Canon 5D, 35mm lens, high resolution`;
  }
  if (cat.includes('electric') || t.includes('power') || t.includes('eb') || t.includes('tangedco')) {
    return `Photojournalistic documentary photograph of Tamil Nadu TANGEDCO electrical substation engineers and utility transformers in ${dist}, realistic South India news photography, natural sunlight, professional camera`;
  }
  if (cat.includes('water') || t.includes('drainage') || t.includes('drinking water')) {
    return `Documentary photograph of municipal drinking water supply infrastructure or Metrowater pipeline project in ${dist}, Tamil Nadu, civic engineering journalism`;
  }
  if (cat.includes('agriculture') || cat.includes('farmer') || t.includes('paddy') || t.includes('crop')) {
    return `Documentary news photograph of lush green paddy fields and direct agricultural procurement centre in Cauvery delta ${dist}, Tamil Nadu, local farmers, authentic South Indian countryside, bright natural sunlight`;
  }
  if (cat.includes('economy') || cat.includes('industry') || t.includes('sipcot') || t.includes('investment')) {
    return `Modern high-tech industrial manufacturing park in ${dist}, Tamil Nadu, electronic or electric vehicle assembly plant exterior, clean architectural lines, sunny day editorial photography`;
  }
  if (cat.includes('education') || t.includes('school') || t.includes('college')) {
    return `Editorial photograph of a government educational institution campus in ${dist}, Tamil Nadu, green trees, dignified campus exterior, crisp morning daylight`;
  }
  if (cat.includes('politics') || cat.includes('governance') || t.includes('assembly') || t.includes('secretariat')) {
    return `Official documentary style photograph of the historic Tamil Nadu Secretariat Fort St. George administrative headquarters in Chennai, Indian tricolor flag fluttering, grand colonial facade, clear blue sky, journalism photography`;
  }
  if (cat.includes('scheme') || cat.includes('welfare') || t.includes('urimai') || t.includes('ration')) {
    return `Documentary news photograph of Tamil Nadu citizen facilitation centre e-Sevai centre with citizens receiving government welfare cards, dignified documentary journalism`;
  }

  return `Documentary photojournalistic photograph representing urban development, public infrastructure, and community life in ${dist}, Tamil Nadu, South India, realistic daylight photography, professional news photo`;
}

/**
 * Generate and upload a 16:9 (1200x675) WebP editorial hero image for articles.
 * Returns public URL of the uploaded image, or null on failure.
 */
export async function generateEditorialHeroImage({ title = '', category = 'general', district = 'Tamil Nadu', slug = '' } = {}) {
  try {
    const prompt = createEditorialPrompt({ title, category, district });
    const outputFilename = `editorial-${slug ? slug.slice(0, 35) : Date.now()}.jpg`;

    const photo = await generateStoryPhoto(prompt, { outputFilename, quality: 84 });
    if (!photo?.buffer) return null;

    // Standard Google Discover 16:9 hero aspect ratio (1200x675)
    const webpBuffer = await sharp(photo.buffer)
      .resize(1200, 675, { fit: 'cover', position: 'center' })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const cleanSlug = (slug || `editorial-${Date.now()}`).slice(0, 50).replace(/[^a-z0-9-]/gi, '-');
    const storageFileName = `editorial/${cleanSlug}-${Date.now().toString().slice(-4)}.webp`;

    try {
      const { uploadCardToStorage } = await import('./supabase-storage.mjs');
      const publicUrl = await uploadCardToStorage(webpBuffer, storageFileName, 'image/webp');
      return publicUrl;
    } catch (uploadErr) {
      console.warn('[CloudflareAI] Storage upload warning:', uploadErr.message);
      const localOutDir = path.resolve('public/images/tntoday');
      if (!fs.existsSync(localOutDir)) fs.mkdirSync(localOutDir, { recursive: true });
      const localPath = path.join(localOutDir, `${cleanSlug}.webp`);
      fs.writeFileSync(localPath, webpBuffer);
      return `/images/tntoday/${cleanSlug}.webp`;
    }
  } catch (err) {
    console.warn('[CloudflareAI] Editorial hero image generation skipped:', err.message);
    return null;
  }
}

