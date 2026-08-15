import AwarenessSchemes from '@/views/AwarenessSchemes';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Government Schemes & Programs in Tamil Nadu | VizhiTN',
  description: 'Explore government welfare schemes, subsidies, and public programs available in Tamil Nadu with eligibility and application details.',
  alternates: { canonical: '/awareness/schemes' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Government Schemes in Tamil Nadu',
    description: 'Discover welfare schemes, subsidies, and public programs available for Tamil Nadu citizens.',
    url: '/awareness/schemes',
    type: 'website',
  },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Government Schemes', href: '/awareness/schemes' }]} /><AwarenessSchemes /></>;
}
