"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import AuthModal from '@/components/auth/AuthModal';
import ErrorBoundary from '@/lib/errorBoundary';
import OfflineBanner from '@/components/common/OfflineBanner';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function Providers({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read stored theme to sync state with the inline script that already applied the class
    const stored = localStorage.getItem('tn_theme') || 'light';
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Inline script already applied class on initial load.
    // Only update class on user-triggered theme change.
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('tn_theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <LanguageProvider>
            <AuthModalProvider>
              <ThemeContext.Provider value={{ theme, toggleTheme }}>
                <OfflineBanner />
                {children}
                <AuthModal />
                <Toaster />
              </ThemeContext.Provider>
            </AuthModalProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
