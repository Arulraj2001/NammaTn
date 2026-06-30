// src/lib/seo/selfImprovingSeoLoop.js
// ═══════════════════════════════════════════════════════════════════════════════
// SELF-IMPROVING SEO LOOP ENGINE
// Analyzes ranking performance patterns over time and dynamically adjusts
// the weight of all sub-systems to improve long-term SERP outcomes.
//
// This is the LEARNING LAYER — it does NOT execute ranking decisions.
// It produces weight adjustment recommendations that autonomousSeoCore
// reads at the start of each ISR cycle.
//
// Pattern detection:
//   CTR drop          → downweight queryIntentEngine (wrong intent targeting)
//   Ranking drop      → upweight authorityEngine (trust signals needed)
//   Impressions ↑ clicks ↓ → upweight contentEntropy (content mismatch)
//   Stable rankings   → stabilization mode (reduce noise, freeze weights)
//   Volatile rankings → increase driftController sensitivity
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Default subsystem weights (must match BLEND_WEIGHTS in autonomousSeoCore) ─
export const DEFAULT_SUBSYSTEM_WEIGHTS = {
  rankingOrchestrator: 0.40,
  serpFeedback:        0.20,
  decayRecovery:       0.20,
  queryIntentEngine:   0.10,
  authorityEngine:     0.10,
  contentEntropy:      0.00, // influence-only weight (affects content selection)
  linkOptimizer:       0.00, // influence-only weight (affects link budget)
};

// ── Weight bounds — no subsystem can be completely silenced or dominant ───────
export const WEIGHT_BOUNDS = {
  rankingOrchestrator: { min: 0.25, max: 0.55 },
  serpFeedback:        { min: 0.10, max: 0.30 },
  decayRecovery:       { min: 0.10, max: 0.30 },
  queryIntentEngine:   { min: 0.05, max: 0.20 },
  authorityEngine:     { min: 0.05, max: 0.20 },
  contentEntropy:      { min: 0.00, max: 0.15 },
  linkOptimizer:       { min: 0.00, max: 0.15 },
};

