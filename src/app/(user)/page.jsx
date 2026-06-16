"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Home = nextDynamic(() => import('@/views/Home'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
