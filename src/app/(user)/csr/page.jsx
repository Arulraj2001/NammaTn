"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const CSRDashboard = nextDynamic(() => import('@/views/CSRDashboard'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CSRDashboard />
    </Suspense>
  );
}
