import Community from '@/views/Community';
import { getCommunityHubData } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default async function Page() {
  const initialData = await getCommunityHubData();
  return <><Breadcrumbs items={[{ name: 'Community', href: '/community' }]} /><Community initialData={initialData} /></>;
}
