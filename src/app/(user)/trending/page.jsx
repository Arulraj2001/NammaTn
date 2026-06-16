"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Trending = nextDynamic(() => import('@/views/Trending'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Trending />
    </Suspense>
  );
}
