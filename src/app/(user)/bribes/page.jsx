import BribeDashboard from '@/views/BribeDashboard';
import { getActiveBribePosts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default async function Page() {
  const initialBribePosts = await getActiveBribePosts();
  return <><Breadcrumbs items={[{ name: 'Bribe Reports', href: '/bribes' }]} /><BribeDashboard initialBribePosts={initialBribePosts} /></>;
}
