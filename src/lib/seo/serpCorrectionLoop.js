// src/lib/seo/serpCorrectionLoop.js
// ═══════════════════════════════════════════════════════════════════════════════
// SERP CORRECTION LOOP
// Detects mismatch between predicted internal score and actual SERP position,
// then dynamically adjusts subsystem weights to close the gap over time.
//
// This is the LEARNING ENGINE that makes the system self-correcting.
// Works alongside selfImprovingSeoLoop.js but is driven by real-world SERP
// signals rather than internal performance patterns.
//
// Weight adjustments are additive deltas on top of the base weights.
// autonomousSeoCore reads the merged weights at the start of each pipeline.
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

import { DEFAULT_SUBSYSTEM_WEIGHTS, WEIGHT_BOUNDS } from '@/lib/seo/selfImprovingSeoLoop';

// ── Mismatch detection thresholds ─────────────────────────────────────────────
const MISMATCH_THRESHOLD = {
  LARGE:   0.25, // > 25 point gap → aggressive reweight
  MEDIUM:  0.12, // 12–24 point gap → moderate reweight
  SMALL:   0.05, // 5–11 point gap → fine-tune
};

// ── Diagnostic: which subsystem is most likely to blame ──────────────────────
// Pattern rules: what signal pattern suggests which subsystem is wrong
function diagnoseMismatch(realWorldFeedback, internalSignals = {}) {
  const { performanceDelta, ctr, impressions, trendVelocity, movementClass } = realWorldFeedback;
  const { intentStrength = 0.5, authorityBoost = 1.0, crawlPriority = 0.5 } = internalSignals;

  const diagnoses = [];

  // Real world worse than predicted → internal is over-optimistic
  const overScored = performanceDelta < 0;
  // Real world better than predicted → internal is too conservative
  const underScored = performanceDelta > 0;

  if (overScored) {
    // Internal predicted high but SERP shows low position
    if (intentStrength > 0.7 && ctr < 0.05) {
      // High intent score but poor CTR → intent engine targeting wrong queries
      diagnoses.push({ subsystem: 'queryIntentEngine', direction: 'decrease', confidence: 0.80 });
    }
    if (authorityBoost >= 1.3 && movementClass === 'FALLING') {
      // High authority signal but position falling → authority engine over-boosting
      diagnoses.push({ subsystem: 'authorityEngine', direction: 'decrease', confidence: 0.75 });
    }
    if (impressions > 200 && ctr < 0.03) {
      // Good impressions but terrible CTR → content entropy (title/meta mismatch)
      diagnoses.push({ subsystem: 'contentEntropy', direction: 'increase', confidence: 0.70 });
    }
  }

  if (underScored) {
    // Internal predicted low but SERP shows good position
    if (authorityBoost < 1.2 && movementClass === 'RISING') {
      // Page rising without authority signal → authority underweighted
      diagnoses.push({ subsystem: 'authorityEngine', direction: 'increase', confidence: 0.80 });
    }
    if (trendVelocity === 'spike' || trendVelocity === 'high') {
      // Trend drove SERP but internal didn't capture it
      diagnoses.push({ subsystem: 'queryIntentEngine', direction: 'increase', confidence: 0.65 });
    }
    if (crawlPriority < 0.4 && impressions > 500) {
      // High impressions but low crawl priority → linkOptimizer under-feeding
      diagnoses.push({ subsystem: 'linkOptimizer', direction: 'increase', confidence: 0.60 });
    }
  }

  return diagnoses;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: computeSerpCorrectionDeltas
//
// Computes weight adjustment deltas to reduce the mismatch.
//
// @param {object} realWorldFeedback    – from realWorldFeedbackNormalizer
// @param {object} internalSignals      – { intentStrength, authorityBoost, crawlPriority }
// @param {object} currentWeights       – current subsystem weights
// @returns {{ weightDeltas, correctionStrength, correctionReason, diagnoses }}
// ─────────────────────────────────────────────────────────────────────────────
export function computeSerpCorrectionDeltas(
  realWorldFeedback = {},
  internalSignals   = {},
  currentWeights    = null,
) {
  const weights = { ...(currentWeights || DEFAULT_SUBSYSTEM_WEIGHTS) };
  const {
    alignmentGap     = 0,
    mismatchSeverity = 'NONE',
    performanceDelta = 0,
    trustFactor      = 0,
    hasRealData      = false,
  } = realWorldFeedback;

  // No real data → no correction
  if (!hasRealData || trustFactor < 0.50) {
    return {
      weightDeltas:       {},
      correctionStrength: 0,
      correctionReason:   'insufficient_real_data',
      diagnoses:          [],
      nextWeights:        weights,
    };
  }

  // No meaningful mismatch
  if (mismatchSeverity === 'NONE' || alignmentGap < MISMATCH_THRESHOLD.SMALL) {
    return {
      weightDeltas:       {},
      correctionStrength: 0,
      correctionReason:   'no_mismatch',
      diagnoses:          [],
      nextWeights:        weights,
    };
  }

  // ── Determine correction strength ─────────────────────────────────────────
  let correctionStrength;
  let stepSize;
  if      (alignmentGap >= MISMATCH_THRESHOLD.LARGE)  { correctionStrength = 'LARGE';  stepSize = 0.04; }
  else if (alignmentGap >= MISMATCH_THRESHOLD.MEDIUM) { correctionStrength = 'MEDIUM'; stepSize = 0.02; }
  else                                                 { correctionStrength = 'SMALL';  stepSize = 0.01; }

  // Scale step by trust factor (less trusted data = smaller steps)
  stepSize = parseFloat((stepSize * trustFactor).toFixed(4));

  // ── Diagnose which subsystems are responsible ─────────────────────────────
  const diagnoses = diagnoseMismatch(realWorldFeedback, internalSignals);

  // ── Build weight deltas from diagnoses ────────────────────────────────────
  const weightDeltas = {};

  diagnoses.forEach(({ subsystem, direction, confidence }) => {
    const delta = direction === 'increase'
      ? +(stepSize * confidence)
      : -(stepSize * confidence);
    weightDeltas[subsystem] = parseFloat(
      ((weightDeltas[subsystem] || 0) + delta).toFixed(4)
    );
  });

  // ── Global real-world authority boost ─────────────────────────────────────
  // Always increase serpFeedback weight slightly when real data contradicts internal
  if (mismatchSeverity !== 'NONE') {
    weightDeltas.serpFeedback = parseFloat(
      ((weightDeltas.serpFeedback || 0) + stepSize * 0.5).toFixed(4)
    );
  }

  // ── Apply deltas with bounds ──────────────────────────────────────────────
  const nextWeights = _applyDeltasBounded(weights, weightDeltas);

  return {
    weightDeltas,
    correctionStrength,
    correctionReason: `mismatch_${mismatchSeverity.toLowerCase()}_gap_${alignmentGap.toFixed(2)}`,
    diagnoses,
    nextWeights,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGE: mergeWithSelfImprovingWeights
//
// Combines corrections from serpCorrectionLoop + selfImprovingSeoLoop.
// Real-world corrections take priority where they conflict.
// ─────────────────────────────────────────────────────────────────────────────
export function mergeWithSelfImprovingWeights(correctionDeltas = {}, selfImprovingNextWeights = {}) {
  const merged = { ...selfImprovingNextWeights };

  // Real-world corrections override self-improving loop where they disagree
  Object.entries(correctionDeltas).forEach(([key, delta]) => {
    if (key in merged) {
      const bounds = WEIGHT_BOUNDS[key];
      if (bounds) {
        const adjusted = parseFloat((merged[key] + delta).toFixed(4));
        merged[key] = Math.min(Math.max(adjusted, bounds.min), bounds.max);
      }
    }
  });

  return merged;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL helpers
// ─────────────────────────────────────────────────────────────────────────────
function _applyDeltasBounded(weights, deltas) {
  const next = { ...weights };
  Object.entries(deltas).forEach(([key, delta]) => {
    const bounds = WEIGHT_BOUNDS[key];
    if (key in next && bounds) {
      next[key] = parseFloat(
        Math.min(Math.max(next[key] + delta, bounds.min), bounds.max).toFixed(4)
      );
    }
  });
  return next;
}
