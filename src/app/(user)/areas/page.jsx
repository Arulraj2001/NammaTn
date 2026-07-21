import React from 'react';
import Areas from '@/views/Areas';
import { getActiveAreas } from '@/lib/publicHubServer';

export const revalidate = 3600;

export default async function Page() {
  const areas = await getActiveAreas();
  return <Areas initialAreas={areas} />;
}
