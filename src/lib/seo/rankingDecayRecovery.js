// src/lib/seo/rankingDecayRecovery.js
// Ranking Decay & Recovery System.
// Models score decay over time (pages lose ranking power as content ages and
// report volume falls) and computes a recovery factor when signals improve.
//
// Decay is logarithmic — aggressive early, plateaus after ~30 days.
// Recovery is sigmoid — gradual onset, then rapid gain, then plateau.
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.

// ── Decay model ───────────────────────────────────────────────────────────────
// Half-life: 14 days. After 14 days without activity, score decays to ~50%.
const DECAY_HALF_LIFE_DAYS = 14;
const DECAY_FLOOR          = 0.15; // Never decay below 15% of original score

/**
 * Computes how much of the original ranking score remains after N days of inactivity.
 * Uses exponential decay: factor = e^(-λt) clamped to DECAY_FLOOR.
 *
 * @param {number} daysSinceActivity – days since last report/signal
 * @returns {number} decayFactor (0.0–1.0): multiply rankingScore by this
 */
export function computeDecayFactor(daysSinceActivity = 0) {
  if (daysSinceActivity <= 0) return 1.0;

  const lambda = Math.LN2 / DECAY_HALF_LIFE_DAYS; // ln(2) / half-life
  const raw    = Math.exp(-lambda * daysSinceActivity);
  return parseFloat(Math.max(raw, DECAY_FLOOR).toFixed(4));
}

// ── Recovery model ────────────────────────────────────────────────────────────
// Recovery follows a sigmoid curve: slow start, rapid mid-recovery, plateau.
// Full recovery takes ~21 days of sustained positive signal.

const RECOVERY_MIDPOINT_DAYS = 10; // Days at which recovery is at 50%
const RECOVERY_STEEPNESS     = 0.4; // Controls slope of the sigmoid

/**
 * Computes recovery strength based on how long positive signals have been sustained.
 *
 * @param {number} daysSinceRecoveryStart – days since positive signal resumed
 * @param {number} recoveryReportCount    – new reports in the recovery window
 * @returns {number} recoveryFactor (0.0–1.0): added on top of decayFactor
 */
export function computeRecoveryFactor(daysSinceRecoveryStart = 0, recoveryReportCount = 0) {
  if (daysSinceRecoveryStart <= 0 && recoveryReportCount === 0) return 0.0;

  // Sigmoid: 1 / (1 + e^(-k(t - t_mid)))
  const timeSig = 1 / (1 + Math.exp(-RECOVERY_STEEPNESS * (daysSinceRecoveryStart - RECOVERY_MIDPOINT_DAYS)));

  // Report signal: log-normalised contribution
  const reportSig = Math.min(Math.log1p(recoveryReportCount) / Math.log1p(20), 1.0);

  // Blend: 60% time-driven, 40% report-driven
  const raw = 0.6 * timeSig + 0.4 * reportSig;
  return parseFloat(Math.min(raw, 1.0).toFixed(4));
}

// ── Effective score after decay + recovery ────────────────────────────────────
/**
 * Applies decay and recovery to a base ranking score.
 *
 * @param {number} baseScore          – raw composite score (0.0–1.0)
 * @param {number} decayFactor        – from computeDecayFactor()
 * @param {number} recoveryFactor     – from computeRecoveryFactor()
 * @returns {number} effectiveScore (0.0–1.0)
 */
export function applyDecayRecovery(baseScore, decayFactor, recoveryFactor) {
  // Decay reduces the score; recovery adds back a fraction of the lost potential
  const decayed   = baseScore * decayFactor;
  const recovered = (baseScore - decayed) * recoveryFactor;
  return parseFloat(Math.min(decayed + recovered, 1.0).toFixed(4));
}

// ── Full evaluation ───────────────────────────────────────────────────────────
/**
 * Single-call decay/recovery evaluation for a page.
 *
 * @param {object} params
 * @param {number}      params.baseScore
 * @param {string|null} params.latestActivityDate    – ISO date, null = unknown
 * @param {string|null} params.recoveryStartDate     – ISO date positive signals resumed, null = no recovery
 * @param {number}      params.recentReportCount     – reports in recovery window
 * @returns {{
 *   decayFactor:    number,
 *   recoveryFactor: number,
 *   effectiveScore: number,
 *   daysSinceActivity: number,
 *   healthStatus:   'healthy'|'decaying'|'recovering'|'critical'
 * }}
 */
export function evaluateDecayRecovery({
  baseScore            = 0,
  latestActivityDate   = null,
  recoveryStartDate    = null,
  recentReportCount    = 0,
} = {}) {
  const now          = Date.now();
  const msPerDay     = 86_400_000;

  // Days since last positive activity
  const daysSinceActivity = latestActivityDate
    ? Math.max((now - new Date(latestActivityDate).getTime()) / msPerDay, 0)
    : 60; // Default: 60 days (strong decay) if unknown

  // Days into recovery window
  const daysSinceRecovery = recoveryStartDate
    ? Math.max((now - new Date(recoveryStartDate).getTime()) / msPerDay, 0)
    : 0;

  const decayFactor    = computeDecayFactor(daysSinceActivity);
  const recoveryFactor = computeRecoveryFactor(daysSinceRecovery, recentReportCount);
  const effectiveScore = applyDecayRecovery(baseScore, decayFactor, recoveryFactor);

  // Health status
  let healthStatus;
  if (decayFactor >= 0.85 && recoveryFactor < 0.1)    healthStatus = 'healthy';
  else if (recoveryFactor >= 0.4)                      healthStatus = 'recovering';
  else if (decayFactor < 0.4)                          healthStatus = 'critical';
  else                                                 healthStatus = 'decaying';

  return {
    decayFactor:       parseFloat(decayFactor.toFixed(4)),
    recoveryFactor:    parseFloat(recoveryFactor.toFixed(4)),
    effectiveScore:    parseFloat(effectiveScore.toFixed(4)),
    daysSinceActivity: parseFloat(daysSinceActivity.toFixed(1)),
    healthStatus,
  };
}
