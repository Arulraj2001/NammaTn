import { supabase } from "@/api/supabaseClient";

// Suspicious stay keywords — flag for pending review
const SUSPICIOUS_STAY_KEYWORDS = [
  "advance immediately", "pay now", "no visit", "token amount",
  "only online payment", "urgent deposit", "id proof first",
  "too cheap", "send money", "pay first", "transfer now",
  "no physical visit", "100% safe online",
];

export const detectSuspiciousStay = (title = "", description = "") => {
  const text = `${title} ${description}`.toLowerCase();
  return SUSPICIOUS_STAY_KEYWORDS.some((kw) => text.includes(kw));
};

export const getActiveListings = async (limit = 30) => {
  const { data, error } = await supabase
    .from("stay_listing")
    .select("*")
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;
  
  return data
    .filter((l) =>
      l.safety_status !== "scam" &&
      l.safety_status !== "rejected" &&
      (l.report_count || 0) < 5 &&
      l.is_publicly_visible !== false
    )
    .slice(0, limit);
};

export const getListingsByType = async (type, limit = 30) => {
  const { data, error } = await supabase
    .from("stay_listing")
    .select("*")
    .eq("listing_type", type)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;

  return data
    .filter((l) => l.safety_status !== "scam" && l.safety_status !== "rejected" && (l.report_count || 0) < 5 && l.is_publicly_visible !== false)
    .slice(0, limit);
};

export const getListingsByDistrict = async (district_slug, limit = 50) => {
  const { data, error } = await supabase
    .from("stay_listing")
    .select("*")
    .eq("district_slug", district_slug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;

  return data
    .filter((l) => l.safety_status !== "scam" && l.safety_status !== "rejected" && (l.report_count || 0) < 5 && l.is_publicly_visible !== false)
    .slice(0, limit);
};

export const getListingsByDistrictAndType = async (district_slug, listing_type, limit = 50) => {
  const { data, error } = await supabase
    .from("stay_listing")
    .select("*")
    .eq("district_slug", district_slug)
    .eq("listing_type", listing_type)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;

  return data
    .filter((l) => l.safety_status !== "scam" && l.safety_status !== "rejected" && (l.report_count || 0) < 5 && l.is_publicly_visible !== false)
    .slice(0, limit);
};

export const createListing = async (data) => {
  const { data: created, error } = await supabase
    .from("stay_listing")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const updateListing = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("stay_listing")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteListing = async (id) => {
  const { data, error } = await supabase
    .from("stay_listing")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const reportListing = async (data) => {
  const { data: created, error } = await supabase
    .from("stay_report")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

// Admin
export const getAllListingsAdmin = async (limit = 200) => {
  const { data, error } = await supabase
    .from("stay_listing")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getAllReportsAdmin = async (limit = 200) => {
  const { data, error } = await supabase
    .from("stay_report")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};