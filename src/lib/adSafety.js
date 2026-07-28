import { COOKIE_CONSENT_KEY } from './cookieConsent.js';

export const AD_BLOCKED_PATH_PREFIXES = [
  '/admin',
  '/dashboard',
  '/me',
  '/bookmarks',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/create',
  '/search',
  '/contact',
  '/ask',
  '/situations',
  '/community',
  '/post',
  '/question',
  '/help',
  '/scams',
  '/bribes',
  '/support',
];

export function isAdEligiblePath(pathname = '/') {
  const path = pathname || '/';
  return !AD_BLOCKED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function hasAdvertisingConsent(storage) {
  try {
    return storage?.getItem(COOKIE_CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function canLoadAdvertising(pathname, storage) {
  return isAdEligiblePath(pathname) && hasAdvertisingConsent(storage);
}

export function getAdSenseInitScript() {
  return `(function(){try{var path=location.pathname;var blocked=${JSON.stringify(AD_BLOCKED_PATH_PREFIXES)};var blockedRoute=blocked.some(function(prefix){return path===prefix||path.indexOf(prefix+'/')===0;});var consent=localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_KEY)});if(consent!=='accepted'||blockedRoute)return;var pubId=window.__ADSENSE_PUB_ID__;if(!pubId||pubId==='ca-pub-PLACEHOLDER'||document.getElementById('adsense-script'))return;var s=document.createElement('script');s.id='adsense-script';s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(pubId);document.head.appendChild(s);}catch(e){}})();`;
}
