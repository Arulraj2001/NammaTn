import React from 'react';
import HolidayAlerts from '@/views/HolidayAlerts';
import { createServerSupabase } from '@/lib/serverSupabase';
import { DISTRICTS, getDistrictBySlug } from '@/lib/districts';
import { notFound } from 'next/navigation';
import { generateSpecialAnnouncementSchema } from '@/lib/seo/newsSchema';

const SITE_URL = 'https://www.vizhitn.in';
export const revalidate = 900; // 15 minutes fresh cache

export async function generateStaticParams() {
  return DISTRICTS.map((d) => ({ district: d.slug }));
}

export async function generateMetadata({ params }) {
  const district = getDistrictBySlug(params.district);
  if (!district) notFound();

  const title = `${district.name_en} School & College Holiday Alerts: Rain Order & Collector Notices | ${district.name_ta} பள்ளி விடுமுறை`;
  const description = `Live ${district.name_en} district school and college holiday updates declared by District Collector. Check IMD heavy rain alerts, red/orange warnings, and 24x7 control room 1077.`;
  const canonical = `${SITE_URL}/school-college-holiday-alerts/${district.slug}`;

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', `${district.name_en} School & College Holiday Alerts`);
  ogUrl.searchParams.set('title_ta', `${district.name_ta} பள்ளி & கல்லூரி விடுமுறை அறிவிப்பு`);
  ogUrl.searchParams.set('category', 'education');
  ogUrl.searchParams.set('urgency', 'critical');
  ogUrl.searchParams.set('helpline', 'Control Room 1077');
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

async function fetchDistrictHolidayAlertPosts(districtSlug) {
  try {
    const supabase = createServerSupabase();
    if (!supabase) return [];

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .in('category_slug', ['education', 'public-safety', 'weather', 'general'])
      .eq('district_slug', districtSlug)
      .eq('status', 'active')
      .gte('created_date', fortyEightHoursAgo)
      .order('created_date', { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn(`[HOLIDAY ALERTS ${districtSlug}] Error fetching posts:`, err?.message);
    return [];
  }
}

export default async function Page({ params }) {
  const district = getDistrictBySlug(params.district);
  if (!district) notFound();

  const posts = await fetchDistrictHolidayAlertPosts(district.slug);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Has ${district.name_en} District Collector declared a school holiday today?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `School and college holidays for ${district.name_en} are declared officially by the ${district.name_en} District Collector after evaluating local IMD rain alerts and flooding conditions. Check the live status badge on VizhiTN for official updates.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the ${district.name_en} disaster control helpline number?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Call 1077 for ${district.name_en} District Disaster Management Control Room or 1070 for State Disaster Management.`,
        },
      },
    ],
  };

  const activeAlert = posts.find((p) => p.post_type === 'alert' || ['critical', 'high'].includes(p.urgency_level)) || posts[0];
  const specialAnnouncementSchema = activeAlert ? generateSpecialAnnouncementSchema({
    name: activeAlert.title_en || `${district.name_en} School & College Holiday Notice`,
    text: activeAlert.content_en || activeAlert.description || `Live school and college holiday status for ${district.name_en} declared by District Collector.`,
    url: `${SITE_URL}/school-college-holiday-alerts/${district.slug}`,
    datePosted: activeAlert.created_date,
    districtName: district.name_en,
    departmentName: `${district.name_en} District Collectorate`,
    helpline: '1077',
    category: 'https://en.wikipedia.org/wiki/School_closure',
  }) : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'School Holiday Alerts', item: `${SITE_URL}/school-college-holiday-alerts` },
      { '@type': 'ListItem', position: 3, name: district.name_en, item: `${SITE_URL}/school-college-holiday-alerts/${district.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {specialAnnouncementSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(specialAnnouncementSchema) }} />
      )}
      <HolidayAlerts initialPosts={posts} targetDistrict={district} />
    </>
  );
}
