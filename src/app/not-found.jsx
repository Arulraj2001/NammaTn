import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="text-6xl font-black text-amber-500 mb-2">404</div>
      <h2 className="text-2xl font-extrabold mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
      >
        🏠 Back to Home
      </Link>
    </div>
  );
}
