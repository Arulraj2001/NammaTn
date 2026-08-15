import AwarenessEmergency from '@/views/AwarenessEmergency';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Emergency Contacts & Crisis Helplines for Tamil Nadu | VizhiTN',
  description: 'Quick reference for emergency services, crisis helplines, and urgent assistance contacts available 24/7 in Tamil Nadu.',
  alternates: { canonical: '/awareness/emergency' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Emergency Contacts & Helplines',
    description: 'Access 24/7 emergency services and crisis support in Tamil Nadu.',
    url: '/awareness/emergency',
    type: 'website',
  },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Emergency Contacts', href: '/awareness/emergency' }]} /><AwarenessEmergency /></>;
}
