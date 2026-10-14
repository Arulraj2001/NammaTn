// scripts/lib/cloudflare-image.mjs
/**
 * VizhiTN Autonomous AI Image Generator
 * Powered strictly by Cloudflare Workers AI (FLUX.1 Schnell) using primary account credentials.
 * 
 * Strict Editorial Rule:
 * 1. ONLY uses primary CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.
 *    NEVER uses YOUTUBE_CLOUDFLARE_* (which is strictly isolated for YouTube video automation).
 * 2. Compresses images using sharp to high-performance WebP.
 * 3. Uploads directly to Supabase Storage 'media' bucket.
 * 4. On any generation or upload failure, returns null so caller gracefully falls back
 *    to official on-brand Category Graphic Cards. Zero broken local paths, zero stock photos.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

// STRICT CREDENTIAL SEPARATION: Use primary credentials only
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_IMAGE_MODEL = process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';

/**
 * Validate that primary Cloudflare credentials are configured.
 */
function isCloudflareConfigured() {
  return Boolean(
    CLOUDFLARE_ACCOUNT_ID &&
    CLOUDFLARE_API_TOKEN &&
    CLOUDFLARE_ACCOUNT_ID !== process.env.YOUTUBE_CLOUDFLARE_ACCOUNT_ID
  );
}

/**
 * Create a photojournalistic prompt based on civic post details.
 */
export function createCivicPhotoPrompt(post = {}) {
  const category = (post.category_slug || post.category || '').toLowerCase();
  const district = (post.district_slug || post.district_name || 'Tamil Nadu').replace(/-/g, ' ');
  const title = post.title_en || post.title_ta || post.title || '';
  const t = title.toLowerCase();

  if (category === 'electricity' || t.includes('power') || t.includes('tangedco') || t.includes('substation')) {
    return `Photojournalistic documentary photograph of Tamil Nadu TANGEDCO electrical utility engineers in yellow safety helmets inspecting substation distribution transformers and power lines in ${district}, South India, realistic daytime news photography, 35mm lens, natural sunlight, no text, no logos`;
  }
  if (category === 'transport' || t.includes('metro') || t.includes('bus') || t.includes('railway') || t.includes('train')) {
    return `Editorial news photograph of public transit in ${district}, Tamil Nadu, modern metro rail viaduct or state transport bus on city road with commuters, realistic daylight, authentic South India streetscape, Canon 5D photography, no text, no logos`;
  }
  if (category === 'water-sanitation' || t.includes('water') || t.includes('drain') || t.includes('pipeline')) {
    return `Documentary photograph of municipal drinking water supply infrastructure or Metrowater pipeline engineering works in ${district}, Tamil Nadu, civic utility workers, realistic daytime editorial shot, no text`;
  }
  if (category === 'road-infrastructure' || t.includes('flyover') || t.includes('road') || t.includes('bridge') || t.includes('pothole')) {
    return `Editorial news photograph of road infrastructure construction, flyover bridge or asphalt paving in ${district}, Tamil Nadu, realistic urban civil engineering, crisp daytime lighting, no text`;
  }
  if (category === 'education' || t.includes('school') || t.includes('college')) {
    return `Documentary photograph of a Tamil Nadu government educational institution campus exterior with green trees, clean architecture, realistic daylight editorial photo, no text`;
  }
  if (category === 'tn-politics' || t.includes('secretariat') || t.includes('assembly') || t.includes('minister')) {
    return `Official documentary style photograph of the historic Tamil Nadu Secretariat Fort St. George administrative headquarters in Chennai, grand colonial building facade, clear blue sky, journalistic photo, no text`;
  }
  if (category === 'government-schemes') {
    return `Realistic news photograph of a Tamil Nadu citizen service centre e-Sevai centre exterior in ${district}, citizens at public administration desk, dignified documentary journalism, no text`;
  }
  if (category === 'public-safety' || t.includes('police') || t.includes('traffic') || t.includes('scam')) {
    return `Documentary photograph of Tamil Nadu police station or civic traffic safety control centre with patrol vehicle in ${district}, South India, realistic news photography, daytime, no text`;
  }
  if (category === 'agriculture' || t.includes('farmer') || t.includes('paddy') || t.includes('crop')) {
    return `Documentary photograph of lush green paddy fields and direct agricultural procurement centre in ${district}, Tamil Nadu, authentic South Indian countryside, bright natural sunlight, no text`;
  }
  if (category === 'environment' || t.includes('rain') || t.includes('flood') || t.includes('lake')) {
    return `Documentary photograph of lake rejuvenation or civic monsoon rainwater channel desilting in ${district}, Tamil Nadu, realistic daytime environmental journalism, no text`;
  }

  return `Documentary photograph representing civic infrastructure and community in ${district}, Tamil Nadu, South India, realistic photojournalism, crisp natural light, no text, no watermarks`;
}

