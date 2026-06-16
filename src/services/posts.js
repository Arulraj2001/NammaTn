import { supabase } from "@/api/supabaseClient";
import { isPubliclyVisible } from "@/lib/visibility";

export const createPost = async (data) => {
  const { data: created, error } = await supabase
    .from("post")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const getPosts = async (limit = 20, sort = "-created_date") => {
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

export const getPostById = async (id) => {
  if (!id) return null;
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  return data[0] || null;
};

export const getActivePosts = async (limit = 20, sort = "-created_date") => {
  const orderCol = sort.startsWith("-") ? sort.substring(1) : sort;
  const ascending = !sort.startsWith("-");
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("status", "active")
    .order(orderCol, { ascending })
    .limit(limit * 2);
  if (error) throw error;
  return data.filter(isPubliclyVisible).slice(0, limit);
};

export const getActiveCivicPosts = async (limit = 20, sort = "-created_date") => {
  const orderCol = sort.startsWith("-") ? sort.substring(1) : sort;
  const ascending = !sort.startsWith("-");
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .eq("status", "active")
    .eq("post_type", "complaint")
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