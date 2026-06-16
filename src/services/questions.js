import { supabase } from "@/api/supabaseClient";

export const getQuestions = async (limit = 30) => {
  const { data, error } = await supabase
    .from("question")
    .select("*")
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getQuestionsByDistrict = async (districtSlug, limit = 20) => {
  const { data, error } = await supabase
    .from("question")
    .select("*")
    .eq("district_slug", districtSlug)
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getTrendingQuestions = async (limit = 10) => {
  const { data, error } = await supabase
    .from("question")
    .select("*")
    .eq("is_trending", true)
    .order("created_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const getQuestionById = async (id) => {
  const { data, error } = await supabase
    .from("question")
    .select("*")
    .eq("id", id)
    .limit(1);
  if (error) throw error;
  return data[0] || null;
};

export const createQuestion = async (data) => {
  const { data: created, error } = await supabase
    .from("question")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const getAnswersByQuestion = async (questionId) => {
  const { data, error } = await supabase
    .from("answer")
    .select("*")
    .eq("question_id", questionId)
    .eq("status", "active")
    .order("helpful_count", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
};

export const createAnswer = async (data) => {
  const { data: created, error } = await supabase
    .from("answer")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created;
};

export const markAnswerHelpful = async (id, currentCount) => {
  const { data, error } = await supabase
    .from("answer")
    .update({ helpful_count: (currentCount || 0) + 1 })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const acceptAnswer = async (answerId, questionId) => {
  const { error: ansError } = await supabase
    .from("answer")
    .update({ is_accepted: true })
    .eq("id", answerId);
  if (ansError) throw ansError;

  const { error: qError } = await supabase
    .from("question")
    .update({ status: "answered" })
    .eq("id", questionId);
  if (qError) throw qError;
};

export const updateAnswerCount = async (questionId, count) => {
  const { data, error } = await supabase
    .from("question")
    .update({ answer_count: count })
    .eq("id", questionId)
    .select()
    .single();
  if (error) throw error;
  return data;
};