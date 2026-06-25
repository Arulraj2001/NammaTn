'use client';
import React, { useEffect, useRef, useState } from 'react';

/**
 * AdSidebar — Google AdSense 300×250 rectangle unit
 * Slot: Rectangle / sidebar
 * Shows labeled placeholder in dev or when consent is not given
 * Publisher ID comes from window.__ADSENSE_PUB_ID__ set by AdminMonetization
 */
export default function AdSidebar({ className = '', slot = '' }) {
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
    return (
      <div
        className={`w-full max-w-[300px] h-[250px] bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 ${className}`}
      >
        <span>Advertisement</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden max-w-[300px] ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '300px', height: '250px' }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format="rectangle"
        data-full-width-responsive="false"
      />
    </div>
  );
}
