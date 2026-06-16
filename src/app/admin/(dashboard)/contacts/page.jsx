"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminContacts = nextDynamic(() => import('@/views/admin/AdminContacts'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminContacts />
    </Suspense>
  );
}
