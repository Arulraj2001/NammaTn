// src/app/(user)/[city]/[issue]/page.jsx
// Production programmatic SEO page — Next.js App Router, Server Component only.
//
// AUTONOMOUS RANKING ENGINE v4 — autonomousSeoCore integration.
// Single call: runAutonomousCoreAsync() owns the entire 12-system pipeline.
// page.jsx only handles: DB fetch → core call → render.
//
// SEO PHASE 1 FIXES:
// - generateStaticParams covers ALL 38 districts × 6 categories (228 pages)
// - Enriched meta description with neighborhood names
// - District+category FAQ structured data for rich results
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
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { DISTRICT_MAP, DISTRICTS, CATEGORY_MAP, SITE_URL } from '@/lib/seo-data';
import PageSchema from '@/components/seo/PageSchema';

import { runAutonomousCoreAsync }  from '@/lib/seo/autonomousSeoCore';
import { resolveQueryIntent }      from '@/lib/seo/queryIntentEngine';
import { evaluateIndexBoost }      from '@/lib/seo/indexBoost';
import { isPageTrending }          from '@/lib/seo/trendDetector';
import { DEFAULT_SUBSYSTEM_WEIGHTS, computeWeightAdjustments } from '@/lib/seo/selfImprovingSeoLoop';

export const revalidate = 3600;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
  );
}

// ── DB FETCH ──────────────────────────────────────────────────────────────────
async function fetchCityIssueData(citySlug, issueSlug, orderField = 'created_date') {
  try {
    const supabase = getSupabase();
    const targetSlugs = [issueSlug];
    if (issueSlug === 'electricity')         targetSlugs.push('power-cut');
    if (issueSlug === 'power-cut')           targetSlugs.push('electricity');
    if (issueSlug === 'water-sanitation')    targetSlugs.push('water-issue');
    if (issueSlug === 'water-issue')         targetSlugs.push('water-sanitation');
    if (issueSlug === 'road-infrastructure') targetSlugs.push('road-problem');
    if (issueSlug === 'road-problem')        targetSlugs.push('road-infrastructure');

    const { data: reports } = await supabase
      .from('unified_explore_feed')
      .select('id,title:title_en,description:content_en,area_slug,district_slug,category_slug,post_type,created_date,status,upvotes,downvotes')
      .eq('district_slug', citySlug)
      .in('category_slug', targetSlugs)
      .eq('status', 'active')
      .order(orderField, { ascending: false })
      .limit(20);

    return { reports: reports || [] };
  } catch (e) {
    console.error('[SEO Page] Fetch error:', e.message);
    return { reports: [] };
  }
}

// Metadata generation and page rendering can run independently for the same URL.
// Cache the shared Supabase result so one request does not hit the database twice.
function getCachedCityIssueData(citySlug, issueSlug, orderField = 'created_date') {
  return unstable_cache(
    () => fetchCityIssueData(citySlug, issueSlug, orderField),
    ['city-issue-reports', citySlug, issueSlug, orderField],
    { revalidate: 3600 },
  )();
}

// ── METADATA ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { city, issue } = params;
  const cityData  = DISTRICT_MAP[city];
  const issueData = CATEGORY_MAP[issue];

  if (!cityData || !issueData) {
    return { title: 'Civic Report Page', robots: { index: false, follow: false } };
  }

  const { reports } = await getCachedCityIssueData(city, issue);

  const intentData      = resolveQueryIntent(city, issue, 0);
  const primaryKw       = intentData.primaryKeywords?.[0] || issueData.descriptionFragment;
  const neighborhoodStr = cityData.neighborhoods?.slice(0, 2).join(' and ') || cityData.name;
  const title           = `${cityData.name} ${issueData.name} Reports Today | VizhiTN`;
  const description     =
    `Live tracking of ${primaryKw} in ${cityData.name}, Tamil Nadu — covering ${neighborhoodStr} and surrounding areas. ` +
    `View citizen reports, helpline details, and contact for ${issueData.authority || 'relevant authorities'}. Updated hourly.`;
  const canonicalUrl = `${SITE_URL}/${city}/${issue}/`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: reports.length > 0
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1 } }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph:  { title, description, url: canonicalUrl, type: 'website',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }] },
    keywords:   intentData.localKeywords?.slice(0, 5).join(', '),
  };
}

