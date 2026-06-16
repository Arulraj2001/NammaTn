"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminCivicReceipts = nextDynamic(() => import('@/views/admin/AdminCivicReceipts'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminCivicReceipts />
    </Suspense>
  );
}
