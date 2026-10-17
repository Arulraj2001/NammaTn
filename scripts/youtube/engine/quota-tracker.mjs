// scripts/youtube/engine/quota-tracker.mjs
// Centralized YouTube API & Publishing Quota Tracker & Safety Guard
// Protects YouTube's 10,000 units/day quota and prevents duplicate or runaway uploads.

import fs from 'fs';
import path from 'path';

const QUOTA_FILE = path.resolve('public/youtube_renders/quota_tracker.json');
const DAILY_LIMIT_UNITS = 10000;
const SAFETY_BUFFER_UNITS = 1200; // Stop auto-uploads when remaining < 1200

export const OPERATION_COSTS = {
  VIDEO_UPLOAD: 1600,
  SET_THUMBNAIL: 50,
  POST_COMMENT: 50,
  FETCH_PLAYLIST: 1,
  UPDATE_METADATA: 50
};

/**
 * Loads current quota state for today (UTC)
 */
function loadQuotaState() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'));
      if (data.date === today) {
        return data;
      }
    }
  } catch (_) {}

  // New day or missing file
  const newState = {
    date: today,
    unitsUsed: 0,
    operations: [],
    uploadsCount: 0,
    lastUpdated: new Date().toISOString()
  };
  saveQuotaState(newState);
  return newState;
}

/**
 * Persists quota state to disk
 */
function saveQuotaState(state) {
  try {
    const dir = path.dirname(QUOTA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[QUOTA TRACKER WARN] Could not save quota state:', err.message);
  }
}

/**
 * Verifies if sufficient quota exists for the requested operation
 * @param {string} operationName - e.g. 'VIDEO_UPLOAD'
 * @returns {{ allowed: boolean, remainingUnits: number, reason?: string }}
 */
export function checkQuotaAvailable(operationName = 'VIDEO_UPLOAD') {
  const state = loadQuotaState();
  const cost = OPERATION_COSTS[operationName] || 50;
  const projectedTotal = state.unitsUsed + cost;
  const remaining = Math.max(0, DAILY_LIMIT_UNITS - state.unitsUsed);

  if (projectedTotal > (DAILY_LIMIT_UNITS - SAFETY_BUFFER_UNITS)) {
    return {
      allowed: false,
      remainingUnits: remaining,
      unitsUsed: state.unitsUsed,
      reason: `Approaching daily YouTube quota limit (${state.unitsUsed}/${DAILY_LIMIT_UNITS} units used). Buffer threshold ${DAILY_LIMIT_UNITS - SAFETY_BUFFER_UNITS} reached.`
    };
  }

  return {
    allowed: true,
    remainingUnits: remaining - cost,
    unitsUsed: state.unitsUsed
  };
}

/**
 * Records successful quota usage
 */
export function recordQuotaUsage(operationName = 'VIDEO_UPLOAD', details = {}) {
  const state = loadQuotaState();
  const cost = OPERATION_COSTS[operationName] || 50;

  state.unitsUsed += cost;
  state.operations.push({
    timestamp: new Date().toISOString(),
    operation: operationName,
    cost,
    details
  });

  if (operationName === 'VIDEO_UPLOAD') {
    state.uploadsCount = (state.uploadsCount || 0) + 1;
  }

  saveQuotaState(state);
  console.log(`[QUOTA] Recorded ${operationName} (${cost} units). Today's total: ${state.unitsUsed}/${DAILY_LIMIT_UNITS} units (${DAILY_LIMIT_UNITS - state.unitsUsed} remaining).`);
}

/**
 * Returns a human-readable summary of quota usage
 */
export function getDailyQuotaSummary() {
  const state = loadQuotaState();
  return {
    date: state.date,
    unitsUsed: state.unitsUsed,
    remainingUnits: Math.max(0, DAILY_LIMIT_UNITS - state.unitsUsed),
    percentUsed: ((state.unitsUsed / DAILY_LIMIT_UNITS) * 100).toFixed(1) + '%',
    uploadsCount: state.uploadsCount || 0,
    totalOperations: state.operations.length
  };
}
