import { supabase } from "@/api/supabaseClient";

export {
  TNPSC_EXAMS,
  TNPSC_SUBJECTS,
  TNPSC_CHAPTERS,
  TNPSC_TOPICS,
  TNPSC_PYQ_PAPERS,
  DEFAULT_TNPSC_QUESTIONS,
  getSubjectBySlug,
  getExamBySlug
} from "@/lib/tnpscData";

import {
  TNPSC_EXAMS,
  TNPSC_SUBJECTS,
  TNPSC_CHAPTERS,
  TNPSC_TOPICS,
  TNPSC_PYQ_PAPERS,
  DEFAULT_TNPSC_QUESTIONS,
  getSubjectBySlug,
  getExamBySlug
} from "@/lib/tnpscData";

const SETTINGS_KEY = "tnpsc_questions_catalog";
const AUTO_FEEDER_KEY = "tnpsc_auto_feeder_config";

/**
 * Fetch all TNPSC exams
 */
export async function fetchTnpscExams() {
  try {
    const { data, error } = await supabase
      .from("tnpsc_exam")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (!error && data && data.length > 0) return data;
  } catch (_) {}
  return TNPSC_EXAMS;
}

/**
 * Fetch all TNPSC subjects, optionally filtered by exam slug
 */
export async function fetchTnpscSubjects(examSlug = null) {
  try {
    let query = supabase.from("tnpsc_subject").select("*");
    const { data, error } = await query.order("order_index", { ascending: true });
    if (!error && data && data.length > 0) {
      if (examSlug) return data.filter((s) => s.exam_slugs?.includes(examSlug));
      return data;
    }
  } catch (_) {}

  const subjects = TNPSC_SUBJECTS.filter((s) => s.slug !== "all");
  if (examSlug) {
    return subjects.filter((s) => s.exam_slugs?.includes(examSlug));
  }
  return subjects;
}

/**
 * Fetch a single exam by slug
 */
export async function fetchTnpscExamBySlug(examSlug) {
  const exams = await fetchTnpscExams();
  return exams.find((e) => e.slug === examSlug) || TNPSC_EXAMS[0];
}

/**
 * Fetch chapters under a subject
 */
export async function fetchTnpscChapters(subjectSlug) {
  try {
    const { data, error } = await supabase
      .from("tnpsc_chapter")
      .select("*")
      .eq("subject_slug", subjectSlug)
      .order("order_index", { ascending: true });

    if (!error && data && data.length > 0) return data;
  } catch (_) {}
  return TNPSC_CHAPTERS.filter((c) => !subjectSlug || c.subject_slug === subjectSlug);
}

/**
 * Fetch topics under a chapter or subject
 */
export async function fetchTnpscTopics(filter = {}) {
  const { chapterSlug, subjectSlug } = filter;
  try {
    let query = supabase.from("tnpsc_topic").select("*").eq("is_published", true);
    if (chapterSlug) query = query.eq("chapter_slug", chapterSlug);
    if (subjectSlug) query = query.eq("subject_slug", subjectSlug);

    const { data, error } = await query.order("order_index", { ascending: true });
    if (!error && data && data.length > 0) return data;
  } catch (_) {}

  return TNPSC_TOPICS.filter((t) => {
    if (chapterSlug && t.chapter_slug !== chapterSlug) return false;
    if (subjectSlug && t.subject_slug !== subjectSlug) return false;
    return true;
  });
}

/**
 * Fetch single topic with rich summary by slug
 */
export async function fetchTnpscTopicBySlug(topicSlug) {
  try {
    const { data, error } = await supabase
      .from("tnpsc_topic")
      .select("*")
      .eq("slug", topicSlug)
      .maybeSingle();

    if (!error && data) return data;
  } catch (_) {}

  return TNPSC_TOPICS.find((t) => t.slug === topicSlug) || null;
}

/**
 * Fetch questions specific to a topic
 */
