// src/lib/seo/queryIntentEngine.js
// Query Intent Capture System.
// Derives keyword clusters and long-tail expansions from city × issue pairs.
// Pure computation — no DB calls, no Math.random(), ISR-safe.

import { DISTRICT_MAP, CATEGORY_MAP } from '@/lib/seo-data';

// ── Intent taxonomy ────────────────────────────────────────────────────────────
// Each intent type produces a distinct content tone and keyword strategy.
const INTENT_TYPE = {
  INFORMATIONAL: 'informational', // "what is" / "how to fix"
  NAVIGATIONAL:  'navigational',  // "TNEB Chennai complaint number"
  TRANSACTIONAL: 'transactional', // "report power cut now"
  INVESTIGATIVE: 'investigative', // "Chennai power cut reason today"
};

// Per-issue intent strength matrix
// Values represent percentage weight of each intent type for a given issue.
const ISSUE_INTENT_MATRIX = {
  'power-cut':         { informational: 0.20, navigational: 0.35, transactional: 0.30, investigative: 0.15 },
  'water-issue':       { informational: 0.25, navigational: 0.30, transactional: 0.30, investigative: 0.15 },
  'road-problem':      { informational: 0.30, navigational: 0.25, transactional: 0.25, investigative: 0.20 },
  'scam':              { informational: 0.35, navigational: 0.20, transactional: 0.15, investigative: 0.30 },
  'jobs':              { informational: 0.40, navigational: 0.30, transactional: 0.25, investigative: 0.05 },
  'stay':              { informational: 0.30, navigational: 0.35, transactional: 0.30, investigative: 0.05 },
  '__default__':       { informational: 0.30, navigational: 0.25, transactional: 0.25, investigative: 0.20 },
};

// Per-issue keyword seed sets (Tamil Nadu civic vocabulary)
const ISSUE_KEYWORDS = {
  'power-cut': {
    primary:   ['power cut', 'electricity outage', 'TANGEDCO', 'TNEB', 'power failure'],
    secondary: ['scheduled power cut', 'unscheduled outage', 'load shedding', 'voltage fluctuation', 'power restoration'],
    local:     (city) => [`${city} power cut today`, `${city} TANGEDCO complaint`, `${city} electricity problem`, `TNEB ${city} helpline`],
  },
  'water-issue': {
    primary:   ['water supply', 'water problem', 'TWAD', 'water board', 'no water supply'],
    secondary: ['pipeline leak', 'water contamination', 'water shortage', 'borewell failure', 'tanker water'],
    local:     (city) => [`${city} water problem today`, `${city} water supply complaint`, `TWAD ${city}`, `${city} pipeline leak`],
  },
  'road-problem': {
    primary:   ['road damage', 'pothole', 'road repair', 'highway complaint', 'NHAI'],
    secondary: ['broken road', 'road accident risk', 'footpath blocked', 'road flooding', 'median damage'],
    local:     (city) => [`${city} road pothole`, `${city} road damage complaint`, `${city} highway problem`, `road repair ${city}`],
  },
  'scam': {
    primary:   ['cyber scam', 'online fraud', 'scam alert', 'Tamil Nadu cyber crime', 'fraud complaint'],
    secondary: ['UPI fraud', 'impersonation scam', 'job scam', 'lottery fraud', 'phishing'],
    local:     (city) => [`${city} scam alert`, `${city} cyber fraud`, `${city} online scam today`, `cyber crime complaint ${city}`],
  },
  'jobs': {
    primary:   ['government jobs', 'private jobs', 'job vacancy', 'employment', 'job posting'],
    secondary: ['Tamil Nadu jobs', 'fresher jobs', 'walk-in interview', 'job fair', 'employment exchange'],
    local:     (city) => [`${city} jobs today`, `${city} job vacancy`, `${city} government job`, `employment ${city}`],
  },
  'stay': {
    primary:   ['room for rent', 'PG accommodation', 'hostel', 'house rental', 'apartment'],
    secondary: ['bachelor room', 'furnished room', 'room near', 'affordable PG', '2BHK rent'],
    local:     (city) => [`${city} room for rent`, `${city} PG accommodation`, `${city} hostel`, `rooms in ${city}`],
  },
};

