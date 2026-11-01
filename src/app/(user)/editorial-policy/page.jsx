import React from 'react';
import EditorialPolicy from '@/views/EditorialPolicy';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Editorial Standards, Sourcing & Ethics Policy | VizhiTN',
  description: 'The official editorial constitution of VizhiTN: primary source verification, strict non-partisan integrity, AI transparency, and citizen accountability standards.',
  alternates: { canonical: '/editorial-policy' },
  openGraph: {
    title: 'Editorial Standards, Sourcing & Ethics Policy | VizhiTN',
    description: 'Our non-negotiable rules for factual integrity, primary government verification, and citizen trust across Tamil Nadu.',
    url: '/editorial-policy',
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Editorial Policy', href: '/editorial-policy' }]} />
      <EditorialPolicy />
    </>
  );
}

