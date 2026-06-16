"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Offices = nextDynamic(() => import('@/views/Offices'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Offices />
    </Suspense>
  );
}