// ── Dominant intent resolver ──────────────────────────────────────────────────
function getDominantIntent(issueSlug) {
  const matrix = ISSUE_INTENT_MATRIX[issueSlug] || ISSUE_INTENT_MATRIX['__default__'];
  return Object.entries(matrix).sort(([, a], [, b]) => b - a)[0][0];
}

// ── Long-tail expansion ────────────────────────────────────────────────────────
function buildLongTailExpansions(cityName, issueName, issueSlug, reportCount = 0) {
  const base = [
    `${cityName} ${issueName.toLowerCase()} complaint number`,
    `${cityName} ${issueName.toLowerCase()} helpline`,
    `${cityName} ${issueName.toLowerCase()} problem today`,
    `how to report ${issueName.toLowerCase()} in ${cityName}`,
    `${cityName} ${issueName.toLowerCase()} resolution time`,
    `${issueName} complaint Tamil Nadu online`,
    `${cityName} civic issue report`,
  ];

  if (reportCount > 10) {
    base.push(`${cityName} ${issueName.toLowerCase()} report count`);
    base.push(`${issueName} emergency ${cityName}`);
  }

  return base;
}

// ── Intent strength score ─────────────────────────────────────────────────────
// 0.0 – 1.0. Higher = content should strongly reinforce the dominant intent.
function computeIntentStrength(issueSlug, citySlug, reportCount = 0) {
  const isTier1 = ['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem'].includes(citySlug);
  const isHighValue = ['power-cut', 'water-issue', 'road-problem', 'scam'].includes(issueSlug);

  let base = 0.5;
  if (isTier1)    base += 0.15;
  if (isHighValue) base += 0.20;
  if (reportCount > 20) base += 0.15;
  else if (reportCount > 5) base += 0.08;

  return parseFloat(Math.min(base, 1.0).toFixed(4));
}

// ── Public API ─────────────────────────────────────────────────────────────────
/**
 * @param {string} citySlug
 * @param {string} issueSlug
 * @param {number} reportCount
 * @returns {{
 *   primaryKeywords:    string[],
 *   secondaryKeywords:  string[],
 *   localKeywords:      string[],
 *   longTailExpansions: string[],
 *   dominantIntent:     string,
 *   intentMatrix:       object,
 *   intentStrength:     number,
 *   contentTone:        string,
 * }}
 */
export function resolveQueryIntent(citySlug, issueSlug, reportCount = 0) {
  const cityData  = DISTRICT_MAP[citySlug];
  const issueData = CATEGORY_MAP[issueSlug];

  if (!cityData || !issueData) {
    return {
      primaryKeywords:    [],
      secondaryKeywords:  [],
      localKeywords:      [],
      longTailExpansions: [],
      dominantIntent:     INTENT_TYPE.INFORMATIONAL,
      intentMatrix:       ISSUE_INTENT_MATRIX['__default__'],
      intentStrength:     0.3,
      contentTone:        'neutral',
    };
  }

  const keywords   = ISSUE_KEYWORDS[issueSlug] || ISSUE_KEYWORDS['road-problem'];
  const cityName   = cityData.name;
  const issueName  = issueData.name;

  const dominantIntent  = getDominantIntent(issueSlug);
  const intentMatrix    = ISSUE_INTENT_MATRIX[issueSlug] || ISSUE_INTENT_MATRIX['__default__'];
  const intentStrength  = computeIntentStrength(issueSlug, citySlug, reportCount);

  // Tone is derived from dominant intent
  const TONE_MAP = {
    informational: 'educational',
    navigational:  'directive',
    transactional: 'urgent',
    investigative: 'analytical',
  };

  return {
    primaryKeywords:    keywords.primary,
    secondaryKeywords:  keywords.secondary,
    localKeywords:      keywords.local(cityName),
    longTailExpansions: buildLongTailExpansions(cityName, issueName, issueSlug, reportCount),
    dominantIntent,
    intentMatrix,
    intentStrength,
    contentTone: TONE_MAP[dominantIntent] || 'neutral',
  };
}
