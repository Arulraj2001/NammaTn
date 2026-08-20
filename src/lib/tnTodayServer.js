import { createServerSupabase } from '@/lib/serverSupabase';
import sanitizeHtml from 'sanitize-html';

// featured_image is intentionally excluded from the server-side list select.
// It stores base64 image data (~200KB/row), making 50 rows = ~10MB which
// exceeds Next.js's 2MB incremental cache limit and breaks SSR.
// The client-side getPublishedTnToday query still includes it for card thumbnails.
const ARTICLE_FIELDS = [
  'id', 'title', 'title_ta', 'slug', 'subtitle', 'subtitle_ta', 'category',
  'author_name', 'publish_date', 'reading_time', 'summary',
  'is_featured', 'view_count',
].join(',');

// Detail query excludes the base64 image blob columns (featured_image and
// social_image both can hold a ~1.2MB PNG data URI). A single select('*') row
// then exceeds Next.js's 2MB incremental cache limit and breaks SSR. The
// detail view renders a generated poster when featured_image is absent, and
// page metadata falls back to the site OG image.
const ARTICLE_DETAIL_FIELDS = [
  'id', 'title', 'title_ta', 'slug', 'subtitle', 'subtitle_ta', 'category',
  'author_name', 'publish_date', 'status', 'reading_time',
  'content', 'content_ta', 'summary', 'summary_ta',
  'why_it_matters', 'why_it_matters_ta',
  'key_facts', 'key_facts_ta', 'timeline', 'timeline_ta',
  'official_sources', 'related_civic_links',
  'seo_title', 'seo_description', 'seo_keywords', 'canonical_url',
  'is_featured', 'view_count', 'created_date', 'updated_date',
  'district_slug', 'district_name',
].join(',');

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
  const supabase = createServerSupabase({ timeoutMs: 10000 });
  if (!slug) return { article: null, relatedArticles: [] };
  if (!supabase) throw new Error('Supabase is not configured');

  try {
    const { data: article, error } = await supabase
      .from('tn_today')
      .select(ARTICLE_DETAIL_FIELDS)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    if (!article) return { article: null, relatedArticles: [] };

    const { data: related, error: relatedError } = await supabase
      .from('tn_today')
      .select(ARTICLE_FIELDS)
      .eq('status', 'published')
      .eq('category', article.category)
      .neq('slug', slug)
      .order('publish_date', { ascending: false })
      .limit(3);
    if (relatedError) throw relatedError;

    return {
      article: {
        ...article,
        safe_content: sanitizeHtml(article.content || '', {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            a: ['href', 'name', 'target', 'rel'],
          },
          allowedSchemes: ['http', 'https', 'mailto', 'tel'],
          transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
          },
        }),
      },
      relatedArticles: related || [],
    };
  } catch (error) {
    console.warn(`[tn-today:${slug}] Server article fetch failed:`, error.message);
    throw error;
  }
}
