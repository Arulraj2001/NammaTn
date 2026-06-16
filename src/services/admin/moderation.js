import { supabase } from "@/api/supabaseClient";

/** Create a moderation log entry */
export const logModerationAction = async ({ target_type, target_id, action, note = "", admin_email = "admin" }) => {
  const { data: created, error } = await supabase
    .from("moderation_log")
    .insert({
      target_type,
      target_id,
      action,
      note,
      admin_email,
    })
    .select()
    .single();
  if (error) throw error;
  return created;
};

/** Get recent moderation logs, sorted by newest */
export const getModerationLogs = async (limit = 20) => {
  const { data, error } = await supabase
    .from("moderation_log")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

/** Get logs for a specific target */
export const getLogsForTarget = async (target_id) => {
  const { data, error } = await supabase
    .from("moderation_log")
    .select("*")
    .eq("target_id", target_id)
    .order("created_date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
};

/** Get logs filtered by action type */
export const getLogsByAction = async (action, limit = 50) => {
  const { data, error } = await supabase
    .from("moderation_log")
    .select("*")
    .eq("action", action)
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

/** Get logs for a specific admin */
export const getLogsByAdmin = async (admin_email, limit = 50) => {
  const { data, error } = await supabase
    .from("moderation_log")
    .select("*")
    .eq("admin_email", admin_email)
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

/**
 * Bulk moderate posts — apply action to array of post IDs.
 * Returns { succeeded: string[], failed: string[] }
 */
export const bulkModeratePost = async (ids, status, admin_email = "admin", note = "") => {
  const succeeded = [];
  const failed = [];
  for (const id of ids) {
    try {
      const { error } = await supabase
        .from("post")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      await logModerationAction({ target_type: "post", target_id: id, action: status === "removed" ? "deleted" : status === "flagged" ? "flagged" : "approved", note, admin_email });
      succeeded.push(id);
    } catch {
      failed.push(id);
    }
  }
  return { succeeded, failed };
};

/**
 * Bulk moderate comments.
 */
export const bulkModerateComment = async (ids, status, admin_email = "admin", note = "") => {
  const succeeded = [];
  const failed = [];
  for (const id of ids) {
    try {
      const { error } = await supabase
        .from("comment")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      await logModerationAction({ target_type: "comment", target_id: id, action: status === "removed" ? "deleted" : "flagged", note, admin_email });
      succeeded.push(id);
    } catch {
      failed.push(id);
    }
  }
  return { succeeded, failed };
};