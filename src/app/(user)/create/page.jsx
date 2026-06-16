"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const CreatePost = nextDynamic(() => import('@/views/CreatePost'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreatePost />
    </Suspense>
  );
}
