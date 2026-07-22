// src/lib/seo/linkOptimizer.js
// Adaptive Internal Link Booster.
// Extends linkVelocity.js by injecting ranking signals into link scoring.
// High-CTR / high-impression pages receive increased PageRank flow.
// Low-performing pages have link weight reduced.
// No Math.random(), ISR-safe.

import { DISTRICTS, CATEGORIES, DISTRICT_MAP } from '@/lib/seo-data';

const HIGH_TRAFFIC_CITIES = new Set(['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem']);

// ── Deterministic hash helper ─────────────────────────────────────────────────
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

// ── Anchor text variants (60/30/10 ratio, deterministic per position) ─────────
function buildAnchorText(citySlug, issueSlug, position, cityData) {
  if (!issueSlug) return `${cityData?.name || citySlug} Civic Updates`;
  const issueName = issueSlug.replace(/-/g, ' ');
  const cityName  = cityData?.name || citySlug;
  const mod = hashCode(`${citySlug}:${issueSlug}:${position}`) % 10;
  if (mod < 6) return `${cityName} ${issueName}`;           // 60% exact match
  if (mod < 9) return `Reported ${issueName} in ${cityName}`; // 30% partial
  return `VizhiTN ${cityName} ${issueName}`;                  // 10% branded
}

// ── Core link optimizer ────────────────────────────────────────────────────────
/**
 * Builds a ranked list of internal links with adaptive weights from ranking
 * signals. Replaces static getOutboundLinks when ranking data is available.
 *
 * @param {string}   currentCity
 * @param {string}   currentIssue
 * @param {object[]} trendingPairs   – from trendEngine.getTrendingPairs()
 * @param {object}   rankingMap      – { [citySlug:issueSlug]: RankingScore }
 *                                     from rankingFeedback.fetchCityRankingMap()
 *                                     or computeRankingScore() per-page result
 * @param {object}   options
 * @param {number}   options.maxLinks – default 8
 * @returns {{ href: string, anchorText: string, weight: number }[]}
 */
export function buildOptimizedLinks(
  currentCity,
  currentIssue,
  trendingPairs  = [],
  rankingMap     = {},
  { maxLinks = 8 } = {}
) {
  const currentCityData = DISTRICT_MAP[currentCity];
  if (!currentCityData) return [];

  const seen       = new Set([`/${currentCity}/${currentIssue}`]);
  const candidates = [];

  // ── Type A: Same city, other issues (70% budget) ──────────────────────────
  CATEGORIES.forEach(cat => {
    if (cat.slug === currentIssue) return;
    const href = `/${currentCity}/${cat.slug}`;
    if (seen.has(href)) return;
    seen.add(href);

    const rankKey = `${currentCity}:${cat.slug}`;
    const ranking = rankingMap[rankKey];
    const base    = 2.0;
    const boost   = ranking ? ranking.internalLinkWeightAdjust : 1.0;

    candidates.push({ href, city: currentCity, issue: cat.slug, type: 'A', weight: base * boost });
  });

  // ── Type B: Nearby cities, same issue (20% budget) ────────────────────────
  const nearby = currentCityData.nearby || [];
  nearby.forEach(citySlug => {
    if (!DISTRICT_MAP[citySlug]) return;
    const href = `/${citySlug}/${currentIssue}`;
    if (seen.has(href)) return;
    seen.add(href);

    const rankKey = `${citySlug}:${currentIssue}`;
    const ranking = rankingMap[rankKey];
    const base    = 1.5;
    const boost   = ranking ? ranking.internalLinkWeightAdjust : 1.0;

    candidates.push({ href, city: citySlug, issue: currentIssue, type: 'B', weight: base * boost });
  });

  // ── Type C: Nearby hub pages (10% budget) ─────────────────────────────────
  nearby
    .filter(slug => HIGH_TRAFFIC_CITIES.has(slug))
    .forEach(citySlug => {
      const href = `/${citySlug}`;
      if (seen.has(href)) return;
      seen.add(href);
      candidates.push({ href, city: citySlug, issue: '', type: 'C', weight: 1.0 });
    });

  // ── Apply trending boost ──────────────────────────────────────────────────
  const trendSet = new Set(trendingPairs.map(t => `${t.city}:${t.issue}`));
  const trendBoost = 2.0;

  const scored = candidates.map(c => {
    let w = c.weight;
    if (trendSet.has(`${c.city}:${c.issue}`)) w += trendBoost;
    if (HIGH_TRAFFIC_CITIES.has(c.city))       w += 1.5;

    // Penalise low-performers: if rankingMap says low tier, halve the link weight
    const rankKey = `${c.city}:${c.issue}`;
    if (rankingMap[rankKey]?.tier === 'low')  w *= 0.5;

    return { ...c, weight: w };
  });

  scored.sort((a, b) => b.weight - a.weight);

  const result = [];
  for (const item of scored) {
    if (result.length >= maxLinks) break;
    result.push({
      href:       item.href,
      anchorText: buildAnchorText(item.city, item.issue, result.length, DISTRICT_MAP[item.city]),
      weight:     parseFloat(item.weight.toFixed(3)),
    });
  }

  return result;
}

// ── Sitemap priority table (called by sitemap.js) ────────────────────────────
/**
 * Given a flat rankingMap for all city×issue combinations, returns a priority
 * lookup that sitemap.js can use to set <priority> and <changefreq>.
 *
 * @param {object} rankingMap  – { [city:issue]: { sitemapPriority, crawlFrequency } }
 * @returns {(city: string, issue: string) => { priority: number, changefreq: string }}
 */
export function buildSitemapPriorityResolver(rankingMap) {
  return function resolvePriority(city, issue) {
    const key     = `${city}:${issue}`;
    const ranking = rankingMap[key];
    if (!ranking) {
      return { priority: 0.5, changefreq: 'weekly' };
    }
    return {
      priority:   ranking.sitemapPriority,
      changefreq: ranking.crawlFrequency,
    };
  };
}
