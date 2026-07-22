import AwarenessGuides from '@/views/AwarenessGuides';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Citizen Guides', href: '/awareness/guides' }]} /><AwarenessGuides /></>;
}
