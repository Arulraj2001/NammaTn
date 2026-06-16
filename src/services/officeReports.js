import { supabase } from "@/api/supabaseClient";

export const getOfficeReports = async (officeSlug, limit = 20) => {
  const { data, error } = await supabase
    .from("office_report")
    .select("*")
    .eq("office_slug", officeSlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getReportsByDistrict = async (districtSlug, limit = 20) => {
  const { data, error } = await supabase
    .from("office_report")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const createOfficeReport = async (data) => {
  const { data: created, error } = await supabase
    .from("office_report")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const markReportHelpful = async (id, currentCount) => {
  const { data, error } = await supabase
    .from("office_report")
    .update({ helpful_count: (currentCount || 0) + 1 })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Compute a simple waiting time summary from multiple reports
export const summarizeWaitingTime = (reports) => {
  if (!reports.length) return null;
  const recent = reports.slice(0, 10);
  const timeMap = { less_30min: 15, "30_60min": 45, "1_2hrs": 90, "2_3hrs": 150, more_3hrs: 210, not_served: 240 };
  const avg = recent.reduce((sum, r) => sum + (timeMap[r.waiting_time] || 60), 0) / recent.length;
  if (avg < 30) return "< 30 min";
  if (avg < 60) return "30–60 min";
  if (avg < 120) return "1–2 hrs";
  if (avg < 180) return "2–3 hrs";
  return "> 3 hrs";
};