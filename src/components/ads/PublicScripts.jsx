'use client';
// src/components/ads/PublicScripts.jsx
// Loads GA4 analytics with interaction/idle deferral so it never blocks FCP, LCP, or TBT.
// All third-party popunder/push ad networks have been permanently removed.
import { useEffect } from 'react';

export default function PublicScripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) return;

    let loaded = false;
    const loadGA4 = () => {
      if (loaded || window.__ga4_loaded) return;
      loaded = true;
      window.__ga4_loaded = true;

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-CJ0JDFHPV3', { send_page_view: true });

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-CJ0JDFHPV3';
      document.head.appendChild(script);
    };

    const cleanupEvents = () => {
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('click', onInteract);
    };

    const onInteract = () => {
      cleanupEvents();
      loadGA4();
    };

    window.addEventListener('scroll', onInteract, { passive: true, once: true });
    window.addEventListener('touchstart', onInteract, { passive: true, once: true });
    window.addEventListener('click', onInteract, { passive: true, once: true });

    const timer = setTimeout(() => {
      cleanupEvents();
      loadGA4();
    }, 3500);

    return () => {
      cleanupEvents();
      clearTimeout(timer);
    };
  }, []);

  return null;
}