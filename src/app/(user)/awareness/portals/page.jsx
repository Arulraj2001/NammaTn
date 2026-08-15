import AwarenessPortals from '@/views/AwarenessPortals';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Official Government Portals for Tamil Nadu | VizhiTN',
  description: 'Direct links to official government websites and portals for accessing services, filing complaints, and tracking applications in Tamil Nadu.',
  alternates: { canonical: '/awareness/portals' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Government Portals in Tamil Nadu',
    description: 'Access official government websites and services for Tamil Nadu citizens.',
    url: '/awareness/portals',
    type: 'website',
  },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Official Portals', href: '/awareness/portals' }]} /><AwarenessPortals /></>;
}
