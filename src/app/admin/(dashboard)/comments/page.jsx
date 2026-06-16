"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminComments = nextDynamic(() => import('@/views/admin/AdminComments'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminComments />
    </Suspense>
  );
}
