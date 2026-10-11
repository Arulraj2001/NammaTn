import AwarenessEmergency from '@/views/AwarenessEmergency';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Tamil Nadu 24x7 Emergency Helplines & Golden Hour SOPs | VizhiTN',
  description: 'Instant 24x7 speed dial emergency directory for all 38 Tamil Nadu districts: 112 Unified, 108 Ambulance, 1912 Minnalagam EB, 1930 Cyber Fraud, and 1070 Disaster Control.',
  alternates: { canonical: `${SITE_URL}/awareness/emergency` },
  robots: { index: true, follow: true },
  keywords: [
    'tamil nadu emergency numbers',
    '108 ambulance helpline',
    '1912 minnalagam eb',
    '1930 cyber crime helpline',
    'chennai corporation 1913',
    'disaster helpline 1070',
    'district collectorate helpline 1077',
  ],
  openGraph: {
    title: 'Tamil Nadu 24x7 Emergency Helplines & Golden Hour Protocols | VizhiTN',
    description: 'Life-saving emergency contact directory and golden hour protocols for Tamil Nadu citizens.',
    url: `${SITE_URL}/awareness/emergency`,
    type: 'website',
    locale: 'en_IN',
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Emergency Contacts', href: '/awareness/emergency' },
        ]}
      />
      <AwarenessEmergency />
    </>
  );
}
