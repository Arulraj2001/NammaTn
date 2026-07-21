import React from 'react';
import TermsOfService from '@/views/TermsOfService';

export const metadata = {
  title: 'Terms of Service',
  description: 'Read the terms that govern access to and participation on the VizhiTN civic and community platform.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <TermsOfService />;
}
