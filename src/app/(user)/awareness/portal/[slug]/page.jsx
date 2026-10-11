import { getPortalBySlug, getAllPortals } from '@/lib/awarenessServer';
import AwarenessPortalDetail from '@/views/AwarenessPortalDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateStaticParams() {
  const portals = getAllPortals();
  return portals.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const portal = getPortalBySlug(resolvedParams.slug);
  if (!portal) notFound();

  const title = `${portal.name_en} (${portal.name_ta}) — Official Portal Guide & Direct Link`;
  const description = `${portal.description_en} Verified official website URL: ${portal.url}. Access ${portal.category_en} by ${portal.dept_en} securely.`;
  const canonical = `${SITE_URL}/awareness/portal/${portal.slug}`;

  return {
    title: `${title} | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    keywords: [
      portal.slug,
      portal.name_en,
      portal.dept_en,
      'official government portal',
      'tamil nadu online services',
      portal.category_en,
      portal.url,
    ],
    openGraph: {
      title: `${title} | VizhiTN`,
      description,
      url: canonical,
      type: 'website',
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
  const portal = getPortalBySlug(resolvedParams.slug);
  if (!portal) notFound();

  const canonicalUrl = `${SITE_URL}/awareness/portal/${portal.slug}`;

  // Schema 1: GovernmentService
  const govtServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: portal.name_en,
    alternateName: portal.name_ta,
    serviceType: portal.category_en || 'Online Government Portal',
    provider: {
      '@type': 'GovernmentOrganization',
      name: portal.dept_en || 'Government of Tamil Nadu',
    },
    url: portal.url,
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
        name: 'Official Portals',
        item: `${SITE_URL}/awareness/portals`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: portal.name_en,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Official Portals', href: '/awareness/portals' },
          { name: portal.name_en, href: `/awareness/portal/${portal.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(govtServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AwarenessPortalDetail portal={portal} />
    </>
  );
}
