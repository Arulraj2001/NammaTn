const SITE_TITLE_SUFFIX = /\s*\|\s*VizhiTN\s*$/i;

export function getPageTitle(value, fallback = '') {
  let title = typeof value === 'string' ? value.trim() : '';

  while (SITE_TITLE_SUFFIX.test(title)) {
    title = title.replace(SITE_TITLE_SUFFIX, '').trim();
  }

  return title || fallback;
}

export function getSocialTitle(value, fallback = '') {
  const title = getPageTitle(value, fallback);
  if (!title) return 'VizhiTN';
  return /\bVizhiTN\b/i.test(title) ? title : `${title} | VizhiTN`;
}
