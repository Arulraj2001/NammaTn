"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const MyDashboard = nextDynamic(() => import('@/views/MyDashboard'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MyDashboard />
    </Suspense>
  );
}
