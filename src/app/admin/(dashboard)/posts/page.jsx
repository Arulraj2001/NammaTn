"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminPosts = nextDynamic(() => import('@/views/admin/AdminPosts'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminPosts />
    </Suspense>
  );
}
