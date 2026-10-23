'use client';
// src/components/ads/PublicScripts.jsx
// Google Analytics 4 — fires page_view ONLY after cookie consent is accepted.
// AdSense script injection is handled server-side by layout.jsx — NOT duplicated here.
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { COOKIE_CONSENT_KEY } from '@/lib/cookieConsent';

const GA_MEASUREMENT_ID = 'G-CJ0JDFHPV3';

/**
 * AnalyticsTracker — sends GA4 page_view events on SPA route changes.
 * Consent-gated: only fires when the user has explicitly accepted analytics cookies.
 */
function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) return;

    // ── CONSENT GATE ──
    // Only send analytics events if the user accepted optional cookies.
    let consentChoice = 'unknown';
    try {
      consentChoice = localStorage.getItem(COOKIE_CONSENT_KEY) || 'unknown';
    } catch {
      // localStorage blocked (private mode). Do not fire analytics.
      return;
    }
    if (consentChoice !== 'accepted') return;

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

export default function PublicScripts() {
  return (
    <>
      {/* GA4 loader — script is non-blocking (afterInteractive) */}
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
            send_page_view: false,
            anonymize_ip: true
          });
        `}
      </Script>

      {/* SPA route tracker — consent-gated inside AnalyticsTracker */}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/*
        AdSense script is injected server-side by layout.jsx via the
        `adsensePubId` site setting. Removed AdSenseLoader from here
        to prevent duplicate <script src="adsbygoogle.js"> injection
        which violates AdSense publisher policies.
      */}
    </>
  );
}