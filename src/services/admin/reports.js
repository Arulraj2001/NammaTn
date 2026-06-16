import { supabase } from "@/api/supabaseClient";
import { getSessionId } from "@/lib/security";

/**
 * Create a new report. Automatically flags the target post if report threshold is reached.
 */
export const createReport = async ({ target_type, target_id, reason, details = "", reporter_session }) => {
  const { data: report, error } = await supabase
    .from("report")
    .insert({
      target_type,
      target_id,
      reason,
      details,
      reporter_session: reporter_session || getSessionId(),
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;

  // Auto-flag post if it hits the threshold (3+ pending reports)
  if (target_type === "post") {
    const { data: existing, error: errExist } = await supabase
      .from("report")
      .select("id")
      .eq("target_id", target_id)
      .eq("status", "pending")
      .limit(20);
      
    if (!errExist && existing.length >= 3) {
      // Flag post for review if not already flagged/removed — check by id directly
      const { data: posts, error: errPost } = await supabase
        .from("post")
        .select("status")
        .eq("id", target_id)
        .eq("status", "active")
        .limit(1);
        
      if (!errPost && posts.length > 0) {
        await supabase
          .from("post")
          .update({ status: "flagged" })
          .eq("id", target_id);
      }
    }
  }

  return report;
};

export const getPendingReports = async (limit = 50) => {
  const { data, error } = await supabase
    .from("report")
    .select("*")
    .eq("status", "pending")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getAllReports = async (limit = 100) => {
  const { data, error } = await supabase
    .from("report")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateReportStatus = async (id, status, reviewed_note = "") => {
  const { data, error } = await supabase
    .from("report")
    .update({ status, reviewed_note })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Get reports for a specific target */
export const getReportsForTarget = async (target_id) => {
  const { data, error } = await supabase
    .from("report")
    .select("*")
    .eq("target_id", target_id)
    .order("created_date", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
};

/** Count reports by target_id — returns number */
export const countReportsForTarget = async (target_id) => {
  const { data, error } = await supabase
    .from("report")
    .select("id")
    .eq("target_id", target_id)
    .eq("status", "pending")
    .limit(100);
  if (error) return 0;
  return data.length;
};