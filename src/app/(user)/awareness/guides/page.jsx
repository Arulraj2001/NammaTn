import AwarenessGuides from '@/views/AwarenessGuides';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Practical Civic Guides for Tamil Nadu Citizens | VizhiTN',
  description: 'Step-by-step guides for accessing government services, filing complaints, obtaining documents, and exercising civic rights in Tamil Nadu.',
  alternates: { canonical: '/awareness/guides' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Practical Civic Guides',
    description: 'Learn how to access services, file complaints, and exercise your civic rights in Tamil Nadu.',
    url: '/awareness/guides',
    type: 'website',
  },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Citizen Guides', href: '/awareness/guides' }]} /><AwarenessGuides /></>;
}
