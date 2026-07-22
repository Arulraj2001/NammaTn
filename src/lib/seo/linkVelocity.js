// src/lib/seo/linkVelocity.js
// Controls internal PageRank and link distribution.
// FIX 4: REMOVED Math.random() — anchor text now deterministic via hash seed per link position.
// Limits links to max 8, sorted by score. Hub links restricted to geographic neighbors only.

import { DISTRICTS, CATEGORIES, DISTRICT_MAP } from '@/lib/seo-data';

const HIGH_TRAFFIC_CITIES = ['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem'];

// FIX 4: Deterministic anchor variant — stable across all ISR cycles for same city:issue:index
function getHashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getDeterministicAnchor(city, issue, index) {
  if (!issue) return `${DISTRICT_MAP[city]?.name || city} Civic Updates`;
  const cityData = DISTRICT_MAP[city];
  if (!cityData) return issue.replace(/-/g, ' ');
  const issueName = issue.replace(/-/g, ' ');
  const cityName = cityData.name;
  const mod = getHashCode(`${city}:${issue}:${index}`) % 10;
  if (mod < 6) return `${cityName} ${issueName}`;        // 60% — exact match
  if (mod < 9) return `Reported ${issueName} in ${cityName}`; // 30% — partial match
  return `VizhiTN ${cityName} ${issueName}`;             // 10% — branded
}

export function getOutboundLinks(currentCity, currentIssue, trendingPairs = [], boostedPages = {}) {
  const currentCityData = DISTRICT_MAP[currentCity];
  if (!currentCityData) return [];

  const candidates = [];
  const seen = new Set();
  seen.add(`/${currentCity}/${currentIssue}`); // Exclude current page

  // Type A: Other issues in the same city (70% weight)
  CATEGORIES.forEach(cat => {
    const href = `/${currentCity}/${cat.slug}`;
    if (!seen.has(href)) {
      seen.add(href);
      candidates.push({ href, city: currentCity, issue: cat.slug, type: 'same-city', baseWeight: 2.0 });
    }
  });

  // Type B: Same issue in adjacent/nearby cities (20% weight)
  const nearby = currentCityData.nearby || [];
  nearby.forEach(citySlug => {
    if (DISTRICT_MAP[citySlug]) {
      const href = `/${citySlug}/${currentIssue}`;
      if (!seen.has(href)) {
        seen.add(href);
        candidates.push({ href, city: citySlug, issue: currentIssue, type: 'adjacent-city', baseWeight: 1.5 });
      }
    }
  });

  // FIX MED-03: Hub links restricted to nearby high-traffic cities only (geographically relevant)
  // Type C: High-traffic hub pages — only if the city is in the current page's nearby cluster
  nearby
    .filter(slug => HIGH_TRAFFIC_CITIES.includes(slug))
    .forEach(citySlug => {
      const href = `/${citySlug}`;
      if (!seen.has(href)) {
        seen.add(href);
        candidates.push({ href, city: citySlug, issue: '', type: 'general-hub', baseWeight: 1.0 });
      }
    });

  // Score each candidate
  const scored = candidates.map(link => {
    let score = link.baseWeight;
    const isTrending = trendingPairs.some(t => t.city === link.city && t.issue === link.issue);
    if (isTrending) score += 2.0;
    if (HIGH_TRAFFIC_CITIES.includes(link.city)) score += 1.5;
    const key = `${link.city}:${link.issue}`;
    if (boostedPages[key]) score *= (boostedPages[key].linkWeightMultiplier || 1.0);
    return { ...link, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Build result list with deterministic anchor text (no Math.random)
  const result = [];
  const addedUrls = new Set();

  for (const item of scored) {
    if (result.length >= 8) break;
    if (!addedUrls.has(item.href)) {
      addedUrls.add(item.href);
      result.push({
        href: item.href,
        anchorText: getDeterministicAnchor(item.city, item.issue, result.length),
      });
    }
  }

  return result;
}
