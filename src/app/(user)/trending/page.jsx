import Trending from '@/views/Trending';
import { getTrendingHubData } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default async function Page() {
  const initialData = await getTrendingHubData(9);
  return <><Breadcrumbs items={[{ name: 'Trending', href: '/trending' }]} /><Trending initialData={initialData} /></>;
}
