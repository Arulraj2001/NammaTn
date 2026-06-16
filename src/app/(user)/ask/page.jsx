"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AskLocal = nextDynamic(() => import('@/views/AskLocal'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AskLocal />
    </Suspense>
  );
}
