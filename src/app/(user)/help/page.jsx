import Help from '@/views/Help';
import { getActiveEmergencyPosts } from '@/lib/publicHubServer';

export const revalidate = 900;

export const metadata = {
  title: 'Community Emergency Help Requests in Tamil Nadu',
  description: 'Find and share active blood requirements, ambulance assistance, missing-person alerts, medicine support, and community emergency requests across Tamil Nadu.',
  alternates: { canonical: '/help/' },
};

export default async function Page() {
  const initialEmergencies = await getActiveEmergencyPosts(40);
  return <Help initialEmergencies={initialEmergencies} />;
}
