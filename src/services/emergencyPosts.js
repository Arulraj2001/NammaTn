import { supabase } from "@/api/supabaseClient";

export const getActiveEmergencies = async (limit = 20) => {
  const { data, error } = await supabase
    .from("emergency_post")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getEmergenciesByDistrict = async (districtSlug, limit = 20) => {
  const { data, error } = await supabase
    .from("emergency_post")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const createEmergency = async (data) => {
  const { data: created, error } = await supabase
    .from("emergency_post")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const resolveEmergency = async (id) => {
  const { data, error } = await supabase
    .from("emergency_post")
    .update({ is_resolved: true, status: "resolved" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const confirmEmergency = async (id, currentCount) => {
  const { data, error } = await supabase
    .from("emergency_post")
    .update({ confirm_count: (currentCount || 0) + 1 })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAllEmergenciesAdmin = async (limit = 50) => {
  const { data, error } = await supabase
    .from("emergency_post")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateEmergency = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("emergency_post")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};