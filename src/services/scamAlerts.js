import { supabase } from "@/api/supabaseClient";

export const getActiveScams = async (limit = 20) => {
  const { data, error } = await supabase
    .from("scam_alert")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getScamsByDistrict = async (districtSlug, limit = 20) => {
  const { data, error } = await supabase
    .from("scam_alert")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const createScamAlert = async (data) => {
  const { data: created, error } = await supabase
    .from("scam_alert")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const confirmScam = async (id, currentCount) => {
  const { data, error } = await supabase
    .from("scam_alert")
    .update({ confirm_count: (currentCount || 0) + 1 })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAllScamsAdmin = async (limit = 50) => {
  const { data, error } = await supabase
    .from("scam_alert")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateScam = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("scam_alert")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteScam = async (id) => {
  const { data, error } = await supabase
    .from("scam_alert")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};