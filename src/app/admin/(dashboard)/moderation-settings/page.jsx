"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminModerationSettings = nextDynamic(() => import('@/views/admin/AdminModerationSettings'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminModerationSettings />
    </Suspense>
  );
}
