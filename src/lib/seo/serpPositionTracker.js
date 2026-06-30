// src/lib/seo/serpPositionTracker.js
// ═══════════════════════════════════════════════════════════════════════════════
// SERP POSITION TRACKER
// Tracks real ranking position changes over time per city×issue page.
//
// Stateless: accepts current + previous position data as arguments.
// Persistent storage (KV store / Supabase) is the caller's responsibility.
//
// Detects:
//   - positionChange   (signed delta: negative = improved, positive = fell)
//   - velocity         (rate of change per day)
//   - volatilityScore  (how much position jumps around)
//   - movementClass    ('RISING'|'FALLING'|'STABLE'|'VOLATILE'|'NEW_ENTRY')
//
// Pure computation — no DB calls, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Movement classification thresholds ───────────────────────────────────────
const MOVEMENT = {
  STRONG_RISE: -5,   // improved by 5+ positions
  MILD_RISE:   -2,   // improved 2–4 positions
  STABLE_BAND:  2,   // within ±2 positions = stable
  MILD_FALL:    5,   // fell 2–4 positions
  STRONG_FALL: 10,   // fell 5+ positions
};

const VOLATILITY_HIGH    = 8.0;  // avg absolute change > 8 = volatile
const VOLATILITY_MEDIUM  = 4.0;

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: trackPosition
//
// Computes movement metrics for one page given a position history.
//
// @param {object} params
// @param {string}    params.pageSlug
// @param {number}    params.currentPosition  – today's avg SERP position (1–100)
// @param {number|null} params.previousPosition – last tracked position (null = first entry)
// @param {number[]}  params.positionHistory    – up to 14 data points (oldest first)
// @param {number}    params.daysSinceLastCheck – how many days between checks
//
// @returns {PositionTrackResult}
// ─────────────────────────────────────────────────────────────────────────────
export function trackPosition({
  pageSlug         = '',
  currentPosition  = 50,
  previousPosition = null,
  positionHistory  = [],
  daysSinceLastCheck = 1,
} = {}) {

  // ── Guard: clamp position to valid range ──────────────────────────────────
  const curPos  = Math.min(Math.max(currentPosition, 1), 100);
  const prevPos = previousPosition !== null
    ? Math.min(Math.max(previousPosition, 1), 100)
    : null;

  // ── Position delta ─────────────────────────────────────────────────────────
  // Negative = improved (moved closer to position 1)
  const positionChange = prevPos !== null
    ? parseFloat((curPos - prevPos).toFixed(1))
    : 0;

  // ── Velocity (positions per day) ──────────────────────────────────────────
  const velocity = prevPos !== null && daysSinceLastCheck > 0
    ? parseFloat((positionChange / daysSinceLastCheck).toFixed(2))
    : 0;

  // ── Volatility from history (std dev of position changes) ─────────────────
  let volatilityScore = 0;
  if (positionHistory.length >= 2) {
    const changes = [];
    for (let i = 1; i < positionHistory.length; i++) {
      changes.push(Math.abs(positionHistory[i] - positionHistory[i - 1]));
    }
    const mean = changes.reduce((s, v) => s + v, 0) / changes.length;
    volatilityScore = parseFloat(mean.toFixed(2));
  }

  // ── Movement classification ───────────────────────────────────────────────
  let movementClass;
  if (prevPos === null) {
    movementClass = 'NEW_ENTRY';
  } else if (volatilityScore >= VOLATILITY_HIGH) {
    movementClass = 'VOLATILE';
  } else if (positionChange <= MOVEMENT.STRONG_RISE) {
    movementClass = 'RISING';
  } else if (positionChange >= MOVEMENT.STRONG_FALL) {
    movementClass = 'FALLING';
  } else if (Math.abs(positionChange) <= MOVEMENT.STABLE_BAND) {
    movementClass = 'STABLE';
  } else if (positionChange < 0) {
    movementClass = 'RISING';
  } else {
    movementClass = 'FALLING';
  }

  // ── Position score (0–1, 1.0 = position 1) ───────────────────────────────
  const positionScore = parseFloat(
    Math.max((100 - curPos) / 99, 0).toFixed(4)
  );

  // ── Momentum factor: weighted recent trend ────────────────────────────────
  // Recent positions weighted more heavily (exponential decay from end of array)
  let momentumScore = 0;
  if (positionHistory.length >= 3) {
    const recent = positionHistory.slice(-6); // last 6 data points
    const weights = recent.map((_, i) => Math.exp(i * 0.3));
    const wSum    = weights.reduce((s, w) => s + w, 0);
    const wAvgPos = recent.reduce((s, p, i) => s + p * weights[i], 0) / wSum;
    // Lower weighted avg position → better momentum
    momentumScore = parseFloat(Math.max((100 - wAvgPos) / 99, 0).toFixed(4));
  } else {
    momentumScore = positionScore;
  }

  return {
    pageSlug,
    currentPosition:  curPos,
    previousPosition: prevPos,
    positionChange,
    velocity,
    volatilityScore,
    movementClass,
    positionScore,
    momentumScore,
    historyLength:    positionHistory.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH: trackFleetPositions
//
// @param {Array<{ pageSlug, currentPosition, previousPosition, positionHistory }>} pages
// @returns {Map<string, PositionTrackResult>}
// ─────────────────────────────────────────────────────────────────────────────
export function trackFleetPositions(pages = []) {
  const map = new Map();
  pages.forEach(p => {
    map.set(p.pageSlug, trackPosition(p));
  });
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: positionToRankingScore
//
// Converts a raw SERP position (1–100) into a 0–1 ranking score
// compatible with the internal scoring system.
// Non-linear: top positions map exponentially higher.
// ─────────────────────────────────────────────────────────────────────────────
export function positionToRankingScore(position = 50) {
  const p = Math.min(Math.max(position, 1), 100);
  // Inverse sigmoid-like: position 1 → 0.95, position 10 → 0.65, position 50 → 0.15
  return parseFloat(
    Math.max(1 - Math.pow((p - 1) / 99, 0.6), 0).toFixed(4)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: buildPositionUpdate
//
// Appends the latest position to a history array (capped at 30 entries).
// Call this when persisting position history to a KV store.
// ─────────────────────────────────────────────────────────────────────────────
export function buildPositionUpdate(currentHistory = [], newPosition) {
  const updated = [...currentHistory, newPosition];
  return updated.slice(-30); // keep last 30 data points
}
