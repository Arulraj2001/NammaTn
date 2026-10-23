import React from 'react';
import PowerCutsToday from '@/views/PowerCutsToday';
import { createServerSupabase } from '@/lib/serverSupabase';
import { getDistrictBySlug } from '@/lib/districts';
import { getPowerCutArea, getPowerCutAreas, getAllPowerCutAreaStaticParams } from '@/lib/powerCutAreas';
import { notFound } from 'next/navigation';
import { generateSpecialAnnouncementSchema } from '@/lib/seo/newsSchema';

const SITE_URL = 'https://www.vizhitn.in';
export const revalidate = 900; // 15 minutes fresh cache

export async function generateStaticParams() {
  return getAllPowerCutAreaStaticParams();
}

export async function generateMetadata({ params }) {
  const district = getDistrictBySlug(params.district);
  if (!district) notFound();

  const area = getPowerCutArea(district.slug, params.area);
  if (!area) notFound();

  const todayFormatted = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const title = `${area.name_en} Power Cut Today (${todayFormatted}): Scheduled EB Shutdown Timings & Streets | ${area.name_ta || area.name_en} மின்தடை`;
  const description = `Live ${area.name_en} (${district.name_en}) scheduled power shutdown timings, affected feeder lines and streets today (${todayFormatted}). Emergency TANGEDCO Minnalagam helpline: 1912.`;
  const canonical = `${SITE_URL}/power-cuts-today-tamil-nadu/${district.slug}/${area.slug}`;

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', `${area.name_en} Power Cut Today: Scheduled Timings & Streets`);
  ogUrl.searchParams.set('title_ta', `${area.name_ta || area.name_en} இன்று மின்தடை அறிவிப்பு`);
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

async function fetchAreaElectricityPosts(districtSlug, areaName, areaSlug) {
  try {
    const supabase = createServerSupabase();
    if (!supabase) return [];

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    
    // Fetch active electricity posts for this district
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('category_slug', 'electricity')
      .eq('district_slug', districtSlug)
      .eq('status', 'active')
      .gte('created_date', fortyEightHoursAgo)
      .order('created_date', { ascending: false })
      .limit(100);

    if (error || !data) return [];

    // Filter to posts matching this area (by area_slug, area_name, location_text, or title/content)
    const normalizedAreaName = areaName.toLowerCase();
    const normalizedAreaSlug = areaSlug.toLowerCase();

    const areaPosts = data.filter((p) => {
      if (p.area_slug && p.area_slug.toLowerCase() === normalizedAreaSlug) return true;
      if (p.area_name && p.area_name.toLowerCase().includes(normalizedAreaName)) return true;
      const combined = `${p.title_en || ''} ${p.content_en || ''} ${p.location_text || ''}`.toLowerCase();
      return combined.includes(normalizedAreaName);
    });

    // Return strictly posts matching this specific area. If none, returns empty array so the page renders a unique, verified zero-outage state.
    return areaPosts;
  } catch (err) {
    console.warn(`[POWER CUTS ${districtSlug}/${areaSlug}] Error fetching posts:`, err?.message);
    return [];
  }
}


export default async function Page({ params }) {
  const district = getDistrictBySlug(params.district);
  if (!district) notFound();

  const area = getPowerCutArea(district.slug, params.area);
  if (!area) notFound();

  const posts = await fetchAreaElectricityPosts(district.slug, area.name_en, area.slug);
  const siblingAreas = getPowerCutAreas(district.slug);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How to check today's power cut in ${area.name_en}, ${district.name_en}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can check live TANGEDCO scheduled power shutdown timings, affected feeder lines, and streets in ${area.name_en} directly on VizhiTN. Filter by your street or search your local substation.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the TANGEDCO electricity complaint number for ${area.name_en}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Call 1912 (Minnalagam 24x7 statewide helpline) for any power breakdown, transformer sparking, or snapped line complaints. For WhatsApp, message 94987 94987.`,
        },
      },
      {
        '@type': 'Question',
        name: `What are the common substation shutdown timings in ${area.name_en}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Scheduled maintenance shutdowns are typically conducted between 9:00 AM and 2:00 PM for line clearing and transformer inspection. Power is usually restored ahead of schedule if works finish early.`,
        },
      },
    ],
  };

  const activeShutdown = posts.find((p) => p.post_type === 'alert') || posts[0];
  const specialAnnouncementSchema = activeShutdown ? generateSpecialAnnouncementSchema({
    name: activeShutdown.title_en || `${area.name_en} (${district.name_en}) Power Shutdown Schedule Today`,
    text: activeShutdown.content_en || activeShutdown.description || `Scheduled TANGEDCO power shutdown timings and affected localities in ${area.name_en}, ${district.name_en}.`,
    url: `${SITE_URL}/power-cuts-today-tamil-nadu/${district.slug}/${area.slug}`,
    datePosted: activeShutdown.created_date,
    districtName: district.name_en,
    departmentName: `TANGEDCO ${district.name_en} Distribution Circle`,
    helpline: '1912',
    category: 'https://en.wikipedia.org/wiki/Power_outage',
  }) : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Power Cuts Today', item: `${SITE_URL}/power-cuts-today-tamil-nadu` },
      { '@type': 'ListItem', position: 3, name: district.name_en, item: `${SITE_URL}/power-cuts-today-tamil-nadu/${district.slug}` },
      { '@type': 'ListItem', position: 4, name: area.name_en, item: `${SITE_URL}/power-cuts-today-tamil-nadu/${district.slug}/${area.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {specialAnnouncementSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(specialAnnouncementSchema) }} />
      )}
      <PowerCutsToday
        initialPosts={posts}
        targetDistrict={district}
        targetArea={area}
        allDistrictAreas={siblingAreas}
      />
    </>
  );
}
