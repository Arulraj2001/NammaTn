// src/components/seo/PageSchema.jsx
import { ORGANIZATION_ID, WEBSITE_ID } from '@/lib/schemaIdentity';

/**
 * @param {object} props
 * @param {string} props.url            - Canonical URL for this page
 * @param {string} props.name           - Page title (matches <title> tag)
 * @param {string} props.description    - Page description (matches meta description)
 * @param {Array}  props.breadcrumbs    - [{name, url}] — first item should be Home
 * @param {string} [props.dateModified] - ISO string from a real content or data change
 */
export default function PageSchema({ url, name, description, breadcrumbs, dateModified }) {
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en-IN',
    ...(dateModified ? { dateModified } : {}),
    isPartOf: {
      '@id': WEBSITE_ID,
    },
    publisher: { '@id': ORGANIZATION_ID },
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
