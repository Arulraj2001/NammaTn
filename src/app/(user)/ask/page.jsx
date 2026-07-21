import AskLocal from '@/views/AskLocal';
import { getLatestQuestions } from '@/lib/publicHubServer';

export const revalidate = 1800;

export const metadata = {
  title: 'Ask Local Questions Across Tamil Nadu',
  description: 'Ask location-based questions and browse community answers about neighborhoods, civic services, transport, utilities, and daily life across Tamil Nadu.',
  alternates: { canonical: '/ask/' },
};

export default async function Page() {
  const initialQuestions = await getLatestQuestions(40);
  return <AskLocal initialQuestions={initialQuestions} />;
}
