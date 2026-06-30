// src/lib/seo/systemStabilityController.js
// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM STABILITY CONTROLLER — FINAL AUTHORITY LAYER
// ═══════════════════════════════════════════════════════════════════════════════
//
// This is the outermost layer of the entire SEO ranking engine.
// ALL other systems are advisory. ONLY this controller determines the final
// ranking state that exits to page.jsx, sitemap.js, and any consumer.
//
// Responsibilities:
//   1. Detect conflicts between subsystem outputs (4 detectors)
//   2. Normalize all signals to a unified 0–1 scale
//   3. Resolve contradictions via conflict-severity decision tree
//   4. Emit a single deterministic StabilizedDecision
//   5. Enforce global control rules (LOCK / HOLD gates)
//
// System Control Rules (inviolable):
//   ✓ No page gets a final score without passing through stabilizeDecision()
//   ✓ LOCK state freezes all downstream adjustments
//   ✓ HOLD state suppresses serpFeedbackLoop and linkOptimizer changes
//   ✓ No subsystem can promote its own score above its advisory role
//   ✓ No Math.random() — fully deterministic, ISR-safe
// ═══════════════════════════════════════════════════════════════════════════════

import { rawTierFromScore } from '@/lib/seo/tierStabilityNormalizer';
import { DRIFT_STATUS }     from '@/lib/seo/serpDriftController';
import { applyRealWorldCorrection }     from '@/lib/seo/realWorldFeedbackNormalizer';
import { computeConfidenceWeight, applyConfidenceToScore, confidenceFromRealWorldFeedback } from '@/lib/seo/confidenceWeighting';
import { computeDampedScore, shouldApplyDampedOverride }         from '@/lib/seo/serpDampedOverride';
import { validateAlignment, applyAlignmentGateToWeights }        from '@/lib/seo/alignmentGate';

// ── Conflict severity levels ──────────────────────────────────────────────────
export const CONFLICT_SEVERITY = {
  NONE:     'NONE',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
};

// ── Stability actions ─────────────────────────────────────────────────────────
export const STABILITY_ACTION = {
  LOCK:         'LOCK',        // CRITICAL conflict — freeze all scores at last stable value
  HOLD:         'HOLD',        // HIGH conflict — prevent downstream adjustments for 1 ISR cycle
  REBALANCE:    'REBALANCE',   // MEDIUM conflict — re-weight signals, recompute consensus
  SOFT_ADJUST:  'SOFT_ADJUST', // LOW conflict — minor correction applied, proceed normally
  PASS:         'PASS',        // No conflict — pass through with no modification
};

// ── Conflict thresholds ───────────────────────────────────────────────────────
const SCORE_CONFLICT_THRESHOLD = {
  CRITICAL: 0.30, // governor vs core disagree by 30+ points → critical
  HIGH:     0.20, // 20–29 points → high
  MEDIUM:   0.10, // 10–19 points → medium
};

