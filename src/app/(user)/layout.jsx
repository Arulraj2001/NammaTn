import React from 'react';
import Layout from '@/components/layout/Layout';
import { OutletProvider } from '@/lib/router-compat';

export default function UserLayout({ children }) {
  return (
    <OutletProvider value={children}>
      <Layout />
    </OutletProvider>
  );
}
