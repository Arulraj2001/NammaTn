import { supabase } from "@/api/supabaseClient";
import { isPubliclyVisible } from "@/lib/visibility";

const normalizePostPageArgs = (limitOrOptions = 20, sort = "-created_date", cursor = null) => {
  if (typeof limitOrOptions === "object" && limitOrOptions !== null) {
    return {
      limit: limitOrOptions.limit ?? 20,
      sort: limitOrOptions.sort ?? "-created_date",
      cursor: limitOrOptions.cursor ?? null,
    };
  }

  return { limit: limitOrOptions, sort, cursor };
};

const fetchVisiblePostPage = async ({ limit, cursor = null, filter = isPubliclyVisible, configure }) => {
  const page = [];
  let nextCursor = cursor;
  let exhausted = false;
  let scans = 0;
  const scanLimit = Math.max(limit * 2, limit);

  while (page.length < limit && !exhausted && scans < 5) {
    let query = supabase
      .from("unified_explore_feed")
      .select("*")
      .order("created_date", { ascending: false })
      .limit(scanLimit);

    if (nextCursor) {
      query = query.lt("created_date", nextCursor);
    }

    if (configure) {
      query = configure(query);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    if (rows.length === 0) break;

    page.push(...rows.filter(filter));
    nextCursor = rows[rows.length - 1]?.created_date || nextCursor;
    exhausted = rows.length < scanLimit;
    scans += 1;
  }

  return page.slice(0, limit);
};

export const createPost = async (data) => {
  const { data: created, error } = await supabase
    .from("post")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const getAllPosts = async (limitOrOptions = 20, sort = "-created_date", cursor = null) => {
  const { limit, sort: resolvedSort, cursor: pageCursor } = normalizePostPageArgs(limitOrOptions, sort, cursor);
  const orderCol = pageCursor ? "created_date" : resolvedSort.startsWith("-") ? resolvedSort.substring(1) : resolvedSort;
  const ascending = pageCursor ? false : !resolvedSort.startsWith("-");
  let query = supabase
    .from("unified_explore_feed")
    .select("*")
    .order(orderCol, { ascending })
    .limit(limit);

  if (pageCursor) {
    query = query.lt("created_date", pageCursor);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getPosts = async (limit = 20, sort = "-created_date") => {
  const orderCol = sort.startsWith("-") ? sort.substring(1) : sort;
  const ascending = !sort.startsWith("-");
  const { data, error } = await supabase
    .from("unified_explore_feed")
    .select("*")
    .order(orderCol, { ascending })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getPostById = async (id) => {
  if (!id) return null;
  // Detail views must query the raw post table to ensure it gets all post-specific columns correctly
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  return data[0] || null;
};

export const getActivePosts = async (limitOrOptions = 20, sort = "-created_date", cursor = null) => {
  const { limit, sort: resolvedSort, cursor: pageCursor } = normalizePostPageArgs(limitOrOptions, sort, cursor);

  if (pageCursor || resolvedSort === "-created_date") {
    return fetchVisiblePostPage({
      limit,
      cursor: pageCursor,
      configure: (query) => query.eq("status", "active"),
    });
  }

  const orderCol = resolvedSort.startsWith("-") ? resolvedSort.substring(1) : resolvedSort;
  const ascending = !resolvedSort.startsWith("-");
  const { data, error } = await supabase
    .from("unified_explore_feed")
    .select("*")
    .eq("status", "active")
    .order(orderCol, { ascending })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter(isPubliclyVisible).slice(0, limit);
};

export const getActiveCivicPosts = async (limitOrOptions = 20, sort = "-created_date", cursor = null) => {
  const { limit, sort: resolvedSort, cursor: pageCursor } = normalizePostPageArgs(limitOrOptions, sort, cursor);

  if (pageCursor || resolvedSort === "-created_date") {
    return fetchVisiblePostPage({
      limit,
      cursor: pageCursor,
      configure: (query) => query.eq("status", "active"),
      filter: (p) => p.civic_receipt_id && isPubliclyVisible(p),
    });
  }

  const orderCol = resolvedSort.startsWith("-") ? resolvedSort.substring(1) : resolvedSort;
  const ascending = !resolvedSort.startsWith("-");
  const { data, error } = await supabase
    .from("unified_explore_feed")
    .select("*")
    .eq("status", "active")
    .order(orderCol, { ascending })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter((p) => p.civic_receipt_id && isPubliclyVisible(p)).slice(0, limit);
};

export const getDistrictPosts = async (districtSlug, limit = 30) => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter(isPubliclyVisible).slice(0, limit);
};

export const getDistrictCivicPosts = async (districtSlug, limit = 50) => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("status", "active")
    .eq("post_type", "complaint")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter((p) => p.civic_receipt_id && isPubliclyVisible(p)).slice(0, limit);
};

export const getAreaCivicPosts = async (areaSlug, limit = 50) => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("area_slug", areaSlug)
    .eq("status", "active")
    .eq("post_type", "complaint")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter((p) => p.civic_receipt_id && isPubliclyVisible(p)).slice(0, limit);
};

export const getCategoryPosts = async (categorySlug, limit = 20) => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("category_slug", categorySlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter(isPubliclyVisible).slice(0, limit);
};

export const getPostsByType = async (postType, limit = 20) => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("post_type", postType)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter(isPubliclyVisible).slice(0, limit);
};

export const getCommunityWins = async (limit = 100) => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("status", "active")
    .in("civic_status", ["citizen_verified_fixed", "resolved"])
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.filter(isPubliclyVisible);
};

export const updatePostReactions = async (id, upvotes, downvotes) => {
  const { data, error } = await supabase
    .from("post")
    .update({ upvotes, downvotes })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCommentCount = async (id, comment_count) => {
  // Handled automatically by database trigger on comment table
  return { id, comment_count };
};
