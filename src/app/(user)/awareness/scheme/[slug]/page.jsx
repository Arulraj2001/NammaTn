import { getSchemeBySlug, getAllSchemes } from '@/lib/awarenessServer';
import AwarenessSchemeDetail from '@/views/AwarenessSchemeDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateStaticParams() {
  const schemes = getAllSchemes();
  return schemes.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const scheme = getSchemeBySlug(resolvedParams.slug);
  if (!scheme) notFound();

  const title = `${scheme.name_en} (${scheme.name_ta}) — Eligibility & Online Apply`;
  const description = `${scheme.financial_benefit_en || scheme.benefits_en || scheme.name_en}. Complete Tamil Nadu eligibility criteria, required documents, and official portal.`;
  const canonical = `${SITE_URL}/schemes/${scheme.slug}`;

  return {
    title: `${title} | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | VizhiTN`,
      description,
      url: canonical,
      type: 'article',
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const scheme = getSchemeBySlug(resolvedParams.slug);
  if (!scheme) notFound();

  const canonicalUrl = `${SITE_URL}/schemes/${scheme.slug}`;

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
    url: canonicalUrl,
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Schemes', href: '/schemes' },
          { name: scheme.name_en, href: `/schemes/${scheme.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(govtServiceSchema) }}
      />
      <AwarenessSchemeDetail scheme={scheme} />
    </>
  );
}
