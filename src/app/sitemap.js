// Next.js App Router dynamic sitemap — auto-served at /sitemap.xml
// Fetches real content from Supabase so Google discovers all pages.
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.vizhitn.in';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
  );
}

export default async function sitemap() {
  const supabase = getSupabase();
  const entries = [];

  // ── 1. Static shell pages (app routes) ──────────────────────────────────────
  const staticPages = [
    { url: '/',                     priority: 1.0,  changeFrequency: 'hourly'  },
    { url: '/explore',              priority: 0.95, changeFrequency: 'hourly'  },
    { url: '/community',            priority: 0.95, changeFrequency: 'hourly'  },
    { url: '/trending',             priority: 0.9,  changeFrequency: 'hourly'  },
    { url: '/bribes',               priority: 0.9,  changeFrequency: 'hourly'  },
    { url: '/tn-today',             priority: 0.9,  changeFrequency: 'hourly'  },
    { url: '/districts',            priority: 0.85, changeFrequency: 'daily'   },
    { url: '/areas',                priority: 0.8,  changeFrequency: 'daily'   },
    { url: '/create',               priority: 0.85, changeFrequency: 'always'  },
    { url: '/situations',           priority: 0.8,  changeFrequency: 'hourly'  },
    { url: '/scams',                priority: 0.75, changeFrequency: 'daily'   },
    { url: '/community/wins',       priority: 0.8,  changeFrequency: 'daily'   },
    { url: '/awareness',            priority: 0.8,  changeFrequency: 'weekly'  },
    { url: '/awareness/schemes',    priority: 0.75, changeFrequency: 'weekly'  },
    { url: '/awareness/portals',    priority: 0.7,  changeFrequency: 'weekly'  },
    { url: '/awareness/guides',     priority: 0.7,  changeFrequency: 'weekly'  },
    { url: '/awareness/faqs',       priority: 0.65, changeFrequency: 'weekly'  },
    { url: '/awareness/emergency',  priority: 0.8,  changeFrequency: 'monthly' },
    { url: '/offices',              priority: 0.7,  changeFrequency: 'weekly'  },
    { url: '/listings',             priority: 0.7,  changeFrequency: 'daily'   },
    { url: '/jobs',                 priority: 0.65, changeFrequency: 'daily'   },
    { url: '/stay',                 priority: 0.6,  changeFrequency: 'daily'   },
    { url: '/leaderboard',          priority: 0.65, changeFrequency: 'daily'   },
    { url: '/ask',                  priority: 0.7,  changeFrequency: 'always'  },
    { url: '/rwa',                  priority: 0.75, changeFrequency: 'daily'   },
    { url: '/csr',                  priority: 0.75, changeFrequency: 'daily'   },
    { url: '/how-to-use',           priority: 0.9,  changeFrequency: 'daily'   },
    { url: '/about',                priority: 0.7,  changeFrequency: 'monthly', lastModified: '2025-06-01' },
    { url: '/contact',              priority: 0.5,  changeFrequency: 'monthly' },
    { url: '/help',                 priority: 0.5,  changeFrequency: 'monthly' },
    { url: '/support',              priority: 0.5,  changeFrequency: 'monthly' },
    { url: '/privacy-policy',       priority: 0.6,  changeFrequency: 'monthly', lastModified: '2025-06-01' },
    { url: '/terms',                priority: 0.6,  changeFrequency: 'monthly', lastModified: '2025-06-01' },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.url}`,
      lastModified: page.lastModified ? new Date(page.lastModified) : new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // ── 2. TN Today articles (highest value SEO content) ────────────────────────
  try {
    const { data: articles } = await supabase
      .from('tn_today')
      .select('slug, publish_date, updated_date, category')
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(500);

    if (articles) {
      for (const a of articles) {
        entries.push({
          url: `${SITE_URL}/tn-today/${a.slug}`,
          lastModified: new Date(a.updated_date || a.publish_date),
          changeFrequency: 'weekly',
          priority: 0.85,
        });
        // Category archive page
        if (a.category) {
          entries.push({
            url: `${SITE_URL}/tn-today/category/${a.category}`,
            lastModified: new Date(a.publish_date),
            changeFrequency: 'daily',
            priority: 0.75,
          });
        }
      }
    }
  } catch (e) {
    // Silently skip if DB unreachable during build
    console.warn('[sitemap] Could not fetch tn_today:', e.message);
  }

  // ── 3. Civic posts (the user-generated content goldmine) ────────────────────
  try {
    const { data: posts } = await supabase
      .from('post')
      .select('id, created_date, district_slug, area_slug, category_slug, post_type, status')
      .eq('status', 'active')
      .not('title', 'is', null)
      .order('created_date', { ascending: false })
      .limit(2000); // Top 2000 most recent posts

    if (posts) {
      const seenDistricts = new Set();
      const seenAreas = new Set();
      const seenCategories = new Set();

      for (const p of posts) {
        // Individual post page
        entries.push({
          url: `${SITE_URL}/post/${p.id}`,
          lastModified: new Date(p.created_date),
          changeFrequency: 'weekly',
          priority: 0.6,
        });

        // Collect unique district/area/category slugs for their hub pages
        if (p.district_slug) seenDistricts.add(p.district_slug);
        if (p.area_slug) seenAreas.add(p.area_slug);
        if (p.category_slug) seenCategories.add(p.category_slug);
      }

      // District hub pages
      for (const slug of seenDistricts) {
        entries.push({
          url: `${SITE_URL}/district/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'hourly',
          priority: 0.8,
        });
      }

      // Area hub pages
      for (const slug of seenAreas) {
        entries.push({
          url: `${SITE_URL}/area/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'hourly',
          priority: 0.75,
        });
      }

      // Category hub pages
      for (const slug of seenCategories) {
        entries.push({
          url: `${SITE_URL}/category/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'hourly',
          priority: 0.7,
        });
      }
    }
  } catch (e) {
    console.warn('[sitemap] Could not fetch posts:', e.message);
  }

  // Deduplicate by URL (category pages can appear multiple times)
  const seen = new Set();
  return entries.filter(e => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
