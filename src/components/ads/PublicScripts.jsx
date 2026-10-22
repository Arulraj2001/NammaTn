'use client';
// src/components/ads/PublicScripts.jsx
// Standard Google Analytics 4 integration for Next.js App Router.
// Fires immediately after interactive (non-blocking) and tracks all SPA route transitions.
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = 'G-CJ0JDFHPV3';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) return;

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

function AdSenseLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('VizhiTN_adsense_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.enabled && parsed?.pub_id) {
          window.__ADSENSE_PUB_ID__ = parsed.pub_id;
          window.__ADSENSE_SLOTS__ = {
            banner: parsed.slot_banner || '',
            sidebar: parsed.slot_sidebar || '',
            infeed: parsed.slot_infeed || '',
          };

          // Inject meta tag if missing in head
          let meta = document.querySelector('meta[name="google-adsense-account"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'google-adsense-account';
            meta.content = parsed.pub_id;
            document.head.appendChild(meta);
          }

          // Inject script tag if missing in head
          let script = document.querySelector(`script[src*="adsbygoogle.js"]`);
          if (!script) {
            script = document.createElement('script');
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${parsed.pub_id}`;
            document.head.appendChild(script);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return null;
}

export default function PublicScripts() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <Suspense fallback={null}>
        <AdSenseLoader />
      </Suspense>
    </>
  );
}