// ── Consensus scoring: how many subsystems agree on the tier ──────────────────
// Consensus = fraction of signals that fall within the same tier band as the median
function computeConsensusLevel(signals) {
  if (signals.length === 0) return 1.0;
  const sorted = [...signals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const medianTier = rawTierFromScore(median);
  const agreements = signals.filter(s => rawTierFromScore(s) === medianTier).length;
  return parseFloat((agreements / signals.length).toFixed(4));
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1: detectSystemConflicts
//
// Runs 4 independent conflict detectors and aggregates them.
//
// @param {object} signals – raw multi-system inputs
// @returns {{ conflicts, worstSeverity, totalConflicts }}
// ─────────────────────────────────────────────────────────────────────────────
export function detectSystemConflicts(signals = {}) {
  const {
    coreScore        = 0,
    governorScore    = 0,
    driftStatus      = 'STABLE',
    trendScore       = 0,
    decayFactor      = 1.0,
    recoveryFactor   = 0,
    authorityBoost   = 1.0,
    alignmentScore   = 1.0,
    systemMode       = 'STABILIZE',
    crawlPriority    = 0.5,
    intentStrength   = 0.5,
  } = signals;

  const conflicts = [];

  // ── Detector A: Governor vs Core score disagreement ───────────────────────
  const scoreDelta = Math.abs(coreScore - governorScore);
  if (scoreDelta >= SCORE_CONFLICT_THRESHOLD.CRITICAL) {
    conflicts.push({
      conflictType:     'SCORE_DIVERGENCE',
      severity:         CONFLICT_SEVERITY.CRITICAL,
      delta:            parseFloat(scoreDelta.toFixed(4)),
      affectedSystems:  ['autonomousSeoCore', 'globalSeoGovernor'],
      description:      `Core score ${coreScore.toFixed(3)} vs Governor score ${governorScore.toFixed(3)} — delta ${scoreDelta.toFixed(3)} exceeds critical threshold`,
    });
  } else if (scoreDelta >= SCORE_CONFLICT_THRESHOLD.HIGH) {
    conflicts.push({
      conflictType:     'SCORE_DIVERGENCE',
      severity:         CONFLICT_SEVERITY.HIGH,
      delta:            parseFloat(scoreDelta.toFixed(4)),
      affectedSystems:  ['autonomousSeoCore', 'globalSeoGovernor'],
      description:      `Score delta ${scoreDelta.toFixed(3)} — high disagreement between core and governor`,
    });
  } else if (scoreDelta >= SCORE_CONFLICT_THRESHOLD.MEDIUM) {
    conflicts.push({
      conflictType:     'SCORE_DIVERGENCE',
      severity:         CONFLICT_SEVERITY.MEDIUM,
      delta:            parseFloat(scoreDelta.toFixed(4)),
      affectedSystems:  ['autonomousSeoCore', 'globalSeoGovernor'],
      description:      `Score delta ${scoreDelta.toFixed(3)} — moderate disagreement`,
    });
  }

  // ── Detector B: Drift direction vs Trend direction contradiction ───────────
  // Drift FALLING + trendScore HIGH = contradiction (trend surging but drift says falling)
  // Drift SURGING + trendScore LOW = contradiction (no trend signal but drift surging)
  const driftDirectionUp   = driftStatus === DRIFT_STATUS.SURGING || driftStatus === DRIFT_STATUS.RISING;
  const driftDirectionDown = driftStatus === DRIFT_STATUS.FALLING || driftStatus === DRIFT_STATUS.SLIPPING;
  const trendHigh = trendScore >= 0.60;
  const trendLow  = trendScore <= 0.20;

  if (driftDirectionDown && trendHigh) {
    conflicts.push({
      conflictType:     'DRIFT_TREND_CONTRADICTION',
      severity:         CONFLICT_SEVERITY.HIGH,
      affectedSystems:  ['serpDriftController', 'trendDetector'],
      description:      `Drift is ${driftStatus} but trend score is high (${trendScore.toFixed(2)}) — contradiction`,
    });
  } else if (driftDirectionUp && trendLow) {
    conflicts.push({
      conflictType:     'DRIFT_TREND_CONTRADICTION',
      severity:         CONFLICT_SEVERITY.MEDIUM,
      affectedSystems:  ['serpDriftController', 'trendDetector'],
      description:      `Drift is ${driftStatus} but trend score is low (${trendScore.toFixed(2)}) — weak contradiction`,
    });
  }

  // ── Detector C: Decay vs Authority conflict ───────────────────────────────
  // decayFactor very low (page dying) but authorityBoost high (authority says page is strong)
  // This is a paradox — page cannot be both decaying critically and authority-strong
  const decayIsCritical = decayFactor < 0.35;
  const authorityIsStrong = authorityBoost >= 1.4;
  const recoveryIsStrong = recoveryFactor >= 0.6;

  if (decayIsCritical && authorityIsStrong && !recoveryIsStrong) {
    conflicts.push({
      conflictType:     'DECAY_AUTHORITY_PARADOX',
      severity:         CONFLICT_SEVERITY.MEDIUM,
      affectedSystems:  ['rankingDecayRecovery', 'authorityEngine'],
      description:      `Page decayFactor ${decayFactor.toFixed(2)} is critical but authorityBoost ${authorityBoost.toFixed(2)} suggests strength — no recovery signal present`,
    });
  }

  // ── Detector D: Alignment vs System Mode contradiction ───────────────────
  // alignmentScore < 0.50 means SERP behavior disagrees with internal model
  // If systemMode = BOOST while alignment is poor, we're amplifying a wrong signal
  const alignmentPoor = alignmentScore < 0.50;
  const modeIsAggressive = systemMode === 'BOOST';

  if (alignmentPoor && modeIsAggressive) {
    conflicts.push({
      conflictType:     'ALIGNMENT_MODE_CONFLICT',
      severity:         CONFLICT_SEVERITY.HIGH,
      affectedSystems:  ['serpAlignmentMonitor', 'selfImprovingSeoLoop'],
      description:      `Alignment score ${alignmentScore.toFixed(2)} < 0.50 but systemMode is BOOST — amplifying misaligned signal`,
    });
  }

  // ── Detector E: Real-world SERP signal vs internal score ──────────────────
  // If caller supplies realWorldFeedback with high trust and critical mismatch,
  // this is treated as a CRITICAL conflict regardless of other signals.
  const rwf = signals.realWorldFeedback;
  if (rwf && rwf.hasRealData && rwf.trustFactor >= 0.70) {
    if (rwf.mismatchSeverity === 'CRITICAL') {
      conflicts.push({
        conflictType:     'REAL_WORLD_OVERRIDE',
        severity:         CONFLICT_SEVERITY.CRITICAL,
        affectedSystems:  ['autonomousSeoCore', 'gscSignalCollector', 'serpPositionTracker'],
        description:      `Real SERP data (trust ${rwf.trustFactor.toFixed(2)}) shows critical mismatch: internal ${coreScore.toFixed(3)} vs real-world ${rwf.realWorldScore.toFixed(3)} — gap ${rwf.alignmentGap.toFixed(3)}`,
      });
    } else if (rwf.mismatchSeverity === 'HIGH') {
      conflicts.push({
        conflictType:     'REAL_WORLD_DIVERGENCE',
        severity:         CONFLICT_SEVERITY.HIGH,
        affectedSystems:  ['autonomousSeoCore', 'gscSignalCollector'],
        description:      `Real SERP mismatch HIGH: internal ${coreScore.toFixed(3)} vs real-world ${rwf.realWorldScore.toFixed(3)}`,
      });
    }
  }

  // ── Aggregate worst severity ──────────────────────────────────────────────
  const SEVERITY_ORDER = {
    [CONFLICT_SEVERITY.CRITICAL]: 4,
    [CONFLICT_SEVERITY.HIGH]:     3,
    [CONFLICT_SEVERITY.MEDIUM]:   2,
    [CONFLICT_SEVERITY.LOW]:      1,
    [CONFLICT_SEVERITY.NONE]:     0,
  };
  const worstSeverity = conflicts.reduce((worst, c) => {
    return (SEVERITY_ORDER[c.severity] || 0) > (SEVERITY_ORDER[worst] || 0) ? c.severity : worst;
  }, CONFLICT_SEVERITY.NONE);

  return { conflicts, worstSeverity, totalConflicts: conflicts.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 2: normalizeSignals
//
// Normalizes all subsystem outputs to a unified 0–1 scale.
// Applies outlier dampening and cross-signal smoothing.
//
// @param {object} allInputs – raw multi-system signal values
// @returns {{ normalizedSignals, stabilityIndex, signalVector }}
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeSignals(allInputs = {}) {
  const {
    coreScore        = 0,
    governorScore    = 0,
    driftScore       = 0.5,    // mapped from driftStatus externally
    authorityBoost   = 1.0,
    intentStrength   = 0.5,
    crawlPriority    = 0.5,
    trendScore       = 0,
    decayFactor      = 1.0,
    recoveryFactor   = 0,
    alignmentScore   = 1.0,
  } = allInputs;

  // ── Clamp all inputs to [0, 1] range ──────────────────────────────────────
  const clamp = v => parseFloat(Math.min(Math.max(v ?? 0, 0), 1.0).toFixed(4));

  // Authority boost normalisation: 1.0→0, 1.2→0.4, 1.5→1.0
  const normAuthority = clamp(Math.min((authorityBoost - 1.0) / 0.5, 1.0));

  const raw = {
    coreScore:      clamp(coreScore),
    governorScore:  clamp(governorScore),
    driftScore:     clamp(driftScore),
    authority:      normAuthority,
    intent:         clamp(intentStrength),
    crawl:          clamp(crawlPriority),
    trend:          clamp(trendScore),
    decay:          clamp(decayFactor),          // 1.0 = healthy
    recovery:       clamp(recoveryFactor),
    alignment:      clamp(alignmentScore),
  };

  // ── Outlier dampening: winsorize extremes ──────────────────────────────────
  // Any signal above 0.95 or below 0.05 gets soft-clamped to prevent a single
  // signal from dominating the consensus calculation.
  const winsorize = v => {
    if (v > 0.95) return parseFloat((0.95 + (v - 0.95) * 0.3).toFixed(4)); // compress top 5%
    if (v < 0.05) return parseFloat((0.05 - (0.05 - v) * 0.3).toFixed(4)); // compress bottom 5%
    return v;
  };

  const normalizedSignals = {};
  Object.entries(raw).forEach(([k, v]) => { normalizedSignals[k] = winsorize(v); });

  // ── Stability index: std deviation of all signals ─────────────────────────
  // Low std dev = signals are in agreement = high stability
  const values = Object.values(normalizedSignals);
  const mean   = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const stabilityIndex = parseFloat(Math.max(1 - stdDev * 2.5, 0).toFixed(4));

  // ── Signal vector: weighted average across all normalized signals ──────────
  // This is the "what signals collectively say" baseline for resolution
  const SIGNAL_WEIGHTS = {
    coreScore: 0.30, governorScore: 0.20, alignment: 0.15,
    decay: 0.10, recovery: 0.05, trend: 0.08,
    intent: 0.05, crawl: 0.04, authority: 0.02, driftScore: 0.01,
  };
  const signalVector = parseFloat(Object.entries(SIGNAL_WEIGHTS).reduce((s, [k, w]) => {
    return s + (normalizedSignals[k] ?? 0) * w;
  }, 0).toFixed(4));

  return { normalizedSignals, stabilityIndex, signalVector };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 3: resolveFinalDecision
//
// Given conflicts and normalized signals, determines the final stabilized
// score, tier, action, and adjustment vector.
//
// @param {object} conflictReport – from detectSystemConflicts()
// @param {object} normResult     – from normalizeSignals()
// @param {object} context        – { lastStableScore, lastStableTier, systemMode }
// @returns {{ finalAction, finalRankingScore, finalTier, adjustmentVector }}
// ─────────────────────────────────────────────────────────────────────────────
export function resolveFinalDecision(conflictReport = {}, normResult = {}, context = {}) {
  const { worstSeverity = CONFLICT_SEVERITY.NONE, totalConflicts = 0 } = conflictReport;
  const { normalizedSignals = {}, stabilityIndex = 1.0, signalVector = 0.5 } = normResult;
  const {
    lastStableScore = null,
    lastStableTier  = 'mid',
    systemMode      = 'STABILIZE',
  } = context;

  // ── Action resolution tree ────────────────────────────────────────────────
  let finalAction;

  if (worstSeverity === CONFLICT_SEVERITY.CRITICAL) {
    // LOCK: freeze at last known stable value — no new adjustments allowed
    finalAction = STABILITY_ACTION.LOCK;
  } else if (
    worstSeverity === CONFLICT_SEVERITY.HIGH ||
    (systemMode !== 'STABILIZE' && stabilityIndex < 0.40)
  ) {
    // HOLD: pause downstream adjustments for this ISR cycle
    finalAction = STABILITY_ACTION.HOLD;
  } else if (
    worstSeverity === CONFLICT_SEVERITY.MEDIUM ||
    (normalizedSignals.driftScore < 0.25 && normalizedSignals.trend > 0.60)
  ) {
    // REBALANCE: drift and trend are pulling in opposite directions
    finalAction = STABILITY_ACTION.REBALANCE;
  } else if (totalConflicts > 0) {
    finalAction = STABILITY_ACTION.SOFT_ADJUST;
  } else {
    finalAction = STABILITY_ACTION.PASS;
  }

  // ── Score resolution ──────────────────────────────────────────────────────
  let finalRankingScore;

  if (finalAction === STABILITY_ACTION.LOCK) {
    // Use last stable score or fall back to signal vector
    finalRankingScore = lastStableScore !== null ? lastStableScore : signalVector;
  } else if (finalAction === STABILITY_ACTION.HOLD) {
    // Average of signal vector and last stable (dampened)
    const base = lastStableScore !== null ? lastStableScore : signalVector;
    finalRankingScore = parseFloat(((base * 0.7 + signalVector * 0.3)).toFixed(4));
  } else if (finalAction === STABILITY_ACTION.REBALANCE) {
    // Weight signal vector more heavily; dampens extreme outliers
    const alpha = 0.65;
    const base  = lastStableScore !== null ? lastStableScore : signalVector;
    finalRankingScore = parseFloat((alpha * signalVector + (1 - alpha) * base).toFixed(4));
  } else if (finalAction === STABILITY_ACTION.SOFT_ADJUST) {
    // Minor correction: blend signal vector 80/20 with current
    const base = normalizedSignals.coreScore ?? signalVector;
    finalRankingScore = parseFloat((base * 0.80 + signalVector * 0.20).toFixed(4));
  } else {
    // PASS: use coreScore directly (already stabilized upstream)
    finalRankingScore = parseFloat((normalizedSignals.coreScore ?? signalVector).toFixed(4));
  }

  // Clamp final
  finalRankingScore = parseFloat(Math.min(Math.max(finalRankingScore, 0), 1.0).toFixed(4));

  const finalTier = rawTierFromScore(finalRankingScore);

  // ── Adjustment vector ─────────────────────────────────────────────────────
  // Signed delta telling downstream consumers how much the score changed
  const baseCoreScore = normalizedSignals.coreScore ?? 0;
  const adjustmentVector = parseFloat((finalRankingScore - baseCoreScore).toFixed(4));

  return { finalAction, finalRankingScore, finalTier, adjustmentVector };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY EXPORT: stabilizeDecision
//
// The single gate ALL ranking decisions must pass through.
// Combines all three modules into one call.
//
// @param {object} inputs – combined multi-system signal bundle
// @param {object} state  – { lastStableScore, lastStableTier }
// @returns {StabilizedDecision}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} StabilizedDecision
 * @property {number}  stableFinalScore        – 0.0–1.0 (THE authoritative score)
 * @property {string}  stabilizedTier          – tier derived from stableFinalScore
 * @property {number}  systemConsensusLevel    – 0.0–1.0 (1.0 = all systems agree)
 * @property {boolean} conflictDetected
 * @property {Array}   conflictSources
 * @property {string}  stabilityAction         – LOCK|HOLD|REBALANCE|SOFT_ADJUST|PASS
 * @property {number}  adjustmentVector        – signed delta applied to core score
 * @property {object}  normalizedSignals       – all inputs on unified 0–1 scale
 * @property {string}  worstConflictSeverity
 * @property {boolean} downstreamFrozen        – true when LOCK or HOLD
 * @property {boolean} serpFeedbackSuppressed  – true when LOCK
 * @property {boolean} linkOptimizerFrozen     – true when LOCK or HOLD
 */
export function stabilizeDecision(inputs = {}, state = {}) {
  // ── Map driftStatus → numeric drift score ─────────────────────────────────
  const DRIFT_SCORE_MAP = {
    [DRIFT_STATUS.SURGING]:     1.0,
    [DRIFT_STATUS.RISING]:      0.75,
    [DRIFT_STATUS.STABLE]:      0.50,
    [DRIFT_STATUS.SLIPPING]:    0.30,
    [DRIFT_STATUS.FALLING]:     0.10,
    [DRIFT_STATUS.NO_BASELINE]: 0.50,
  };

  const driftScore   = DRIFT_SCORE_MAP[inputs.driftStatus] ?? 0.50;
  const signalBundle = { ...inputs, driftScore };
  const rwf          = inputs.realWorldFeedback;

  // ════════════════════════════════════════════════════════════════════════════
  // 6-STEP CONTROL PIPELINE (enforced order)
  // ════════════════════════════════════════════════════════════════════════════

  // ── STEP 1: Detect conflicts ────────────────────────────────────────────────
  const conflictReport = detectSystemConflicts(signalBundle);

  // ── STEP 2: Normalize signals ──────────────────────────────────────────────
  const normResult = normalizeSignals(signalBundle);

  // ── STEP 3: Apply alignment gate ───────────────────────────────────────────
  const gateResult = validateAlignment({
    alignmentGap:    rwf?.alignmentGap    ?? 0,
    hasRealData:     rwf?.hasRealData     ?? false,
    stabilityAction: conflictReport.worstSeverity === 'CRITICAL' ? 'LOCK' : 'PASS',
    trustFactor:     rwf?.trustFactor     ?? 0,
  });

  // ── STEP 4: Apply confidence weighting ─────────────────────────────────
  const confidenceResult = rwf
    ? confidenceFromRealWorldFeedback(rwf)
    : computeConfidenceWeight({});  // offline defaults

  // Apply confidence to the core score before resolution
  const confidenceAdjustedCoreScore = applyConfidenceToScore(
    signalBundle.coreScore ?? 0,
    confidenceResult
  );
  // Rebuild signalBundle with confidence-adjusted score
  const adjustedBundle = {
    ...signalBundle,
    coreScore:     confidenceAdjustedCoreScore,
    confidenceState: confidenceResult.confidenceState,
  };

  // Re-normalize with adjusted score
  const normResultFinal = normalizeSignals(adjustedBundle);

  // ── STEP 5: Apply damped SERP override ────────────────────────────────
  let dampedResult = null;
  let preResolutionScore = confidenceAdjustedCoreScore;

  if (rwf && shouldApplyDampedOverride(rwf)) {
    dampedResult = computeDampedScore(
      confidenceAdjustedCoreScore,
      rwf.realWorldScore,
      rwf.trustFactor,
      state.lastStableScore ?? null
    );
    preResolutionScore = dampedResult.dampedScore;
  }

  // Inject pre-resolution score back into normalized signals for resolution step
  const normResultWithDamp = {
    ...normResultFinal,
    normalizedSignals: {
      ...normResultFinal.normalizedSignals,
      coreScore: parseFloat(Math.min(Math.max(preResolutionScore, 0), 1.0).toFixed(4)),
    },
    signalVector: parseFloat((
      normResultFinal.signalVector * 0.70 + preResolutionScore * 0.30
    ).toFixed(4)),
  };

  // ── STEP 6: Resolve final decision (with gate-enforced action constraints) ─
  // If alignment gate locked, escalate minimum action from PASS to REBALANCE
  const gateConstrainedMode = gateResult.alignmentLocked
    ? 'CONTROLLED'
    : (inputs.systemMode ?? 'STABILIZE');

  const resolution = resolveFinalDecision(
    conflictReport,
    normResultWithDamp,
    {
      lastStableScore: state.lastStableScore ?? null,
      lastStableTier:  state.lastStableTier  ?? 'mid',
      systemMode:      gateConstrainedMode,
    }
  );

  // Enforce gate's permitted action (cannot use BOOST or PASS when locked)
  let finalAction = resolution.finalAction;
  if (gateResult.alignmentLocked) {
    if (finalAction === STABILITY_ACTION.PASS || finalAction === STABILITY_ACTION.SOFT_ADJUST) {
      finalAction = STABILITY_ACTION.REBALANCE;
    }
  }

  // ── Real-world authority override (final gate) ─────────────────────────
  let resolvedScore = resolution.finalRankingScore;
  let realWorldOverrideApplied = false;

  if (rwf && rwf.hasRealData && rwf.trustFactor >= 0.70) {
    const rwAdjusted = applyRealWorldCorrection(resolvedScore, rwf);
    if (rwAdjusted !== resolvedScore) {
      resolvedScore = rwAdjusted;
      realWorldOverrideApplied = true;
    }
  }

  // ── Derive control gates ──────────────────────────────────────────────
  const downstreamFrozen       = finalAction === STABILITY_ACTION.LOCK || finalAction === STABILITY_ACTION.HOLD;
  const serpFeedbackSuppressed = finalAction === STABILITY_ACTION.LOCK;
  // linkOptimizer boosts suppressed when gate is CONTROLLED or LOCK/HOLD
  const linkOptimizerFrozen    = finalAction === STABILITY_ACTION.LOCK ||
                                  finalAction === STABILITY_ACTION.HOLD ||
                                  gateResult.weightAdjustments?.linkOptimizerBoostSuppressed === true;

  return {
    stableFinalScore:          parseFloat(Math.min(Math.max(resolvedScore, 0), 1.0).toFixed(4)),
    stabilizedTier:            rawTierFromScore(resolvedScore),
    systemConsensusLevel:      normResultFinal.stabilityIndex,
    conflictDetected:          conflictReport.totalConflicts > 0,
    conflictSources:           conflictReport.conflicts.map(c => ({
      type:             c.conflictType,
      severity:         c.severity,
      affectedSystems:  c.affectedSystems,
    })),
    stabilityAction:           finalAction,
    adjustmentVector:          resolution.adjustmentVector,
    normalizedSignals:         normResultFinal.normalizedSignals,
    signalVector:              normResultFinal.signalVector,
    worstConflictSeverity:     conflictReport.worstSeverity,
    downstreamFrozen,
    serpFeedbackSuppressed,
    linkOptimizerFrozen,
    realWorldOverrideApplied,
    realWorldScore:            rwf?.realWorldScore ?? null,
    realWorldTrustFactor:      rwf?.trustFactor    ?? 0,
    // New control layer outputs
    confidenceState:           confidenceResult.confidenceState,
    confidenceWeight:          confidenceResult.confidenceWeight,
    uncertaintyPenalty:        confidenceResult.uncertaintyPenalty,
    alignmentGateMode:         gateResult.gateMode,
    alignmentLocked:           gateResult.alignmentLocked,
    boostDisabled:             gateResult.boostDisabled,
    stabilityOverride:         gateResult.stabilityOverride,
    dampedOverrideApplied:     dampedResult !== null,
    dampedScore:               dampedResult?.dampedScore ?? null,
    clampedByDelta:            dampedResult?.clampedByDelta ?? false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: buildSignalBundle
//
// Constructs the full signal bundle from an autonomousSeoCore RankingDecision.
// Call this in autonomousSeoCore after Stage 7 to pass to stabilizeDecision().
// ─────────────────────────────────────────────────────────────────────────────
export function buildSignalBundle(decision = {}, governorScore = null, alignmentScore = 1.0, systemMode = 'STABILIZE') {
  return {
    coreScore:      decision.finalRankingScore      ?? 0,
    governorScore:  governorScore                  ?? decision.finalRankingScore ?? 0,
    driftStatus:    decision.driftStatus            ?? DRIFT_STATUS.STABLE,
    trendScore:     decision.trendScore             ?? 0,
    decayFactor:    decision.decayFactor            ?? 1.0,
    recoveryFactor: decision.recoveryFactor         ?? 0,
    authorityBoost: decision.authorityBoost         ?? 1.0,
    alignmentScore: alignmentScore,
    intentStrength: decision.intentStrength         ?? 0.5,
    crawlPriority:  decision.crawlPriority          ?? 0.5,
    systemMode,
  };
}
