"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import {
  HelpCircle, Plus, X, Search, CheckCircle, Clock, MessageCircle,
  Share2, MapPin, Building, ShieldCheck, PhoneCall, ArrowRight,
  ExternalLink, Loader2, Sparkles, AlertCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { getQuestions, createQuestion } from "@/services/questions";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatDistanceToNow } from "date-fns";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { supabase } from "@/api/supabaseClient";
import NumberedPagination from "@/components/common/NumberedPagination";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

const PAGE_SIZE = 8;

const PRIORITY_DISTRICTS = [
  { slug: "all", name_en: "All Districts", name_ta: "அனைத்து மாவட்டங்கள்" },
  { slug: "chennai", name_en: "Chennai", name_ta: "சென்னை" },
  { slug: "coimbatore", name_en: "Coimbatore", name_ta: "கோயம்புத்தூர்" },
  { slug: "madurai", name_en: "Madurai", name_ta: "மதுரை" },
  { slug: "tiruchirappalli", name_en: "Tiruchirappalli", name_ta: "திருச்சிராப்பள்ளி" },
  { slug: "salem", name_en: "Salem", name_ta: "சேலம்" },
  { slug: "tiruvallur", name_en: "Tiruvallur", name_ta: "திருவள்ளூர்" },
  { slug: "chengalpattu", name_en: "Chengalpattu", name_ta: "செங்கல்பட்டு" },
  { slug: "tirunelveli", name_en: "Tirunelveli", name_ta: "திருநெல்வேலி" },
  { slug: "erode", name_en: "Erode", name_ta: "ஈரோடு" },
  { slug: "tiruppur", name_en: "Tiruppur", name_ta: "திருப்பூர்" },
];

