// src/lib/seo/confidenceWeighting.js
// ═══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE WEIGHTING ENGINE
// Computes a data-quality confidence weight based on the availability and
// volume of GSC + real-world signals. Used to scale internal scores so that
// offline/low-data mode cannot produce the same ranking confidence as a page
// with 28 days of verified GSC data.
//
// Signal states:
//   LIVE     – real GSC API data with high impression volume   → weight 1.00
//   PARTIAL  – real GSC API data but low impression volume    → weight 0.70
//   OFFLINE  – no GSC credentials / API unavailable           → weight 0.40
//
// Uncertainty penalty:
//   Applied ADDITIVELY on top of confidence weight reduction.
//   Prevents offline mode from falsely inheriting prior-cycle stability.
//
// Pure computation — no I/O, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Volume thresholds for LIVE vs PARTIAL classification ─────────────────────
const VOLUME_THRESHOLD_FULL    = 500;  // 500+ impressions in window → LIVE
const VOLUME_THRESHOLD_PARTIAL = 50;   // 50–499 impressions         → PARTIAL

// ── Confidence weight table ───────────────────────────────────────────────────
export const CONFIDENCE_WEIGHTS = {
  LIVE:    1.00,
  PARTIAL: 0.70,
  OFFLINE: 0.40,
};

// ── Uncertainty penalty table (absolute score reduction after weighting) ──────
const UNCERTAINTY_PENALTIES = {
  LIVE:    0.00,  // no penalty — data is trusted
  PARTIAL: 0.03,  // 3-point penalty — minor doubt
  OFFLINE: 0.08,  // 8-point penalty — significant doubt
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: computeConfidenceWeight
//
// @param {object} context
// @param {boolean} context.gscDataAvailable   – true when GSC API returned rows
// @param {number}  context.impressions         – total impressions in period
// @param {number}  context.trustFactor         – 0–1 from realWorldFeedbackNormalizer
// @param {string}  [context.dataSource]        – 'gsc_api' | 'offline_stub'
//
// @returns {{ confidenceWeight, uncertaintyPenalty, confidenceState }}
// ─────────────────────────────────────────────────────────────────────────────
export function computeConfidenceWeight({
  gscDataAvailable = false,
  impressions      = 0,
  trustFactor      = 0,
  dataSource       = 'offline_stub',
} = {}) {

  // ── Classify data state ───────────────────────────────────────────────────
  let confidenceState;

  if (!gscDataAvailable || dataSource === 'offline_stub' || trustFactor === 0) {
    confidenceState = 'OFFLINE';
  } else if (impressions >= VOLUME_THRESHOLD_FULL && trustFactor >= 0.80) {
    confidenceState = 'LIVE';
  } else {
    confidenceState = 'PARTIAL';
  }

  const confidenceWeight  = CONFIDENCE_WEIGHTS[confidenceState];
  const uncertaintyPenalty = UNCERTAINTY_PENALTIES[confidenceState];

  return {
    confidenceWeight:  parseFloat(confidenceWeight.toFixed(4)),
    uncertaintyPenalty: parseFloat(uncertaintyPenalty.toFixed(4)),
    confidenceState,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY: applyConfidenceToScore
//
// Applies confidence weighting + uncertainty penalty to a raw internal score.
//
// Formula:
//   adjustedScore = (internalScore * confidenceWeight) - uncertaintyPenalty
//
// The uncertainty penalty is NOT scaled — it is always a fixed reduction to
// prevent offline mode from dressing up a 0.40-confidence score as stable.
//
// @param {number} internalScore – 0.0–1.0
// @param {object} confidenceResult – from computeConfidenceWeight()
// @returns {number} confidence-adjusted score 0.0–1.0
// ─────────────────────────────────────────────────────────────────────────────
export function applyConfidenceToScore(internalScore, confidenceResult) {
  const { confidenceWeight, uncertaintyPenalty } = confidenceResult;
  const adjusted = (internalScore * confidenceWeight) - uncertaintyPenalty;
  return parseFloat(Math.min(Math.max(adjusted, 0), 1.0).toFixed(4));
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: confidenceFromRealWorldFeedback
//
// Convenience wrapper: derives confidence directly from a realWorldFeedback
// object (from realWorldFeedbackNormalizer) without requiring the caller
// to manually extract fields.
// ─────────────────────────────────────────────────────────────────────────────
export function confidenceFromRealWorldFeedback(realWorldFeedback = {}) {
  return computeConfidenceWeight({
    gscDataAvailable: realWorldFeedback.hasRealData  ?? false,
    impressions:      realWorldFeedback.impressions  ?? 0,
    trustFactor:      realWorldFeedback.trustFactor  ?? 0,
    dataSource:       realWorldFeedback.dataSource   ?? 'offline_stub',
  });
}
