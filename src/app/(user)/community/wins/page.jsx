import CommunityWins from '@/views/CommunityWins';
import { getResolvedCommunityWins } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 3600;

export default async function Page() {
  const initialWins = await getResolvedCommunityWins(200);
  return <><Breadcrumbs items={[{ name: 'Community', href: '/community' }, { name: 'Community Wins', href: '/community/wins' }]} /><CommunityWins initialWins={initialWins} /></>;
}
