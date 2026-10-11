import { getFaqBySlug, getAllFaqs } from '@/lib/awarenessServer';
import AwarenessFaqDetail from '@/views/AwarenessFaqDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateStaticParams() {
  const faqs = getAllFaqs();
  return faqs.map((f) => ({
    slug: f.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const faq = getFaqBySlug(resolvedParams.slug);
  if (!faq) notFound();

  const title = `${faq.question_en} — Tamil Nadu Citizen FAQ`;
  const description = (faq.answer_en || '').slice(0, 160);
  const canonical = `${SITE_URL}/awareness/faq/${faq.slug}`;

  return {
    title: `${title} | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    keywords: [
      faq.slug,
      'tamil nadu civic faq',
      faq.category_en,
      'official procedure',
      'tn citizen help',
    ],
    openGraph: {
      title: `${title} | VizhiTN`,
      description,
      url: canonical,
      type: 'article',
      locale: 'en_IN',
      siteName: 'VizhiTN — Tamil Nadu Civic Platform',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | VizhiTN`,
      description,
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const faq = getFaqBySlug(resolvedParams.slug);
  if (!faq) notFound();

  const canonicalUrl = `${SITE_URL}/awareness/faq/${faq.slug}`;

  // Schema 1: FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: faq.question_en,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${faq.answer_en} (${faq.answer_ta})`,
        },
      },
    ],
  };

  // Schema 2: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'VizhiTN Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Awareness',
        item: `${SITE_URL}/awareness`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'FAQs',
        item: `${SITE_URL}/awareness/faqs`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: faq.question_en,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'FAQs', href: '/awareness/faqs' },
          { name: faq.question_en, href: `/awareness/faq/${faq.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AwarenessFaqDetail faq={faq} />
    </>
  );
}
