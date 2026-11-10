import React from 'react';
import TnpscPractice from '@/views/TnpscPractice';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import TnpscPortalLayout from '@/components/tnpsc/TnpscPortalLayout';

export const metadata = {
  title: 'TNPSC Daily One-Mark & PYQ Practice 2026 | Samacheer Kalvi Notes | VizhiTN',
  description: 'Practice daily TNPSC Group 4, Group 2, and Police SI One-Mark questions with 20-second timer, verified Samacheer Kalvi citations, and previous year question papers.',
  keywords: [
    'tnpsc online practice test',
    'tnpsc daily one mark questions tamil',
    'samacheer kalvi one mark notes',
    'tnpsc group 4 model questions 2026',
    'vizhitn tnpsc',
    'tnpsc unit 8 previous year questions',
    'tnpsc general tamil mcq'
  ],
  alternates: { canonical: '/tnpsc' },
  openGraph: {
    title: 'TNPSC Daily 1-Mark Quiz & Samacheer Notes | VizhiTN',
    description: 'Free daily interactive TNPSC practice with instant answers and textbook references.',
    url: '/tnpsc',
    siteName: 'VizhiTN',
    locale: 'ta_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TNPSC Daily 1-Mark Quiz & Samacheer Notes | VizhiTN',
    description: 'Free daily interactive TNPSC practice with instant answers and textbook references.',
  },
};

export default function Page() {
  const hubSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: 'TNPSC Group 4 and Group 2 Daily One-Mark Preparation Hub',
    description: 'Daily interactive practice questions grounded in Tamil Nadu State Board Samacheer Kalvi textbooks standards 6 to 12.',
    credentialCategory: 'Competitive Examination',
    recognizedBy: {
      '@type': 'State',
      name: 'Tamil Nadu',
    },
  };

  return (
    <TnpscPortalLayout activeTab="daily">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />
      <Breadcrumbs items={[{ name: 'TNPSC Practice', href: '/tnpsc' }]} />
      <TnpscPractice />
    </TnpscPortalLayout>
  );
}
