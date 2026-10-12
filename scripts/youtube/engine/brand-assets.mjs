// scripts/youtube/engine/brand-assets.mjs
// Centralized brand asset manager: embeds official VizhiTN logos into video templates

import fs from 'fs';
import path from 'path';

let cachedLogoDataUri = null;

/**
 * Returns the official VizhiTN logo as a Base64 data URI for zero-latency HTML rendering
 * @returns {string} data:image/png;base64,...
 */
export function getBrandLogoDataUri() {
  if (cachedLogoDataUri) return cachedLogoDataUri;

  const candidatePaths = [
    path.resolve(process.cwd(), 'public', 'logo.png'),
    path.resolve(process.cwd(), 'public', 'android-chrome-192x192.png'),
    path.resolve(process.cwd(), 'public', 'favicon-32x32.png')
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const buffer = fs.readFileSync(p);
        cachedLogoDataUri = `data:image/png;base64,${buffer.toString('base64')}`;
        return cachedLogoDataUri;
      } catch (_) {}
    }
  }

  return '';
}
