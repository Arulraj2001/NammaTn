"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Home = nextDynamic(() => import('@/views/Home'), { ssr: false });

function HomeSkeleton() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Hero skeleton - matches hero section height */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700" style={{ minHeight: '420px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="h-6 w-48 bg-white/15 rounded-full mx-auto mb-5" />
          <div className="h-10 w-80 bg-white/20 rounded-xl mx-auto mb-3" />
          <div className="h-10 w-64 bg-white/20 rounded-xl mx-auto mb-4" />
          <div className="h-5 w-96 max-w-full bg-white/10 rounded-lg mx-auto mb-8" />
          <div className="flex gap-3 justify-center">
            <div className="h-12 w-48 bg-white/20 rounded-xl" />
            <div className="h-12 w-40 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
      {/* Steps skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse" style={{ minHeight: '120px' }}>
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
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
