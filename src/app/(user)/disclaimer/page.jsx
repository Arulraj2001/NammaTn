import React from 'react';
import Disclaimer from '@/views/Disclaimer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Disclaimer | VizhiTN — UGC & Editorial Independence Notice',
  description: 'VizhiTN hosts citizen-submitted civic reports. Read our content disclaimer, UGC policy, editorial independence notice, and limitation of liability for Tamil Nadu civic content.',
  alternates: { canonical: '/disclaimer' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Disclaimer', href: '/disclaimer' }]} />
      <Disclaimer />
    </>
  );
}