export default function AskLocal({ initialQuestions = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
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
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "answered" | "open"
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    title: "",
    content: "",
    district_slug: "",
    district_name: "",
    area_slug: "",
    area_name: "",
    category_slug: "",
    is_anonymous: true,
    author_name: "",
  });
  const [formError, setFormError] = useState(null);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(
        () => setShowForm(true),
        T("Sign in to ask a local question", "உள்ளூர் கேள்வி கேட்க உள்நுழையுங்கள்")
      );
      return;
    }
    setShowForm((f) => !f);
  };

  usePageMeta({
    title: "Ask Local Questions Across Tamil Nadu | VizhiTN",
    description: "Ask location-based questions and get verified answers from neighborhood residents about public services, transport, power, water, and daily life in Tamil Nadu.",
  });

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", filterDistrict === "all" ? "" : filterDistrict],
    queryFn: () =>
      filterDistrict !== "all"
        ? base44.entities.Question.filter({ district_slug: filterDistrict }, "-created_date", 100)
        : getQuestions(100),
    initialData: filterDistrict === "all" ? initialQuestions : undefined,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-district-ask", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      setShowForm(false);
      setForm({
        title: "",
        content: "",
        district_slug: "",
        district_name: "",
        area_slug: "",
        area_name: "",
        category_slug: "",
        is_anonymous: true,
        author_name: "",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.district_slug) {
      setFormError(T("Please fill question title and select a district.", "தயவுசெய்து தலைப்பு மற்றும் மாவட்டத்தை தேர்வு செய்யவும்."));
      return;
    }
    if (!checkRateLimit("ask_question", 3, 10 * 60_000)) {
      setFormError(T("You're asking too fast. Please wait a few minutes.", "மிக விரைவாக கேட்கிறீர்கள். சற்று காத்திருக்கவும்."));
      return;
    }
    mutation.mutate({
      ...form,
      title: sanitizeText(form.title).substring(0, 200),
      content: sanitizeText(form.content).substring(0, 1000),
    });
  };

  // Filter questions by district, category, status, and search query
  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchDistrict = filterDistrict === "all" || q.district_slug === filterDistrict;
      const matchCategory = filterCategory === "all" || q.category_slug === filterCategory;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "answered" && (q.status === "answered" || (q.answer_count || 0) > 0)) ||
        (statusFilter === "open" && q.status !== "answered" && (q.answer_count || 0) === 0);

      const targetText = `${q.title || ""} ${q.content || ""} ${q.district_name || ""} ${q.area_name || ""} ${q.category_name || ""}`.toLowerCase();
      const matchSearch = !search.trim() || targetText.includes(search.toLowerCase().trim());

      return matchDistrict && matchCategory && matchStatus && matchSearch;
    });
  }, [questions, filterDistrict, filterCategory, statusFilter, search]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict, filterCategory, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedQuestions = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedDistrictObj = DISTRICTS.find((d) => d.slug === filterDistrict);
  const districtNameDisplay = selectedDistrictObj
    ? (lang === "ta" ? selectedDistrictObj.name_ta : selectedDistrictObj.name_en)
    : T("All Tamil Nadu Districts", "அனைத்து மாவட்டங்கள்");

  const pageUrl = "https://www.vizhitn.in/ask";
  const shareText = encodeURIComponent(
    `❓ *${districtNameDisplay} Ask Local Community Q&A*
` +
    `${filtered.length} Local Questions Asked & Answered by Neighbors
` +
    `Ask or answer local questions: ${pageUrl}`
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-200 mb-3 border border-purple-400/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {filterDistrict !== "all"
                  ? `${districtNameDisplay.toUpperCase()} COMMUNITY DESK`
                  : T("HYPERLOCAL CITIZEN COMMUNITY Q&A", "உள்ளூர் மக்கள் கேள்வி & பதில்")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3">
                {filterDistrict !== "all"
                  ? `${districtNameDisplay} ${T("Ask Local Questions", "உள்ளூர் கேள்விகள்")}`
                  : T("Ask Local Across Tamil Nadu", "உள்ளூரினரிடம் கேளுங்கள்")}
              </h1>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
                {T(
                  `Ask area-based questions and get real answers from neighborhood residents about local roads, water timings, government offices, bus routes, and daily life in ${filterDistrict !== "all" ? districtNameDisplay : "all 38 districts"}.`,
                  `பகுதி அடிப்படையிலான கேள்விகளைக் கேட்டு அப்பகுதி மக்களிடமே உண்மைத் தகவல்களைப் பெறுங்கள். சாலைகள், குடிநீர், அரசு அலுவலகங்கள் மற்றும் உள்ளூர் வாழ்க்கை பற்றிய சமுதாய அறிவு.`
                )}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={handleToggleForm}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-900 hover:bg-purple-100 px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                  {T("Ask a Local Question", "ஒரு கேள்வி கேளுங்கள்")}
                </button>
                <Link
                  to="/create"
                  className="inline-flex items-center text-xs font-bold border border-white/40 hover:bg-white/10 text-white px-3.5 py-2 rounded-xl transition-colors"
                >
                  {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
                </Link>
                <span className="text-purple-200/80 text-[11px] block sm:inline">
                  🔒 {T("Anonymous posting supported.", "அநாமதேயமாகவும் கேட்கலாம்.")}
                </span>
              </div>
            </div>

            {/* Neighborhood Knowledge Desk Callout Card */}
            <div className="bg-black/35 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {T("Local Knowledge Desk", "உள்ளூர் அறிவு மையம்")}
              </div>
              <p className="text-sm font-black text-white leading-snug">
                {T("Real answers by people living on your street", "உங்கள் தெருவிலேயே வசிப்பவர்களின் நேரடி பதில்கள்")}
              </p>
              <div className="border-t border-purple-400/20 pt-2 space-y-1 text-xs text-purple-200/80">
                <p>⚡ TANGEDCO Minnalagam: <span className="font-bold text-white">1912</span></p>
                <p>🏢 Greater Chennai Corp: <span className="font-bold text-white">1913</span></p>
                <p>🏛 CM Citizen Helpline: <span className="font-bold text-white">1100</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-3.5">
          {/* Top Row: Search Box + 38 District Dropdown + Status Toggle */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={T("Search questions, taluks, or topics...", "கேள்விகள் அல்லது தலைப்புகளைத் தேடுக...")}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick 38 District Dropdown + Status Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="all">📍 {T("All Districts (38)", "அனைத்து மாவட்டங்கள் (38)")}</option>
                {DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name_en} - {d.name_ta}
                  </option>
                ))}
              </select>

              {/* Status Segmented Buttons */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === "all"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {T("All", "அனைத்தும்")}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("answered")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === "answered"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                  }`}
                >
                  <span>✓ {T("Answered", "பதிலளிக்கப்பட்டது")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("open")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === "open"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-purple-600"
                  }`}
                >
                  <span>❓ {T("Open", "கேள்விகள்")}</span>
                </button>
              </div>

              {/* Ask Question Toggle Button */}
              <button
                onClick={handleToggleForm}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? T("Cancel", "ரத்து") : T("Ask Question", "கேள்வி கேளுங்கள்")}
              </button>
            </div>
          </div>

          {/* District Chips Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              {T("Districts:", "மாவட்டம்:")}
            </span>
            {PRIORITY_DISTRICTS.map((dist) => (
              <button
                key={dist.slug}
                onClick={() => setFilterDistrict(dist.slug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  filterDistrict === dist.slug
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(dist.name_en, dist.name_ta)}
              </button>
            ))}
          </div>

          {/* Category Chips Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              {T("Category:", "பிரிவு:")}
            </span>
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterCategory === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {T("All Categories", "அனைத்து வகைகள்")}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => setFilterCategory(c.slug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  filterCategory === c.slug
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{c.icon}</span>
                <span>{T(c.name_en, c.name_ta)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HIGH-IMPACT GLANCEABLE STATUS CARD ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {filtered.length > 0
                    ? T("ACTIVE LOCAL INQUIRIES", "செயலில் உள்ள உள்ளூர் கேள்விகள்")
                    : T("COMMUNITY READY TO HELP", "உதவ தயாராக உள்ள சமூகம்")}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {new Date().toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {filtered.length > 0
                  ? T(
                      `💬 ${filtered.length} Local Questions Asked in ${districtNameDisplay}`,
                      `💬 ${districtNameDisplay} - ${filtered.length} உள்ளூர் கேள்விகள் பதிவாகியுள்ளன`
                    )
                  : T(
                      `✅ Got a Question about ${districtNameDisplay}? Ask Area Locals Now`,
                      `✅ ${districtNameDisplay} பற்றி கேள்வி உள்ளதா? உள்ளூர் மக்களிடம் கேளுங்கள்`
                    )}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {filtered.length > 0
                  ? T(
                      "Inquire about water supply timings, reliable local plumbers, RTO token wait times, school admissions, or bus routes. Help your community by answering questions you know.",
                      "குடிநீர் வரும் நேரம், நம்பகமான உள்ளூர் பிளம்பர், RTO அலுவலகக் கூட்டம் அல்லது பேருந்து வழித்தடங்கள் பற்றி கேட்டு உடனுக்குடன் பதில்களைப் பெறுங்கள்."
                    )
                  : T(
                      "No questions match your current search. Feel free to ask anything about local neighborhood services, electricity shutdowns, or municipal offices.",
                      "தேடலுக்குரிய கேள்விகள் எதுவும் இல்லை. உங்கள் பகுதி தொடர்பான எந்தவொரு கேள்வியையும் தயங்காமல் கேளுங்கள்."
                    )}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-all group"
              >
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிர்க")}
              </a>

              <a
                href="https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {T("Join VizhiTN WhatsApp Channel", "வாட்ஸ்அப் சேனலில் இணைய")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT FEED & SIDEBAR ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Posts Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                {T(
                  filterDistrict === "all" ? "Neighborhood Questions" : `${districtNameDisplay} Questions`,
                  filterDistrict === "all" ? "சமுதாயக் கேள்விகள்" : `${districtNameDisplay} கேள்விகள்`
                )}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800">
                {filtered.length} {T("Questions", "கேள்விகள்")}
              </span>
            </div>

            {/* Ask Question Form (Collapsible Card) */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-300 dark:border-purple-800 p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {T("Ask a Question to Area Locals", "உள்ளூர் மக்களிடம் ஒரு கேள்வி கேளுங்கள்")}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {T("Get genuine neighborhood insights from residents living nearby.", "அருகில் வசிப்பவர்களிடமிருந்து உண்மையான தகவல்களைப் பெறுங்கள்.")}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        {T("Trust Score", "மதிப்பு")}
                      </span>
                      <span className="text-sm font-extrabold text-purple-700 dark:text-purple-300">
                        ★ {profile?.trust_score || 10}
                      </span>
                    </div>
                  )}
                </div>

                {/* Question Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("Question Title *", "கேள்வியின் தலைப்பு *")}
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={T("e.g. Is RTO crowded on Saturdays? When does Metrowater supply in Adyar?", "எ.கா. இன்று தாம்பரம் பகுதியில் குடிநீர் விநியோகம் உள்ளதா?")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("Additional Details (Optional)", "கூடுதல் விவரங்கள் (விருப்பத்தேர்வு)")}
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder={T("Mention specific street, landmark, or context to get accurate answers...", "துல்லியமான பதில் கிடைக்க குறிப்பிட்ட தெரு அல்லது அடையாளத்தைக் குறிப்பிடவும்...")}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* District, Area, Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {T("District *", "மாவட்டம் *")}
                    </label>
                    <select
                      value={form.district_slug}
                      onChange={(e) => {
                        const d = DISTRICTS.find((d) => d.slug === e.target.value);
                        setForm((f) => ({
                          ...f,
                          district_slug: e.target.value,
                          district_name: d?.name_en || "",
                          area_slug: "",
                          area_name: "",
                        }));
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    >
                      <option value="">{T("Select District *", "மாவட்டம் *")}</option>
                      {DISTRICTS.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {T(d.name_en, d.name_ta)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {T("Area / Street (Optional)", "பகுதி (விருப்பத்தேர்வு)")}
                    </label>
                    {areas.length > 0 ? (
                      <select
                        value={form.area_slug}
                        onChange={(e) => {
                          const a = areas.find((a) => a.slug === e.target.value);
                          setForm((f) => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                      >
                        <option value="">{T("Choose Area", "பகுதியைத் தேர்வுசெய்க")}</option>
                        {areas.map((a) => (
                          <option key={a.slug} value={a.slug}>
                            {T(a.name_en, a.name_ta)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={form.area_name || ""}
                        onChange={(e) => setForm((f) => ({ ...f, area_slug: "", area_name: e.target.value }))}
                        placeholder={T("e.g. Velachery", "எ.கா. வேளச்சேரி")}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {T("Category", "பிரிவு")}
                    </label>
                    <select
                      value={form.category_slug}
                      onChange={(e) => {
                        const c = CATEGORIES.find((c) => c.slug === e.target.value);
                        setForm((f) => ({
                          ...f,
                          category_slug: e.target.value,
                          category_name: c?.name_en || "",
                        }));
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    >
                      <option value="">{T("Select Category", "வகை தேர்ந்தெடுக்க")}</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.icon} {T(c.name_en, c.name_ta)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.is_anonymous}
                    onChange={(e) => setForm((f) => ({ ...f, is_anonymous: e.target.checked }))}
                    className="accent-purple-600 rounded"
                  />
                  <span>{T("Post question anonymously (name hidden)", "பெயரை மறைத்து அநாமதேயமாகக் கேட்கவும்")}</span>
                </label>

                {formError && <p className="text-red-500 text-xs font-semibold">{formError}</p>}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {T("Posting Question...", "பதிவிடுகிறது...")}
                      </>
                    ) : (
                      T("Post Question to Community", "கேள்வியை பதிவிடவும்")
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {T("Cancel", "ரத்து")}
                  </button>
                </div>
              </form>
            )}

            <div id="ask-feed-top" className="scroll-mt-6" />

            {/* Questions Feed */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T(`No Questions in ${districtNameDisplay}`, `${districtNameDisplay} - கேள்விகள் எதுவும் இல்லை`)}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  {T(
                    "Be the first to ask a local question! Your neighbors will be notified to share their insights.",
                    "முதலில் ஒரு கேள்வியைக் கேளுங்கள்! அருகிலுள்ள மக்கள் பதில் அளிப்பார்கள்."
                  )}
                </p>
                <button
                  onClick={handleToggleForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {T("Ask the First Question", "முதல் கேள்வியைக் கேளுங்கள்")}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {paginatedQuestions.map((q) => {
                  const isAnswered = q.status === "answered" || (q.answer_count || 0) > 0;
                  const questionShareText = encodeURIComponent(
                    `❓ *${q.title}*
` +
                    `Area: ${q.district_name || ""} ${q.area_name ? `(${q.area_name})` : ""}
` +
                    `Can you answer this? https://www.vizhitn.in/question/${q.id}`
                  );

                  return (
                    <div
                      key={q.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:border-purple-400 dark:hover:border-purple-500 shadow-xs hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isAnswered
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                          }`}
                        >
                          {isAnswered ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <HelpCircle className="w-5 h-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Top Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                isAnswered
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                                  : "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800"
                              }`}
                            >
                              {isAnswered ? T("✓ ANSWERED", "✓ பதிலளிக்கப்பட்டது") : T("❓ OPEN QUESTION", "❓ கேள்வி")}
                            </span>

                            {q.district_name && (
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-purple-500" />
                                {q.area_name ? `${q.area_name}, ` : ""}{q.district_name}
                              </span>
                            )}

                            {q.category_name && (
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {q.category_name}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            <Link to={`/question/${q.id}`} className="hover:underline">
                              {q.title}
                            </Link>
                          </h4>

                          {/* Content Snippet */}
                          {q.content && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                              {q.content}
                            </p>
                          )}

                          {/* Footer Info & Actions */}
                          <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {q.created_date ? formatDistanceToNow(new Date(q.created_date), { addSuffix: true }) : ""}
                              </span>

                              <Link
                                to={`/question/${q.id}`}
                                className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:underline"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                {q.answer_count || 0} {T("answers", "பதில்கள்")}
                              </Link>
                            </div>

                            <a
                              href={`https://api.whatsapp.com/send?text=${questionShareText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              {T("Share", "பகிர்க")}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Numbered Pagination */}
            {filtered.length > 0 && (
              <NumberedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
                scrollTargetId="ask-feed-top"
                itemLabel={{ en: "questions", ta: "கேள்விகள்" }}
              />
            )}

            {/* Universal SEO Cross-Links */}
            <UniversalCrossLinks pageType="ask" />
          </div>

          {/* Right Column: Community Guidelines & Fast Answers */}
          <aside className="space-y-6">
            {/* How to Get Fast Answers Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                {T("How to Get Quick Answers", "விரைவான பதில்களைப் பெற")}
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">Be location specific:</strong> Mention the specific street, bus stop, ward, or taluk for accurate local advice.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">Choose the category:</strong> Helps local experts in electricity, schools, or transport find your inquiry faster.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white">Give helpful answers:</strong> Answering questions builds your community trust score and unlocks badges.
                  </span>
                </li>
              </ul>
            </div>

            {/* Verified Civic Helplines Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-500" />
                {T("Emergency & Official Lines", "அவசர உதவி எண்கள்")}
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span>{T("Power Outage / TANGEDCO", "மின்சார வாரியம்")}</span>
                  <a href="tel:1912" className="font-bold text-purple-600 dark:text-purple-400">1912</a>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span>{T("GCC Flood & Municipal", "மாநகராட்சி கட்டுப்பாடு")}</span>
                  <a href="tel:1913" className="font-bold text-emerald-600 dark:text-emerald-400">1913</a>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span>{T("Cyber Fraud Helpline", "சைபர் கிரைம் உதவி எண்")}</span>
                  <a href="tel:1930" className="font-bold text-rose-600 dark:text-rose-400">1930</a>
                </li>
                <li className="flex justify-between items-center py-1.5">
                  <span>{T("CM Citizen Helpline", "முதல்வர் உதவி மையம்")}</span>
                  <a href="tel:1100" className="font-bold text-blue-600 dark:text-blue-400">1100</a>
                </li>
              </ul>
            </div>

            {/* WhatsApp Community Alerts Channel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                {T("VizhiTN WhatsApp Channel", "வாட்ஸ்அப் சேனல்")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {T(
                  "Get verified daily local alerts, government announcements, and school holidays directly on WhatsApp.",
                  "தினசரி குடிமை அறிவிப்புகள் மற்றும் அவசர தகவல்களை வாட்ஸ்அப்பில் உடனுக்குடன் பெற இணையுங்கள்."
                )}
              </p>
              <a
                href="https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {T("Join WhatsApp Channel", "வாட்ஸ்அப் சேனலில் இணைய")}
              </a>
            </div>

            {/* Civic Receipt CTA Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-900/60 p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800 mb-2">
                {T("Civic Proof Tool", "குடிமை சான்று")}
              </span>
              <h4 className="text-sm font-bold text-white mb-1.5">
                {T("Report an Unresolved Grievance?", "தீர்க்கப்படாத பொதுப் புகாரா?")}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {T(
                  "File a documented Civic Receipt with photo evidence and reference ID for municipal, electricity, or water engineers.",
                  "புகைப்பட சான்றுடன் கூடிய அதிகாரப்பூர்வ குடிமை ரசீதை உருவாக்கி அரசு அதிகாரிகளுக்கு அனுப்பலாம்."
                )}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all"
              >
                {T("File Civic Receipt", "குடிமை ரசீது உருவாக்குக")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
