// src/app/(user)/[city]/[issue]/page.jsx
// Production programmatic SEO page — Next.js App Router, Server Component only.
//
// AUTONOMOUS RANKING ENGINE v4 — autonomousSeoCore integration.
// Single call: runAutonomousCoreAsync() owns the entire 12-system pipeline.
// page.jsx only handles: DB fetch → core call → render.
//
// SEO PHASE 1 FIXES:
// - Priority district/category pages pre-render; remaining valid pages generate on demand
// - Enriched meta description with neighborhood names
// - Evidence-based structured data with real report modification dates
// - SSR intro paragraph (unique per city+issue) above content modules
// - Breadcrumb nav added server-side
//
// PRESERVED:
//   revalidate = 3600  (ISR unchanged)
//   No Math.random()
//   No client-only APIs
//   No schema spam
//   No React Router

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DISTRICT_MAP, BUILD_TIME_DISTRICT_SLUGS, CATEGORY_MAP, SITE_URL } from '@/lib/seo-data';
import { getCityIssueMetaDescription } from '@/lib/metaDescription';
import { getCityIssueRobots } from '@/lib/programmaticIndexing';
import { generateBreadcrumbSchema } from '@/lib/seo/newsSchema';
import { formatReportDate, getLatestReportDate } from '@/lib/reportFreshness';
import { createServerSupabase } from '@/lib/serverSupabase';
import PageSchema from '@/components/seo/PageSchema';
import { NearbyDistrictLinks } from '@/components/seo/InternalLinks';

import { runAutonomousCoreAsync }  from '@/lib/seo/autonomousSeoCore';
import { evaluateIndexBoost }      from '@/lib/seo/indexBoost';

export const runtime = 'edge';
import { isPageTrending }          from '@/lib/seo/trendDetector';
import { DEFAULT_SUBSYSTEM_WEIGHTS, computeWeightAdjustments } from '@/lib/seo/selfImprovingSeoLoop';
import InlineCivicReportCard       from '@/components/civic/InlineCivicReportCard';
import VerifiedHelplineBar         from '@/components/civic/VerifiedHelplineBar';
import { slugifyArea }             from '@/lib/powerCutAreas';

export const revalidate = 3600;

// ── DB FETCH ──────────────────────────────────────────────────────────────────
async function fetchCityIssueData(citySlug, issueSlug, orderField = 'created_date') {
  try {
    const supabase = createServerSupabase();
    if (!supabase) return { reports: [], dataAvailable: false };
    // Canonical alias handling moved to next.config.js 301 redirects;
    // this page now serves ONLY the canonical slug.
    const canonicalIssueSlug = issueSlug;

    const { data: reports, error } = await supabase
      .from('unified_explore_feed')
      .select('id,title,description,area_slug,district_slug,category_slug,post_type,created_date,updated_date,status,upvotes,downvotes')
      .eq('district_slug', citySlug)
      .eq('category_slug', canonicalIssueSlug)
      .eq('status', 'active')
      .order(orderField, { ascending: false })
      .limit(20);

    if (error) {
      // Fallback query to post table if the view is unavailable.
      // NOTE: `post` has `title_en`/`content_en` (NO `title` column) — selecting
      // `title` threw "column post.title does not exist", making every city/issue
      // page render with empty report data. Map to the render's expected shape
      // ({ title, description }) and only expose publicly-approved rows.
      const { data: fallbackReports, error: fallbackError } = await supabase
        .from('post')
        .select('id,title_en,content_en,area_slug,district_slug,category_slug,post_type,created_date,updated_date,status,upvotes,downvotes')
        .eq('district_slug', citySlug)
        .eq('category_slug', canonicalIssueSlug)
        .eq('status', 'active')
        .eq('is_publicly_visible', true)
        .eq('moderation_status', 'approved')
        .order(orderField, { ascending: false })
        .limit(20);

      if (fallbackError) throw fallbackError;
      return {
        reports: (fallbackReports || []).map(r => ({
          ...r,
          title: r.title_en,
          description: r.content_en,
        })),
        dataAvailable: true,
      };
    }

    return { reports: reports || [], dataAvailable: true };
  } catch (e) {
    console.error('[SEO Page] Fetch error:', e.message);
    return { reports: [], dataAvailable: false };
  }
}

