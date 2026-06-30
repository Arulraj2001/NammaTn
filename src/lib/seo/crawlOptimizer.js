// src/lib/seo/crawlOptimizer.js
// Crawl Priority Optimizer.
// Computes per-page crawl priority scores and provides signals for sitemap.js.
// Combines traffic signals, report volume, impression rank, and link density.
// Pure computation — no Math.random(), ISR-safe.

// ── Crawl score inputs ─────────────────────────────────────────────────────────
/**
 * @param {object} params
 * @param {string} params.citySlug
 * @param {string} params.issueSlug
 * @param {number} params.reportCount        – active reports on the page
 * @param {number} params.internalLinkCount  – how many other pages link TO this one
 * @param {string} params.latestActivityDate – ISO date of most recent report
 * @param {number} params.rankingScore       – 0.0–1.0 from rankingFeedback
 * @param {string} params.trendVelocity      – 'spike'|'high'|'medium'|'low'|'none'|null
 * @returns {{
 *   crawlScore:    number,  // 0.0 – 1.0
 *   sitemapPriority: number, // 0.1 – 1.0
 *   changefreq:    string,  // 'always'|'hourly'|'daily'|'weekly'|'monthly'
 *   shouldBoost:   boolean,
 *   reason:        string,
 * }}
 */
export function computeCrawlPriority({
  citySlug          = '',
  issueSlug         = '',
  reportCount       = 0,
  internalLinkCount = 0,
  latestActivityDate = null,
  rankingScore      = 0,
  trendVelocity     = null,
} = {}) {

  // ── Signal: report volume (log-normalised) ─────────────────────────────────
  const reportSignal = Math.min(Math.log1p(reportCount) / Math.log1p(50), 1.0);

  // ── Signal: internal link density (log-normalised over 20 max links) ───────
  const linkSignal = Math.min(Math.log1p(internalLinkCount) / Math.log1p(20), 1.0);

  // ── Signal: content freshness (decays linearly over 14 days) ─────────────
  let freshnessSignal = 0;
  if (latestActivityDate) {
    const ageDays = (Date.now() - new Date(latestActivityDate).getTime()) / 86_400_000;
    freshnessSignal = Math.max(0, 1 - ageDays / 14);
  }

  // ── Signal: velocity boost ─────────────────────────────────────────────────
  const velocityBoost =
    trendVelocity === 'spike'  ? 0.30 :
    trendVelocity === 'high'   ? 0.20 :
    trendVelocity === 'medium' ? 0.10 : 0;

  // ── Composite crawl score ─────────────────────────────────────────────────
  const raw =
    0.35 * rankingScore     +
    0.25 * reportSignal     +
    0.20 * freshnessSignal  +
    0.12 * linkSignal       +
    0.08 * velocityBoost;

  const crawlScore = parseFloat(Math.min(raw + velocityBoost, 1.0).toFixed(4));

  // ── Sitemap priority mapping ────────────────────────────────────────────────
  const sitemapPriority =
    crawlScore >= 0.80 ? 1.0 :
    crawlScore >= 0.65 ? 0.9 :
    crawlScore >= 0.50 ? 0.8 :
    crawlScore >= 0.35 ? 0.6 :
    crawlScore >= 0.20 ? 0.4 : 0.2;

  // ── Change frequency ────────────────────────────────────────────────────────
  const changefreq =
    crawlScore >= 0.80 ? 'hourly'  :
    crawlScore >= 0.55 ? 'daily'   :
    crawlScore >= 0.30 ? 'weekly'  : 'monthly';

  // ── Boost flag: tells the renderer to elevate this page in homepgae carousels
  const shouldBoost = crawlScore >= 0.65 || trendVelocity === 'spike';

  // ── Human-readable reason (for debugging / admin dashboards) ───────────────
  const reasons = [];
  if (trendVelocity === 'spike' || trendVelocity === 'high') reasons.push(`trending (${trendVelocity})`);
  if (rankingScore >= 0.65)  reasons.push('high ranking score');
  if (freshnessSignal >= 0.7) reasons.push('fresh content');
  if (reportCount >= 10)     reasons.push(`${reportCount} active reports`);
  const reason = reasons.length > 0 ? reasons.join(', ') : 'standard priority';

  return { crawlScore, sitemapPriority, changefreq, shouldBoost, reason };
}

// ── Batch resolver for sitemap generation ────────────────────────────────────
/**
 * Given a pre-built ranking map (city:issue → RankingResult) and trend list,
 * returns a function that resolves crawl priority for any city+issue pair.
 *
 * @param {object}   rankingMap   – { [city:issue]: RankingResult }
 * @param {object[]} trends       – from trendDetector.detectTrends()
 * @returns {(city: string, issue: string, reportCount?: number) => CrawlPriorityResult}
 */
export function buildCrawlPriorityResolver(rankingMap = {}, trends = []) {
  const trendIndex = {};
  trends.forEach(t => {
    trendIndex[`${t.city}:${t.issue}`] = t.velocity;
  });

  return function resolveCrawlPriority(city, issue, reportCount = 0) {
    const key     = `${city}:${issue}`;
    const ranking = rankingMap[key];

    return computeCrawlPriority({
      citySlug:          city,
      issueSlug:         issue,
      reportCount,
      internalLinkCount: 0, // Injected as 0 at sitemap level; full value available at page level
      latestActivityDate: null,
      rankingScore:       ranking?.rankingScore      || 0,
      trendVelocity:      trendIndex[key]            || null,
    });
  };
}
