import { getFaqBySlug } from '@/lib/awarenessServer';
import AwarenessFaqDetail from '@/views/AwarenessFaqDetail';
import { notFound } from 'next/navigation';
import { generateNewsArticleSchema } from '@/lib/seo/newsSchema';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const faq = getFaqBySlug(params.slug);
  if (!faq) notFound();

  const title = faq.question_en;
  const description = faq.answer_en.substring(0, 160);
  const canonical = `${SITE_URL}/awareness/faq/${faq.slug}`;

  return {
    title: `${title} | VizhiTN FAQ`,
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
  const faq = getFaqBySlug(params.slug);
  if (!faq) notFound();

  const newsArticleSchema = generateNewsArticleSchema({
    headline: faq.question_en,
    description: (faq.answer_en || '').slice(0, 160) || faq.question_en,
    url: `${SITE_URL}/awareness/faq/${faq.slug}`,
    imageUrl: null,
    datePublished: faq.publish_date || faq.created_date,
    dateModified: faq.updated_date || faq.publish_date || faq.created_date,
    authorName: 'VizhiTN Reporter',
    section: 'Civic Awareness',
    language: 'en-IN',
  });

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Awareness', href: '/awareness' },
        { name: 'FAQs', href: '/awareness/faqs' },
        { name: faq.question_en, href: `/awareness/faq/${faq.slug}` },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />
      <AwarenessFaqDetail faq={faq} />
    </>
  );
}
