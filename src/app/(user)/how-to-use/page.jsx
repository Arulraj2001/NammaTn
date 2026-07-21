import React from 'react';
import HowToUse from '@/views/HowToUse';

export const metadata = {
  title: 'How to Use VizhiTN',
  description: 'Learn how to report civic issues, share local alerts, verify updates, and participate safely in VizhiTN communities.',
  alternates: { canonical: '/how-to-use' },
  openGraph: { title: 'How to Use VizhiTN', description: 'A practical guide to reporting and participating on VizhiTN.', url: '/how-to-use' },
};

export default function Page() {
  return <HowToUse />;
}
