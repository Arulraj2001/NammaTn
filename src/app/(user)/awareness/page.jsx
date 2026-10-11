import React from 'react';
import Awareness from '@/views/Awareness';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Tamil Nadu Citizen Awareness, Rights & Welfare Command Center | VizhiTN',
  description: 'Master civic hub for Tamil Nadu: 24x7 emergency hotlines (112, 108, 1912, 1930), statutory citizen rights, government welfare schemes, official .gov.in portals, and problem SOPs.',
  alternates: { canonical: `${SITE_URL}/awareness` },
  robots: { index: true, follow: true },
  keywords: [
    'tamil nadu citizen awareness',
    'tamil nadu emergency numbers',
    'citizen rights tamil nadu',
    'government welfare schemes tn',
    'tnesevai official portal',
    'civic problem guides tamil nadu',
  ],
  openGraph: {
    title: 'Tamil Nadu Citizen Awareness & Civic Command Center | VizhiTN',
    description: 'Master resource directory: Rights, schemes, emergency helplines, official portals, and citizen action SOPs.',
    url: `${SITE_URL}/awareness`,
    type: 'website',
    locale: 'en_IN',
  },
};

export default function Page() {
  const hubSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tamil Nadu Citizen Awareness & Civic Command Center',
    description: 'Comprehensive directory of citizen rights, welfare schemes, emergency helplines, official portals, and action guides for Tamil Nadu.',
    url: `${SITE_URL}/awareness`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'VizhiTN',
      url: SITE_URL,
    },
  };

  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Awareness Hub', href: '/awareness' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />
      <Awareness />
    </>
  );
}
