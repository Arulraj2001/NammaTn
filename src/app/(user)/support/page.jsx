import Support from '@/views/Support';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Support Tamil Nadu Civic Technology',
  description: 'Support VizhiTN and help keep Tamil Nadu civic reporting, public-interest information, and community tools accessible to everyone.',
  alternates: { canonical: '/support' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Support VizhiTN', href: '/support' }]} /><Support /></>;
}
