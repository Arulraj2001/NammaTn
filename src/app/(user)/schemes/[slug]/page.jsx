import { getSchemeBySlug, getAllSchemes } from '@/lib/awarenessServer';
import AwarenessSchemeDetail from '@/views/AwarenessSchemeDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateStaticParams() {
  const schemes = getAllSchemes();
  const baseSlugs = schemes.map((s) => ({ slug: s.slug }));
  const aliasSlugs = [
    { slug: 'kalaignar-magalir-urimai-status' },
    { slug: 'magalir-urimai-status-check' },
    { slug: 'smart-ration-card-address-change' },
    { slug: 'patta-chitta-online-download' },
    { slug: 'tangedco-eb-name-transfer' },
    { slug: 'pudhumai-penn-status' },
    { slug: 'tamil-pudhalvan-status' },
  ];
  return [...baseSlugs, ...aliasSlugs];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const scheme = getSchemeBySlug(resolvedParams.slug);
  if (!scheme) notFound();

  const title = `${scheme.name_en} (${scheme.name_ta}) — 2026 Eligibility, ₹ Amount & Online Apply`;
  const description = `${scheme.financial_benefit_en || scheme.benefits_en || scheme.name_en}. Complete Tamil Nadu eligibility criteria, required documents checklist, official portal links and FAQs.`;
  const canonical = `${SITE_URL}/schemes/${scheme.slug}`;
  const ogImage = scheme.image_url ? `${SITE_URL}${scheme.image_url}` : `${SITE_URL}/og-image.png`;

  return {
    title: `${title} | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    keywords: [
      scheme.slug,
      scheme.name_en,
      scheme.name_ta,
      'tamil nadu government scheme',
      scheme.department_en,
      'eligibility criteria',
      'how to apply online',
      'tnesevai',
    ],
    openGraph: {
      title: `${title} | VizhiTN`,
      description,
      url: canonical,
      type: 'article',
      locale: 'ta_IN',
      siteName: 'VizhiTN — Tamil Nadu Civic Platform',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: scheme.name_en,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | VizhiTN`,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const scheme = getSchemeBySlug(resolvedParams.slug);
  if (!scheme) notFound();

  const canonicalUrl = `${SITE_URL}/schemes/${scheme.slug}`;

  // Schema 1: GovernmentService
  const govtServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: scheme.name_en,
    alternateName: scheme.name_ta,
    serviceType: scheme.category_en || 'Public Welfare Scheme',
    provider: {
      '@type': 'GovernmentOrganization',
      name: scheme.department_en || 'Government of Tamil Nadu',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Tamil Nadu, India',
    },
    url: canonicalUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: scheme.financial_benefit_en || scheme.benefits_en || 'Free Government Welfare Entitlement',
    },
  };

  // Schema 2: FAQPage
  const faqSchema = (scheme.faqs && scheme.faqs.length > 0) ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: scheme.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q_en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${faq.a_en} (${faq.a_ta})`,
      },
    })),
  } : null;

  // Schema 3: BreadcrumbList
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
        name: 'Government Schemes',
        item: `${SITE_URL}/schemes`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: scheme.name_en,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Government Schemes', href: '/schemes' },
          { name: scheme.name_en, href: `/schemes/${scheme.slug}` },
        ]}
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
      <AwarenessSchemeDetail scheme={scheme} />
    </>
  );
}
