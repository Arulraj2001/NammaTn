"use client";

import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import CookieConsent from "@/components/common/CookieConsent";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Suspense fallback={<div className="h-16 w-full bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <Suspense fallback={
          <div className="min-h-[60vh] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-[320px] w-full bg-slate-900" />}>
        <Footer />
      </Suspense>
      <Suspense fallback={<div className="h-14 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 md:hidden" />}>
        <MobileNav />
      </Suspense>
      {/* Cookie consent — GDPR/India DPDP compliant, required for AdSense */}
      <CookieConsent />
    </div>
  );
}