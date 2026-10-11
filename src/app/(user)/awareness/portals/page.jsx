import AwarenessPortals from '@/views/AwarenessPortals';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getAllPortals } from '@/lib/awarenessServer';

const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Verified Tamil Nadu Official Government Portals & e-Services | VizhiTN',
  description: 'Verified directory of official Tamil Nadu government portals — TN e-Sevai, TANGEDCO TNEB, TNPDS Ration Card, Police e-Services, RTI Online, CMS Helpline, and CMCHIS.',
  alternates: { canonical: `${SITE_URL}/awareness/portals` },
  robots: { index: true, follow: true },
  keywords: [
    'tamil nadu official government portals',
    'tnesevai official portal',
    'tnpds smart ration card login',
    'tangedco eb bill payment portal',
    'tn police eservices fir',
    'rtionline tn',
    'cm helpline cms tn',
  ],
  openGraph: {
    title: 'Verified Tamil Nadu Official Government Portals | VizhiTN',
    description: 'Safe, anti-phishing directory of genuine .gov.in and .nic.in portals for Tamil Nadu citizens.',
    url: `${SITE_URL}/awareness/portals`,
    type: 'website',
    locale: 'en_IN',
  },
};

export default function Page() {
  const portals = getAllPortals();

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tamil Nadu Official Government Portals Directory',
    description: 'Direct verified links to official government websites for public services and grievance redressing in Tamil Nadu.',
    itemListElement: portals.map((portal, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: portal.name_en,
      url: `${SITE_URL}/awareness/portal/${portal.slug}`,
    })),
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Official Portals', href: '/awareness/portals' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <AwarenessPortals />
    </>
  );
}
