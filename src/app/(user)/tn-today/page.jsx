import React from 'react';
import TnToday from '@/views/TnToday';
import { getTnTodayArchive } from '@/lib/tnTodayServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export const metadata = {
  title: 'TN Today – Tamil Nadu Civic News',
  description: 'Read Tamil Nadu civic news, public-interest reporting, local alerts, and practical updates from VizhiTN.',
  alternates: { canonical: '/tn-today' },
  openGraph: {
    title: 'TN Today – Tamil Nadu Civic News | VizhiTN',
    description: 'Tamil Nadu civic news, public-interest reporting, local alerts, and practical updates.',
    url: '/tn-today',
    type: 'website',
  },
};

export default async function Page() {
  const { articles, featured } = await getTnTodayArchive();
  return <><Breadcrumbs items={[{ name: 'TN Today', href: '/tn-today' }]} /><TnToday initialArticles={articles} initialFeatured={featured} /></>;
}
