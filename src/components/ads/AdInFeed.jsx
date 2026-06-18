'use client';
import React, { useEffect, useRef, useState } from 'react';

/**
 * AdInFeed — Google AdSense native in-feed ad
 * Styled like a post card; renders "Sponsored" badge in top-right.
 * Returns null when no consent or pubId — does not disrupt the feed layout.
 * Publisher ID comes from window.__ADSENSE_PUB_ID__ set by AdminMonetization
 */
export default function AdInFeed({ className = '', slot = '' }) {
  const adRef = useRef(null);
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nammatn_cookie_consent') === 'accepted';
      setConsent(stored);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!consent) return;
    const pubId = window.__ADSENSE_PUB_ID__;
    if (!pubId || pubId === 'ca-pub-PLACEHOLDER') return;
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) { console.warn('AdSense in-feed error', e); }
  }, [consent]);

  if (!ready) return null;

  const pubId = typeof window !== 'undefined' ? window.__ADSENSE_PUB_ID__ : null;
  const isProd = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

  // Silently return null — don't disrupt feed
  if (!consent || !pubId || pubId === 'ca-pub-PLACEHOLDER' || !slot || !isProd) {
    return null;
  }

  return (
    <div
      className={`relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${className}`}
    >
      {/* Sponsored badge */}
      <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full select-none">
        Sponsored
      </span>

      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout="in-article"
        data-full-width-responsive="true"
      />
    </div>
  );
}
