"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminPhase8 = nextDynamic(() => import('@/views/admin/AdminPhase8'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminPhase8 />
    </Suspense>
  );
}
