"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const DistrictDetail = nextDynamic(() => import('@/views/DistrictDetail'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DistrictDetail />
    </Suspense>
  );
}
