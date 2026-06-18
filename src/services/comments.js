import { supabase } from "@/api/supabaseClient";

/** Fetch only visible comments for a post (excludes hidden/removed) */
export const getCommentsByPost = async (postId) => {
  const { data, error } = await supabase
    .from("comment")
    .select("*")
    .eq("post_id", postId)
    .order("created_date", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data.filter((c) => c.status === "active" || c.status === "flagged");
};

/** Fetch all comments for a post including hidden — admin only */
export const getCommentsByPostAdmin = async (postId) => {
  const { data, error } = await supabase
    .from("comment")
    .select("*")
    .eq("post_id", postId)
    .order("created_date", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data;
};

export const getReplies = async (parentCommentId) => {
  const { data, error } = await supabase
    .from("comment")
    .select("*")
    .eq("parent_comment_id", parentCommentId)
    .order("created_date", { ascending: true })
    .limit(50);
  if (error) throw error;
  return data.filter((c) => c.status === "active" || c.status === "flagged");
};

export const createComment = async (data) => {
  const { data: created, error } = await supabase
    .from("comment")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const upvoteComment = async (id, currentUpvotes) => {
  const { data, error } = await supabase
    .from("comment")
    .update({ upvotes: currentUpvotes + 1 })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Admin: hide a comment */
export const hideComment = async (id, hiddenBy, hiddenReason = "") => {
  const { data, error } = await supabase
    .from("comment")
    .update({
      status: "hidden",
      hidden_by: hiddenBy,
      hidden_reason: hiddenReason
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Admin: restore a hidden comment */
export const restoreComment = async (id) => {
  const { data, error } = await supabase
    .from("comment")
    .update({
      status: "active",
      hidden_by: null,
      hidden_reason: null
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Admin: permanently remove a comment */
export const deleteComment = async (id) => {
  const { data, error } = await supabase
    .from("comment")
    .update({ status: "removed" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Increment report_count and flag comment when threshold is reached */
export const flagCommentReported = async (id, currentCount) => {
  const newCount = (currentCount || 0) + 1;
  // is_pending_review does NOT exist in the comment table.
  // Use status="flagged" instead when report threshold is hit.
  const update = { report_count: newCount };
  if (newCount >= 3) update.status = "flagged";

  const { data, error } = await supabase
    .from("comment")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};