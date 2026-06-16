import { supabase } from "@/api/supabaseClient";

export const getAreas = async (limit = 50) => {
  const { data, error } = await supabase
    .from("area")
    .select("*")
    .eq("active", true)
    .order("name_en", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getAreasByDistrict = async (districtSlug) => {
  const { data, error } = await supabase
    .from("area")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("active", true)
    .order("name_en", { ascending: true })
    .limit(50);
  if (error) throw error;
  return data;
};

export const getAreaBySlug = async (slug) => {
  const { data, error } = await supabase
    .from("area")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .limit(1);
  if (error) throw error;
  return data[0] || null;
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