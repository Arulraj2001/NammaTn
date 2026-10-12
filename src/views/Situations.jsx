"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Plus, X, Search, PhoneCall, AlertTriangle, ShieldCheck,
  Share2, MessageCircle, MapPin, CheckCircle2, Droplets, Car, CloudRain,
  Wifi, Building, AlertOctagon, ExternalLink, Loader2, ArrowRight
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { getActiveSituations, createSituation } from "@/services/situations";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";
import SituationCard from "@/components/phase8/SituationCard";
import { checkRateLimit } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import dynamic from "next/dynamic";
import { supabase } from "@/api/supabaseClient";
import NumberedPagination from "@/components/common/NumberedPagination";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

const LocationPickerMap = dynamic(() => import("@/components/media/LocationPickerMap"), { ssr: false });

const PAGE_SIZE = 8;

const SITUATION_TYPES = [
  { value: "all", label_en: "All Situations", label_ta: "அனைத்தும்", icon: Zap },
  { value: "eb_shutdown", label_en: "EB Shutdown", label_ta: "மின்தடை", icon: Zap },
  { value: "water_shortage", label_en: "Water Shortage", label_ta: "குடிநீர் தட்டுப்பாடு", icon: Droplets },
  { value: "traffic", label_en: "Heavy Traffic", label_ta: "போக்குவரத்து நெரிசல்", icon: Car },
  { value: "flooding", label_en: "Flooding / Rain", label_ta: "வெள்ளம் / மழை", icon: CloudRain },
  { value: "internet_outage", label_en: "Internet Outage", label_ta: "இணைய முடக்கம்", icon: Wifi },
  { value: "office_closed", label_en: "Office Closed", label_ta: "அலுவலகம் மூடல்", icon: Building },
  { value: "protest", label_en: "Protest / Bandh", label_ta: "போராட்டம் / பந்த்", icon: AlertOctagon },
  { value: "transport_issue", label_en: "Transport Issue", label_ta: "பேருந்து / ரயில் சிக்கல்", icon: Car },
  { value: "local_emergency", label_en: "Local Emergency", label_ta: "அவசர நிலை", icon: AlertTriangle },
  { value: "service_disruption", label_en: "Service Disruption", label_ta: "சேவை முடக்கம்", icon: Wifi },
  { value: "other", label_en: "Other Issue", label_ta: "பிற சிக்கல்கள்", icon: AlertOctagon },
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
  { slug: "kancheepuram", name_en: "Kancheepuram", name_ta: "காஞ்சிபுரம்" },
  { slug: "tirunelveli", name_en: "Tirunelveli", name_ta: "திருநெல்வேலி" },
  { slug: "tiruppur", name_en: "Tiruppur", name_ta: "திருப்பூர்" },
];

