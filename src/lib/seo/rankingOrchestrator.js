// src/lib/seo/rankingOrchestrator.js
// ─────────────────────────────────────────────────────────────────────────────
// AUTONOMOUS RANKING CORE
// Global orchestration layer that unifies all SEO sub-systems into a single
// ranking intelligence engine.
//
// Sub-systems consumed:
//   1. rankingFeedback   → page activity score, link weight, sitemap priority
//   2. queryIntentEngine → intent cluster strength, content tone
//   3. authorityEngine   → E-E-A-T boost factor
//   4. trendDetector     → velocity classification
//   5. crawlOptimizer    → composite crawl score + changefreq
//   6. linkOptimizer     → adaptive link weight (read-only, no render here)
//
// RULES:
//   • No Math.random() — fully deterministic within ISR window
//   • No DB calls — accepts pre-fetched inputs
//   • ISR-safe — same inputs → same output every time
//   • Single-page and batch (fleet) modes supported
//   • Decision output drives: page.jsx rendering, sitemap.js, and any
//     future admin dashboard or GSC integration layer
// ─────────────────────────────────────────────────────────────────────────────

import { computeRankingScore }                            from '@/lib/seo/rankingFeedback';
import { resolveQueryIntent }                             from '@/lib/seo/queryIntentEngine';
import { resolveAuthority }                               from '@/lib/seo/authorityEngine';
import { computeCrawlPriority }                           from '@/lib/seo/crawlOptimizer';
import { detectTrends, getPageTrendVelocity }             from '@/lib/seo/trendDetector';
import { buildOptimizedLinks }                            from '@/lib/seo/linkOptimizer';
import { generateContentEntropy }                         from '@/lib/seo/contentEntropy';
import { DISTRICT_MAP, CATEGORY_MAP, DISTRICTS, CATEGORIES } from '@/lib/seo-data';

// ── Tier thresholds ────────────────────────────────────────────────────────────
const TIER = {
  ELITE:    { min: 0.82, label: 'elite'    }, // Top 5 pages — maximum resource injection
  TOP:      { min: 0.65, label: 'top'      }, // Top cluster — boosted links + authority
  MID:      { min: 0.40, label: 'mid'      }, // Standard — normal treatment
  LOW:      { min: 0.20, label: 'low'      }, // Suppressed — reduced link weight
  DORMANT:  { min: 0.00, label: 'dormant'  }, // No content or activity
};

// ── Sub-system weight matrix (must sum to 1.0) ────────────────────────────────
// Controls how much each signal contributes to finalRankingScore.
const SYSTEM_WEIGHTS = {
  ranking:   0.30, // rankingFeedback (report volume + recency + city tier)
  intent:    0.20, // queryIntentEngine (intent strength)
  authority: 0.15, // authorityEngine (E-E-A-T presence)
  trend:     0.20, // trendDetector (velocity)
  crawl:     0.15, // crawlOptimizer (crawl signal quality)
};

// ── Velocity → numeric signal ─────────────────────────────────────────────────
const VELOCITY_SCORE = { spike: 1.0, high: 0.75, medium: 0.50, low: 0.25, none: 0.0 };

// ── Authority boost → numeric signal ─────────────────────────────────────────
// authorityBoostFactor is 1.0 | 1.2 | 1.5 — normalise to 0–1 for blending
function normAuthority(factor) {
  return Math.min((factor - 1.0) / 0.5, 1.0); // 1.0→0, 1.2→0.4, 1.5→1.0
}

// ── Tier resolver ──────────────────────────────────────────────────────────────
function resolveTier(score) {
  if (score >= TIER.ELITE.min)   return TIER.ELITE.label;
  if (score >= TIER.TOP.min)     return TIER.TOP.label;
  if (score >= TIER.MID.min)     return TIER.MID.label;
  if (score >= TIER.LOW.min)     return TIER.LOW.label;
  return TIER.DORMANT.label;
}

// ── Index priority → integer rank class (1 = highest) ────────────────────────
function resolveIndexPriority(tier) {
  return { elite: 1, top: 2, mid: 3, low: 4, dormant: 5 }[tier] ?? 5;
}

