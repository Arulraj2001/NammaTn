import { supabase } from "@/api/supabaseClient";

const getSessionId = () => {
  let sid = localStorage.getItem("tn_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("tn_session_id", sid);
  }
  return sid;
};

export const hasConfirmed = async (targetType, targetId) => {
  const sessionId = getSessionId();
  const { data, error } = await supabase
    .from("community_confirmation")
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("session_id", sessionId)
    .limit(1);
  if (error) return false;
  return data.length > 0;
};

export const confirmItem = async (targetType, targetId, districtSlug) => {
  const sessionId = getSessionId();
  const already = await hasConfirmed(targetType, targetId);
  if (already) return false;

  const { error } = await supabase
    .from("community_confirmation")
    .insert({
      target_type: targetType,
      target_id: targetId,
      session_id: sessionId,
      district_slug: districtSlug,
    });
  if (error) throw error;
  return true;
};