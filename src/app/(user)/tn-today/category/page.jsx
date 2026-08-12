import React from 'react';
import TnToday from '@/views/TnToday';
import { getTnTodayArchive } from '@/lib/tnTodayServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: 'TN Today - All Topics & Categories | VizhiTN',
    description: 'Explore all community news topics, public interest journalism, and civic updates across Tamil Nadu.',
    alternates: { canonical: '/tn-today' },
    openGraph: { title: 'TN Today - All Topics | VizhiTN', description: 'Explore all community news topics across Tamil Nadu.', url: '/tn-today', type: 'website' },
  };
}

export default async function Page() {
  const { articles, featured } = await getTnTodayArchive(null);
  return (
    <>
      <Breadcrumbs items={[
        { name: 'TN Today', href: '/tn-today' },
        { name: 'All Topics', href: '/tn-today' },
      ]} />
      <TnToday
        initialArticles={articles}
        initialFeatured={featured}
      />
    </>
  );
}