export async function fetchTnpscQuestionsByTopic(topicSlug) {
  try {
    const { data, error } = await supabase
      .from("tnpsc_question")
      .select("*")
      .eq("topic_slug", topicSlug);

    if (!error && data && data.length > 0) return data;
  } catch (_) {}

  return DEFAULT_TNPSC_QUESTIONS.filter((q) => q.topic_slug === topicSlug);
}

/**
 * Fetch all available PYQ papers
 */
export async function fetchTnpscPyqPapers(examSlug = null) {
  try {
    let query = supabase.from("tnpsc_pyq_paper").select("*");
    if (examSlug) query = query.eq("exam_slug", examSlug);

    const { data, error } = await query.order("year", { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (_) {}

  return TNPSC_PYQ_PAPERS.filter((p) => !examSlug || p.exam_slug === examSlug);
}

/**
 * Fetch a single PYQ paper by slug
 */
export async function fetchTnpscPyqPaperBySlug(paperSlug) {
  try {
    const { data, error } = await supabase
      .from("tnpsc_pyq_paper")
      .select("*")
      .eq("slug", paperSlug)
      .maybeSingle();

    if (!error && data) return data;
  } catch (_) {}

  return TNPSC_PYQ_PAPERS.find((p) => p.slug === paperSlug) || null;
}

/**
 * Fetch questions belonging to a specific PYQ paper
 */
export async function fetchTnpscQuestionsByPyqPaper(paperSlug) {
  try {
    const { data, error } = await supabase
      .from("tnpsc_question")
      .select("*")
      .eq("pyq_paper_slug", paperSlug)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) return data;
  } catch (_) {}

  // Fallback: match by year in pyq_reference or return standard questions
  const all = await fetchTnpscQuestions("all");
  const yearMatch = paperSlug ? paperSlug.match(/\d{4}/) : null;
  if (yearMatch) {
    const year = yearMatch[0];
    const filtered = all.filter((q) => q.pyq_reference && q.pyq_reference.includes(year));
    if (filtered.length > 0) return filtered;
  }
  return all;
}

/**
 * Fetch all TNPSC questions with Hybrid Table + Site Settings Fallback
 */
export async function fetchTnpscQuestions(subjectSlug = "all") {
  try {
    // 1. Try dedicated tnpsc_question table first if available
    try {
      let query = supabase
        .from("tnpsc_question")
        .select("*")
        .order("created_at", { ascending: false });

      if (subjectSlug && subjectSlug !== "all") {
        query = query.eq("subject_slug", subjectSlug);
      }

      const { data: tableData, error: tableErr } = await query;
      if (!tableErr && tableData && tableData.length > 0) {
        return tableData;
      }
    } catch (_) {}

    // 2. Fallback to site_settings JSON catalog
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    let list = DEFAULT_TNPSC_QUESTIONS;
    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch (_) {}
    }

    if (subjectSlug && subjectSlug !== "all") {
      return list.filter((q) => q.subject_slug === subjectSlug);
    }
    return list;
  } catch (err) {
    console.warn("[TNPSC Service] Fetch error:", err);
    if (subjectSlug && subjectSlug !== "all") {
      return DEFAULT_TNPSC_QUESTIONS.filter((q) => q.subject_slug === subjectSlug);
    }
    return DEFAULT_TNPSC_QUESTIONS;
  }
}

/**
 * Fetch today's Daily 5-Question Challenge
 */
export async function fetchDailyChallengeQuestions() {
  const all = await fetchTnpscQuestions("all");
  const daily = all.filter((q) => q.is_daily_challenge);
  return daily.length >= 5 ? daily.slice(0, 5) : all.slice(0, 5);
}

/**
 * Save / Update full questions catalog (Admin)
 */
export async function saveTnpscQuestionsCatalog(questions) {
  const payload = {
    key: SETTINGS_KEY,
    value: JSON.stringify(questions),
    category: "tnpsc_questions",
    updated_date: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "key" })
    .select();

  if (error) throw error;

  // Best effort: Also attempt upserting to tnpsc_question table if it exists
  try {
    await supabase.from("tnpsc_question").upsert(
      questions.map((q) => ({
        id: q.id,
        subject_slug: q.subject_slug,
        question_ta: q.question_ta,
        question_en: q.question_en || null,
        options: q.options,
        correct_key: q.correct_key,
        explanation_ta: q.explanation_ta || null,
        book_citation: q.book_citation || null,
        pyq_reference: q.pyq_reference || null,
        difficulty: q.difficulty || "medium",
        is_daily_challenge: Boolean(q.is_daily_challenge),
      })),
      { onConflict: "id" }
    );
  } catch (_) {}

  return data;
}

