import AwarenessGuides from '@/views/AwarenessGuides';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getAllGuides } from '@/lib/awarenessServer';

const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Tamil Nadu Civic Problem Action Guides & Helplines | VizhiTN',
  description: 'Official step-by-step action guides for Tamil Nadu citizens: TANGEDCO power cut 1912, Metro Water shortage, TNPDS ration cards, DVAC bribery traps, Cyber Crime 1930 & CMCHIS.',
  alternates: { canonical: `${SITE_URL}/awareness/guides` },
  robots: { index: true, follow: true },
  keywords: [
    'tamil nadu citizen guides',
    'tangedco power cut complaint',
    'metro water complaint chennai',
    'ration card complaints tn',
    'dvac bribe reporting',
    'cyber crime 1930 tamil nadu',
    'patta chitta status',
  ],
  openGraph: {
    title: 'Tamil Nadu Civic Problem Action Guides & Helplines | VizhiTN',
    description: 'Practical, verified step-by-step guides for everyday civic issues in Tamil Nadu with official department helplines.',
    url: `${SITE_URL}/awareness/guides`,
    type: 'website',
    locale: 'en_IN',
  },
};

export default function Page() {
  const guides = getAllGuides();

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tamil Nadu Citizen Action Guides & Civic SOPs',
    description: 'Verified step-by-step procedure guides for resolving public utility, legal, and governmental issues in Tamil Nadu.',
    itemListElement: guides.map((guide, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: guide.title_en,
      url: `${SITE_URL}/awareness/guide/${guide.slug}`,
    })),
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Civic Guides', href: '/awareness/guides' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <AwarenessGuides />
    </>
  );
}
