// src/components/ads/DirectLink.jsx
// Direct-link / sponsored ad (referral URL). Public-only — excluded on admin/dashboard.
'use client';
import { usePathname } from 'next/navigation';

export default function DirectLink() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      <a
        href="https://omg10.com/4/11798861"
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <span className="tracking-wide">Sponsored</span>
      </a>
    </div>
  );
}