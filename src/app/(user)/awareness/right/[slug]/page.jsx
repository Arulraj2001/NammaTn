import { getRightBySlug } from '@/lib/awarenessServer';
import AwarenessRightDetail from '@/views/AwarenessRightDetail';
import { notFound } from 'next/navigation';
import { generateNewsArticleSchema } from '@/lib/seo/newsSchema';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const right = getRightBySlug(params.slug);
  if (!right) notFound();

  const title = right.name_en;
  const description = right.desc_en || `Learn about ${title} in Tamil Nadu.`;
  const canonical = `${SITE_URL}/awareness/right/${right.slug}`;

  return {
    title: `${title} - Citizen Rights | VizhiTN`,
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
  const right = getRightBySlug(params.slug);
  if (!right) notFound();

  const newsArticleSchema = generateNewsArticleSchema({
    headline: right.name_en,
    description: right.desc_en || right.name_en,
    url: `${SITE_URL}/awareness/right/${right.slug}`,
    imageUrl: null,
    datePublished: right.publish_date || right.created_date,
    dateModified: right.updated_date || right.publish_date || right.created_date,
    authorName: 'VizhiTN Reporter',
    section: 'Civic Awareness',
    language: 'en-IN',
  });

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Citizen Rights', href: '/awareness/rights' },
          { name: right.name_en, href: `/awareness/right/${right.slug}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />
      <AwarenessRightDetail right={right} />
    </>
  );
}
