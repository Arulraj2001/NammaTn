import { supabase } from "@/api/supabaseClient";

export const getAllSettings = async () => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data;
};

export const getSetting = async (key) => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .limit(1);
  if (error) throw error;
  return data[0] || null;
};

export const upsertSetting = async (key, value, category = "general") => {
  const existing = await getSetting(key);
  if (existing) {
    const { data, error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("site_settings")
      .insert({ key, value, category })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const getSettingsMap = async () => {
  const all = await getAllSettings();
  return all.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
};

export const saveSettingsGroup = async (settings, category = "general") => {
  const promises = Object.entries(settings).map(([key, value]) =>
    upsertSetting(key, String(value), category)
  );
  return await Promise.all(promises);
};