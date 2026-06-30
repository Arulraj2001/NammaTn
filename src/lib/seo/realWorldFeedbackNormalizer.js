// src/lib/seo/realWorldFeedbackNormalizer.js
// ═══════════════════════════════════════════════════════════════════════════════
// REAL-WORLD FEEDBACK NORMALIZER
// Fuses GSC signals + SERP position data + internal ranking score
// into one unified realWorldFeedback object.
//
// This is the bridge between real Google data and the internal engine.
// Output is passed to systemStabilityController as the highest-authority input.
//
// Signal authority hierarchy (enforced by systemStabilityController):
//   1. Real SERP position + GSC signals  (GROUND TRUTH)
//   2. Stability controller decision
//   3. Global governor
//   4. Autonomous core internal score
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

import { positionToRankingScore } from '@/lib/seo/serpPositionTracker';

// ── Mismatch thresholds ───────────────────────────────────────────────────────
const MISMATCH_THRESHOLDS = {
  CRITICAL: 0.35, // |realWorldScore - internalScore| > 0.35
  HIGH:     0.20,
  MEDIUM:   0.10,
  LOW:      0.05,
};

// ── Noise dampening: GSC data is noisy; smooth with these decay constants ─────
const NOISE_ALPHA = 0.40; // EMA alpha: 40% new data, 60% history

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: normalizeRealWorldFeedback
//
// @param {object} params
// @param {object}  params.gscSignals          – from gscSignalCollector
// @param {object}  params.positionTrackResult – from serpPositionTracker
// @param {number}  params.internalScore       – current autonomousSeoCore finalRankingScore
// @param {number|null} params.prevRealWorldScore – EMA previous value (null = first run)
//
// @returns {RealWorldFeedback}
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeRealWorldFeedback({
  gscSignals          = {},
  positionTrackResult = {},
  internalScore       = 0,
  prevRealWorldScore  = null,
} = {}) {

  const dataSource = gscSignals.dataSource || 'offline_stub';
  const hasRealData = dataSource === 'gsc_api';

  // ── 1. Compute raw real-world score ───────────────────────────────────────
  // Blend position score (highest weight), CTR, and impressions
  const posScore  = positionTrackResult.positionScore  ?? positionToRankingScore(gscSignals.avgPosition ?? 50);
  const ctrScore  = gscSignals.ctrScore                ?? 0;
  const impScore  = gscSignals.impressionScore         ?? 0;
  const momScore  = positionTrackResult.momentumScore  ?? posScore;
  const gscComp   = gscSignals.gscCompositeScore       ?? 0;

  // When GSC data is offline, fall through to internal score
  let rawRealWorldScore;
  if (hasRealData) {
    rawRealWorldScore =
      0.40 * posScore  +
      0.25 * ctrScore  +
      0.20 * gscComp   +
      0.15 * momScore;
  } else {
    // No real data → trust internal score, slight noise reduction
    rawRealWorldScore = internalScore;
  }
  rawRealWorldScore = parseFloat(Math.min(Math.max(rawRealWorldScore, 0), 1.0).toFixed(4));

  // ── 2. EMA smoothing (dampen GSC data noise) ──────────────────────────────
  const realWorldScore = prevRealWorldScore !== null
    ? parseFloat((NOISE_ALPHA * rawRealWorldScore + (1 - NOISE_ALPHA) * prevRealWorldScore).toFixed(4))
    : rawRealWorldScore;

  // ── 3. Trust factor ───────────────────────────────────────────────────────
  // How much to trust the real-world score:
  //   1.0 = full trust (real GSC data, high impressions)
  //   0.5 = partial trust (GSC but low data volume)
  //   0.0 = no trust (offline stub)
  let trustFactor;
  if (!hasRealData) {
    trustFactor = 0.0;
  } else {
    const dataVolumeTrust = Math.min(
      (gscSignals.impressions || 0) / 500, // 500+ impressions = full trust
      1.0
    );
    trustFactor = parseFloat((0.70 + 0.30 * dataVolumeTrust).toFixed(4)); // 70–100%
  }

  // ── 4. Performance delta ──────────────────────────────────────────────────
  // Signed: positive = real-world better than predicted, negative = worse
  const performanceDelta = parseFloat((realWorldScore - internalScore).toFixed(4));

  // ── 5. Alignment gap ──────────────────────────────────────────────────────
  const alignmentGap = Math.abs(performanceDelta);

  // ── 6. Mismatch severity ──────────────────────────────────────────────────
  let mismatchSeverity = 'NONE';
  if (alignmentGap >= MISMATCH_THRESHOLDS.CRITICAL && hasRealData) mismatchSeverity = 'CRITICAL';
  else if (alignmentGap >= MISMATCH_THRESHOLDS.HIGH && hasRealData) mismatchSeverity = 'HIGH';
  else if (alignmentGap >= MISMATCH_THRESHOLDS.MEDIUM && hasRealData) mismatchSeverity = 'MEDIUM';
  else if (alignmentGap >= MISMATCH_THRESHOLDS.LOW  && hasRealData) mismatchSeverity = 'LOW';

  // ── 7. Correction factor ──────────────────────────────────────────────────
  // How much to move the internal score toward real-world score.
  // Only applied when trustFactor is high enough.
  let correctionFactor = 1.0;
  if (hasRealData && trustFactor >= 0.7) {
    // Correction = blend internal toward real-world proportional to mismatch
    const blend = Math.min(alignmentGap * trustFactor * 2.0, 0.50); // max 50% correction
    correctionFactor = performanceDelta > 0
      ? parseFloat((1.0 + blend).toFixed(4))  // real-world better → lift internal
      : parseFloat((1.0 - blend).toFixed(4)); // real-world worse  → reduce internal
  }

  // ── 8. Movement signal from position tracker ──────────────────────────────
  const movementClass   = positionTrackResult.movementClass   ?? 'STABLE';
  const positionChange  = positionTrackResult.positionChange  ?? 0;
  const velocity        = positionTrackResult.velocity        ?? 0;

  return {
    // Core outputs (consumed by stabilityController)
    realWorldScore,
    trustFactor,
    performanceDelta,
    alignmentGap:   parseFloat(alignmentGap.toFixed(4)),
    mismatchSeverity,
    correctionFactor,
    hasRealData,

    // Position signals
    serpPosition:   gscSignals.avgPosition   ?? 50,
    movementClass,
    positionChange,
    velocity,

    // GSC raw
    impressions:   gscSignals.impressions    ?? 0,
    clicks:        gscSignals.clicks         ?? 0,
    ctr:           gscSignals.ctr            ?? 0,
    trendVelocity: gscSignals.trendVelocity  ?? 'none',
    queryClusters: gscSignals.queryClusters  ?? [],
    dataSource,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH: normalizeFleetFeedback
//
// @param {Array<{ pageSlug, gscSignals, positionTrackResult, internalScore, prevRealWorldScore }>} pages
// @returns {Map<string, RealWorldFeedback>}
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeFleetFeedback(pages = []) {
  const map = new Map();
  pages.forEach(p => {
    map.set(p.pageSlug, normalizeRealWorldFeedback(p));
  });
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: applyRealWorldCorrection
//
// Applies the realWorldFeedback correctionFactor to an internalScore.
// Returns the real-world-adjusted score.
// This is the final merge point — called inside autonomousSeoCore Stage 10.
// ─────────────────────────────────────────────────────────────────────────────
export function applyRealWorldCorrection(internalScore, realWorldFeedback) {
  const { correctionFactor, trustFactor, hasRealData, mismatchSeverity } = realWorldFeedback;

  // No real data → return internal score unchanged
  if (!hasRealData || trustFactor === 0) return parseFloat(internalScore.toFixed(4));

  // Critical mismatch: override internal score with real-world score directly
  if (mismatchSeverity === 'CRITICAL' && trustFactor >= 0.80) {
    // Weighted blend: 60% real-world, 40% internal
    const blended = 0.60 * realWorldFeedback.realWorldScore + 0.40 * internalScore;
    return parseFloat(Math.min(Math.max(blended, 0), 1.0).toFixed(4));
  }

  // Standard correction via correction factor
  const corrected = internalScore * correctionFactor;
  return parseFloat(Math.min(Math.max(corrected, 0), 1.0).toFixed(4));
}
