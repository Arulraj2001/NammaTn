import { supabase } from "@/api/supabaseClient";

const TABLE = "tn_today";

// Canonicals are derived from the published VizhiTN slug. Never persist an
// editorial override that could transfer ownership to another host or slug.
const withCanonicalOwnership = (payload) => ({ ...payload, canonical_url: null });

// ─── Public reads ─────────────────────────────────────────────────────────────

/** Get the featured (pinned) published article for homepage */
export const getFeaturedTnToday = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,title,slug,subtitle,featured_image,category,author_name,publish_date,reading_time,summary,is_featured")
    .eq("status", "published")
    .eq("is_featured", true)
    .order("publish_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

/** Get latest published articles for archive */
export const getPublishedTnToday = async ({ limit = 20, offset = 0, category = null } = {}) => {
  let q = supabase
    .from(TABLE)
    .select("id,title,slug,subtitle,featured_image,category,author_name,publish_date,reading_time,summary,is_featured,view_count")
    .eq("status", "published")
    .order("publish_date", { ascending: false })
    .range(offset, offset + limit - 1);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

/** Get full article by slug (public) */
export const getTnTodayBySlug = async (slug) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
};

/** Increment view count */
export const incrementTnTodayView = async (id) => {
  await supabase.rpc("increment_tn_today_view", { article_id: id }).catch(() => {
    // Fallback: direct update (may fail with RLS if using public anon)
  });
};

// ─── Admin reads ──────────────────────────────────────────────────────────────

/** List all articles for admin CMS (all statuses) */
export const adminListTnToday = async ({ limit = 50, offset = 0, status = null } = {}) => {
  let q = supabase
    .from(TABLE)
    .select("*")
    .order("created_date", { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
};

/** Get single article by ID for admin editing */
export const adminGetTnTodayById = async (id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

// ─── Admin writes ─────────────────────────────────────────────────────────────

/** Create a new article */
export const createTnToday = async (payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(withCanonicalOwnership(payload))
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Update an existing article */
export const updateTnToday = async (id, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...withCanonicalOwnership(payload), updated_date: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Delete an article */
export const deleteTnToday = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
};

/** Generate a URL-safe slug from title */
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80);
};

/** Estimate reading time from HTML content */
export const estimateReadingTime = (htmlContent) => {
  const text = htmlContent?.replace(/<[^>]*>/g, "") || "";
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
