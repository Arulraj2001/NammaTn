// src/app/(user)/[city]/page.jsx
// City/District hub page — fully server-rendered.
import React from 'react';
import nextDynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { DISTRICT_MAP, BUILD_TIME_DISTRICT_SLUGS, SITE_URL } from '@/lib/seo-data';
import { getDistrictBySlug } from '@/lib/districts';
import { getDistrictMetaDescription } from '@/lib/metaDescription';
import PageSchema from '@/components/seo/PageSchema';
import { NearbyDistrictLinks, DistrictCategoryLinks } from '@/components/seo/InternalLinks';

export const revalidate = 3600;

// DistrictDetail renders with SSR enabled
const DistrictDetail = nextDynamic(() => import('@/views/DistrictDetail'), { ssr: true });

// Pre-render priority districts; all other valid districts generate on demand.
export async function generateStaticParams() {
  return BUILD_TIME_DISTRICT_SLUGS.map((city) => ({ city }));
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
    alternates: { canonical: canonicalUrl },
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

  return (
    <>
      <PageSchema
        url={canonicalUrl}
        name={`${district.name} Civic Issue Reports & Alerts`}
        description={
          `Citizen-submitted reports from ${district.name}, Tamil Nadu — power cuts, water issues, ` +
          `road problems, scam alerts, jobs, and more.`
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

      {/* Internal linking section for SEO crawlers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 border-t border-slate-100 dark:border-slate-800">
        <DistrictCategoryLinks districtSlug={city} districtName={district.name} />
        <NearbyDistrictLinks districtSlug={city} />
      </div>
    </>
  );
}
