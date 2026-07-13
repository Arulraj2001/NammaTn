import React, { Suspense } from 'react';
import Home from '@/views/Home';
import { HomeCityLinks, AllCategoryLinks } from '@/components/seo/InternalLinks';

// Title deliberately excludes "| VizhiTN" — the root layout template adds it.
export const metadata = {
  title: "Tamil Nadu Civic Complaints, Local Alerts & Community Updates",
  description: "Report civic complaints and track power cuts, water issues, road problems, scams, jobs and local alerts across Tamil Nadu. Community-verified updates on VizhiTN.",
  alternates: {
    // Self-canonical on homepage prevents www vs non-www duplication
    canonical: 'https://www.vizhitn.in/',
  },
};

function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="w-full lg:w-[44%] space-y-4">
              <div className="h-10 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="h-10 w-4/6 bg-blue-100 dark:bg-blue-900/30 rounded-xl" />
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="flex gap-3 pt-2">
                <div className="h-11 w-44 bg-blue-200 dark:bg-blue-900/30 rounded-xl" />
                <div className="h-11 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            </div>
            <div className="w-full lg:flex-1 h-[340px] bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          </div>
        </div>
      </div>
      {/* Quick actions skeleton */}
      <div className="bg-white dark:bg-slate-900 border-b py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[1,2,3,4,5,6].map(i=><div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl"/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<HomeSkeleton />}>
        <Home />
      </Suspense>

      <section className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Browse Tamil Nadu civic reports by district</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Find local complaints, alerts and community updates near you.</p>
            <div className="mt-3"><HomeCityLinks /></div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Explore issues across Tamil Nadu</h2>
            <div className="mt-3"><AllCategoryLinks /></div>
          </div>
        </div>
      </section>
    </>
  );
}
