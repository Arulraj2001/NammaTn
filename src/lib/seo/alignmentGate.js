// src/lib/seo/alignmentGate.js
// ═══════════════════════════════════════════════════════════════════════════════
// ALIGNMENT GATE — CONTROL LAYER
// Hard-constraint enforcement layer between signal normalization and final
// decision resolution. When alignmentGap exceeds the threshold, the gate
// transitions the system into CONTROLLED mode and restricts which actions
// are legally permitted.
//
// CONTROLLED mode rules (all enforced when gate is locked):
//   ✗ BOOST mode disabled — cannot amplify a misaligned internal signal
//   ✗ linkOptimizer boosts suppressed — no PageRank amplification during mismatch
//   ✓ HOLD or REBALANCE only — system must settle before scoring again
//   ↑ serpFeedbackLoop weight +60% (SERP is primary when internal is wrong)
//   ↓ authorityEngine weight  -40% (authority may be inflating score incorrectly)
//
// Gate states:
//   NORMAL      – alignmentGap < LOW threshold  → no restriction
//   CAUTION     – alignmentGap in LOW–HIGH range → soft restrictions
//   CONTROLLED  – alignmentGap >= HIGH threshold → hard restrictions
//
// Pure computation — no I/O, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Alignment gap thresholds ──────────────────────────────────────────────────
export const ALIGNMENT_GATE_THRESHOLDS = {
  CONTROLLED: 0.35, // >= 35% gap → hard lock, SERP becomes primary
  CAUTION:    0.18, // 18–34% gap → soft restrictions, advisory only
  NORMAL:     0.00, // < 18% → no restriction
};

// ── System mode strings ───────────────────────────────────────────────────────
export const ALIGNMENT_MODES = {
  NORMAL:     'NORMAL',
  CAUTION:    'CAUTION',
  CONTROLLED: 'CONTROLLED',
};

// ── Weight modifiers applied in CONTROLLED mode ───────────────────────────────
const CONTROLLED_WEIGHT_OVERRIDES = {
  serpFeedbackLoop: { multiplier: 1.60, direction: 'increase' },
  authorityEngine:  { multiplier: 0.60, direction: 'decrease' },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: validateAlignment
//
// @param {object} systemState
// @param {number} systemState.alignmentGap      – 0.0–1.0 from realWorldFeedback
// @param {boolean} systemState.hasRealData      – only lock if we have real evidence
// @param {string}  systemState.stabilityAction  – current controller action
// @param {number}  systemState.trustFactor      – confidence in real-world signal
//
// @returns {AlignmentGateResult}
// ─────────────────────────────────────────────────────────────────────────────
export function validateAlignment({
  alignmentGap     = 0,
  hasRealData      = false,
  stabilityAction  = 'PASS',
  trustFactor      = 0,
} = {}) {

  // Gate only locks when we have trusted real evidence
  const effectiveGap = hasRealData && trustFactor >= 0.60
    ? alignmentGap
    : 0; // no real data → treat as NORMAL regardless of internal gap

  // ── Classify gate state ───────────────────────────────────────────────────
  let gateMode;
  if      (effectiveGap >= ALIGNMENT_GATE_THRESHOLDS.CONTROLLED) gateMode = ALIGNMENT_MODES.CONTROLLED;
  else if (effectiveGap >= ALIGNMENT_GATE_THRESHOLDS.CAUTION)    gateMode = ALIGNMENT_MODES.CAUTION;
  else                                                            gateMode = ALIGNMENT_MODES.NORMAL;

  const alignmentLocked = gateMode === ALIGNMENT_MODES.CONTROLLED;

  // ── Resolve permitted actions ─────────────────────────────────────────────
  // CONTROLLED: only HOLD or REBALANCE allowed. If PASS/SOFT_ADJUST was resolved,
  // we escalate to REBALANCE so the system re-examines signal weighting.
  let permittedAction = stabilityAction;
  const BLOCKED_ACTIONS = ['PASS', 'SOFT_ADJUST'];
  const BOOST_DISABLED  = alignmentLocked || gateMode === ALIGNMENT_MODES.CAUTION;

  if (alignmentLocked && BLOCKED_ACTIONS.includes(stabilityAction)) {
    permittedAction = 'REBALANCE'; // minimum action when locked
  }

  // ── Weight adjustment recommendations ─────────────────────────────────────
  const weightAdjustments = {};
  if (alignmentLocked) {
    weightAdjustments.serpFeedback   = CONTROLLED_WEIGHT_OVERRIDES.serpFeedbackLoop.multiplier;
    weightAdjustments.authorityEngine = CONTROLLED_WEIGHT_OVERRIDES.authorityEngine.multiplier;
    weightAdjustments.linkOptimizerBoostSuppressed = true;
  } else if (gateMode === ALIGNMENT_MODES.CAUTION) {
    // Partial weight nudge — softer version
    weightAdjustments.serpFeedback    = 1.25;
    weightAdjustments.authorityEngine = 0.80;
    weightAdjustments.linkOptimizerBoostSuppressed = false;
  }

  return {
    gateMode,
    alignmentLocked,
    permittedAction,
    boostDisabled:  BOOST_DISABLED,
    weightAdjustments,
    effectiveGap:   parseFloat(effectiveGap.toFixed(4)),
    stabilityOverride: alignmentLocked,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY: applyAlignmentGateToWeights
//
// Takes a subsystem weight object and applies the gate's weight multipliers.
// Returns modified weight object (does not mutate original).
// ─────────────────────────────────────────────────────────────────────────────
export function applyAlignmentGateToWeights(weights = {}, gateResult = {}) {
  if (!gateResult.weightAdjustments || Object.keys(gateResult.weightAdjustments).length === 0) {
    return weights;
  }

  const next = { ...weights };
  const adj  = gateResult.weightAdjustments;

  if (adj.serpFeedback !== undefined && next.serpFeedback !== undefined) {
    next.serpFeedback = parseFloat(
      Math.min(next.serpFeedback * adj.serpFeedback, 0.45).toFixed(4)
    );
  }
  if (adj.authorityEngine !== undefined && next.authorityEngine !== undefined) {
    next.authorityEngine = parseFloat(
      Math.max(next.authorityEngine * adj.authorityEngine, 0.02).toFixed(4)
    );
  }

  return next;
}
