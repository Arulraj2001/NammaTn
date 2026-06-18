'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

/**
 * CookieConsent — GDPR + India DPDP compliant cookie consent banner.
 *
 * Behaviour:
 *  - Shown at bottom of viewport on first visit (no prior choice in localStorage)
 *  - "Accept All"          → stores 'accepted', reloads to initialise AdSense
 *  - "Reject Non-Essential"→ stores 'rejected', hides banner, no AdSense cookies
 *  - Once any choice is made the banner never re-appears
 *
 * Design:
 *  - Fixed bottom bar; full-width pill on mobile, floating card (max-w-2xl) on md+
 *  - White/dark background, rounded-2xl, subtle shadow
 *  - Slides up from below with CSS transition
 *  - z-[100] so it clears all other UI layers
 */
export default function CookieConsent() {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Helper: bilingual text
  const T = (en, ta) => (language === 'ta' ? ta : en);

  useEffect(() => {
    setMounted(true);
    try {
      const choice = localStorage.getItem('nammatn_cookie_consent');
      if (!choice) {
        // Slight delay so the slide-in transition is visible
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage blocked (private mode, etc.) — show banner to be safe
      setTimeout(() => setVisible(true), 600);
    }
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem('nammatn_cookie_consent', 'accepted'); } catch {}
    setVisible(false);
    // Reload after transition to initialise AdSense with consent
    setTimeout(() => window.location.reload(), 400);
  };

  const handleReject = () => {
    try { localStorage.setItem('nammatn_cookie_consent', 'rejected'); } catch {}
    setVisible(false);
  };

  // Don't render on server or after a choice has been recorded
  if (!mounted) return null;

  return (
    <div
      aria-live="polite"
      aria-label={T('Cookie consent banner', 'குக்கீ சம்மத பேனர்')}
      className={`
        fixed bottom-0 inset-x-0 z-[100] flex justify-center px-4 pb-4 md:pb-6
        pointer-events-none
      `}
    >
      <div
        role="dialog"
        aria-modal="false"
        className={`
          pointer-events-auto
          w-full max-w-2xl
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40
          px-5 py-5 md:px-7 md:py-6
          transition-transform duration-500 ease-out will-change-transform
          ${visible ? 'translate-y-0' : 'translate-y-[calc(100%+2rem)]'}
        `}
      >
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none select-none" aria-hidden="true">🍪</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 leading-snug">
              {T('We use cookies', 'நாங்கள் குக்கீகளை பயன்படுத்துகிறோம்')}
            </h2>
          </div>
        </div>

        {/* Body */}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {T(
            'NammaTN uses cookies for essential functionality, analytics, and personalised ads (Google AdSense). By clicking \u2018Accept All\u2019, you consent to our use of cookies as described in our ',
            'NammaTN அத்தியாவசிய செயல்பாடுகள், பகுப்பாய்வு மற்றும் தனிப்பயனாக்கப்பட்ட விளம்பரங்களுக்கு (Google AdSense) குக்கீகளைப் பயன்படுத்துகிறது. \u2018அனைத்தையும் ஏற்கவும்\u2019 என்பதைக் கிளிக் செய்வதன் மூலம், எங்கள் ',
          )}
          <Link
            href="/privacy-policy"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {T('Privacy Policy', 'தனியுரிமைக் கொள்கை')}
          </Link>
          {T(
            '\u2019.',
            ' இல் விவரிக்கப்பட்டுள்ளபடி குக்கீகளை பயன்படுத்த ஒப்புக்கொள்கிறீர்கள்.',
          )}
        </p>

        {/* Action row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Accept All */}
          <button
            onClick={handleAccept}
            className="
              flex-1 sm:flex-none
              inline-flex items-center justify-center
              px-5 py-2.5
              bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
              text-white text-sm font-semibold
              rounded-xl
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
              flex-1 sm:flex-none
              inline-flex items-center justify-center
              px-5 py-2.5
              bg-transparent border border-slate-300 dark:border-slate-600
              text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800
              text-sm font-medium
              rounded-xl
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
            "
          >
            {T('Reject Non-Essential', 'அத்தியாவசியமற்றவற்றை நிராகரிக்கவும்')}
          </button>
        </div>

        {/* India DPDP compliance note */}
        <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
          {T(
            'Compliant with GDPR and India\u2019s Digital Personal Data Protection Act 2023 (DPDP).',
            'GDPR மற்றும் இந்தியாவின் டிஜிட்டல் தனிப்பட்ட தரவு பாதுகாப்பு சட்டம் 2023 (DPDP) இன் படி இணக்கமானது.',
          )}
        </p>
      </div>
    </div>
  );
}
