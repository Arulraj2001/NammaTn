"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminCommunity = nextDynamic(() => import('@/views/admin/AdminCommunity'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminCommunity />
    </Suspense>
  );
}
