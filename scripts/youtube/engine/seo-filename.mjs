// scripts/youtube/engine/seo-filename.mjs
// Autonomous SEO Video File Naming Engine for VizhiTN
// Ensures all uploaded MP4 files carry keyword-rich, searchable file names
// that YouTube's backend algorithm indexes as high-ranking metadata anchors.

/**
 * Normalizes text to an SEO-friendly URL/filename slug
 * @param {string} text
 * @returns {string}
 */
export function slugifyForSeo(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 75);
}

/**
 * Generates an SEO-optimized video filename
 * @param {Object} params
 * @param {string} [params.title]
 * @param {string} [params.district]
 * @param {string} [params.area]
 * @param {string} [params.category]
 * @param {'short'|'live-short'|'rights-short'|'feature'|'podcast'} [params.format='short']
 * @param {string} [params.dateStr]
 * @returns {string} e.g. "tangedco-power-cut-tambaram-chennai-19-oct-2026.mp4"
 */
export function generateSeoVideoFilename({
  title = '',
  district = '',
  area = '',
  category = '',
  format = 'short',
  dateStr = ''
}) {
  const parts = [];

  // Prefix by category/subject keyword
  const categoryKeywords = {
    'electricity': 'tangedco-power-cut-eb-shutdown',
    'water-sanitation': 'metrowater-drinking-water-crisis',
    'road-infrastructure': 'road-repair-potholes-infrastructure',
    'transport': 'cmrl-metro-bus-train-transport',
    'public-safety': 'cyber-crime-police-safety-alert',
    'healthcare': 'tamil-nadu-government-hospital-health',
    'education': 'schools-colleges-holiday-exam-update',
    'agriculture': 'tamil-nadu-farmers-agri-procurement',
    'government-schemes': 'tamil-nadu-govt-welfare-scheme',
    'local-development': 'tamil-nadu-ward-civic-development',
    'general': 'tamil-nadu-civic-breaking-news'
  };

  if (category && categoryKeywords[category]) {
    parts.push(categoryKeywords[category]);
  }

  // Add area / district
  if (area && area !== district) {
    const cleanArea = slugifyForSeo(area);
    if (cleanArea) parts.push(cleanArea);
  }
  if (district) {
    const cleanDist = slugifyForSeo(district);
    if (cleanDist) parts.push(cleanDist);
  }

  // Add sanitized title keywords
  const cleanTitle = slugifyForSeo(title);
  if (cleanTitle) {
    parts.push(cleanTitle);
  }

  // Add date if present
  if (dateStr) {
    const cleanDate = slugifyForSeo(dateStr);
    if (cleanDate) parts.push(cleanDate);
  }

  // Fallback if parts empty
  let base = parts.filter(Boolean).join('-');
  base = base.replace(/-+/g, '-').slice(0, 90).replace(/-$/, '');

  if (!base) {
    base = `vizhitn-${format}-${Date.now()}`;
  }

  return `${base}.mp4`;
}
