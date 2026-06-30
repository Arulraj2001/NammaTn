// src/app/(user)/[city]/[issue]/page.jsx
// Production programmatic SEO page — Next.js App Router, Server Component only.
//
// FIXES APPLIED:
// CRIT-01: Breadcrumb URL corrected from /district/[city]/ → /[city]/
// CRIT-02: indexBoost no longer fires universally; passes real reportCount
// CRIT-03: Removed non-deterministic "Last Updated" timestamp from visible HTML
// FIX-07:  Removed tn_today DB query — lastIndexedDate defaults null safely

import React from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { DISTRICT_MAP, CATEGORY_MAP, SITE_URL } from '@/lib/seo-data';
import PageSchema from '@/components/seo/PageSchema';

// SEO Hardening Imports
import { generateContentEntropy } from '@/lib/seo/contentEntropy';
import { getTrendingPairs } from '@/lib/seo/trendEngine';
import { evaluateIndexBoost } from '@/lib/seo/indexBoost';
import { getOutboundLinks } from '@/lib/seo/linkVelocity';

export const revalidate = 3600;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
  );
}

// ── SERVER DATA FETCHER ───────────────────────────────────────────────────────
// FIX-07: Single DB call — removed tn_today secondary query entirely.
async function fetchCityIssueData(citySlug, issueSlug, orderField = 'created_date') {
  try {
    const supabase = getSupabase();

    // Map category synonyms for accurate local routing
    const targetSlugs = [issueSlug];
    if (issueSlug === "electricity") targetSlugs.push("power-cut");
    if (issueSlug === "power-cut") targetSlugs.push("electricity");
    if (issueSlug === "water-sanitation") targetSlugs.push("water-issue");
    if (issueSlug === "water-issue") targetSlugs.push("water-sanitation");
    if (issueSlug === "road-infrastructure") targetSlugs.push("road-problem");
    if (issueSlug === "road-problem") targetSlugs.push("road-infrastructure");

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

// ── GENERATE METADATA ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { city, issue } = params;
  const cityData = DISTRICT_MAP[city];
  const issueData = CATEGORY_MAP[issue];

  if (!cityData || !issueData) {
    return { title: 'Civic Report Page | VizhiTN', robots: { index: false } };
  }

  const title = `${cityData.name} ${issueData.name} Reports Today | VizhiTN`;
  const description = `Live tracking of ${issueData.descriptionFragment} in ${cityData.name}, Tamil Nadu. View citizen reports, helpline details, and official response channels.`;
  const canonicalUrl = `${SITE_URL}/${city}/${issue}/`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: { title, description, url: canonicalUrl, type: 'website' },
  };
}

// ── STATIC GENERATION: Pre-render Tier 1 at build time ───────────────────────
export async function generateStaticParams() {
  const priorityCities = ['chennai', 'coimbatore', 'madurai', 'salem', 'tiruchirappalli'];
  const priorityIssues = ['power-cut', 'water-issue', 'road-problem', 'scam', 'jobs', 'stay'];
  return priorityCities.flatMap(city => priorityIssues.map(issue => ({ city, issue })));
}

// ── SERVER RENDERED COMPONENT ─────────────────────────────────────────────────
export default async function Page({ params }) {
  const { city, issue } = params;
  const cityData = DISTRICT_MAP[city];
  const issueData = CATEGORY_MAP[issue];

  if (!cityData || !issueData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold">Invalid District or Category</h1>
        <Link href="/" className="mt-4 text-blue-600 underline">Return Home</Link>
      </div>
    );
  }

  // 1. Fetch reports (single DB call)
  const { reports } = await fetchCityIssueData(city, issue);

  // 2. Evaluate index boost (FIX-01: pass reportCount; no boost if no real data)
  //    lastIndexedDate is null — no tn_today query. Boost only fires if a real
  //    seo_index_log table provides this value in future.
  const boost = evaluateIndexBoost(city, issue, null, reports.length);

  // Re-fetch with boosted ordering only if boost is active and reports exist
  let finalReports = reports;
  if (boost.boostActive && boost.feedOrder !== 'created_date' && reports.length > 0) {
    const { reports: reordered } = await fetchCityIssueData(city, issue, boost.feedOrder);
    finalReports = reordered;
  }

  // 3. Real-Time Trend Engine
  const trendingPairs = await getTrendingPairs();
  const isTrendingNow = trendingPairs.some(t => t.city === city && t.issue === issue);

  // 4. Content Entropy (deterministic, unique per city×issue)
  const stats = { totalReports: finalReports.length };
  const contentModules = generateContentEntropy(cityData, issueData, stats, finalReports);

  // 5. Link Velocity (deterministic anchor text, max 8 links)
  const outboundLinks = getOutboundLinks(city, issue, trendingPairs, {
    [`${city}:${issue}`]: boost,
  });

  const canonicalUrl = `${SITE_URL}/${city}/${issue}/`;

  return (
    <>
      {/* CRIT-01 FIX: breadcrumb uses /[city]/ not /district/[city]/ */}
      <PageSchema
        url={canonicalUrl}
        name={`${cityData.name} ${issueData.name} Reports`}
        description={`Track ${issueData.name.toLowerCase()} in ${cityData.name}, Tamil Nadu.`}
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: cityData.name, url: `${SITE_URL}/${city}/` },
          { name: issueData.name, url: canonicalUrl },
        ]}
        dateModified={boost.lastModified}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

        {/* CRIT-03 FIX: No volatile timestamp in visible HTML */}
        <div className="border-b pb-6">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            VizhiTN Civic Alert
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 sm:text-4xl">
            {cityData.name} {issueData.name} Reports Today
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {finalReports.length > 0
              ? `${finalReports.length} active report${finalReports.length !== 1 ? 's' : ''} — updated every hour`
              : 'No active reports at this time'}
          </p>
        </div>

        {/* Trending Alert */}
        {isTrendingNow && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Trending Alert: High report velocity detected in {cityData.name} for this category.
            </span>
          </div>
        )}

        {/* Content Entropy blocks */}
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

        {/* Reports Feed */}
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

        {/* Internal Linking (max 8, deterministic anchors) */}
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
