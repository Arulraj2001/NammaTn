"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { OutletProvider } from '@/lib/router-compat';
import { useTheme } from '../providers';

export default function UserLayout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <OutletProvider value={children}>
      <Layout theme={theme} toggleTheme={toggleTheme} />
    </OutletProvider>
  );
}
