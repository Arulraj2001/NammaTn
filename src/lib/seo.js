/**
 * SEO utilities — dynamic meta tag management, structured data,
 * webmaster verifications, hreflang, analytics, and advanced meta tags.
 *
 * Settings are loaded from the `site_settings` DB table via `getSettingsMap()`.
 * Call `applySEOSettings(settingsMap)` once on app boot to inject all DB-driven tags.
 */

const DEFAULT = {
  title: "NammaTN – Tamil Nadu Civic & Community Platform",
  description:
    "NammaTN is Tamil Nadu's public civic platform — report local issues, track resolutions, join live community discussions, access government schemes, and celebrate community wins.",
  image: "https://nammatn.in/og-image.png",
  url: typeof window !== "undefined" ? window.location.origin : "https://nammatn.in",
  siteName: "NammaTN",
  locale: "en_IN",
};

// ─── Low-level DOM helpers ───────────────────────────────────────────────────

function setMeta(property, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    el.setAttribute("data-manual", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(property, attr = "name") {
  const el = document.querySelector(`meta[${attr}="${property}"]`);
  if (el) {
    el.setAttribute("content", "");
  }
}

function setLink(rel, href, extra = {}) {
  if (!href) return;
  // For hreflang we need multiple <link> tags — use data attr as key
  const key = extra.hreflang ? `${rel}-${extra.hreflang}` : rel;
  let el = document.querySelector(`link[rel="${rel}"]${extra.hreflang ? `[hreflang="${extra.hreflang}"]` : ""}`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (extra.hreflang) el.setAttribute("hreflang", extra.hreflang);
    el.setAttribute("data-manual", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function injectScript(id, content, type = "application/ld+json") {
  const existing = document.getElementById(id);
  if (existing) {
    existing.text = content;
    return;
  }
  const script = document.createElement("script");
  script.type = type;
  script.id = id;
  script.text = content;
  script.setAttribute("data-manual", "true");
  document.head.appendChild(script);
}

// ─── Webmaster verification meta map ────────────────────────────────────────

const WEBMASTER_META = [
  { settingKey: "seo_google_verification",   metaName: "google-site-verification" },
  { settingKey: "seo_bing_verification",      metaName: "msvalidate.01" },
  { settingKey: "seo_yandex_verification",    metaName: "yandex-verification" },
  { settingKey: "seo_baidu_verification",     metaName: "baidu-site-verification" },
  { settingKey: "seo_pinterest_verification", metaName: "p:domain_verify" },
  { settingKey: "seo_norton_verification",    metaName: "norton-safeweb-site-verification" },
  { settingKey: "seo_alexa_verification",     metaName: "alexaVerifyID" },
];

// ─── Hreflang locale map ─────────────────────────────────────────────────────

const HREFLANG_LOCALES = [
  { code: "en-IN",     key: "hreflang_en_in" },
  { code: "ta-IN",     key: "hreflang_ta_in" },
  { code: "hi-IN",     key: "hreflang_hi_in" },
  { code: "x-default", key: "hreflang_default" },
];

// ─── Analytics injectors ─────────────────────────────────────────────────────

function injectGA4(measurementId) {
  if (!measurementId || document.getElementById("tn-ga4-script")) return;
  const s = document.createElement("script");
  s.id = "tn-ga4-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(s);
  const init = document.createElement("script");
  init.id = "tn-ga4-init";
  init.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`;
  document.head.appendChild(init);
}

function injectGTM(containerId) {
  if (!containerId || document.getElementById("tn-gtm-head")) return;
  const s = document.createElement("script");
  s.id = "tn-gtm-head";
  s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`;
  document.head.appendChild(s);
}

function injectClarity(projectId) {
  if (!projectId || document.getElementById("tn-clarity")) return;
  const s = document.createElement("script");
  s.id = "tn-clarity";
  s.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${projectId}");`;
  document.head.appendChild(s);
}

function injectFBPixel(pixelId) {
  if (!pixelId || document.getElementById("tn-fbpixel")) return;
  const s = document.createElement("script");
  s.id = "tn-fbpixel";
  s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
  document.head.appendChild(s);
}

// ─── Organization JSON-LD builder ────────────────────────────────────────────

function buildOrgSchema(s) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.sd_org_name || DEFAULT.siteName,
    url: s.sd_org_url || DEFAULT.url,
    ...(s.sd_org_logo ? { logo: { "@type": "ImageObject", url: s.sd_org_logo } } : {}),
    ...(s.sd_org_email ? { email: s.sd_org_email } : {}),
    ...(s.sd_org_phone ? { contactPoint: { "@type": "ContactPoint", telephone: s.sd_org_phone, contactType: "customer service" } } : {}),
    ...(s.sd_social_profiles
      ? { sameAs: s.sd_social_profiles.split("\n").map((u) => u.trim()).filter(Boolean) }
      : {}),
  };
  return schema;
}

function buildWebsiteSchema(s) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: s.sd_org_name || DEFAULT.siteName,
    url: s.sd_org_url || DEFAULT.url,
    ...(s.sd_searchbox_enabled === "true"
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${s.sd_org_url || DEFAULT.url}/search?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
  return schema;
}

// ─── Main: Apply all DB-driven SEO settings ───────────────────────────────────

/**
 * Call this once on app boot with the settingsMap from `getSettingsMap()`.
 * Injects webmaster verification tags, hreflang links, analytics scripts,
 * advanced meta tags, and structured data JSON-LD.
 */
export function applySEOSettings(s = {}) {
  if (typeof document === "undefined") return;

  // 1. Webmaster verification meta tags
  WEBMASTER_META.forEach(({ settingKey, metaName }) => {
    if (s[settingKey]) setMeta(metaName, s[settingKey]);
    else removeMeta(metaName);
  });

  // 2. Hreflang alternate link tags
  HREFLANG_LOCALES.forEach(({ code, key }) => {
    if (s[key]) setLink("alternate", s[key], { hreflang: code });
  });

  // 3. Advanced meta tags
  if (s.seo_meta_keywords)   setMeta("keywords", s.seo_meta_keywords);
  if (s.seo_author)          setMeta("author", s.seo_author);
  if (s.seo_copyright)       setMeta("copyright", s.seo_copyright);
  if (s.seo_language)        setMeta("language", s.seo_language);
  if (s.seo_geo_region)      setMeta("geo.region", s.seo_geo_region);
  if (s.seo_geo_placename)   setMeta("geo.placename", s.seo_geo_placename);
  if (s.seo_geo_position)    setMeta("geo.position", s.seo_geo_position);
  if (s.seo_robots_default)  setMeta("robots", s.seo_robots_default);
  if (s.seo_theme_color)     setMeta("theme-color", s.seo_theme_color);

  // OG extras
  if (s.seo_og_locale_alt)   setMeta("og:locale:alternate", s.seo_og_locale_alt, "property");
  if (s.seo_fb_app_id)       setMeta("fb:app_id", s.seo_fb_app_id, "property");

  // Twitter extras
  if (s.seo_twitter_site)    setMeta("twitter:site", s.seo_twitter_site);
  if (s.seo_twitter_creator) setMeta("twitter:creator", s.seo_twitter_creator);

  // Manifest / PWA
  if (s.seo_manifest_url)    setLink("manifest", s.seo_manifest_url);
  if (s.seo_apple_touch_icon) setLink("apple-touch-icon", s.seo_apple_touch_icon);

  // 4. Analytics scripts
  if (s.seo_ga4_id)       injectGA4(s.seo_ga4_id);
  if (s.seo_gtm_id)       injectGTM(s.seo_gtm_id);
  if (s.seo_clarity_id)   injectClarity(s.seo_clarity_id);
  if (s.seo_fb_pixel_id)  injectFBPixel(s.seo_fb_pixel_id);

  // 5. Organization JSON-LD
  if (s.sd_org_name || s.sd_org_url) {
    injectScript("tn-ld-org", JSON.stringify(buildOrgSchema(s)));
    injectScript("tn-ld-website", JSON.stringify(buildWebsiteSchema(s)));
  }
}

// ─── Per-page meta (called on every route mount) ──────────────────────────────

/**
 * Set page metadata.
 * Call on every route/page mount.
 */
export function setPageMeta({
  title,
  description,
  image,
  url,
  type = "website",
  canonical,
  noindex = false,
} = {}) {
  const t = title ? `${title} | NammaTN` : DEFAULT.title;
  const d = description || DEFAULT.description;
  const img = image || DEFAULT.image;
  const u = url || (typeof window !== "undefined" ? window.location.href : DEFAULT.url);
  const canon = canonical || u;

  document.title = t;

  // Standard
  setMeta("description", d);
  setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

  // Open Graph
  setMeta("og:type", type, "property");
  setMeta("og:title", t, "property");
  setMeta("og:description", d, "property");
  setMeta("og:image", img, "property");
  setMeta("og:url", u, "property");
  setMeta("og:site_name", DEFAULT.siteName, "property");
  setMeta("og:locale", DEFAULT.locale, "property");

  // Twitter
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", t);
  setMeta("twitter:description", d);
  setMeta("twitter:image", img);

  // Canonical
  setLink("canonical", canon);
}

// ─── Structured data helpers ─────────────────────────────────────────────────

/**
 * Generate JSON-LD structured data for a post.
 */
export function injectPostStructuredData(post) {
  const id = `tn-ld-post-${post.id}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title_en,
    description: post.content_en?.substring(0, 200),
    datePublished: post.created_date,
    dateModified: post.updated_date || post.created_date,
    author: {
      "@type": post.is_anonymous ? "Organization" : "Person",
      name: post.is_anonymous ? "Anonymous" : post.author_name || "NammaTN Community",
    },
    publisher: {
      "@type": "Organization",
      name: "NammaTN",
      url: DEFAULT.url,
    },
    ...(post.media_urls?.[0] ? { image: post.media_urls[0] } : {}),
  };

  injectScript(id, JSON.stringify(schema));
}

/**
 * Generate JSON-LD for district/category list pages.
 */
export function injectBreadcrumbStructuredData(items) {
  const id = "tn-ld-breadcrumb";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };

  injectScript(id, JSON.stringify(schema));
}

/**
 * Generate FAQ JSON-LD for awareness/help pages.
 */
export function injectFAQStructuredData(faqs) {
  const id = "tn-ld-faq";
  if (!faqs?.length) {
    const existing = document.getElementById(id);
    if (existing) existing.text = "";
    return;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  injectScript(id, JSON.stringify(schema));
}

/**
 * Generate LocalBusiness JSON-LD for listings.
 */
export function injectLocalBusinessStructuredData(listing) {
  const id = `tn-ld-biz-${listing.id}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.business_name || listing.title,
    description: listing.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.area_name || listing.district_name,
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    ...(listing.phone ? { telephone: listing.phone } : {}),
    ...(listing.website ? { url: listing.website } : {}),
    ...(listing.category ? { "@type": "LocalBusiness", category: listing.category } : {}),
  };

  injectScript(id, JSON.stringify(schema));
}

/** Clean up all structured data scripts on unmount */
export function cleanupStructuredData() {
  document.querySelectorAll('script[id^="tn-ld-"]').forEach((el) => {
    el.text = "";
  });
}