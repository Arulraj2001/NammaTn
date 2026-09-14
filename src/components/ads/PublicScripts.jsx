// src/components/ads/PublicScripts.jsx
// Loads GA4 + ad-network scripts ONLY on public pages. These are deliberately
// excluded on /admin and private/account routes so the popunder/push-ad worker
// can't hijack admin sidebar clicks.
// Popunder scripts are injected 30s AFTER page load (never immediately) — this
// is required for Google News approval.
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

const POPUNDER_SCRIPT =
  'https://pl31335206.profitableratecpmnetwork.com/2c/ab/c7/2cabc7da32aa062bc06eae481ad5feae.js';
const QUGE5_SCRIPT = 'https://quge5.com/88/tag.min.js';
const POPUNDER_DELAY_MS = 30000; // 30 seconds

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

  // Inject popunder scripts 30s after load. Runs only when NOT admin/private.
  useEffect(() => {
    if (isAdminOrPrivate) return;

    const timer = setTimeout(() => {
      const head = document.head;

      // PropellerAds popunder
      const propeller = document.createElement('script');
      propeller.src = POPUNDER_SCRIPT;
      propeller.async = true;
      head.appendChild(propeller);

      // quge5 popunder — same delayed behaviour
      const quge5 = document.createElement('script');
      quge5.src = QUGE5_SCRIPT;
      quge5.setAttribute('data-zone', '280416');
      quge5.setAttribute('data-cfasync', 'false');
      quge5.async = true;
      head.appendChild(quge5);
    }, POPUNDER_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isAdminOrPrivate]);

  if (isAdminOrPrivate) return null;

  return (
    <>
      {/* GA4 — analytics (not a popunder); keep afterInteractive so it's not delayed */}
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
    </>
  );
}