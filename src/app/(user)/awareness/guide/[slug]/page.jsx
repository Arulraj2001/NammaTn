import { getGuideBySlug, getAllGuides } from '@/lib/awarenessServer';
import AwarenessGuideDetail from '@/views/AwarenessGuideDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((g) => ({
    slug: g.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const guide = getGuideBySlug(resolvedParams.slug);
  if (!guide) notFound();

  const title = guide.seo_title_en || `${guide.title_en} — Tamil Nadu Citizen SOP & Helpline`;
  const description = guide.seo_desc_en || `${guide.summary_en} Official helplines: ${guide.helpline_numbers?.join(', ') || 'Available'}. Escalation procedure in Tamil Nadu.`;
  const canonical = `${SITE_URL}/awareness/guide/${guide.slug}`;

  return {
    title: `${title} | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    keywords: [
      guide.slug,
      'tamil nadu citizen guide',
      guide.category,
      guide.department_en,
      'tn helpline',
      'civic complaint tamil nadu',
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
  const guide = getGuideBySlug(resolvedParams.slug);
  if (!guide) notFound();

  const canonicalUrl = `${SITE_URL}/awareness/guide/${guide.slug}`;

  // Schema 1: HowTo
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title_en,
    description: guide.summary_en || guide.seo_desc_en,
    step: (guide.steps_en || []).map((stepText, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: `Step ${idx + 1}`,
      text: stepText,
    })),
  };

  // Schema 2: GovernmentService
  const govtServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: guide.title_en,
    serviceType: guide.problem_type_en || 'Public Service & Civic Grievance',
    provider: {
      '@type': 'GovernmentOrganization',
      name: guide.department_en || 'Government of Tamil Nadu',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Tamil Nadu, India',
    },
    url: canonicalUrl,
  };

  // Schema 3: FAQPage (if faqs present)
  const faqSchema = (guide.faqs && guide.faqs.length > 0) ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q_en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a_en,
      },
    })),
  } : null;

  // Schema 4: BreadcrumbList
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
        name: 'Civic Guides',
        item: `${SITE_URL}/awareness/guides`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: guide.title_en,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs items={[
        { name: 'Awareness', href: '/awareness' },
        { name: 'Civic Guides', href: '/awareness/guides' },
        { name: guide.title_en, href: `/awareness/guide/${guide.slug}` },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(govtServiceSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AwarenessGuideDetail guide={guide} />
    </>
  );
}
