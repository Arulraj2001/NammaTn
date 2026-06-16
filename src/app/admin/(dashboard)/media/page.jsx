"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminMedia = nextDynamic(() => import('@/views/admin/AdminMedia'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminMedia />
    </Suspense>
  );
}
