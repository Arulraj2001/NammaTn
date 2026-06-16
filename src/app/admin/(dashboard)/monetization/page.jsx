"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminMonetization = nextDynamic(() => import('@/views/admin/AdminMonetization'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminMonetization />
    </Suspense>
  );
}
