import React from 'react';
import TnToday from '@/views/TnToday';
import { getTnTodayArchive } from '@/lib/tnTodayServer';

export const revalidate = 300;

export default async function Page() {
  const { articles, featured } = await getTnTodayArchive();
  return <TnToday initialArticles={articles} initialFeatured={featured} />;
}
