const SITE_URL = 'https://www.vizhitn.in';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Notify search engines (IndexNow for Bing/Yandex and Google Sitemap Ping)
 * about newly created or updated URLs.
 * Runs asynchronously without blocking content submission or throwing errors.
 * 
 * @param {string | string[]} urls - URL path(s) or full URL string(s)
 */
export async function notifySearchEngines(urls) {
  if (!urls) return;

  const rawList = Array.isArray(urls) ? urls : [urls];
  const urlList = rawList
    .filter(Boolean)
    .map(url => (url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`));

  if (urlList.length === 0) return;

  const host = 'www.vizhitn.in';

  // 1. Dispatch IndexNow notification
  const indexNowPayload = {
    host,
    key: 'vizhitn-instant-indexing',
    keyLocation: `${SITE_URL}/vizhitn-instant-indexing.txt`,
    urlList,
  };

  try {
    fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(indexNowPayload),
    }).catch(() => {
      // Suppress network errors in non-blocking mode
    });
  } catch (_e) {
    // Suppress synchronous fetch errors
  }

  // 2. Ping Google Sitemap endpoint
  try {
    const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`).catch(() => {
      // Suppress network errors in non-blocking mode
    });
  } catch (_e) {
    // Suppress synchronous fetch errors
  }
}
