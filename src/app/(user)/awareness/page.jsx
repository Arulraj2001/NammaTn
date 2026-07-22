import React from 'react';
import Awareness from '@/views/Awareness';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Citizen Awareness and Government Resources',
  description: 'Tamil Nadu citizen rights, emergency contacts, government schemes, official portals, and practical civic guides.',
  alternates: { canonical: '/awareness' },
  openGraph: { title: 'Tamil Nadu Citizen Awareness Resources', description: 'Rights, schemes, emergency contacts and official civic resources.', url: '/awareness' },
};

export default function Page() {
  return <><Breadcrumbs items={[{ name: 'Awareness', href: '/awareness' }]} /><Awareness /></>;
}
