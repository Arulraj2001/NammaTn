import { createServerSupabase } from '@/lib/serverSupabase';

// featured_image is intentionally excluded from the server-side list select.
// It stores base64 image data (~200KB/row), making 50 rows = ~10MB which
// exceeds Next.js's 2MB incremental cache limit and breaks SSR.
// The client-side getPublishedTnToday query still includes it for card thumbnails.
const ARTICLE_FIELDS = [
  'id', 'title', 'title_ta', 'slug', 'subtitle', 'subtitle_ta', 'featured_image', 'category',
  'author_name', 'publish_date', 'reading_time', 'summary',
  'is_featured', 'view_count',
].join(',');

const ARTICLE_DETAIL_FIELDS = [
  'id', 'title', 'title_ta', 'slug', 'subtitle', 'subtitle_ta', 'featured_image', 'social_image', 'category',
  'author_name', 'publish_date', 'status', 'reading_time',
  'content', 'content_ta', 'summary', 'summary_ta',
  'why_it_matters', 'why_it_matters_ta',
  'key_facts', 'key_facts_ta', 'timeline', 'timeline_ta',
  'official_sources', 'related_civic_links',
  'seo_title', 'seo_description', 'seo_keywords', 'canonical_url',
  'is_featured', 'view_count', 'created_date', 'updated_date',
  'district_slug', 'district_name',
].join(',');

// In-memory cache to deduplicate parallel requests (e.g. generateMetadata and Page)
const articleCache = new Map();

export async function getTnTodayArchive(category = null) {
  const supabase = createServerSupabase({ timeoutMs: 10000 });
  if (!supabase) {
    console.warn('[tn-today] Supabase environment variables are unavailable');
    return { articles: [], featured: null };
  }

  try {
    let query = supabase
      .from('tn_today')
      .select(ARTICLE_FIELDS)
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(20);

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    const articles = data || [];
    const featured = articles.find(article => article.is_featured) || articles[0] || null;
    return { articles, featured };
  } catch (error) {
    console.warn('[tn-today] Server archive fetch failed:', error.message);
    return { articles: [], featured: null };
  }
}

export async function getTnTodayArticle(slug) {
  if (!slug) return { article: null, relatedArticles: [] };

  if (articleCache.has(slug)) {
    return articleCache.get(slug);
  }

  const supabase = createServerSupabase({ timeoutMs: 10000 });
  if (!supabase) {
    console.warn('[tn-today] Supabase is not configured');
    return { article: null, relatedArticles: [] };
  }

  try {
    const { data: rawArticle, error } = await supabase
      .from('tn_today')
      .select(ARTICLE_DETAIL_FIELDS)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.warn(`[tn-today:${slug}] Fetch query error:`, error.message);
      return { article: null, relatedArticles: [] };
    }
    if (!rawArticle) return { article: null, relatedArticles: [] };

    // Prevent oversized base64 images (>500KB) from breaking Next.js 2MB page data cache
    const article = { ...rawArticle };
    if (article.featured_image && article.featured_image.startsWith('data:') && article.featured_image.length > 500000) {
      article.featured_image = null;
    }

    let related = [];
    try {
      const { data, error: relError } = await supabase
        .from('tn_today')
        .select(ARTICLE_FIELDS)
        .eq('status', 'published')
        .eq('category', article.category)
        .neq('slug', slug)
        .order('publish_date', { ascending: false })
        .limit(3);

      if (!relError && data) related = data;
    } catch {
      // Non-fatal: related articles should never break main article rendering
    }

    const result = {
      article,
      relatedArticles: related,
    };

    articleCache.set(slug, result);
    return result;
  } catch (error) {
    console.warn(`[tn-today:${slug}] Server article fetch error:`, error.message);
    return { article: null, relatedArticles: [] };
  }
}
