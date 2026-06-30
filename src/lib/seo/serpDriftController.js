// src/lib/seo/serpDriftController.js
// SERP Drift Controller.
// Detects when a page's effective ranking score has drifted significantly from
// its last-known stable position and classifies the drift type.
//
// "Drift" = the delta between the current live ranking score and the
// last-known stable baseline. Positive drift = rising. Negative = falling.
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.

// ── Drift thresholds ──────────────────────────────────────────────────────────
const DRIFT_THRESHOLDS = {
  STRONG_RISE:   +0.18,  // Score improved by 18+ points → significant positive shift
  MILD_RISE:     +0.07,  // Score improved by 7–17 points
  STABLE_BAND:    0.06,  // ±6 points → within noise band, considered stable
  MILD_DROP:     -0.07,  // Dropped 7–17 points
  SHARP_DROP:    -0.18,  // Dropped 18+ points → critical negative drift
};

// ── Drift status labels ────────────────────────────────────────────────────────
export const DRIFT_STATUS = {
  SURGING:       'SURGING',       // Strong positive, reinforce immediately
  RISING:        'RISING',        // Mild positive, monitor + light boost
  STABLE:        'STABLE',        // Within noise band, no action needed
  SLIPPING:      'SLIPPING',      // Mild negative, flag for recovery
  FALLING:       'FALLING',       // Sharp negative, trigger recovery system
  NO_BASELINE:   'NO_BASELINE',   // First time seen — no prior data
};

// ── Drift cause classifier ────────────────────────────────────────────────────
// Returns the most likely cause of detected drift given signal deltas.
function classifyDriftCause(delta, signals = {}) {
  const { trendDelta = 0, reportCountDelta = 0, authorityDelta = 0 } = signals;

  if (Math.abs(delta) < DRIFT_THRESHOLDS.STABLE_BAND) return 'none';

  if (delta > 0) {
    if (trendDelta > 0.2)        return 'trend_spike';
    if (reportCountDelta > 5)    return 'report_surge';
    if (authorityDelta > 0)      return 'authority_increase';
    return 'organic_growth';
  } else {
    if (trendDelta < -0.2)       return 'trend_collapse';
    if (reportCountDelta < -5)   return 'report_decay';
    if (authorityDelta < 0)      return 'authority_loss';
    return 'natural_decay';
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * @param {number}  currentScore   – live finalRankingScore (0.0–1.0)
 * @param {number|null} baselineScore – last stable score from cache/store. null = first run.
 * @param {object}  signalDeltas   – { trendDelta, reportCountDelta, authorityDelta }
 * @returns {{
 *   driftStatus:   string,
 *   driftDelta:    number,   // signed: positive = rising, negative = falling
 *   driftMagnitude:number,   // absolute value
 *   driftCause:    string,
 *   correctionFactor: number, // multiplier to apply to next scoring cycle
 *   shouldAlert:   boolean,
 * }}
 */
export function evaluateDrift(currentScore, baselineScore = null, signalDeltas = {}) {
  if (baselineScore === null || baselineScore === undefined) {
    return {
      driftStatus:      DRIFT_STATUS.NO_BASELINE,
      driftDelta:       0,
      driftMagnitude:   0,
      driftCause:       'none',
      correctionFactor: 1.0,
      shouldAlert:      false,
    };
  }

  const delta     = parseFloat((currentScore - baselineScore).toFixed(4));
  const magnitude = Math.abs(delta);

  let driftStatus;
  if      (delta >=  DRIFT_THRESHOLDS.STRONG_RISE) driftStatus = DRIFT_STATUS.SURGING;
  else if (delta >=  DRIFT_THRESHOLDS.MILD_RISE)   driftStatus = DRIFT_STATUS.RISING;
  else if (delta >  -DRIFT_THRESHOLDS.STABLE_BAND) driftStatus = DRIFT_STATUS.STABLE;
  else if (delta >   DRIFT_THRESHOLDS.SHARP_DROP)  driftStatus = DRIFT_STATUS.SLIPPING;
  else                                              driftStatus = DRIFT_STATUS.FALLING;

  // Correction factor: how much to adjust composite score to resist over-reaction
  // SURGING pages get dampened slightly to prevent artificial spikes in sitemap.
  // FALLING pages get an uplift signal to give recovery a chance.
  const correctionFactor =
    driftStatus === DRIFT_STATUS.SURGING   ? 0.92 :
    driftStatus === DRIFT_STATUS.RISING    ? 0.97 :
    driftStatus === DRIFT_STATUS.STABLE    ? 1.00 :
    driftStatus === DRIFT_STATUS.SLIPPING  ? 1.05 :
    driftStatus === DRIFT_STATUS.FALLING   ? 1.12 : 1.00;

  const shouldAlert = driftStatus === DRIFT_STATUS.FALLING ||
                      driftStatus === DRIFT_STATUS.SURGING;

  return {
    driftStatus,
    driftDelta:       delta,
    driftMagnitude:   parseFloat(magnitude.toFixed(4)),
    driftCause:       classifyDriftCause(delta, signalDeltas),
    correctionFactor,
    shouldAlert,
  };
}

// ── Batch drift check ─────────────────────────────────────────────────────────
/**
 * Evaluate drift for a fleet of pages.
 * @param {Array<{ pageSlug, currentScore, baselineScore, signalDeltas }>} pages
 * @returns {Map<string, DriftResult>}  keyed by pageSlug
 */
export function evaluateFleetDrift(pages = []) {
  const map = new Map();
  pages.forEach(({ pageSlug, currentScore, baselineScore, signalDeltas }) => {
    map.set(pageSlug, evaluateDrift(currentScore, baselineScore, signalDeltas));
  });
  return map;
}
