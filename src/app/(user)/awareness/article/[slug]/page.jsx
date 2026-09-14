import { getArticleBySlug } from '@/lib/awarenessServer';
import AwarenessArticleDetail from '@/views/AwarenessArticleDetail';
import { notFound } from 'next/navigation';
import { generateNewsArticleSchema } from '@/lib/seo/newsSchema';
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

  const newsArticleSchema = generateNewsArticleSchema({
    headline: article.title_en,
    description: article.summary_en || article.title_en,
    url: `${SITE_URL}/awareness/article/${article.slug}`,
    imageUrl: article.social_image || article.featured_image || null,
    datePublished: article.publish_date || article.created_date,
    dateModified: article.updated_date || article.publish_date || article.created_date,
    authorName: 'VizhiTN Reporter',
    section: 'Civic Awareness',
    language: 'en-IN',
  });

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Articles', href: '/awareness/articles' },
          { name: article.title_en, href: `/awareness/article/${article.slug}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />
      <AwarenessArticleDetail article={article} />
    </>
  );
}
