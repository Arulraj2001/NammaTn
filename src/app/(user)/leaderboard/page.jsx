import CivicLeaderboard from '@/views/CivicLeaderboard';
import { getLeaderboardPosts } from '@/lib/publicHubServer';

export const metadata = {
  title: 'Tamil Nadu Civic Leaderboard | VizhiTN',
  description: 'Track Tamil Nadu civic issues with the most community verifications, fastest fixes, longest pending cases, and community-powered wins.',
  alternates: { canonical: '/leaderboard' },
  robots: { index: true, follow: true },
};

export default async function Page() {
  const posts = await getLeaderboardPosts();
  return <CivicLeaderboard initialPosts={posts} />;
}
