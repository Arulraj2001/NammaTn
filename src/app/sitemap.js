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
import { getActiveAreas } from '@/lib/publicHubServer';
import { createServerSupabase } from '@/lib/serverSupabase';
import { TN_TODAY_CATEGORY_MAP } from '@/lib/tnTodayCategories';
import { getAllArticles, getAllRights, getAllSchemes, getAllGuides, getAllPortals, getAllFaqs, getAllEmergencyContacts, GOVT_SCHEMES, SAFETY_GUIDES } from '@/lib/awarenessServer';
import { slugifyArea, getAllPowerCutAreaStaticParams } from '@/lib/powerCutAreas';

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
  //     Only emit City × Issue pairs with active DB reports to prevent thin content.
  const ISSUE_SLUGS = [
    'power-cut', 'water-issue', 'road-problem', 'scam',
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

  // Level 3: City × Issue pages — only output pairs with active DB reports
  DISTRICTS.forEach(city => {
    ISSUE_SLUGS.forEach(issue => {
      if (!CATEGORY_MAP[issue]) return;
      if (!issueDates.has(`${city.slug}:${issue}`)) return;
      const lastModified = issueDates.get(`${city.slug}:${issue}`);
      entries.push({
        url: `${SITE_URL}/${city.slug}/${issue}`,
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
        lastModified: a.updated_date || a.publish_date ? new Date(a.updated_date || a.publish_date) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    publishedCategories.forEach(category => {
      entries.push({
        url: `${SITE_URL}/tn-today/category/${category}`,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });
  } catch (e) {
    console.warn('[sitemap] Failed to fetch articles:', e.message);
  }

  try {
    const supabase = createServerSupabase();
    if (!supabase) throw new Error('Supabase is not configured');
    // ── Posts (Civic Reports & Community Updates) ────────────────────────
    const { data: publicPosts } = await supabase
      .from('post')
      .select('slug, id, updated_date, created_date, is_publicly_visible, moderation_status, category_slug')
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
          priority: 0.8,
        });
      }
    });

    const portals = typeof getAllPortals === 'function' ? getAllPortals() : [];
    (portals || []).forEach(p => {
      if (p.slug) {
        entries.push({
          url: `${SITE_URL}/awareness/portal/${p.slug}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });

    const faqs = typeof getAllFaqs === 'function' ? getAllFaqs() : [];
    (faqs || []).forEach(f => {
      if (f.slug) {
        entries.push({
          url: `${SITE_URL}/awareness/faq/${f.slug}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });

    const emergencies = typeof getAllEmergencyContacts === 'function' ? getAllEmergencyContacts() : [];
    (emergencies || []).forEach(e => {
      if (e.slug) {
        entries.push({
          url: `${SITE_URL}/awareness/emergency/${e.slug}`,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  } catch (e) {
    console.warn('[sitemap] Awareness detail pages fetch failed:', e.message);
  }

  [
    '/power-cuts-today-tamil-nadu', '/school-college-holiday-alerts',
    '/schemes', '/helplines', '/rights', '/rti', '/esevai',
    '/scams', '/trending'
  ].forEach(path => {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path.includes('power-cuts') || path.includes('holiday') ? 'hourly' : 'daily',
      priority: path.includes('power-cuts') || path.includes('holiday') ? 1.0 : 0.9,
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

  // Programmatic Localities / Substation Landing Pages (pSEO High-Intent Engine)
  const allPowerCutAreas = getAllPowerCutAreaStaticParams();
  allPowerCutAreas.forEach(({ district, area }) => {
    entries.push({
      url: `${SITE_URL}/power-cuts-today-tamil-nadu/${district}/${area}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.85,
    });
  });

  [
    '/districts', '/areas', '/awareness', '/awareness/articles',
    '/awareness/emergency', '/awareness/faqs', '/awareness/guides', '/awareness/portals',
    '/scams', '/trending', '/tn-today',
    '/explore', '/help', '/support',
    '/about', '/press', '/contact', '/privacy-policy', '/terms', '/how-to-use',
    '/disclaimer', '/cookie-policy',
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
