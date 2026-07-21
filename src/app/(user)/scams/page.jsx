import React from 'react';
import Scams from '@/views/Scams';
import { getActiveScamAlerts } from '@/lib/publicHubServer';

export const revalidate = 300;

export default async function Page() {
  const scams = await getActiveScamAlerts();
  return <Scams initialScams={scams} />;
}