/**
 * Create a Discover-optimized editorial 16:9 photojournalism prompt.
 */
export function createEditorialPrompt({ title = '', category = 'general', district = 'Tamil Nadu' } = {}) {
  const cat = (category || '').toLowerCase();
  const dist = String(district || 'Tamil Nadu').replace(/-/g, ' ');
  const t = (title || '').toLowerCase();

  if (cat.includes('transport') || t.includes('metro') || t.includes('rail') || t.includes('bus')) {
    return `Cinematic documentary photojournalism of modern public transit in ${dist}, Tamil Nadu, modern metro rail elevated viaduct or state transport bus on city road, commuters, realistic daylight editorial photography, Canon 5D, 35mm lens, high resolution, no text, no watermark`;
  }
  if (cat.includes('electric') || t.includes('power') || t.includes('eb') || t.includes('tangedco')) {
    return `Photojournalistic documentary photograph of Tamil Nadu TANGEDCO electrical substation engineers and utility transformers in ${dist}, realistic South India news photography, natural sunlight, professional camera, no text, no watermark`;
  }
  if (cat.includes('water') || t.includes('drainage') || t.includes('drinking water')) {
    return `Documentary photograph of municipal drinking water supply infrastructure or Metrowater pipeline project in ${dist}, Tamil Nadu, civic engineering journalism, daytime, no text, no watermark`;
  }
  if (cat.includes('agriculture') || cat.includes('farmer') || t.includes('paddy') || t.includes('crop')) {
    return `Documentary news photograph of lush green paddy fields and direct agricultural procurement centre in Cauvery delta ${dist}, Tamil Nadu, local farmers, authentic South Indian countryside, bright natural sunlight, no text, no watermark`;
  }
  if (cat.includes('economy') || cat.includes('industry') || t.includes('sipcot') || t.includes('investment')) {
    return `Modern high-tech industrial manufacturing park in ${dist}, Tamil Nadu, electronic or electric vehicle assembly plant exterior, clean architectural lines, sunny day editorial photography, no text, no watermark`;
  }
  if (cat.includes('education') || t.includes('school') || t.includes('college')) {
    return `Editorial photograph of a government educational institution campus in ${dist}, Tamil Nadu, green trees, dignified campus exterior, crisp morning daylight, no text, no watermark`;
  }
  if (cat.includes('politics') || cat.includes('governance') || t.includes('assembly') || t.includes('secretariat')) {
    return `Official documentary style photograph of the historic Tamil Nadu Secretariat Fort St. George administrative headquarters in Chennai, prominent Indian tricolor flag fluttering, grand colonial facade, clear blue sky, journalism photography, no text, no watermark`;
  }
  if (cat.includes('scheme') || cat.includes('welfare') || t.includes('urimai') || t.includes('ration')) {
    return `Documentary news photograph of Tamil Nadu citizen facilitation centre e-Sevai centre with citizens receiving government welfare cards, dignified documentary journalism, no text, no watermark`;
  }

  return `Documentary photojournalistic photograph representing urban development, public infrastructure, and community life in ${dist}, Tamil Nadu, South India, realistic daylight photography, professional news photo, no text, no watermark`;
}

/**
 * Generate a raw photo buffer via Cloudflare Workers AI (FLUX.1 Schnell)
 * Strictly uses primary credentials. Never uses YouTube keys.
 */
async function callCloudflareFlux(prompt) {
  if (!isCloudflareConfigured()) {
    console.warn('[CloudflareAI WARN] Primary CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing or identical to YouTube key.');
    return null;
  }

  try {
    console.log(`[CloudflareAI] Generating photo via FLUX for:\n"${prompt.slice(0, 90)}..."`);
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(25000)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[CloudflareAI ✗] Workers AI request failed (Status ${res.status}): ${errText.slice(0, 150)}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data.result && data.result.image) {
        return Buffer.from(data.result.image, 'base64');
      }
    } else {
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }
  } catch (err) {
    console.warn(`[CloudflareAI ✗] Exception during generation: ${err.message}`);
  }

  return null;
}

