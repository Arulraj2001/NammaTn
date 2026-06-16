"use client";
import React, { Suspense } from 'react';
import nextDynamic from 'next/dynamic';

const AdminCategories = nextDynamic(() => import('@/views/admin/AdminCategories'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] w-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
      <AdminCategories />
    </Suspense>
  );
}
