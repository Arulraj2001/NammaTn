"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminSettings = nextDynamic(() => import('@/views/admin/AdminSettings'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminSettings />
    </Suspense>
  );
}
