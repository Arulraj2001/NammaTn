import { supabase } from "@/api/supabaseClient";

// Jobs admin
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

// Questions admin
export const getAllQuestionsAdmin = async (limit = 50) => {
  const { data, error } = await supabase
    .from("question")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateQuestion = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("question")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteQuestion = async (id) => {
  const { data, error } = await supabase
    .from("question")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAllAnswersAdmin = async (limit = 50) => {
  const { data, error } = await supabase
    .from("answer")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateAnswer = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("answer")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

// Situations admin
export const getAllSituationsAdmin = async (limit = 50) => {
  const { data, error } = await supabase
    .from("situation_update")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateSituation = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("situation_update")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

// Office reports admin
export const getAllOfficeReportsAdmin = async (limit = 50) => {
  const { data, error } = await supabase
    .from("office_report")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const updateOfficeReport = async (id, data) => {
  const { data: updated, error } = await supabase
    .from("office_report")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated;
};

export const deleteOfficeReport = async (id) => {
  const { data, error } = await supabase
    .from("office_report")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Contributions admin
export const getAllActivities = async (limit = 50) => {
  const { data, error } = await supabase
    .from("contributor_activity")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

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