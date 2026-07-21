import { createServerSupabase } from '@/lib/serverSupabase';
import sanitizeHtml from 'sanitize-html';

const ARTICLE_FIELDS = [
  'id', 'title', 'slug', 'subtitle', 'featured_image', 'category',
  'author_name', 'publish_date', 'reading_time', 'summary',
  'is_featured', 'view_count',
].join(',');

export async function getTnTodayArchive(category = null) {
  const supabase = createServerSupabase();
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
      .limit(50);

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
  const supabase = createServerSupabase();
  if (!supabase || !slug) return { article: null, relatedArticles: [] };

  try {
    const { data: article, error } = await supabase
      .from('tn_today')
      .select('*')
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
    return { article: null, relatedArticles: [] };
  }
}
