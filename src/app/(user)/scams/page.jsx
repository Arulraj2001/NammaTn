import React from 'react';
import Scams from '@/views/Scams';
import { getActiveScamAlerts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export const metadata = {
  title: 'Scam Alerts & Cyber Fraud Updates in Tamil Nadu',
  description: 'View reported fake job offers, fraud calls, UPI scams, and cyber crime warnings across Tamil Nadu with public awareness updates.',
  alternates: { canonical: '/scams' },
};

export default async function Page() {
  const scams = await getActiveScamAlerts();
  return <><Breadcrumbs items={[{ name: 'Scam Alerts', href: '/scams' }]} /><Scams initialScams={scams} /></>;
}
