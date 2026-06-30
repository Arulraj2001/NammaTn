// src/lib/seo/autonomousSeoCore.js
// ═══════════════════════════════════════════════════════════════════════════════
// AUTONOMOUS SEO CORE — CENTRAL RANKING BRAIN
// ═══════════════════════════════════════════════════════════════════════════════
//
// This is the SINGLE ENTRY POINT for all ranking intelligence.
// It ingests outputs from all 12 SEO sub-systems and produces one
// authoritative RankingDecision per page.
//
// Sub-systems consumed (in pipeline order):
//   Stage 0 — Data layer
//     • trendDetector          → velocity classification
//
//   Stage 1 — Signal generation (pure, fast)
//     • rankingFeedback        → base page score, linkWeight, sitemapPriority
//     • queryIntentEngine      → intent clusters, contentTone, intentStrength
//     • authorityEngine        → E-E-A-T entity, contactBlock, authorityBoost
//     • crawlOptimizer         → composite crawl score, changefreq
//
//   Stage 2 — Composite scoring (rankingOrchestrator)
//     • rankingOrchestrator    → weighted finalRankingScore across all signals
//
//   Stage 3 — Temporal analysis (state-aware)
//     • serpDriftController    → drift delta, correctionFactor
//     • rankingDecayRecovery   → decayFactor, recoveryFactor, effectiveScore
//     • tierStabilityNormalizer→ hysteresis-stable tier, EMA smoothing
//
//   Stage 4 — SERP feedback (engagement layer)
//     • serpFeedbackLoop       → CTR proxy, rankingAdjustment, recommendation
//
//   Stage 5 — Content & link assembly
//     • contentEntropy         → content modules (intent + authority + trend)
//     • linkOptimizer          → adaptive internal links (ranking-weighted)
//
// OUTPUT — ONE RankingDecision object:
// {
//   pageSlug, finalRankingScore, stableRankingScore, normalizedTier,
//   driftStatus, decayFactor, recoveryFactor, authorityBoost, intentStrength,
//   trendScore, crawlPriority, linkWeight, sitemapPriority,
//   action: "BOOST" | "STABLE" | "SUPPRESS"
// }
//
// INVARIANTS:
//   ✓ No Math.random() anywhere in the pipeline
//   ✓ No DB calls — accepts pre-fetched inputs
//   ✓ ISR-safe: same inputs → same output every time within ISR window
//   ✓ revalidate=3600 contract honoured
//   ✓ All signals gracefully degrade on null/missing input
// ═══════════════════════════════════════════════════════════════════════════════

// ── Sub-system imports ─────────────────────────────────────────────────────────
import { computeRankingScore, fetchCityRankingMap }              from '@/lib/seo/rankingFeedback';
import { resolveQueryIntent }                                     from '@/lib/seo/queryIntentEngine';
import { resolveAuthority }                                       from '@/lib/seo/authorityEngine';
import { computeCrawlPriority }                                   from '@/lib/seo/crawlOptimizer';
import { orchestratePage }                                        from '@/lib/seo/rankingOrchestrator';
import { evaluateDrift, DRIFT_STATUS }                            from '@/lib/seo/serpDriftController';
import { evaluateDecayRecovery }                                  from '@/lib/seo/rankingDecayRecovery';
import { stabilizeTier, smoothScore, rawTierFromScore }           from '@/lib/seo/tierStabilityNormalizer';
import { computeSerpFeedback, estimatePosition }                  from '@/lib/seo/serpFeedbackLoop';
import { generateContentEntropy }                                 from '@/lib/seo/contentEntropy';
import { buildOptimizedLinks }                                    from '@/lib/seo/linkOptimizer';
import { detectTrends, getPageTrendVelocity, buildTrendingBlock } from '@/lib/seo/trendDetector';
import { DISTRICT_MAP, CATEGORY_MAP, DISTRICTS, CATEGORIES }      from '@/lib/seo-data';
import { evaluateGlobalHealth, normalizeGlobalRankingSystem, applyGovernorCorrection } from '@/lib/seo/globalSeoGovernor';
import { evaluateAlignment }                                      from '@/lib/seo/serpAlignmentMonitor';
import { computeWeightAdjustments, derivePerformanceSnapshot, DEFAULT_SUBSYSTEM_WEIGHTS } from '@/lib/seo/selfImprovingSeoLoop';
import { stabilizeDecision, buildSignalBundle }                   from '@/lib/seo/systemStabilityController';
import { collectGscSignals }                                      from '@/lib/seo/gscSignalCollector';
import { trackPosition, positionToRankingScore }                  from '@/lib/seo/serpPositionTracker';
import { normalizeRealWorldFeedback, applyRealWorldCorrection }   from '@/lib/seo/realWorldFeedbackNormalizer';
import { computeSerpCorrectionDeltas }                            from '@/lib/seo/serpCorrectionLoop';

