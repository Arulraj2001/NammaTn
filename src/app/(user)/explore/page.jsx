import Explore from '@/views/Explore';
import { getExplorePosts } from '@/lib/publicHubServer';

export const revalidate = 3600;

export const metadata = {
  title: 'Explore Tamil Nadu Civic Reports & Local Updates',
  description: 'Discover recent Civic Receipts, public complaints, local alerts, discussions, and community updates from across Tamil Nadu.',
  alternates: { canonical: '/explore' },
};

export default async function Page() {
  const initialPosts = await getExplorePosts(18);
  return <Explore initialPosts={initialPosts} />;
}
