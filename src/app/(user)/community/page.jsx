import Community from '@/views/Community';
import { getCommunityHubData } from '@/lib/publicHubServer';

export default async function Page() {
  const initialData = await getCommunityHubData();
  return <Community initialData={initialData} />;
}
