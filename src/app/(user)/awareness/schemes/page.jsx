import AwarenessSchemes from '@/views/AwarenessSchemes';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const SITE_URL = 'https://www.vizhitn.in';

export const metadata = {
  title: 'Tamil Nadu Government Schemes Directory 2026 | VizhiTN',
  description: 'Explore welfare schemes, monthly allowances, health insurance, and scholarships in Tamil Nadu with official links.',
  alternates: { canonical: `${SITE_URL}/schemes` },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Awareness', href: '/awareness' },
          { name: 'Government Schemes', href: '/schemes' },
        ]}
      />
      <AwarenessSchemes />
    </>
  );
}
