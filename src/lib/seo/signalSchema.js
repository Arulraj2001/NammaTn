// src/lib/seo/signalSchema.js
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SIGNAL SCHEMA
// Single canonical representation of ALL ranking inputs before they reach
// systemStabilityController. No subsystem may produce a standalone ranking
// influence — every signal must be mapped into this vector first.
//
// Signal Vector structure:
//   performance  → CTR + impressions normalized (GSC)
//   authority    → authorityEngine output (E-E-A-T)
//   freshness    → trendDetector + decayRecovery merged
//   stability    → serpDriftController + alignmentGate merged
//   externalTruth → SERP position + GSC composite (ground truth)
//
// The vector is the ONLY accepted input to stabilizeDecision().
// systemStabilityController is the ONLY system that reads the vector and
// produces a finalRankingDecision. All other systems are signal providers.
//
// Pure computation — no I/O, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

import { DRIFT_STATUS } from '@/lib/seo/serpDriftController';

// ── Signal group names (for logging + gate labeling) ─────────────────────────
export const SIGNAL_GROUPS = {
  PERFORMANCE:    'performance',
  AUTHORITY:      'authority',
  FRESHNESS:      'freshness',
  STABILITY:      'stability',
  EXTERNAL_TRUTH: 'externalTruth',
};

