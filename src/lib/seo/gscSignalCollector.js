// src/lib/seo/gscSignalCollector.js
// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE SEARCH CONSOLE SIGNAL COLLECTOR
// ═══════════════════════════════════════════════════════════════════════════════
//
// Fetches and normalises real GSC signals for city×issue pages.
// Supports two modes:
//   • LIVE    — real GSC API call via Google APIs (requires OAuth credentials)
//   • OFFLINE — stub that returns neutral signals when API is unavailable
//
// GSC API requires:
//   GOOGLE_GSC_CLIENT_EMAIL  (service account email)
//   GOOGLE_GSC_PRIVATE_KEY   (service account private key)
//   NEXT_PUBLIC_SITE_URL     (verified property in GSC, e.g. https://www.vizhitn.in)
//
// ISR-safe: does NOT cache internally. Next.js ISR (revalidate=3600) owns cache.
// No Math.random(). Server-only (never runs in browser).
// ═══════════════════════════════════════════════════════════════════════════════

const GSC_API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vizhitn.in';

// ── GSC metric thresholds for normalisation ────────────────────────────────────
const NORM = {
  impressions: { p100: 5000 },  // 5000+ impressions → score 1.0
  clicks:      { p100: 500  },  // 500+ clicks → score 1.0
  ctr:         { p100: 0.25 },  // 25% CTR ceiling
  position:    { best: 1, worst: 50 }, // position 1 → score 1.0
};

// ── OAuth2 token fetch (service account JWT) ──────────────────────────────────
async function fetchGscAccessToken() {
  const email  = process.env.GOOGLE_GSC_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_GSC_PRIVATE_KEY;

  if (!email || !rawKey) return null;

  try {
    // JWT header + payload
    const now = Math.floor(Date.now() / 1000);
    const header  = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud:  'https://oauth2.googleapis.com/token',
      exp:  now + 3600,
      iat:  now,
    };

    const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = `${b64(header)}.${b64(payload)}`;

    // Sign with RS256 using Node.js crypto
    const { createSign } = await import('crypto');
    const privateKey = rawKey.replace(/\\n/g, '\n');
    const sign = createSign('RSA-SHA256');
    sign.update(unsigned);
    const sig = sign.sign(privateKey, 'base64url');

    const jwt = `${unsigned}.${sig}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

// ── Single page GSC fetch ─────────────────────────────────────────────────────
async function fetchPageGscData(pageSlug, accessToken, startDate, endDate) {
  const url  = `${GSC_API_BASE}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const body = {
    startDate,
    endDate,
    dimensions: ['query', 'page'],
    dimensionFilterGroups: [{
      filters: [{ dimension: 'page', operator: 'equals', expression: `${SITE_URL}${pageSlug}` }],
    }],
    rowLimit: 50,
    dataState: 'final',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.rows || [];
  } catch {
    return null;
  }
}

// ── Aggregate rows → unified GSC signals ─────────────────────────────────────
function aggregateRows(rows = []) {
  if (rows.length === 0) {
    return { impressions: 0, clicks: 0, ctr: 0, avgPosition: 50, queryClusters: [] };
  }

  let totalImpressions = 0, totalClicks = 0, weightedPos = 0;
  const queries = [];

  rows.forEach(row => {
    const imp  = row.impressions || 0;
    const clk  = row.clicks     || 0;
    const pos  = row.position   || 50;
    totalImpressions += imp;
    totalClicks      += clk;
    weightedPos      += pos * imp;
    if (row.keys?.[0]) queries.push({ query: row.keys[0], clicks: clk, impressions: imp, position: pos });
  });

  const avgPosition = totalImpressions > 0 ? weightedPos / totalImpressions : 50;
  const ctr         = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

  // Query clusters: top 10 by clicks
  const queryClusters = queries
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)
    .map(q => ({ ...q, clicks: Math.round(q.clicks), impressions: Math.round(q.impressions) }));

  return {
    impressions:   Math.round(totalImpressions),
    clicks:        Math.round(totalClicks),
    ctr:           parseFloat(ctr.toFixed(4)),
    avgPosition:   parseFloat(avgPosition.toFixed(1)),
    queryClusters,
  };
}

