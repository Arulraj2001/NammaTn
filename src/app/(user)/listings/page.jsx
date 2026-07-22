import LocalListings from '@/views/LocalListings';
import { getPublicLocalListings } from '@/lib/publicHubServer';

export const metadata = {
  title: 'Verified Local Services in Tamil Nadu',
  description: 'Find verified local businesses, community-recommended providers, and useful services across Tamil Nadu districts and areas.',
  alternates: { canonical: '/listings' },
  robots: { index: true, follow: true },
};

export default async function Page() {
  const listings = await getPublicLocalListings();
  return <LocalListings initialListings={listings} />;
}
