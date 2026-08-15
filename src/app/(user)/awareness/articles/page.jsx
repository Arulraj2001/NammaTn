import AwarenessArticles from '@/views/AwarenessArticles';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Citizen Knowledge Base & In-Depth Guides | VizhiTN',
  description: 'In-depth guides on Tamil Nadu e-Sevai online services, RTI filing, CMCHIS health insurance, Patta land record verification, and traffic police rights.',
  alternates: { canonical: '/awareness/articles' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Citizen Knowledge Base & In-Depth Guides | VizhiTN',
    description: 'Comprehensive, verified guides on government e-services, RTI, health insurance, and land records in Tamil Nadu.',
    url: '/awareness/articles',
    type: 'website',
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Knowledge Articles', href: '/awareness/articles' }]} />
      <AwarenessArticles />
    </>
  );
}