// ── System modes ──────────────────────────────────────────────────────────────
export const SYSTEM_MODES = {
  STABILIZE: 'STABILIZE', // Stable rankings — freeze weights, reduce noise
  OPTIMIZE:  'OPTIMIZE',  // Good signals — fine-tune for marginal gains
  BOOST:     'BOOST',     // Rising signals — amplify winning patterns
  RECOVER:   'RECOVER',   // Declining signals — shift weight to recovery systems
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: computeWeightAdjustments
//
// Analyzes fleet-level performance signals and computes weight deltas.
//
// @param {object} performanceSnapshot
// @param {number}  performanceSnapshot.avgAlignmentScore    – 0.0–1.0 from serpAlignmentMonitor
// @param {number}  performanceSnapshot.avgCTRRatio          – observed/expected CTR ratio fleet avg
// @param {number}  performanceSnapshot.avgRankingScore      – current fleet avg finalRankingScore
// @param {number}  performanceSnapshot.prevRankingScore     – previous cycle avg score (null = first)
// @param {number}  performanceSnapshot.suppressRatio        – fraction of pages suppressed
// @param {number}  performanceSnapshot.eliteRatio           – fraction of pages elite
// @param {number}  performanceSnapshot.globalHealthScore    – from globalSeoGovernor
// @param {string}  performanceSnapshot.distributionStatus   – 'HEALTHY'|'DEGRADED'|'CRITICAL'
// @param {object}  currentWeights                           – current subsystem weights
//
// @returns {{
//   subsystemWeightAdjustments: object,
//   systemMode:                 string,
//   adjustmentReasons:          string[],
//   stabilityIndex:             number,  // 0.0–1.0 (1.0 = fully stable)
//   nextWeights:                object,
// }}
// ─────────────────────────────────────────────────────────────────────────────
export function computeWeightAdjustments(performanceSnapshot = {}, currentWeights = null) {
  const {
    avgAlignmentScore  = 0.6,
    avgCTRRatio        = 1.0,
    avgRankingScore    = 0.5,
    prevRankingScore   = null,
    suppressRatio      = 0.1,
    eliteRatio         = 0.08,
    globalHealthScore  = 0.6,
    distributionStatus = 'HEALTHY',
  } = performanceSnapshot;

  const weights = { ...(currentWeights || DEFAULT_SUBSYSTEM_WEIGHTS) };
  const reasons = [];
  const deltas  = {};

  // ── 1. Detect system mode ─────────────────────────────────────────────────
  const rankingDelta = prevRankingScore !== null ? (avgRankingScore - prevRankingScore) : 0;
  const isStable     = Math.abs(rankingDelta) < 0.02 && avgAlignmentScore >= 0.65;
  const isDecaying   = rankingDelta < -0.05 || suppressRatio > 0.35;
  const isRising     = rankingDelta >  0.04 && avgCTRRatio >= 1.0;
  const isOptimizing = !isStable && !isDecaying && !isRising;

  let systemMode;
  if      (isStable)     systemMode = SYSTEM_MODES.STABILIZE;
  else if (isDecaying)   systemMode = SYSTEM_MODES.RECOVER;
  else if (isRising)     systemMode = SYSTEM_MODES.BOOST;
  else                   systemMode = SYSTEM_MODES.OPTIMIZE;

  // ── 2. STABILIZE mode — freeze weights, minimal adjustments ──────────────
  if (systemMode === SYSTEM_MODES.STABILIZE) {
    reasons.push('Rankings stable — holding weight configuration');
    const stabilityIndex = parseFloat(Math.min(avgAlignmentScore + 0.1, 1.0).toFixed(4));
    return _buildOutput(weights, weights, {}, systemMode, reasons, stabilityIndex);
  }

  // ── 3. CTR drop → queryIntentEngine underperforming ──────────────────────
  if (avgCTRRatio < 0.65) {
    deltas.queryIntentEngine = -0.02;
    deltas.contentEntropy    = +0.03; // content mismatch — boost entropy variation
    reasons.push(`CTR ratio ${avgCTRRatio.toFixed(2)} < 0.65 → reduce intent weight, lift content entropy`);
  } else if (avgCTRRatio > 1.30) {
    deltas.queryIntentEngine = +0.02;
    reasons.push(`CTR ratio ${avgCTRRatio.toFixed(2)} > 1.30 → intent targeting working, increase weight`);
  }

  // ── 4. Ranking drop → authorityEngine needs more weight ──────────────────
  if (rankingDelta < -0.05) {
    deltas.authorityEngine   = +0.03;
    deltas.decayRecovery     = +0.02;
    deltas.rankingOrchestrator = -0.03;
    reasons.push(`Ranking drop ${rankingDelta.toFixed(3)} → boost authority + decay recovery`);
  }

  // ── 5. Impressions rising but clicks not following → content mismatch ─────
  if (avgAlignmentScore < 0.45 && avgCTRRatio < 0.80) {
    deltas.contentEntropy  = +0.04;
    deltas.serpFeedback    = +0.02;
    reasons.push('Alignment low + CTR gap → increase contentEntropy + serpFeedback weight');
  }

  // ── 6. Too many suppressed pages → recovery systems need more weight ──────
  if (suppressRatio > 0.30) {
    deltas.decayRecovery = (deltas.decayRecovery || 0) + 0.03;
    deltas.linkOptimizer = +0.02;
    reasons.push(`Suppress ratio ${suppressRatio.toFixed(2)} → boost recovery + link flow`);
  }

  // ── 7. BOOST mode — amplify winning signals ───────────────────────────────
  if (systemMode === SYSTEM_MODES.BOOST) {
    deltas.serpFeedback          = (deltas.serpFeedback || 0) + 0.02;
    deltas.rankingOrchestrator   = (deltas.rankingOrchestrator || 0) + 0.01;
    reasons.push('Rising mode — amplifying serpFeedback + orchestrator');
  }

  // ── 8. RECOVER mode — shift budget to stabilizing systems ────────────────
  if (systemMode === SYSTEM_MODES.RECOVER) {
    deltas.decayRecovery         = (deltas.decayRecovery || 0) + 0.02;
    deltas.authorityEngine       = (deltas.authorityEngine || 0) + 0.02;
    deltas.serpFeedback          = (deltas.serpFeedback || 0) - 0.02;
    reasons.push('Recovery mode — shift weight to authority + decay recovery');
  }

  // ── 9. Apply deltas with bounds clamping ──────────────────────────────────
  const nextWeights = _applyDeltas(weights, deltas);

  // ── 10. Stability index ───────────────────────────────────────────────────
  const totalDeltaMag = Object.values(deltas).reduce((s, d) => s + Math.abs(d || 0), 0);
  const stabilityIndex = parseFloat(Math.max(1 - totalDeltaMag * 3, 0).toFixed(4));

  return _buildOutput(weights, nextWeights, deltas, systemMode, reasons, stabilityIndex);
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY: applyWeightAdjustments
//
// Merges next weights back into the blend weight config.
// Call this at the start of autonomousSeoCore before pipeline execution.
// ─────────────────────────────────────────────────────────────────────────────
export function applyWeightAdjustments(nextWeights) {
  // Re-normalise the 5 core blend weights (sum must = 1.0)
  const CORE_KEYS = ['rankingOrchestrator', 'serpFeedback', 'decayRecovery', 'queryIntentEngine', 'authorityEngine'];
  const coreSum   = CORE_KEYS.reduce((s, k) => s + (nextWeights[k] || 0), 0);

  const normalized = {};
  CORE_KEYS.forEach(k => {
    normalized[k] = coreSum > 0
      ? parseFloat((nextWeights[k] / coreSum).toFixed(4))
      : DEFAULT_SUBSYSTEM_WEIGHTS[k];
  });

  // Influence-only weights don't participate in sum normalization
  normalized.contentEntropy = nextWeights.contentEntropy ?? 0;
  normalized.linkOptimizer  = nextWeights.linkOptimizer  ?? 0;

  return normalized;
}

// ─────────────────────────────────────────────────────────────────────────────
// DERIVE: derivePerformanceSnapshot
//
// Convenience function that derives a performanceSnapshot from a fleet of
// autonomousSeoCore decisions + serpAlignmentMonitor results.
// ─────────────────────────────────────────────────────────────────────────────
export function derivePerformanceSnapshot(fleetDecisions = [], alignmentResults = [], governorOutput = {}) {
  const n = fleetDecisions.length || 1;

  const avgRankingScore = fleetDecisions.reduce((s, d) => s + (d.finalRankingScore || 0), 0) / n;
  const suppressRatio   = fleetDecisions.filter(d => d.action === 'SUPPRESS').length / n;
  const eliteRatio      = fleetDecisions.filter(d => d.normalizedTier === 'elite').length / n;

  const avgAlignmentScore = alignmentResults.length > 0
    ? alignmentResults.reduce((s, r) => s + (r.alignmentScore || 0), 0) / alignmentResults.length
    : 0.6;

  const avgCTRRatio = alignmentResults.length > 0
    ? alignmentResults.reduce((s, r) => s + (r.signals?.ctrAlignmentRatio || 1.0), 0) / alignmentResults.length
    : 1.0;

  return {
    avgAlignmentScore:  parseFloat(avgAlignmentScore.toFixed(4)),
    avgCTRRatio:        parseFloat(avgCTRRatio.toFixed(4)),
    avgRankingScore:    parseFloat(avgRankingScore.toFixed(4)),
    prevRankingScore:   null, // caller must supply from persistent store
    suppressRatio:      parseFloat(suppressRatio.toFixed(4)),
    eliteRatio:         parseFloat(eliteRatio.toFixed(4)),
    globalHealthScore:  governorOutput.globalHealthScore || 0.6,
    distributionStatus: governorOutput.systemStatus || 'HEALTHY',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL helpers
// ─────────────────────────────────────────────────────────────────────────────
function _applyDeltas(weights, deltas) {
  const next = { ...weights };
  Object.entries(deltas).forEach(([key, delta]) => {
    if (key in next) {
      const bounds = WEIGHT_BOUNDS[key];
      next[key] = parseFloat(
        Math.min(Math.max(next[key] + delta, bounds.min), bounds.max).toFixed(4)
      );
    }
  });
  return next;
}

function _buildOutput(currentWeights, nextWeights, deltas, systemMode, reasons, stabilityIndex) {
  const adjustments = {};
  Object.keys(nextWeights).forEach(k => {
    adjustments[k] = parseFloat(((nextWeights[k] || 0) - (currentWeights[k] || 0)).toFixed(4));
  });

  return {
    subsystemWeightAdjustments: adjustments,
    systemMode,
    adjustmentReasons: reasons,
    stabilityIndex,
    currentWeights,
    nextWeights,
  };
}