/**
 * Generate and upload a 16:9 (1200x675) WebP editorial hero image for TN Today / Politics articles.
 * Returns public Supabase Storage CDN URL, or null on failure (so caller uses Category Graphic Card).
 */
export async function generateEditorialHeroImage({ title = '', category = 'general', district = 'Tamil Nadu', slug = '' } = {}) {
  try {
    const prompt = createEditorialPrompt({ title, category, district });
    const rawBuffer = await callCloudflareFlux(prompt);
    if (!rawBuffer) return null;

    // Standard Google Discover 16:9 hero aspect ratio (1200x675)
    const webpBuffer = await sharp(rawBuffer)
      .resize(1200, 675, { fit: 'cover', position: 'center' })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const cleanSlug = (slug || `editorial-${Date.now()}`).slice(0, 50).replace(/[^a-z0-9-]/gi, '-');
    const storageFileName = `editorial/${cleanSlug}-${Date.now().toString().slice(-4)}.webp`;

    const { uploadCardToStorage } = await import('./supabase-storage.mjs');
    const publicUrl = await uploadCardToStorage(webpBuffer, storageFileName, 'image/webp');
    console.log(`[CloudflareAI ✓] Uploaded editorial hero image: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.warn(`[CloudflareAI WARN] Editorial hero generation/upload failed: ${err.message}`);
    // Return null so the system falls back to the clean static category graphic card
    return null;
  }
}

/**
 * Generate and upload a photojournalistic image for high-priority Civic Alerts.
 * Returns public Supabase Storage CDN URL, or null on failure.
 */
export async function generateCivicHeroImage({ title = '', category = 'general', district = 'Tamil Nadu', slug = '' } = {}) {
  try {
    const prompt = createCivicPhotoPrompt({ title_en: title, category_slug: category, district_slug: district });
    const rawBuffer = await callCloudflareFlux(prompt);
    if (!rawBuffer) return null;

    const webpBuffer = await sharp(rawBuffer)
      .resize(1200, 675, { fit: 'cover', position: 'center' })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const cleanSlug = (slug || `civic-${Date.now()}`).slice(0, 50).replace(/[^a-z0-9-]/gi, '-');
    const storageFileName = `civic/${cleanSlug}-${Date.now().toString().slice(-4)}.webp`;

    const { uploadCardToStorage } = await import('./supabase-storage.mjs');
    const publicUrl = await uploadCardToStorage(webpBuffer, storageFileName, 'image/webp');
    console.log(`[CloudflareAI ✓] Uploaded civic alert image: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.warn(`[CloudflareAI WARN] Civic image generation failed: ${err.message}`);
    return null;
  }
}

/**
 * Generate and upload a photorealistic interior room image for Stay/PG listings.
 * Returns public Supabase Storage CDN URL, or null on failure.
 */
export async function generateStayHeroImage({ title = '', location = 'Tamil Nadu', type = 'pg_available', slug = '' } = {}) {
  try {
    const prompt = `Interior architectural photography of a bright, clean modern student paying guest PG accommodation or rental room in South India with a neat single bed, wooden study desk, chair, wardrobe, tiled floor, air conditioner, window with warm morning sunlight, tidy bedroom, 35mm lens, 4k realism, no text, no logos`;
    const rawBuffer = await callCloudflareFlux(prompt);
    if (!rawBuffer) return null;

    const webpBuffer = await sharp(rawBuffer)
      .resize(1000, 700, { fit: 'cover', position: 'center' })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const cleanSlug = (slug || `stay-${Date.now()}`).slice(0, 50).replace(/[^a-z0-9-]/gi, '-');
    const storageFileName = `stay/${cleanSlug}-${Date.now().toString().slice(-4)}.webp`;

    const { uploadCardToStorage } = await import('./supabase-storage.mjs');
    const publicUrl = await uploadCardToStorage(webpBuffer, storageFileName, 'image/webp');
    console.log(`[CloudflareAI ✓] Uploaded stay listing image: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.warn(`[CloudflareAI WARN] Stay image generation failed: ${err.message}`);
    return null;
  }
}

