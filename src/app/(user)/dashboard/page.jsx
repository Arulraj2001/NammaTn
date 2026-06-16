"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Dashboard = nextDynamic(() => import('@/views/Dashboard'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
