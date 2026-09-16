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
  const newsItems = [];

  if (supabase) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // 1. Fetch TN Today articles (last 48 hours, with fallback if empty)
    try {
      const { data: recentNews, error: e1 } = await supabase
        .from('tn_today')
        .select('slug, title, title_ta, seo_title, seo_title_ta, publish_date, created_date')
        .eq('status', 'published')
        .gte('publish_date', fortyEightHoursAgo)
        .order('publish_date', { ascending: false })
        .limit(100);

      let tnArticles = (!e1 && recentNews && recentNews.length > 0) ? recentNews : [];

      if (tnArticles.length === 0) {
        const { data: fallbackNews } = await supabase
          .from('tn_today')
          .select('slug, title, title_ta, seo_title, seo_title_ta, publish_date, created_date')
          .eq('status', 'published')
          .order('publish_date', { ascending: false })
          .limit(25);
        tnArticles = fallbackNews || [];
      }

      tnArticles.forEach(a => {
        if (!a.slug) return;
        const pubDate = a.publish_date || a.created_date || new Date().toISOString();
        const rawTitle = a.seo_title_ta || a.title_ta || a.seo_title || a.title || 'TN Today Article';
        const newsLang = (a.seo_title_ta || a.title_ta) ? 'ta' : 'en';
        newsItems.push({
          url: `${SITE_URL}/tn-today/${a.slug}`,
          title: rawTitle,
          date: pubDate,
          lang: newsLang,
        });
      });
    } catch (err) {
      console.warn('[sitemap-news] TN Today error:', err.message);
    }

    // 2. Fetch recent civic & imported posts (last 48 hours, with fallback if empty)
    try {
      const { data: recentPosts, error: e2 } = await supabase
        .from('post')
        .select('slug, id, title, title_en, title_ta, seo_title, created_date')
        .eq('status', 'active')
        .gte('created_date', fortyEightHoursAgo)
        .order('created_date', { ascending: false })
        .limit(100);

      let postsList = (!e2 && recentPosts && recentPosts.length > 0) ? recentPosts : [];

      if (postsList.length === 0) {
        const { data: fallbackPosts } = await supabase
          .from('post')
          .select('slug, id, title, title_en, title_ta, seo_title, created_date')
          .eq('status', 'active')
          .order('created_date', { ascending: false })
          .limit(25);
        postsList = fallbackPosts || [];
      }

      postsList.forEach(p => {
        const slug = p.slug?.trim() || p.id;
        if (!slug) return;
        const pubDate = p.created_date || new Date().toISOString();
        const rawTitle = p.seo_title || p.title_ta || p.title_en || p.title || 'Civic Report';
        const newsLang = p.title_ta ? 'ta' : 'en';
        newsItems.push({
          url: `${SITE_URL}/post/${slug}`,
          title: rawTitle,
          date: pubDate,
          lang: newsLang,
        });
      });
    } catch (err) {
      console.warn('[sitemap-news] Posts error:', err.message);
    }
  }

  // Sort unified news items by date descending (freshest first)
  newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  const itemsXml = newsItems
    .slice(0, 1000)
    .map(item => {
      const cleanTitle = escapeXml(item.title);
      const cleanUrl = escapeXml(item.url);

      return `  <url>
    <loc>${cleanUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>VizhiTN</news:name>
        <news:language>${item.lang}</news:language>
      </news:publication>
      <news:publication_date>${new Date(item.date).toISOString()}</news:publication_date>
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