// ── STATIC PARAMS ─────────────────────────────────────────────────────────────
// ALL 38 districts × 6 categories = 228 pages pre-rendered at build time
export async function generateStaticParams() {
  const issues = ['power-cut', 'water-issue', 'road-problem', 'scam', 'jobs', 'stay'];
  return DISTRICTS.flatMap(d => issues.map(issue => ({ city: d.slug, issue })));
}

// Build district+category-specific FAQ structured data
function buildCategoryFAQ(cityData, issueData) {
  const city  = cityData.name;
  const issue = issueData.name;
  const auth  = issueData.authority || 'the relevant government authority';
  const line  = issueData.helpline  || '1912';
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I report a ${issue.toLowerCase()} in ${city}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Report a ${issue.toLowerCase()} in ${city} on VizhiTN by clicking "Report Issue" and selecting ${city} and the ${issue} category. Your report is instantly visible to the community and relevant officials.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the helpline for ${issue.toLowerCase()} in ${city}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For ${issue.toLowerCase()} in ${city}, contact ${auth} at helpline ${line}. You can also track the issue and see if others in ${city} have faced the same problem on VizhiTN.`,
        },
      },
      {
        '@type': 'Question',
        name: `How long does it take to resolve ${issue.toLowerCase()} in ${city}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Resolution times for ${issue.toLowerCase()} in ${city} vary by severity. On VizhiTN, you can track the status of your report and see historical resolution data from past community reports in ${city}.`,
        },
      },
    ],
  };
}

// ── SERVER COMPONENT ──────────────────────────────────────────────────────────
export default async function Page({ params }) {
  const { city, issue } = params;
  const cityData  = DISTRICT_MAP[city];
  const issueData = CATEGORY_MAP[issue];

  if (!cityData || !issueData) {
    notFound();
  }

  // ── 1. DB fetch ───────────────────────────────────────────────────────────
  const { reports } = await getCachedCityIssueData(city, issue);

  // ── 2. ISR freshness (indexBoost — unchanged) ─────────────────────────────
  const boost = evaluateIndexBoost(city, issue, null, reports.length);
  let finalReports = reports;
  if (boost.boostActive && boost.feedOrder !== 'created_date' && reports.length > 0) {
    const { reports: reordered } = await getCachedCityIssueData(city, issue, boost.feedOrder);
    finalReports = reordered;
  }

  // ── 3. AUTONOMOUS CORE — single call, 12 systems ──────────────────────────
  const latestDate = finalReports[0]?.created_date || null;

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

  const canonicalUrl = `${SITE_URL}/${city}/${issue}/`;


  return (
    <>
      <PageSchema
        url={canonicalUrl}
        name={`${cityData.name} ${issueData.name} Reports`}
        description={`Track ${issueData.name.toLowerCase()} in ${cityData.name}, Tamil Nadu.`}
        breadcrumbs={[
          { name: 'Home',         url: SITE_URL },
          { name: cityData.name,  url: `${SITE_URL}/${city}/` },
          { name: issueData.name, url: canonicalUrl },
        ]}
        dateModified={boost.lastModified}
      />

      {/* FAQ Structured Data — city+issue specific Q&A for rich results */}
      {(() => {
        const faqSchema = buildCategoryFAQ(cityData, issueData);
        return (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        );
      })()}

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
          <Link href={`/${city}/`} className="hover:text-blue-600 transition-colors">{cityData.name}</Link>
          <span aria-hidden="true">›</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{issueData.plural}</span>
        </nav>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              VizhiTN Civic Alert
            </span>

          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mt-1 sm:text-4xl">
            {cityData.name} {issueData.name} Reports Today
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {finalReports.length > 0
              ? `${finalReports.length} active report${finalReports.length !== 1 ? 's' : ''} — updated every hour`
              : 'No active reports at this time'}
          </p>

        </div>

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
                No active complaints submitted recently in this category.
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

      </main>
    </>
  );
}
