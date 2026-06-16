"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Districts = nextDynamic(() => import('@/views/Districts'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Districts />
    </Suspense>
  );
}
