"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AreaDetail = nextDynamic(() => import('@/views/AreaDetail'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AreaDetail />
    </Suspense>
  );
}
