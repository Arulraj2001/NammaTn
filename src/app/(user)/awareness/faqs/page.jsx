import AwarenessFaqs from '@/views/AwarenessFaqs';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'FAQs', href: '/awareness/faqs' }]} /><AwarenessFaqs /></>;
}
