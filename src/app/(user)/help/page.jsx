"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Help = nextDynamic(() => import('@/views/Help'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Help />
    </Suspense>
  );
}
