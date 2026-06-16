"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Jobs = nextDynamic(() => import('@/views/Jobs'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Jobs />
    </Suspense>
  );
}
