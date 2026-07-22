import AwarenessSchemes from '@/views/AwarenessSchemes';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'Government Schemes', href: '/awareness/schemes' }]} /><AwarenessSchemes /></>;
}
