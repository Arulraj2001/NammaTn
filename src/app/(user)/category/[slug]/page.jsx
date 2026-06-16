"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const CategoryDetail = nextDynamic(() => import('@/views/CategoryDetail'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CategoryDetail />
    </Suspense>
  );
}
