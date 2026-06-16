"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminStay = nextDynamic(() => import('@/views/admin/AdminStay'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminStay />
    </Suspense>
  );
}
