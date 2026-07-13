// src/app/sitemap.js
// FIX 3 & 9: Only includes /[city]/[issue]/ URLs with ≥1 active report in DB.
// Fallback to Tier 1 static pairs if DB is unreachable.
// SEO PHASE 1: Also includes /tn-today/[slug] article URLs.

import { createClient } from '@supabase/supabase-js';
import { DISTRICTS, CATEGORIES, DISTRICT_MAP, CATEGORY_MAP } from '@/lib/seo-data';

const SITE_URL = 'https://www.vizhitn.in';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
  );
}

// Stable date: does not change within a given UTC day — prevents sitemap churn
const FALLBACK_DATE = '2026-06-30T00:00:00.000Z';

export default async function sitemap() {
  const entries = [];

  // ── Level 1: Homepage ─────────────────────────────────────────────────────
  entries.push({
    url: `${SITE_URL}/`,
    lastModified: FALLBACK_DATE,
    changeFrequency: 'hourly',
    priority: 1.0,
  });

  // ── Level 2: City hub pages (all 38 — hubs have editorial value regardless of post count) ──
  DISTRICTS.forEach(city => {
    entries.push({
      url: `${SITE_URL}/${city.slug}/`,
      lastModified: FALLBACK_DATE,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  });

  // ── Level 3: City × Issue pages — ONLY those with ≥1 active report ────────
  try {
    const supabase = getSupabase();

    // Fetch distinct (district_slug, category_slug) pairs with active posts
    const { data: activePairs, error } = await supabase
      .from('unified_explore_feed')
      .select('district_slug, category_slug, created_date, updated_date')
      .eq('status', 'active')
      .not('district_slug', 'is', null)
      .not('category_slug', 'is', null);

    if (error) throw error;

    const seen = new Set();
    (activePairs || []).forEach(p => {
      const key = `${p.district_slug}:${p.category_slug}`;
      if (
        !seen.has(key) &&
        DISTRICT_MAP[p.district_slug] &&
        CATEGORY_MAP[p.category_slug]
      ) {
        seen.add(key);
        entries.push({
          url: `${SITE_URL}/${p.district_slug}/${p.category_slug}/`,
          ...(p.updated_date || p.created_date ? { lastModified: p.updated_date || p.created_date } : {}),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      }
    });
  } catch (e) {
    console.warn('[sitemap] DB unavailable — falling back to Tier 1 static pairs:', e.message);
    // Fallback: 5 Tier 1 cities × all categories (30 URLs max — safe baseline)
    ['chennai', 'coimbatore', 'madurai', 'salem', 'tiruchirappalli'].forEach(city => {
      CATEGORIES.forEach(issue => {
        entries.push({
          url: `${SITE_URL}/${city}/${issue.slug}/`,
          lastModified: FALLBACK_DATE,
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    });
  }

  // ── TN Today articles (published) ──────────────────────────────────────
  try {
    const supabase = getSupabase();
    const { data: articles } = await supabase
      .from('tn_today')
      .select('slug, updated_date, publish_date')
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(500);

    (articles || []).forEach(a => {
      if (!a.slug) return;
      entries.push({
        url: `${SITE_URL}/tn-today/${a.slug}`,
        lastModified: a.updated_date || a.publish_date || TODAY,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  } catch (e) {
    console.warn('[sitemap] TN Today fetch failed:', e.message);
  }

  // ── Utility pages ───────────────────────────────────────────────────
  ['/about/', '/contact/', '/privacy-policy/', '/terms/', '/how-to-use/'].forEach(path => {
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: '2026-06-30T00:00:00.000Z',
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  return entries;
}
