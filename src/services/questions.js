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

export const markAnswerHelpful = async (answerId, actorId) => {
  // Check if user already marked this answer as helpful
  const { data: existing, error: fetchError } = await supabase
    .from("reaction")
    .select("id")
    .eq("target_id", answerId)
    .eq("target_type", "answer")
    .eq("reaction_type", "helpful")
    .eq("actor_id", actorId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    // Toggle off: Delete the reaction (database trigger will decrement count)
    const { error: deleteError } = await supabase
      .from("reaction")
      .delete()
      .eq("id", existing.id);
    if (deleteError) throw deleteError;
    return { action: "removed" };
  } else {
    // Toggle on: Insert the reaction (database trigger will increment count)
    const { error: insertError } = await supabase
      .from("reaction")
      .insert({
        target_id: answerId,
        target_type: "answer",
        reaction_type: "helpful",
        actor_id: actorId,
        is_authenticated: true,
      });
    if (insertError) throw insertError;
    return { action: "added" };
  }
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
  // Handled automatically by database trigger on answer table
  return { id: questionId, answer_count: count };
};