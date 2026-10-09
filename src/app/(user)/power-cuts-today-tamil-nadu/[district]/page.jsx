import React from 'react';
import PowerCutsToday from '@/views/PowerCutsToday';
import { createServerSupabase } from '@/lib/serverSupabase';
import { DISTRICTS, getDistrictBySlug } from '@/lib/districts';
import { notFound } from 'next/navigation';

const SITE_URL = 'https://www.vizhitn.in';
export const revalidate = 900; // 15 minutes fresh cache

export async function generateStaticParams() {
  return DISTRICTS.map((d) => ({ district: d.slug }));
}

export async function generateMetadata({ params }) {
  const district = getDistrictBySlug(params.district);
  if (!district) notFound();

  const title = `${district.name_en} Power Cut Today: Scheduled EB Shutdown Timings & Streets | ${district.name_ta} மின்தடை`;
  const description = `Live ${district.name_en} TANGEDCO scheduled power shutdown timings, affected substations, and streets today. Emergency EB helpline: 1912.`;
  const canonical = `${SITE_URL}/power-cuts-today-tamil-nadu/${district.slug}`;

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', `${district.name_en} Power Cut Today: Scheduled Timings & Areas`);
  ogUrl.searchParams.set('title_ta', `${district.name_ta} இன்று மின்தடை பகுதிகள் மற்றும் மின்வாரிய அறிவிப்பு`);
  ogUrl.searchParams.set('category', 'electricity');
  ogUrl.searchParams.set('urgency', 'high');
  ogUrl.searchParams.set('helpline', 'Minnalagam 1912');
  const ogImageUrl = ogUrl.toString();

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en-IN': canonical,
        'ta-IN': `${canonical}?lang=ta`,
        'x-default': canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'VizhiTN',
      locale: 'en_IN',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

async function fetchDistrictElectricityPosts(districtSlug) {
  try {
    const supabase = createServerSupabase();
    if (!supabase) return [];

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('category_slug', 'electricity')
      .eq('district_slug', districtSlug)
      .eq('status', 'active')
      .gte('created_date', fortyEightHoursAgo)
      .order('created_date', { ascending: false })
      .limit(40);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn(`[POWER CUTS ${districtSlug}] Error fetching posts:`, err?.message);
    return [];
  }
}

export default async function Page({ params }) {
  const district = getDistrictBySlug(params.district);
  if (!district) notFound();

  const posts = await fetchDistrictElectricityPosts(district.slug);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How to check today's power cut in ${district.name_en}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can check scheduled TANGEDCO power shutdown timings and affected streets in ${district.name_en} directly on VizhiTN. Search by your area or substation to see exact timings.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the TANGEDCO electricity complaint number for ${district.name_en}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Call 1912 (Minnalagam 24x7) for power breakdown complaints or send a message to WhatsApp number 94987 94987.`,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Power Cuts Today', item: `${SITE_URL}/power-cuts-today-tamil-nadu` },
      { '@type': 'ListItem', position: 3, name: district.name_en, item: `${SITE_URL}/power-cuts-today-tamil-nadu/${district.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PowerCutsToday initialPosts={posts} targetDistrict={district} />
    </>
  );
}