// ── Normalise raw GSC signals → 0-1 scores ───────────────────────────────────
function normaliseGscSignals(raw) {
  const impressionScore = parseFloat(Math.min(raw.impressions / NORM.impressions.p100, 1.0).toFixed(4));
  const clickScore      = parseFloat(Math.min(raw.clicks      / NORM.clicks.p100,      1.0).toFixed(4));
  const ctrScore        = parseFloat(Math.min(raw.ctr         / NORM.ctr.p100,         1.0).toFixed(4));
  const posScore        = parseFloat(Math.max(
    (NORM.position.worst - raw.avgPosition) / (NORM.position.worst - NORM.position.best),
    0
  ).toFixed(4));

  // Trend velocity from position: if avgPosition < 10 and ctr high → spike
  const trendVelocity =
    raw.avgPosition <= 3  && raw.ctr >= 0.15 ? 'spike'  :
    raw.avgPosition <= 10 && raw.ctr >= 0.06 ? 'high'   :
    raw.avgPosition <= 20 && raw.ctr >= 0.03 ? 'medium' :
    raw.avgPosition <= 30                    ? 'low'    : 'none';

  return {
    impressionScore,
    clickScore,
    ctrScore,
    positionScore: posScore,
    trendVelocity,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY EXPORT: collectGscSignals
//
// Fetches and normalises GSC signals for one page.
// Falls back to neutral stub if API is unavailable.
//
// @param {string} pageSlug  – e.g. '/chennai/power-cut/'
// @param {object} options   – { daysBack: 28 }
// @returns {GscSignalResult}
// ─────────────────────────────────────────────────────────────────────────────
export async function collectGscSignals(pageSlug, { daysBack = 28 } = {}) {
  const endDate   = _isoDate(0);
  const startDate = _isoDate(-daysBack);

  const accessToken = await fetchGscAccessToken();
  const isLive      = !!accessToken;

  let raw;
  if (isLive) {
    const rows = await fetchPageGscData(pageSlug, accessToken, startDate, endDate);
    raw = aggregateRows(rows || []);
  } else {
    // Offline stub — neutral baseline (all systems treat this as "no data")
    raw = { impressions: 0, clicks: 0, ctr: 0, avgPosition: 50, queryClusters: [] };
  }

  const normalised = normaliseGscSignals(raw);

  return {
    pageSlug,
    dataSource: isLive ? 'gsc_api' : 'offline_stub',
    period:     { startDate, endDate, daysBack },
    // Raw signals
    impressions:   raw.impressions,
    clicks:        raw.clicks,
    ctr:           raw.ctr,
    avgPosition:   raw.avgPosition,
    queryClusters: raw.queryClusters,
    // Normalised 0–1 scores
    impressionScore:  normalised.impressionScore,
    clickScore:       normalised.clickScore,
    ctrScore:         normalised.ctrScore,
    positionScore:    normalised.positionScore,
    trendVelocity:    normalised.trendVelocity,
    // Composite GSC score (weighted)
    gscCompositeScore: parseFloat(
      (0.35 * normalised.positionScore +
       0.30 * normalised.ctrScore      +
       0.20 * normalised.impressionScore +
       0.15 * normalised.clickScore
      ).toFixed(4)
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH EXPORT: collectGscSignalsBatch
//
// Fetches GSC signals for multiple pages in one token fetch.
// Rate-limited: 1 request per 100ms to avoid GSC quota exhaustion.
//
// @param {string[]} pageSlugs
// @param {object}   options
// @returns {Map<string, GscSignalResult>}
// ─────────────────────────────────────────────────────────────────────────────
export async function collectGscSignalsBatch(pageSlugs = [], options = {}) {
  const accessToken = await fetchGscAccessToken();
  const isLive      = !!accessToken;
  const results     = new Map();
  const { daysBack = 28 } = options;

  const endDate   = _isoDate(0);
  const startDate = _isoDate(-daysBack);

  for (const slug of pageSlugs) {
    let raw;
    if (isLive) {
      const rows = await fetchPageGscData(slug, accessToken, startDate, endDate);
      raw = aggregateRows(rows || []);
      // Polite rate limit
      await _sleep(100);
    } else {
      raw = { impressions: 0, clicks: 0, ctr: 0, avgPosition: 50, queryClusters: [] };
    }

    const normalised = normaliseGscSignals(raw);
    results.set(slug, {
      pageSlug: slug,
      dataSource: isLive ? 'gsc_api' : 'offline_stub',
      ...raw,
      ...normalised,
      gscCompositeScore: parseFloat(
        (0.35 * normalised.positionScore +
         0.30 * normalised.ctrScore      +
         0.20 * normalised.impressionScore +
         0.15 * normalised.clickScore
        ).toFixed(4)
      ),
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL helpers
// ─────────────────────────────────────────────────────────────────────────────
function _isoDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function _sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
