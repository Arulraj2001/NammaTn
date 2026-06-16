"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminAds = nextDynamic(() => import('@/views/admin/AdminAds'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminAds />
    </Suspense>
  );
}
