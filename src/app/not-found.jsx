// src/app/not-found.jsx
// App Router global 404 page. Rendered (HTTP 404) whenever notFound() is
// called or no route matches. Mirrors the site's header/footer style.

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* ── Header (matches site Navbar branding) ─────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-base tracking-tighter">TN</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight block">VizhiTN</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">
                Tamil Nadu Civic Platform
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* ── 404 content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-md text-3xl">
          404
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          This page doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
        >
          ← Back to Homepage
        </Link>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">TN</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">VizhiTN</span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Tamil Nadu civic reporting, community alerts, and public-interest information.
          </p>
        </div>
      </footer>
    </div>
  );
}