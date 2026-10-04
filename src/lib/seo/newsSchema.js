// src/lib/seo/newsSchema.js
// Reusable Schema.org JSON-LD generators for public post/article pages
// (NewsArticle for Google News) and hub pages (BreadcrumbList).

export function generateNewsArticleSchema({
  headline,
  headlineTa,
  description,
  descriptionTa,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName = 'VizhiTN Reporter',
  author,
  publisher,
  section,
  language = 'en-IN',
  districtName = '',
  areaName = '',
  locationText = '',
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: headline?.slice(0, 110) || '',
    description: description || '',
    url: url || '',
    image: imageUrl
      ? {
          '@type': 'ImageObject',
          url: imageUrl,
          width: 1200,
          height: 675,
        }
      : {
          '@type': 'ImageObject',
          url: 'https://www.vizhitn.in/og-image.png',
          width: 1200,
          height: 630,
        },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    author: author || {
      '@type': 'Person',
      name: authorName || 'VizhiTN Reporter',
    },
    publisher: publisher || {
      '@type': 'Organization',
      name: 'VizhiTN',
      url: 'https://www.vizhitn.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.vizhitn.in/apple-touch-icon.png',
        width: 180,
        height: 180,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url || 'https://www.vizhitn.in',
    },
    articleSection: section || 'Civic News',
    inLanguage: headlineTa ? ['en-IN', 'ta-IN'] : language,
    isAccessibleForFree: true,
    copyrightHolder: {
      '@type': 'Organization',
      name: 'VizhiTN',
    },
  };

  if (districtName || areaName) {
    schema.contentLocation = {
      '@type': 'Place',
      name: [areaName, districtName, 'Tamil Nadu'].filter(Boolean).join(', '),
      address: {
        '@type': 'PostalAddress',
        addressLocality: areaName || districtName,
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN',
      },
    };
    schema.spatialCoverage = {
      '@type': 'Place',
      name: `${districtName || 'Tamil Nadu'}, India`,
    };
  }

  if (headlineTa) {
    schema.alternativeHeadline = headlineTa.slice(0, 110);
  }

  return schema;
}

export function generateSpecialAnnouncementSchema({
  name,
  text,
  url,
  datePosted,
  expires,
  category = 'https://schema.org/SpecialAnnouncement',
  districtName = 'Tamil Nadu',
  departmentName = 'Tamil Nadu Government',
  helpline = '',
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    name: name?.slice(0, 110) || '',
    text: text || '',
    url: url || 'https://www.vizhitn.in',
    datePosted: datePosted || new Date().toISOString(),
    ...(expires ? { expires } : {}),
    category,
    spatialCoverage: {
      '@type': 'AdministrativeArea',
      name: `${districtName}, Tamil Nadu, India`,
    },
    announcementLocation: {
      '@type': 'CivicStructure',
      name: `${districtName} Public Jurisdiction`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: districtName,
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN',
      },
    },
    serviceOperator: {
      '@type': 'GovernmentOrganization',
      name: departmentName,
      ...(helpline ? { telephone: helpline } : {}),
      url: 'https://www.vizhitn.in',
    },
  };
}

export function generateTamilNewsArticleSchema(params) {
  return generateNewsArticleSchema({
    ...params,
    language: 'ta-IN',
  });
}

export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}