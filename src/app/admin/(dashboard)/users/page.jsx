"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminUsers = nextDynamic(() => import('@/views/admin/AdminUsers'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminUsers />
    </Suspense>
  );
}
