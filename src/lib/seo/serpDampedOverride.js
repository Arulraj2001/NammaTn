// src/lib/seo/serpDampedOverride.js
// ═══════════════════════════════════════════════════════════════════════════════
// DAMPED SERP OVERRIDE SYSTEM
// Prevents external SERP signal oscillation by blending internal and external
// scores with a dynamic trust-proportional alpha weight.
//
// REALITY ALIGNMENT PRINCIPLE (enforced here):
//   - Internal model is probabilistic → advisory weight
//   - External SERP data is ground truth → primary weight
//   - BUT all external signals must be damped, not absolute
//   - System stability overrides both internal and external extremes
//
// Alpha semantics:
//   alpha = fraction of final score sourced from INTERNAL model
//   (1-alpha) = fraction from EXTERNAL SERP score
//
//   HIGH trust (≥0.8) → alpha=0.30 → external dominates (70%)
//   MID  trust (0.5–0.8) → alpha=0.50 → balanced blend
//   LOW  trust (<0.5)  → alpha=0.70 → internal dominates (70%)
//
// Pure computation — no I/O, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Oscillation damping: max score change per ISR cycle ──────────────────────
// Prevents single-cycle jumps larger than this delta (regardless of override).
const MAX_DAMPED_DELTA = 0.15; // 15-point maximum shift per cycle

// ── Trust → alpha mapping ─────────────────────────────────────────────────────
const ALPHA_HIGH  = 0.30; // trust >= 0.80 → internal 30%, external 70%
const ALPHA_MID   = 0.50; // trust 0.50–0.79 → internal 50%, external 50%
const ALPHA_LOW   = 0.70; // trust < 0.50  → internal 70%, external 30%

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: computeDampedScore
//
// @param {number} internalScore   – 0.0–1.0 (from autonomousSeoCore)
// @param {number} externalScore   – 0.0–1.0 (realWorldScore from normalizer)
// @param {number} trustFactor     – 0.0–1.0 (from realWorldFeedbackNormalizer)
// @param {number|null} prevScore  – last cycle's dampedScore (null = first run)
//
// @returns {{ dampedScore, alpha, blendMode, deltaApplied, clampedByDelta }}
// ─────────────────────────────────────────────────────────────────────────────
export function computeDampedScore(
  internalScore = 0,
  externalScore = 0,
  trustFactor   = 0,
  prevScore     = null,
) {
  // ── 1. Determine alpha from trust ─────────────────────────────────────────
  let alpha;
  let blendMode;

  if (trustFactor >= 0.80) {
    alpha     = ALPHA_HIGH;
    blendMode = 'EXTERNAL_DOMINANT';
  } else if (trustFactor >= 0.50) {
    alpha     = ALPHA_MID;
    blendMode = 'BALANCED';
  } else {
    alpha     = ALPHA_LOW;
    blendMode = 'INTERNAL_DOMINANT';
  }

  // ── 2. Blend ──────────────────────────────────────────────────────────────
  const rawBlended = (alpha * internalScore) + ((1 - alpha) * externalScore);

  // ── 3. Oscillation clamp — limit delta from previous cycle ───────────────
  let dampedScore     = parseFloat(Math.min(Math.max(rawBlended, 0), 1.0).toFixed(4));
  let clampedByDelta  = false;
  let deltaApplied    = 0;

  if (prevScore !== null) {
    const delta = dampedScore - prevScore;
    if (Math.abs(delta) > MAX_DAMPED_DELTA) {
      // Clamp: allow at most MAX_DAMPED_DELTA change in one ISR cycle
      dampedScore    = parseFloat((prevScore + Math.sign(delta) * MAX_DAMPED_DELTA).toFixed(4));
      clampedByDelta = true;
    }
    deltaApplied = parseFloat((dampedScore - prevScore).toFixed(4));
  }

  return {
    dampedScore,
    alpha:          parseFloat(alpha.toFixed(2)),
    blendMode,
    deltaApplied,
    clampedByDelta,
    rawBlended:     parseFloat(rawBlended.toFixed(4)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: shouldApplyDampedOverride
//
// Gate check: only apply the damped override when conditions are met.
// Prevents oscillation from being triggered on every ISR cycle.
// ─────────────────────────────────────────────────────────────────────────────
export function shouldApplyDampedOverride(realWorldFeedback = {}) {
  const { hasRealData, trustFactor, alignmentGap } = realWorldFeedback;
  // Only override when we have real data with meaningful alignment gap
  return hasRealData && trustFactor >= 0.50 && (alignmentGap ?? 0) >= 0.05;
}
