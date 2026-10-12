"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, ShieldCheck, MapPin, Building, Briefcase, Calendar,
  Volume2, Play, Pause, FileText, CheckCircle, Search, PhoneCall,
  Share2, MessageCircle, ArrowRight, Shield, ExternalLink, Filter, X
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/api/supabaseClient";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { DISTRICTS } from "@/lib/districts";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";
import NumberedPagination from "@/components/common/NumberedPagination";

const PAGE_SIZE = 8;

const DEPT_MAP = {
  "Revenue Department": { en: "Revenue Department", ta: "வருவாய்த்துறை", icon: Building },
  "Police Department": { en: "Police Department", ta: "காவல்துறை", icon: Shield },
  "RTO / Transport": { en: "RTO / Transport", ta: "வட்டாரப் போக்குவரத்து (RTO)", icon: Briefcase },
  "Sub-Registrar Office": { en: "Sub-Registrar Office", ta: "சார்பதிவாளர் அலுவலகம்", icon: FileText },
  "Electricity (TNEB)": { en: "Electricity (TNEB)", ta: "மின்சார வாரியம் (TNEB)", icon: Building },
  "Municipal Corporation": { en: "Municipal Corporation", ta: "மாநகராட்சி / நகராட்சி", icon: Building },
  "Other": { en: "Other Departments", ta: "இதர துறைகள்", icon: Briefcase }
};

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

// Helper Audio Player Component
function AudioPlayer({ src }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const toggle = (e) => {
    e.preventDefault();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 w-fit border border-slate-200 dark:border-slate-700">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button
        type="button"
        onClick={toggle}
        className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow-sm"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-rose-500 animate-pulse" />
          {T("Voice Recording Proof", "குரல் பதிவு ஆதாரம்")}
        </span>
      </div>
    </div>
  );
}

