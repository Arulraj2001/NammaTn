"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminModeration = nextDynamic(() => import('@/views/admin/AdminModeration'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminModeration />
    </Suspense>
  );
}
