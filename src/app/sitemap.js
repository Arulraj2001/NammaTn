// src/app/sitemap.js
// FIX 3 & 9: Only includes /[city]/[issue]/ URLs with ≥1 active report in DB.
// If DB evidence is unavailable, omit city/issue pairs rather than inventing URLs.
// SEO PHASE 1: Also includes /tn-today/[slug] article URLs.

import {
  DISTRICTS,
  DISTRICT_MAP,
  CATEGORY_MAP,
} from '@/lib/seo-data';
import { CATEGORIES as PUBLIC_CATEGORIES } from '@/lib/categories';
import { OFFICES } from '@/lib/offices';
import { getActiveAreas } from '@/lib/publicHubServer';
import { createServerSupabase } from '@/lib/serverSupabase';
import { TN_TODAY_CATEGORY_MAP } from '@/lib/tnTodayCategories';
import { getAllArticles, getAllRights, getAllSchemes, getAllGuides, GOVT_SCHEMES, SAFETY_GUIDES } from '@/lib/awarenessServer';

const SITE_URL = 'https://www.vizhitn.in';

export default async function sitemap() {
  const entries = [];

  // ── Level 1: Homepage ─────────────────────────────────────────────────────
  entries.push({
    url: `${SITE_URL}/`,
    changeFrequency: 'hourly',
    priority: 1.0,
  });

  // ── Level 2 + Level 3: City hub pages AND City × Issue pages.
  //     All 38 city hubs + all valid city/issue combos are indexable editorial
  //     pages (they render H1/intro/FAQs even with 0 reports), so enumerate the
  //     full matrix instead of only the pairs that currently have DB reports.
  const ISSUE_SLUGS = [
    'power-cut', 'water-issue', 'road-problem', 'scam', 'jobs', 'stay',
    'education', 'government-schemes', 'general', 'healthcare', 'environment',
  ];

  const issueDates = new Map();    // "city:issue" -> last modified date
  const districtDates = new Map(); // city.slug     -> last modified date

  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const { data: activePairs, error } = await supabase
        .from('post')
        .select('district_slug, category_slug, created_date, updated_date')
        .eq('status', 'active')
        .not('district_slug', 'is', null)
        .not('category_slug', 'is', null);

      if (error) throw error;

      // Bump a map to the newest date for a key.
      const bump = (map, key, changedAt) => {
        const cur = map.get(key);
        if (!cur || new Date(changedAt) > new Date(cur)) map.set(key, changedAt);
      };

      (activePairs || []).forEach(p => {
        const changedAt = p.updated_date || p.created_date;
        if (!DISTRICT_MAP[p.district_slug] || !changedAt) return;
        bump(districtDates, p.district_slug, changedAt);
        if (CATEGORY_MAP[p.category_slug]) bump(issueDates, `${p.district_slug}:${p.category_slug}`, changedAt);
      });
    }
  } catch (e) {
    console.warn('[sitemap] DB unavailable — lastModified omitted for city/issue pages:', e.message);
  }

  // Level 2: City hub pages (all 38 — hubs have editorial value regardless of post count)
  DISTRICTS.forEach(city => {
    const lastModified = districtDates.get(city.slug);
    entries.push({
      url: `${SITE_URL}/${city.slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // Level 3: City × Issue pages — full indexable matrix
  DISTRICTS.forEach(city => {
    ISSUE_SLUGS.forEach(issue => {
      if (!CATEGORY_MAP[issue]) return;
      const lastModified = issueDates.get(`${city.slug}:${issue}`);
      entries.push({
        url: `${SITE_URL}/${city.slug + '/' + issue}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });
  });

  // ── TN Today articles (published) ──────────────────────────────────────
  try {
    const supabase = createServerSupabase();
    if (!supabase) throw new Error('Supabase is not configured');
    const { data: articles } = await supabase
      .from('tn_today')
      .select('slug, category, updated_date, publish_date')
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(500);

    const publishedCategories = new Set();
    (articles || []).forEach(a => {
      if (!a.slug) return;
      if (TN_TODAY_CATEGORY_MAP[a.category]) publishedCategories.add(a.category);
      entries.push({
        url: `${SITE_URL}/tn-today/${a.slug}`,
        ...(a.updated_date || a.publish_date
          ? { lastModified: a.updated_date || a.publish_date }
          : {}),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });

    publishedCategories.forEach(category => {
      entries.push({
        url: `${SITE_URL}/tn-today/category/${category}`,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });

    // ── TN Politics hub and static pages ────────────────────────────────
    const politicsStaticUrls = [
      { url: `${SITE_URL}/tn-politics`, changeFrequency: 'daily', priority: 0.9, lastModified: new Date() },
      ...['tvk','dmk','aiadmk','bjp-tn','ntk','pmk'].map(party => ({
        url: `${SITE_URL}/tn-politics/party/${party}`,
        changeFrequency: 'daily',
        priority: 0.8,
        lastModified: new Date()
      }))
    ];
    politicsStaticUrls.forEach(u => entries.push(u));

    // TN Politics MLA pages (38 districts)
    const POLITICS_DISTRICT_SLUGS = [
      'chennai','coimbatore','madurai','tiruchirappalli','salem',
      'tirunelveli','vellore','erode','thoothukudi','thanjavur',
      'dindigul','kancheepuram','nagapattinam','namakkal','nilgiris',
      'perambalur','pudukkottai','ramanathapuram','ranipet','sivaganga',
      'tenkasi','theni','tiruppur','tiruvallur','tiruvannamalai',
      'tiruvarur','villupuram','virudhunagar','ariyalur','chengalpattu',
      'cuddalore','dharmapuri','kallakurichi','karur','krishnagiri',
      'mayiladuthurai','tirupattur'
    ];

    POLITICS_DISTRICT_SLUGS.forEach(slug => {
      entries.push({
        url: `${SITE_URL}/tn-politics/mla/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
        lastModified: new Date()
      });
    });

    // TN Politics posts from Supabase
    try {
      const { data: politicsPosts } = await supabase
        .from('post')
        .select('slug, id, updated_date, created_date')
        .eq('category_slug', 'tn-politics')
        .eq('status', 'active')
        .eq('is_publicly_visible', true)
        .order('created_date', { ascending: false })
        .limit(500);

      (politicsPosts || []).forEach(post => {
        entries.push({
          url: `${SITE_URL}/tn-politics/${post.slug || post.id}`,
          changeFrequency: 'weekly',
          priority: 0.8,
          lastModified: new Date(post.updated_date || post.created_date)
        });
      });
    } catch (e) {
      console.warn('[sitemap] Failed to fetch politicsPosts:', e.message);
    }

    // ── Posts (Civic Reports & Community Updates) ────────────────────────
    const { data: publicPosts } = await supabase
      .from('post')
      .select('slug, id, updated_date, created_date, is_publicly_visible, moderation_status')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(1000);

    (publicPosts || []).forEach(p => {
      // Exclude seed/test posts from sitemap to prevent "Excluded by noindex" and crawl budget waste
      const idStr = String(p.id || '');
      const slugStr = String(p.slug || '').trim();
      const isSeed = idStr.startsWith('post-dist-seed-') ||
        idStr.startsWith('sit-seed-') ||
        idStr.startsWith('scam-seed-') ||
        idStr.startsWith('emerg-seed-') ||
        idStr.startsWith('post-explore-') ||
        slugStr.startsWith('post-dist-seed-') ||
        slugStr.startsWith('sit-seed-') ||
        slugStr.startsWith('scam-seed-') ||
        slugStr.startsWith('emerg-seed-') ||
        slugStr.startsWith('post-explore-');

      if (isSeed) return;
      if (p.is_publicly_visible === false || p.moderation_status === 'rejected' || p.moderation_status === 'hidden') return;

      const path = slugStr ? `/post/${slugStr}` : `/post/${idStr}`;
      entries.push({
        url: `${SITE_URL}${path}`,
        ...(p.updated_date || p.created_date
          ? { lastModified: p.updated_date || p.created_date }
          : {}),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });
  } catch (e) {
    console.warn('[sitemap] TN Today & Posts fetch failed:', e.message);
  }

  // ── Utility pages ───────────────────────────────────────────────────
  // Public category hubs use a separate taxonomy from city-issue SEO pages.
  PUBLIC_CATEGORIES.forEach(category => {
    entries.push({
      url: `${SITE_URL}/category/${category.slug}`,
      changeFrequency: 'daily',
      priority: 0.7,
    });
  });

  OFFICES.forEach(office => {
    entries.push({
      url: `${SITE_URL}/office/${office.slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  const areas = await getActiveAreas(500);
  areas.forEach(area => {
    if (!area.slug) return;
    entries.push({
      url: `${SITE_URL}/area/${area.slug}`,
      ...(area.updated_date || area.created_date
        ? { lastModified: area.updated_date || area.created_date }
        : {}),
      changeFrequency: 'daily',
      priority: 0.6,
    });
  });

  // ── Awareness details (articles, rights, schemes, guides) ────────────
  try {
    const articles = getAllArticles();
    (articles || []).forEach(a => {
      if (a.slug) {
        entries.push({
          url: `${SITE_URL}/awareness/article/${a.slug}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });

    const rights = getAllRights();
    (rights || []).forEach(r => {
      if (r.slug) {
        entries.push({
          url: `${SITE_URL}/rights/${r.slug}`,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });

    const schemes = typeof getAllSchemes === 'function' ? getAllSchemes() : GOVT_SCHEMES;
    (schemes || []).forEach(s => {
      if (s.slug) {
        entries.push({
          url: `${SITE_URL}/schemes/${s.slug}`,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });

    const guides = typeof getAllGuides === 'function' ? getAllGuides() : SAFETY_GUIDES;
    (guides || []).forEach(g => {
      if (g.slug) {
        entries.push({
          url: `${SITE_URL}/awareness/guide/${g.slug}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  } catch (e) {
    console.warn('[sitemap] Awareness detail pages fetch failed:', e.message);
  }

  [
    '/power-cuts-today-tamil-nadu', '/school-college-holiday-alerts',
    '/schemes', '/helplines', '/rights', '/rti', '/esevai',
  ].forEach(path => {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });
  });

  // ── District-specific School Holiday & Power Cut Hubs (38 districts each) ──
  DISTRICTS.forEach(city => {
    entries.push({
      url: `${SITE_URL}/school-college-holiday-alerts/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    });
    entries.push({
      url: `${SITE_URL}/power-cuts-today-tamil-nadu/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    });
  });

  [
    '/districts', '/areas', '/awareness', '/awareness/articles',
    '/awareness/emergency', '/awareness/faqs', '/awareness/guides', '/awareness/portals',
    '/community', '/community/wins', '/scams',
    '/jobs', '/stay', '/offices', '/bribes', '/trending', '/tn-today',
    '/explore', '/help', '/situations', '/ask', '/leaderboard', '/listings',
    '/support', '/rwa', '/csr',
    '/about', '/contact', '/privacy-policy', '/terms', '/how-to-use',
  ].forEach(path => {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}
