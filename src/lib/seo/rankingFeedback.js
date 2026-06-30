// src/lib/seo/rankingFeedback.js
// Ranking Feedback Loop System.
// Tracks page performance and outputs ranking scores that drive internal link
// weight, sitemap priority, and anchor text selection.
// All scoring is deterministic within a given ISR window — no Math.random().

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY
  );
}

// ── Scoring weights ────────────────────────────────────────────────────────────
const W_REPORT_COUNT  = 0.35; // Volume of community reports
const W_RECENCY       = 0.25; // How recently the page had activity
const W_CITY_TIER     = 0.20; // Tier 1 cities score higher by default
const W_IMPRESSION    = 0.20; // Simulated impression signal (CTR proxy from report velocity)

const TIER1_CITIES = new Set(['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem']);
const TIER2_CITIES = new Set(['vellore', 'erode', 'tiruppur', 'tirunelveli', 'thoothukudi', 'thanjavur', 'dindigul']);

// High-value issue slugs — pages that historically attract navigational + informational intent
const HIGH_VALUE_ISSUES = new Set(['power-cut', 'water-issue', 'road-problem', 'scam']);

// ── City tier factor (0.0 – 1.0) ─────────────────────────────────────────────
function getCityTierFactor(citySlug) {
  if (TIER1_CITIES.has(citySlug)) return 1.0;
  if (TIER2_CITIES.has(citySlug)) return 0.65;
  return 0.35;
}

// ── Recency factor: decays from 1.0 to 0.0 over 30 days ─────────────────────
function getRecencyFactor(latestReportDate) {
  if (!latestReportDate) return 0.0;
  const msInDay = 86_400_000;
  const age = (Date.now() - new Date(latestReportDate).getTime()) / msInDay;
  if (age <= 0)  return 1.0;
  if (age >= 30) return 0.0;
  return parseFloat((1 - age / 30).toFixed(4));
}

// ── Impression proxy: report count vs. median across all pairs ───────────────
function getImpressionFactor(reportCount, populationMedian = 5) {
  if (reportCount <= 0) return 0.0;
  // Logarithmic normalisation: prevents one huge page dominating
  const ratio = Math.log1p(reportCount) / Math.log1p(Math.max(populationMedian * 3, 1));
  return parseFloat(Math.min(ratio, 1.0).toFixed(4));
}

// ── Core scoring function ─────────────────────────────────────────────────────
/**
 * @param {string}   citySlug
 * @param {string}   issueSlug
 * @param {object}   impressionData  – { reportCount, latestReportDate, populationMedian? }
 * @param {object}   clickData       – { ctrProxy? }  (reserved for future GSC integration)
 * @returns {{
 *   rankingScore:               number,   // 0.0 – 1.0
 *   authorityBoostFactor:       number,   // multiplier fed to authorityEngine
 *   internalLinkWeightAdjust:  number,   // fed to linkOptimizer
 *   sitemapPriority:            number,   // 0.1 – 1.0
 *   crawlFrequency:             string,   // 'always' | 'hourly' | 'daily' | 'weekly'
 *   tier:                       string,   // 'top' | 'mid' | 'low'
 * }}
 */
export function computeRankingScore(citySlug, issueSlug, impressionData = {}, clickData = {}) {
  const {
    reportCount      = 0,
    latestReportDate = null,
    populationMedian = 5,
  } = impressionData;

  const cityTier    = getCityTierFactor(citySlug);
  const recency     = getRecencyFactor(latestReportDate);
  const impression  = getImpressionFactor(reportCount, populationMedian);
  const ctrProxy    = typeof clickData.ctrProxy === 'number'
    ? Math.min(Math.max(clickData.ctrProxy, 0), 1)
    : impression * 0.7; // estimate CTR from impression if absent

  const isHighValue = HIGH_VALUE_ISSUES.has(issueSlug) ? 1.1 : 1.0;

  const rawScore =
    (W_CITY_TIER   * cityTier)   +
    (W_RECENCY     * recency)    +
    (W_IMPRESSION  * impression) +
    (W_REPORT_COUNT * Math.min(reportCount / 20, 1.0));

  const rankingScore = parseFloat(Math.min(rawScore * isHighValue, 1.0).toFixed(4));

  // Authority boost — pages with strong signals get amplified E-E-A-T injection
  const authorityBoostFactor = rankingScore >= 0.7 ? 1.5 : rankingScore >= 0.4 ? 1.2 : 1.0;

  // Internal link weight — high performers attract more PageRank flow
  const internalLinkWeightAdjust =
    rankingScore >= 0.75 ? 2.5 :
    rankingScore >= 0.55 ? 1.8 :
    rankingScore >= 0.35 ? 1.2 : 0.7;

  // Sitemap priority (Google spec: 0.0 – 1.0)
  const sitemapPriority =
    rankingScore >= 0.75 ? 1.0 :
    rankingScore >= 0.55 ? 0.8 :
    rankingScore >= 0.35 ? 0.6 : 0.4;

  // Crawl frequency hint
  const crawlFrequency =
    rankingScore >= 0.75 ? 'hourly'  :
    rankingScore >= 0.45 ? 'daily'   : 'weekly';

  const tier =
    rankingScore >= 0.65 ? 'top' :
    rankingScore >= 0.35 ? 'mid' : 'low';

  return {
    rankingScore,
    authorityBoostFactor,
    internalLinkWeightAdjust,
    sitemapPriority,
    crawlFrequency,
    tier,
  };
}

// ── Batch ranking: fetch live data and score all pages in a district ──────────
/**
 * Fetches real report counts for a given city across all issues and returns
 * a ranked map of { [issueSlug]: RankingResult }.
 */
export async function fetchCityRankingMap(citySlug) {
  try {
    const supabase = getSupabase();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: rows, error } = await supabase
      .from('post')
      .select('category_slug, created_date')
      .eq('district_slug', citySlug)
      .eq('status', 'active')
      .gt('created_date', thirtyDaysAgo.toISOString());

    if (error || !rows || rows.length === 0) return {};

    // Aggregate per category
    const agg = {};
    rows.forEach(r => {
      if (!r.category_slug) return;
      if (!agg[r.category_slug]) {
        agg[r.category_slug] = { count: 0, latest: null };
      }
      agg[r.category_slug].count++;
      if (!agg[r.category_slug].latest || r.created_date > agg[r.category_slug].latest) {
        agg[r.category_slug].latest = r.created_date;
      }
    });

    const allCounts = Object.values(agg).map(v => v.count);
    const median = allCounts.length
      ? allCounts.sort((a, b) => a - b)[Math.floor(allCounts.length / 2)]
      : 5;

    const result = {};
    for (const [issueSlug, { count, latest }] of Object.entries(agg)) {
      result[issueSlug] = computeRankingScore(
        citySlug,
        issueSlug,
        { reportCount: count, latestReportDate: latest, populationMedian: median }
      );
    }

    return result;
  } catch (e) {
    console.warn('[rankingFeedback] fetchCityRankingMap failed:', e.message);
    return {};
  }
}
