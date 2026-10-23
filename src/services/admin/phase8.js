import { supabase } from "@/api/supabaseClient";

// Scams admin
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

// Emergency admin
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

// Recognitions admin
export const getAllRecognitions = async (limit = 50) => {
  const { data, error } = await supabase
    .from("recognition_log")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const createRecognition = async (data) => {
  const { data: created, error } = await supabase
    .from("recognition_log")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const updateRecognition = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("recognition_log")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const revokeRecognition = async (id) => {
  const { data, error } = await supabase
    .from("recognition_log")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Areas admin
export const getAllAreasAdmin = async (limit = 100) => {
  const { data, error } = await supabase
    .from("area")
    .select("*")
    .order("name_en", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const createArea = async (data) => {
  const { data: created, error } = await supabase
    .from("area")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const updateArea = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("area")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteArea = async (id) => {
  const { data, error } = await supabase
    .from("area")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};