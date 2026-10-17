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

const cachedAvatars = {};

/**
 * Returns the host avatar (karthik or kavitha) as a Base64 data URI
 * @param {'karthik' | 'kavitha'} hostName
 * @returns {string} data:image/jpeg;base64,...
 */
export function getHostAvatarDataUri(hostName) {
  const key = (hostName || '').toLowerCase();
  if (cachedAvatars[key]) return cachedAvatars[key];

  const avatarPath = path.resolve(process.cwd(), 'public', 'images', 'avatars', `${key}.jpg`);
  if (fs.existsSync(avatarPath)) {
    try {
      const buffer = fs.readFileSync(avatarPath);
      cachedAvatars[key] = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      return cachedAvatars[key];
    } catch (_) {}
  }

  return '';
}
