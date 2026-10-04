import React from 'react';
import HolidayAlerts from '@/views/HolidayAlerts';
import { createServerSupabase } from '@/lib/serverSupabase';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';
export const revalidate = 900; // 15 minutes fresh cache

export async function generateMetadata() {
  const title = 'Tamil Nadu School & College Holiday Alerts (Collector Order & Rain Updates)';
  const description = 'Official live announcements for school and college holidays declared by District Collectors across Chennai, Tiruvallur, Coimbatore and Tamil Nadu during heavy rains.';
  const canonical = `${SITE_URL}/school-college-holiday-alerts`;

  const ogUrl = new URL(`${SITE_URL}/api/og`);
  ogUrl.searchParams.set('title', 'Tamil Nadu School & College Holiday Alerts');
  ogUrl.searchParams.set('title_ta', 'பள்ளி & கல்லூரி விடுமுறை அறிவிப்புகள் - மாவட்ட ஆட்சியர் உத்தரவு');
  ogUrl.searchParams.set('category', 'education');
  ogUrl.searchParams.set('urgency', 'critical');
  ogUrl.searchParams.set('helpline', 'Disaster Control 1077');
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

async function fetchActiveHolidayAlertPosts() {
  try {
    const supabase = createServerSupabase();
    if (!supabase) return [];

    // Query active education or public-safety alert posts from last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .in('category_slug', ['education', 'public-safety', 'weather', 'general'])
      .eq('status', 'active')
      .gte('created_date', fortyEightHoursAgo)
      .order('created_date', { ascending: false })
      .limit(30);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn('[HOLIDAY ALERTS HUB] Error fetching posts:', err?.message);
    return [];
  }
}

export default async function Page() {
  const posts = await fetchActiveHolidayAlertPosts();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who declares school and college holidays during heavy rain in Tamil Nadu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Respective District Collectors have the authority to announce school and college holidays after assessing local rainfall, waterlogging, and IMD red/orange alerts.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the official Tamil Nadu disaster control helpline numbers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Call 1077 for District Disaster Control Rooms, 1070 for Tamil Nadu State Disaster Management Authority (TNDMA), and 1913 for Greater Chennai Corporation.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I check verified rain holiday announcements in my district?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can check real-time verified holiday announcements on VizhiTN. All notices cite the official District Collectorate press release and department source.',
        },
      },
    ],
  };

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Alerts', href: '/category/education' },
    { name: 'School & College Holidays', href: '/school-college-holiday-alerts' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <HolidayAlerts initialPosts={posts} />
    </>
  );
}
