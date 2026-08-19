'use client';

import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white font-sans">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl font-bold mb-4 border border-red-500/40">
          ⚠️
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Application Error</h1>
        <p className="text-slate-300 text-sm max-w-md mb-6">
          A critical system error occurred. Click below to reload the application.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          🔄 Reload Application
        </button>
      </body>
    </html>
  );
}
