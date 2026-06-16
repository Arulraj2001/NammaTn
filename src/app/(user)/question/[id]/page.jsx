"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const QuestionDetail = nextDynamic(() => import('@/views/QuestionDetail'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <QuestionDetail />
    </Suspense>
  );
}
