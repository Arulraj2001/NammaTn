export const COOKIE_CONSENT_KEY = 'VizhiTN_cookie_consent';
export const COOKIE_PREFERENCES_EVENT = 'vizhitn:open-cookie-preferences';

export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT));
  }
}
