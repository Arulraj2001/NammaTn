import React from 'react';
import CookiePolicy from '@/views/CookiePolicy';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Cookie Policy | VizhiTN — Analytics, AdSense & Consent Controls',
  description: 'Read VizhiTN\'s full cookie policy. Understand which cookies are strictly necessary vs optional analytics and Google AdSense advertising cookies, and manage your preferences.',
  alternates: { canonical: '/cookie-policy' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Cookie Policy', href: '/cookie-policy' }]} />
      <CookiePolicy />
    </>
  );
}
