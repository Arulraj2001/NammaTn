"use client";

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { OutletProvider } from '@/lib/router-compat';

export default function NextAdminLayout({ children }) {
  return (
    <OutletProvider value={children}>
      <AdminLayout />
    </OutletProvider>
  );
}
