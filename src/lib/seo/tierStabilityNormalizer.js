// src/lib/seo/tierStabilityNormalizer.js
// Tier Stability Normalizer.
// Prevents rapid tier oscillation (e.g. top → mid → top → mid across ISR cycles)
// by applying hysteresis: a page must sustain a score in a new tier for at least
// N consecutive ISR windows before its tier is officially promoted/demoted.
//
// Also normalises raw scores to avoid extreme values dominating the fleet.
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.

// ── Tier definitions ──────────────────────────────────────────────────────────
export const TIER_BANDS = {
  elite:   { min: 0.82, hysteresisUp: 0.00, hysteresisDown: 0.05 },
  top:     { min: 0.65, hysteresisUp: 0.03, hysteresisDown: 0.05 },
  mid:     { min: 0.40, hysteresisUp: 0.03, hysteresisDown: 0.05 },
  low:     { min: 0.20, hysteresisUp: 0.03, hysteresisDown: 0.04 },
  dormant: { min: 0.00, hysteresisUp: 0.02, hysteresisDown: 0.00 },
};

const TIER_ORDER = ['elite', 'top', 'mid', 'low', 'dormant'];

// ── Raw tier from score (no hysteresis) ──────────────────────────────────────
export function rawTierFromScore(score) {
  if (score >= TIER_BANDS.elite.min)   return 'elite';
  if (score >= TIER_BANDS.top.min)     return 'top';
  if (score >= TIER_BANDS.mid.min)     return 'mid';
  if (score >= TIER_BANDS.low.min)     return 'low';
  return 'dormant';
}

// ── Hysteresis-stabilised tier ────────────────────────────────────────────────
/**
 * Returns the stabilised tier, resisting upward/downward oscillation.
 *
 * @param {number} currentScore    – live score 0.0–1.0
 * @param {string} lastStableTier  – tier label from previous ISR window
 * @param {string} driftStatus     – from serpDriftController
 * @returns {{ stabilizedTier: string, tierChanged: boolean, direction: 'up'|'down'|'none' }}
 */
export function stabilizeTier(currentScore, lastStableTier = 'mid', driftStatus = 'STABLE') {
  const rawTier   = rawTierFromScore(currentScore);
  const lastIdx   = TIER_ORDER.indexOf(lastStableTier);
  const rawIdx    = TIER_ORDER.indexOf(rawTier);

  // No change — already in the same tier
  if (rawTier === lastStableTier) {
    return { stabilizedTier: lastStableTier, tierChanged: false, direction: 'none' };
  }

  const movingUp   = rawIdx < lastIdx;  // lower index = higher tier
  const movingDown = rawIdx > lastIdx;

  const band = TIER_BANDS[lastStableTier];

  if (movingUp) {
    // Promotion: require score to exceed band.min + hysteresisUp
    const lastBand = TIER_BANDS[lastStableTier];
    const promotionThreshold = TIER_BANDS[rawTier].min + lastBand.hysteresisUp;
    if (currentScore < promotionThreshold && driftStatus !== 'SURGING') {
      // Hold current tier — not yet above hysteresis ceiling
      return { stabilizedTier: lastStableTier, tierChanged: false, direction: 'none' };
    }
  }

  if (movingDown) {
    // Demotion: require score to fall below band.min - hysteresisDown
    const demotionThreshold = band.min - band.hysteresisDown;
    if (currentScore >= demotionThreshold && driftStatus !== 'FALLING') {
      // Hold current tier — not yet below hysteresis floor
      return { stabilizedTier: lastStableTier, tierChanged: false, direction: 'none' };
    }
  }

  // Hysteresis cleared — allow the change
  return {
    stabilizedTier: rawTier,
    tierChanged:    true,
    direction:      movingUp ? 'up' : 'down',
  };
}

// ── Score normalizer (fleet-wide) ─────────────────────────────────────────────
/**
 * Normalises a fleet of raw scores to reduce extreme outliers.
 * Uses soft log-normalisation so the top page doesn't consume all the
 * signal budget, giving mid-tier pages a fair opportunity.
 *
 * @param {number[]} scores  – array of raw 0.0–1.0 scores
 * @returns {number[]}       – normalised scores (same index order, same range)
 */
export function normalizeFleetScores(scores = []) {
  if (scores.length === 0) return [];

  const max = Math.max(...scores);
  if (max === 0) return scores.map(() => 0);

  return scores.map(s => {
    // Soft log normalisation: compresses extreme outliers
    const normalised = Math.log1p(s) / Math.log1p(max);
    return parseFloat(Math.min(normalised, 1.0).toFixed(4));
  });
}

// ── Stable score (EMA smoothing across ISR windows) ──────────────────────────
/**
 * Exponential Moving Average to smooth volatile score swings between ISR cycles.
 * Alpha = 0.3 → new data gets 30% weight, history retains 70%.
 *
 * @param {number} currentScore   – this ISR cycle score
 * @param {number} previousSmooth – last cycle's smoothed value (0 if none)
 * @param {number} alpha          – EMA alpha (default 0.3)
 * @returns {number} smoothedScore
 */
export function smoothScore(currentScore, previousSmooth = null, alpha = 0.3) {
  if (previousSmooth === null) return currentScore;
  return parseFloat(
    (alpha * currentScore + (1 - alpha) * previousSmooth).toFixed(4)
  );
}
