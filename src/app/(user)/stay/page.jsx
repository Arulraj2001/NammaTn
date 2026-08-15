import React from 'react';
import Stay from '@/views/Stay';
import { getActiveStayListings } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 300;

export const metadata = {
  title: 'PG, Shared Rooms & Stay Listings in Tamil Nadu | VizhiTN',
  description: 'Find PG accommodations, shared rooms, roommates, temporary stays, and hostels across Tamil Nadu. Privacy-protected, community-verified listings.',
  alternates: { canonical: '/stay' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'PG & Stay Listings',
    description: 'Discover PG accommodations, shared rooms, and temporary stays posted by your community.',
    url: '/stay',
    type: 'website',
  },
};

export default async function Page() {
  const listings = await getActiveStayListings();
  return <><Breadcrumbs items={[{ name: 'Stay Listings', href: '/stay' }]} /><Stay initialListings={listings} /></>;
}