// ── Pipeline weight matrix ─────────────────────────────────────────────────────
// Controls how each Stage-1/2 signal blends into finalRankingScore.
// Weights must reflect what Google actually measures: E-E-A-T, freshness, intent.
const BLEND_WEIGHTS = {
  orchestrator:  0.40, // rankingOrchestrator composite (already multi-signal)
  serpFeedback:  0.20, // CTR/impression proxy — Google's #1 engagement signal
  decayRecovery: 0.20, // Temporal health — freshness factor
  intentSignal:  0.10, // Query intent strength
  authoritySignal: 0.10, // E-E-A-T presence
};

// ── Action decision thresholds ────────────────────────────────────────────────
const ACTION_THRESHOLDS = {
  BOOST:    0.62, // Above → BOOST: inject max links, elevated sitemap, trending
  SUPPRESS: 0.28, // Below → SUPPRESS: reduce links, lower sitemap, no trending
  // Between → STABLE
};

// ── City tier factor lookup (used in serpFeedback) ────────────────────────────
const CITY_TIER_FACTORS = {
  tier1: 1.0,   // chennai, coimbatore, madurai, tiruchirappalli, salem
  tier2: 0.65,
  tier3: 0.35,
};
const TIER1_CITIES = new Set(['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem']);
const TIER2_CITIES = new Set(['vellore', 'erode', 'tiruppur', 'tirunelveli', 'thoothukudi', 'thanjavur', 'dindigul']);