/**
 * Fetch Autonomous Feeder Config
 */
export async function fetchAutoFeederConfig() {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", AUTO_FEEDER_KEY)
      .maybeSingle();

    if (data?.value) {
      try {
        return JSON.parse(data.value);
      } catch (_) {}
    }
  } catch (err) {
    console.warn("[TNPSC Service] fetchAutoFeederConfig error:", err);
  }

  return {
    enabled: true,
    questions_per_subject: 10,
    last_run: null,
    total_generated: 0,
  };
}

/**
 * Save Autonomous Feeder Config (Toggle ON / OFF)
 */
export async function saveAutoFeederConfig(config) {
  const payload = {
    key: AUTO_FEEDER_KEY,
    value: JSON.stringify(config),
    category: "tnpsc_automation",
    updated_date: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "key" })
    .select();

  if (error) throw error;
  return data;
}

/**
 * Save or update a TNPSC topic (editorial summary, book ref, key facts)
 */
export async function saveTnpscTopic(topicData) {
  try {
    const { data, error } = await supabase
      .from("tnpsc_topic")
      .upsert({
        slug: topicData.slug,
        chapter_slug: topicData.chapter_slug || null,
        subject_slug: topicData.subject_slug,
        title_ta: topicData.title_ta,
        title_en: topicData.title_en || null,
        summary_overview_ta: topicData.summary_overview_ta || null,
        key_facts_bullet_points: Array.isArray(topicData.key_facts_bullet_points) 
          ? topicData.key_facts_bullet_points 
          : [],
        samacheer_book_ref: topicData.samacheer_book_ref || null,
        pyq_frequency_count: Number(topicData.pyq_frequency_count || 0),
        exam_slugs: Array.isArray(topicData.exam_slugs) ? topicData.exam_slugs : ['group-4'],
        is_featured: Boolean(topicData.is_featured),
        is_published: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" })
      .select();

    if (!error && data) return data;
  } catch (err) {
    console.warn("[TNPSC Service] Could not save topic to tnpsc_topic table:", err.message);
  }

  // Resilient fallback storage via site_settings
  const fallbackKey = `tnpsc_topic_${topicData.slug}`;
  const { data } = await supabase.from("site_settings").upsert({
    key: fallbackKey,
    value: JSON.stringify(topicData),
    category: "tnpsc_custom_topics",
    updated_date: new Date().toISOString(),
  }, { onConflict: "key" }).select();

  return data;
}

/**
 * Save or update a TNPSC PYQ paper
 */
export async function saveTnpscPyqPaper(paperData) {
  try {
    const { data, error } = await supabase
      .from("tnpsc_pyq_paper")
      .upsert({
        slug: paperData.slug,
        exam_slug: paperData.exam_slug,
        year: Number(paperData.year),
        title_ta: paperData.title_ta,
        title_en: paperData.title_en,
        exam_date: paperData.exam_date || null,
        total_questions: Number(paperData.total_questions || 200),
        official_pdf_url: paperData.official_pdf_url || null,
        is_hot: Boolean(paperData.is_hot),
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" })
      .select();

    if (!error && data) return data;
  } catch (err) {
    console.warn("[TNPSC Service] Could not save paper to tnpsc_pyq_paper table:", err.message);
  }

  // Resilient fallback storage via site_settings
  const fallbackKey = `tnpsc_pyq_${paperData.slug}`;
  const { data } = await supabase.from("site_settings").upsert({
    key: fallbackKey,
    value: JSON.stringify(paperData),
    category: "tnpsc_custom_pyq",
    updated_date: new Date().toISOString(),
  }, { onConflict: "key" }).select();

  return data;
}
