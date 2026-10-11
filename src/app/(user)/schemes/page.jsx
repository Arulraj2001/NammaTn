import AwarenessSchemes from '@/views/AwarenessSchemes';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getAllSchemes } from '@/lib/awarenessServer';

const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Tamil Nadu Government Schemes Encyclopedia 2026 (திட்டங்கள்) | VizhiTN',
  description: 'Verified directory of Tamil Nadu government welfare schemes — Kalaignar Magalir Urimai Thogai ₹1000, Pudhumai Penn, CMCHIS Health ₹5L, Old Age Pension (OAP), First Graduate, and MGNREGA with online application links.',
  alternates: { canonical: `${SITE_URL}/schemes` },
  robots: { index: true, follow: true },
  keywords: [
    'tamil nadu government schemes 2026',
    'magalir urimai thogai online apply',
    'pudhumai penn scheme eligibility',
    'cmchis hospital list',
    'tamil nadu old age pension scheme',
    'first graduate certificate apply tn',
    'tnesevai schemes',
  ],
  openGraph: {
    title: 'Tamil Nadu Government Schemes Encyclopedia 2026 | VizhiTN',
    description: 'Explore welfare schemes, benefits, documents needed, and application procedures for Tamil Nadu citizens.',
    url: `${SITE_URL}/schemes`,
    type: 'website',
    locale: 'ta_IN',
  },
};

export default function Page() {
  const schemes = getAllSchemes();

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tamil Nadu Government Welfare Schemes Directory 2026',
    description: 'Official directory of public welfare schemes and direct benefit transfers in Tamil Nadu.',
    itemListElement: schemes.map((scheme, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: scheme.name_en,
      url: `${SITE_URL}/schemes/${scheme.slug}`,
    })),
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Government Schemes', href: '/schemes' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <AwarenessSchemes />
    </>
  );
}
