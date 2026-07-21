import React from 'react';
import Districts from '@/views/Districts';

export const metadata = {
  title: 'Tamil Nadu Districts',
  description: 'Browse civic reports, local alerts, and community updates across all 38 districts of Tamil Nadu.',
  alternates: { canonical: '/districts' },
  openGraph: { title: 'Tamil Nadu Districts', description: 'Explore local civic information across all 38 Tamil Nadu districts.', url: '/districts' },
};

export default function Page() {
  return <Districts />;
}
