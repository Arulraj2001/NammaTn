"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import {
  Search, BadgeCheck, Sparkles, Plus, MapPin, PhoneCall,
  ShieldCheck, Share2, MessageCircle, ArrowRight, ExternalLink,
  Crown, Shield, CheckCircle2, Star, Briefcase, Home
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { LISTING_CATEGORIES } from "@/lib/listingCategories";
import { DISTRICTS } from "@/lib/districts";
import ListingCard from "@/components/listings/ListingCard";
import ListingSubmitModal from "@/components/listings/ListingSubmitModal";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";
import CustomAdBanner from "@/components/ads/CustomAdBanner";
import NumberedPagination from "@/components/common/NumberedPagination";

const PAGE_SIZE = 10;

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

const isVisibleLocalListing = (listing) =>
  listing?.moderation_status !== "hidden" &&
  listing?.is_publicly_visible !== false &&
  (listing?.report_count || 0) < 5;

const fetchPublicListings = async (limit = 100) => {
  const { data, error } = await supabase
    .from("local_listing")
    .select("*")
    .eq("status", "active")
    .or("moderation_status.is.null,moderation_status.neq.hidden")
    .or("is_publicly_visible.is.null,is_publicly_visible.eq.true")
    .or("report_count.is.null,report_count.lt.5")
    .order("created_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).filter(isVisibleLocalListing);
};

export default function LocalListings({ initialListings = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [showSubmit, setShowSubmit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleOpenSubmit = () => {
    if (!isAuthenticated) {
      requireAuth(
        () => setShowSubmit(true),
        T("Sign in to list your local service", "உங்கள் சேவையை பட்டியலிட உள்நுழையுங்கள்")
      );
      return;
    }
    setShowSubmit(true);
  };

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ["local-listings-public"],
    queryFn: () => fetchPublicListings(100),
    initialData: initialListings,
    staleTime: 60_000,
  });

  // Filter listings by search, category, district, and plan
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return listings.filter((l) => {
      const matchSearch =
        !q ||
        l.business_name?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.area_name?.toLowerCase().includes(q) ||
        l.district_name?.toLowerCase().includes(q);

      const matchCat = categoryFilter === "all" || l.category === categoryFilter;
      const matchDist = districtFilter === "all" || l.district_slug === districtFilter;
      const matchPlan =
        planFilter === "all" ||
        (planFilter === "verified" && l.is_verified) ||
        (planFilter === "featured" && (l.is_featured || l.plan === "featured")) ||
        (planFilter === "sponsored" && (l.is_sponsored || l.plan === "district_sponsor"));

      return matchSearch && matchCat && matchDist && matchPlan;
    });
  }, [listings, search, categoryFilter, districtFilter, planFilter]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, districtFilter, planFilter]);

  const featured = filtered.filter((l) => l.plan === "district_sponsor" || l.plan === "featured" || l.is_featured);
  const regular = filtered.filter((l) => l.plan !== "district_sponsor" && l.plan !== "featured" && !l.is_featured);

  const totalPages = Math.ceil(regular.length / PAGE_SIZE) || 1;
  const paginatedRegular = regular.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = {
    total: listings.length,
    verified: listings.filter((l) => l.is_verified).length,
    featured: listings.filter((l) => l.is_featured || l.is_sponsored).length,
  };

  const selectedDistrictObj = DISTRICTS.find((d) => d.slug === districtFilter);
  const districtNameDisplay = selectedDistrictObj
    ? (lang === "ta" ? selectedDistrictObj.name_ta : selectedDistrictObj.name_en)
    : T("All Tamil Nadu Districts", "அனைத்து மாவட்டங்கள்");

  const pageUrl = "https://www.vizhitn.in/listings";
  const shareText = encodeURIComponent(
    `🔧 *${districtNameDisplay} Verified Local Services Directory*
` +
    `${filtered.length} Verified Plumbers, Electricians, Mechanics & Home Services
` +
    `Find trusted local services: ${pageUrl}`
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-sky-200 mb-3 border border-sky-400/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {districtFilter !== "all"
                  ? `${districtNameDisplay.toUpperCase()} SERVICES DESK`
                  : T("VERIFIED LOCAL SERVICES & CIVIC BUSINESS DIRECTORY", "சரிபார்க்கப்பட்ட உள்ளூர் சேவைகள் & வணிகங்கள்")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 text-white">
                {districtFilter !== "all"
                  ? `${districtNameDisplay} ${T("Local Services & Providers", "உள்ளூர் சேவைகள் & பணியாளர்கள்")}`
                  : T("Tamil Nadu Local Services Directory", "உள்ளூர் சேவை & வணிகப் பட்டியல்")}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
                {T(
                  `Discover verified local plumbers, electricians, AC mechanics, water suppliers, clinics, and community-recommended service providers across ${districtFilter !== "all" ? districtNameDisplay : "all 38 districts"}.`,
                  `குழாய் பணியாளர்கள், எலக்ட்ரீஷியன்கள், ஏசி மெக்கானிக்ஸ், வாட்டர் கேன் விநியோகஸ்தர்கள் மற்றும் நம்பகமான உள்ளூர் வணிகங்களை உங்கள் பகுதியிலேயே கண்டறியுங்கள்.`
                )}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={handleOpenSubmit}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {T("List Your Service", "உங்கள் சேவையை பட்டியலிடுங்கள்")}
                </button>
                <Link
                  to="/create"
                  className="inline-flex items-center text-xs font-bold border border-white/40 hover:bg-white/10 text-white px-3.5 py-2 rounded-xl transition-colors"
                >
                  {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
                </Link>
                <div className="flex items-center gap-2 text-xs text-sky-200/90 font-medium ml-1">
                  <span>✅ {stats.verified} {T("Verified", "சரிபார்க்கப்பட்ட")}</span>
                  <span>·</span>
                  <span>⭐ {stats.featured} {T("Featured", "சிறப்பு")}</span>
                  <span>·</span>
                  <span>📋 {stats.total} {T("Total", "மொத்தம்")}</span>
                </div>
              </div>
            </div>

            {/* Consumer Protection Desk Callout Card */}
            <div className="bg-black/35 backdrop-blur-lg border border-sky-400/30 rounded-2xl p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 text-sky-200 text-xs font-bold tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                {T("Consumer Protection Desk", "நுகர்வோர் பாதுகாப்பு மையம்")}
              </div>
              <p className="text-sm font-black text-white leading-snug">
                {T("Verified phone & service credentials", "சரிபார்க்கப்பட்ட தொலைபேசி & சேவை விவரங்கள்")}
              </p>
              <div className="border-t border-sky-400/20 pt-2 space-y-1 text-xs text-sky-200/80">
                <p>📞 National Consumer Helpline: <span className="font-bold text-white">1915</span></p>
                <p>🛡️ Cyber Fraud Helpline: <span className="font-bold text-white">1930</span></p>
                <p>⚡ TANGEDCO EB Helpline: <span className="font-bold text-white">1912</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-3.5">
          {/* Top Row: Search Box + 38 District Dropdown + Plan Segmented Buttons */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={T("Search business, service, area, keyword...", "வணிகம், சேவை, பகுதி தேடுங்கள்...")}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick 38 District Dropdown + Plan Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">📍 {T("All Districts (38)", "அனைத்து மாவட்டங்கள் (38)")}</option>
                {DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name_en} - {d.name_ta}
                  </option>
                ))}
              </select>

              {/* Plan Segmented Buttons */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPlanFilter("all")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    planFilter === "all"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {T("All", "அனைத்தும்")}
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter("verified")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    planFilter === "verified"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-blue-600"
                  }`}
                >
                  <span>✅ {T("Verified", "சரிபார்க்கப்பட்ட")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter("featured")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    planFilter === "featured"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600"
                  }`}
                >
                  <span>⭐ {T("Featured", "சிறப்பு")}</span>
                </button>
              </div>

              {/* List Service CTA */}
              <button
                onClick={handleOpenSubmit}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                {T("List Service", "சேவையை சேர்க்க")}
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
                onClick={() => setDistrictFilter(dist.slug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  districtFilter === dist.slug
                    ? "bg-blue-600 text-white shadow-sm"
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
              onClick={() => setCategoryFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {T("All Categories", "அனைத்து வகைகள்")}
            </button>
            {LISTING_CATEGORIES.filter((c) => c.slug !== "other").map((c) => (
              <button
                key={c.slug}
                onClick={() => setCategoryFilter(c.slug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  categoryFilter === c.slug
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{c.icon}</span>
                <span>{lang === "ta" ? c.label_ta : c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HIGH-IMPACT GLANCEABLE STATUS CARD ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {filtered.length > 0
                    ? T("VERIFIED DIRECTORY ACTIVE", "சரிபார்க்கப்பட்ட சேவைகள் இயங்குகிறது")
                    : T("DIRECTORY AVAILABLE", "சேவை பட்டியல்")}
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
                      `🔧 ${filtered.length} Local Service Providers in ${districtNameDisplay}`,
                      `🔧 ${districtNameDisplay} - ${filtered.length} உள்ளூர் சேவை வழங்குநர்கள்`
                    )
                  : T(
                      `✅ Find Verified Home & Civic Services in ${districtNameDisplay}`,
                      `✅ ${districtNameDisplay} - நம்பகமான உள்ளூர் சேவைகளைக் கண்டறியவும்`
                    )}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {filtered.length > 0
                  ? T(
                      "Community-recommended local electricians, plumbers, vehicle repairers, and essential providers. Direct call and WhatsApp contact without third-party commission fees.",
                      "குழாய் பணியாளர்கள், மின்சார கலைஞர்கள் மற்றும் அவசர பழுது பார்ப்பவர்கள். இடைத்தரகர் கமிஷன் இல்லாமல் நேரடி தொலைபேசி அல்லது வாட்ஸ்அப் மூலம் தொடர்புகொள்ளுங்கள்."
                    )
                  : T(
                      "No service providers match your current filter settings. If you provide local services in this region, list your business for free.",
                      "தேடலுக்குரிய சேவைகள் எதுவும் இல்லை. நீங்கள் இந்த பகுதியில் சேவை வழங்குபவராக இருந்தால், இலவசமாக உங்கள் சேவையை இணைக்கவும்."
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
                {T("Share Directory on WhatsApp", "வாட்ஸ்அப்பில் பகிர்க")}
              </a>

              <a
                href="https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {T("Join VizhiTN Local Alerts Channel", "வாட்ஸ்அப் சேனலில் இணைய")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT FEED & SIDEBAR ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Listings Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-600" />
                {T(
                  districtFilter === "all" ? "Local Service Listings" : `${districtNameDisplay} Service Listings`,
                  districtFilter === "all" ? "உள்ளூர் சேவை பட்டியல்" : `${districtNameDisplay} பட்டியல்`
                )}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
                {filtered.length} {T("Providers", "வழங்குநர்கள்")}
              </span>
            </div>

            <div id="listings-feed-top" className="scroll-mt-6" />

            {/* Featured Section */}
            {featured.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {T("Featured & Sponsored Providers", "சிறப்பு & முன்னுரிமை பெற்ற சேவைகள்")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featured.map((l) => (
                    <ListingCard key={l.id} listing={l} featured />
                  ))}
                </div>
              </div>
            )}

            {/* In-Feed Sponsorship Banner */}
            <CustomAdBanner slot="infeed" district={districtFilter === "all" ? "" : districtFilter} />

            {/* Regular Listings Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="text-4xl mb-3">📋</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T(`No Listings Found in ${districtNameDisplay}`, `${districtNameDisplay} - பட்டியல் எதுவும் கிடைக்கவில்லை`)}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  {T(
                    "Try changing your search terms or filter selections, or be the first verified provider in this locality.",
                    "வடிப்பான்களை மாற்றி தேடவும் அல்லது உங்கள் சேவையை முதலில் பட்டியலிடவும்."
                  )}
                </p>
                <button
                  onClick={handleOpenSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {T("List Your Service for Free", "இலவசமாக சேவையைச் சேர்க்க")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {featured.length > 0 && regular.length > 0 && (
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {T("All Verified Listings", "அனைத்து சரிபார்க்கப்பட்ட சேவைகள்")} ({regular.length})
                  </h4>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedRegular.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              </div>
            )}

            {/* Numbered Pagination */}
            {regular.length > 0 && (
              <NumberedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={regular.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
                scrollTargetId="listings-feed-top"
                itemLabel={{ en: "local services", ta: "உள்ளூர் சேவைகள்" }}
              />
            )}

            {/* Provider Onboarding Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <h4 className="text-base font-bold mb-1">
                  {T("Are you a local service provider?", "நீங்கள் உள்ளூர் சேவை வழங்குநரா?")}
                </h4>
                <p className="text-blue-100 text-xs max-w-md leading-relaxed">
                  {T(
                    "Get verified and connect directly with thousands of residents in your neighborhood. Start with a free listing.",
                    "உங்கள் பகுதியில் ஆயிரக்கணக்கான வாடிக்கையாளர்களை இடைத்தரகர் இன்றி நேரடியாக சென்றடையுங்கள்."
                  )}
                </p>
              </div>
              <button
                onClick={handleOpenSubmit}
                className="bg-white text-blue-700 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all shadow-sm flex-shrink-0"
              >
                {T("List for Free", "இலவசமாக இணை")}
              </button>
            </div>

            {/* Universal SEO Cross Links */}
            <UniversalCrossLinks pageType="listings" />
          </div>

          {/* Right Column: Consumer Safety & Cross-Links */}
          <aside className="space-y-6">
            {/* Consumer Protection Notice Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {T("Consumer Verification Notice", "நுகர்வோர் பாதுகாப்பு வழிகாட்டி")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {T(
                  "VizhiTN reviews basic provider identity, phone number, and area credentials. Always confirm service charges and scope of work in advance before permitting home repairs.",
                  "அடிப்படை தொலைபேசி மற்றும் பகுதி விவரங்களை மட்டுமே VizhiTN சரிபார்க்கிறது. எந்தவொரு சேவைக்கும் முன்பணம் செலுத்தும் முன் கட்டணங்களை உறுதிப்படுத்தவும்."
                )}
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-200">
                🔒 {T("Notice fake contact details? Tap the flag icon on any listing to submit an instant moderation report.", "போலி விவரங்களைக் கண்டால் கார்டிலுள்ள கொடி குறியீட்டை அழுத்தி புகாரளிக்கவும்.")}
              </div>
            </div>

            {/* Consumer Helplines Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                {T("Official Consumer Helplines", "நுகர்வோர் அவசர உதவி எண்கள்")}
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("National Consumer Helpline", "தேசிய நுகர்வோர் உதவி எண்")}
                    </span>
                    <span className="text-[11px] text-slate-400">Trade malpractice & fraud</span>
                  </div>
                  <a href="tel:1915" className="font-black text-blue-600 dark:text-blue-400 text-sm hover:underline">
                    1915
                  </a>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("National Cyber Crime", "சைபர் கிரைம் உதவி எண்")}
                    </span>
                    <span className="text-[11px] text-slate-400">Online payment fraud</span>
                  </div>
                  <a href="tel:1930" className="font-black text-rose-600 dark:text-rose-400 text-sm hover:underline">
                    1930
                  </a>
                </li>
                <li className="flex justify-between items-center py-1.5">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("TANGEDCO Electricity", "மின்சார வாரியம்")}
                    </span>
                    <span className="text-[11px] text-slate-400">Live wires, power tripping</span>
                  </div>
                  <a href="tel:1912" className="font-black text-amber-600 dark:text-amber-400 text-sm hover:underline">
                    1912
                  </a>
                </li>
              </ul>
            </div>

            {/* Cross-hub quick shortcuts */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/jobs"
                className="flex items-center gap-2.5 p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <span className="text-xl">💼</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                    {T("Local Jobs", "வேலைகள்")}
                  </p>
                  <p className="text-[10px] text-slate-400">{T("Local hiring", "வேலை தேட")}</p>
                </div>
              </Link>

              <Link
                to="/stay"
                className="flex items-center gap-2.5 p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group"
              >
                <span className="text-xl">🏠</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    {T("Find Room", "தங்குமிடம்")}
                  </p>
                  <p className="text-[10px] text-slate-400">{T("PG & Rentals", "வாடகை அறைகள்")}</p>
                </div>
              </Link>
            </div>

            {/* Civic Receipt CTA Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl border border-blue-900/60 p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800 mb-2">
                {T("Civic Proof Tool", "குடிமை சான்று")}
              </span>
              <h4 className="text-sm font-bold text-white mb-1.5">
                {T("Need Municipal or EB Action?", "அரசு சேவை சீரமைப்பு தேவையா?")}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {T(
                  "File a documented Civic Receipt with photo evidence for streetlights, drainage, or road issues.",
                  "புகைப்பட சான்றுடன் கூடிய அதிகாரப்பூர்வ குடிமை ரசீதை உருவாக்கி அரசு அதிகாரிகளுக்கு அனுப்பலாம்."
                )}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md transition-all"
              >
                {T("File Civic Receipt", "குடிமை ரசீது உருவாக்குக")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {showSubmit && <ListingSubmitModal onClose={() => { setShowSubmit(false); refetch(); }} />}
    </div>
  );
}
