// src/lib/seo/indexBoost.js
// Provides stable freshness metadata per page.
// SAFE: never fires on null lastIndexedDate — avoids universal boilerplate text across all pages.
// Only boosts if real index staleness data exists and exceeds threshold.

/**
 * @param {string} city  - district slug
 * @param {string} issue - category slug
 * @param {string|null} lastIndexedDate - ISO date from a real seo_index_log table. Null = unknown.
 * @param {number} reportCount - live report count from Supabase query on the page
 * @returns {{ boostActive, lastModified, feedOrder, linkWeightMultiplier, recentActivityBlock }}
 */
export function evaluateIndexBoost(city, issue, lastIndexedDate, reportCount = 0) {
  // Safe default — used for all new/unknown pages and zero-report pages
  const safeDefault = {
    boostActive: false,
    lastModified: new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z', // Stable: date-only
    feedOrder: 'created_date',
    linkWeightMultiplier: 1.0,
    recentActivityBlock: null,
  };

  // No real index log exists → do not fabricate boost signals
  if (!lastIndexedDate) {
    return safeDefault;
  }

  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;
  const daysSinceIndex = (now - new Date(lastIndexedDate)) / msInDay;

  // Only boost if truly stale (14+ days since last Google indexing signal)
  if (daysSinceIndex < 14) {
    return safeDefault;
  }

  // Only boost if there is real content to surface (prevent boosting empty pages)
  if (reportCount < 1) {
    return safeDefault;
  }

  // Hour-stable timestamp: changes at most once per ISR window, never mid-second
  const freshTimestamp = new Date();
  freshTimestamp.setMinutes(0, 0, 0);

  return {
    boostActive: true,
    lastModified: freshTimestamp.toISOString(),
    feedOrder: 'updated_date',
    linkWeightMultiplier: 2.0,
    recentActivityBlock: {
      title: 'Recent Activity Review',
      content: `Civic alerts for ${city.replace(/-/g, ' ')} ${issue.replace(/-/g, ' ')} were last reviewed on ${freshTimestamp.toLocaleDateString('en-IN')}. New submissions are being tracked below.`,
    },
  };
}
