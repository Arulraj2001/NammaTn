import Explore from '@/views/Explore';
import { getExplorePosts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// 5-minute background revalidation to conserve serverless compute credits.
// On-demand revalidation via /api/revalidate instantly updates this page on new post imports.
export const revalidate = 300;

export const metadata = {
  title: 'Explore Tamil Nadu Civic Reports & Local Updates',
  description: 'Discover recent Civic Receipts, public complaints, local alerts, discussions, and community updates from across Tamil Nadu.',
  alternates: { canonical: '/explore' },
};

export default async function Page() {
  const initialPosts = await getExplorePosts(18);
  return <><Breadcrumbs items={[{ name: 'Explore', href: '/explore' }]} /><Explore initialPosts={initialPosts} /></>;
}
