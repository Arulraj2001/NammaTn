"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Situations = nextDynamic(() => import('@/views/Situations'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Situations />
    </Suspense>
  );
}
