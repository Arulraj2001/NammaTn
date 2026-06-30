// src/lib/seo/globalSeoGovernor.js
// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SEO GOVERNOR
// Master control system that operates ABOVE the autonomous core.
// Monitors all pages collectively, enforces system-wide ranking distribution,
// prevents imbalance, and produces corrective actions per page.
//
// Responsibilities:
//   1. Ingest fleet decisions from autonomousSeoCore
//   2. Measure global health and tier distribution
//   3. Detect system bias (too many elite / too many suppressed)
//   4. Emit per-page correction actions to rebalance
//   5. normalizeGlobalRankingSystem() enforces tier quotas
//
// ISR-safe — pure computation, no DB calls, no Math.random()
// ═══════════════════════════════════════════════════════════════════════════════

import { stabilizeDecision, buildSignalBundle, STABILITY_ACTION } from '@/lib/seo/systemStabilityController';

// ── Target tier distribution (Google expects a natural Pareto distribution) ───
const TARGET_DISTRIBUTION = {
  elite:   { min: 0.05, max: 0.12 }, // 5–12% of pages
  top:     { min: 0.18, max: 0.28 }, // 18–28%
  mid:     { min: 0.38, max: 0.52 }, // 38–52%
  low:     { min: 0.10, max: 0.25 }, // 10–25%
  dormant: { min: 0.00, max: 0.20 }, // up to 20%
};

const TIER_ORDER      = ['elite', 'top', 'mid', 'low', 'dormant'];
const TIER_SCORE_MID  = { elite: 0.88, top: 0.73, mid: 0.52, low: 0.32, dormant: 0.12 };

