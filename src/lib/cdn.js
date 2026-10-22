/**
 * Transforms Supabase direct storage URLs into Cloudflare edge-cached local proxy URLs.
 * Bypasses direct Supabase egress by leveraging Cloudflare's unlimited free edge cache.
 *
 * Example:
 * https://hzgrzcablefquddisqkf.supabase.co/storage/v1/object/public/media/photo.webp
 * -> /media/photo.webp
 *
 * @param {string|null|undefined} url
 * @returns {string}
 */
export function toCdnMediaUrl(url) {
  if (!url || typeof url !== 'string') return url || '';
  const trimmed = url.trim();

  // Match Supabase storage media paths
  const supabaseMediaPattern = /^https?:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/(?:public\/)?media\/(.+)$/i;
  const match = trimmed.match(supabaseMediaPattern);

  if (match && match[1]) {
    return `/media/${match[1]}`;
  }

  return trimmed;
}
