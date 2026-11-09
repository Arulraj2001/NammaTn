import React from 'react';
import TrackComplaint from '@/views/TrackComplaint';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Civic Complaint & Receipt Tracker | VizhiTN Tamil Nadu',
  description: 'Track the status of your civic complaints, verified municipal receipts, and departmental actions across Tamil Nadu.',
  alternates: { canonical: '/track' },
  openGraph: {
    title: 'Civic Complaint Tracker | VizhiTN',
    description: 'Track official departmental status for TANGEDCO, GCC, and TWAD complaints with photo proof.',
    url: '/track',
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Civic Tracker', href: '/track' }]} />
      <TrackComplaint />
    </>
  );
}

