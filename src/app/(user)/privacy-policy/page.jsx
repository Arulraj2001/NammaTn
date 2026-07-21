import React from 'react';
import PrivacyPolicy from '@/views/PrivacyPolicy';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read how VizhiTN collects, uses, protects, and manages personal data and analytics consent.',
  alternates: { canonical: '/privacy-policy' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <PrivacyPolicy />;
}
