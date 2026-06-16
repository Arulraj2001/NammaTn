"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Areas = nextDynamic(() => import('@/views/Areas'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Areas />
    </Suspense>
  );
}
