const SITE_URL = 'https://www.vizhitn.in';

export function getTnTodayCanonical(slug) {
  const normalizedSlug = typeof slug === 'string'
    ? slug.trim().replace(/^\/+|\/+$/g, '')
    : '';

  return normalizedSlug
    ? `${SITE_URL}/tn-today/${encodeURIComponent(normalizedSlug)}`
    : `${SITE_URL}/tn-today`;
}
