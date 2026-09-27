import { getSchemeBySlug } from '@/lib/awarenessServer';
import AwarenessSchemeDetail from '@/views/AwarenessSchemeDetail';
import { notFound } from 'next/navigation';
import { generateNewsArticleSchema } from '@/lib/seo/newsSchema';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const scheme = getSchemeBySlug(resolvedParams.slug);
  if (!scheme) notFound();

  const title = `${scheme.name_en} (${scheme.name_ta}) - Eligibility & How to Apply`;
  const description = scheme.financial_benefit_en || scheme.benefits_en || `Complete guide to ${scheme.name_en} in Tamil Nadu with eligibility criteria, documents, and application steps.`;
  const canonical = `${SITE_URL}/schemes/${scheme.slug}`;
  const ogImage = scheme.image_url ? `${SITE_URL}${scheme.image_url}` : `${SITE_URL}/og-image.png`;

  return {
    title: `${title} | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: scheme.name_en,
        }
      ],
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const scheme = getSchemeBySlug(resolvedParams.slug);
  if (!scheme) notFound();

  const ogImage = scheme.image_url ? `${SITE_URL}${scheme.image_url}` : null;

  const newsArticleSchema = generateNewsArticleSchema({
    headline: scheme.name_en,
    description: scheme.financial_benefit_en || scheme.benefits_en || scheme.name_en,
    url: `${SITE_URL}/schemes/${scheme.slug}`,
    imageUrl: ogImage,
    datePublished: '2026-01-01T00:00:00Z',
    dateModified: '2026-09-27T00:00:00Z',
    authorName: 'VizhiTN Civic Editorial',
    section: 'Government Schemes',
    language: 'ta-IN',
  });

  const faqSchema = scheme.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: scheme.faqs.map(faq => ({
      '@type': 'Question',
      name: `${faq.q_en} / ${faq.q_ta}`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${faq.a_en} — ${faq.a_ta}`,
      },
    })),
  } : null;

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Home', href: '/' },
        { name: 'Schemes', href: '/schemes' },
        { name: scheme.name_en, href: `/schemes/${scheme.slug}` },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <AwarenessSchemeDetail scheme={scheme} />
    </>
  );
}
