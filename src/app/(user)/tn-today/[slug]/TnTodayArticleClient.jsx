"use client";
// Client boundary wrapper — loaded dynamically (ssr: false) by the page
import nextDynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const TnTodayArticle = nextDynamic(() => import('@/views/TnTodayArticle'), { ssr: false });

export default function TnTodayArticleClient() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] w-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
      <TnTodayArticle />
    </Suspense>
  );
}
