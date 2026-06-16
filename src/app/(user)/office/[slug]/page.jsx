"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const OfficeDetail = nextDynamic(() => import('@/views/OfficeDetail'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OfficeDetail />
    </Suspense>
  );
}