export default function Situations({ initialSituations = [] }) {
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
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    situation_type: "eb_shutdown",
    title: "",
    details: "",
    district_slug: "",
    district_name: "",
    area_slug: "",
    area_name: "",
    urgency: "moderate",
    latitude: null,
    longitude: null,
  });
  const [formError, setFormError] = useState(null);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(
        () => setShowForm(true),
        T("Sign in to report a live situation", "நேரடி நிலைமையை புகாரளிக்க உள்நுழையுங்கள்")
      );
      return;
    }
    setShowForm((f) => !f);
  };

  usePageMeta({
    title: "Live Situations & Civic Outages in Tamil Nadu | VizhiTN",
    description: "Follow urgent local situations, power cuts, water shortages, road blocks, flooding and real-time public civic reports across all 38 districts of Tamil Nadu.",
  });

  const { data: rawSituations = [], isLoading } = useQuery({
    queryKey: ["situations", filterDistrict === "all" ? "" : filterDistrict],
    queryFn: () =>
      filterDistrict !== "all"
        ? base44.entities.SituationUpdate.filter({ district_slug: filterDistrict, status: "active" }, "-created_date", 100)
        : getActiveSituations(100),
    initialData: filterDistrict === "all" ? initialSituations : undefined,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-district", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createSituation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["situations"] });
      qc.invalidateQueries({ queryKey: ["admin-situations"] });
      setShowForm(false);
      setForm({
        situation_type: "eb_shutdown",
        title: "",
        details: "",
        district_slug: "",
        district_name: "",
        area_slug: "",
        area_name: "",
        urgency: "moderate",
        latitude: null,
        longitude: null,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.district_slug) {
      setFormError(T("Please fill in title and select district.", "தயவுசெய்து தலைப்பு மற்றும் மாவட்டத்தை தேர்வு செய்யவும்."));
      return;
    }
    if (!checkRateLimit("situation_post", 3, 5 * 60_000)) {
      setFormError(T("You're posting too fast. Please wait a few minutes.", "மிக விரைவாக பதிவிடுகிறீர்கள். சில நிமிடங்கள் காத்திருக்கவும்."));
      return;
    }
    mutation.mutate({ ...form, status: "active" });
  };

  // Filter situations by type and search query
  const filteredSituations = useMemo(() => {
    return rawSituations.filter((item) => {
      const matchType = filterType === "all" || item.situation_type === filterType;
      const text = `${item.title || ""} ${item.details || ""} ${item.area_name || ""} ${item.district_name || ""}`.toLowerCase();
      const matchSearch = !searchQuery.trim() || text.includes(searchQuery.toLowerCase().trim());
      return matchType && matchSearch;
    });
  }, [rawSituations, filterType, searchQuery]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterDistrict, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredSituations.length / PAGE_SIZE) || 1;
  const paginatedSituations = filteredSituations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedDistrictObj = DISTRICTS.find((d) => d.slug === filterDistrict);
  const districtNameDisplay = selectedDistrictObj
    ? (lang === "ta" ? selectedDistrictObj.name_ta : selectedDistrictObj.name_en)
    : T("All Tamil Nadu Districts", "அனைத்து மாவட்டங்கள்");

  const pageUrl = "https://www.vizhitn.in/situations";
  const shareText = encodeURIComponent(
    `⚡ *${districtNameDisplay} Live Civic Situations & Outages*
` +
    `Active Reports: ${filteredSituations.length} live issues reported
` +
    `Check verified local updates & helplines: ${pageUrl}`
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-amber-600 via-orange-700 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-200 mb-3 border border-amber-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {filterDistrict !== "all"
                  ? `${districtNameDisplay.toUpperCase()} DESK`
                  : T("LIVE TAMIL NADU SITUATION ROOM", "நேரடி தமிழ்நாடு குடிமை அறை")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 text-white">
                {filterDistrict !== "all"
                  ? `${districtNameDisplay} ${T("Live Situations & Outages", "நேரடி நிலைமைகள் & முடக்கங்கள்")}`
                  : T("Live Situations & Civic Outages", "நேரடி நிலைமைகள் & முடக்கங்கள்")}
              </h1>
              <p className="text-amber-100 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
                {T(
                  `Real-time citizen dispatches on power outages, water cuts, road blocks, traffic jams, and local emergency alerts across ${filterDistrict !== "all" ? districtNameDisplay : "all 38 districts"}.`,
                  `மின்வாரிய மின்தடை, குடிநீர் தட்டுப்பாடு, சாலை மறியல், போக்குவரத்து நெரிசல் மற்றும் அவசர காலங்களில் ${filterDistrict !== "all" ? districtNameDisplay + " மாவட்டத்திற்கான" : "தமிழ்நாடு முழுவதற்குமான"} நேரடி தகவல்கள்.`
                )}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <Link
                  to="/create"
                  className="inline-flex items-center text-xs font-bold bg-white text-slate-900 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                >
                  {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
                </Link>
                <Link
                  to="/power-cuts-today-tamil-nadu"
                  className="inline-flex items-center text-xs font-bold border border-white/40 hover:bg-white/10 text-white px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  ⚡ {T("Today's Power Cut Timings", "இன்றைய மின்தடை நேரங்கள்")}
                </Link>
              </div>
            </div>

            {/* Emergency Civic Helplines Card */}
            <div className="bg-black/35 backdrop-blur-lg border border-amber-400/30 rounded-2xl p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-bold tracking-wider uppercase">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                {T("24x7 Civic Helplines", "24x7 அவசர உதவி எண்கள்")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:1912"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-center"
                >
                  <span className="text-[10px] text-amber-200/90 block font-semibold">{T("Electricity", "மின்சாரம்")}</span>
                  <span className="text-lg font-black text-white">1912</span>
                </a>
                <a
                  href="tel:1913"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-center"
                >
                  <span className="text-[10px] text-amber-200/90 block font-semibold">{T("GCC / Flood", "மாநகராட்சி")}</span>
                  <span className="text-lg font-black text-white">1913</span>
                </a>
              </div>
              <p className="text-xs text-amber-200/70 border-t border-amber-400/20 pt-2">
                {T("CM Helpline: 1100 | Disaster: 1077 | Traffic: 103", "முதல்வர் உதவி: 1100 | பேரிடர்: 1077 | போக்குவரத்து: 103")}
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
                placeholder={T("Search issue, street or area...", "சிக்கல், தெரு அல்லது பகுதியைத் தேடுக...")}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick 38 District Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? T("Cancel", "ரத்து") : T("Report Situation", "நிலைமை புகாரளி")}
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
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(dist.name_en, dist.name_ta)}
              </button>
            ))}
          </div>

          {/* Situation Types Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              {T("Category:", "பிரிவு:")}
            </span>
            {SITUATION_TYPES.map((t) => (
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
        <div className="rounded-3xl p-6 sm:p-8 border-2 shadow-lg bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/20 border-amber-300 dark:border-amber-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-600 text-white shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {filteredSituations.length > 0
                    ? T("ACTIVE CITIZEN ALERTS", "செயலில் உள்ள குடிமை எச்சரிக்கைகள்")
                    : T("ALL CLEAR IN THIS REGION", "இயல்பான நிலைமை")}
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
                {filteredSituations.length > 0
                  ? T(
                      `⚡ ${filteredSituations.length} Live Civic Issues Reported in ${districtNameDisplay}`,
                      `⚡ ${districtNameDisplay} - ${filteredSituations.length} நேரடி குடிமை அறிக்கைகள் பதிவாகியுள்ளன`
                    )
                  : T(
                      `✅ No Major Civic Disruptions in ${districtNameDisplay}`,
                      `✅ ${districtNameDisplay} - பெரிய முடக்கங்கள் எதுவும் பதிவாகவில்லை`
                    )}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {filteredSituations.length > 0
                  ? T(
                      "Community-verified outages, power shutdowns, water issues, and traffic diversions. Tap 'Confirm' on any report to verify it for your neighborhood.",
                      "பொதுமக்களால் பகிரப்பட்ட மின்தடை, குடிநீர் மற்றும் போக்குவரத்து விவரங்கள். உங்கள் பகுதிக்கான தகவலை உறுதிப்படுத்த 'Confirm' பொத்தானை அழுத்தவும்."
                    )
                  : T(
                      "No critical situation reports matching your filters right now. If your area experiences an unscheduled power cut or pipeline burst, submit a quick live update.",
                      "தற்போதைக்கு எந்த முடக்கமும் பதிவாகவில்லை. உங்கள் பகுதியில் அவசர சிக்கல் இருந்தால், உடனடியாக ஒரு நேரடி பதிவை சமர்ப்பிக்கவும்."
                    )}
              </p>
            </div>

            {/* Quick Action Buttons (WhatsApp Share & Channel) */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-all group"
              >
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {T("Share Status on WhatsApp", "வாட்ஸ்அப்பில் பகிர்க")}
              </a>

              <a
                href="https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {T("Join VizhiTN WhatsApp Alerts", "வாட்ஸ்அப் அவசர சேனல்")}
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
                <Zap className="w-5 h-5 text-amber-500" />
                {T(
                  filterDistrict === "all" ? "Live Situation Updates" : `${districtNameDisplay} Situation Updates`,
                  filterDistrict === "all" ? "நேரடி நிலைமை புதுப்பிப்புகள்" : `${districtNameDisplay} அறிவிப்புகள்`
                )}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                {filteredSituations.length} {T("Reports", "அறிக்கைகள்")}
              </span>
            </div>

            {/* Report Form (Collapsible Card) */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-300 dark:border-amber-800 p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {T("Report a Live Local Situation", "ஒரு நேரடி நிலைமையை புகாரளிக்கவும்")}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {T("Help neighbors stay informed with real-time updates.", "அருகிலுள்ள மக்களுக்கு உடனுக்குடன் தகவல் தெரியப்படுத்தவும்.")}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        {T("Trust Score", "மதிப்பு")}
                      </span>
                      <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                        ★ {profile?.trust_score || 10}
                      </span>
                    </div>
                  )}
                </div>

                {/* Situation Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {T("Situation Type *", "நிலைமை வகை *")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SITUATION_TYPES.filter((t) => t.value !== "all").map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, situation_type: t.value }))}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center gap-2 ${
                          form.situation_type === t.value
                            ? "bg-amber-500 border-amber-500 text-white shadow-sm"
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
                    {T("Title / Issue Summary *", "தலைப்பு / சுருக்கம் *")}
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={T("e.g. Unscheduled power outage on Velachery Main Road", "எ.கா. வேளச்சேரி மெயின் ரோட்டில் மின்தடை")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("More Details (Optional)", "கூடுதல் விவரங்கள் (விருப்பத்தேர்வு)")}
                  </label>
                  <textarea
                    value={form.details}
                    onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                    placeholder={T("Affected streets, expected restoration time, or emergency contact...", "பாதிக்கப்பட்ட தெருக்கள், மின்தடை நேரம்...")}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* District and Area Selectors */}
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
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
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
                      {T("Area / Street (Optional)", "பகுதி / தெரு (விருப்பத்தேர்வு)")}
                    </label>
                    {areas.length > 0 ? (
                      <select
                        value={form.area_slug}
                        onChange={(e) => {
                          const a = areas.find((a) => a.slug === e.target.value);
                          setForm((f) => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
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
                        placeholder={T("e.g. Tambaram West", "எ.கா. தாம்பரம் மேற்கு")}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("Urgency Level", "அவசர நிலை")}
                  </label>
                  <select
                    value={form.urgency}
                    onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  >
                    <option value="info">ℹ Info / Notice</option>
                    <option value="moderate">⚠ Moderate Disruption</option>
                    <option value="urgent">🔴 Urgent Issue</option>
                    <option value="critical">🚨 Critical / Dangerous</option>
                  </select>
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
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {T("Submitting...", "சமர்ப்பிக்கிறது...")}
                      </>
                    ) : (
                      T("Submit Live Update", "நேரடி தகவலை சமர்ப்பிக்கவும்")
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

            <div id="situations-feed-top" className="scroll-mt-6" />

            {/* Feed List */}
            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredSituations.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T(`No Active Situations in ${districtNameDisplay}`, `${districtNameDisplay} - தற்போது சிக்கல்கள் எதுவும் பதிவாகவில்லை`)}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  {T(
                    "All civic utility lines and local roads appear to be operating normally for this selection.",
                    "தேர்ந்தெடுக்கப்பட்ட பகுதியில் அனைத்து குடிமைச் சேவைகளும் இயல்பாக செயல்படுகின்றன."
                  )}
                </p>
                <button
                  onClick={handleToggleForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {T("Report an Active Issue", "ஒரு சிக்கலை புகாரளி")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedSituations.map((s) => (
                  <SituationCard key={s.id} item={s} />
                ))}
              </div>
            )}

            {/* Numbered Pagination */}
            {filteredSituations.length > 0 && (
              <NumberedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSituations.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
                scrollTargetId="situations-feed-top"
                itemLabel={{ en: "situations", ta: "நிலைமைகள்" }}
              />
            )}

            {/* Universal SEO Cross Links */}
            <UniversalCrossLinks pageType="districts" />
          </div>

          {/* Right Column: FAQs & Helplines Sidebar */}
          <aside className="space-y-6">
            {/* Verified Emergency Contacts Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-500" />
                {T("Official Civic Helplines", "அரசு அவசர உதவி எண்கள்")}
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("TANGEDCO Electricity", "மின்வாரியம் - மின்னகம்")}
                    </span>
                    <span className="text-[11px] text-slate-400">Power cuts, snapped wires</span>
                  </div>
                  <a href="tel:1912" className="font-black text-amber-600 dark:text-amber-400 text-sm hover:underline">
                    1912
                  </a>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("Metrowater / CMWSSB", "சென்னை குடிநீர் வாரியம்")}
                    </span>
                    <span className="text-[11px] text-slate-400">Pipe leaks, sewage block</span>
                  </div>
                  <a href="tel:04445674567" className="font-black text-blue-600 dark:text-blue-400 text-xs hover:underline">
                    044-45674567
                  </a>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("GCC Flood & Municipal", "மாநகராட்சி கட்டுப்பாடு")}
                    </span>
                    <span className="text-[11px] text-slate-400">Waterlogging, fallen trees</span>
                  </div>
                  <a href="tel:1913" className="font-black text-emerald-600 dark:text-emerald-400 text-sm hover:underline">
                    1913
                  </a>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("District Disaster Control", "மாவட்ட பேரிடர் கட்டுப்பாடு")}
                    </span>
                    <span className="text-[11px] text-slate-400">Cyclones, heavy flooding</span>
                  </div>
                  <a href="tel:1077" className="font-black text-red-600 dark:text-red-400 text-sm hover:underline">
                    1077
                  </a>
                </li>
                <li className="flex justify-between items-center py-1.5">
                  <div>
                    <span className="font-semibold block text-slate-800 dark:text-slate-200">
                      {T("CM Helpline / Grievances", "முதல்வர் உதவி மையம்")}
                    </span>
                    <span className="text-[11px] text-slate-400">General civic complaints</span>
                  </div>
                  <a href="tel:1100" className="font-black text-purple-600 dark:text-purple-400 text-sm hover:underline">
                    1100
                  </a>
                </li>
              </ul>
            </div>

            {/* How Community Verification Works Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {T("Community Verification", "சமூக சரிபார்ப்பு முறை")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {T(
                  "Every situation update is submitted by verified citizens. When 3 or more local neighbors confirm an outage, it earns the Verified Badge and alerts departmental teams.",
                  "குடிமக்களால் பதிவிடப்படும் தகவல்கள், அப்பகுதி மக்களால் 3 முறை உறுதிப்படுத்தப்பட்டவுடன் 'Verified' நிலையை அடைகிறது."
                )}
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-200">
                🔒 {T("Misleading or prank alerts lower citizen trust score and are automatically moderated.", "தவறான தகவல்கள் பதிவிட்டால் நற்பெயர் மதிப்பு குறைக்கப்படும்.")}
              </div>
            </div>

            {/* File Civic Receipt CTA Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-900/60 p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800 mb-2">
                {T("Civic Proof Tool", "குடிமை சான்று")}
              </span>
              <h4 className="text-sm font-bold text-white mb-1.5">
                {T("Need Formal Department Action?", "அரசு நடவடிக்கை தேவையா?")}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {T(
                  "Generate a documented Civic Receipt with photo evidence and reference ID for municipal and TANGEDCO engineers.",
                  "புகைப்பட சான்றுடன் கூடிய அதிகாரப்பூர்வ குடிமை ரசீதை உருவாக்கி அரசு அதிகாரிகளுக்கு அனுப்பலாம்."
                )}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition-all"
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
