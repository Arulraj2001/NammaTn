// src/lib/seo/serpAlignmentMonitor.js
// ═══════════════════════════════════════════════════════════════════════════════
// SERP ALIGNMENT MONITOR
// Compares internal ranking scores against external SERP behavior.
// Detects mismatches between what the ranking engine thinks vs what Google shows.
// GSC-ready: accepts real data when available, proxies otherwise.
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Position → expected internal score mapping ────────────────────────────────
// If Google ranks a page at position X, we expect its internal score to be ≥ Y.
const POSITION_SCORE_FLOOR = [
  { maxPosition: 3,  minExpectedScore: 0.75 },
  { maxPosition: 10, minExpectedScore: 0.55 },
  { maxPosition: 20, minExpectedScore: 0.40 },
  { maxPosition: 30, minExpectedScore: 0.28 },
  { maxPosition: 50, minExpectedScore: 0.15 },
];

function getExpectedScoreFloor(position) {
  for (const band of POSITION_SCORE_FLOOR) {
    if (position <= band.maxPosition) return band.minExpectedScore;
  }
  return 0.10;
}

// ── CTR alignment model ───────────────────────────────────────────────────────
// Expected CTR by position (industry proxy)
const CTR_CURVE = [
  { position: 1,  ctr: 0.280 }, { position: 2,  ctr: 0.150 },
  { position: 3,  ctr: 0.110 }, { position: 5,  ctr: 0.060 },
  { position: 10, ctr: 0.020 }, { position: 20, ctr: 0.010 },
  { position: 30, ctr: 0.005 }, { position: 50, ctr: 0.002 },
];

