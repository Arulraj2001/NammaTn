'use client';
import React, { useEffect, useRef, useState } from 'react';

/**
 * AdBanner — Google AdSense horizontal banner
 * Slot: Responsive / horizontal
 * Shows skeleton in dev, real ad in production
 * Publisher ID comes from window.__ADSENSE_PUB_ID__ set by AdminMonetization
 */
export default function AdBanner({ className = '', slot = '' }) {
  const adRef = useRef(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // Check cookie consent
    try { setConsent(localStorage.getItem('VizhiTN_cookie_consent') === 'accepted'); } catch {}
  }, []);

  useEffect(() => {
    if (!consent) return;
    const pubId = window.__ADSENSE_PUB_ID__;
    if (!pubId || pubId === 'ca-pub-PLACEHOLDER') return;
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) { console.warn('AdSense error', e); }
  }, [consent]);

  const pubId = typeof window !== 'undefined' ? window.__ADSENSE_PUB_ID__ : null;
  const isProd = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

  if (!consent || !pubId || pubId === 'ca-pub-PLACEHOLDER' || !slot || !isProd) {
    // Show labeled placeholder in dev/no-consent
    return (
      <div
        className={`w-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 py-3 ${className}`}
      >
        <span>Advertisement</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
