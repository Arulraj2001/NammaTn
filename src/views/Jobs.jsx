"use client";
import React, { useState, useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, X, Loader2, AlertTriangle, Search, ShieldCheck, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { supabase } from "@/api/supabaseClient";
import { createJob, detectSuspiciousJob, getActiveJobs } from "@/services/jobAlerts";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";
import JobCard from "@/components/phase8/JobCard";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { useNotify } from "@/hooks/useNotify";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

const JOB_TYPES = [
  { value: "part_time", label: "Part-time", icon: "⏱" },
  { value: "temporary", label: "Temporary", icon: "⏳" },
  { value: "local_hiring", label: "Local Hiring", icon: "🏠" },
  { value: "delivery", label: "Delivery", icon: "📦" },
  { value: "helper", label: "Helper Required", icon: "🔧" },
  { value: "urgent_manpower", label: "Urgent Manpower", icon: "⚡" },
  { value: "other", label: "Other", icon: "···" },
];

export default function Jobs({ initialJobs = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();

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

  const { notify } = useNotify();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(6);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), "Sign in to post a job alert");
      return;
    }
    setShowForm(f => !f);
  };

  const [form, setForm] = useState({
    title: "", description: "", job_type: "local_hiring",
    district_slug: "", district_name: "", area_slug: "", area_name: "",
    salary_info: "", duration: "", contact_info: "", contact_visible: false,
  });
  const [formError, setFormError] = useState(null);

  usePageMeta({ title: "VizhiTN - Local Jobs", description: "Discover local job updates and employment opportunities shared for Tamil Nadu communities. Report suspicious job posts." });

  const { data: rawJobs = [], isLoading } = useQuery({
    queryKey: ["jobs", filterDistrict, filterType],
    queryFn: () => getActiveJobs(100, filterDistrict, filterType),
    initialData: !filterDistrict && !filterType ? initialJobs : undefined,
    staleTime: 300_000,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-district-jobs", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      setShowForm(false);
      setForm({ title: "", description: "", job_type: "local_hiring", district_slug: "", district_name: "", area_slug: "", area_name: "", salary_info: "", duration: "", contact_info: "", contact_visible: false });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.description.trim() || !form.district_slug) {
      setFormError("Please fill in title, description and district.");
      return;
    }
    if (!checkRateLimit("job_post", 2, 60 * 60_000)) { setFormError("Please wait before posting another job."); return; }
    if (form.contact_visible && !form.contact_info.trim()) { setFormError("Please enter contact info or uncheck 'Show contact info publicly'."); return; }
    const title = sanitizeText(form.title).substring(0, 200);
    const description = sanitizeText(form.description).substring(0, 1000);
    const isSuspicious = detectSuspiciousJob(title, description);
    mutation.mutate({ ...form, title, description, status: "pending", safety_status: isSuspicious ? "suspicious" : "pending_review" }, {
      onSuccess: (created) => {
        notify({
          type: "job_pending_review",
          title: "Job submitted for review",
          message: `Your job post "${title.substring(0, 60)}" has been submitted and will be published after admin approval.`,
          target_type: "job_alert",
          target_id: created?.id || "",
        });
      },
    });
  };

  // Process Search & Sort
  const processedJobs = useMemo(() => {
    let result = [...rawJobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.company_or_poster_name?.toLowerCase().includes(q) ||
        j.district_name?.toLowerCase().includes(q) ||
        j.area_name?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
    } else if (sortBy === "salary_high") {
      result.sort((a, b) => (b.salary_info ? 1 : -1));
    } else {
      result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    }
    return result;
  }, [rawJobs, search, sortBy]);

  const displayedJobs = processedJobs.slice(0, visibleCount);
  const hasMore = visibleCount < processedJobs.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* ── Manual Breadcrumb ── */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-3 pb-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:underline">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-800 dark:text-white">Jobs</span>
        </div>
      </div>

      {/* ── Main Green Hero Banner (Full width extended & compact height) ── */}
      <div className="w-full px-4 sm:px-6 pt-3 pb-2">
        <div className="max-w-[1400px] mx-auto bg-[#044732] dark:bg-[#033626] rounded-3xl p-4 sm:p-5 md:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Left Column: Title & Action */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/15">
                  <Briefcase className="w-5 h-5 text-emerald-200" />
                </div>
                <span className="bg-white/10 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/15">
                  {T("Community Job Alerts", "சமுதாய வேலை எச்சரிக்கைகள்")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {T("Local Jobs", "உள்ளூர் வேலை")}
              </h1>

              <p className="text-emerald-100 text-xs leading-relaxed max-w-xl">
                {T(
                  "Find genuine local jobs shared by Tamil Nadu communities. Report suspicious posts. Help others get hired.",
                  "தமிழ்நாடு சமுதாயங்களால் பகிரப்பட்ட உண்மையான உள்ளூர் வேலைகளை கண்டுபிடிக்கவும்."
                )}
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={handleToggleForm}
                  className="bg-white text-[#044732] font-extrabold text-xs px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all shadow-md flex items-center gap-1.5"
                >
                  {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showForm ? T("Cancel", "ரத்து") : T("+ Post a Job", "+ வேலை பதிவிடு")}
                </button>
                <Link
                  to="/scams"
                  className="border border-white/30 hover:bg-white/10 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                >
                  {T("Report Scam Job", "மோசடி வேலை புகாரளி")}
                </Link>
              </div>
            </div>

            {/* Right Column: 4 Stat Boxes (Compact height) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-3 text-center flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="text-base">📋</span>
                  <span className="text-lg sm:text-xl font-black text-white">{rawJobs.length || 5}</span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">Jobs Posted</p>
              </div>

              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-3 text-center flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="text-base">👥</span>
                  <span className="text-lg sm:text-xl font-black text-white">2.3K+</span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">Active Seekers</p>
              </div>

              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-3 text-center flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="text-base">📑</span>
                  <span className="text-lg sm:text-xl font-black text-white">18</span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">Categories</p>
              </div>

              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-3 text-center flex flex-col justify-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="text-base">📍</span>
                  <span className="text-xs font-bold text-white leading-tight">All TN Districts</span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">Coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2">
        {/* ── Safety Disclaimer Bar ── */}
        <div className="bg-[#fffdf7] dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3 mb-5 flex items-center gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-snug">
            {T(
              "Do not pay money for job offers. Report fake jobs, advance-fee scams, and suspicious recruiters.",
              "வேலை வாய்ப்புகளுக்கு பணம் செலுத்தாதீர்கள். போலி வேலைகள் மற்றும் முன்பணம் மோசடிகளை புகாரளிக்கவும்."
            )}
          </p>
        </div>

        {/* Form Modal / Inline Drawer */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-300 dark:border-slate-700 p-6 mb-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">{T("Post a Work Alert", "வேலை எச்சரிக்கையை பதிவிடுங்கள்")}</h3>
              {isAuthenticated && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{T("Your Score", "உங்கள் மதிப்பு")}</span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">★ {profile?.trust_score || 10}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 font-medium">
              {T("⚠ Job posts require admin approval before publishing.", "⚠ வேலை பதிவுகள் வெளியிடப்படும் முன் நிர்வாக ஒப்புதல் தேவை.")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.job_type} onChange={(e) => setForm(f => ({ ...f, job_type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold focus:outline-none">
                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={T("Title (e.g. Sales Assistant Required)", "தலைப்பு")}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none" />
            </div>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={T("Details about the work...", "வேலை விவரங்கள்...")} rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs resize-none focus:outline-none" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.district_slug} onChange={(e) => {
                const d = DISTRICTS.find(d => d.slug === e.target.value);
                setForm(f => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "", area_slug: "", area_name: "" }));
              }} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none">
                <option value="">{T("District *", "மாவட்டம் *")}</option>
                {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
              </select>
              <select value={form.area_slug} onChange={(e) => {
                const a = areas.find(a => a.slug === e.target.value);
                setForm(f => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
              }} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none">
                <option value="">{T("Area", "பகுதி")}</option>
                {areas.map(a => <option key={a.slug} value={a.slug}>{T(a.name_en, a.name_ta)}</option>)}
              </select>
              <input value={form.salary_info} onChange={(e) => setForm(f => ({ ...f, salary_info: e.target.value }))}
                placeholder={T("Salary (e.g. ₹13,000 - ₹15,000 / month)", "சம்பளம்")}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none" />
              <input value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                placeholder={T("Duration / Work Type (e.g. Permanent, Full-time)", "காலம்")}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={form.contact_visible} onChange={(e) => setForm(f => ({ ...f, contact_visible: e.target.checked }))} className="accent-emerald-600" />
              {T("Show contact info publicly", "தொடர்பு தகவலை பகிரங்கமாக காட்டு")}
            </label>
            {form.contact_visible && (
              <input value={form.contact_info} onChange={(e) => setForm(f => ({ ...f, contact_info: e.target.value }))}
                placeholder={T("Contact info (e.g. Walk-in address or Phone: 9840998877)", "தொடர்பு தகவல்")}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none" />
            )}
            {formError && <p className="text-red-500 text-xs">{formError}</p>}
            <button type="submit" disabled={mutation.isPending}
              className="w-full py-3 bg-[#044732] hover:bg-[#033626] text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-60 shadow-md">
              {mutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Submitting...</span> : T("Submit for Review", "மதிப்பாய்விற்கு சமர்ப்பி")}
            </button>
          </form>
        )}

        {/* ── Search & Filter Box Card ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* District Select */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">District</label>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
              </select>
            </div>

            {/* Search Input */}
            <div className="md:col-span-6">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search Jobs</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, company or keywords..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Sort By Select */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="latest">Latest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Category Pill Tabs Row ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          <button
            onClick={() => setFilterType("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all border ${
              filterType === ""
                ? "bg-[#044732] text-white border-[#044732] shadow-sm"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            💼 All Jobs
          </button>
          {JOB_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all border ${
                filterType === t.value
                  ? "bg-[#044732] text-white border-[#044732] shadow-sm"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Jobs Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 mb-8">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{T("No local jobs found.", "இன்னும் உள்ளூர் வேலை புதுப்பிப்புகள் இல்லை.")}</p>
            <p className="text-xs text-slate-400 mt-1">{T("Try clearing search filters or post a job.", "தேடல் வடிப்பான்களை அழிக்கவும் அல்லது ஒரு வேலையைப் பதிவிடவும்.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {displayedJobs.map(j => <JobCard key={j.id} item={j} />)}
          </div>
        )}

        {/* ── Load More Jobs Button ── */}
        {hasMore && (
          <div className="text-center my-8">
            <button
              onClick={() => setVisibleCount(v => v + 6)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs hover:bg-slate-50 transition-all"
            >
              <span>Load More Jobs</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Related Links Section ── */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Explore Related Sections</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/stay" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{T("Find a Room / PG Stay", "அறை / தங்குமிடம் தேடுங்கள்")}</p>
                <p className="text-xs text-slate-500">{T("Explore PG stays, shared rooms & hostels", "PG, பகிர்ந்த அறைகள் மற்றும் விடுதிகள்")}</p>
              </div>
            </Link>
            <Link to="/listings" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-[#044732] hover:shadow-md transition-all group">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#044732] dark:group-hover:text-emerald-400">{T("Local Services & Directory", "உள்ளூர் சேவைகள்")}</p>
                <p className="text-xs text-slate-500">{T("Discover verified local businesses near you", "உங்கள் பகுதியில் உள்ள வணிகங்கள்")}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Universal SEO Cross-Links */}
        <div className="mt-6">
          <UniversalCrossLinks pageType="jobs" />
        </div>
      </div>
    </div>
  );
}
