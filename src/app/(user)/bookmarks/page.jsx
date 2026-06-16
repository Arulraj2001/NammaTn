"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Bookmarks = nextDynamic(() => import('@/views/Bookmarks'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Bookmarks />
    </Suspense>
  );
}
