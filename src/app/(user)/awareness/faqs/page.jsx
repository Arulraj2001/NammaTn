import AwarenessFaqs from '@/views/AwarenessFaqs';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Civic FAQs: Common Questions & Answers for Tamil Nadu | VizhiTN',
  description: 'Find answers to common questions about government services, civic rights, public complaints, and citizen resources in Tamil Nadu.',
  alternates: { canonical: '/awareness/faqs' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Civic FAQs for Tamil Nadu',
    description: 'Find answers to common questions about civic rights and government services.',
    url: '/awareness/faqs',
    type: 'website',
  },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }, { name: 'FAQs', href: '/awareness/faqs' }]} /><AwarenessFaqs /></>;
}
