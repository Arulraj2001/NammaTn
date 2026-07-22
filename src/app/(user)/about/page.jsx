import React from 'react';
import About from '@/views/About';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'About',
  description: 'Learn how VizhiTN helps Tamil Nadu residents report civic issues, share verified local updates, and improve their communities.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About VizhiTN',
    description: 'A people-powered civic information and community platform for Tamil Nadu.',
    url: '/about',
  },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'About VizhiTN', href: '/about' }]} /><About /></>;
}
