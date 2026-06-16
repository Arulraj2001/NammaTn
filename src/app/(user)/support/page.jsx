"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Support = nextDynamic(() => import('@/views/Support'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Support />
    </Suspense>
  );
}
