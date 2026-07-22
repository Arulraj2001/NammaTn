import React from 'react';
import Scams from '@/views/Scams';
import { getActiveScamAlerts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export default async function Page() {
  const scams = await getActiveScamAlerts();
  return <><Breadcrumbs items={[{ name: 'Scam Alerts', href: '/scams' }]} /><Scams initialScams={scams} /></>;
}
