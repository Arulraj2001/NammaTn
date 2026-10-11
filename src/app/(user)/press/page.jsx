import React from 'react';
import Press from '@/views/Press';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: {
    absolute: 'Press & Media | VizhiTN — Tamil Nadu Civic Platform',
  },
  description:
    "Press resources for VizhiTN — Tamil Nadu's civic proof platform covering all 38 districts. Media kit, key facts, platform overview and press contact.",
  alternates: {
    canonical: 'https://www.vizhitn.in/press',
  },
  openGraph: {
    title: 'Press & Media | VizhiTN — Tamil Nadu Civic Platform',
    description:
      "Press resources for VizhiTN — Tamil Nadu's civic proof platform covering all 38 districts. Media kit, key facts, platform overview and press contact.",
    url: 'https://www.vizhitn.in/press',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Press & Media | VizhiTN — Tamil Nadu Civic Platform',
    description:
      "Press resources for VizhiTN — Tamil Nadu's civic proof platform covering all 38 districts. Media kit, key facts, platform overview and press contact.",
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Press & Media', href: '/press' }]} />
      <Press />
    </>
  );
}
