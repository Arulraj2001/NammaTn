import React from 'react';
import Stay from '@/views/Stay';
import { getActiveStayListings } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export default async function Page() {
  const listings = await getActiveStayListings();
  return <><Breadcrumbs items={[{ name: 'Stay Listings', href: '/stay' }]} /><Stay initialListings={listings} /></>;
}
