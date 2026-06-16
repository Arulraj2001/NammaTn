"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const PostDetail = nextDynamic(() => import('@/views/PostDetail'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PostDetail />
    </Suspense>
  );
}
