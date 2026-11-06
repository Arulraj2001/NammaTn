'use client';
// src/components/ads/PublicScripts.jsx
// Google Analytics 4 — Consent Mode v2 compliant tracking and key civic events.
// AdSense script injection is handled server-side by layout.jsx — NOT duplicated here.
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { COOKIE_CONSENT_KEY } from '@/lib/cookieConsent';

const GA_MEASUREMENT_ID = 'G-CJ0JDFHPV3';

/**
 * AnalyticsTracker — sends GA4 page_view events on SPA route changes and captures key events.
 */
function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) return;

    let consentChoice = 'unknown';
    try {
      consentChoice = localStorage.getItem(COOKIE_CONSENT_KEY) || 'unknown';
    } catch {
      consentChoice = 'unknown';
    }

    // If citizen explicitly rejected cookies, do not track
    if (consentChoice === 'rejected') return;

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  // Global Key Event Delegation (Official Source Clicks, Helpline Calls, Shares)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (!link || !window.gtag) return;

      const href = link.getAttribute('href') || '';

      // 1. Helpline Call Clicks (1912, 1913, 1077, 1930, 1100, etc.)
      if (href.startsWith('tel:')) {
        const number = href.replace('tel:', '').trim();
        window.gtag('event', 'helpline_call_click', {
          event_category: 'engagement',
          helpline_number: number,
          page_location: window.location.href,
        });
      }

      // 2. Official Govt Source Verification Clicks
      if (href.includes('.gov.in') || href.includes('.tn.gov.in') || href.includes('tangedco.org')) {
        window.gtag('event', 'official_source_click', {
          event_category: 'trust',
          destination_url: href,
          page_location: window.location.href,
        });
      }

      // 3. Social / WhatsApp Shares
      if (href.includes('api.whatsapp.com/send') || href.includes('wa.me')) {
        window.gtag('event', 'content_share', {
          event_category: 'engagement',
          method: 'whatsapp',
          page_location: window.location.href,
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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

          // 1. Regional Default: EEA, UK & Switzerland (Strict Opt-in for Analytics & Ads)
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'region': ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH']
          });

          // 2. Global Default: Rest of World / India (Performance telemetry granted, Ads denied)
          gtag('consent', 'default', {
            'analytics_storage': 'granted',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });

          // 3. Immediately apply prior citizen consent choice if stored in localStorage
          try {
            var saved = localStorage.getItem('${COOKIE_CONSENT_KEY}');
            if (saved === 'accepted') {
              gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
              });
            } else if (saved === 'rejected') {
              gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
              });
            }
          } catch(e) {}

          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: true,
            anonymize_ip: true
          });
        `}
      </Script>

      {/* SPA route tracker & Key Event listener */}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}