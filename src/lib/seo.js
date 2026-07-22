/**
 * SEO utilities — dynamic meta tag management, structured data (JSON-LD).
 * All helpers are idempotent: safe to call on every page mount.
 */

import { getSocialTitle } from './metadataTitle';

const SITE_URL = 'https://www.vizhitn.in';

const DEFAULT = {
  title: 'VizhiTN – Tamil Nadu Civic & Community Platform',
  description:
    "VizhiTN is Tamil Nadu's public civic platform — report local issues, track resolutions, join live community discussions, access government schemes, and celebrate community wins.",
  image: `${SITE_URL}/og-image.png`,
  url: typeof window !== 'undefined' ? window.location.origin : SITE_URL,
  siteName: 'VizhiTN',
  locale: 'en_IN',
};

// ── Internal helpers ─────────────────────────────────────────────────────────

function setMeta(property, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href, extra = {}) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
}

function injectScript(id, schema) {
  removeStructuredData(id);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.text = JSON.stringify(schema, null, 0);
  document.head.appendChild(script);
}

function removeStructuredData(id) {
  document.getElementById(id)?.remove();
}

// ── Primary setPageMeta ──────────────────────────────────────────────────────

/**
 * Set all page-level SEO metadata.
 * Call on every route/page mount.
 */
export function setPageMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  canonical,
  noindex = false,
} = {}) {
  const t   = title ? getSocialTitle(title) : DEFAULT.title;
  const d   = description || DEFAULT.description;
  const img = image       || DEFAULT.image;
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : DEFAULT.url;
  const u   = url || currentUrl;
  const canon = canonical || u;

  // Title
  document.title = t;

  // Standard
  setMeta('description', d);
  setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMeta('author', 'VizhiTN');
  setMeta('theme-color', '#4f46e5');

  // Open Graph
  setMeta('og:type',        type,           'property');
  setMeta('og:title',       t,              'property');
  setMeta('og:description', d,              'property');
  setMeta('og:image',       img,            'property');
  setMeta('og:image:width', '1200',         'property');
  setMeta('og:image:height','630',          'property');
  setMeta('og:url',         u,              'property');
  setMeta('og:site_name',   DEFAULT.siteName,'property');
  setMeta('og:locale',      DEFAULT.locale, 'property');

  // Twitter
  setMeta('twitter:card',        'summary_large_image');
  setMeta('twitter:site',        '@VizhiTN');
  setMeta('twitter:creator',     '@VizhiTN');
  setMeta('twitter:title',       t);
  setMeta('twitter:description', d);
  setMeta('twitter:image',       img);

  // Canonical
  setLink('canonical', canon);
}

// ── Structured Data Helpers ──────────────────────────────────────────────────

/**
 * NewsArticle / post detail page structured data.
 */
export function injectPostStructuredData(post) {
  if (!post) return;
  injectScript(`tn-ld-post-${post.id}`, {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title_en || post.title,
    description: (post.content_en || post.content || '').substring(0, 200),
    datePublished: post.created_date,
    dateModified: post.updated_date || post.created_date,
    image: post.media_urls?.[0] || DEFAULT.image,
    url: `${SITE_URL}/post/${post.id}`,
    author: {
      '@type': post.is_anonymous ? 'Organization' : 'Person',
      name: post.is_anonymous ? 'Anonymous Citizen' : (post.author_name || 'VizhiTN Community'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'VizhiTN',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/post/${post.id}` },
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    keywords: [post.category, post.district_name, post.area_name, 'Tamil Nadu civic'].filter(Boolean).join(', '),
  });
}

/**
 * FAQPage structured data — appears as expandable FAQs in Google results.
 * @param {Array<{question: string, answer: string}>} faqs
 */
export function injectFAQStructuredData(faqs) {
  if (!faqs?.length) return;
  injectScript('tn-ld-faq', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  });
}

/**
 * BreadcrumbList structured data.
 * @param {Array<{name: string, url: string}>} items
 */
export function injectBreadcrumbStructuredData(items) {
  if (!items?.length) return;
  injectScript('tn-ld-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  });
}

/**
 * LocalGovernment / district structured data.
 */
export function injectDistrictStructuredData(district) {
  if (!district) return;
  injectScript(`tn-ld-district-${district.slug}`, {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: district.name_en || district.name,
    description: district.description_en || `Civic issues and community discussions for ${district.name_en}, Tamil Nadu.`,
    url: `${SITE_URL}/${district.slug}/`,
    containedInPlace: {
      '@type': 'State',
      name: 'Tamil Nadu',
      containedInPlace: { '@type': 'Country', name: 'India' },
    },
  });
}

/**
 * GovernmentService structured data for awareness/scheme pages.
 */
export function injectSchemeStructuredData(scheme) {
  if (!scheme) return;
  injectScript(`tn-ld-scheme-${scheme.id}`, {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: scheme.name_en || scheme.name,
    description: scheme.description_en || scheme.description,
    provider: {
      '@type': 'GovernmentOrganization',
      name: scheme.department_en || 'Government of Tamil Nadu',
    },
    areaServed: { '@type': 'State', name: 'Tamil Nadu' },
    url: scheme.apply_url || scheme.website_url || SITE_URL,
  });
}

/**
 * WebPage structured data (default for generic pages).
 */
export function injectWebPageStructuredData({ name, description, url, breadcrumbs }) {
  injectScript('tn-ld-webpage', {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: url || (typeof window !== 'undefined' ? window.location.href : SITE_URL),
    inLanguage: 'en-IN',
    isPartOf: { '@type': 'WebSite', name: 'VizhiTN', url: SITE_URL },
    ...(breadcrumbs ? { breadcrumb: breadcrumbs } : {}),
  });
}

/**
 * Clean up all injected structured data scripts on page unmount.
 */
export function cleanupStructuredData() {
  document.querySelectorAll('script[id^="tn-ld-"]').forEach((el) => el.remove());
}

/**
 * Apply runtime SEO settings fetched from the admin `site_setting` table.
 * Called once on app mount from AuthContext.
 * @param {Record<string, string>} settings — key/value map from getSettingsMap()
 */
export function applySEOSettings(settings) {
  if (!settings || typeof window === 'undefined') return;

  // Google AdSense publisher ID — injected at runtime from admin panel
  const adsPubId = settings.adsense_publisher_id || settings.google_adsense_id;
  if (adsPubId && !document.getElementById('adsense-script')) {
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsPubId}`;
    document.head.appendChild(script);
  }

  // Google Analytics / Tag Manager
  const gaId = settings.google_analytics_id || settings.ga_measurement_id;
  if (gaId && !document.getElementById('gtag-script')) {
    const script = document.createElement('script');
    script.id = 'gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
    const init = document.createElement('script');
    init.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`;
    document.head.appendChild(init);
  }

  // Custom site title override
  if (settings.site_title) {
    document.title = settings.site_title;
  }

  // Custom meta description override
  if (settings.site_description) {
    setMeta('description', settings.site_description);
    setMeta('og:description', settings.site_description, 'property');
  }

  // Google Site Verification
  if (settings.google_site_verification) {
    setMeta('google-site-verification', settings.google_site_verification);
  }
}
