/**
 * incidentPhotoMatcher.js
 * 
 * Stock image & external newsroom feed scraping has been permanently disabled.
 * All civic and editorial content relies strictly on:
 * 1. AI images generated via Cloudflare Workers AI FLUX (primary key)
 * 2. Authentic on-brand Category Graphic Cards / Bulletin Badges as resilient fallbacks
 * 
 * No third-party stock photos or scraped RSS images are attached.
 */

export async function matchIncidentPhoto({ title = "", category = "general" } = {}) {
  // Permanently disabled: return null so graphic card fallbacks or Cloudflare FLUX are used
  return null;
}

export async function attachIncidentPhotosToPosts(posts) {
  // Pass-through without modifying posts with external stock photos
  if (!Array.isArray(posts)) return posts;
  return posts;
}

export async function attachIncidentPhotoToArticle(article) {
  // Pass-through without modifying article with external stock photos
  return article;
}

