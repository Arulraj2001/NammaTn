'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled route error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-2xl font-bold mb-4">
        ⚠️
      </div>
      <h2 className="text-2xl font-extrabold mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
        An unexpected error occurred while loading this page. Please try refreshing or click below to retry.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          🔄 Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl transition-all"
        >
          🏠 Go to Homepage
        </Link>
      </div>
    </div>
  );
}
