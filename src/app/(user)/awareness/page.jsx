"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Awareness = nextDynamic(() => import('@/views/Awareness'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Awareness />
    </Suspense>
  );
}
