import React from 'react';
import FactCheckPolicy from '@/views/FactCheckPolicy';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Fact-Checking & Corrections Policy | VizhiTN',
  description: 'Learn how VizhiTN verifies civic alerts, cross-checks departmental notices, and maintains a transparent, public 24-hour corrections protocol across Tamil Nadu.',
  alternates: { canonical: '/fact-check-policy' },
  openGraph: {
    title: 'Fact-Checking & Corrections Policy | VizhiTN',
    description: 'Our 4-tier verification protocol and transparent 24-hour corrections SLA for civic notices and news in Tamil Nadu.',
    url: '/fact-check-policy',
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Fact-Check Policy', href: '/fact-check-policy' }]} />
      <FactCheckPolicy />
    </>
  );
}

