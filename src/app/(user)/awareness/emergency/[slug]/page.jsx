import { getEmergencyContactBySlug, getAllEmergencyContacts } from '@/lib/awarenessServer';
import AwarenessEmergencyDetail from '@/views/AwarenessEmergencyDetail';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const revalidate = 3600;

export async function generateStaticParams() {
  const contacts = getAllEmergencyContacts();
  return contacts.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const emergency = getEmergencyContactBySlug(resolvedParams.slug);
  if (!emergency) notFound();

  const title = `${emergency.name_en} (${emergency.number}) — Tamil Nadu 24x7 Helpline`;
  const description = `${emergency.description_en} 24x7 Emergency Contact Number: ${emergency.number}. Free toll-free service in Tamil Nadu.`;
  const canonical = `${SITE_URL}/awareness/emergency/${emergency.slug}`;

  return {
    title: `${title} | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    keywords: [
      emergency.slug,
      emergency.number,
      emergency.name_en,
      'emergency helpline tamil nadu',
      '24x7 helpline',
      emergency.category_en,
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
  const emergency = getEmergencyContactBySlug(resolvedParams.slug);
  if (!emergency) notFound();

  const canonicalUrl = `${SITE_URL}/awareness/emergency/${emergency.slug}`;

  // Schema 1: EmergencyService / GovernmentService
  const emergencySchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: emergency.name_en,
    alternateName: emergency.name_ta,
    serviceType: emergency.category_en || 'Emergency & Crisis Helpline',
    provider: {
      '@type': 'GovernmentOrganization',
      name: 'Government of Tamil Nadu',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Tamil Nadu, India',
    },
    telephone: emergency.number,
    url: canonicalUrl,
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
        name: 'Emergency Contacts',
        item: `${SITE_URL}/awareness/emergency`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: emergency.name_en,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Emergency', href: '/awareness/emergency' },
          { name: emergency.name_en, href: `/awareness/emergency/${emergency.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(emergencySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AwarenessEmergencyDetail emergency={emergency} />
    </>
  );
}
