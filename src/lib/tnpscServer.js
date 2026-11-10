// src/lib/tnpscServer.js
// Server-side Data Access Layer for VizhiTN TNPSC Portal.
// Designed for Next.js Server Components, ISR prerendering, and SEO route handlers.
// Guaranteed zero-hang: Protected by 3-second AbortSignal timeout and instant fallback to static seed data.

import { createServerSupabase } from '@/lib/serverSupabase';
import { 
  TNPSC_EXAMS, 
  TNPSC_SUBJECTS, 
  TNPSC_TOPICS, 
  TNPSC_PYQ_PAPERS, 
  DEFAULT_TNPSC_QUESTIONS,
  getSubjectBySlug,
  getExamBySlug
} from './tnpscData';

export { 
  TNPSC_EXAMS, 
  TNPSC_SUBJECTS, 
  TNPSC_TOPICS, 
  TNPSC_PYQ_PAPERS, 
  DEFAULT_TNPSC_QUESTIONS,
  getSubjectBySlug,
  getExamBySlug
};

const DB_TIMEOUT_MS = 3000;

/**
 * Execute a promise with a strict timeout
 */
async function withTimeout(promise, ms = DB_TIMEOUT_MS) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('DB_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

/**
 * Fetch all TNPSC exams (Server-side)
 */
export async function getTnpscExamsServer() {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const query = supabase
        .from('tnpsc_exam')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });

      const { data, error } = await withTimeout(query);
      if (!error && data && data.length > 0) return data;
    }
  } catch (_) {}

  return TNPSC_EXAMS;
}

/**
 * Fetch a single TNPSC exam by slug (Server-side)
 */
export async function getTnpscExamBySlugServer(examSlug) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const query = supabase
        .from('tnpsc_exam')
        .select('*')
        .eq('slug', examSlug)
        .maybeSingle();

      const { data, error } = await withTimeout(query);
      if (!error && data) return data;
    }
  } catch (_) {}

  return TNPSC_EXAMS.find((e) => e.slug === examSlug) || null;
}

/**
 * Fetch TNPSC subjects (Server-side)
 */
export async function getTnpscSubjectsServer(examSlug = null) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      let query = supabase.from('tnpsc_subject').select('*');
      if (examSlug) {
        query = query.contains('exam_slugs', [examSlug]);
      }
      const { data, error } = await withTimeout(query);
      if (!error && data && data.length > 0) return data;
    }
  } catch (_) {}

  if (examSlug) {
    return TNPSC_SUBJECTS.filter((s) => s.slug === 'all' || (s.exam_slugs && s.exam_slugs.includes(examSlug)));
  }
  return TNPSC_SUBJECTS;
}

/**
 * Fetch TNPSC topics (Server-side)
 */
export async function getTnpscTopicsServer(filter = {}) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      let query = supabase.from('tnpsc_topic').select('*').eq('is_published', true);
      if (filter.subjectSlug) query = query.eq('subject_slug', filter.subjectSlug);
      if (filter.examSlug) query = query.contains('exam_slugs', [filter.examSlug]);

      const { data, error } = await withTimeout(query);
      if (!error && data && data.length > 0) return data;
    }
  } catch (_) {}

  let list = TNPSC_TOPICS;
  if (filter.subjectSlug) list = list.filter((t) => t.subject_slug === filter.subjectSlug);
  if (filter.examSlug) list = list.filter((t) => t.exam_slugs && t.exam_slugs.includes(filter.examSlug));
  return list;
}

/**
 * Fetch single topic by slug (Server-side)
 */
export async function getTnpscTopicBySlugServer(topicSlug) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const query = supabase
        .from('tnpsc_topic')
        .select('*')
        .eq('slug', topicSlug)
        .maybeSingle();

      const { data, error } = await withTimeout(query);
      if (!error && data) return data;
    }
  } catch (_) {}

  return TNPSC_TOPICS.find((t) => t.slug === topicSlug) || null;
}

/**
 * Fetch questions by topic (Server-side)
 */
export async function getTnpscQuestionsByTopicServer(topicSlug) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const query = supabase
        .from('tnpsc_question')
        .select('*')
        .eq('topic_slug', topicSlug)
        .order('id', { ascending: true });

      const { data, error } = await withTimeout(query);
      if (!error && data && data.length > 0) return data;
    }
  } catch (_) {}

  const topic = TNPSC_TOPICS.find((t) => t.slug === topicSlug);
  const matching = DEFAULT_TNPSC_QUESTIONS.filter((q) => q.topic_slug === topicSlug);
  if (matching.length > 0) return matching;

  if (topic) {
    return DEFAULT_TNPSC_QUESTIONS.filter((q) => q.subject_slug === topic.subject_slug);
  }
  return DEFAULT_TNPSC_QUESTIONS.slice(0, 5);
}

/**
 * Fetch PYQ papers (Server-side)
 */
export async function getTnpscPyqPapersServer(examSlug = null) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      let query = supabase.from('tnpsc_pyq_paper').select('*').order('year', { ascending: false });
      if (examSlug) query = query.eq('exam_slug', examSlug);

      const { data, error } = await withTimeout(query);
      if (!error && data && data.length > 0) return data;
    }
  } catch (_) {}

  if (examSlug) {
    return TNPSC_PYQ_PAPERS.filter((p) => p.exam_slug === examSlug);
  }
  return TNPSC_PYQ_PAPERS;
}

/**
 * Fetch single PYQ paper by slug (Server-side)
 */
export async function getTnpscPyqPaperBySlugServer(paperSlug) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const query = supabase
        .from('tnpsc_pyq_paper')
        .select('*')
        .eq('slug', paperSlug)
        .maybeSingle();

      const { data, error } = await withTimeout(query);
      if (!error && data) return data;
    }
  } catch (_) {}

  return TNPSC_PYQ_PAPERS.find((p) => p.slug === paperSlug) || null;
}

/**
 * Fetch questions for a PYQ paper (Server-side)
 */
export async function getTnpscQuestionsByPyqPaperServer(paperSlug) {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      const query = supabase
        .from('tnpsc_question')
        .select('*')
        .eq('pyq_paper_slug', paperSlug)
        .order('id', { ascending: true });

      const { data, error } = await withTimeout(query);
      if (!error && data && data.length > 0) return data;
    }
  } catch (_) {}

  const yearMatch = paperSlug ? paperSlug.match(/\d{4}/) : null;
  if (yearMatch) {
    const year = yearMatch[0];
    const filtered = DEFAULT_TNPSC_QUESTIONS.filter(
      (q) => q.pyq_reference && q.pyq_reference.includes(year)
    );
    if (filtered.length > 0) return filtered;
  }
  return DEFAULT_TNPSC_QUESTIONS;
}

/**
 * Fetch questions for a subject (Server-side)
 */
export async function getTnpscQuestionsServer(subjectSlug = 'all') {
  try {
    const supabase = createServerSupabase();
    if (supabase) {
      let query = supabase.from('tnpsc_question').select('*');
      if (subjectSlug !== 'all') {
        query = query.eq('subject_slug', subjectSlug);
      }
      const { data, error } = await withTimeout(query.limit(50));
      if (!error && data && data.length > 0) return data;
    }
  } catch (_) {}

  if (subjectSlug === 'all') return DEFAULT_TNPSC_QUESTIONS;
  return DEFAULT_TNPSC_QUESTIONS.filter((q) => q.subject_slug === subjectSlug);
}

