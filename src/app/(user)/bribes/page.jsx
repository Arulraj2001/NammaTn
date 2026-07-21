import BribeDashboard from '@/views/BribeDashboard';
import { getActiveBribePosts } from '@/lib/publicHubServer';

export default async function Page() {
  const initialBribePosts = await getActiveBribePosts();
  return <BribeDashboard initialBribePosts={initialBribePosts} />;
}