export default function BribeDashboard({ initialBribePosts = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  usePageMeta({
    title: "Bribe Tracker & Transparency Dashboard Tamil Nadu | VizhiTN",
    description: "Citizen logged statistics on bribe requests, refusal rates, and departmental accountability across all 38 districts of Tamil Nadu. DVAC helpline 1064.",
  });

  const { data: bribePosts = [], isLoading } = useQuery({
    queryKey: ["bribe-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post")
        .select("*")
        .eq("post_type", "bribe")
        .eq("status", "active")
        .order("created_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    initialData: initialBribePosts,
    staleTime: 60_000,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "paid" | "refused"
  const [currentPage, setCurrentPage] = useState(1);

  // Overall Metrics
  const totalReports = bribePosts.length;
  const totalPaid = bribePosts
    .filter((p) => p.bribe_status === "paid")
    .reduce((sum, p) => sum + (Number(p.bribe_amount) || 0), 0);
  const refusedCount = bribePosts.filter((p) => p.bribe_status === "refused").length;
  const refusalRate = totalReports > 0 ? Math.round((refusedCount / totalReports) * 100) : 0;

  // Department breakdown
  const deptCounts = {};
  bribePosts.forEach((p) => {
    const d = p.bribe_department || "Other";
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });
  const deptData = Object.entries(deptCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // District breakdown
  const distCounts = {};
  bribePosts.forEach((p) => {
    const d = p.district_name || "Unspecified";
    distCounts[d] = (distCounts[d] || 0) + 1;
  });
  const distData = Object.entries(distCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const getDeptName = (val) => {
    if (!val || val === "Unspecified") return T("Unspecified", "குறிப்பிடப்படாதது");
    const match = DEPT_MAP[val];
    if (match) return T(match.en, match.ta);
    return val;
  };

  const getDistrictName = (nameEn) => {
    if (!nameEn || nameEn === "Unspecified") return T("Unspecified", "குறிப்பிடப்படாதது");
    const d = DISTRICTS.find((item) => item.name_en === nameEn);
    return d ? T(d.name_en, d.name_ta) : nameEn;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered Posts Logic
  const filteredPosts = useMemo(() => {
    return bribePosts.filter((post) => {
      // District filter
      const matchDistrict =
        selectedDistrict === "all" ||
        post.district_slug === selectedDistrict ||
        (post.district_name && post.district_name.toLowerCase() === selectedDistrict.toLowerCase());

      // Department filter
      const matchDept = selectedDept === "all" || post.bribe_department === selectedDept;

      // Status filter
      const matchStatus = statusFilter === "all" || post.bribe_status === statusFilter;

      // Search Query
      const searchTarget = `${post.title_en || ""} ${post.content_en || ""} ${post.bribe_department || ""} ${post.bribe_officer_designation || ""} ${post.bribe_specific_location || ""} ${post.district_name || ""}`.toLowerCase();
      const matchSearch = !searchQuery.trim() || searchTarget.includes(searchQuery.toLowerCase().trim());

      return matchDistrict && matchDept && matchStatus && matchSearch;
    });
  }, [bribePosts, selectedDistrict, selectedDept, statusFilter, searchQuery]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDistrict, selectedDept, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE) || 1;
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedDistrictObj = DISTRICTS.find((d) => d.slug === selectedDistrict);
  const districtNameDisplay = selectedDistrictObj
    ? (lang === "ta" ? selectedDistrictObj.name_ta : selectedDistrictObj.name_en)
    : T("All Tamil Nadu Districts", "அனைத்து மாவட்டங்கள்");

  const pageUrl = "https://www.vizhitn.in/bribes";
  const shareText = encodeURIComponent(
    `⚖ *${districtNameDisplay} Bribe Tracker & Transparency Log*
` +
    `Logged Incidents: ${filteredPosts.length} reports | Refusal Rate: ${refusalRate}%
` +
    `Report Corruption / DVAC 1064: ${pageUrl}`
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-rose-900 via-pink-950 to-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-rose-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rose-200 mb-3 border border-rose-400/30">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                {selectedDistrict !== "all"
                  ? `${districtNameDisplay.toUpperCase()} TRANSPARENCY DESK`
                  : T("DVAC VIGILANCE & CIVIC TRANSPARENCY DESK", "லஞ்ச ஒழிப்பு & வெளிப்படைத்தன்மை கண்காணிப்பு")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 text-white">
                {selectedDistrict !== "all"
                  ? `${districtNameDisplay} ${T("Bribe Reports & Transparency", "லஞ்சக் கண்காணிப்புப் பதிவுகள்")}`
                  : T("Tamil Nadu Bribe Tracker", "தமிழ்நாடு லஞ்சக் கண்காணிப்பு பலகை")}
              </h1>
              <p className="text-rose-100 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
                {T(
                  `Citizen-logged records of bribe requests, speed money refusal rates, and departmental accountability across ${selectedDistrict !== "all" ? districtNameDisplay : "all 38 districts"}. Real data empowering citizen awareness.`,
                  `அரசு அலுவலகங்களில் லஞ்சம் கேட்கப்பட்டது, மறுக்கப்பட்ட சம்பவங்கள் மற்றும் துறை ரீதியான வெளிப்படைத்தன்மையை பதிவு செய்யும் அதிகாரப்பூர்வ குடிமக்கள் கண்காணிப்பு தளம்.`
                )}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <Link
                  to="/create?type=bribe"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {T("Log Bribe Incident", "லஞ்ச சம்பவத்தை பதிவிடு")}
                </Link>
                <Link
                  to="/awareness/article/how-to-file-rti-application-tamil-nadu-guide"
                  className="inline-flex items-center gap-1.5 text-xs font-bold border border-white/40 hover:bg-white/10 text-white px-3.5 py-2 rounded-xl transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {T("How to File RTI Legally", "RTI மனு தாக்கல் வழிகாட்டி")}
                </Link>
                <span className="text-rose-200/80 text-[11px] block sm:inline">
                  🔒 {T("100% Anonymous & Protected.", "100% அநாமதேயமானது.")}
                </span>
              </div>
            </div>

            {/* Official DVAC Anti-Corruption Helpline Card */}
            <div className="bg-black/35 backdrop-blur-lg border border-rose-400/30 rounded-2xl p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 text-rose-200 text-xs font-bold tracking-wider uppercase">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                {T("DVAC Anti-Corruption Hotline", "லஞ்ச ஒழிப்பு அவசர உதவி")}
              </div>
              <div className="flex items-baseline gap-3">
                <a
                  href="tel:1064"
                  className="text-3xl font-black tracking-tight text-white hover:text-rose-300 transition-colors"
                >
                  1064
                </a>
                <span className="text-xs text-rose-200/80 font-bold uppercase">
                  ({T("Toll-Free 24x7", "இலவச எண்")})
                </span>
              </div>
              <div className="border-t border-rose-400/20 pt-2 space-y-1 text-xs text-rose-200/80">
                <p>{T("DVAC Head Office: 044-22321090", "தலைமையகம்: 044-22321090")}</p>
                <p>{T("WhatsApp Complaint: 94981 05000", "வாட்ஸ்அப் புகார்: 94981 05000")}</p>
                <p className="text-[11px] text-rose-200/60">{T("CM Helpline: 1100", "முதல்வர் உதவி: 1100")}</p>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={T("Search department, officer role, or location...", "துறை, அதிகாரி அல்லது பகுதி தேடுக...")}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick 38 District Dropdown + Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
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
                  onClick={() => setStatusFilter("refused")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === "refused"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                  }`}
                >
                  <span>✓ {T("Refused", "மறுக்கப்பட்டது")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("paid")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === "paid"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-rose-600"
                  }`}
                >
                  <span>₹ {T("Paid", "கொடுக்கப்பட்டது")}</span>
                </button>
              </div>

              {/* Log Incident CTA */}
              <Link
                to="/create?type=bribe"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
              >
                <AlertTriangle className="w-4 h-4" />
                {T("Log Incident", "பதிவிடு")}
              </Link>
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
                onClick={() => setSelectedDistrict(dist.slug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDistrict === dist.slug
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(dist.name_en, dist.name_ta)}
              </button>
            ))}
          </div>

          {/* Department Chips Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              {T("Department:", "துறை:")}
            </span>
            <button
              onClick={() => setSelectedDept("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedDept === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {T("All Departments", "அனைத்து துறைகள்")}
            </button>
            {Object.keys(DEPT_MAP).map((deptKey) => (
              <button
                key={deptKey}
                onClick={() => setSelectedDept(deptKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDept === deptKey
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(DEPT_MAP[deptKey].en, DEPT_MAP[deptKey].ta)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── POLICY DISCLAIMER BANNER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl p-4 flex gap-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0 stroke-[2.5]" />
          <div>
            <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-300">
              {T("VizhiTN System Transparency Policy", "VizhiTN வெளிப்படைத்தன்மை கொள்கை")}
            </h4>
            <p className="text-xs text-amber-800 dark:text-slate-300 mt-1 leading-relaxed font-medium">
              {T(
                "This dashboard displays anonymized citizen-reported statistics regarding requests for bribes in various regions and departments. The purpose is to build regional statistical transparency to help raise citizen awareness. This system is strictly non-defamatory and does not publish individual officer identities.",
                "இந்தத் தகவல் பலகை பல்வேறு பகுதிகள் மற்றும் துறைகளில் லஞ்சம் கேட்கப்பட்டது குறித்த குடிமக்கள் அளித்த அநாமதேயப் புள்ளிவிவரங்களை வெளிப்படுத்துகிறது. இதன் நோக்கம் பிராந்திய ரீதியான புள்ளிவிவர வெளிப்படைத்தன்மையை உருவாக்குவதாகும். தனிப்பட்ட நபர்களை அவதூறு செய்யாமல் அரசு சேவைகளை மேம்படுத்த இது பயன்படுகிறது."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS METRICS GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800/60 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {T("Total Bribes Reported", "மொத்த லஞ்சப் பதிவுகள்")}
              </p>
              {isLoading ? (
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse mt-1 rounded" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalReports}</p>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-red-300 dark:border-red-800/60 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {T("Total Extorted Amount", "கொடுக்கப்பட்ட லஞ்சத் தொகை")}
              </p>
              {isLoading ? (
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse mt-1 rounded" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(totalPaid)}
                </p>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800/60 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {T("Refusal & Resistance Rate", "லஞ்சத்தை மறுத்தவர்களின் விகிதம்")}
              </p>
              {isLoading ? (
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse mt-1 rounded" />
              ) : (
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {refusalRate}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ANALYTICS CHARTS GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Building className="w-4 h-4 text-rose-600" />
              {T("Bribes Reported by Department", "துறை ரீதியாக லஞ்சப் பதிவுகள்")}
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : deptData.length > 0 ? (
              <div className="space-y-3">
                {deptData.slice(0, 5).map(({ name, count }) => {
                  const max = deptData[0]?.count || 1;
                  const percentage = Math.max(5, (count / max) * 100);
                  return (
                    <div key={name}>
                      <div className="flex justify-between items-center text-xs font-bold mb-1 text-slate-800 dark:text-slate-200">
                        <span>{getDeptName(name)}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-extrabold">{count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="h-full rounded-full bg-rose-600 transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-6 text-slate-400 text-xs">
                {T("No department statistics available yet.", "துறை சார்ந்த புள்ளிவிவரங்கள் இன்னும் இல்லை.")}
              </p>
            )}
          </div>

          {/* District Breakdown */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-rose-600" />
              {T("Bribes Reported by District", "மாவட்ட ரீதியாக லஞ்சப் பதிவுகள்")}
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : distData.length > 0 ? (
              <div className="space-y-3">
                {distData.slice(0, 5).map(({ name, count }) => {
                  const max = distData[0]?.count || 1;
                  const percentage = Math.max(5, (count / max) * 100);
                  return (
                    <div key={name}>
                      <div className="flex justify-between items-center text-xs font-bold mb-1 text-slate-800 dark:text-slate-200">
                        <span>{getDistrictName(name)}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-extrabold">{count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="h-full rounded-full bg-pink-600 transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-6 text-slate-400 text-xs">
                {T("No district statistics available yet.", "மாவட்ட சார்ந்த புள்ளிவிவரங்கள் இன்னும் இல்லை.")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT FEED & SIDEBAR ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Logs Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                {T(
                  selectedDistrict === "all" ? "Documented Transparency Logs" : `${districtNameDisplay} Transparency Logs`,
                  selectedDistrict === "all" ? "பதிவான லஞ்சச் சம்பவங்கள்" : `${districtNameDisplay} சம்பவங்கள்`
                )}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                {filteredPosts.length} {T("Logs", "பதிவுகள்")}
              </span>
            </div>

            <div id="bribe-feed-top" className="scroll-mt-6" />

            {/* Posts Grid */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T(`No Bribe Reports in ${districtNameDisplay}`, `${districtNameDisplay} - லஞ்சப் பதிவுகள் எதுவும் இல்லை`)}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  {T(
                    "No citizen incident logs match your current filter settings. If an official demanded speed money, document it anonymously.",
                    "தேடலுக்குரிய பதிவுகள் எதுவும் இல்லை. அரசு அலுவலர் லஞ்சம் கேட்டிருந்தால் பெயர் வெளியிடாமல் பதிவிடுங்கள்."
                  )}
                </p>
                <Link
                  to="/create?type=bribe"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {T("Log an Incident Anonymously", "அநாமதேயமாகப் பதிவிடு")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedPosts.map((post) => {
                  const dateStr = new Date(post.created_date).toLocaleDateString(
                    lang === "ta" ? "ta-IN" : "en-IN",
                    { day: "numeric", month: "short", year: "numeric" }
                  );
                  const isPaid = post.bribe_status === "paid";

                  const postShareText = encodeURIComponent(
                    `⚖ *${post.title_en}*
` +
                    `Status: ${isPaid ? `Paid ₹${post.bribe_amount}` : "Refused to Pay"}
` +
                    `Dept: ${post.bribe_department} | District: ${post.district_name}
` +
                    `Read transparency report: https://www.vizhitn.in/post/${post.id || post.slug}`
                  );

                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-400 dark:hover:border-rose-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Status & Date Badges */}
                        <div className="flex justify-between items-center mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5 ${
                              isPaid ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {isPaid
                              ? T(`PAID BRIBE: ${formatCurrency(post.bribe_amount)}`, `லஞ்சம்: ${formatCurrency(post.bribe_amount)}`)
                              : T("REFUSED BRIBE", "மறுக்கப்பட்டது")}
                          </span>

                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {dateStr}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-extrabold text-slate-900 dark:text-white leading-snug text-base mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          <Link to={`/post/${post.id || post.slug}`} className="hover:underline">
                            {post.title_en}
                          </Link>
                        </h4>

                        {/* Metadata Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <Building className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span className="font-medium text-slate-500">{T("Dept:", "துறை:")}</span>
                            <span className="truncate font-bold text-slate-900 dark:text-white">
                              {getDeptName(post.bribe_department)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="font-medium text-slate-500">{T("District:", "மாவட்டம்:")}</span>
                            <span className="truncate font-bold text-slate-900 dark:text-white">
                              {getDistrictName(post.district_name)}
                            </span>
                          </div>

                          {post.bribe_officer_designation && (
                            <div className="flex items-center gap-2 min-w-0">
                              <Briefcase className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                              <span className="font-medium text-slate-500">{T("Official:", "அதிகாரி:")}</span>
                              <span className="truncate font-bold text-slate-900 dark:text-white">
                                {post.bribe_officer_designation}
                              </span>
                            </div>
                          )}

                          {post.bribe_specific_location && (
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <span className="font-medium text-slate-500">{T("Office:", "அலுவலகம்:")}</span>
                              <span className="truncate font-bold text-slate-900 dark:text-white">
                                {post.bribe_specific_location}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Incident Narrative */}
                        {post.content_en && (
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal line-clamp-3 border-l-2 border-rose-500 pl-3 py-1 bg-rose-50/40 dark:bg-rose-950/20 rounded-r-lg mb-3">
                            {post.content_en}
                          </p>
                        )}
                      </div>

                      {/* Footer Actions: Audio Proof + WhatsApp Share */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {post.bribe_audio_url ? (
                          <AudioPlayer src={post.bribe_audio_url} />
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            🔒 {T("Anonymously Verified Record", "அநாமதேய சான்று")}
                          </span>
                        )}

                        <a
                          href={`https://api.whatsapp.com/send?text=${postShareText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          {T("Share", "பகிர்க")}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Numbered Pagination */}
            {filteredPosts.length > 0 && (
              <NumberedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPosts.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
                scrollTargetId="bribe-feed-top"
                itemLabel={{ en: "bribe reports", ta: "லஞ்சப் பதிவுகள்" }}
              />
            )}

            {/* Universal SEO Cross-Links */}
            <UniversalCrossLinks pageType="bribes" />
          </div>

          {/* Right Column: Helplines & Legal Anti-Corruption Guides */}
          <aside className="space-y-6">
            {/* DVAC Trap & Complaint Protocol Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-600" />
                {T("DVAC Trap Protocol", "லஞ்ச ஒழிப்பு நெறிமுறை")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {T(
                  "If a government servant demands a bribe to process your Patta, building plan, electricity connection, or police FIR, contact DVAC BEFORE paying. DVAC arranges chemical powder trap tests to catch corrupt officials red-handed.",
                  "பட்டா, மின் இணைப்பு அல்லது அரசு பணிகளுக்கு லஞ்சம் கோரப்பட்டால், பணம் கொடுக்கும் முன்பே DVAC அலுவலகத்திற்கு தகவல் தெரிவிக்கவும். அவர்கள் ரசாயன சோதனை மூலம் அதிகாரியை கையும் களவுமாகப் பிடிப்பார்கள்."
                )}
              </p>
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="tel:1064"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-colors"
                >
                  <span>{T("DVAC Toll-Free Helpline", "DVAC உதவி எண் அழைக்க")}</span>
                  <span className="font-black text-sm">1064</span>
                </a>
                <a
                  href="https://dvac.tn.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 transition-colors"
                >
                  <span>dvac.tn.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Legal Safeguards & RTI Shield */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {T("Citizen Legal Rights", "குடிமக்கள் சட்ட உரிமைகள்")}
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                    {T("Prevention of Corruption Act", "ஊழல் தடுப்புச் சட்டம்")}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Demanding an undue advantage carries imprisonment from 3 to 7 years under Section 7 of the 1988 Act.
                  </p>
                </li>
                <li className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                    {T("RTI Act 2005 30-Day Window", "RTI சட்டம் 30 நாள் அவகாசம்")}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Instead of paying speed money, file an RTI application. Officials are legally mandated to reply within 30 days.
                  </p>
                  <Link
                    to="/awareness/article/how-to-file-rti-application-tamil-nadu-guide"
                    className="text-rose-600 dark:text-rose-400 font-bold inline-flex items-center gap-1 hover:underline text-[11px]"
                  >
                    {T("Read RTI Application Guide", "RTI வழிகாட்டியைப் படிக்க")} →
                  </Link>
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
                  "Get verified daily civic alerts, government scheme updates, and public transparency releases directly on WhatsApp.",
                  "தினசரி குடிமை அறிவிப்புகள் மற்றும் அரசு திட்ட விவரங்களை வாட்ஸ்அப்பில் உடனுக்குடன் பெற இணையுங்கள்."
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

            {/* Document Grievance CTA Card */}
            <div className="bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-2xl border border-rose-900/60 p-5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800 mb-2">
                {T("Civic Proof Tool", "குடிமை சான்று")}
              </span>
              <h4 className="text-sm font-bold text-white mb-1.5">
                {T("Have an Unresolved Grievance?", "தீர்க்கப்படாத பொதுப் புகாரா?")}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {T(
                  "Create a documented Civic Receipt with photo evidence and reference ID to escalate delayed municipal or departmental tasks.",
                  "புகைப்பட சான்றுடன் கூடிய அதிகாரப்பூர்வ குடிமை ரசீதை உருவாக்கி அரசு அதிகாரிகளுக்கு அனுப்பலாம்."
                )}
              </p>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-all"
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
