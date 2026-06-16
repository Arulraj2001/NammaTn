"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminLogin = nextDynamic(() => import('@/views/admin/AdminLogin'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminLogin />
    </Suspense>
  );
}
