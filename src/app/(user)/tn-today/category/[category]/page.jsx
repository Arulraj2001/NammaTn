import React from 'react';
import TnToday from '@/views/TnToday';
import { getTnTodayArchive } from '@/lib/tnTodayServer';

export const revalidate = 300;

export default async function Page({ params }) {
  const { category } = await params;
  const { articles, featured } = await getTnTodayArchive(category);
  return (
    <TnToday
      initialArticles={articles}
      initialFeatured={featured}
      initialCategory={category}
    />
  );
}
