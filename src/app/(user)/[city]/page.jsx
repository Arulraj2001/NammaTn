// src/app/(user)/[city]/page.jsx
// City/District hub page — fully server-rendered.
//
// SEO PHASE 1 FIXES:
// - generateStaticParams now covers ALL 38 TN districts (was only 10)
// - Rich unique SSR description per district using neighborhoods data
// - Visible report count as server-rendered text
// - FAQ structured data (how to complain in this district)
// - AdministrativeArea schema for geo-entity signals
// - "About VizhiTN" E-E-A-T paragraph for trust signals

import React from 'react';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { DISTRICT_MAP, DISTRICTS, CATEGORIES, SITE_URL } from '@/lib/seo-data';
import PageSchema from '@/components/seo/PageSchema';
import { NearbyDistrictLinks, DistrictCategoryLinks } from '@/components/seo/InternalLinks';

export const revalidate = 3600;

// DistrictDetail renders in server HTML on first request
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

// Fetch total active report count for the district
async function fetchReportCount(districtSlug) {
  try {
    const supabase = getSupabase();
    const { count } = await supabase
      .from('unified_explore_feed')
      .select('id', { count: 'exact', head: true })
      .eq('district_slug', districtSlug)
      .eq('status', 'active');
    return count || 0;
  } catch {
    return 0;
  }
}

// SEO PHASE 1 FIX: generateStaticParams now covers ALL 38 TN districts
export async function generateStaticParams() {
  return DISTRICTS.map(d => ({ city: d.slug }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const district = DISTRICT_MAP[city];

  if (!district) {
    return { title: 'District Reports | VizhiTN', robots: { index: false, follow: false } };
  }

  const neighborhoodStr = district.neighborhoods?.slice(0, 3).join(', ') || district.name;
  const title = `${district.name} Civic Issue Reports & Alerts | VizhiTN`;
  const description =
    `Live citizen reports from ${district.name}, Tamil Nadu — covering ${neighborhoodStr} and surrounding areas. ` +
    `Track power cuts, water supply failures, road problems, scam alerts, job listings, and more. ` +
    `Updated hourly by local residents on VizhiTN.`;
  const canonicalUrl = `${SITE_URL}/${city}/`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: `${district.name} civic reports on VizhiTN` }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    },
  };
}

// Build district-specific FAQ structured data
function buildDistrictFAQ(district) {
  const name = district.name;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I report a civic issue in ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can report any civic issue in ${name} by visiting VizhiTN (vizhitn.in), clicking "Report Issue", and selecting ${name} as your district. Your report will be visible to the community and relevant authorities instantly.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the TANGEDCO helpline for power cuts in ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The TANGEDCO helpline for electricity and power cut complaints in ${name} is 1912. You can also post power outage reports on VizhiTN so other residents in ${name} stay informed.`,
        },
      },
      {
        '@type': 'Question',
        name: `How to complain about water supply failure in ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `For water supply failures in ${name}, contact the TWAD Board or the Municipal Corporation water department at helpline 1800 425 3555. Post a report on VizhiTN to alert your neighbours.`,
        },
      },
      {
        '@type': 'Question',
        name: `Where can I report road problems and potholes in ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Report road damage and potholes in ${name} to the Tamil Nadu Highways Department at 1800 425 0110, or to the ${name} Municipal Corporation. Track reports and resolution progress on VizhiTN.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is VizhiTN available in ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. VizhiTN covers all 38 districts of Tamil Nadu including ${name}. Residents of ${district.neighborhoods?.slice(0, 3).join(', ') || name} and surrounding areas can report issues, browse local alerts, find jobs and stays, and connect with the community.`,
        },
      },
    ],
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

  // Fetch data server-side — present in HTML on first crawl
  const [topReports, reportCount] = await Promise.all([
    fetchTopReports(city),
    fetchReportCount(city),
  ]);

  const faqSchema = buildDistrictFAQ(district);

  return (
    <>
      <PageSchema
        url={canonicalUrl}
        name={`${district.name} Civic Issue Reports & Alerts`}
        description={
          `Live citizen reports from ${district.name}, Tamil Nadu — power cuts, water issues, ` +
          `road problems, scam alerts, jobs, and more.`
        }
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: district.name, url: canonicalUrl },
        ]}
      />

      {/* FAQ Structured Data — district-specific Q&A for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* AdministrativeArea schema — geo-entity signal for local SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AdministrativeArea',
            name: district.name,
            description: `Civic issues and community reports for ${district.name} district, Tamil Nadu, India.`,
            url: canonicalUrl,
            containedInPlace: {
              '@type': 'State',
              name: 'Tamil Nadu',
              containedInPlace: { '@type': 'Country', name: 'India' },
            },
          }),
        }}
      />

      {/* ── Server-rendered above-the-fold content — visible to Googlebot without JS ── */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">

        {/* Breadcrumb — server-rendered for Google */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-4 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">{district.name}</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-slate-100">
          {district.name} Civic Reports &amp; Alerts
        </h1>

        {/* Rich unique description — key for thin content fix */}
        <div className="mt-3 mb-6 space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            VizhiTN tracks live civic issues in <strong>{district.name}</strong> district, Tamil Nadu — reported directly
            by residents from {district.neighborhoods?.slice(0, 4).join(', ')} and nearby areas.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Browse active complaints about power cuts, water supply failures, road damage, scam alerts,
            job opportunities, and rooms for rent. Every report is verified by the community and updated in real time.
          </p>

          {/* Report count — SSR freshness signal */}
          {reportCount > 0 && (
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              📋 {reportCount.toLocaleString('en-IN')} active civic report{reportCount !== 1 ? 's' : ''} in {district.name} right now
            </p>
          )}
        </div>

        {/* Issue category quick links — server-rendered, crawlable */}
        <nav aria-label={`Issue categories in ${district.name}`} className="mb-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Browse by Issue</p>
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
                <Link href={`/post/${report.id}`} className="group">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {report.title_en}
                  </h3>
                </Link>
                {report.content_en && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.content_en}</p>
                )}
                <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                  {report.category_slug && <span className="capitalize">{report.category_slug.replace(/-/g, ' ')}</span>}
                  {report.area_slug && <span className="capitalize">{report.area_slug.replace(/-/g, ' ')}</span>}
                  <span>↑ {report.upvotes || 0}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* About VizhiTN in this district — E-E-A-T trust signal */}
        <section className="mb-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            About VizhiTN in {district.name}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            VizhiTN is Tamil Nadu&apos;s citizen civic platform. Residents of {district.name} use VizhiTN to report local issues,
            warn neighbours about scams, share job openings, and track government resolution of civic problems.
            {district.nearby?.length > 0 && ` VizhiTN also covers nearby districts: ${district.nearby.map(s => DISTRICT_MAP[s]?.name || s).join(', ')}.`}
            {' '}All reports are publicly visible, anonymous by choice, and updated continuously.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/how-to-use"
              className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-200"
            >
              How to use VizhiTN →
            </Link>
            <Link
              href="/about"
              className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-200"
            >
              About us →
            </Link>
          </div>
        </section>

        {/* Nearby districts — inline internal linking */}
        {district.nearby?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Nearby Districts
            </h2>
            <ul className="flex flex-wrap gap-2">
              {district.nearby.map(slug => {
                const nearby = DISTRICT_MAP[slug];
                if (!nearby) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/${slug}/`}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline underline-offset-2"
                    >
                      {nearby.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
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
