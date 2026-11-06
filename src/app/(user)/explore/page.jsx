import React, { Suspense } from 'react';
import Explore from '@/views/Explore';
import { getExplorePosts } from '@/lib/publicHubServer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// 5-minute background revalidation to conserve serverless compute credits.
// On-demand revalidation via /api/revalidate instantly updates this page on new post imports.
export const revalidate = 300;

export const metadata = {
  title: 'Explore Tamil Nadu Civic Reports & Local Updates | VizhiTN',
  description: 'Discover recent Civic Receipts, public complaints, local alerts, discussions, and community updates from across Tamil Nadu.',
  alternates: { canonical: '/explore' },
  robots: { index: true, follow: true },
};

export default async function Page() {
  const initialPosts = await getExplorePosts(18);
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Explore', href: '/explore' }]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <header className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Tamil Nadu Civic Reports, Utility Alerts & Public Grievances
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Browse verified citizen complaints, TANGEDCO power cut alerts, corporation resolutions, and local civic updates across all 38 districts of Tamil Nadu.
          </p>
        </header>
      </div>
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialPosts.slice(0, 6).map((p) => (
              <div key={p.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{p.category_slug || 'Civic'}</span>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-2">{p.title_en}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{p.content_en}</p>
              </div>
            ))}
          </div>
        </div>
      }>
        <Explore initialPosts={initialPosts} />
      </Suspense>
    </>
  );
}
