import BribeDashboard from '@/views/BribeDashboard';
import { getActiveBribePosts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Bribe Reports & Transparency Dashboard in Tamil Nadu',
  description: 'Track reported bribe requests, refusal patterns, and public transparency updates across Tamil Nadu offices and departments.',
  alternates: { canonical: '/bribes' },
};

export default async function Page() {
  const initialBribePosts = await getActiveBribePosts();
  return <><Breadcrumbs items={[{ name: 'Bribe Reports', href: '/bribes' }]} /><BribeDashboard initialBribePosts={initialBribePosts} /></>;
}
