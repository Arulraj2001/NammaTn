import React from 'react';
import Jobs from '@/views/Jobs';
import { getActiveJobAlerts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export const metadata = {
  title: 'Local Jobs & Employment Opportunities in Tamil Nadu | VizhiTN',
  description: 'Discover local job alerts, employment opportunities, and community-shared work posts across Tamil Nadu. Part-time, temporary, delivery, helper roles, and more.',
  alternates: { canonical: '/jobs' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Local Jobs & Employment Opportunities',
    description: 'Find job alerts and employment opportunities shared by your community across Tamil Nadu.',
    url: '/jobs',
    type: 'website',
  },
};

export default async function Page() {
  const jobs = await getActiveJobAlerts();
  return <><Breadcrumbs items={[{ name: 'Jobs', href: '/jobs' }]} /><Jobs initialJobs={jobs} /></>;
}
