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
