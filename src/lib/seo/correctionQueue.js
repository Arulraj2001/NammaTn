// src/lib/seo/correctionQueue.js
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE CORRECTION PASS RULE — CORRECTION QUEUE
// ═══════════════════════════════════════════════════════════════════════════════
//
// GLOBAL RULE:
//   Each ISR cycle may apply ONLY ONE correction decision per page.
//   If multiple systems propose corrections, only the highest-priority
//   correction is applied immediately. All others are queued for the next cycle.
//
// PRIORITY ORDER (highest to lowest):
//   1. systemStabilityController  — always wins
//   2. serpAlignmentMonitor       — only if mismatch HIGH or CRITICAL
//   3. globalSeoGovernor          — fleet-level corrections only
//   [all others]                  — queued, never applied same cycle
//
// Correction Object:
//   {
//     source:    'stability' | 'alignment' | 'governor' | 'other',
//     pageSlug:  string,
//     delta:     number,           // signed score change
//     action:    string,           // corrective action name
//     reason:    string,
//     priority:  number,           // 1 = highest
//     cycle:     number,           // ISR cycle index (monotonic)
//   }
//
// Pure computation — no I/O, no Math.random(), ISR-safe.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Priority registry ─────────────────────────────────────────────────────────
const CORRECTION_PRIORITY = {
  stability:  1,
  alignment:  2,
  governor:   3,
  other:      99,
};

// ── Alignment mismatch levels that allow serpAlignmentMonitor to intervene ────
const ALIGNMENT_PERMITTED_SEVERITIES = new Set(['HIGH', 'CRITICAL']);

// ── Global queue: in-memory per-process store. In production, back with KV/Redis.
// Map<pageSlug, CorrectionEntry[]>
const _queue = new Map();

