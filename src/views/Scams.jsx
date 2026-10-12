"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert, Plus, X, Loader2, Search, PhoneCall, AlertTriangle,
  ShieldCheck, Share2, MessageCircle, MapPin, CheckCircle2,
  ExternalLink, ArrowRight, Shield, AlertOctagon, HelpCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { getActiveScams, createScamAlert } from "@/services/scamAlerts";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";
import { injectFAQStructuredData } from "@/lib/seo";
import ScamCard from "@/components/phase8/ScamCard";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import dynamic from "next/dynamic";
import { supabase } from "@/api/supabaseClient";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";
import NumberedPagination from "@/components/common/NumberedPagination";

const LocationPickerMap = dynamic(() => import("@/components/media/LocationPickerMap"), { ssr: false });

const PAGE_SIZE = 8;

const SCAM_TYPES = [
  { value: "all", label_en: "All Alerts", label_ta: "அனைத்தும்", icon: ShieldAlert },
  { value: "fake_job", label_en: "Fake Job Scam", label_ta: "போலி வேலை மோசடி", icon: ShieldAlert },
  { value: "fake_agent", label_en: "Fake Agent / Visa", label_ta: "போலி ஏஜென்ட் / விசா", icon: ShieldAlert },
  { value: "fraud_call", label_en: "Fraud Call / SMS", label_ta: "மோசடி அழைப்பு / SMS", icon: AlertTriangle },
  { value: "online_scam", label_en: "Online UPI Scam", label_ta: "ஆன்லைன் UPI மோசடி", icon: AlertOctagon },
  { value: "fake_document", label_en: "Fake Document Service", label_ta: "போலி ஆவண சேவை", icon: AlertTriangle },
  { value: "local_cheating", label_en: "Local Cheating", label_ta: "உள்ளூர் ஏமாற்று வேலை", icon: ShieldAlert },
  { value: "other", label_en: "Other Alert", label_ta: "பிற எச்சரிக்கைகள்", icon: ShieldAlert },
];

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

