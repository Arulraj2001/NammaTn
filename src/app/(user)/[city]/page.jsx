// src/app/(user)/[city]/page.jsx
// City/District hub page — fully server-rendered.
import React from 'react';
import nextDynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { DISTRICT_MAP, BUILD_TIME_DISTRICT_SLUGS, DISTRICTS, SITE_URL } from '@/lib/seo-data';
import { getDistrictBySlug } from '@/lib/districts';
import { getDistrictMetaDescription } from '@/lib/metaDescription';
import PageSchema from '@/components/seo/PageSchema';
import { NearbyDistrictLinks, DistrictCategoryLinks } from '@/components/seo/InternalLinks';
import { DISTRICT_CIVIC_DATA } from '@/lib/districtCivicData';

export const revalidate = 3600;

// DistrictDetail renders with SSR enabled
const DistrictDetail = nextDynamic(() => import('@/views/DistrictDetail'), { ssr: true });

// Pre-render all 38 districts at build time so they exist as static assets on Cloudflare CDN
export async function generateStaticParams() {
  return BUILD_TIME_DISTRICT_SLUGS.map((slug) => ({ city: slug }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const district = DISTRICT_MAP[city];

  if (!district) {
    notFound();
  }

  const title = `${district.name} Civic Issue Reports, Power Cuts & Alerts`;
  const socialTitle = `${title} | VizhiTN`;
  const description = getDistrictMetaDescription(district.name);
  const canonicalUrl = `${SITE_URL}/${city}`;

  const districtInfo = getDistrictBySlug(city);
  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', `${district.name} Civic Alerts & Public Reports`);
  if (districtInfo?.name_ta) {
    ogUrl.searchParams.set('title_ta', `${districtInfo.name_ta} மாவட்ட மக்கள் புகார்கள் & எச்சரிக்கைகள்`);
  }
  ogUrl.searchParams.set('district', city);
  ogUrl.searchParams.set('category', 'general');
  ogUrl.searchParams.set('urgency', 'medium');
  const ogImageUrl = ogUrl.toString();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        'ta-IN': canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${district.name} civic reports on VizhiTN`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    },
  };
}

export default async function Page({ params }) {
  const { city } = await params;
  const district = DISTRICT_MAP[city];
  const canonicalUrl = `${SITE_URL}/${city}`;

  if (!district) {
    notFound();
  }

  const civicInfo = DISTRICT_CIVIC_DATA[city] || {};

  return (
    <>
      <PageSchema
        url={canonicalUrl}
        name={`${district.name} Civic Issue Reports & Alerts`}
        description={
          `Citizen-submitted reports from ${district.name}, Tamil Nadu — power cuts, water issues, ` +
          `road problems, scam alerts, and civic updates.`
        }
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: district.name, url: canonicalUrl },
        ]}
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

      {/* DistrictDetail: Unified interactive and responsive district hub */}
      <DistrictDetail initialSlug={city} />

      {/* District Civic Governance & Redressal Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 text-slate-700 dark:text-slate-300">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {district.name} District Civic Governance, Grievance Redressal & Essential Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verified administrative directory for reporting civic grievances, tracking public works, and contacting departments in {district.name}, Tamil Nadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm leading-relaxed">
            {/* 1. Collectorate & Administrative Headquarters */}
            <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🏛️ District Administration & Collectorate
              </h3>
              <p>
                Headquarters at <strong>{civicInfo.headquarters || district.name}</strong>, supervised by the District Collector & District Magistrate. Citizen grievance petitions are received every Monday morning at the Collectorate Office during the <strong>Weekly Grievance Redressal Day (மக்கள் குறைதீர்க்கும் நாள்)</strong>.
              </p>
              {civicInfo.collectorateAddress && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Collectorate Address:</strong> {civicInfo.collectorateAddress}
                </p>
              )}
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>District Disaster Control Room:</strong> Dial <code>1077</code> (24x7 toll-free during floods, cyclones & emergencies)</li>
                <li><strong>Official District Portal:</strong> <a href={`https://${city}.nic.in`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">{city}.nic.in</a></li>
                <li><strong>Chief Minister Helpline:</strong> Dial <code>1100</code> (<a href="https://cmhelpline.tnega.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">cmhelpline.tnega.org</a>)</li>
              </ul>
            </div>

            {/* 2. Municipal & Local Civic Body */}
            <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🏙️ Local Civic Authority & Public Works
              </h3>
              <p>
                Primary civic services, municipal sanitation, road maintenance, and building approvals are administered by <strong>{civicInfo.localBody || `${district.name} Municipality`}</strong>.
              </p>
              {civicInfo.localBodyDetails && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Administrative Scope:</strong> {civicInfo.localBodyDetails}
                </p>
              )}
              {civicInfo.localBodyHelpline && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Civic Helpline:</strong> <code>{civicInfo.localBodyHelpline}</code>
                </p>
              )}
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Solid Waste & Sanitation:</strong> Daily municipal door-to-door waste collection</li>
                <li><strong>Public Health:</strong> Mosquito fogging and vector control via District Health Society</li>
              </ul>
            </div>

            {/* 3. Revenue Taluks & Geographic Localities */}
            <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🗺️ Revenue Divisions & Taluks
              </h3>
              <p>
                For patta-chitta, community certificates, and land revenue services, citizens can approach their respective Taluk Offices across {district.name}:
              </p>
              {civicInfo.taluks && civicInfo.taluks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {civicInfo.taluks.map((taluk) => (
                    <span key={taluk} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {taluk}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Online Land Records Portal: <a href="https://eservices.tn.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">eservices.tn.gov.in</a>
              </p>
            </div>

            {/* 4. Drinking Water & Public Health */}
            <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                💧 Water Resources & Healthcare
              </h3>
              <p className="text-xs">
                <strong>Primary Water Supply:</strong> {civicInfo.waterSupply || `TWAD Board combined river drinking water supply schemes across ${district.name}.`}
              </p>
              {civicInfo.majorHospitals && civicInfo.majorHospitals.length > 0 && (
                <div>
                  <strong className="text-xs block text-slate-900 dark:text-white mb-1">Key Government Hospitals:</strong>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                    {civicInfo.majorHospitals.map(hosp => (
                      <li key={hosp}>{hosp}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ambulance Emergency: Dial <code>108</code> | Health Helpline: Dial <code>104</code>
              </p>
            </div>

            {/* 5. Electricity & TANGEDCO Maintenance */}
            <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ⚡ Electricity & TANGEDCO Circles
              </h3>
              <p className="text-xs">
                Power transmission is maintained by <strong>{civicInfo.electricityCircle || `TANGEDCO ${district.name} Electricity Distribution Circle`}</strong>. Substation maintenance shutdowns occur on scheduled weekdays between 9:00 AM and 2:00 PM.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li><strong>Minnalagam 24x7 Helpline:</strong> Dial <code>1912</code> (Toll-Free)</li>
                <li><strong>TANGEDCO WhatsApp Grievance:</strong> <code>94987 94987</code></li>
                <li><strong>Live Shutdown Alerts:</strong> <a href={`/power-cuts-today-tamil-nadu/${city}`} className="text-blue-600 dark:text-blue-400 underline font-semibold">View {district.name} Power Cut Schedule</a></li>
              </ul>
            </div>

            {/* 6. Transport & Connectivity Infrastructure */}
            <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🚌 Major Transport Hubs & Connectivity
              </h3>
              <p className="text-xs">
                Key railway junctions and state transport (TNSTC / SETC) bus stands serving {district.name}:
              </p>
              {civicInfo.transportHubs && civicInfo.transportHubs.length > 0 && (
                <ul className="list-disc pl-5 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {civicInfo.transportHubs.map(hub => (
                    <li key={hub}>{hub}</li>
                  ))}
                </ul>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                School/College Weather Updates: <a href={`/school-college-holiday-alerts/${city}`} className="text-blue-600 dark:text-blue-400 underline font-semibold">Check {district.name} Holiday Status</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal linking section for SEO crawlers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 border-t border-slate-100 dark:border-slate-800">
        <DistrictCategoryLinks districtSlug={city} districtName={district.name} />
        <NearbyDistrictLinks districtSlug={city} />
      </div>
    </>
  );
}
