import { supabase } from "@/api/supabaseClient";

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

export const getAllPosts = async (limit = 100, sort = "-created_date") => {
  const orderCol = sort.startsWith("-") ? sort.substring(1) : sort;
  const ascending = !sort.startsWith("-");
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .order(orderCol, { ascending })
    .limit(limit);
  if (error) throw error;
  return data;
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