"use client";

import React, { useState, useMemo } from "react";
import { GraduationCap, PhoneCall, AlertCircle, Search, CheckCircle2, ShieldAlert, Share2, MessageCircle, MapPin, ExternalLink, CloudRain, Radio } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PostCard from "@/components/posts/PostCard";
import { Link, useNavigate } from "@/lib/router-compat";
import AdSlot from "@/components/ads/AdSlot";
import { DISTRICTS } from "@/lib/districts";
import GoogleNewsFollow from "@/components/common/GoogleNewsFollow";

const PRIORITY_DISTRICTS = [
  { slug: "all", name_en: "All Districts", name_ta: "அனைத்து மாவட்டங்கள்" },
  { slug: "chennai", name_en: "Chennai", name_ta: "சென்னை" },
  { slug: "tiruvallur", name_en: "Tiruvallur", name_ta: "திருவள்ளூர்" },
  { slug: "kancheepuram", name_en: "Kancheepuram", name_ta: "காஞ்சிபுரம்" },
  { slug: "chengalpattu", name_en: "Chengalpattu", name_ta: "செங்கல்பட்டு" },
  { slug: "coimbatore", name_en: "Coimbatore", name_ta: "கோயம்புத்தூர்" },
  { slug: "nilgiris", name_en: "The Nilgiris", name_ta: "நீலகிரி" },
  { slug: "cuddalore", name_en: "Cuddalore", name_ta: "கடலூர்" },
  { slug: "nagapattinam", name_en: "Nagapattinam", name_ta: "நாகப்பட்டினம்" },
  { slug: "madurai", name_en: "Madurai", name_ta: "மதுரை" },
  { slug: "tirunelveli", name_en: "Tirunelveli", name_ta: "திருநெல்வேலி" },
  { slug: "salem", name_en: "Salem", name_ta: "சேலம்" },
  { slug: "thanjavur", name_en: "Thanjavur", name_ta: "தஞ்சாவூர்" },
];

