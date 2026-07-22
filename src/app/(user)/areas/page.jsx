import React from 'react';
import Areas from '@/views/Areas';
import { getActiveAreas } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 3600;

export default async function Page() {
  const areas = await getActiveAreas();
  return <><Breadcrumbs items={[{ name: 'Areas', href: '/areas' }]} /><Areas initialAreas={areas} /></>;
}
