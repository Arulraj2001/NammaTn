import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getCommunityDiscussionDetailData } from '@/lib/publicHubServer';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getCommunityDiscussionDetailData(id);
  const discussion = data?.discussion;

  if (!discussion) notFound();

  const title = `${discussion.title || 'Community Discussion'} | VizhiTN Community`;
  const description = (discussion.content || '').trim().length
    ? `${discussion.content.slice(0, 155)}${discussion.content.length > 155 ? '…' : ''}`
    : `Join the discussion on ${discussion.district_name || 'Tamil Nadu'} and see community updates from the VizhiTN community.`;
  const canonical = `${SITE_URL}/community/${discussion.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1 },
    },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const initialData = await getCommunityDiscussionDetailData(id);

  if (!initialData.discussion) notFound();

  const discussion = initialData.discussion;

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Community', href: '/community' },
        { name: discussion.title || 'Discussion', href: `/community/${discussion.id}` },
      ]} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            Community discussion
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            {discussion.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {discussion.district_name && <span>📍 {discussion.district_name}</span>}
            {discussion.topic && <span>• {discussion.topic}</span>}
            {discussion.reply_count !== undefined && <span>• {discussion.reply_count} replies</span>}
          </div>
          <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
            {discussion.content}
          </div>
        </article>
      </div>
    </>
  );
}
