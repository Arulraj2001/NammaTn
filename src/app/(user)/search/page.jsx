"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const Search = nextDynamic(() => import('@/views/Search'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Search />
    </Suspense>
  );
}
