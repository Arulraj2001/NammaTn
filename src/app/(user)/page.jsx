import React, { Suspense } from 'react';
import Home from '@/views/Home';

export const metadata = {
  title: "VizhiTN – Know what's happening in your area right now",
  description: "Report civic issues, see live alerts, find stays & jobs in Tamil Nadu. All in one place, verified by citizens.",
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
    <Suspense fallback={<HomeSkeleton />}>
      <Home />
    </Suspense>
  );
}