export default function Scams({ initialScams = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const qc = useQueryClient();
  const { isAuthenticated, user: profile } = useAuth();
  const { requireAuth } = useAuthModal();

  usePageMeta({
    title: "Scam Alerts & Cyber Fraud Helpline Tamil Nadu | VizhiTN",
    description: "View and report local scam alerts, fake job offers, rental frauds, online UPI cheating, and Cyber Crime helpline 1930 resources in Tamil Nadu.",
  });

  useEffect(() => {
    const scamFaqs = [
      {
        question: "How do I report a cyber crime or online financial fraud in Tamil Nadu?",
        answer: "Call the National Cyber Crime Helpline toll-free at 1930 immediately within the golden hour, or file a complaint online at cybercrime.gov.in."
      },
      {
        question: "How to identify a fake job offer or illegal recruitment agency in Tamil Nadu?",
        answer: "Verify if the agency is registered under the Ministry of External Affairs Overseas Employment Portal (emigrate.gov.in). Never pay money upfront for government job selection."
      },
      {
        question: "How do I verify rental or property scams on VizhiTN?",
        answer: "Check the Scam Alerts dashboard for reported phone numbers, UPI IDs, and fraudulent agent patterns before transferring advance tokens."
      }
    ];
    injectFAQStructuredData(scamFaqs, "scam-alerts");
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    title: "",
    description: "",
    scam_type: "fake_job",
    district_slug: "",
    district_name: "",
    area_slug: "",
    area_name: "",
    warning_level: "medium",
    is_anonymous: true,
    latitude: null,
    longitude: null,
  });
  const [formError, setFormError] = useState(null);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(
        () => setShowForm(true),
        T("Sign in to report a scam alert", "மோசடியை புகாரளிக்க உள்நுழையுங்கள்")
      );
      return;
    }
    setShowForm((f) => !f);
  };

  const { data: rawScams = [], isLoading } = useQuery({
    queryKey: ["scams", filterDistrict === "all" ? "" : filterDistrict],
    queryFn: () =>
      filterDistrict !== "all"
        ? base44.entities.ScamAlert.filter({ status: "active", district_slug: filterDistrict }, "-created_date", 100)
        : getActiveScams(100),
    initialData: filterDistrict === "all" ? initialScams : undefined,
    staleTime: 300_000,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-scam", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createScamAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scams"] });
      qc.invalidateQueries({ queryKey: ["admin-scams"] });
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        scam_type: "fake_job",
        district_slug: "",
        district_name: "",
        area_slug: "",
        area_name: "",
        warning_level: "medium",
        is_anonymous: true,
        latitude: null,
        longitude: null,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.description.trim() || !form.district_slug) {
      setFormError(T("Please fill all required fields.", "தயவுசெய்து தேவையான அனைத்து விவரங்களையும் நிரப்பவும்."));
      return;
    }
    if (!checkRateLimit("scam_report", 2, 30 * 60_000)) {
      setFormError(T("Please wait before submitting another report.", "அடுத்த அறிக்கையைச் சமர்ப்பிக்க சற்று காத்திருக்கவும்."));
      return;
    }
    mutation.mutate({
      ...form,
      title: sanitizeText(form.title).substring(0, 200),
      description: sanitizeText(form.description).substring(0, 1000),
      status: "pending",
    });
  };

  // Filter scams by type and search query
  const filteredScams = useMemo(() => {
    return rawScams.filter((item) => {
      const matchType = filterType === "all" || item.scam_type === filterType;
      const text = `${item.title || ""} ${item.description || ""} ${item.area_name || ""} ${item.district_name || ""}`.toLowerCase();
      const matchSearch = !searchQuery.trim() || text.includes(searchQuery.toLowerCase().trim());
      return matchType && matchSearch;
    });
  }, [rawScams, filterType, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredScams.length / PAGE_SIZE) || 1;
  const paginatedScams = filteredScams.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedDistrictObj = DISTRICTS.find((d) => d.slug === filterDistrict);
  const districtNameDisplay = selectedDistrictObj
    ? (lang === "ta" ? selectedDistrictObj.name_ta : selectedDistrictObj.name_en)
    : T("All Tamil Nadu Districts", "அனைத்து மாவட்டங்கள்");

  const pageUrl = "https://www.vizhitn.in/scams";
  const shareText = encodeURIComponent(
    `⚠️ *${districtNameDisplay} Local Scam & Cyber Fraud Alerts*
` +
    `Active Warnings: ${filteredScams.length} fraud patterns documented
` +
    `Helpline: Cyber Crime 1930 | Check details: ${pageUrl}`
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-red-700 via-rose-800 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rose-200 mb-3 border border-rose-400/30">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                {filterDistrict !== "all"
                  ? `${districtNameDisplay.toUpperCase()} CYBER DESK`
                  : T("STATEWIDE CYBER & SCAM ADVISORY", "மாநில சைபர் குற்ற & மோசடி எச்சரிக்கை")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 text-white">
                {filterDistrict !== "all"
                  ? `${districtNameDisplay} ${T("Scam Alerts & Fraud Warnings", "மோசடி எச்சரிக்கைகள்")}`
                  : T("Scam Alerts & Cyber Fraud Warnings", "மோசடி எச்சரிக்கைகள் & சைபர் விழிப்புணர்வு")}
              </h1>
              <p className="text-rose-100 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
                {T(
                  `Documented public awareness alerts on fake job offers, illegal visa consultants, advance rent scams, and fraudulent phone calls across ${filterDistrict !== "all" ? districtNameDisplay : "all 38 districts"}.`,
                  `போலி வேலை வாய்ப்பு, பதிவு செய்யப்படாத விசா ஏஜென்சிகள், வாடகை முன்பண மோசடி மற்றும் நிதி மோசடி அழைப்புகள் பற்றிய நேரடி பொது விழிப்புணர்வு.`
                )}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <Link
                  to="/create"
                  className="inline-flex items-center text-xs font-bold bg-white text-slate-900 hover:bg-rose-100 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                >
                  {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
                </Link>
                <Link
                  to="/bribes"
                  className="inline-flex items-center text-xs font-bold border border-white/40 hover:bg-white/10 text-white px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  ⚖ {T("Bribe Tracker Log", "லஞ்சப் புகார் கண்காணிப்பு")}
                </Link>
                <span className="text-rose-200/80 text-[11px] block sm:inline">
                  🔒 {T("Public awareness only. Posts are strictly moderated.", "பொது விழிப்புணர்விற்காக மட்டுமே.")}
                </span>
              </div>
            </div>

            {/* National Cyber Crime Helpline Card */}
            <div className="bg-black/35 backdrop-blur-lg border border-rose-400/30 rounded-2xl p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 text-rose-200 text-xs font-bold tracking-wider uppercase">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                {T("Cyber Crime Toll-Free", "சைபர் குற்ற அவசர உதவி")}
              </div>
              <div className="flex items-baseline gap-3">
                <a
                  href="tel:1930"
                  className="text-3xl font-black tracking-tight text-white hover:text-rose-300 transition-colors"
                >
                  1930
                </a>
                <span className="text-xs text-rose-200/80 font-bold uppercase">
                  ({T("24x7 Golden Hour", "உடனடி உதவி")})
                </span>
              </div>
              <p className="text-xs text-rose-200/70 border-t border-rose-400/20 pt-2">
                {T(
                  "Call within 24 hours to freeze fraudulent bank transfers | cybercrime.gov.in",
                  "மோசடி பரிவர்த்தனையை உடனே நிறுத்த 1930 எண்ணை அழைக்கவும் | cybercrime.gov.in"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-3.5">
          {/* Top Row: Search Box + 38 District Dropdown + Report Button */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T("Search scam pattern, agency, or area...", "மோசடி முறை, நிறுவனம் அல்லது பகுதி தேடுக...")}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick 38 District Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="all">📍 {T("All Districts (38)", "அனைத்து மாவட்டங்கள் (38)")}</option>
                {DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name_en} - {d.name_ta}
                  </option>
                ))}
              </select>

              {/* Report Button */}
              <button
                onClick={handleToggleForm}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? T("Cancel", "ரத்து") : T("Report Scam Pattern", "மோசடியை புகாரளி")}
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
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(dist.name_en, dist.name_ta)}
              </button>
            ))}
          </div>

          {/* Scam Types Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              {T("Category:", "பிரிவு:")}
            </span>
            {SCAM_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilterType(t.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  filterType === t.value
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-bold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(t.label_en, t.label_ta)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HIGH-IMPACT GLANCEABLE STATUS CARD ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 dark:from-red-950/30 dark:via-rose-950/20 dark:to-amber-950/20 border-rose-300 dark:border-rose-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {filteredScams.length > 0
                    ? T("ACTIVE FRAUD WARNINGS", "செயலில் உள்ள மோசடி எச்சரிக்கைகள்")
                    : T("NO CRITICAL SCAMS LOGGED", "பெரிய மோசடிகள் பதிவாகவில்லை")}
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
                {filteredScams.length > 0
                  ? T(
                      `⚠️ ${filteredScams.length} Fraud Patterns Documented in ${districtNameDisplay}`,
                      `⚠️ ${districtNameDisplay} - ${filteredScams.length} மோசடி எச்சரிக்கைகள் பதிவாகியுள்ளன`
                    )
                  : T(
                      `✅ No Major Scam Patterns Documented in ${districtNameDisplay}`,
                      `✅ ${districtNameDisplay} - புதிய மோசடி எச்சரிக்கைகள் எதுவும் பதிவாகவில்லை`
                    )}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {filteredScams.length > 0
                  ? T(
                      "Protect yourself against fraudulent hiring agencies demanding fees, advance token property cheats, and spoofed bank messages. Dial 1930 immediately if money has been deducted.",
                      "முன்பணம் கேட்கும் போலி நிறுவனங்கள் மற்றும் போலி வங்கி செய்திகளில் இருந்து பாதுகாப்பாக இருங்கள். வங்கி மோசடி நடந்தால் உடனடியாக 1930 எண்ணிற்கு அழையுங்கள்."
                    )
                  : T(
                      "No unverified cheating patterns currently logged for this search. Always verify recruiters on the MEA Overseas Portal before making payments.",
                      "தற்போதைக்கு புதிய மோசடி எதுவும் பதிவாகவில்லை. வெளிநாட்டு வேலைகளுக்கு செல்லும் முன் மத்திய அரசின் emigrate.gov.in தளத்தில் சரிபார்க்கவும்."
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
                {T("Share Alerts on WhatsApp", "வாட்ஸ்அப்பில் பகிர்க")}
              </a>

              <a
                href="https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {T("Join VizhiTN WhatsApp Scam Watch", "மோசடி கண்காணிப்பு சேனல்")}
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
            {/* Feed Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                {T(
                  filterDistrict === "all" ? "Documented Scam Alerts" : `${districtNameDisplay} Scam Alerts`,
                  filterDistrict === "all" ? "பதிவான மோசடி எச்சரிக்கைகள்" : `${districtNameDisplay} எச்சரிக்கைகள்`
                )}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800">
                {filteredScams.length} {T("Alerts", "எச்சரிக்கைகள்")}
              </span>
            </div>

            {/* Legal Notice Callout */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4">
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                {T(
                  "⚠ Legal Notice: All scam reports are for public awareness only. Do not post unverified personal accusations or individual names. All submissions are moderated before publishing.",
                  "⚠ சட்ட அறிவிப்பு: அனைத்து மோசடி அறிக்கைகளும் பொது விழிப்புணர்விற்காக மட்டுமே. தனிநபர்களை நேரடியாக தாக்கும் சொற்களைத் தவிர்க்கவும். பதிவுகள் அனைத்தும் தணிக்கைக்கு உட்பட்டவை."
                )}
              </p>
            </div>

            {/* Report Form (Collapsible Card) */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-300 dark:border-red-800 p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {T("Report a Scam Pattern / Fraud Alert", "மோசடி முறையை புகாரளிக்கவும்")}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {T("Describe the modus operandi factually to warn others.", "மற்றவர்கள் ஏமாறாமல் இருக்க முறையை உண்மையாக விவரிக்கவும்.")}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                        {T("Trust Score", "மதிப்பு")}
                      </span>
                      <span className="text-sm font-extrabold text-red-700 dark:text-red-300">
                        ★ {profile?.trust_score || 10}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scam Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {T("Scam Pattern Type *", "மோசடி வகை *")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SCAM_TYPES.filter((t) => t.value !== "all").map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, scam_type: t.value }))}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center gap-2 ${
                          form.scam_type === t.value
                            ? "bg-red-600 border-red-600 text-white shadow-sm"
                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{T(t.label_en, t.label_ta)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("Alert Title (Pattern Description) *", "தலைப்பு (முறையின் சுருக்கம்) *")}
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={T("e.g. Fake IT Company Job Offer asking ₹5,000 for Laptop Security Deposit", "எ.கா. லேப்டாப் டெபாசிட் கேட்டு ₹5000 ஏமாற்றும் போலி நிறுவனம்")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("Modus Operandi Details *", "மோசடி முறை விவரங்கள் *")}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={T("Describe how they contacted you, what they demanded, and suspicious signs (factual wording only)...", "அவர்கள் எவ்வாறு தொடர்பு கொண்டார்கள், என்ன கோரினார்கள்...")}
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* District, Warning Level, and Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
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
                      {T("Warning Level", "எச்சரிக்கை அளவு")}
                    </label>
                    <select
                      value={form.warning_level}
                      onChange={(e) => setForm((f) => ({ ...f, warning_level: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                    >
                      <option value="low">🟡 Low Warning (Suspicious Notice)</option>
                      <option value="medium">🟠 Medium Warning (Active Scheme)</option>
                      <option value="high">🔴 High Warning (Significant Loss)</option>
                      <option value="critical">🚨 Critical Warning (Organized Syndicate)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {T("Area / Suburb (Optional)", "பகுதி (விருப்பத்தேர்வு)")}
                    </label>
                    {areas.length > 0 ? (
                      <select
                        value={form.area_slug}
                        onChange={(e) => {
                          const a = areas.find((a) => a.slug === e.target.value);
                          setForm((f) => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
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
                        placeholder={T("e.g. Guindy / Gandhipuram", "எ.கா. கிண்டி / காந்திபுரம்")}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                </div>

                {/* Map Location */}
                <LocationPickerMap
                  districtSlug={form.district_slug}
                  latitude={form.latitude}
                  longitude={form.longitude}
                  onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
                />

                {formError && <p className="text-red-500 text-xs font-semibold">{formError}</p>}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {T("Submitting for Review...", "சமர்ப்பிக்கிறது...")}
                      </>
                    ) : (
                      T("Submit Scam Alert for Review", "எச்சரிக்கையை சமர்ப்பிக்கவும்")
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

            <div id="scams-feed-top" className="scroll-mt-6" />

            {/* Feed List */}
            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredScams.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T(`No Scam Alerts Logged in ${districtNameDisplay}`, `${districtNameDisplay} - மோசடி எச்சரிக்கைகள் இல்லை`)}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  {T(
                    "No active scam or cheating patterns reported matching your filters. Stay vigilant and report suspicious solicitations.",
                    "தேடலுக்குரிய மோசடி எச்சரிக்கைகள் எதுவும் பதிவாகவில்லை. சந்தேகமான அழைப்புகள் வந்தால் எச்சரிக்கையாக இருங்கள்."
                  )}
                </p>
                <button
                  onClick={handleToggleForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {T("Report a Suspicious Activity", "மோசடி முறையை புகாரளி")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedScams.map((s) => (
                  <ScamCard key={s.id} item={s} />
                ))}
              </div>
            )}

            {/* Numbered Pagination */}
            {filteredScams.length > 0 && (
              <NumberedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredScams.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
                scrollTargetId="scams-feed-top"
                itemLabel={{ en: "scam alerts", ta: "மோசடி எச்சரிக்கைகள்" }}
              />
            )}

            {/* Universal SEO Cross Links */}
            <UniversalCrossLinks pageType="scams" />
          </div>

          {/* Right Column: Cyber Crime Helplines & Verification Tools */}
          <aside className="space-y-6">
            {/* National Cyber Crime 1930 "Golden Hour" Protocol */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                {T("Golden Hour Protocol (1930)", "கோல்டன் ஹவர் நெறிமுறை (1930)")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {T(
                  "If you have transferred money in an online financial fraud, calling 1930 within 2 to 24 hours immediately notifies the Indian Cyber Crime Coordination Centre (I4C) to freeze the fraudster's bank account or digital wallet.",
                  "வங்கி மோசடி மூலம் பணம் திருடப்பட்டால், 24 மணி நேரத்திற்குள் 1930 எண்ணிற்கு அழைத்தால், உடனடியாக குற்றவாளியின் கணக்கை முடக்க நடவடிக்கை எடுக்கப்படும்."
                )}
              </p>
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="tel:1930"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold text-xs hover:bg-red-100 transition-colors"
                >
                  <span>{T("Call Cyber Crime Helpline", "சைபர் உதவி எண் அழைக்க")}</span>
                  <span className="font-black text-sm">1930</span>
                </a>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 transition-colors"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Official Verification Checkpoints */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {T("Verify Before Paying", "பணம் செலுத்தும் முன் சரிபார்க்க")}
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                    {T("Overseas Job Recruiters", "வெளிநாட்டு வேலை ஏஜென்சிகள்")}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Check if the agency is licensed by Ministry of External Affairs.
                  </p>
                  <a
                    href="https://emigrate.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    emigrate.gov.in <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                    {T("Fraud SMS / Calls (Chakshu)", "மோசடி அழைப்புகள் (சக்ஷு)")}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Report suspected fraud communications directly to Department of Telecom.
                  </p>
                  <a
                    href="https://sancharsaathi.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    sancharsaathi.gov.in <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Civic Receipt CTA Card */}
            <div className="bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-2xl border border-rose-900/60 p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800 mb-2">
                {T("Document Corruption / Cheating", "குடிமை சான்று")}
              </span>
              <h4 className="text-sm font-bold text-white mb-1.5">
                {T("Demanded a Bribe or Token Fee?", "லஞ்சம் அல்லது முன்பணம் கேட்கப்பட்டதா?")}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {T(
                  "Log anonymous bribe demands on our Bribe Tracker to protect future citizens and establish a public record.",
                  "பெயர் வெளிப்படுத்தாமல் லஞ்சப் புகார்களைப் பதிவு செய்து மற்றவர்களைப் பாதுகாக்கவும்."
                )}
              </p>
              <Link
                to="/bribes"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-all"
              >
                {T("Open Bribe Tracker", "லஞ்சப் பதிவேட்டைத் திற")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
