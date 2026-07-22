import AwarenessEmergency from '@/views/AwarenessEmergency';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Emergency Contacts', href: '/awareness/emergency' }]} /><AwarenessEmergency /></>;
}
