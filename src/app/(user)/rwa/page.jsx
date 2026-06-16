"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const RWADashboard = nextDynamic(() => import('@/views/RWADashboard'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RWADashboard />
    </Suspense>
  );
}
