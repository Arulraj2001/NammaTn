import React from 'react';
import PowerCutsToday from '@/views/PowerCutsToday';
import { createServerSupabase } from '@/lib/serverSupabase';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';
export const revalidate = 900; // 15 minutes fresh cache

export async function generateMetadata() {
  const title = 'Tamil Nadu Power Cut Today (Live TANGEDCO Shutdown Timings & Streets)';
  const description = 'Live TANGEDCO scheduled power shutdown timings, affected areas and streets today in Chennai, Coimbatore, Madurai, Salem and all 38 districts. Helpline: 1912.';
  const canonical = `${SITE_URL}/power-cuts-today-tamil-nadu`;

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', 'Tamil Nadu Power Cut Today: Scheduled Timings & Areas');
  ogUrl.searchParams.set('title_ta', 'தமிழ்நாடு இன்று மின்தடை பகுதிகள் மற்றும் மின்வாரிய அறிவிப்பு');
  ogUrl.searchParams.set('category', 'electricity');
  ogUrl.searchParams.set('urgency', 'high');
  ogUrl.searchParams.set('helpline', 'Minnalagam 1912');
  const ogImageUrl = ogUrl.toString();

  return {
    title,
    description,
    alternates: { canonical },
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

async function fetchActiveElectricityPosts() {
  try {
    const supabase = createServerSupabase();
    if (!supabase) return [];

    // Query active electricity posts from last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('category_slug', 'electricity')
      .eq('status', 'active')
      .gte('created_date', fortyEightHoursAgo)
      .order('created_date', { ascending: false })
      .limit(40);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn('[POWER CUTS HUB] Error fetching posts:', err?.message);
    return [];
  }
}

export default async function Page() {
  const posts = await fetchActiveElectricityPosts();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: "How can I check today's power cut in my area in Tamil Nadu?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can check live power cuts on VizhiTN by selecting your district and searching your street name. VizhiTN aggregates verified daily shutdown releases from all TANGEDCO distribution circles.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the official TANGEDCO electricity complaint helpline number?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The official 24x7 TANGEDCO Minnalagam helpline number is 1912. For WhatsApp grievances, you can contact 94987 94987.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does TANGEDCO schedule power cuts between 9:00 AM and 2:00 PM?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Power shutdowns are scheduled during daytime non-peak hours to carry out preventive maintenance, transformer oil testing, and line clearing works to prevent unscheduled outages during peak hours.',
        },
      },
    ],
  };

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Electricity', href: '/category/electricity' },
    { name: 'Power Cut Today', href: '/power-cuts-today-tamil-nadu' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <PowerCutsToday initialPosts={posts} />
    </>
  );
}
