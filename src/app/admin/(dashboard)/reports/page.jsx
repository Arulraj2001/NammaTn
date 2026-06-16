"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminReports = nextDynamic(() => import('@/views/admin/AdminReports'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminReports />
    </Suspense>
  );
}
