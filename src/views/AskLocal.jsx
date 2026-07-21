"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { HelpCircle, Plus, X, TrendingUp, Clock, CheckCircle } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { getQuestions, createQuestion } from "@/services/questions";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatDistanceToNow } from "date-fns";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { supabase } from "@/api/supabaseClient";

export default function AskLocal({ initialQuestions = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();

  // Fetch user profile for trust score
  const { data: profile = null } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
  const [showForm, setShowForm] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", content: "", district_slug: "", district_name: "", area_slug: "", area_name: "", category_slug: "", is_anonymous: true, author_name: "" });
  const [formError, setFormError] = useState(null);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), T("Sign in to ask a local question", "உள்ளூர் கேள்வி கேட்க உள்நுழையுங்கள்"));
      return;
    }
    setShowForm(f => !f);
  };

  usePageMeta({ title: "VizhiTN - Ask Local", description: "Ask area-based questions and get answers from people who know the locality." });

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", filterDistrict],
    queryFn: () => filterDistrict
      ? base44.entities.Question.filter({ district_slug: filterDistrict }, "-created_date", 40)
      : getQuestions(40),
    initialData: !filterDistrict ? initialQuestions : undefined,
  });

  const mutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      setShowForm(false);
      setForm({ title: "", content: "", district_slug: "", district_name: "", area_slug: "", area_name: "", category_slug: "", is_anonymous: true, author_name: "" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.district_slug) { setFormError("Please fill title and select a district."); return; }
    if (!checkRateLimit("ask_question", 3, 10 * 60_000)) { setFormError("You're asking too fast. Please wait."); return; }
    mutation.mutate({ ...form, title: sanitizeText(form.title).substring(0, 200), content: sanitizeText(form.content).substring(0, 1000) });
  };

  const filtered = search
    ? questions.filter(q => q.title.toLowerCase().includes(search.toLowerCase()))
    : questions;

  return (
    <div>
      {/* ── Hero banner — matches Community style ── */}
      <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg mt-1">
              <span className="text-3xl">❓</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                {T("Community Q&A", "சமுதாய கேள்வி & பதில்")}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1.5">
                {T("Ask Local", "உள்ளூரினரிடம் கேளுங்கள்")}
              </h1>
              <p className="text-purple-100 text-xs sm:text-sm leading-relaxed max-w-xl">
                {T(
                  "Ask area-based questions and get answers from people who know the locality. Community knowledge, not official advice.",
                  "பகுதி அடிப்படையிலான கேள்விகளை கேட்டு உள்ளூர் மக்களிடம் பதில் பெறுங்கள். சமுதாய அறிவு, அதிகாரப்பூர்வ ஆலோசனை அல்ல."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={handleToggleForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? T("Cancel", "ரத்து") : T("Ask a Question", "கேள்வி கேளுங்கள்")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 space-y-3">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-semibold text-slate-800 dark:text-white">{T("Ask a Local Question", "உள்ளூர் கேள்வி கேளுங்கள்")}</h3>
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{T("Your Score", "உங்கள் மதிப்பு")}</span>
                <span className="text-sm font-extrabold text-purple-700 dark:text-purple-300">★ {profile?.trust_score || 10}</span>
              </div>
            )}
          </div>
          <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder={T("e.g. Is RTO crowded today? Water issue in Tambaram?", "எ.கா. இன்று RTO நிரம்பி இருக்கிறதா?")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder={T("Additional details (optional)...", "கூடுதல் விவரங்கள் (விருப்பத்தேர்வு)...")}
            rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.district_slug} onChange={(e) => {
              const d = DISTRICTS.find(d => d.slug === e.target.value);
              setForm(f => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "" }));
            }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="">{T("District *", "மாவட்டம் *")}</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
            </select>
            <select value={form.category_slug} onChange={(e) => {
              const c = CATEGORIES.find(c => c.slug === e.target.value);
              setForm(f => ({ ...f, category_slug: e.target.value, category_name: c?.name_en || "" }));
            }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="">{T("Category", "வகை")}</option>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.icon} {T(c.name_en, c.name_ta)}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} className="accent-purple-600" />
            {T("Post anonymously", "அநாமதேயமாக கேளுங்கள்")}
          </label>
          {formError && <p className="text-red-500 text-xs">{formError}</p>}
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {mutation.isPending ? T("Posting...", "பதிவிடுகிறது...") : T("Post Question", "கேள்வியை பதிவிடு")}
          </button>
        </form>
      )}

      <div className="relative mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={T("Search questions...", "கேள்விகளை தேடுங்கள்...")}
          className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["", ...DISTRICTS.slice(0, 7).map(d => d.slug)].map((slug, i) => (
          <button key={slug || "all"} onClick={() => setFilterDistrict(slug)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all ${filterDistrict === slug ? "bg-purple-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
            {slug ? T(DISTRICTS.find(d=>d.slug===slug)?.name_en, DISTRICTS.find(d=>d.slug===slug)?.name_ta) : T("All", "அனைத்தும்")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{T("No questions yet. Be the first to ask!", "இன்னும் கேள்விகள் இல்லை. முதலில் கேளுங்கள்!")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Link key={q.id} to={`/question/${q.id}`} className="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  {q.status === "answered" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <HelpCircle className="w-5 h-5 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2">{q.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                    <span>{q.district_name}</span>
                    {q.category_name && <span>· {q.category_name}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.created_date ? formatDistanceToNow(new Date(q.created_date), { addSuffix: true }) : ""}</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">{q.answer_count || 0} answers</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
