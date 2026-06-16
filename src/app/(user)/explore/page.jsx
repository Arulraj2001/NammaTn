"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Explore = nextDynamic(() => import('@/views/Explore'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Explore />
    </Suspense>
  );
}
