import AwarenessRights from '@/views/AwarenessRights';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Tamil Nadu Citizen Rights & Legal Protection Guide (உரிமைகள்)',
  description: 'Complete guide to statutory rights in Tamil Nadu — Right to Information (RTI Act 2005), Traffic Police Check Rights, Consumer Protection, Tenant & Senior Citizen Laws.',
  alternates: { canonical: '/rights' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Tamil Nadu Citizen Rights & Legal Protection Guide | VizhiTN',
    description: 'Learn your legal protections, RTI drafting templates, and police vehicle check rules in Tamil Nadu.',
    url: '/rights',
    type: 'website',
    images: [{ url: 'https://www.vizhitn.in/images/evergreen/rti-rights.jpg', width: 1200, height: 630, alt: 'Tamil Nadu Citizen Rights' }]
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Citizen Rights', href: '/rights' }]} />
      <AwarenessRights />
    </>
  );
}
