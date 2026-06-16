"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const CivicLeaderboard = nextDynamic(() => import('@/views/CivicLeaderboard'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CivicLeaderboard />
    </Suspense>
  );
}