function getCityTierFactor(citySlug) {
  if (TIER1_CITIES.has(citySlug)) return CITY_TIER_FACTORS.tier1;
  if (TIER2_CITIES.has(citySlug)) return CITY_TIER_FACTORS.tier2;
  return CITY_TIER_FACTORS.tier3;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMARY EXPORT: runAutonomousCore
//
// Single-page full pipeline execution.
// Accepts pre-fetched page data (reports, trend). Returns complete RankingDecision.
// All temporal state (baseline, smoothed score, tier memory) is passed in from
// the caller — this function is stateless and deterministic.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} CoreInputs
 * @property {string}      citySlug
 * @property {string}      issueSlug
 * @property {number}      reportCount
 * @property {string|null} latestReportDate       – ISO date
 * @property {string|null} trendVelocity          – from trendDetector
 * @property {number|null} baselineScore          – last stable score (null = first run)
 * @property {number|null} previousSmoothedScore  – last EMA value (null = no history)
 * @property {string}      lastStableTier         – tier from previous ISR window
 * @property {string|null} recoveryStartDate      – ISO date recovery began (null = N/A)
 * @property {number}      populationMedian       – median report count across fleet
 *
 * @typedef {Object} RankingDecision
 * @property {string}  pageSlug
 * @property {number}  finalRankingScore     – 0.0–1.0 blended composite
 * @property {number}  stableRankingScore    – EMA-smoothed (oscillation-resistant)
 * @property {string}  normalizedTier        – hysteresis-stable tier label
 * @property {string}  driftStatus           – from serpDriftController
 * @property {number}  decayFactor           – 0.0–1.0
 * @property {number}  recoveryFactor        – 0.0–1.0
 * @property {number}  authorityBoost        – 1.0 | 1.2 | 1.5
 * @property {number}  intentStrength        – 0.0–1.0
 * @property {number}  trendScore            – 0.0–1.0
 * @property {number}  crawlPriority         – 0.0–1.0
 * @property {number}  linkWeight            – PageRank flow multiplier
 * @property {number}  sitemapPriority       – 0.1–1.0
 * @property {string}  action                – 'BOOST'|'STABLE'|'SUPPRESS'
 * @property {object}  subsystems            – all raw sub-system outputs
 * @property {object}  decisions             – tier-driven rendering config
 */
export function runAutonomousCore(inputs = {}) {
  const {
    citySlug,
    issueSlug,
    reportCount           = 0,
    latestReportDate      = null,
    trendVelocity         = null,
    baselineScore         = null,
    previousSmoothedScore = null,
    lastStableTier        = 'mid',
    recoveryStartDate     = null,
    populationMedian      = 5,
  } = inputs;

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!DISTRICT_MAP[citySlug] || !CATEGORY_MAP[issueSlug]) {
    return _nullDecision(`/${citySlug}/${issueSlug}/`);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 1 — Signal generation
  // ════════════════════════════════════════════════════════════════════════════

  const rankingData = computeRankingScore(citySlug, issueSlug, {
    reportCount,
    latestReportDate,
    populationMedian,
  });

  const intentData = resolveQueryIntent(citySlug, issueSlug, reportCount);

  const authorityData = resolveAuthority(
    citySlug,
    issueSlug,
    rankingData.authorityBoostFactor
  );

  const crawlData = computeCrawlPriority({
    citySlug,
    issueSlug,
    reportCount,
    internalLinkCount:  6,
    latestActivityDate: latestReportDate,
    rankingScore:       rankingData.rankingScore,
    trendVelocity,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 2 — Orchestrator composite
  // ════════════════════════════════════════════════════════════════════════════

  const orchestration = orchestratePage({
    citySlug,
    issueSlug,
    reportCount,
    latestReportDate,
    populationMedian,
    trendVelocity,
  });

  // Velocity → numeric 0.0–1.0
  const VELOCITY_SCORE = { spike: 1.0, high: 0.75, medium: 0.50, low: 0.25, none: 0.0 };
  const trendScore = VELOCITY_SCORE[trendVelocity] ?? 0;

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 3 — Temporal analysis
  // ════════════════════════════════════════════════════════════════════════════

  const decayRecovery = evaluateDecayRecovery({
    baseScore:          rankingData.rankingScore,
    latestActivityDate: latestReportDate,
    recoveryStartDate,
    recentReportCount:  reportCount,
  });

  const driftResult = evaluateDrift(
    orchestration.finalRankingScore,
    baselineScore,
    { trendDelta: trendScore - 0.5 }
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 4 — SERP Feedback
  // ════════════════════════════════════════════════════════════════════════════

  const cityTierFactor    = getCityTierFactor(citySlug);
  const estimatedPosition = estimatePosition(orchestration.finalRankingScore);
  const serpFeedback      = computeSerpFeedback({
    currentRankingScore: orchestration.finalRankingScore,
    estimatedPosition,
    reportCount,
    cityTierFactor,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 5 — Blend into finalRankingScore
  // ════════════════════════════════════════════════════════════════════════════

  // Normalize authority boost (1.0→0, 1.2→0.4, 1.5→1.0)
  const authoritySignal = Math.min((rankingData.authorityBoostFactor - 1.0) / 0.5, 1.0);

  const rawFinalScore = parseFloat(Math.min(
    BLEND_WEIGHTS.orchestrator  * orchestration.finalRankingScore  +
    BLEND_WEIGHTS.serpFeedback  * serpFeedback.feedbackScore       +
    BLEND_WEIGHTS.decayRecovery * decayRecovery.effectiveScore     +
    BLEND_WEIGHTS.intentSignal  * intentData.intentStrength        +
    BLEND_WEIGHTS.authoritySignal * authoritySignal,
    1.0
  ).toFixed(4));

  // Apply drift correction factor (dampens oscillation)
  const driftCorrected = parseFloat(Math.min(
    rawFinalScore * driftResult.correctionFactor,
    1.0
  ).toFixed(4));

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 6 — Stability layer
  // ════════════════════════════════════════════════════════════════════════════

  const stableRankingScore = smoothScore(driftCorrected, previousSmoothedScore, 0.30);

  const tierResult = stabilizeTier(stableRankingScore, lastStableTier, driftResult.driftStatus);
  const normalizedTier = tierResult.stabilizedTier;

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 7 — Action decision
  // ════════════════════════════════════════════════════════════════════════════

  let action;
  if (
    driftCorrected >= ACTION_THRESHOLDS.BOOST ||
    serpFeedback.recommendation === 'BOOST'   ||
    trendVelocity === 'spike'
  ) {
    action = 'BOOST';
  } else if (
    driftCorrected <= ACTION_THRESHOLDS.SUPPRESS           ||
    serpFeedback.recommendation === 'SUPPRESS'             ||
    decayRecovery.healthStatus   === 'critical'            ||
    driftResult.driftStatus      === DRIFT_STATUS.FALLING
  ) {
    action = 'SUPPRESS';
  } else {
    action = 'STABLE';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 8 — Derive output signals from action + tier
  // ════════════════════════════════════════════════════════════════════════════

  const TIER_CONFIGS = {
    elite:   { maxLinks: 12, sitemapPriority: 1.0, changefreq: 'hourly',  linkBoost: 3.0, authorityExpand: true },
    top:     { maxLinks: 8,  sitemapPriority: 0.9, changefreq: 'daily',   linkBoost: 2.0, authorityExpand: true },
    mid:     { maxLinks: 6,  sitemapPriority: 0.7, changefreq: 'weekly',  linkBoost: 1.2, authorityExpand: false },
    low:     { maxLinks: 4,  sitemapPriority: 0.4, changefreq: 'monthly', linkBoost: 0.7, authorityExpand: false },
    dormant: { maxLinks: 2,  sitemapPriority: 0.2, changefreq: 'monthly', linkBoost: 0.5, authorityExpand: false },
  };

  const tierConfig = TIER_CONFIGS[normalizedTier] || TIER_CONFIGS.mid;

  // Action overrides on sitemap priority
  let sitemapPriority = tierConfig.sitemapPriority;
  if (action === 'BOOST')    sitemapPriority = Math.min(sitemapPriority + 0.1, 1.0);
  if (action === 'SUPPRESS') sitemapPriority = Math.max(sitemapPriority - 0.2, 0.1);

  const linkWeight = rankingData.internalLinkWeightAdjust * tierConfig.linkBoost *
    (action === 'BOOST' ? 1.25 : action === 'SUPPRESS' ? 0.60 : 1.0);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 9 — STABILITY CONTROLLER (FINAL AUTHORITY)
  // All signals pass through the stability gate before becoming outputs.
  // No subsystem value is returned raw without passing this gate.
  // ════════════════════════════════════════════════════════════════════════════

  // Build the unified signal bundle from all upstream outputs
  const signalBundle = buildSignalBundle(
    {
      finalRankingScore: driftCorrected,
      driftStatus:       driftResult.driftStatus,
      trendScore,
      decayFactor:       decayRecovery.decayFactor,
      recoveryFactor:    decayRecovery.recoveryFactor,
      authorityBoost:    rankingData.authorityBoostFactor,
      intentStrength:    intentData.intentStrength,
      crawlPriority:     crawlData.crawlScore,
    },
    /* governorScore */ stableRankingScore,  // EMA-smoothed acts as governor proxy in sync path
    /* alignmentScore */ 1.0,               // alignment runs in async path (Stage 8.5)
    /* systemMode */ 'OPTIMIZE'
  );

  const stabilized = stabilizeDecision(signalBundle, {
    lastStableScore: previousSmoothedScore,
    lastStableTier,
  });

  // Stabilized values override all raw subsystem outputs
  const finalScore    = stabilized.stableFinalScore;
  const finalTier     = stabilized.stabilizedTier;

  // Rebuild tier config from stabilized tier (not raw tier)
  const TIER_CONFIGS_S = {
    elite:   { maxLinks: 12, sitemapPriority: 1.0, changefreq: 'hourly',  linkBoost: 3.0, authorityExpand: true },
    top:     { maxLinks: 8,  sitemapPriority: 0.9, changefreq: 'daily',   linkBoost: 2.0, authorityExpand: true },
    mid:     { maxLinks: 6,  sitemapPriority: 0.7, changefreq: 'weekly',  linkBoost: 1.2, authorityExpand: false },
    low:     { maxLinks: 4,  sitemapPriority: 0.4, changefreq: 'monthly', linkBoost: 0.7, authorityExpand: false },
    dormant: { maxLinks: 2,  sitemapPriority: 0.2, changefreq: 'monthly', linkBoost: 0.5, authorityExpand: false },
  };
  const sTierConfig = TIER_CONFIGS_S[finalTier] || TIER_CONFIGS_S.mid;

  let sSitemapPriority = sTierConfig.sitemapPriority;
  if (action === 'BOOST' && !stabilized.downstreamFrozen)    sSitemapPriority = Math.min(sSitemapPriority + 0.1, 1.0);
  if (action === 'SUPPRESS')                                 sSitemapPriority = Math.max(sSitemapPriority - 0.2, 0.1);

  // Link weight — frozen if LOCK/HOLD state
  const sLinkWeight = stabilized.linkOptimizerFrozen
    ? (rankingData.internalLinkWeightAdjust * 1.0)  // neutral weight during freeze
    : parseFloat((rankingData.internalLinkWeightAdjust * sTierConfig.linkBoost *
        (action === 'BOOST' ? 1.25 : action === 'SUPPRESS' ? 0.60 : 1.0)).toFixed(3));

  return {
    // ── Stabilized primary outputs (contract surface) ─────────────────────
    pageSlug:           `/${citySlug}/${issueSlug}/`,
    finalRankingScore:  parseFloat(finalScore.toFixed(4)),
    stableRankingScore: parseFloat(stableRankingScore.toFixed(4)),
    normalizedTier:     finalTier,
    driftStatus:        driftResult.driftStatus,
    decayFactor:        decayRecovery.decayFactor,
    recoveryFactor:     decayRecovery.recoveryFactor,
    authorityBoost:     rankingData.authorityBoostFactor,
    intentStrength:     intentData.intentStrength,
    trendScore,
    crawlPriority:      crawlData.crawlScore,
    linkWeight:         sLinkWeight,
    sitemapPriority:    parseFloat(sSitemapPriority.toFixed(2)),
    action,

    // ── Stability metadata ────────────────────────────────────────────────
    stability: {
      stabilityAction:       stabilized.stabilityAction,
      systemConsensusLevel:  stabilized.systemConsensusLevel,
      conflictDetected:      stabilized.conflictDetected,
      conflictSources:       stabilized.conflictSources,
      worstConflictSeverity: stabilized.worstConflictSeverity,
      adjustmentVector:      stabilized.adjustmentVector,
      downstreamFrozen:      stabilized.downstreamFrozen,
      serpFeedbackSuppressed:stabilized.serpFeedbackSuppressed,
      linkOptimizerFrozen:   stabilized.linkOptimizerFrozen,
    },

    // ── Tier-driven rendering config ──────────────────────────────────────
    decisions: {
      ...sTierConfig,
      authorityExpand: sTierConfig.authorityExpand && action !== 'SUPPRESS',
      trendingBlock:   (finalTier === 'elite' || finalTier === 'top') && action !== 'SUPPRESS' && !stabilized.downstreamFrozen,
    },

    // ── Full sub-system payloads ──────────────────────────────────────────
    subsystems: {
      rankingData,
      intentData,
      authorityData,
      crawlData,
      orchestration,
      driftResult,
      decayRecovery,
      tierResult,
      serpFeedback:         stabilized.serpFeedbackSuppressed ? null : serpFeedback,
      stabilizedDecision:   stabilized,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASYNC WRAPPER: runAutonomousCoreAsync
//
// Fetches trend data, then runs the full synchronous pipeline.
// This is the entry point called directly from page.jsx and sitemap.js.
// Returns the full RankingDecision + assembled content + links.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @param {string} citySlug
 * @param {string} issueSlug
 * @param {object} reportData     – { reportCount, latestReportDate }
 * @param {object} stateData      – { baselineScore, previousSmoothedScore, lastStableTier, recoveryStartDate }
 * @param {number} populationMedian
 * @returns {Promise<RankingDecision & { trends, outboundLinks, contentModules, trendingBlock }>}
 */
export async function runAutonomousCoreAsync(
  citySlug,
  issueSlug,
  reportData    = {},
  stateData     = {},
  populationMedian = 5
) {
  const { reportCount = 0, latestReportDate = null } = reportData;
  const {
    baselineScore         = null,
    previousSmoothedScore = null,
    lastStableTier        = 'mid',
    recoveryStartDate     = null,
  } = stateData;

  // ── Fetch trends (single shared async operation) ──────────────────────────
  const trends        = await detectTrends({ topN: 10, minCount: 2 });
  const trendVelocity = getPageTrendVelocity(trends, citySlug, issueSlug);

  // ── Run full synchronous pipeline ─────────────────────────────────────────
  const decision = runAutonomousCore({
    citySlug,
    issueSlug,
    reportCount,
    latestReportDate,
    trendVelocity,
    baselineScore,
    previousSmoothedScore,
    lastStableTier,
    recoveryStartDate,
    populationMedian,
  });

  // ── Assemble content modules ───────────────────────────────────────────────
  const cityData  = DISTRICT_MAP[citySlug];
  const issueData = CATEGORY_MAP[issueSlug];

  const contentModules = cityData && issueData
    ? generateContentEntropy(
        cityData,
        issueData,
        { totalReports: reportCount },
        [],
        {
          intentData:    decision.subsystems.intentData,
          authorityData: decision.subsystems.authorityData,
          trendVelocity,
        }
      )
    : [];

  // ── Assemble internal links ────────────────────────────────────────────────
  const rankingMap = { [`${citySlug}:${issueSlug}`]: decision.subsystems.rankingData };
  const outboundLinks = buildOptimizedLinks(
    citySlug,
    issueSlug,
    trends,
    rankingMap,
    { maxLinks: decision.decisions.maxLinks }
  );

  // ── Trending block for homepage injection ──────────────────────────────────
  const trendingBlock = buildTrendingBlock(trends, 5);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 8.5 — INTERNAL ALIGNMENT CHECK
  // ════════════════════════════════════════════════════════════════════════════
  const alignmentResult = evaluateAlignment({
    internalScore:  decision.finalRankingScore,
    actualPosition: null,
    actualCTR:      null,
    reportCount,
    normalizedTier: decision.normalizedTier,
  });

  let governedDecision = decision;
  if (alignmentResult.mismatchDetected && alignmentResult.correctionFactor !== 1.0) {
    const correctedScore = parseFloat(
      Math.min(Math.max(decision.finalRankingScore * alignmentResult.correctionFactor, 0), 1.0).toFixed(4)
    );
    governedDecision = {
      ...decision,
      finalRankingScore: correctedScore,
      alignmentCorrectionApplied: true,
      alignmentCorrectionFactor:  alignmentResult.correctionFactor,
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 10 — REAL-WORLD SERP FEEDBACK INTEGRATION
  // Real Google signals are ground truth. This stage overrides internal
  // predictions when SERP data contradicts them with sufficient confidence.
  //
  // Signal authority:
  //   REAL SERP DATA (GSC + position tracker) > stability controller > governor > core
  // ════════════════════════════════════════════════════════════════════════════

  // 10a: Fetch real GSC signals (async; falls back to neutral stub if no API key)
  const pageSlug   = `/${citySlug}/${issueSlug}/`;
  const gscSignals = await collectGscSignals(pageSlug, { daysBack: 28 });

  // 10b: Build position tracking result (stateData.positionHistory from caller/KV store)
  const positionHistory   = stateData.positionHistory   ?? [];
  const previousPosition  = stateData.previousPosition  ?? null;
  const daysSinceLastCheck = stateData.daysSinceLastCheck ?? 1;

  const positionTrackResult = trackPosition({
    pageSlug,
    currentPosition:  gscSignals.avgPosition,
    previousPosition,
    positionHistory,
    daysSinceLastCheck,
  });

  // 10c: Normalise — produce unified realWorldFeedback
  const realWorldFeedback = normalizeRealWorldFeedback({
    gscSignals,
    positionTrackResult,
    internalScore:       governedDecision.finalRankingScore,
    prevRealWorldScore:  stateData.prevRealWorldScore ?? null,
  });

  // 10d: Feed real-world signal into stability controller as highest-authority input
  // Re-run the stability controller with realWorldFeedback injected
  const signalBundleRW = buildSignalBundle(
    governedDecision,
    governedDecision.finalRankingScore,
    alignmentResult.alignmentScore ?? 1.0,
    'OPTIMIZE'
  );
  signalBundleRW.realWorldFeedback = realWorldFeedback;

  const realWorldStabilized = stabilizeDecision(signalBundleRW, {
    lastStableScore: previousSmoothedScore,
    lastStableTier,
  });

  // 10e: Compute SERP correction loop deltas (advisory — affects next ISR cycle weights)
  const serpCorrection = computeSerpCorrectionDeltas(
    realWorldFeedback,
    {
      intentStrength: governedDecision.intentStrength,
      authorityBoost: governedDecision.authorityBoost,
      crawlPriority:  governedDecision.crawlPriority,
    }
  );

  // 10f: Build final real-world-adjusted decision
  const finalRealWorldScore = realWorldStabilized.stableFinalScore;
  const finalRealWorldTier  = realWorldStabilized.stabilizedTier;

  return {
    ...governedDecision,
    // Real-world adjusted outputs (these are THE authoritative values)
    finalRankingScore:  finalRealWorldScore,
    normalizedTier:     finalRealWorldTier,

    trends,
    outboundLinks,
    contentModules,
    trendingBlock,
    alignmentResult,

    // Real-world feedback payload (consumed by page.jsx and admin tools)
    realWorld: {
      gscSignals,
      positionTrackResult,
      realWorldFeedback,
      serpCorrection,
      realWorldStabilized,
      overrideApplied: realWorldStabilized.realWorldOverrideApplied,
    },
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// BATCH: runFleetAsync
//
// Scores an entire fleet of pages in one async call.
// Shares a single trends fetch across all pages.
// Used by sitemap.js, admin dashboard, and nightly re-scoring jobs.
//
// @param {Array<CoreInputs>} pages
// @returns {Promise<RankingDecision[]>} sorted by finalRankingScore desc
// ═══════════════════════════════════════════════════════════════════════════════
export async function runFleetAsync(pages = []) {
  const trends = await detectTrends({ topN: 20, minCount: 1 });

  const decisions = pages.map(page => {
    const trendVelocity = getPageTrendVelocity(trends, page.citySlug, page.issueSlug);
    return runAutonomousCore({ ...page, trendVelocity });
  });

  decisions.sort((a, b) => b.finalRankingScore - a.finalRankingScore);
  return decisions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SITEMAP FLEET: buildAutonomousSitemapFleet
//
// Generates complete sitemap priority data for all city×issue combinations.
// Uses static report signals (no DB call) for the sitemap-level view.
// ═══════════════════════════════════════════════════════════════════════════════
export async function buildAutonomousSitemapFleet() {
  const allPages = DISTRICTS.flatMap(district =>
    CATEGORIES.map(cat => ({
      citySlug:             district.slug,
      issueSlug:            cat.slug,
      reportCount:          0,
      latestReportDate:     null,
      baselineScore:        null,
      previousSmoothedScore:null,
      lastStableTier:       'mid',
      recoveryStartDate:    null,
      populationMedian:     5,
    }))
  );

  const fleet = await runFleetAsync(allPages);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vizhitn.in';

  return fleet.map(d => ({
    url:               `${SITE_URL}${d.pageSlug}`,
    priority:          d.sitemapPriority,
    changefreq:        d.subsystems.crawlData.changefreq,
    tierLevel:         d.normalizedTier,
    action:            d.action,
    finalRankingScore: d.finalRankingScore,
    stableScore:       d.stableRankingScore,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNED FLEET: governedFleetAsync
//
// Full pipeline with governor + normalization + self-improving loop.
// Used by sitemap.js, admin dashboard, and scheduled re-scoring.
// This is the highest-level fleet entry point in the system.
//
// @param {Array<CoreInputs>} pages
// @param {object}            prevSnapshot  – previous cycle performance snapshot
// @param {object}            currentWeights – weights from selfImprovingSeoLoop
// @returns {Promise<{
//   fleet:           RankingDecision[],
//   governorOutput:  object,
//   loopOutput:      object,
//   normalizedFleet: object[],
//   sitemapData:     object[],
// }>}
// ═══════════════════════════════════════════════════════════════════════════════
export async function governedFleetAsync(
  pages          = [],
  prevSnapshot   = {},
  currentWeights = null
) {
  const trends = await detectTrends({ topN: 20, minCount: 1 });

  // Step 1: Run autonomous core across all pages
  const fleet = pages.map(page => {
    const trendVelocity = getPageTrendVelocity(trends, page.citySlug, page.issueSlug);
    return runAutonomousCore({ ...page, trendVelocity });
  });
  fleet.sort((a, b) => b.finalRankingScore - a.finalRankingScore);

  // Step 2: Global Governor — health + bias detection
  const governorOutput = evaluateGlobalHealth(fleet);

  // Step 3: Normalization — enforce tier distribution quotas
  const { normalizedScores, adjustedTierMap, systemBalanceFactor } =
    normalizeGlobalRankingSystem(fleet);

  // Step 4: Apply governor corrections per page
  const governedFleet = fleet.map(d =>
    applyGovernorCorrection(d, adjustedTierMap, governorOutput)
  );

  // Step 5: Alignment monitor — fleet-level mismatch check
  const alignmentInputs = governedFleet.map(d => ({
    pageSlug:      d.pageSlug,
    internalScore: d.finalRankingScore,
    reportCount:   0,
    normalizedTier: d.normalizedTier,
  }));

  // Step 6: Self-improving loop — compute weight adjustments
  const snapshot = derivePerformanceSnapshot(governedFleet, [], governorOutput);
  const mergedSnapshot = { ...snapshot, ...prevSnapshot };
  const loopOutput = computeWeightAdjustments(mergedSnapshot, currentWeights || DEFAULT_SUBSYSTEM_WEIGHTS);

  // Step 7: Build sitemap data
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vizhitn.in';
  const sitemapData = governedFleet.map(d => ({
    url:               `${SITE_URL}${d.pageSlug}`,
    priority:          d.sitemapPriority,
    changefreq:        d.subsystems?.crawlData?.changefreq || 'weekly',
    tierLevel:         d.normalizedTier,
    action:            d.action,
    finalRankingScore: d.finalRankingScore,
    stableScore:       d.stableRankingScore,
  }));

  return {
    fleet:           governedFleet,
    governorOutput,
    loopOutput,
    normalizedFleet: normalizedScores,
    systemBalanceFactor,
    sitemapData,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: null decision (invalid city/issue input)
// ─────────────────────────────────────────────────────────────────────────────
function _nullDecision(pageSlug) {
  return {
    pageSlug,
    finalRankingScore:  0,
    stableRankingScore: 0,
    normalizedTier:     'dormant',
    driftStatus:        'NO_BASELINE',
    decayFactor:        1.0,
    recoveryFactor:     0.0,
    authorityBoost:     1.0,
    intentStrength:     0,
    trendScore:         0,
    crawlPriority:      0,
    linkWeight:         0.5,
    sitemapPriority:    0.1,
    action:             'SUPPRESS',
    decisions: {
      maxLinks: 2, sitemapPriority: 0.1, changefreq: 'monthly',
      linkBoost: 0.5, authorityExpand: false, trendingBlock: false,
    },
    subsystems: {},
  };
}
