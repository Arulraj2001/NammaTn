// src/lib/seo/serpFeedbackLoop.js
// SERP Feedback Loop.
// Processes simulated or real Google Search Console (GSC) signals and converts
// them into ranking adjustment recommendations that the autonomousSeoCore applies.
//
// In production: connect real GSC API data here.
// In current state: uses report-velocity as a CTR/impression proxy.
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.

// ── CTR model ─────────────────────────────────────────────────────────────────
// Expected CTR by SERP position (approximation based on industry data).
// Used to estimate whether a page's actual engagement matches its rank.
const EXPECTED_CTR_BY_POSITION = {
  1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.06,
  6: 0.05, 7: 0.04, 8: 0.03, 9: 0.025, 10: 0.02,
  11: 0.015, 20: 0.01, 30: 0.005, 50: 0.002,
};

function getExpectedCTR(position) {
  if (position <= 0)  return 0;
  if (position >= 50) return EXPECTED_CTR_BY_POSITION[50];
  // Find nearest bracket
  const keys = Object.keys(EXPECTED_CTR_BY_POSITION).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (position >= keys[i]) {
      return EXPECTED_CTR_BY_POSITION[keys[i]];
    }
  }
  return 0.01;
}

// ── Impression signal ─────────────────────────────────────────────────────────
// Simulates impressions from report volume + city tier proxy.
// Replace with real GSC data when available.
function estimateImpressionScore(reportCount = 0, cityTierFactor = 0.5) {
  const logNorm = Math.min(Math.log1p(reportCount) / Math.log1p(50), 1.0);
  return parseFloat((logNorm * 0.7 + cityTierFactor * 0.3).toFixed(4));
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * @param {object} params
 * @param {number}      params.currentRankingScore  – live composite score (0.0–1.0)
 * @param {number}      params.estimatedPosition    – simulated SERP position (1–50+)
 * @param {number}      params.reportCount          – proxy for impressions/engagement
 * @param {number}      params.cityTierFactor       – 0.35 | 0.65 | 1.0
 * @param {number|null} params.actualCTR            – real CTR from GSC, null = estimated
 * @param {number|null} params.impressions          – real impressions from GSC, null = estimated
 *
 * @returns {{
 *   impressionScore:    number,   // 0.0–1.0
 *   estimatedCTR:       number,   // 0.0–1.0
 *   ctrDelta:           number,   // actual CTR - expected CTR
 *   ctrSignal:          'above_expected'|'at_expected'|'below_expected',
 *   feedbackScore:      number,   // 0.0–1.0 adjustment signal
 *   rankingAdjustment:  number,   // ±0.0–0.15 added to/subtracted from composite score
 *   recommendation:     'BOOST'|'HOLD'|'SUPPRESS',
 * }}
 */
export function computeSerpFeedback({
  currentRankingScore = 0,
  estimatedPosition   = 20,
  reportCount         = 0,
  cityTierFactor      = 0.5,
  actualCTR           = null,
  impressions         = null,
} = {}) {

  const impressionScore = impressions !== null
    ? Math.min(impressions / 1000, 1.0) // Normalise raw impressions (1000 = full score)
    : estimateImpressionScore(reportCount, cityTierFactor);

  const expectedCTR = getExpectedCTR(estimatedPosition);
  const estimatedCTR = actualCTR !== null
    ? actualCTR
    : impressionScore * 0.12; // CTR proxy: engagement fraction of impression score

  const ctrDelta = parseFloat((estimatedCTR - expectedCTR).toFixed(4));

  let ctrSignal;
  if      (ctrDelta >  0.02) ctrSignal = 'above_expected';
  else if (ctrDelta < -0.02) ctrSignal = 'below_expected';
  else                       ctrSignal = 'at_expected';

  // Feedback score: blends impression strength + CTR alignment
  const ctrNorm     = Math.min(Math.max(estimatedCTR / 0.28, 0), 1.0); // 0.28 = P1 CTR ceiling
  const feedbackScore = parseFloat((0.6 * impressionScore + 0.4 * ctrNorm).toFixed(4));

  // Ranking adjustment: CTR above expected → positive boost; below → suppress
  const rawAdj = ctrDelta * 0.5; // Scale: max delta ~0.28 → max adj ~0.14
  const rankingAdjustment = parseFloat(
    Math.min(Math.max(rawAdj, -0.15), +0.15).toFixed(4)
  );

  let recommendation;
  if      (rankingAdjustment >  0.04) recommendation = 'BOOST';
  else if (rankingAdjustment < -0.04) recommendation = 'SUPPRESS';
  else                                recommendation = 'HOLD';

  return {
    impressionScore,
    estimatedCTR:   parseFloat(estimatedCTR.toFixed(4)),
    ctrDelta,
    ctrSignal,
    feedbackScore,
    rankingAdjustment,
    recommendation,
  };
}

// ── Estimated SERP position from score ───────────────────────────────────────
/**
 * Converts a finalRankingScore (0.0–1.0) into a simulated SERP position (1–50).
 * Used when real GSC position data is unavailable.
 * Non-linear: high scores map exponentially to low positions.
 */
export function estimatePosition(finalRankingScore = 0) {
  if (finalRankingScore <= 0) return 50;
  // Inverse log: score 1.0 → position 1, score 0.1 → position 44
  const pos = Math.round(1 + (1 - finalRankingScore) ** 2.5 * 49);
  return Math.min(Math.max(pos, 1), 50);
}
