// src/components/ads/PublicScripts.jsx
// Loads GA4 + ad-network (PropellerAds/popunder) scripts ONLY on public pages.
// These are deliberately excluded on /admin and private/account routes so the
// popunder/push-ad service worker can't hijack admin sidebar clicks.
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const PRIVATE_PREFIXES = [
  '/admin',
  '/dashboard',
  '/me',
  '/bookmarks',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export default function PublicScripts() {
  const pathname = usePathname();

  const isAdminOrPrivate = PRIVATE_PREFIXES.some((p) => pathname?.startsWith(p));

  // Register the ad push/popunder service worker only on public pages (never /admin).
  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [pathname]);

  if (isAdminOrPrivate) return null;

  return (
    <>
      {/* GA4 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CJ0JDFHPV3"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CJ0JDFHPV3');
        `}
      </Script>

      {/* PropellerAds Popunder */}
      <Script
        src="https://pl31335206.profitableratecpmnetwork.com/2c/ab/c7/2cabc7da32aa062bc06eae481ad5feae.js"
        strategy="afterInteractive"
      />
    </>
  );
}