export default function HolidayAlerts({ initialPosts = [], targetDistrict = null }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const navigate = useNavigate();

  const [selectedDistrict, setSelectedDistrict] = useState(targetDistrict ? targetDistrict.slug : "all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchDistrict = selectedDistrict === "all" || post.district_slug === selectedDistrict;
      const textToSearch = `${post.title_en || ""} ${post.title_ta || ""} ${post.content_en || ""} ${post.location_text || ""} ${post.area_name || ""}`.toLowerCase();
      const matchQuery = !searchQuery || textToSearch.includes(searchQuery.toLowerCase().trim());
      return matchDistrict && matchQuery;
    });
  }, [initialPosts, selectedDistrict, searchQuery]);

  // Determine district status badge
  const activeHolidayPost = useMemo(() => {
    return filteredPosts.find((p) => {
      const title = `${p.title_en || ""} ${p.title_ta || ""}`.toLowerCase();
      return (p.urgency_level === "high" || p.urgency_level === "critical") &&
        (title.includes("holiday") || title.includes("விடுமுறை") || title.includes("closed") || title.includes("rain"));
    });
  }, [filteredPosts]);

  const hasHolidayDeclared = !!activeHolidayPost;
  const currentDistrictObj = targetDistrict || DISTRICTS.find((d) => d.slug === selectedDistrict);

  const districtNameDisplay = currentDistrictObj
    ? (lang === "ta" ? currentDistrictObj.name_ta : currentDistrictObj.name_en)
    : T("All Tamil Nadu Districts", "அனைத்து மாவட்டங்கள்");

  const pageUrl = targetDistrict
    ? `https://www.vizhitn.in/school-college-holiday-alerts/${targetDistrict.slug}`
    : "https://www.vizhitn.in/school-college-holiday-alerts";

  const shareText = encodeURIComponent(
    `📢 *${districtNameDisplay} School & College Holiday Update*\n` +
    `Status: ${hasHolidayDeclared ? "✅ Holiday Declared" : "⚪ Normal Working Day / Monitoring"}\n` +
    `Check Collector official notice & helplines: ${pageUrl}`
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-sky-200 mb-3 border border-sky-400/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {targetDistrict ? `${districtNameDisplay.toUpperCase()} DESK` : T("OFFICIAL COLLECTORATE & WEATHER DESK", "மாவட்ட ஆட்சியர் அறிவிப்புகள்")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3">
                {targetDistrict
                  ? `${districtNameDisplay} ${T("School & College Holiday Status", "பள்ளி & கல்லூரி விடுமுறை நிலை")}`
                  : T("TN School & College Holiday Alerts", "பள்ளி & கல்லூரி விடுமுறை அறிவிப்புகள்")}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                {T(
                  `Verified emergency school and college holiday declarations by ${targetDistrict ? districtNameDisplay + " District Collector" : "District Collectors"}, IMD rain alerts (Red/Orange), and State Disaster Management updates.`,
                  `கனமழை, புயல் மற்றும் அவசர காலங்களில் ${targetDistrict ? districtNameDisplay + " மாவட்ட ஆட்சியரால்" : "மாவட்ட ஆட்சியர்களால்"} அறிவிக்கப்படும் பள்ளி மற்றும் கல்லூரி விடுமுறை விவரங்கள்.`
                )}
              </p>
            </div>

            {/* Emergency Disaster Helplines Card */}
            <div className="bg-black/35 backdrop-blur-lg border border-sky-400/30 rounded-2xl p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 text-sky-200 text-xs font-bold tracking-wider uppercase">
                <PhoneCall className="w-4 h-4 text-sky-400" />
                {T("Disaster Helpline", "பேரிடர் அவசர உதவி")}
              </div>
              <div className="flex items-baseline gap-3">
                <a
                  href="tel:1077"
                  className="text-3xl font-black tracking-tight text-white hover:text-sky-300 transition-colors"
                >
                  1077
                </a>
                <span className="text-xs text-sky-200/80">({T("District Control", "மாவட்ட கட்டுப்பாட்டு அறை")})</span>
              </div>
              <p className="text-xs text-sky-200/70 border-t border-sky-400/20 pt-2">
                {T("State Emergency: 1070 | GCC Flood: 1913", "மாநில பேரிடர்: 1070 | சென்னை வெள்ளம்: 1913")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T("Search school, taluk or order...", "பள்ளி அல்லது ஆணை தேடுக...")}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* District Selector & Crawlable Links */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {/* Quick 38 District Dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  navigate("/school-college-holiday-alerts");
                } else {
                  navigate(`/school-college-holiday-alerts/${val}`);
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">📍 {T("Choose Any District (38)", "மாவட்டத்தை தேர்வு செய்க (38)")}</option>
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name_en} - {d.name_ta}
                </option>
              ))}
            </select>

            {/* Popular District Chips */}
            {PRIORITY_DISTRICTS.slice(0, 7).map((dist) => (
              <Link
                key={dist.slug}
                to={dist.slug === "all" ? "/school-college-holiday-alerts" : `/school-college-holiday-alerts/${dist.slug}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDistrict === dist.slug
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(dist.name_en, dist.name_ta)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── HIGH-IMPACT GLANCEABLE STATUS CARD ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg transition-all ${
          hasHolidayDeclared
            ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-950/40 border-emerald-500"
            : "bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20 border-slate-200 dark:border-slate-800"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  hasHolidayDeclared
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${hasHolidayDeclared ? "bg-white animate-ping" : "bg-emerald-500"}`} />
                  {hasHolidayDeclared ? T("OFFICIAL ORDER ACTIVE", "விடுமுறை ஆணை வெளியிடப்பட்டுள்ளது") : T("CURRENT STATUS", "தற்போதைய நிலை")}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {new Date().toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {hasHolidayDeclared
                  ? T(`✅ School & College Holiday Declared in ${districtNameDisplay}`, `✅ ${districtNameDisplay} மாவட்டத்தில் பள்ளி & கல்லூரிகளுக்கு விடுமுறை`)
                  : T(`⚪ Regular Working Day in ${districtNameDisplay} (No Holiday Announced)`, `⚪ ${districtNameDisplay} மாவட்டத்தில் வழக்கமான வேலை நாள் (விடுமுறை இல்லை)`)}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {hasHolidayDeclared
                  ? (activeHolidayPost?.title_en || T("Official order issued by District Collector. Check affected taluks and advisory below.", "மாவட்ட ஆட்சியரால் விடுமுறை அறிவிக்கப்பட்டுள்ளது."))
                  : T("No rain holidays or emergency school closures have been announced by the District Collectorate at this time. Morning updates are evaluated between 6:30 AM and 7:30 AM.", "மாவட்ட ஆட்சியர் அலுவலகத்திலிருந்து தற்போதைக்கு விடுமுறை உத்தரவு எதுவும் பிறப்பிக்கப்படவில்லை.")}
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
                {T("Share to WhatsApp Group", "வாட்ஸ்அப் குழுவில் பகிர்க")}
              </a>

              <a
                href="https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {T("Join VizhiTN WhatsApp Channel", "வாட்ஸ்அப் சேனலில் இணைய")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT FEED ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Posts Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                {T(
                  selectedDistrict === "all" ? "Active Educational & Weather Alerts" : `${districtNameDisplay} Holiday Dispatches`,
                  selectedDistrict === "all" ? "விடுமுறை & அவசர அறிவிப்புகள்" : `${districtNameDisplay} அறிவிப்புகள்`
                )}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
                {filteredPosts.length} {T("Alerts", "அறிவிப்புகள்")}
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T(`Normal Working Day in ${districtNameDisplay}`, `${districtNameDisplay} - இயல்பான வேலை நாள்`)}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  {T(
                    "No rain holidays or emergency closures reported for this district. Subscribe to our WhatsApp channel for instant alerts.",
                    "இந்த மாவட்டத்திற்கு விடுமுறை எதுவும் பதிவாகவில்லை. நேரடி தகவலுக்கு வாட்ஸ்அப் சேனலில் இணையுங்கள்."
                  )}
                </p>
                <Link
                  to="/explore"
                  className="inline-flex items-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  {T("Explore Community Feed", "பொது அறிவிப்புகளை காண்க")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id || post.slug} post={post} />
                ))}
              </div>
            )}

            <AdSlot placement="feed" className="w-full" />
          </div>

          {/* Right Column: FAQs & Sidebar Info */}
          <aside className="space-y-6">
            {/* Collector Order Protocol Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                {T("Holiday Protocol", "விடுமுறை அறிவிப்பு நெறிமுறை")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {T(
                  "School and college holidays during cyclones or heavy rainfall are strictly announced by respective District Collectors based on IMD advisories and local waterlogging conditions.",
                  "கனமழை அல்லது புயல் காலங்களில் உள்ளூர் சூழ்நிலையை ஆய்வு செய்து மாவட்ட ஆட்சியர்களே பள்ளி, கல்லூரிகளுக்கான விடுமுறையை அறிவிக்க அதிகாரம் பெற்றுள்ளனர்."
                )}
              </p>
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl">
                {T("Verified Source: Collectorate Press Release", "சரிபார்க்கப்பட்ட ஆதாரம்: மாவட்ட ஆட்சியர் செய்திக்குறிப்பு")}
              </div>
            </div>

            {/* Live IMD Monsoon Radar & Weather Warning Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-900/60 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800">
                  <CloudRain className="w-3.5 h-3.5 animate-pulse" />
                  {T("IMD Monsoon Radar", "வானிலை ரேடார்")}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">
                {T("Northeast Monsoon Heavy Rain Watch", "வடகிழக்கு பருவமழை தீவிர கண்காணிப்பு")}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {T(
                  "Track real-time IMD Doppler Weather Radar observations and coastal rainfall alerts for Tamil Nadu.",
                  "சென்னை வானிலை ஆய்வு மையத்தின் ரேடார் மற்றும் மாவட்ட வாரியான மழை எச்சரிக்கைகள்."
                )}
              </p>
              <div className="space-y-2">
                <a
                  href="https://mausam.imd.gov.in/chennai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all border border-white/10"
                >
                  <span className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-cyan-300" />
                    {T("IMD Chennai Doppler Radar", "சென்னை வானிலை ரேடார்")}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </a>
                <a
                  href="tel:1070"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all border border-white/10"
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
                    {T("TNDMA Disaster Control: 1070", "மாநில பேரிடர் கட்டுப்பாட்டு அறை: 1070")}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase">24x7</span>
                </a>
              </div>
            </div>

            {/* Google News Follow Badge (Discover Acceleration) */}
            <GoogleNewsFollow />

            {/* Structured Search FAQ Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
              </h3>
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {T(`Who declares school holidays in ${districtNameDisplay}?`, `${districtNameDisplay} மாவட்டத்தில் பள்ளி விடுமுறையை யார் அறிவிக்கிறார்கள்?`)}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {T(
                      `The ${districtNameDisplay} District Collector evaluates local rain intensity, waterlogged subways, and school accessibility to declare holidays.`,
                      `${districtNameDisplay} மாவட்ட ஆட்சித் தலைவர் மழை அளவை பொறுத்து விடுமுறை அறிவிப்பை வெளியிடுவார்.`
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {T("What is the official emergency helpline?", "அவசர உதவி எண்கள் என்ன?")}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {T(
                      "Call 1077 for District Disaster Control, 1070 for State Disaster Management, and 1913 for GCC.",
                      "மாவட்ட கட்டுப்பாட்டு அறைக்கு 1077 மற்றும் மாநில பேரிடர் சேவைக்கு 1070 எண்களை அழைக்கவும்."
                    )}
                  </p>
                </div>
              </div>
            </div>

            <AdSlot placement="category" className="w-full" />
          </aside>
        </div>
      </main>
    </div>
  );
}
