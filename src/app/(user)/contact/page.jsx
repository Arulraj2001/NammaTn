import React from 'react';
import Contact from '@/views/Contact';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Contact',
  description: 'Contact VizhiTN for platform support, feedback, content reports, partnerships, or advertising enquiries.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact VizhiTN', description: 'Support, feedback and enquiries for VizhiTN.', url: '/contact' },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Contact', href: '/contact' }]} /><Contact /></>;
}
