import Situations from '@/views/Situations';
import { getActiveSituationUpdates } from '@/lib/publicHubServer';

export const revalidate = 900;

export const metadata = {
  title: 'Live Situations & Local Alerts in Tamil Nadu',
  description: 'Follow active power cuts, water shortages, traffic disruptions, flooding, emergencies, and verified local situation updates across Tamil Nadu.',
  alternates: { canonical: '/situations/' },
};

export default async function Page() {
  const initialSituations = await getActiveSituationUpdates(30);
  return <Situations initialSituations={initialSituations} />;
}
