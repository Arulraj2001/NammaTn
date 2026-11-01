import React from 'react';
import EditorialTeam from '@/views/EditorialTeam';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Editorial Board & Newsroom Leadership | VizhiTN',
  description: 'Meet the editorial board, civic researchers, and correspondents responsible for verifying public data, municipal alerts, and government welfare reporting across Tamil Nadu.',
  alternates: { canonical: '/editorial-team' },
  openGraph: {
    title: 'Editorial Board & Newsroom Leadership | VizhiTN',
    description: 'Independent journalists, civic analysts, and researchers covering 38 districts of Tamil Nadu.',
    url: '/editorial-team',
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Editorial Team', href: '/editorial-team' }]} />
      <EditorialTeam />
    </>
  );
}

