import CommunityWins from '@/views/CommunityWins';
import { getResolvedCommunityWins } from '@/lib/publicHubServer';

export const revalidate = 3600;

export default async function Page() {
  const initialWins = await getResolvedCommunityWins(200);
  return <CommunityWins initialWins={initialWins} />;
}
