import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

export default function Layout({ theme, toggleTheme }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Suspense fallback={null}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
      </Suspense>
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}