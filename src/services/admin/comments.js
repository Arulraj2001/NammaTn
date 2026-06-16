import { supabase } from "@/api/supabaseClient";

export const getAllComments = async (limit = 100) => {
  const { data, error } = await supabase
    .from("comment")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getFlaggedComments = async (limit = 100) => {
  const { data, error } = await supabase
    .from("comment")
    .select("*")
    .eq("status", "flagged")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateCommentStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("comment")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteComment = async (id) => {
  const { data, error } = await supabase
    .from("comment")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};