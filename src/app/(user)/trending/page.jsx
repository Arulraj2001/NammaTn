import Trending from '@/views/Trending';
import { getTrendingHubData } from '@/lib/publicHubServer';

export default async function Page() {
  const initialData = await getTrendingHubData(9);
  return <Trending initialData={initialData} />;
}
