import { supabase } from "@/api/supabaseClient";

export const getAllAds = async () => {
  const { data, error } = await supabase
    .from("ad")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
};

export const getActiveAds = async (placement) => {
  let query = supabase.from("ad").select("*").eq("active", true);
  if (placement) query = query.eq("placement", placement);

  const { data, error } = await query
    .order("created_date", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
};

export const createAd = async (data) => {
  const { data: created, error } = await supabase
    .from("ad")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const updateAd = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("ad")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteAd = async (id) => {
  const { data, error } = await supabase
    .from("ad")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const toggleAd = async (id, active) => {
  const { data, error } = await supabase
    .from("ad")
    .update({ active })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};