import { supabase } from "@/api/supabaseClient";

const EXCLUDED_SETTING_CATEGORIES = '("dispatch_ledger","tnpsc_questions","tnpsc_automation")';
let publicSettingsCache = null;
let publicSettingsPromise = null;

export const getAllSettings = async () => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .not("category", "in", EXCLUDED_SETTING_CATEGORIES)
    .order("key", { ascending: true })
    .limit(100);
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
  // Public browser pages read from the CDN-cached Next.js endpoint (/api/public-settings)
  // to eliminate per-pageview Supabase egress across all visitors and crawlers.
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
    if (publicSettingsCache) return publicSettingsCache;
    if (!publicSettingsPromise) {
      publicSettingsPromise = fetch("/api/public-settings")
        .then((res) => (res.ok ? res.json() : {}))
        .then((map) => {
          publicSettingsCache = map || {};
          return publicSettingsCache;
        })
        .catch(() => ({}));
    }
    return publicSettingsPromise;
  }

  const all = await getAllSettings();
  return (all || []).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
};

export const saveSettingsGroup = async (settings, category = "general") => {
  const promises = Object.entries(settings).map(([key, value]) =>
    upsertSetting(key, String(value), category)
  );
  return await Promise.all(promises);
};