// ── Global health thresholds ──────────────────────────────────────────────────
const HEALTH_THRESHOLDS = {
  HEALTHY:  0.72,
  DEGRADED: 0.45,
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE: evaluateGlobalHealth
//
// @param {RankingDecision[]} fleetDecisions – array of per-page decisions
// @returns {GlobalGovernorOutput}
// ─────────────────────────────────────────────────────────────────────────────
export function evaluateGlobalHealth(fleetDecisions = []) {
  if (fleetDecisions.length === 0) {
    return _emptyGovernorOutput();
  }

  const total = fleetDecisions.length;

  // ── 1. Tier distribution count ────────────────────────────────────────────
  const tierCounts = { elite: 0, top: 0, mid: 0, low: 0, dormant: 0 };
  fleetDecisions.forEach(d => {
    const tier = d.normalizedTier || 'dormant';
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
  });

  const tierRatios = {};
  TIER_ORDER.forEach(t => { tierRatios[t] = parseFloat((tierCounts[t] / total).toFixed(4)); });

  // ── 2. Distribution balance score (0 = worst, 1 = perfect) ───────────────
  // Each tier contributes a penalty for exceeding its target band.
  let balancePenalty = 0;
  TIER_ORDER.forEach(tier => {
    const ratio  = tierRatios[tier];
    const target = TARGET_DISTRIBUTION[tier];
    if (ratio < target.min) balancePenalty += (target.min - ratio);
    if (ratio > target.max) balancePenalty += (ratio - target.max);
  });
  const rankingDistributionBalance = parseFloat(Math.max(1 - balancePenalty * 2, 0).toFixed(4));

  // ── 3. Global health score (composite) ───────────────────────────────────
  const avgScore = fleetDecisions.reduce((s, d) => s + (d.finalRankingScore || 0), 0) / total;
  const boostRatio    = fleetDecisions.filter(d => d.action === 'BOOST').length    / total;
  const suppressRatio = fleetDecisions.filter(d => d.action === 'SUPPRESS').length / total;

  // Health degrades with excess suppression and improves with balanced distribution
  const globalHealthScore = parseFloat(Math.min(
    0.4 * avgScore               +
    0.35 * rankingDistributionBalance +
    0.15 * boostRatio            +
    0.10 * (1 - suppressRatio),
    1.0
  ).toFixed(4));

  // ── 4. Identify over/under performing pages ───────────────────────────────
  // Over-performing: elite pages that have been elite for too long without decay signal
  const overPerformingPages = fleetDecisions
    .filter(d => d.normalizedTier === 'elite' && d.decayFactor > 0.92 && d.trendScore < 0.3)
    .map(d => ({ pageSlug: d.pageSlug, score: d.finalRankingScore, reason: 'stale_elite' }));

  // Under-performing: suppressed pages with non-zero authority or intent
  const underPerformingPages = fleetDecisions
    .filter(d => d.action === 'SUPPRESS' && (d.intentStrength > 0.4 || d.authorityBoost > 1.0))
    .map(d => ({ pageSlug: d.pageSlug, score: d.finalRankingScore, reason: 'suppressed_with_potential' }));

  // ── 5. Bias detection ─────────────────────────────────────────────────────
  const biasFlags = [];
  if (tierRatios.elite > TARGET_DISTRIBUTION.elite.max)   biasFlags.push('ELITE_INFLATION');
  if (tierRatios.dormant > TARGET_DISTRIBUTION.dormant.max) biasFlags.push('DORMANT_EXCESS');
  if (suppressRatio > 0.35)                               biasFlags.push('SUPPRESS_LOCK');
  if (boostRatio > 0.40)                                  biasFlags.push('BOOST_SATURATION');
  if (rankingDistributionBalance < 0.55)                  biasFlags.push('DISTRIBUTION_SKEW');
  const systemBiasDetected = biasFlags.length > 0;

  // ── 6. Correction actions ──────────────────────────────────────────────────
  const correctionActions = _buildCorrectionActions(biasFlags, tierRatios, overPerformingPages, underPerformingPages);

  return {
    globalHealthScore,
    rankingDistributionBalance,
    tierCounts,
    tierRatios,
    overPerformingPages,
    underPerformingPages,
    systemBiasDetected,
    biasFlags,
    correctionActions,
    systemStatus:
      globalHealthScore >= HEALTH_THRESHOLDS.HEALTHY  ? 'HEALTHY' :
      globalHealthScore >= HEALTH_THRESHOLDS.DEGRADED ? 'DEGRADED' : 'CRITICAL',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE: normalizeGlobalRankingSystem
//
// Enforces target tier distribution across the fleet by adjusting scores.
// Pages in over-represented tiers get slightly dampened.
// Pages in under-represented tiers get slightly lifted.
// Produces adjusted scores and a tier map.
//
// @param {RankingDecision[]} fleetDecisions
// @returns {{ normalizedScores, adjustedTierMap, systemBalanceFactor }}
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeGlobalRankingSystem(fleetDecisions = []) {
  if (fleetDecisions.length === 0) {
    return { normalizedScores: [], adjustedTierMap: {}, systemBalanceFactor: 1.0 };
  }

  const total     = fleetDecisions.length;
  const tierCounts = { elite: 0, top: 0, mid: 0, low: 0, dormant: 0 };
  fleetDecisions.forEach(d => { tierCounts[d.normalizedTier || 'dormant']++; });

  // Compute per-tier adjustment multipliers
  const tierMultipliers = {};
  TIER_ORDER.forEach(tier => {
    const ratio  = tierCounts[tier] / total;
    const target = TARGET_DISTRIBUTION[tier];
    const mid    = (target.min + target.max) / 2;

    if (ratio > target.max) {
      // Over-represented → dampen scores in this tier
      const excess = (ratio - target.max) / (target.max - target.min + 0.01);
      tierMultipliers[tier] = Math.max(1 - excess * 0.15, 0.82); // max 18% reduction
    } else if (ratio < target.min && tier !== 'dormant') {
      // Under-represented → lift scores in this tier
      const deficit = (target.min - ratio) / (target.min - target.max + 0.01);
      tierMultipliers[tier] = Math.min(1 + Math.abs(deficit) * 0.12, 1.18); // max 18% boost
    } else {
      tierMultipliers[tier] = 1.0; // within band → no adjustment
    }
  });

  // Apply multipliers to produce normalizedScores
  const normalizedScores = fleetDecisions.map(d => {
    const tier       = d.normalizedTier || 'dormant';
    const multiplier = tierMultipliers[tier] || 1.0;
    const adjusted   = parseFloat(Math.min((d.finalRankingScore || 0) * multiplier, 1.0).toFixed(4));

    return {
      pageSlug:       d.pageSlug,
      originalScore:  d.finalRankingScore,
      normalizedScore: adjusted,
      multiplier,
      tier,
    };
  });

  // Build slug → adjusted score map
  const adjustedTierMap = {};
  normalizedScores.forEach(ns => { adjustedTierMap[ns.pageSlug] = ns; });

  // System balance factor: how far average multiplier is from 1.0
  const avgMultiplier = normalizedScores.reduce((s, n) => s + n.multiplier, 0) / normalizedScores.length;
  const systemBalanceFactor = parseFloat(avgMultiplier.toFixed(4));

  return { normalizedScores, adjustedTierMap, systemBalanceFactor };
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PROPOSE: proposeGovernorCorrection
//
// Generates an advisory governor-level correction proposal for a single page.
// Purely advisory — does not mutate the decision object or run stability logic.
// The actual correction is resolved via correctionQueue.js.
//
// @param {RankingDecision} decision
// @param {object}          adjustedTierMap – from normalizeGlobalRankingSystem
// @param {object}          governorOutput  – from evaluateGlobalHealth
// @returns {object} advisory correction proposal
// ─────────────────────────────────────────────────────────────────────────────
export function proposeGovernorCorrection(decision, adjustedTierMap = {}, governorOutput = {}) {
  const entry = adjustedTierMap[decision.pageSlug];
  if (!entry) {
    return {
      correctionApplied: false,
      correctedScore: decision.finalRankingScore,
      multiplier: 1.0,
      action: decision.action,
      requiresRecalibration: false,
    };
  }

  const newScore   = entry.normalizedScore;
  const multiplier = entry.multiplier;

  // Re-derive action from corrected score
  let action = decision.action;
  if (newScore >= 0.62 && action !== 'BOOST')     action = 'BOOST';
  if (newScore <= 0.28 && action !== 'SUPPRESS')  action = 'SUPPRESS';
  if (newScore > 0.28 && newScore < 0.62)         action = 'STABLE';

  // Governor override: no page can be permanently suppressed if it has potential
  const isUnderperforming = (governorOutput.underPerformingPages || [])
    .some(p => p.pageSlug === decision.pageSlug);
  if (isUnderperforming && action === 'SUPPRESS') {
    action = 'STABLE'; // lift suppression lock
  }

  // Governor override: stale elite pages get recalibration flag
  const isOverperforming = (governorOutput.overPerformingPages || [])
    .some(p => p.pageSlug === decision.pageSlug);
  const requiresRecalibration = isOverperforming;

  return {
    correctionApplied: true,
    correctedScore:    newScore,
    multiplier,
    action,
    requiresRecalibration,
    correctionReason:  isUnderperforming ? 'lift_suppression' : 'tier_rebalance',
  };
}

// ── Deprecated: applyGovernorCorrection (kept for backward compatibility wrapper)
export function applyGovernorCorrection(decision, adjustedTierMap = {}, governorOutput = {}) {
  const proposal = proposeGovernorCorrection(decision, adjustedTierMap, governorOutput);
  if (!proposal.correctionApplied) return decision;

  return {
    ...decision,
    finalRankingScore: proposal.correctedScore,
    action: proposal.action,
    governorApplied: true,
    requiresRecalibration: proposal.requiresRecalibration,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL helpers
// ─────────────────────────────────────────────────────────────────────────────
function _buildCorrectionActions(biasFlags, tierRatios, over, under) {
  const actions = [];

  if (biasFlags.includes('ELITE_INFLATION')) {
    actions.push({
      type:        'DAMPEN_ELITE',
      description: `${over.length} stale elite pages scheduled for recalibration`,
      targets:     over.map(p => p.pageSlug),
      severity:    'medium',
    });
  }

  if (biasFlags.includes('SUPPRESS_LOCK')) {
    actions.push({
      type:        'LIFT_SUPPRESSION',
      description: `${under.length} suppressed pages with untapped potential — lifting to STABLE`,
      targets:     under.map(p => p.pageSlug),
      severity:    'high',
    });
  }

  if (biasFlags.includes('DISTRIBUTION_SKEW')) {
    actions.push({
      type:        'REBALANCE_TIERS',
      description: 'Tier distribution outside target bands — applying normalization multipliers',
      tierRatios,
      severity:    'medium',
    });
  }

  if (biasFlags.includes('BOOST_SATURATION')) {
    actions.push({
      type:        'COOL_DOWN_BOOST',
      description: 'Too many pages in BOOST — dampening to prevent signal dilution',
      severity:    'low',
    });
  }

  return actions;
}

function _emptyGovernorOutput() {
  return {
    globalHealthScore:          0.5,
    rankingDistributionBalance: 1.0,
    tierCounts:                 { elite: 0, top: 0, mid: 0, low: 0, dormant: 0 },
    tierRatios:                 { elite: 0, top: 0, mid: 0, low: 0, dormant: 0 },
    overPerformingPages:        [],
    underPerformingPages:       [],
    systemBiasDetected:         false,
    biasFlags:                  [],
    correctionActions:          [],
    systemStatus:               'HEALTHY',
  };
}
