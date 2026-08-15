import { getArticleBySlug } from '@/lib/awarenessServer';
import AwarenessArticleDetail from '@/views/AwarenessArticleDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const title = article.title_en;
  const description = article.summary_en || `Read ${title} on VizhiTN.`;
  const canonical = `${SITE_URL}/awareness/article/${article.slug}`;

  return {
    title: `${title} - Knowledge Base | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
  };
}

export default function Page({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Articles', href: '/awareness/articles' },
          { name: article.title_en, href: `/awareness/article/${article.slug}` },
        ]}
      />
      <AwarenessArticleDetail article={article} />
    </>
  );
}
