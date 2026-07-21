import { createServerSupabase } from '@/lib/serverSupabase';

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