// ── METADATA ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { city, issue } = await params;
  const cityData  = DISTRICT_MAP[city];
  const issueData = CATEGORY_MAP[issue];

  if (!cityData || !issueData) {
    notFound();
  }

  // Dynamic high-intent search query titles
  let title = `${cityData.name} ${issueData.name} Reports & Updates`;
  let description = getCityIssueMetaDescription(cityData.name, issueData.name);
  let keywords = `${cityData.name} ${issueData.name}, ${cityData.name} civic news, vizhitn`;

  if (issue === 'power-cut') {
    title = `${cityData.name} Power Cut Today: Scheduled EB Shutdown Timings & Streets`;
    description = `Scheduled TANGEDCO power cut timings, affected areas, and 1912 Minnalagam helpline in ${cityData.name}, Tamil Nadu. Live citizen verified alerts.`;
    keywords = `${cityData.name} power cut today, ${cityData.name} eb shutdown timings, tangedco ${cityData.name}, ${cityData.name} minthadai`;
  } else if (issue === 'water-issue') {
    title = `${cityData.name} Water Supply Alerts: Pipeline Leaks, Tanker Helplines & Updates`;
    description = `Official drinking water supply schedules, TWAD / Municipal corporation tanker booking helplines and resident reports in ${cityData.name}, Tamil Nadu.`;
    keywords = `${cityData.name} water supply problem, ${cityData.name} tanker helpline, ${cityData.name} drinking water`;
  } else if (issue === 'road-problem') {
    title = `${cityData.name} Road Conditions: Potholes, Traffic Diversions & Repairs`;
    description = `Real-time road maintenance updates, traffic diversions and municipal grievance status across ${cityData.name}, Tamil Nadu.`;
    keywords = `${cityData.name} road problem, ${cityData.name} traffic diversion, ${cityData.name} pothole complaint`;
  } else if (issue === 'scam') {
    title = `${cityData.name} Cyber Scam Alerts & National Helpline 1930 Warnings`;
    description = `Urgent fake EB bill SMS, part-time job and online fraud alerts verified for ${cityData.name} residents with 1930 cyber crime filing steps.`;
    keywords = `${cityData.name} cyber crime, fake eb bill sms, cyber helpline 1930`;
  } else if (issue === 'government-schemes') {
    title = `${cityData.name} Government Schemes: e-Sevai, Ration Card & Patta Camps`;
    description = `Upcoming Taluk office camps, Smart Ration Card corrections, Patta transfers and welfare scheme application guides in ${cityData.name}.`;
    keywords = `${cityData.name} esevai camps, ration card camp ${cityData.name}, patta chitta`;
  } else if (issue === 'education') {
    title = `${cityData.name} School & College Holiday Alerts: Rain Order & Collector Notices`;
    description = `Official Collectorate announcements on heavy rain holidays, exam schedule changes and educational updates for ${cityData.name}.`;
    keywords = `${cityData.name} school holiday today, collector order ${cityData.name}, heavy rain leave`;
  } else if (issue === 'healthcare') {
    title = `${cityData.name} Healthcare & Hospital Updates: GH, PHC & Emergency Helplines`;
    description = `Government Hospital (GH), Primary Health Centre facilities, free medical camps and emergency helplines in ${cityData.name}.`;
  }

  const socialTitle = `${title} | VizhiTN`;
  const canonicalUrl = `${SITE_URL}/${city}/${issue}`;
  const { reports, dataAvailable } = await fetchCityIssueData(city, issue);
  const robots = getCityIssueRobots({ dataAvailable, reportCount: reports.length });
  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', `${cityData.name} ${issueData.name} Live Updates`);
  ogUrl.searchParams.set('district', city);
  ogUrl.searchParams.set('category', issue);
  ogUrl.searchParams.set('urgency', 'medium');
  const ogImageUrl = ogUrl.toString();

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        'ta-IN': canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    robots,
    openGraph: {
      title: socialTitle,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

// ── STATIC PARAMS ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const issues = [
    'power-cut', 'water-issue', 'road-problem', 'scam', 'transport',
    'education', 'government-schemes', 'general', 'healthcare', 'environment'
  ];
  const paths = [];
  for (const city of BUILD_TIME_DISTRICT_SLUGS) {
    for (const issue of issues) {
      paths.push({ city, issue });
    }
  }
  return paths;
}

