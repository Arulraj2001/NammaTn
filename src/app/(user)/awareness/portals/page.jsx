import AwarenessPortals from '@/views/AwarenessPortals';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Official Portals', href: '/awareness/portals' }]} /><AwarenessPortals /></>;
}
