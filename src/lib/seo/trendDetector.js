// src/lib/seo/trendDetector.js
// Trend Detection System — detects spikes in city × issue report activity.
// Extends trendEngine.js with richer signal data: velocity, acceleration, rank.
// Provides homepage injection list and trending content block generator.

import { createClient } from '@supabase/supabase-js';
import { DISTRICT_MAP, CATEGORY_MAP } from '@/lib/seo-data';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY
  );
}

// ── Static fallback (used on DB error) ────────────────────────────────────────
const FALLBACK_TRENDS = [
  { city: 'chennai',         issue: 'power-cut',   count: 18, velocity: 'high',   rank: 1 },
  { city: 'coimbatore',      issue: 'water-issue', count: 11, velocity: 'medium', rank: 2 },
  { city: 'madurai',         issue: 'road-problem',count: 8,  velocity: 'medium', rank: 3 },
  { city: 'salem',           issue: 'scam',        count: 6,  velocity: 'low',    rank: 4 },
  { city: 'tiruchirappalli', issue: 'jobs',        count: 4,  velocity: 'low',    rank: 5 },
];

// ── Velocity classifier ────────────────────────────────────────────────────────
// Compares recent 7d vs previous 7d to detect acceleration
function classifyVelocity(recentCount, previousCount) {
  if (recentCount === 0)                           return 'none';
  if (previousCount === 0)                         return recentCount >= 3 ? 'spike' : 'low';
  const ratio = recentCount / previousCount;
  if (ratio >= 2.5)                                return 'spike';
  if (ratio >= 1.5)                                return 'high';
  if (ratio >= 1.0)                                return 'medium';
  return 'low';
}

// ── Main detector ──────────────────────────────────────────────────────────────
/**
 * Fetches 30 days of active posts, computes per city×issue report velocity,
 * and returns a ranked trend list.
 *
 * @param {object} options
 * @param {number} options.topN      – max trends to return (default 10)
 * @param {number} options.minCount  – minimum reports in last 7d to qualify (default 2)
 * @returns {Promise<Array<{
 *   city:      string,
 *   issue:     string,
 *   cityName:  string,
 *   issueName: string,
 *   count:     number,
 *   velocity:  'spike'|'high'|'medium'|'low'|'none',
 *   rank:      number,
 *   href:      string,
 *   trendLabel:string,
 * }>>}
 */
export async function detectTrends({ topN = 10, minCount = 2 } = {}) {
  try {
    const supabase = getSupabase();

    const now            = new Date();
    const sevenDaysAgo   = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(now.getDate() - 14);

    // Fetch 14 days of posts to compare recent vs previous 7d windows
    const { data: posts, error } = await supabase
      .from('post')
      .select('district_slug, category_slug, created_date')
      .eq('status', 'active')
      .gt('created_date', fourteenDaysAgo.toISOString())
      .not('district_slug', 'is', null)
      .not('category_slug', 'is', null);

    if (error || !posts || posts.length === 0) {
      return FALLBACK_TRENDS;
    }

    // Aggregate: recent 7d and previous 7d
    const recent   = {};
    const previous = {};

    const sevenDaysAgoTs = sevenDaysAgo.getTime();

    posts.forEach(p => {
      const key  = `${p.district_slug}:${p.category_slug}`;
      const ts   = new Date(p.created_date).getTime();
      if (ts >= sevenDaysAgoTs) {
        recent[key] = (recent[key] || 0) + 1;
      } else {
        previous[key] = (previous[key] || 0) + 1;
      }
    });

    // Only consider pairs with recent activity above threshold
    const qualified = Object.entries(recent)
      .filter(([, count]) => count >= minCount)
      .map(([key, count]) => {
        const [city, issue] = key.split(':');
        const velocity      = classifyVelocity(count, previous[key] || 0);
        const cityData      = DISTRICT_MAP[city];
        const issueData     = CATEGORY_MAP[issue];

        if (!cityData || !issueData) return null;

        return { city, issue, cityName: cityData.name, issueName: issueData.name, count, velocity };
      })
      .filter(Boolean);

    // Sort by velocity tier first, then count
    const VELOCITY_ORDER = { spike: 4, high: 3, medium: 2, low: 1, none: 0 };
    qualified.sort((a, b) => {
      const vDiff = (VELOCITY_ORDER[b.velocity] || 0) - (VELOCITY_ORDER[a.velocity] || 0);
      return vDiff !== 0 ? vDiff : b.count - a.count;
    });

    return qualified.slice(0, topN).map((item, idx) => ({
      ...item,
      rank:       idx + 1,
      href:       `/${item.city}/${item.issue}`,
      trendLabel: buildTrendLabel(item.velocity, item.count, item.issueName, item.cityName),
    }));

  } catch (e) {
    console.warn('[trendDetector] Failed:', e.message);
    return FALLBACK_TRENDS;
  }
}

// ── Trend label for UI rendering ──────────────────────────────────────────────
function buildTrendLabel(velocity, count, issueName, cityName) {
  if (velocity === 'spike')  return `⚡ Spike: ${count} new ${issueName} reports in ${cityName} this week`;
  if (velocity === 'high')   return `↑ Rising: ${issueName} activity up in ${cityName}`;
  if (velocity === 'medium') return `${count} recent ${issueName} reports in ${cityName}`;
  return `${issueName} reports active in ${cityName}`;
}

// ── Trending content block (for homepage / city page injection) ───────────────
/**
 * Returns a formatted block for rendering in the "Recent Activity" section.
 * @param {object[]} trends – from detectTrends()
 * @param {number}   limit  – max items (default 5)
 */
export function buildTrendingBlock(trends, limit = 5) {
  const top = trends.slice(0, limit);
  if (top.length === 0) return null;

  return {
    title:   'Trending Civic Issues in Tamil Nadu',
    items:   top.map(t => ({
      label:    t.trendLabel,
      href:     t.href,
      city:     t.cityName,
      issue:    t.issueName,
      velocity: t.velocity,
    })),
    updatedAt: new Date().toISOString().slice(0, 16) + ':00Z', // Stable per minute
  };
}

// ── Page-level trend status check (for /[city]/[issue]/ page) ────────────────
/**
 * Returns true if the given city+issue is in the trends list.
 * Replaces the inline `trendingPairs.some(...)` check in page.jsx.
 */
export function isPageTrending(trends, citySlug, issueSlug) {
  return trends.some(t => t.city === citySlug && t.issue === issueSlug);
}

/**
 * Returns the velocity label for the current page if it is trending.
 * @returns {'spike'|'high'|'medium'|'low'|'none'|null}
 */
export function getPageTrendVelocity(trends, citySlug, issueSlug) {
  const match = trends.find(t => t.city === citySlug && t.issue === issueSlug);
  return match ? match.velocity : null;
}
