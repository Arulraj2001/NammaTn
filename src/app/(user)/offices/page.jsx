import React from 'react';
import Offices from '@/views/Offices';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Government Offices', href: '/offices' }]} /><Offices /></>;
}
