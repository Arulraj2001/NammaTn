import QuestionDetail from '@/views/QuestionDetail';
import { notFound } from 'next/navigation';
import { getQuestionDetailData } from '@/lib/publicHubServer';
import { toMetaDescription } from '@/lib/metaDescription';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { question } = await getQuestionDetailData(params.id);
  if (!question) notFound();

  const title = question.title || 'Community Question';
  const description = toMetaDescription(
    question.content,
    `A community question from ${question.district_name || 'Tamil Nadu'}.`,
  );
  const canonical = `${SITE_URL}/question/${question.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: { title, description, url: canonical, type: 'article' },
  };
}

export default async function Page({ params }) {
  const initialData = await getQuestionDetailData(params.id);
  if (!initialData.question) notFound();
  return <QuestionDetail initialId={params.id} initialData={initialData} />;
}