// ── Decision rules: what each tier triggers ───────────────────────────────────
const TIER_DECISIONS = {
  elite: {
    maxInternalLinks:  12,
    contentModuleCount: 5,
    sitemapPriority:   1.0,
    changefreq:        'hourly',
    authorityExpand:   true,   // Show full escalation path
    trendingBlock:     true,   // Always inject trending block
    linkWeightBoost:   3.0,
  },
  top: {
    maxInternalLinks:  8,
    contentModuleCount: 4,
    sitemapPriority:   0.9,
    changefreq:        'daily',
    authorityExpand:   true,
    trendingBlock:     true,
    linkWeightBoost:   2.0,
  },
  mid: {
    maxInternalLinks:  6,
    contentModuleCount: 3,
    sitemapPriority:   0.7,
    changefreq:        'weekly',
    authorityExpand:   false,
    trendingBlock:     false,
    linkWeightBoost:   1.2,
  },
  low: {
    maxInternalLinks:  4,
    contentModuleCount: 3,
    sitemapPriority:   0.4,
    changefreq:        'monthly',
    authorityExpand:   false,
    trendingBlock:     false,
    linkWeightBoost:   0.7,
  },
  dormant: {
    maxInternalLinks:  2,
    contentModuleCount: 3,
    sitemapPriority:   0.2,
    changefreq:        'monthly',
    authorityExpand:   false,
    trendingBlock:     false,
    linkWeightBoost:   0.5,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE: orchestratePage
// Accepts pre-fetched data for a single city×issue page.
// Returns the unified RankingDecision object consumed by page.jsx.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} PageInputs
 * @property {string}   citySlug
 * @property {string}   issueSlug
 * @property {number}   reportCount
 * @property {string|null} latestReportDate  – ISO date of most recent report
 * @property {number}   populationMedian     – median report count across all pages
 * @property {string|null} trendVelocity     – from trendDetector
 *
 * @typedef {Object} RankingDecision
 * @property {string}   pageSlug             – "/city/issue/"
 * @property {number}   finalRankingScore    – 0.0 – 1.0 composite
 * @property {string}   tierLevel            – 'elite'|'top'|'mid'|'low'|'dormant'
 * @property {number}   indexPriority        – 1 (highest) – 5 (lowest)
 * @property {number}   crawlPriority        – 0.0 – 1.0
 * @property {number}   linkWeight           – PageRank flow multiplier
 * @property {number}   authorityBoost       – 1.0 | 1.2 | 1.5
 * @property {number}   trendBoost           – 0.0 – 1.0
 * @property {number}   intentStrength       – 0.0 – 1.0
 * @property {object}   decisions            – tier-driven rendering decisions
 * @property {object}   signals              – per-system raw scores (debug/admin)
 * @property {object}   intentData           – full resolveQueryIntent output
 * @property {object}   authorityData        – full resolveAuthority output
 * @property {object}   crawlData            – full computeCrawlPriority output
 * @property {object}   rankingData          – full computeRankingScore output
 */
export function orchestratePage(inputs = {}) {
  const {
    citySlug,
    issueSlug,
    reportCount       = 0,
    latestReportDate  = null,
    populationMedian  = 5,
    trendVelocity     = null,
  } = inputs;

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!DISTRICT_MAP[citySlug] || !CATEGORY_MAP[issueSlug]) {
    return _nullDecision(citySlug, issueSlug);
  }

  // ── 1. Ranking Feedback ───────────────────────────────────────────────────
  const rankingData = computeRankingScore(
    citySlug,
    issueSlug,
    { reportCount, latestReportDate, populationMedian }
  );

  // ── 2. Query Intent ───────────────────────────────────────────────────────
  const intentData = resolveQueryIntent(citySlug, issueSlug, reportCount);

  // ── 3. Authority ──────────────────────────────────────────────────────────
  const authorityData = resolveAuthority(
    citySlug,
    issueSlug,
    rankingData.authorityBoostFactor
  );

  // ── 4. Trend ──────────────────────────────────────────────────────────────
  const velocityScore = VELOCITY_SCORE[trendVelocity] ?? 0;

  // ── 5. Crawl ──────────────────────────────────────────────────────────────
  const crawlData = computeCrawlPriority({
    citySlug,
    issueSlug,
    reportCount,
    internalLinkCount: 6,          // conservative estimate at page level
    latestActivityDate: latestReportDate,
    rankingScore: rankingData.rankingScore,
    trendVelocity,
  });

  // ── 6. Composite final score ──────────────────────────────────────────────
  const authoritySignal = normAuthority(rankingData.authorityBoostFactor);

  const finalRankingScore = parseFloat(Math.min(
    SYSTEM_WEIGHTS.ranking   * rankingData.rankingScore   +
    SYSTEM_WEIGHTS.intent    * intentData.intentStrength  +
    SYSTEM_WEIGHTS.authority * authoritySignal            +
    SYSTEM_WEIGHTS.trend     * velocityScore              +
    SYSTEM_WEIGHTS.crawl     * crawlData.crawlScore,
    1.0
  ).toFixed(4));

  // ── 7. Tier + Decisions ───────────────────────────────────────────────────
  const tierLevel   = resolveTier(finalRankingScore);
  const decisions   = TIER_DECISIONS[tierLevel];

  // ── 8. Assembled output ───────────────────────────────────────────────────
  return {
    pageSlug:          `/${citySlug}/${issueSlug}`,
    finalRankingScore,
    tierLevel,
    indexPriority:     resolveIndexPriority(tierLevel),
    crawlPriority:     crawlData.crawlScore,
    linkWeight:        rankingData.internalLinkWeightAdjust * decisions.linkWeightBoost,
    authorityBoost:    rankingData.authorityBoostFactor,
    trendBoost:        velocityScore,
    intentStrength:    intentData.intentStrength,
    decisions,

    // Full sub-system payloads — consumed by page.jsx, sitemap.js, admin
    signals: {
      rankingRaw:      rankingData.rankingScore,
      intentRaw:       intentData.intentStrength,
      authorityRaw:    authoritySignal,
      trendRaw:        velocityScore,
      crawlRaw:        crawlData.crawlScore,
    },
    intentData,
    authorityData,
    crawlData,
    rankingData,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH: orchestrateFleet
// Scores an entire set of city×issue pages in one call.
// Used by sitemap.js or an admin route to rank ALL pages simultaneously.
//
// @param {object[]} pages   – [{ citySlug, issueSlug, reportCount, latestReportDate }]
// @param {object[]} trends  – from detectTrends() — pass once, shared across all pages
// @param {number}   populationMedian
// @returns {RankingDecision[]} sorted highest score first
// ─────────────────────────────────────────────────────────────────────────────
export function orchestrateFleet(pages = [], trends = [], populationMedian = 5) {
  const trendIndex = {};
  trends.forEach(t => { trendIndex[`${t.city}:${t.issue}`] = t.velocity; });

  const decisions = pages.map(page => {
    const key = `${page.citySlug}:${page.issueSlug}`;
    return orchestratePage({
      ...page,
      populationMedian,
      trendVelocity: trendIndex[key] || null,
    });
  });

  // Sort by finalRankingScore descending
  decisions.sort((a, b) => b.finalRankingScore - a.finalRankingScore);

  return decisions;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC: orchestratePageFull
// Complete async orchestration for a single page.
// Fetches trends internally. Used directly in page.jsx instead of separate
// calls to each sub-system.
//
// @param {string} citySlug
// @param {string} issueSlug
// @param {object} reportData  – { reportCount, latestReportDate }
// @returns {Promise<RankingDecision & { trends, outboundLinks, contentModules }>}
// ─────────────────────────────────────────────────────────────────────────────
export async function orchestratePageFull(citySlug, issueSlug, reportData = {}) {
  const { reportCount = 0, latestReportDate = null } = reportData;

  // Fetch trends once
  const trends       = await detectTrends({ topN: 10, minCount: 2 });
  const trendVelocity = getPageTrendVelocity(trends, citySlug, issueSlug);

  // Run orchestration
  const decision = orchestratePage({
    citySlug,
    issueSlug,
    reportCount,
    latestReportDate,
    populationMedian: 5,
    trendVelocity,
  });

  // Build optimized internal links using ranking signal
  const rankingMap = {
    [`${citySlug}:${issueSlug}`]: decision.rankingData,
  };
  const outboundLinks = buildOptimizedLinks(
    citySlug,
    issueSlug,
    trends,
    rankingMap,
    { maxLinks: decision.decisions.maxInternalLinks }
  );

  // Generate content modules with full context
  const cityData  = DISTRICT_MAP[citySlug];
  const issueData = CATEGORY_MAP[issueSlug];
  const contentModules = cityData && issueData
    ? generateContentEntropy(
        cityData,
        issueData,
        { totalReports: reportCount },
        [],
        {
          intentData:    decision.intentData,
          authorityData: decision.authorityData,
          trendVelocity,
        }
      )
    : [];

  return {
    ...decision,
    trends,
    outboundLinks,
    contentModules,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: buildSitemapFleet
// Generates complete sitemap data for ALL known city×issue combinations.
// Called from sitemap.js once per ISR window.
//
// @returns {Promise<Array<{
//   url, priority, changefreq, tierLevel, finalRankingScore
// }>>}
// ─────────────────────────────────────────────────────────────────────────────
export async function buildSitemapFleet() {
  const trends = await detectTrends({ topN: 20, minCount: 1 });

  // Build all city×issue pairs
  const allPages = DISTRICTS.flatMap(district =>
    CATEGORIES.map(cat => ({
      citySlug:        district.slug,
      issueSlug:       cat.slug,
      reportCount:     0,      // No DB call here — sitemap uses static signals
      latestReportDate: null,
    }))
  );

  const fleet = orchestrateFleet(allPages, trends, 5);

  return fleet.map(d => ({
    url:               `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vizhitn.in'}${d.pageSlug}`,
    priority:          d.crawlData.sitemapPriority,
    changefreq:        d.crawlData.changefreq,
    tierLevel:         d.tierLevel,
    finalRankingScore: d.finalRankingScore,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: null decision for invalid inputs
// ─────────────────────────────────────────────────────────────────────────────
function _nullDecision(citySlug, issueSlug) {
  return {
    pageSlug:          `/${citySlug}/${issueSlug}`,
    finalRankingScore: 0,
    tierLevel:         'dormant',
    indexPriority:     5,
    crawlPriority:     0,
    linkWeight:        0.5,
    authorityBoost:    1.0,
    trendBoost:        0,
    intentStrength:    0,
    decisions:         TIER_DECISIONS.dormant,
    signals:           { rankingRaw: 0, intentRaw: 0, authorityRaw: 0, trendRaw: 0, crawlRaw: 0 },
    intentData:        {},
    authorityData:     {},
    crawlData:         { crawlScore: 0, sitemapPriority: 0.2, changefreq: 'monthly', shouldBoost: false, reason: 'invalid' },
    rankingData:       {},
  };
}
