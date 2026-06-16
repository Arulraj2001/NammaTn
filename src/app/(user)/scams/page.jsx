"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Scams = nextDynamic(() => import('@/views/Scams'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Scams />
    </Suspense>
  );
}
