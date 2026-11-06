export const SITE_URL = 'https://vizhitn.in';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function getPublisherSchema() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'VizhiTN',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
  };
}

export function getArticleAuthor(authorName) {
  const name = authorName?.trim() || 'Arulraj';

  return {
    '@type': 'Person',
    name,
    url: `${SITE_URL}/editorial-team`,
  };
}
