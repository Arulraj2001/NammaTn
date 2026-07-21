import React from 'react';
import Jobs from '@/views/Jobs';
import { getActiveJobAlerts } from '@/lib/publicHubServer';

export const revalidate = 300;

export default async function Page() {
  const jobs = await getActiveJobAlerts();
  return <Jobs initialJobs={jobs} />;
}
