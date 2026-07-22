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

const SITE_URL = 'https://www.vizhitn.in';

export default async function sitemap() {
  const entries = [];

  // ── Level 1: Homepage ─────────────────────────────────────────────────────
  entries.push({
    url: `${SITE_URL}/`,
    changeFrequency: 'hourly',
    priority: 1.0,
  });

  // ── Level 2: City hub pages (all 38 — hubs have editorial value regardless of post count) ──
  DISTRICTS.forEach(city => {
    entries.push({
      url: `${SITE_URL}/${city.slug}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  });

  // ── Level 3: City × Issue pages — ONLY those with ≥1 active report ────────
  try {
    const supabase = createServerSupabase();
    if (!supabase) throw new Error('Supabase is not configured');

    // Fetch distinct (district_slug, category_slug) pairs with active posts
    const { data: activePairs, error } = await supabase
      .from('post')
      .select('district_slug, category_slug, created_date, updated_date')
      .eq('status', 'active')
      .not('district_slug', 'is', null)
      .not('category_slug', 'is', null);

    if (error) throw error;

    const pairDates = new Map();
    (activePairs || []).forEach(p => {
      const key = `${p.district_slug}:${p.category_slug}`;
      if (
        DISTRICT_MAP[p.district_slug] &&
        CATEGORY_MAP[p.category_slug]
      ) {
        const changedAt = p.updated_date || p.created_date;
        const current = pairDates.get(key);
        if (!current || (changedAt && new Date(changedAt) > new Date(current))) {
          pairDates.set(key, changedAt || null);
        }
      }
    });

    pairDates.forEach((lastModified, key) => {
      const [districtSlug, categorySlug] = key.split(':');
      entries.push({
        url: `${SITE_URL}/${districtSlug}/${categorySlug}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });
  } catch (e) {
    // Do not manufacture indexable city/category URLs without report evidence.
    // Existing URLs remain crawlable; they are simply omitted from this sitemap
    // until the data source is available again.
    console.warn('[sitemap] DB unavailable — omitting unverified city/issue pairs:', e.message);
  }

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
        changeFrequency: 'weekly',
        priority: 0.6,
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
    console.warn('[sitemap] TN Today fetch failed:', e.message);
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

  [
    '/districts', '/areas', '/awareness', '/awareness/emergency',
    '/awareness/faqs', '/awareness/guides', '/awareness/portals',
    '/awareness/schemes', '/community', '/community/wins', '/scams',
    '/jobs', '/stay', '/offices', '/bribes', '/trending', '/tn-today',
    '/explore', '/help', '/situations', '/ask', '/leaderboard', '/listings',
    '/support', '/rwa', '/csr',
    '/about', '/contact', '/privacy-policy', '/terms', '/how-to-use',
  ].forEach(path => {
    entries.push({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}
