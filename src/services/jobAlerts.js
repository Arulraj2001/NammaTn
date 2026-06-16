import { supabase } from "@/api/supabaseClient";

// Suspicious job keywords — flag for pending review
const SUSPICIOUS_JOB_KEYWORDS = [
  "registration fee", "pay first", "deposit required", "guaranteed job",
  "work from home high salary", "no interview", "urgent payment",
  "whatsapp only", "pay upfront", "advance payment", "send money",
  "100% salary", "earn daily", "no experience high pay",
];

export const detectSuspiciousJob = (title = "", description = "") => {
  const text = `${title} ${description}`.toLowerCase();
  return SUSPICIOUS_JOB_KEYWORDS.some((kw) => text.includes(kw));
};

export const getActiveJobs = async (limit = 40, districtSlug = "", jobType = "") => {
  let query = supabase.from("job_alert").select("*").eq("status", "active");
  if (districtSlug) query = query.eq("district_slug", districtSlug);
  if (jobType) query = query.eq("job_type", jobType);

  const { data: items, error } = await query
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;

  // Exclude scam-flagged, rejected, high-report, or hidden items
  return items
    .filter((j) =>
      j.safety_status !== "scam" &&
      j.safety_status !== "rejected" &&
      (j.report_count || 0) < 5 &&
      j.is_publicly_visible !== false
    )
    .slice(0, limit);
};

export const getJobsByDistrict = async (districtSlug, limit = 20) => {
  const { data: items, error } = await supabase
    .from("job_alert")
    .select("*")
    .eq("district_slug", districtSlug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(limit * 2);
  if (error) throw error;

  return items
    .filter((j) => j.safety_status !== "scam" && j.safety_status !== "rejected" && (j.report_count || 0) < 5 && j.is_publicly_visible !== false)
    .slice(0, limit);
};

export const createJob = async (data) => {
  const { data: created, error } = await supabase
    .from("job_alert")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const getAllJobsAdmin = async (limit = 50) => {
  const { data, error } = await supabase
    .from("job_alert")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateJob = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("job_alert")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteJob = async (id) => {
  const { data, error } = await supabase
    .from("job_alert")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};