// ── Canonical group weights (stability controller reads these) ────────────────
// These replace BLEND_WEIGHTS in autonomousSeoCore.
export const SIGNAL_GROUP_WEIGHTS = {
  performance:   0.25,  // CTR + engagement — Google's #1 behavioral signal
  authority:     0.20,  // E-E-A-T strength
  freshness:     0.20,  // Temporal relevance (trend + decay)
  stability:     0.15,  // Internal model coherence
  externalTruth: 0.20,  // SERP + GSC ground truth
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: buildUnifiedSignalVector
//
// Maps ALL subsystem outputs into a single canonical SignalVector.
// Called by autonomousSeoCore after collecting all subsystem outputs.
//
// @param {object} sources
// @param {object} sources.orchestration     – rankingOrchestrator output
// @param {object} sources.serpFeedback      – serpFeedbackLoop output
// @param {object} sources.decayRecovery     – rankingDecayRecovery output
// @param {object} sources.driftResult       – serpDriftController output
// @param {object} sources.intentData        – queryIntentEngine output
// @param {object} sources.authorityData     – authorityEngine output (raw)
// @param {object} sources.rankingData       – rankingFeedback output
// @param {object} sources.crawlData         – crawlOptimizer output
// @param {object} sources.gscSignals        – gscSignalCollector output
// @param {object} sources.positionTrack     – serpPositionTracker output
// @param {object} sources.realWorldFeedback – realWorldFeedbackNormalizer output
// @param {object} sources.alignmentGate     – alignmentGate validateAlignment output
// @param {number} sources.trendScore        – 0–1 velocity score
// @param {number} sources.stableRankingScore– EMA-smoothed score
//
// @returns {SignalVector}
// ─────────────────────────────────────────────────────────────────────────────
export function buildUnifiedSignalVector({
  orchestration      = {},
  serpFeedback       = {},
  decayRecovery      = {},
  driftResult        = {},
  intentData         = {},
  authorityData      = {},
  rankingData        = {},
  crawlData          = {},
  gscSignals         = {},
  positionTrack      = {},
  realWorldFeedback  = {},
  alignmentGate      = {},
  trendScore         = 0,
  stableRankingScore = 0,
} = {}) {

  // ── GROUP: performance ─────────────────────────────────────────────────────
  // Source: serpFeedbackLoop (CTR proxy) + GSC (real CTR + impressions)
  const feedbackScore   = serpFeedback.feedbackScore      ?? 0;
  const gscCtrScore     = gscSignals.ctrScore             ?? 0;
  const gscImpScore     = gscSignals.impressionScore      ?? 0;
  const hasRealData     = realWorldFeedback.hasRealData   ?? false;

  // When real GSC data exists, weight it heavily; otherwise use proxy
  const performanceScore = hasRealData
    ? parseFloat((0.50 * gscCtrScore + 0.30 * gscImpScore + 0.20 * feedbackScore).toFixed(4))
    : parseFloat(feedbackScore.toFixed(4));

  // ── GROUP: authority ───────────────────────────────────────────────────────
  // Source: authorityEngine → authorityBoostFactor (1.0 = none, 1.5 = max)
  const authorityBoostFactor = rankingData.authorityBoostFactor ?? 1.0;
  const authorityScore       = parseFloat(
    Math.min((authorityBoostFactor - 1.0) / 0.5, 1.0).toFixed(4)
  );
  const intentStrength = intentData.intentStrength ?? 0.5;

  // Authority group = weighted merge of E-E-A-T + intent
  const authorityGroupScore = parseFloat(
    (0.70 * authorityScore + 0.30 * intentStrength).toFixed(4)
  );

  // ── GROUP: freshness ───────────────────────────────────────────────────────
  // Source: trendDetector (trendScore) + rankingDecayRecovery (effectiveScore)
  const effectiveDecayScore = decayRecovery.effectiveScore ?? stableRankingScore;
  const freshnessScore      = parseFloat(
    (0.50 * trendScore + 0.50 * effectiveDecayScore).toFixed(4)
  );

  // ── GROUP: stability ───────────────────────────────────────────────────────
  // Source: serpDriftController + alignmentGate
  // Drift → 0–1 (SURGING=1, FALLING=0), alignmentGate gap → inverted (0 gap = 1.0)
  const DRIFT_TO_SCORE = {
    [DRIFT_STATUS.SURGING]:     1.0,
    [DRIFT_STATUS.RISING]:      0.80,
    [DRIFT_STATUS.STABLE]:      0.60,
    [DRIFT_STATUS.SLIPPING]:    0.35,
    [DRIFT_STATUS.FALLING]:     0.10,
    [DRIFT_STATUS.NO_BASELINE]: 0.50,
  };
  const driftScore         = DRIFT_TO_SCORE[driftResult.driftStatus] ?? 0.50;
  const alignmentGapScore  = 1.0 - (alignmentGate.effectiveGap ?? 0);
  const stabilityScore     = parseFloat(
    (0.55 * driftScore + 0.45 * alignmentGapScore).toFixed(4)
  );

  // ── GROUP: externalTruth ───────────────────────────────────────────────────
  // Source: GSC composite + SERP position tracker
  // Only populated when hasRealData; otherwise 0 (no authority claimed)
  const externalTruthScore = hasRealData
    ? parseFloat((
        0.60 * (gscSignals.gscCompositeScore      ?? 0) +
        0.40 * (positionTrack.positionScore       ?? 0)
      ).toFixed(4))
    : 0;

  // ── Composite orchestrator score (feature extractor — not final decision) ──
  const orchestratorFeatureScore = orchestration.finalRankingScore ?? stableRankingScore;

  // ── Weighted group composite ───────────────────────────────────────────────
  // This is the "pre-gate" score — stabilityController resolves the final.
  const compositeScore = parseFloat(Math.min(
    SIGNAL_GROUP_WEIGHTS.performance   * performanceScore    +
    SIGNAL_GROUP_WEIGHTS.authority     * authorityGroupScore +
    SIGNAL_GROUP_WEIGHTS.freshness     * freshnessScore      +
    SIGNAL_GROUP_WEIGHTS.stability     * stabilityScore      +
    (hasRealData
      ? SIGNAL_GROUP_WEIGHTS.externalTruth * externalTruthScore
      : SIGNAL_GROUP_WEIGHTS.externalTruth * orchestratorFeatureScore),
    1.0
  ).toFixed(4));

  return {
    // ── Signal groups (canonical, consumed by stabilityController) ──────────
    groups: {
      performance:   parseFloat(Math.min(performanceScore, 1.0).toFixed(4)),
      authority:     parseFloat(Math.min(authorityGroupScore, 1.0).toFixed(4)),
      freshness:     parseFloat(Math.min(freshnessScore, 1.0).toFixed(4)),
      stability:     parseFloat(Math.min(stabilityScore, 1.0).toFixed(4)),
      externalTruth: parseFloat(Math.min(externalTruthScore, 1.0).toFixed(4)),
    },
    weights:       SIGNAL_GROUP_WEIGHTS,
    compositeScore,
    hasRealData,

    // ── Raw passthrough fields required by stabilityController ──────────────
    // These are advisory — stabilityController uses them for conflict detection
    driftStatus:     driftResult.driftStatus  ?? DRIFT_STATUS.STABLE,
    trendScore,
    decayFactor:     decayRecovery.decayFactor        ?? 1.0,
    recoveryFactor:  decayRecovery.recoveryFactor      ?? 0,
    authorityBoost:  authorityBoostFactor,
    intentStrength,
    crawlPriority:   crawlData.crawlScore              ?? 0.5,
    alignmentScore:  alignmentGapScore,
    realWorldFeedback,                                  // passed as-is to stability gate

    // ── Traceability ─────────────────────────────────────────────────────────
    signalSources: {
      performance:   hasRealData ? 'gsc_api'     : 'serp_proxy',
      authority:     'authorityEngine',
      freshness:     'trendDetector+decayRecovery',
      stability:     'serpDrift+alignmentGate',
      externalTruth: hasRealData ? 'gsc_api+positionTracker' : 'orchestrator_proxy',
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: signalVectorToCoreBundle
//
// Converts a SignalVector into the signal bundle format that stabilizeDecision()
// expects. This is the ONLY translation layer between signals and controller.
// ─────────────────────────────────────────────────────────────────────────────
export function signalVectorToCoreBundle(signalVector) {
  return {
    coreScore:        signalVector.compositeScore,
    governorScore:    signalVector.compositeScore,  // governor is advisory — same base
    driftStatus:      signalVector.driftStatus,
    trendScore:       signalVector.trendScore,
    decayFactor:      signalVector.decayFactor,
    recoveryFactor:   signalVector.recoveryFactor,
    authorityBoost:   signalVector.authorityBoost,
    alignmentScore:   signalVector.alignmentScore,
    intentStrength:   signalVector.intentStrength,
    crawlPriority:    signalVector.crawlPriority,
    realWorldFeedback: signalVector.realWorldFeedback,
    systemMode:       'OPTIMIZE',
    // Group scores — stored for normalizer to consume
    _signalGroups:    signalVector.groups,
  };
}
