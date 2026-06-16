"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Contact = nextDynamic(() => import('@/views/Contact'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Contact />
    </Suspense>
  );
}
