"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminCategories = nextDynamic(() => import('@/views/admin/AdminCategories'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminCategories />
    </Suspense>
  );
}