function getExpectedCTR(position) {
  if (position <= 0)  return 0;
  if (position >= 50) return 0.002;
  for (let i = CTR_CURVE.length - 1; i >= 0; i--) {
    if (position >= CTR_CURVE[i].position) return CTR_CURVE[i].ctr;
  }
  return 0.002;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: evaluateAlignment
//
// Compares one page's internal score against SERP behavior.
//
// @param {object} params
// @param {number}      params.internalScore    – 0.0–1.0 from autonomousSeoCore
// @param {number|null} params.actualPosition   – GSC position (null = simulated)
// @param {number|null} params.actualCTR        – GSC CTR (null = simulated)
// @param {number|null} params.actualImpressions– GSC impressions (null = simulated)
// @param {number}      params.reportCount      – community report proxy
// @param {string}      params.normalizedTier   – current tier label
//
// @returns {{
//   alignmentScore:   number,   // 0.0–1.0 (1.0 = perfect alignment)
//   mismatchDetected: boolean,
//   mismatchType:     string|null,
//   correctionFactor: number,   // multiply internalScore by this to re-align
//   correctionAction: 'RECALIBRATE_UP'|'RECALIBRATE_DOWN'|'HOLD',
//   signals:          object,   // raw comparison data
// }}
// ─────────────────────────────────────────────────────────────────────────────
export function evaluateAlignment({
  internalScore     = 0,
  actualPosition    = null,
  actualCTR         = null,
  actualImpressions = null,
  reportCount       = 0,
  normalizedTier    = 'mid',
} = {}) {

  // ── Simulate position from internal score if GSC not available ────────────
  const position = actualPosition !== null
    ? actualPosition
    : _simulatePosition(internalScore);

  // ── Score floor: what Google's position implies the score should be ───────
  const expectedFloor = getExpectedScoreFloor(position);

  // ── CTR alignment ─────────────────────────────────────────────────────────
  const expectedCTR = getExpectedCTR(position);
  const observedCTR = actualCTR !== null
    ? actualCTR
    : _simulateCTR(reportCount, position);

  const ctrAlignmentRatio = expectedCTR > 0
    ? Math.min(observedCTR / expectedCTR, 2.0) // 1.0 = perfect, >1 = above expected
    : 1.0;

  // ── Score alignment: internal vs what position implies ─────────────────────
  // Positive gap = internal score is higher than SERP suggests (over-scored)
  // Negative gap = internal score is lower than SERP suggests (under-scored)
  const scoreGap = parseFloat((internalScore - expectedFloor).toFixed(4));

  // ── Impression alignment ───────────────────────────────────────────────────
  const hasImpressions = actualImpressions !== null;
  const impressionSignal = hasImpressions
    ? Math.min(actualImpressions / 500, 1.0) // 500 impressions = full signal
    : Math.min(Math.log1p(reportCount) / Math.log1p(50), 1.0); // proxy

  // ── Composite alignment score ──────────────────────────────────────────────
  // Perfect = score matches position floor, CTR matches curve, impressions healthy
  const scoreComponent = Math.max(1 - Math.abs(scoreGap) * 2, 0);
  const ctrComponent   = Math.min(ctrAlignmentRatio, 1.0);

  const alignmentScore = parseFloat(Math.min(
    0.50 * scoreComponent +
    0.30 * ctrComponent   +
    0.20 * impressionSignal,
    1.0
  ).toFixed(4));

  // ── Mismatch detection ────────────────────────────────────────────────────
  const MISMATCH_THRESHOLD = 0.30; // alignment below 0.30 = mismatch
  const mismatchDetected   = alignmentScore < MISMATCH_THRESHOLD;

  let mismatchType = null;
  if (mismatchDetected) {
    if (scoreGap > 0.20)      mismatchType = 'OVER_SCORED';   // internal > SERP implies
    else if (scoreGap < -0.20) mismatchType = 'UNDER_SCORED'; // SERP implies > internal
    else if (ctrAlignmentRatio < 0.40) mismatchType = 'CTR_GAP';
    else                      mismatchType = 'IMPRESSION_MISMATCH';
  }

  // ── Correction factor ─────────────────────────────────────────────────────
  let correctionFactor = 1.0;
  let correctionAction = 'HOLD';

  if (mismatchType === 'OVER_SCORED') {
    // Dampen score — internal engine is too optimistic vs SERP reality
    correctionFactor = parseFloat(Math.max(1 - scoreGap * 0.5, 0.75).toFixed(4));
    correctionAction = 'RECALIBRATE_DOWN';
  } else if (mismatchType === 'UNDER_SCORED') {
    // Lift score — internal engine is too pessimistic
    correctionFactor = parseFloat(Math.min(1 + Math.abs(scoreGap) * 0.4, 1.25).toFixed(4));
    correctionAction = 'RECALIBRATE_UP';
  } else if (mismatchType === 'CTR_GAP') {
    // CTR below expected despite good position — content relevance issue
    correctionFactor = parseFloat(Math.max(ctrAlignmentRatio * 0.9, 0.80).toFixed(4));
    correctionAction = 'RECALIBRATE_DOWN';
  }

  return {
    alignmentScore,
    mismatchDetected,
    mismatchType,
    correctionFactor,
    correctionAction,
    signals: {
      internalScore,
      position,
      expectedFloor,
      scoreGap,
      observedCTR:      parseFloat(observedCTR.toFixed(4)),
      expectedCTR:      parseFloat(expectedCTR.toFixed(4)),
      ctrAlignmentRatio: parseFloat(ctrAlignmentRatio.toFixed(4)),
      impressionSignal: parseFloat(impressionSignal.toFixed(4)),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH: evaluateFleetAlignment
//
// Compares alignment across the entire fleet.
// Returns aggregate stats and pages with worst mismatches.
//
// @param {Array<{ pageSlug, internalScore, actualPosition?, actualCTR?, reportCount, normalizedTier }>} pages
// @returns {{ pages: AlignmentResult[], avgAlignmentScore, worstMismatches, fleetAlignmentStatus }}
// ─────────────────────────────────────────────────────────────────────────────
export function evaluateFleetAlignment(pages = []) {
  const results = pages.map(p => ({
    pageSlug: p.pageSlug,
    ...evaluateAlignment(p),
  }));

  const avg = results.reduce((s, r) => s + r.alignmentScore, 0) / (results.length || 1);

  const worstMismatches = results
    .filter(r => r.mismatchDetected)
    .sort((a, b) => a.alignmentScore - b.alignmentScore)
    .slice(0, 10);

  const fleetAlignmentStatus =
    avg >= 0.70 ? 'ALIGNED' :
    avg >= 0.45 ? 'PARTIAL' : 'MISALIGNED';

  return {
    pages:                results,
    avgAlignmentScore:    parseFloat(avg.toFixed(4)),
    worstMismatches,
    fleetAlignmentStatus,
    mismatchCount:        results.filter(r => r.mismatchDetected).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL helpers
// ─────────────────────────────────────────────────────────────────────────────
function _simulatePosition(score) {
  if (score <= 0) return 50;
  return Math.round(Math.min(1 + (1 - score) ** 2.5 * 49, 50));
}

function _simulateCTR(reportCount, position) {
  const engagement = Math.min(Math.log1p(reportCount) / Math.log1p(50), 1.0);
  const baseCTR    = getExpectedCTR(position);
  return parseFloat((baseCTR * (0.7 + 0.6 * engagement)).toFixed(4));
}
