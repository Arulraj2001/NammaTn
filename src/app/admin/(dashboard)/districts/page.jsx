"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminDistricts = nextDynamic(() => import('@/views/admin/AdminDistricts'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminDistricts />
    </Suspense>
  );
}
