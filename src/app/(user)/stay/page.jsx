import React from 'react';
import Stay from '@/views/Stay';
import { getActiveStayListings } from '@/lib/publicHubServer';

export const revalidate = 300;

export default async function Page() {
  const listings = await getActiveStayListings();
  return <Stay initialListings={listings} />;
}
