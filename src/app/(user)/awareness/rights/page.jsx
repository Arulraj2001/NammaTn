import AwarenessRights from '@/views/AwarenessRights';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Citizen Statutory Rights & Protection Laws in Tamil Nadu | VizhiTN',
  description: 'Explore citizen statutory rights in Tamil Nadu: RTI Act 2005, Consumer Protection, Police Check rights, Senior Citizens Protection, and Labor Laws.',
  alternates: { canonical: '/awareness/rights' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Citizen Rights & Protection Laws in Tamil Nadu | VizhiTN',
    description: 'Statutory protections, legal remedies, and government SLAs for Tamil Nadu citizens.',
    url: '/awareness/rights',
    type: 'website',
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Citizen Rights', href: '/awareness/rights' }]} />
      <AwarenessRights />
    </>
  );
}
