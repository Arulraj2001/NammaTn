// scripts/youtube/engine/cloudflare-visuals.mjs
// Generates photorealistic 9:16 and 16:9 editorial imagery via Cloudflare FLUX
// Supports dedicated YouTube Cloudflare credentials with fallback to primary account

import fs from 'fs';
import path from 'path';

const CLOUDFLARE_MODEL = process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';

/**
 * Generates an editorial scene visual via Cloudflare Workers AI FLUX
 * @param {string} prompt - Detailed scene description
 * @param {string} outputFilePath - Destination image path
 * @param {'9:16'|'16:9'} [aspectRatio='9:16']
 * @returns {Promise<string>} output file path
 */
export async function generateYouTubeSceneVisual(prompt, outputFilePath, aspectRatio = '9:16') {
  const accountId = process.env.YOUTUBE_CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.YOUTUBE_CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

  const outDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (!accountId || !apiToken) {
    console.log('[VISUALS] No Cloudflare API keys configured. Using local fallback editorial visual.');
    return null;
  }

  // Dimension tailoring for FLUX
  const width = aspectRatio === '9:16' ? 576 : 1024;
  const height = aspectRatio === '9:16' ? 1024 : 576;

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_MODEL}`;

  try {
    console.log(`[CLOUDFLARE FLUX] Generating ${aspectRatio} scene image...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `${prompt}, realistic photo, Tamil Nadu India setting, authentic documentary journalism style, hyper-detailed, 8k, cinematic natural lighting, no text, no watermark`
      })
    });

    if (!response.ok) {
      console.warn(`[CLOUDFLARE WARN] Image generation returned ${response.status}. Using fallback.`);
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let imageBuffer;

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data.result && data.result.image) {
        imageBuffer = Buffer.from(data.result.image, 'base64');
      } else {
        return null;
      }
    } else {
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    fs.writeFileSync(outputFilePath, imageBuffer);
    console.log(`[CLOUDFLARE SUCCESS] Visual saved: ${outputFilePath}`);
    return outputFilePath;
  } catch (err) {
    console.warn(`[CLOUDFLARE ERROR] ${err.message}. Using fallback visual.`);
    return null;
  }
}

/**
 * Converts a local image path or remote URL to a safe browser-renderable image source.
 * If local, converts to base64 Data URI to prevent headless browser CORS/file origin blocking.
 * @param {string} imgOrUrl
 * @returns {string}
 */
export function toImageSource(imgOrUrl) {
  if (!imgOrUrl) return '';
  if (imgOrUrl.startsWith('data:') || imgOrUrl.startsWith('http://') || imgOrUrl.startsWith('https://')) {
    return imgOrUrl;
  }
  if (fs.existsSync(imgOrUrl)) {
    try {
      const ext = path.extname(imgOrUrl).toLowerCase().replace('.', '') || 'png';
      const mime = ext === 'webp' ? 'image/webp' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
      const b64 = fs.readFileSync(imgOrUrl).toString('base64');
      return `data:${mime};base64,${b64}`;
    } catch {}
  }
  return imgOrUrl;
}

