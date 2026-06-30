// src/app/(user)/[city]/page.jsx
// City/District hub page — fully server-rendered.
//
// FIX 2 & 10: Removed ssr:false dynamic import of DistrictDetail.
// Main content (top reports) is now fetched server-side and rendered in HTML.
// DistrictDetail is rendered with ssr:true for interactive elements only.

import React from 'react';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { DISTRICT_MAP, DISTRICTS, CATEGORIES, SITE_URL } from '@/lib/seo-data';
import PageSchema from '@/components/seo/PageSchema';
import { NearbyDistrictLinks, DistrictCategoryLinks } from '@/components/seo/InternalLinks';

export const revalidate = 3600;

// FIX 10: ssr:true — DistrictDetail renders in server HTML on first request
const DistrictDetail = nextDynamic(() => import('@/views/DistrictDetail'), { ssr: true });

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
  );
}

// Server-side: fetch recent top reports per district for above-the-fold server HTML
async function fetchTopReports(districtSlug) {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('unified_explore_feed')
      .select('id,title_en,content_en,category_slug,area_slug,created_date,upvotes')
      .eq('district_slug', districtSlug)
      .eq('status', 'active')
      .order('upvotes', { ascending: false })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

// FIX MED-04: generateStaticParams — Tier 1 city hubs pre-rendered at build time
export async function generateStaticParams() {
  return [
    'chennai', 'coimbatore', 'madurai', 'salem', 'tiruchirappalli',
    'tirunelveli', 'erode', 'vellore', 'thoothukudi', 'tiruppur',
  ].map(city => ({ city }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const district = DISTRICT_MAP[city];

  if (!district) {
    return { title: 'District Reports | VizhiTN', robots: { index: false, follow: false } };
  }

  const title = `${district.name} Civic Issue Reports Today | VizhiTN`;
  const description =
    `Live citizen reports from ${district.name}, Tamil Nadu — power cuts, water issues, ` +
    `road problems, scam alerts, jobs, and more. Track what's happening in your district on VizhiTN.`;
  const canonicalUrl = `${SITE_URL}/${city}/`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, type: 'website' },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1 },
    },
  };
}

export default async function Page({ params }) {
  const { city } = await params;
  const district = DISTRICT_MAP[city];
  const canonicalUrl = `${SITE_URL}/${city}/`;

  if (!district) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold">District Not Found</h1>
        <Link href="/" className="mt-4 text-blue-600 underline">Return Home</Link>
      </div>
    );
  }

  // FIX 2: Top reports fetched server-side — present in HTML on first crawl
  const topReports = await fetchTopReports(city);

  return (
    <>
      <PageSchema
        url={canonicalUrl}
        name={`${district.name} Civic Issue Reports Today`}
        description={
          `Live citizen reports from ${district.name}, Tamil Nadu — power cuts, water issues, ` +
          `road problems, scam alerts, jobs, and more.`
        }
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: district.name, url: canonicalUrl },
        ]}
      />

      {/* Server-rendered above-the-fold content — visible to Googlebot without JS */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-100">
          {district.name} Civic Reports
        </h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Live community reports from {district.name}, Tamil Nadu
        </p>

        {/* Issue category quick links — server-rendered, crawlable */}
        <nav aria-label={`Issue categories in ${district.name}`} className="mb-6">
          <ul className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <li key={cat.slug}>
                <Link
                  href={`/${city}/${cat.slug}/`}
                  className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  {cat.plural}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Top reports — server-rendered HTML for Googlebot */}
        {topReports.length > 0 && (
          <section className="mb-8 space-y-3">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Top Reports in {district.name}
            </h2>
            {topReports.map(report => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {report.title_en}
                </h3>
                {report.content_en && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.content_en}</p>
                )}
                <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                  {report.category_slug && <span>{report.category_slug.replace(/-/g, ' ')}</span>}
                  <span>↑ {report.upvotes || 0}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* DistrictDetail: ssr:true — full interactive district view */}
      <DistrictDetail />

      {/* Internal linking section */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 border-t border-slate-100 dark:border-slate-800">
        <DistrictCategoryLinks districtSlug={city} districtName={district.name} />
        <NearbyDistrictLinks districtSlug={city} />
      </div>
    </>
  );
}
