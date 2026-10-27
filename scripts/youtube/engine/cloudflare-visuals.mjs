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

/**
 * Generates an ultra-clean procedural cinematic dark-ambient backdrop
 * (Guarantees 100% clean background with ZERO text)
 */
export function generateProceduralBackdrop(outputFilePath, width = 1080, height = 1920) {
  try {
    const { getFfmpegBinaryPath } = require('./video-composer.mjs');
    const ffmpeg = getFfmpegBinaryPath();
    const filter = `testsrc2=d=1:s=${width}x${height}:r=1,boxblur=luma_radius=180:luma_power=3,hue=h=215:s=1.2,eq=contrast=1.3:brightness=-0.35,format=yuv420p`;
    const { execFileSync } = require('child_process');
    execFileSync(ffmpeg, ['-y', '-f', 'lavfi', '-i', filter, '-vframes', '1', outputFilePath], { stdio: 'pipe' });
    if (fs.existsSync(outputFilePath) && fs.statSync(outputFilePath).size > 1000) {
      console.log(`[PROCEDURAL BACKDROP] Generated clean atmospheric scene backdrop: ${outputFilePath}`);
      return outputFilePath;
    }
  } catch (err) {
    console.warn(`[PROCEDURAL WARN] Failed to generate procedural backdrop: ${err.message}`);
  }
  return null;
}

/**
 * Generates an editorial scene visual via Cloudflare Workers AI FLUX
 * with automatic fallback to secondary Cloudflare keys and Pollinations AI FLUX.
 *
 * @param {string} prompt - Detailed scene description
 * @param {string} outputFilePath - Destination image path
 * @param {'9:16'|'16:9'} [aspectRatio='9:16']
 * @returns {Promise<string>} output file path
 */
export async function generateYouTubeSceneVisual(prompt, outputFilePath, aspectRatio = '9:16') {
  const outDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Higher resolution → less FFmpeg upscale → sharper final frames
  // 768×1360 for 9:16 (1.4x upscale to 1080×1920 vs old 2x from 576×1024)
  // 1280×720 for 16:9 (native 720p, no upscale needed)
  const width  = aspectRatio === '9:16' ? 768 : 1280;
  const height = aspectRatio === '9:16' ? 1360 : 720;

  // Credential candidate pairs in order of preference
  const credentialPairs = [
    {
      id: process.env.YOUTUBE_CLOUDFLARE_ACCOUNT_ID,
      token: process.env.YOUTUBE_CLOUDFLARE_API_TOKEN,
      name: 'YouTube Dedicated'
    },
    {
      id: process.env.CLOUDFLARE_ACCOUNT_ID,
      token: process.env.CLOUDFLARE_API_TOKEN,
      name: 'Primary Cloudflare'
    }
  ].filter(c => c.id && c.token);

  for (const cred of credentialPairs) {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cred.id}/ai/run/${CLOUDFLARE_MODEL}`;
    try {
      console.log(`[CLOUDFLARE FLUX] Generating ${aspectRatio} image via ${cred.name}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cred.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `${prompt}, realistic photo, Tamil Nadu India setting, authentic documentary journalism style, hyper-detailed, 8k, cinematic natural lighting, no text, no watermark`
        })
      });

      if (!response.ok) {
        console.warn(`[CLOUDFLARE WARN] ${cred.name} returned HTTP ${response.status}. Trying next tier...`);
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      let imageBuffer;

      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.result && data.result.image) {
          imageBuffer = Buffer.from(data.result.image, 'base64');
        } else {
          continue;
        }
      } else {
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }

      fs.writeFileSync(outputFilePath, imageBuffer);
      console.log(`[CLOUDFLARE SUCCESS] Visual saved (${cred.name}): ${outputFilePath}`);
      return outputFilePath;
    } catch (err) {
      console.warn(`[CLOUDFLARE ERROR] ${cred.name} failed: ${err.message}`);
    }
  }


  // Tier 3 Fallback: Procedural clean cinematic backdrop (Guaranteed ZERO cut-off text)
  return generateProceduralBackdrop(outputFilePath, width, height);
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

