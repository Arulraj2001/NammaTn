import { COOKIE_CONSENT_KEY } from './cookieConsent.js';

const PRIVATE_ROUTE_PREFIXES = [
  '/admin',
  '/dashboard',
  '/me',
  '/bookmarks',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function getClarityInitScript(projectId) {
  return `(function(){try{var consent=localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_KEY)});var path=location.pathname;var privateRoutes=${JSON.stringify(PRIVATE_ROUTE_PREFIXES)};var privateRoute=privateRoutes.some(function(prefix){return path===prefix||path.indexOf(prefix+'/')===0;});if(consent!=='accepted'||privateRoute)return;(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(projectId)});}catch(e){}})();`;
}
