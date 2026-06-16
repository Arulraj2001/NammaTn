import { supabase } from "@/api/supabaseClient";

export const getActiveSituations = async (limit = 30) => {
  const { data, error } = await supabase
    .from("situation_update")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getSituationsByDistrict = async (districtSlug, limit = 20) => {
  const { data, error } = await supabase
    .from("situation_update")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const createSituation = async (data) => {
  const { data: created, error } = await supabase
    .from("situation_update")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const confirmSituation = async (id, currentCount) => {
  const { data, error } = await supabase
    .from("situation_update")
    .update({ confirm_count: (currentCount || 0) + 1 })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const resolveSituation = async (id) => {
  const { data, error } = await supabase
    .from("situation_update")
    .update({ is_resolved: true, status: "resolved" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const verifySituation = async (id) => {
  const { data, error } = await supabase
    .from("situation_update")
    .update({ is_verified: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};