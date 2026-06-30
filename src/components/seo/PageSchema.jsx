// src/components/seo/PageSchema.jsx
// FIX 8: dateModified is stable — defaults to date-only (YYYY-MM-DD) not live timestamp.
// Prevents crawl inconsistency from dateModified changing on every ISR render.

/**
 * @param {object} props
 * @param {string} props.url            - Canonical URL for this page
 * @param {string} props.name           - Page title (matches <title> tag)
 * @param {string} props.description    - Page description (matches meta description)
 * @param {Array}  props.breadcrumbs    - [{name, url}] — first item should be Home
 * @param {string} [props.dateModified] - ISO string; if omitted uses today's UTC date (stable)
 */
export default function PageSchema({ url, name, description, breadcrumbs, dateModified }) {
  const SITE_URL = 'https://www.vizhitn.in';

  // FIX 8: Stable date — does not change mid-day within an ISR window.
  // Passes a consistent signal to Google on re-crawl of the same ISR-cached page.
  const stableDate = dateModified
    ?? new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en-IN',
    dateModified: stableDate,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'VizhiTN',
      url: SITE_URL,
    },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    potentialAction: {
      '@type': 'ReadAction',
      target: [url],
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
