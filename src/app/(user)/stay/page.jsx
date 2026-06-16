"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Stay = nextDynamic(() => import('@/views/Stay'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Stay />
    </Suspense>
  );
}