// ── SERVER COMPONENT ──────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const { city, issue } = await params;
  const cityData  = DISTRICT_MAP[city];
  const issueData = CATEGORY_MAP[issue];

  if (!cityData || !issueData) {
    notFound();
  }

  // ── 1. DB fetch ───────────────────────────────────────────────────────────
  const { reports, dataAvailable } = await fetchCityIssueData(city, issue);

  // ── 2. ISR freshness (indexBoost — unchanged) ─────────────────────────────
  const boost = evaluateIndexBoost(city, issue, null, reports.length);
  let finalReports = reports;
  if (boost.boostActive && boost.feedOrder !== 'created_date' && reports.length > 0) {
    const { reports: reordered, dataAvailable: reorderedDataAvailable } =
      await fetchCityIssueData(city, issue, boost.feedOrder);
    if (reorderedDataAvailable) finalReports = reordered;
  }

  // ── 3. AUTONOMOUS CORE — single call, 12 systems ──────────────────────────
  const latestDate = getLatestReportDate(finalReports);
  const latestDateLabel = formatReportDate(latestDate);

  const engine = await runAutonomousCoreAsync(
    city,
    issue,
    { reportCount: finalReports.length, latestReportDate: latestDate },
    // stateData: in production, load from KV store / edge cache
    { baselineScore: null, previousSmoothedScore: null, lastStableTier: 'mid', recoveryStartDate: null }
  );

  // ── Use ONLY stabilized outputs — never raw subsystem values ─────────────
  // All values below have passed through systemStabilityController (Stage 9).
  const {
    finalRankingScore,   // stabilized — may differ from rawFinalScore
    stableRankingScore,
    normalizedTier,      // hysteresis-stable + conflict-resolved tier
    driftStatus,
    decayFactor,
    recoveryFactor,
    authorityBoost,
    intentStrength,
    trendScore,
    crawlPriority,
    linkWeight,          // frozen during LOCK/HOLD
    sitemapPriority,
    action,
    decisions,           // built from stabilizedTier, not rawTier
    stability,           // { stabilityAction, systemConsensusLevel, conflictDetected, ... }
    subsystems,
    trends,
    outboundLinks,       // link budget respects linkOptimizerFrozen
    contentModules,
  } = engine;

  const { authorityData, driftResult, decayRecovery } = subsystems;

  // Stability metadata (read-only display + data attrs)
  const stabilityAction    = stability?.stabilityAction    ?? 'PASS';
  const consensusLevel     = stability?.systemConsensusLevel ?? 1.0;
  const conflictDetected   = stability?.conflictDetected   ?? false;
  const downstreamFrozen   = stability?.downstreamFrozen   ?? false;

  // Alignment (from Stage 8.5 in async path)
  const alignmentResult  = engine.alignmentResult || {};
  const alignmentScore   = alignmentResult.alignmentScore ?? 1.0;
  const mismatchDetected = alignmentResult.mismatchDetected ?? false;

  // Self-improving loop: systemMode (advisory display only)
  const loopOutput = computeWeightAdjustments(
    { avgAlignmentScore: alignmentScore, avgCTRRatio: 1.0, avgRankingScore: finalRankingScore, globalHealthScore: finalRankingScore },
    DEFAULT_SUBSYSTEM_WEIGHTS
  );
  const systemMode    = loopOutput.systemMode;
  const isTrendingNow = isPageTrending(trends, city, issue);
  const isSpike       = trendScore >= 1.0;
  const isRising      = trendScore >= 0.75 && !isSpike;

  // ── Stage 10 real-world signals ───────────────────────────────────────────
  // All values from real GSC + SERP position tracker.
  // finalRankingScore + normalizedTier are already real-world-adjusted above.
  const rw              = engine.realWorld ?? {};
  const rwFeedback      = rw.realWorldFeedback ?? {};
  const rwGsc           = rw.gscSignals ?? {};
  const rwPos           = rw.positionTrackResult ?? {};
  const rwOverride      = rw.overrideApplied ?? false;

  const serpPosition    = rwGsc.avgPosition   ?? null;
  const realCTR         = rwGsc.ctr           ?? null;
  const realImpressions = rwGsc.impressions   ?? null;
  const realWorldScore  = rwFeedback.realWorldScore  ?? null;
  const trendVelocity   = rwGsc.trendVelocity ?? 'none';
  const alignmentGap    = rwFeedback.alignmentGap    ?? 0;
  const movementClass   = rwPos.movementClass  ?? 'STABLE';
  const positionChange  = rwPos.positionChange ?? 0;
  const hasRealData     = rwFeedback.hasRealData ?? false;

  const canonicalUrl = `${SITE_URL}/${city}/${issue}`;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: cityData.name, url: `${SITE_URL}/${city}` },
    { name: issueData.name, url: canonicalUrl },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PageSchema
        url={canonicalUrl}
        name={`${cityData.name} ${issueData.name} Reports`}
        description={`Track ${issueData.name.toLowerCase()} in ${cityData.name}, Tamil Nadu.`}
        breadcrumbs={[
          { name: 'Home',         url: SITE_URL },
          { name: cityData.name,  url: `${SITE_URL}/${city}` },
          { name: issueData.name, url: canonicalUrl },
        ]}
        dateModified={latestDate || undefined}
      />

      {/* Civic authority schema — one clean entity, no spam */}
      {authorityData?.schemaCivicEntity && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              ...authorityData.schemaCivicEntity,
            }),
          }}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

        {/* ── Breadcrumb — server-rendered for Google ──────────────────────── */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/${city}`} className="hover:text-blue-600 transition-colors">{cityData.name}</Link>
          <span aria-hidden="true">›</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{issueData.plural}</span>
        </nav>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              VizhiTN Civic Alert
            </span>

          {/* Citizen trust badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                📍 {cityData.name} District
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ Verified Helplines
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {finalReports.length} Active Notice{finalReports.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight mt-3 sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
            {issue === 'power-cut' ? `${cityData.name} Power Cut Today: EB Shutdown Timings & Street Status` :
             issue === 'water-issue' ? `${cityData.name} Drinking Water Supply Alerts & Tanker Helplines` :
             issue === 'road-problem' ? `${cityData.name} Road Conditions, Potholes & Route Diversions` :
             issue === 'scam' ? `${cityData.name} Cyber Scam Alerts & 1930 Helpline Warnings` :
             `${cityData.name} ${issueData.name} Reports & Live Updates`}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1.5">
            {issue === 'power-cut' ? `${cityData.name} இன்று மின்தடை: TANGEDCO பராமரிப்பு பணிகள் மற்றும் மின் தடை பகுதிகள்` :
             issue === 'water-issue' ? `${cityData.name} குடிநீர் விநியோகம், குழாய் உடைப்பு மற்றும் டேங்கர் லாரி உதவி எண்கள்` :
             issue === 'road-problem' ? `${cityData.name} சாலை பழுது, மழைநீர் தேக்கம் மற்றும் போக்குவரத்து மாற்று வழிகள்` :
             `${cityData.name} மாவட்ட குடிமை தகவல்கள் மற்றும் அதிகாரப்பூர்வ உதவி எண்கள்`}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {finalReports.length > 0
              ? `${finalReports.length} verified report${finalReports.length !== 1 ? 's' : ''}${latestDateLabel ? ` — latest submitted ${latestDateLabel}` : ' from community submissions'}`
              : 'No active reports at this time'}
          </p>

          {/* Machine-readable signals — real-world + stability (Stages 9 + 10) */}
          <span
            data-ranking-score={finalRankingScore}
            data-stable-score={stableRankingScore}
            data-tier={normalizedTier}
            data-action={action}
            data-drift={driftStatus}
            data-decay={decayFactor}
            data-recovery={recoveryFactor}
            data-crawl-priority={crawlPriority}
            data-link-weight={linkWeight}
            data-sitemap-priority={sitemapPriority}
            data-system-mode={systemMode}
            data-stability-action={stabilityAction}
            data-consensus={consensusLevel}
            data-conflict={conflictDetected ? '1' : '0'}
            data-downstream-frozen={downstreamFrozen ? '1' : '0'}
            data-alignment-score={alignmentScore}
            data-mismatch={mismatchDetected ? '1' : '0'}
            data-real-world-score={realWorldScore ?? ''}
            data-serp-position={serpPosition ?? ''}
            data-real-ctr={realCTR ?? ''}
            data-real-impressions={realImpressions ?? ''}
            data-trend-velocity={trendVelocity}
            data-alignment-gap={alignmentGap}
            data-movement={movementClass}
            data-position-change={positionChange}
            data-real-data={hasRealData ? '1' : '0'}
            data-rw-override={rwOverride ? '1' : '0'}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {/* ── Above-The-Fold Inline Grievance Engine (Instant Action & Attribution) ── */}
        <section aria-label="File Civic Grievance" className="space-y-4">
          <InlineCivicReportCard district={cityData} category={issueData} />
          <VerifiedHelplineBar categorySlug={issue} />

          {/* ── WhatsApp Channel District Alerts Card ── */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>உடனடி மாவட்ட தகவல்கள் • WhatsApp Channel</span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Get {cityData.name} Power Cut & Rain Holiday Alerts on WhatsApp
              </h3>
              <p className="text-xs text-emerald-100 max-w-lg leading-relaxed">
                Join 15,000+ Tamil Nadu residents getting daily TANGEDCO shutdown notices, collector rain orders and civic alerts directly on WhatsApp.
              </p>
            </div>
            <a
              href="https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-black shadow-md transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto flex-shrink-0"
            >
              <span>வாட்ஸ்அப் சேனலில் இணைய</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        {/* ── Locality Sub-Directory Pills (Neighborhood Internal Linking Web) ── */}
        {cityData.neighborhoods && cityData.neighborhoods.length > 0 && (
          <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              📍 Explore {issueData.name} by {cityData.name} Neighborhood:
            </p>
            <div className="flex flex-wrap gap-2">
              {cityData.neighborhoods.map((neigh) => {
                const areaSlug = slugifyArea(neigh);
                return (
                  <Link
                    key={areaSlug}
                    href={`/area/${areaSlug}`}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {neigh}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Trending Alert ────────────────────────────────────────────── */}
        {isTrendingNow && decisions.trendingBlock && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {isSpike
                ? `⚡ Spike Alert: Unusually high ${issueData.name} reports in ${cityData.name} this week.`
                : `Trending: Rising ${issueData.name} activity detected in ${cityData.name}.`}
            </span>
          </div>
        )}

        {/* ── Stability Frozen Notice (internal — admin visibility) ─────── */}
        {downstreamFrozen && (
          <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 p-3 rounded-xl flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
              {stabilityAction}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Stability lock active — ranking adjustments paused. Consensus: {Math.round(consensusLevel * 100)}%
            </span>
          </div>
        )}

        {/* ── Real-world SERP signal card (visible when GSC data available) ─ */}
        {hasRealData && serpPosition !== null && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Live SERP Data
              </span>
              {rwOverride && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
                  Real-World Override Active
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Position</p>
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">#{serpPosition.toFixed(1)}</p>
                <p className={`text-[10px] font-semibold ${
                  positionChange < 0 ? 'text-green-600 dark:text-green-400' :
                  positionChange > 0 ? 'text-red-500 dark:text-red-400' :
                  'text-slate-400'
                }`}>
                  {positionChange < 0 ? '▲' : positionChange > 0 ? '▼' : '─'} {Math.abs(positionChange).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">CTR</p>
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{(realCTR * 100).toFixed(1)}%</p>
                <p className="text-[10px] text-slate-400">{movementClass}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Impressions</p>
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                  {realImpressions >= 1000 ? `${(realImpressions / 1000).toFixed(1)}k` : realImpressions}
                </p>
                <p className="text-[10px] text-slate-400">{trendVelocity}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Alignment</p>
                <p className={`text-lg font-bold ${
                  alignmentGap < 0.10 ? 'text-green-600 dark:text-green-400' :
                  alignmentGap < 0.20 ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-500 dark:text-red-400'
                }`}>{(alignmentGap * 100).toFixed(0)}% gap</p>
                <p className="text-[10px] text-slate-400">internal vs SERP</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Authority Contact Block (E-E-A-T) ────────────────────────── */}
        {authorityData?.contactBlock && action !== 'SUPPRESS' && (
          <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 p-5 rounded-2xl space-y-3">
            <h2 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">
              Official Contact
            </h2>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {authorityData.contactBlock.title}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {authorityData.contactBlock.content}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {authorityData.contactBlock.helpline && (
                <a
                  href={`tel:${authorityData.contactBlock.helpline}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📞 {authorityData.contactBlock.helpline}
                </a>
              )}
              {authorityData.contactBlock.portal && (
                <a
                  href={authorityData.contactBlock.portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-blue-400 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors"
                >
                  File Complaint Online ↗
                </a>
              )}
            </div>
            {decisions.authorityExpand && authorityData.contactBlock.escalation?.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-1">Escalation Path</p>
                <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 list-decimal list-inside">
                  {authorityData.contactBlock.escalation.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}

        {/* ── Decay / Recovery Notice (only on recovering pages) ─────── */}
        {decayRecovery?.healthStatus === 'recovering' && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 p-3 rounded-xl">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              📈 This page is recovering — increased report activity detected. Ranking signals improving.
            </p>
          </div>
        )}

        {/* ── SSR Intro paragraph — unique per city+issue, fixes thin content ─ */}
        <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-5 rounded-2xl">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            This page tracks live <strong>{issueData.name.toLowerCase()}</strong> reports from residents of{' '}
            <strong>{cityData.name}</strong>
            {cityData.neighborhoods?.length > 0 && (
              <>, including {cityData.neighborhoods.slice(0, 3).join(', ')}, and nearby areas</>
            )}.
            {' '}All reports are submitted by citizens on VizhiTN and verified by the community.
            {issueData.helpline && (
              <> For urgent {issueData.name.toLowerCase()} issues in {cityData.name}, call{' '}
              <strong>{issueData.authority || 'the helpline'}</strong> at <strong>{issueData.helpline}</strong>.</>
            )}
          </p>
        </section>

        {/* ── Content Modules (autonomous-core assembled) ───────────────── */}
        <section className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Local Operations &amp; Overview
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {contentModules.map((module, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {module.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {module.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Reports Feed ──────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">
            Recent Reports ({finalReports.length})
          </h2>
          {finalReports.length > 0 ? (
            <div className="space-y-3">
              {finalReports.map(report => (
                <div key={report.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-sm">{report.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.description}</p>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                    <span>Upvotes: {report.upvotes || 0}</span>
                    <span>Reported: {new Date(report.created_date).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-xl text-center space-y-3">
              <p className="text-xs text-slate-500">
                {dataAvailable
                  ? 'No active complaints submitted recently in this category.'
                  : 'The community report feed is temporarily unavailable. Please check again shortly.'}
              </p>
              {issueData.authority && (
                <div className="max-w-md mx-auto p-4 bg-white dark:bg-slate-900 border rounded-lg text-left">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Grievance Contact</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    For {issueData.plural.toLowerCase()} in {cityData.name}, contact {issueData.authority} at helpline: <strong>{issueData.helpline || '1912'}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── ISR Activity Boost Block ──────────────────────────────────── */}
        {boost.recentActivityBlock && (
          <section className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 p-4 rounded-xl">
            <p className="text-xs font-semibold text-green-800 dark:text-green-300">
              {boost.recentActivityBlock.title}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {boost.recentActivityBlock.content}
            </p>
          </section>
        )}

        {/* ── Adaptive Internal Links (autonomous-core ranked) ──────────── */}
        {outboundLinks.length > 0 && (
          <section className="border-t pt-8 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Related Local Civic Updates
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {outboundLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="block text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline-offset-2 hover:underline truncate"
                  >
                    {link.anchorText}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Neighboring Districts Grid ─────────────────────────────── */}
        <section className="border-t pt-6">
          <NearbyDistrictLinks districtSlug={city} />
        </section>

      </main>
    </>
  );
}
