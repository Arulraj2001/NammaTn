"use client";
import React, { useState, useMemo } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  Zap,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Building2,
  HelpCircle,
  Sparkles,
  Newspaper,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Home
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getDistrictBySlug } from "@/lib/districts";
import { toCdnMediaUrl } from "@/lib/cdn";
import { CATEGORIES } from "@/lib/categories";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { getDistrictPosts } from "@/services/posts";
import { getPublishedTnToday } from "@/services/tnToday";
import { getAreasByDistrict } from "@/services/areas";
import { getSituationsByDistrict } from "@/services/situations";
import { usePageMeta } from "@/hooks/usePageMeta";
import { injectFAQStructuredData, injectDistrictStructuredData } from "@/lib/seo";
import AdSlot from "@/components/ads/AdSlot";
import NumberedPagination from "@/components/common/NumberedPagination";

const HELPLINES = [
  { name_en: "Minnalagam EB", name_ta: "மின்வாரியம் 24x7", number: "1912", desc: "Power Cuts & Live Wires", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { name_en: "CM Special Cell", name_ta: "முதல்வர் உதவி மையம்", number: "1100", desc: "Official Grievance Escalation", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { name_en: "Municipal / Flood", name_ta: "நகராட்சி / வெள்ளக் கட்டுப்பாடு", number: "1913", desc: "Drainage, Water & Roads", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { name_en: "Cyber Crime", name_ta: "சைபர் கிரைம்", number: "1930", desc: "Financial Fraud & Fake SMS", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { name_en: "Emergency & 108", name_ta: "அவசர ஊர்தி", number: "108", desc: "Medical & Ambulance", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
];

const POSTS_PER_PAGE = 9;

export default function DistrictDetail({ initialSlug }) {
  const routeParams = useParams();
  const slug = initialSlug || routeParams?.city || routeParams?.slug;
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const district = getDistrictBySlug(slug);
  const districtName = district ? district.name_en : "District";

  // Tab State: 'alerts' | 'complaints' | 'fixed' | 'all'
  const [activeTab, setActiveTab] = useState("alerts");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const scrollToContent = () => {
    const el = document.getElementById("district-content-hub");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  usePageMeta({
    title: district
      ? `${T(district.name_en, district.name_ta)} Civic Hub & Municipal Complaints | VizhiTN`
      : undefined,
    description: district
      ? `Live TANGEDCO power cuts, municipal complaints, taluk alerts, and citizen-verified issue resolutions across ${district.name_en}, Tamil Nadu.`
      : undefined,
  });

  React.useEffect(() => {
    if (!district) return;
    injectDistrictStructuredData(district);

    const districtFaqs = [
      {
        question: `How do I report a road hazard, pothole, or garbage issue in ${districtName}?`,
        answer: `You can log a civic receipt on VizhiTN with a photo and location tag. VizhiTN formats the issue into an official complaint ready for ${districtName} Municipal Corporation / District Collectorate.`,
      },
      {
        question: `How can I check scheduled TANGEDCO power cuts in ${districtName}?`,
        answer: `Check active electricity alerts on the ${districtName} Civic Hub. Sub-station maintenance schedules and unscheduled outage updates are verified by local citizens.`,
      },
      {
        question: `What is the CM Cell helpline number for ${districtName} grievance escalation?`,
        answer: `The Tamil Nadu Chief Minister Special Cell toll-free helpline is 1100. Issues logged on VizhiTN generate formatted text ready for submission to the CM Cell portal.`,
      },
      {
        question: `How does community verification work in ${districtName}?`,
        answer: `When local residents verify a logged issue by uploading photos or confirming resolution status, it achieves Community Verified status.`,
      },
    ];

    injectFAQStructuredData(districtFaqs, slug);
  }, [district, slug, districtName]);

  // Queries
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["district-posts", slug],
    queryFn: () => getDistrictPosts(slug, 120),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["district-areas", slug],
    queryFn: () => getAreasByDistrict(slug),
    enabled: !!slug,
    staleTime: 120_000,
  });

  const { data: situations = [] } = useQuery({
    queryKey: ["district-situations", slug],
    queryFn: () => getSituationsByDistrict(slug, 10),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: tnTodayArticles = [] } = useQuery({
    queryKey: ["district-tn-today-news", slug],
    queryFn: () => getPublishedTnToday({ limit: 4 }),
    staleTime: 120_000,
  });

  // Segregated Content Pools
  const alertsList = useMemo(() => {
    return posts.filter(
      (p) =>
        p.post_type === "alert" ||
        p.urgency_level === "high" ||
        p.urgency_level === "critical"
    );
  }, [posts]);

  const complaintsList = useMemo(() => {
    return posts.filter(
      (p) =>
        p.post_type === "complaint" &&
        p.civic_status !== "citizen_verified_fixed"
    );
  }, [posts]);

  const fixedList = useMemo(() => {
    return posts.filter(
      (p) =>
        p.civic_status === "citizen_verified_fixed" ||
        p.civic_status === "claimed_fixed"
    );
  }, [posts]);

  // Tab Filtering & Area Filtering
  const displayedPosts = useMemo(() => {
    let pool = [];
    if (activeTab === "alerts") pool = alertsList;
    else if (activeTab === "complaints") pool = complaintsList;
    else if (activeTab === "fixed") pool = fixedList;
    else pool = posts;

    if (selectedArea !== "all") {
      pool = pool.filter(
        (p) =>
          p.area_slug === selectedArea ||
          (p.area_name && p.area_name.toLowerCase() === selectedArea.toLowerCase())
      );
    }

    if (activeTab === "all" && selectedCategory !== "all") {
      pool = pool.filter((p) => p.category_slug === selectedCategory);
    }

    return pool;
  }, [activeTab, alertsList, complaintsList, fixedList, posts, selectedArea, selectedCategory]);

  // Pagination calculation
  const totalPosts = displayedPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = useMemo(() => {
    return displayedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [displayedPosts, startIndex]);

  if (!district) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          {T("District not found.", "மாவட்டம் கண்டுபிடிக்கப்படவில்லை.")}
        </p>
        <Link to="/districts" className="mt-4 inline-block text-blue-600 hover:underline">
          {T("← Back to Districts", "← மாவட்டங்களுக்கு திரும்பு")}
        </Link>
      </div>
    );
  }

  const activeAlertCount = alertsList.length + situations.length;
  const activeGrievanceCount = complaintsList.length;
  const verifiedFixedCount = fixedList.length;
  const totalTaluksCount = areas.length > 0 ? areas.length : 8;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      {/* ── Breadcrumb & Back ── */}
      <nav aria-label="Breadcrumb" className="text-xs">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li className="flex items-center gap-1.5">
            <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-civic-600 dark:text-slate-400 dark:hover:text-civic-300 font-medium transition-colors">
              <Home className="w-3.5 h-3.5 text-civic-500" />
              <span>{T("Home", "முகப்பு")}</span>
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-civic-400 dark:text-civic-600 stroke-[2]" aria-hidden="true" />
            <Link to="/districts" className="text-slate-500 hover:text-civic-600 dark:text-slate-400 dark:hover:text-civic-300 font-medium transition-colors">
              {T("All Districts", "அனைத்து மாவட்டங்கள்")}
            </Link>
          </li>
          <li className="flex items-center gap-1.5 font-bold text-civic-900 dark:text-white">
            <ChevronRight className="w-3.5 h-3.5 text-civic-400 dark:text-civic-600 stroke-[2]" aria-hidden="true" />
            <span>{district.name_en}</span>
          </li>
        </ol>
      </nav>

      {/* ── ZONE 1: DISTRICT HERO & REAL-TIME STATUS BANNER (COMPACT SIZE) ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 lg:p-6 shadow-xl border border-blue-500/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 space-y-3.5">
          {/* Top Row: Region & Live Pulse */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-blue-200 border border-white/10">
              <MapPin className="w-3 h-3 text-blue-400" />
              {district.region} TAMIL NADU
            </span>

            {/* Live Pulse Badge */}
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/70 border border-white/10 text-[11px]">
              {activeAlertCount > 0 ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span className="text-amber-300 font-semibold">
                    {activeAlertCount} {T("Active Alert(s) Today", "செயலில் உள்ள எச்சரிக்கைகள்")}
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  <span className="text-emerald-300 font-semibold">
                    {T("Systems Normal", "இயல்பு நிலை")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Middle Row: Title Left, Action CTAs Right (Horizontal Compact) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex flex-wrap items-baseline gap-2.5 text-white">
                <span className="text-white drop-shadow-sm font-black">{district.name_en}</span>
                <span className="text-lg sm:text-2xl font-semibold text-blue-200 font-tamil">
                  {district.name_ta}
                </span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-200 leading-snug line-clamp-2 max-w-xl">
                {T(
                  `Hyperlocal civic grievance portal, verified utility alerts, and taluk-level resolution proof for ${district.name_en}.`,
                  `${district.name_en} மாவட்டத்திற்கான மின்தடை அறிவிப்புகள், குடிமை புகார்கள் மற்றும் சரிபார்க்கப்பட்ட தீர்வுகள்.`
                )}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to={`/create?district=${slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {T(`Report Issue`, `புகாரளி`)}
              </Link>

              <Link
                to={`/power-cuts-today-tamil-nadu/${slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {T("Power Cuts", "மின்வெட்டு")}
              </Link>
            </div>
          </div>

          {/* Compact 4-Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  {T("Alerts", "எச்சரிக்கைகள்")}
                </span>
                <p className="text-lg sm:text-xl font-black leading-tight text-white">{activeAlertCount}</p>
              </div>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                  {T("Grievances", "குடிமை புகார்கள்")}
                </span>
                <p className="text-lg sm:text-xl font-black leading-tight text-white">{activeGrievanceCount}</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-sky-400" />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                  {T("Fixed Proof", "தீர்வு")}
                </span>
                <p className="text-lg sm:text-xl font-black leading-tight text-white">{verifiedFixedCount}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 block">
                  {T("Coverage", "வட்டாரங்கள்")}
                </span>
                <p className="text-lg sm:text-xl font-black leading-tight text-white">{totalTaluksCount}+</p>
              </div>
              <Compass className="w-4 h-4 text-indigo-300" />
            </div>
          </div>
        </div>
      </div>

      {/* ── ZONE 2: 1-TAP VERIFIED HELPLINES SPEED-DIAL BAR ── */}
      <section aria-label="Official Government Helplines" className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {T(`1-Tap Verified Helplines (${district.name_en})`, `அரசு அவசர உதவி எண்கள் (${district.name_ta})`)}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                {T("Direct departmental contact numbers for instant civic escalation", "அவசர தேவைகளுக்கான நேரடி அரசு எண்கள்")}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            24x7 TOLL-FREE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {HELPLINES.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number}`}
              className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all hover:scale-[1.02] ${h.color}`}
            >
              <div>
                <p className="text-base sm:text-lg font-black tracking-tight">{h.number}</p>
                <p className="text-xs font-bold leading-tight mt-0.5">{T(h.name_en, h.name_ta)}</p>
              </div>
              <p className="text-[10px] opacity-80 mt-1 truncate">{h.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── ZONE 3: HYPERLOCAL TALUK / AREA FILTER ── */}
      {areas.length > 0 && (
        <section aria-label="Taluk and Area Navigation" className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {T("Filter by Taluk / Town:", "வட்டார வாரியாக வடிகட்ட:")}
            </span>
            {selectedArea !== "all" && (
              <button
                onClick={() => handleAreaChange("all")}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {T("Show All Taluks", "அனைத்து பகுதிகளும்")}
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
            <button
              onClick={() => handleAreaChange("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedArea === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
              }`}
            >
              {T("All Taluks", "அனைத்து பகுதிகள்")} ({posts.length})
            </button>

            {areas.map((area) => {
              const areaCount = posts.filter(
                (p) =>
                  p.area_slug === area.slug ||
                  (p.area_name && p.area_name.toLowerCase() === area.name_en.toLowerCase())
              ).length;

              return (
                <button
                  key={area.id || area.slug}
                  onClick={() => handleAreaChange(area.slug)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedArea === area.slug
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  <span>{T(area.name_en, area.name_ta || area.name_en)}</span>
                  {areaCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedArea === area.slug ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                      {areaCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── ZONE 4: PURPOSEFUL 4-TAB CIVIC CONTENT HUB (PAGINATED) ── */}
      <section id="district-content-hub" className="space-y-6 pt-2">
        {/* Tactile Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleTabChange("alerts")}
            className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all flex-shrink-0 ${
              activeTab === "alerts"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{T("Live Alerts", "நேரடி எச்சரிக்கைகள்")}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              {alertsList.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("complaints")}
            className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all flex-shrink-0 ${
              activeTab === "complaints"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{T("Active Grievances", "குடிமை புகார்கள்")}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
              {complaintsList.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("fixed")}
            className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all flex-shrink-0 ${
              activeTab === "fixed"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{T("Victory Wall / Resolved", "சரிசெய்யப்பட்டவை")}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              {fixedList.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("all")}
            className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all flex-shrink-0 ${
              activeTab === "all"
                ? "border-slate-800 dark:border-white text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{T("All Updates", "அனைத்து பதிவுகள்")}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {posts.length}
            </span>
          </button>
        </div>

        {/* Tab Secondary Category Filter (Only on 'all' tab) */}
        {activeTab === "all" && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`flex-shrink-0 px-3 py-1 rounded-xl text-xs font-semibold ${
                selectedCategory === "all"
                  ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {T("All Categories", "அனைத்தும்")}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => handleCategoryChange(c.slug)}
                className={`flex-shrink-0 px-3 py-1 rounded-xl text-xs font-semibold ${
                  selectedCategory === c.slug
                    ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {c.icon} {T(c.name_en, c.name_ta)}
              </button>
            ))}
          </div>
        )}

        {/* Post Grid or Skeletons */}
        {postsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {activeTab === "fixed"
                ? T("No citizen-verified resolutions yet", "இன்னும் தீர்க்கப்பட்ட பதிவுகள் இல்லை")
                : activeTab === "alerts"
                ? T("No urgent alerts active right now", "தற்போது அவசர எச்சரிக்கைகள் ஏதுமில்லை")
                : T("No reports found for this filter", "இந்த வடிகட்டிக்கு பதிவுகள் இல்லை")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {activeTab === "alerts"
                ? T("Everything is functioning normally. Check scheduled power cut timings.", "அனைத்து சேவைகளும் சீராக உள்ளன. இன்றைய மின்தடை நேரத்தை சோதிக்கலாம்.")
                : T(`Be the first to document an issue or update in ${district.name_en}.`, `${district.name_en} பகுதியில் முதல் பதிவை அல்லது புகாரை உருவாக்கவும்.`)}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {activeTab === "alerts" ? (
                <Link
                  to={`/power-cuts-today-tamil-nadu/${slug}`}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {T("Check EB Shutdown Timings", "மின்தடை நேரத்தை பார்க்க")}
                </Link>
              ) : (
                <Link
                  to={`/create?district=${slug}`}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  {T(`+ Log Issue in ${district.name_en}`, `+ ${district.name_en} பகுதியில் புகாரளி`)}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* ── PAGINATION CONTROLS ── */}
            <NumberedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalPosts}
              itemsPerPage={POSTS_PER_PAGE}
              onPageChange={setCurrentPage}
              scrollTargetId="district-content-hub"
              itemLabel={
                activeTab === "alerts"
                  ? "alerts"
                  : activeTab === "complaints"
                  ? "grievances"
                  : activeTab === "fixed"
                  ? "resolved items"
                  : "updates"
              }
            />
          </>
        )}
      </section>

      <AdSlot placement="district" className="my-6" />

      {/* ── ZONE 5: TN TODAY IN-DEPTH EDITORIAL COVERAGE ── */}
      {tnTodayArticles.length > 0 && (
        <section aria-label="TN Today District Coverage" className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                {T(`TN Today News & In-Depth Reports`, `TN Today செய்திகள் & ஆய்வுக் கட்டுரைகள்`)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {T(
                  `Policy investigations, civic alerts, and infrastructure projects relating to ${district.name_en}`,
                  `${district.name_en} மற்றும் தமிழ்நாடு வளர்ச்சித் திட்டங்கள் தொடர்பான சிறப்பு செய்திகள்`
                )}
              </p>
            </div>
            <Link
              to="/tn-today"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {T("View All TN Today", "அனைத்து செய்திகளும்")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tnTodayArticles.slice(0, 4).map((article) => (
              <Link
                key={article.id}
                to={`/tn-today/${article.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {article.featured_image && (
                    <div className="mb-2.5 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={toCdnMediaUrl(article.featured_image)}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <span className="text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-mono block w-fit mb-2">
                    {article.category || "Development"}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  {article.subtitle && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {article.subtitle}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  <span>{T("Read Article", "கட்டுரை படிக்க")}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── ZONE 6: CANONICAL CIVIC ISSUE PORTALS ── */}
      <section aria-label="District Civic Portals" className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚡</span>
            {T(`${district.name_en} Civic Services & Issue Portals`, `${district.name_en} குடிமை சேவைகள் மற்றும் சிக்கல் தீர்வு இணையங்கள்`)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T(
              `Direct access to dedicated complaint feeds, scheduled maintenance alerts, and local updates for ${district.name_en}`,
              `${district.name_en} பிரத்யேக புகார் மற்றும் உதவி மையங்கள்`
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { slug: "power-cut", icon: "⚡", en: "Power Cuts & EB", ta: "மின்வெட்டு & மின்வாரியம்", desc: "TANGEDCO outages & helpline" },
            { slug: "water-issue", icon: "💧", en: "Water & Sanitation", ta: "தண்ணீர் & சுகாதாரம்", desc: "TWAD supply & drainage" },
            { slug: "road-problem", icon: "🛣️", en: "Roads & Potholes", ta: "சாலை & குழிகள்", desc: "Highway & pothole reports" },
            { slug: "scam", icon: "🛡️", en: "Scam Alerts", ta: "மோசடி எச்சரிக்கை", desc: "Cyber fraud & safety" },
            { slug: "jobs", icon: "💼", en: "Jobs & Careers", ta: "வேலைவாய்ப்பு", desc: "Local vacancies & drives" },
            { slug: "education", icon: "🎓", en: "Education & Exams", ta: "கல்வி & தேர்வுகள்", desc: "School & college notices" },
            { slug: "government-schemes", icon: "📜", en: "Govt Schemes", ta: "அரசு திட்டங்கள்", desc: "Welfare eligibility & e-Sevai" },
            { slug: "healthcare", icon: "🏥", en: "Healthcare & PHC", ta: "சுகாதாரம் & மருத்துவமனை", desc: "Hospital services & 108" },
            { slug: "environment", icon: "🌱", en: "Environment & Lakes", ta: "சுற்றுச்சூழல் & ஏரிகள்", desc: "Pollution alerts & desilting" },
            { slug: "general", icon: "📢", en: "Civic Notices", ta: "பொது அறிவிப்புகள்", desc: "Municipal & community updates" },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/${slug}/${cat.slug}`}
              className="group p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {T(cat.en, cat.ta)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {cat.desc}
                </p>
              </div>
              <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                <span>View {cat.en}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ZONE 7: MUNICIPAL DIRECTORY & CITIZEN GUIDE + FAQ ACCORDION ── */}
      <section aria-label="Municipal Directory and FAQs" className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {T(`${district.name_en} Municipal Directory & Citizen Guide`, `${district.name_en} நகராட்சி வழிகாட்டி மற்றும் கேள்வி பதில்கள்`)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T(
              `Essential administrative contacts, official escalation channels, and verified civic instructions for ${district.name_en}`,
              `${district.name_en} முக்கிய அரசு அலுவலகங்கள் மற்றும் தீர்வு வழிகாட்டி`
            )}
          </p>
        </div>

        {/* Directory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <span>📍</span> Collectorate & CM Special Cell
            </span>
            <p className="text-slate-500 dark:text-slate-400">{district.name_en} District Collector Office & Taluks</p>
            <p className="font-semibold text-blue-600 dark:text-blue-400">Toll-Free Helpline: 1100 / 1077</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <span>⚡</span> TANGEDCO Superintending Office
            </span>
            <p className="text-slate-500 dark:text-slate-400">Distribution Circle, Fuse Off Call & Substation</p>
            <p className="font-semibold text-amber-600 dark:text-amber-400">Minnalagam: 1912 / 94987 94987</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <span>💧</span> Municipal Corporation & TWAD
            </span>
            <p className="text-slate-500 dark:text-slate-400">Water Pipeline Maintenance & Drainage Ops</p>
            <p className="font-semibold text-cyan-600 dark:text-cyan-400">Control Helpline: 1913</p>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            {T(`Frequently Asked Questions — ${district.name_en}`, `${district.name_en} குடிமை கேள்விகள் மற்றும் பதில்கள்`)}
          </h4>

          {[
            {
              q: `How do I report a pothole, open manhole, or garbage pile in ${district.name_en}?`,
              a: `Click "+ Report Issue" above or go to the Create page. Take a clear photo, add the street/taluk location, and submit. VizhiTN assigns a public tracking ID and formats the data into an official grievance receipt ready for submission to the local municipal office.`,
            },
            {
              q: `How can I check scheduled TANGEDCO power shutdown timings in ${district.name_en}?`,
              a: `Switch to the "Live Alerts" tab or visit the dedicated Power Cuts page for ${district.name_en}. We track 33/11 kV substation maintenance shutdowns published by TANGEDCO and verified by local residents. For emergency power line snaps or fuse failures, call Minnalagam at 1912.`,
            },
            {
              q: `What is the escalation procedure if ${district.name_en} municipality does not resolve a complaint?`,
              a: `Once your report is logged on VizhiTN, residents can upvote and verify it. If unaddressed by the local ward or municipality, escalate it to the Chief Minister's Special Cell by dialing 1100 or through the cmcell.tn.gov.in portal citing the civic evidence recorded here.`,
            },
            {
              q: `Are reports from all taluks and villages in ${district.name_en} accepted?`,
              a: `Yes! VizhiTN covers all corporations, municipalities, town panchayats, and village panchayats across ${district.name_en}. You can filter directly by taluk in the top filter bar.`,
            },
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}