"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminDashboard = nextDynamic(() => import('@/views/admin/AdminDashboard'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  );
}
