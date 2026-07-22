import React from 'react';
import TnToday from '@/views/TnToday';
import { notFound } from 'next/navigation';
import { getTnTodayArchive } from '@/lib/tnTodayServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { TN_TODAY_CATEGORY_MAP } from '@/lib/tnTodayCategories';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryData = TN_TODAY_CATEGORY_MAP[category];
  if (!categoryData) notFound();

  const title = `${categoryData.label} News and Civic Updates`;
  const description = `Read ${categoryData.label.toLowerCase()} news, public-interest reporting, and civic updates from across Tamil Nadu.`;
  const canonical = `/tn-today/category/${category}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} | VizhiTN`, description, url: canonical, type: 'website' },
  };
}

export default async function Page({ params }) {
  const { category } = await params;
  const categoryData = TN_TODAY_CATEGORY_MAP[category];
  if (!categoryData) notFound();
  const { articles, featured } = await getTnTodayArchive(category);
  return (
    <>
      <Breadcrumbs items={[
        { name: 'TN Today', href: '/tn-today' },
        { name: categoryData.label, href: `/tn-today/category/${category}` },
      ]} />
      <TnToday
        initialArticles={articles}
        initialFeatured={featured}
        initialCategory={category}
      />
    </>
  );
}
