export const SITE_URL = 'https://www.vizhitn.in';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const EDITORIAL_TEAM_URL = `${SITE_URL}/authors/vizhitn-editorial-team`;
export const EDITORIAL_TEAM_ID = `${EDITORIAL_TEAM_URL}#team`;

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
  const name = authorName?.trim() || 'VizhiTN Editorial Team';
  const isEditorialTeam = name.toLowerCase() === 'vizhitn editorial team';

  if (isEditorialTeam) {
    return {
      '@type': 'Organization',
      '@id': EDITORIAL_TEAM_ID,
      name,
      url: EDITORIAL_TEAM_URL,
    };
  }

  return {
    '@type': 'Person',
    name,
    // Until dedicated profile pages are published, point to the public page
    // that identifies the publisher instead of emitting an author with no URL.
    url: `${SITE_URL}/about`,
  };
}
