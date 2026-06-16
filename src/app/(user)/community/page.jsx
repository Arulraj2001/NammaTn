"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Community = nextDynamic(() => import('@/views/Community'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Community />
    </Suspense>
  );
}