// ── Monotonic cycle counter (incremented per full ISR evaluation pass) ────────
let _globalCycle = 0;

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: resolveCorrectionPass
//
// Receives ALL proposed corrections for a single page in this ISR cycle,
// applies the highest-priority one immediately, queues the rest.
//
// @param {string} pageSlug
// @param {CorrectionProposal[]} proposals – ALL systems that want to correct
// @param {number} currentScore            – page's current stable score
//
// @returns {CorrectionPassResult}
// ─────────────────────────────────────────────────────────────────────────────
export function resolveCorrectionPass(pageSlug, proposals = [], currentScore = 0) {
  const cycle = _globalCycle;

  // ── Filter valid proposals (serpAlignmentMonitor only if HIGH/CRITICAL) ───
  const valid = proposals.filter(p => {
    if (p.source === 'alignment') {
      return ALIGNMENT_PERMITTED_SEVERITIES.has(p.mismatchSeverity);
    }
    return true;
  });

  if (valid.length === 0) {
    return {
      applied: null,
      queued:  [],
      passResult: 'NO_CORRECTION',
      cycle,
      pageSlug,
    };
  }

  // ── Sort by priority (lowest number = highest priority) ───────────────────
  const sorted = [...valid].sort((a, b) => {
    const pa = CORRECTION_PRIORITY[a.source] ?? 99;
    const pb = CORRECTION_PRIORITY[b.source] ?? 99;
    if (pa !== pb) return pa - pb;
    // Tiebreak: larger absolute delta wins
    return Math.abs(b.delta) - Math.abs(a.delta);
  });

  // ── Apply the winner ──────────────────────────────────────────────────────
  const winner = sorted[0];
  const rest   = sorted.slice(1);

  // Compute corrected score
  const correctedScore = parseFloat(
    Math.min(Math.max(currentScore + winner.delta, 0), 1.0).toFixed(4)
  );

  // ── Queue the losers for next cycle ──────────────────────────────────────
  const existing = _queue.get(pageSlug) || [];
  const queued   = rest.map(p => ({ ...p, deferredToCycle: cycle + 1 }));

  // Evict old queue entries (> 3 cycles old) to prevent stale corrections
  const fresh = [...existing, ...queued].filter(
    q => (cycle - (q.cycle ?? 0)) < 3
  );
  _queue.set(pageSlug, fresh);

  return {
    applied: {
      ...winner,
      correctedScore,
      cycle,
    },
    queued:     queued.map(q => ({ source: q.source, reason: q.reason, delta: q.delta })),
    passResult: 'SINGLE_CORRECTION_APPLIED',
    cycle,
    pageSlug,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD: buildCorrectionProposals
//
// Collects correction proposals from all ranked systems into a standardized
// array. Each system that wants to modify the score must go through here.
//
// @param {object} params
// @returns {CorrectionProposal[]}
// ─────────────────────────────────────────────────────────────────────────────
export function buildCorrectionProposals({
  pageSlug,
  stabilityDecision  = null,  // systemStabilityController output
  alignmentResult    = null,  // serpAlignmentMonitor output
  governorCorrection = null,  // globalSeoGovernor output
  currentScore       = 0,
} = {}) {
  const proposals = [];
  const cycle     = _globalCycle;

  // ── 1. systemStabilityController (always included) ────────────────────────
  if (stabilityDecision) {
    const adjVector = stabilityDecision.adjustmentVector ?? 0;
    // Only propose if there is a meaningful adjustment
    if (Math.abs(adjVector) > 0.001 || stabilityDecision.stabilityAction !== 'PASS') {
      proposals.push({
        source:   'stability',
        pageSlug,
        delta:    adjVector,
        action:   stabilityDecision.stabilityAction,
        reason:   `stability_${stabilityDecision.stabilityAction}_${stabilityDecision.worstConflictSeverity ?? 'NONE'}`,
        priority: CORRECTION_PRIORITY.stability,
        cycle,
        mismatchSeverity: null,
      });
    }
  }

  // ── 2. serpAlignmentMonitor (only HIGH/CRITICAL mismatch) ─────────────────
  if (alignmentResult && alignmentResult.mismatchDetected) {
    const mismatch = alignmentResult.mismatchSeverity ?? 'LOW';
    const factor   = alignmentResult.correctionFactor ?? 1.0;
    const delta    = parseFloat((currentScore * factor - currentScore).toFixed(4));
    proposals.push({
      source:   'alignment',
      pageSlug,
      delta,
      action:   `ALIGN_${mismatch}`,
      reason:   `alignment_mismatch_${mismatch.toLowerCase()}`,
      priority: CORRECTION_PRIORITY.alignment,
      cycle,
      mismatchSeverity: mismatch,
    });
  }

  // ── 3. globalSeoGovernor (fleet-level only, advisory) ────────────────────
  if (governorCorrection && governorCorrection.correctionApplied) {
    const delta = parseFloat((
      (governorCorrection.correctedScore ?? currentScore) - currentScore
    ).toFixed(4));
    if (Math.abs(delta) > 0.005) {
      proposals.push({
        source:   'governor',
        pageSlug,
        delta,
        action:   'GOVERNOR_FLEET_CORRECTION',
        reason:   governorCorrection.correctionReason ?? 'governor_fleet',
        priority: CORRECTION_PRIORITY.governor,
        cycle,
        mismatchSeverity: null,
      });
    }
  }

  return proposals;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: advanceCycle
//
// Call once per full ISR evaluation pass (before processing any pages).
// Increments the global cycle counter.
// ─────────────────────────────────────────────────────────────────────────────
export function advanceCycle() {
  _globalCycle += 1;
  return _globalCycle;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: getQueuedCorrections
//
// Returns pending corrections for a page (for debug / monitoring).
// ─────────────────────────────────────────────────────────────────────────────
export function getQueuedCorrections(pageSlug) {
  return _queue.get(pageSlug) ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: clearQueue
//
// Clears all queued corrections (call after fleet-level reset or deploy).
// ─────────────────────────────────────────────────────────────────────────────
export function clearQueue(pageSlug = null) {
  if (pageSlug) _queue.delete(pageSlug);
  else          _queue.clear();
}

export { CORRECTION_PRIORITY };
