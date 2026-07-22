import React from 'react';
import Jobs from '@/views/Jobs';
import { getActiveJobAlerts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export default async function Page() {
  const jobs = await getActiveJobAlerts();
  return <><Breadcrumbs items={[{ name: 'Jobs', href: '/jobs' }]} /><Jobs initialJobs={jobs} /></>;
}
