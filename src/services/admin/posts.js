import { supabase } from "@/api/supabaseClient";

const normalizePostPageArgs = (limitOrOptions = 100, sort = "-created_date", cursor = null) => {
  if (typeof limitOrOptions === "object" && limitOrOptions !== null) {
    return {
      limit: limitOrOptions.limit ?? 100,
      sort: limitOrOptions.sort ?? "-created_date",
      cursor: limitOrOptions.cursor ?? null,
    };
  }

  return { limit: limitOrOptions, sort, cursor };
};

export const getDashboardStats = async () => {
  const { data: all, error } = await supabase
    .from("post")
    .select("status")
    .limit(1000);
  if (error) throw error;

  return {
    total: all.length,
    active: all.filter((p) => p.status === "active").length,
    flagged: all.filter((p) => p.status === "flagged").length,
    removed: all.filter((p) => p.status === "removed").length,
  };
};

export const getAllPosts = async (limitOrOptions = 100, sort = "-created_date", cursor = null) => {
  const { limit, sort: resolvedSort, cursor: pageCursor } = normalizePostPageArgs(limitOrOptions, sort, cursor);
  const orderCol = pageCursor ? "created_date" : resolvedSort.startsWith("-") ? resolvedSort.substring(1) : resolvedSort;
  const ascending = pageCursor ? false : !resolvedSort.startsWith("-");
  let query = supabase
    .from("post")
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

export const getPostsByStatus = async (status, limit = 100) => {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("status", status)
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updatePostStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("post")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePost = async (id) => {
  const { data, error } = await supabase
    .from("post")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const searchPosts = async (query, limit = 50) => {
  // Try using PostgreSQL ILIKE search directly for efficiency
  const q = `%${query}%`;
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .or(`title_en.ilike.${q},content_en.ilike.${q},district_name.ilike.${q},category_name.ilike.${q}`)
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};
