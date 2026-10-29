'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { COOKIE_CONSENT_KEY, COOKIE_PREFERENCES_EVENT } from '@/lib/cookieConsent';

/**
 * CookieConsent — privacy consent controls for optional analytics and advertising.
 *
 * Behaviour:
 *  - Shown at bottom of viewport on first visit (no prior choice in localStorage)
 *  - "Accept All"          → stores 'accepted', reloads to initialise AdSense
 *  - "Reject Non-Essential"→ stores 'rejected', hides banner, no AdSense cookies
 *  - Once any choice is made the banner never re-appears
 *
 * Design:
 *  - Compact bottom card capped at half the mobile viewport
 *  - Equal-weight accept and reject controls
 *  - Slides up from below with CSS transition
 *  - z-[100] so it clears all other UI layers
 */
export default function CookieConsent() {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const acceptRef = useRef(null);
  const dialogRef = useRef(null);

  // Helper: bilingual text
  const T = (en, ta) => (lang === 'ta' ? ta : en);

  useEffect(() => {
    setMounted(true);
    try {
      const choice = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!choice) {
        // Schedule after mount so the compact slide-in transition remains visible.
        const timer = setTimeout(() => setVisible(true), 0);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage blocked (private mode, etc.) — show banner to be safe
      setTimeout(() => setVisible(true), 0);
    }
  }, []);

  useEffect(() => {
    const openPreferences = () => setVisible(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  // Auto-focus Accept button when banner becomes visible
  useEffect(() => {
    if (visible && acceptRef.current) {
      acceptRef.current.focus();
    }
  }, [visible]);

  // Trap Tab within the dialog
  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll('button, a[href]');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted'); } catch {}
    setVisible(false);
    // Reload after transition to initialise AdSense with consent
    setTimeout(() => window.location.reload(), 400);
  };

  const handleReject = () => {
    try { localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected'); } catch {}
    setVisible(false);
  };

  // Don't render on server or after a choice has been recorded
  if (!mounted) return null;

  return (
    <div
      aria-live="polite"
      aria-label={T('Cookie consent banner', 'குக்கீ சம்மத பேனர்')}
      className={`
        fixed bottom-16 sm:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-[90]
        pointer-events-none flex justify-start
      `}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-heading"
        aria-describedby="cookie-desc"
        onKeyDown={handleKeyDown}
        className={`
          pointer-events-auto
          w-full sm:w-[330px] max-h-[50dvh]
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
          border border-slate-200/90 dark:border-slate-700/80
          rounded-2xl shadow-xl shadow-slate-900/15 dark:shadow-black/50
          p-3 sm:p-3.5
          transition-all duration-300 ease-out will-change-transform
          ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95 pointer-events-none'}
        `}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base select-none" aria-hidden="true">🍪</span>
            <h2 id="cookie-heading" className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {T('Cookie Notice', 'குக்கீ கொள்கை')}
            </h2>
          </div>
          <button
            onClick={handleReject}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-xs leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <p id="cookie-desc" className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-2.5">
          {T(
            'We use cookies for analytics and ads. ',
            'சிறந்த அனுபவத்திற்கு குக்கீகளைப் பயன்படுத்துகிறோம். '
          )}
          <Link
            href="/cookie-policy"
            className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 font-medium"
          >
            {T('Learn more', 'விவரங்கள்')}
          </Link>
        </p>

        {/* Action row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Accept All */}
          <button
            ref={acceptRef}
            onClick={handleAccept}
            className="
              py-1.5 px-3
              bg-blue-600 hover:bg-blue-700 active:scale-95
              text-white text-xs font-bold
              rounded-xl shadow-xs transition-all text-center
            "
          >
            {T('Accept', 'ஏற்கவும்')}
          </button>

          {/* Reject Non-Essential */}
          <button
            onClick={handleReject}
            className="
              py-1.5 px-3
              bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95
              text-slate-700 dark:text-slate-300 text-xs font-semibold
              rounded-xl transition-all text-center
            "
          >
            {T('Decline', 'நிராகரி')}
          </button>
        </div>
      </div>
    </div>
  );
}
