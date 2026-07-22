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
        fixed bottom-0 inset-x-0 z-[100] flex justify-center px-3 pb-3 md:pb-5
        pointer-events-none
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
          w-full max-w-xl max-h-[50dvh] overflow-y-auto
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/40
          px-4 py-3.5 md:px-5 md:py-4
          transition-transform duration-200 ease-out will-change-transform
          ${visible ? 'translate-y-0' : 'translate-y-[calc(100%+1.5rem)]'}
        `}
      >
        {/* Header row */}
        <div className="flex items-start gap-2 mb-1.5">
          <span className="text-lg leading-none select-none" aria-hidden="true">🍪</span>
          <div className="flex-1 min-w-0">
            <h2 id="cookie-heading" className="text-base font-semibold text-slate-900 dark:text-slate-50 leading-snug">
              {T('We use cookies', 'நாங்கள் குக்கீகளை பயன்படுத்துகிறோம்')}
            </h2>
          </div>
        </div>

        {/* Body */}
        <p id="cookie-desc" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-snug mb-3">
          {T(
            'VizhiTN uses optional analytics and advertising cookies. Accept them or continue without non-essential cookies. See our ',
            'VizhiTN விருப்ப பகுப்பாய்வு மற்றும் விளம்பர குக்கீகளைப் பயன்படுத்துகிறது. அவற்றை ஏற்கலாம் அல்லது அவை இல்லாமல் தொடரலாம். எங்கள் ',
          )}
          <Link
            href="/privacy-policy"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {T('Privacy Policy', 'தனியுரிமைக் கொள்கை')}
          </Link>
          {T(
            '.',
            ' பார்க்கவும்.',
          )}
        </p>

        {/* Action row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Accept All */}
          <button
            ref={acceptRef}
            onClick={handleAccept}
            className="
              inline-flex items-center justify-center
              min-h-11 px-3 py-2
              bg-white dark:bg-slate-900 border border-indigo-500
              text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40
              text-xs sm:text-sm font-semibold leading-tight
              rounded-lg
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
            "
          >
            {T('Accept All', 'அனைத்தையும் ஏற்கவும்')}
          </button>

          {/* Reject Non-Essential */}
          <button
            onClick={handleReject}
            className="
              inline-flex items-center justify-center
              min-h-11 px-3 py-2
              bg-white dark:bg-slate-900 border border-indigo-500
              text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40
              text-xs sm:text-sm font-semibold leading-tight
              rounded-lg
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
            "
          >
            {T('Reject Non-Essential', 'அத்தியாவசியமற்றவற்றை நிராகரிக்கவும்')}
          </button>
        </div>
      </div>
    </div>
  );
}
