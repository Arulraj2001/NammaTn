import React from 'react';
import { getTnpscPyqPapersServer, getTnpscExamsServer } from '@/lib/tnpscServer';
import TnpscPortalLayout from '@/components/tnpsc/TnpscPortalLayout';
import TnpscPyqHubView from '@/views/TnpscPyqHubView';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 86400; // 24 hours ISR

export const metadata = {
  title: 'TNPSC Previous Year Question Papers (Solved) 2014-2024 | Group 4 & 2 | VizhiTN',
  description: 'Practice official TNPSC Group 4, VAO, Group 2, and Police SI previous year question papers online with verified answer keys, explanations, and Samacheer Kalvi references.',
  keywords: [
    'tnpsc group 4 question paper 2024 pdf',
    'tnpsc group 4 pyq solved',
    'tnpsc group 2 previous year questions',
    'tnpsc old question papers with answers in tamil',
    'samacheer kalvi pyq notes'
  ],
  alternates: { canonical: '/tnpsc/pyq' },
  openGraph: {
    title: 'TNPSC Previous Year Question Papers (Solved) | VizhiTN',
    description: 'Practice real exam questions with instant textbook citations and official answer keys.',
    url: '/tnpsc/pyq',
    siteName: 'VizhiTN',
    locale: 'ta_IN',
    type: 'website',
  },
};

export default async function PyqPage() {
  const [papers, exams] = await Promise.all([
    getTnpscPyqPapersServer(),
    getTnpscExamsServer(),
  ]);

  return (
    <TnpscPortalLayout activeTab="pyq">
      <Breadcrumbs
        items={[
          { name: 'TNPSC Portal', href: '/tnpsc' },
          { name: 'Previous Year Papers', href: '/tnpsc/pyq' },
        ]}
      />
      <TnpscPyqHubView papers={papers} exams={exams} />
    </TnpscPortalLayout>
  );
}

