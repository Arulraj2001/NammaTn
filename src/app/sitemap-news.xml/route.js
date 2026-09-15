// src/app/sitemap-news.xml/route.js
// Dedicated Google News XML Sitemap conforming to Google News Sitemap protocol.
// See: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap

import { createServerSupabase } from '@/lib/serverSupabase';

const SITE_URL = 'https://www.vizhitn.in';
export const revalidate = 1800; // 30 minutes cache

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const supabase = createServerSupabase();
  let articles = [];

  if (supabase) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    try {
      // First attempt: fetch articles published in the last 48 hours (Google News standard)
      const { data: recentNews, error } = await supabase
        .from('tn_today')
        .select('slug, title, title_ta, seo_title, seo_title_ta, publish_date, created_date')
        .eq('status', 'published')
        .gte('publish_date', fortyEightHoursAgo)
        .order('publish_date', { ascending: false })
        .limit(100);

      if (!error && recentNews && recentNews.length > 0) {
        articles = recentNews;
      } else {
        // Fallback: If no articles in last 48h, grab the most recent 25 published articles
        // to avoid serving an empty sitemap that triggers Google Search Console errors.
        const { data: fallbackNews } = await supabase
          .from('tn_today')
          .select('slug, title, title_ta, seo_title, seo_title_ta, publish_date, created_date')
          .eq('status', 'published')
          .order('publish_date', { ascending: false })
          .limit(25);

        articles = fallbackNews || [];
      }
    } catch (e) {
      console.warn('[sitemap-news] Fetch error:', e.message);
    }
  }

  const itemsXml = articles
    .filter(a => a.slug)
    .map(a => {
      const pubDate = a.publish_date || a.created_date || new Date().toISOString();
      // Use Tamil headline if available, otherwise English
      const rawTitle = a.seo_title_ta || a.title_ta || a.seo_title || a.title || 'TN Today Article';
      const newsLang = (a.seo_title_ta || a.title_ta) ? 'ta' : 'en';
      const cleanTitle = escapeXml(rawTitle);
      const cleanUrl = escapeXml(`${SITE_URL}/tn-today/${a.slug}`);

      return `  <url>
    <loc>${cleanUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>VizhiTN</news:name>
        <news:language>${newsLang}</news:language>
      </news:publication>
      <news:publication_date>${new Date(pubDate).toISOString()}</news:publication_date>
      <news:title>${cleanTitle}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${itemsXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
