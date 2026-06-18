/**
 * SEO utilities — dynamic meta tag management, structured data.
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

function setMeta(property, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

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
} = {}) {
  const t = title ? `${title} | TN Voice` : DEFAULT.title;
  const d = description || DEFAULT.description;
  const img = image || DEFAULT.image;
  const u = url || (typeof window !== "undefined" ? window.location.href : DEFAULT.url);
  const canon = canonical || u;

  document.title = t;

  // Standard
  setMeta("description", d);
  setMeta("robots", "index, follow");

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

/**
 * Generate JSON-LD structured data for a post.
 */
export function injectPostStructuredData(post) {
  const id = `tn-ld-post-${post.id}`;
  removeStructuredData(id);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title_en,
    description: post.content_en?.substring(0, 200),
    datePublished: post.created_date,
    dateModified: post.updated_date || post.created_date,
    author: {
      "@type": post.is_anonymous ? "Organization" : "Person",
      name: post.is_anonymous ? "Anonymous" : post.author_name || "TN Voice Community",
    },
    publisher: {
      "@type": "Organization",
      name: "TN Voice",
      url: DEFAULT.url,
    },
    ...(post.media_urls?.[0] ? { image: post.media_urls[0] } : {}),
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Generate JSON-LD for district/category list pages.
 */
export function injectBreadcrumbStructuredData(items) {
  const id = "tn-ld-breadcrumb";
  removeStructuredData(id);

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

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

function removeStructuredData(id) {
  document.getElementById(id)?.remove();
}

/** Clean up all structured data scripts on unmount */
export function cleanupStructuredData() {
  document.querySelectorAll('script[id^="tn-ld-"]').forEach((el) => el.remove());
}