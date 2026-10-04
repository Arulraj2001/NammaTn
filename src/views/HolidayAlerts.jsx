"use client";

import React, { useState, useMemo } from "react";
import { GraduationCap, PhoneCall, AlertCircle, Search, CheckCircle2, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PostCard from "@/components/posts/PostCard";
import { Link } from "@/lib/router-compat";
import AdSlot from "@/components/ads/AdSlot";

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
];

export default function HolidayAlerts({ initialPosts = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchDistrict = selectedDistrict === "all" || post.district_slug === selectedDistrict;
      const textToSearch = `${post.title_en || ""} ${post.title_ta || ""} ${post.content_en || ""} ${post.location_text || ""} ${post.area_name || ""}`.toLowerCase();
      const matchQuery = !searchQuery || textToSearch.includes(searchQuery.toLowerCase().trim());
      return matchDistrict && matchQuery;
    });
  }, [initialPosts, selectedDistrict, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-sky-200 mb-3 border border-sky-400/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {T("OFFICIAL COLLECTORATE & WEATHER DESK", "மாவட்ட ஆட்சியர் அறிவிப்புகள்")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3">
                {T("TN School & College Holiday Alerts", "பள்ளி & கல்லூரி விடுமுறை அறிவிப்புகள்")}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                {T(
                  "Verified emergency school and college holiday declarations by District Collectors, IMD heavy rain alerts (Red/Orange), and State Disaster Management updates.",
                  "கனமழை, புயல் மற்றும் அவசர காலங்களில் மாவட்ட ஆட்சியர்களால் அறிவிக்கப்படும் பள்ளி மற்றும் கல்லூரி விடுமுறை விவரங்கள்."
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
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T("Search district, school order, or rain alert...", "மாவட்டம் அல்லது அறிவிப்பு தேடுக...")}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* District Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {PRIORITY_DISTRICTS.map((dist) => (
              <button
                key={dist.slug}
                onClick={() => setSelectedDistrict(dist.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDistrict === dist.slug
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T(dist.name_en, dist.name_ta)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT FEED ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Posts Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                {T(
                  selectedDistrict === "all" ? "Active Educational & Weather Alerts" : `${selectedDistrict.toUpperCase()} Holiday Alerts`,
                  selectedDistrict === "all" ? "விடுமுறை & அவசர அறிவிப்புகள்" : `${selectedDistrict.toUpperCase()} விடுமுறை அறிவிப்புகள்`
                )}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
                {filteredPosts.length} {T("Alerts", "அறிவிப்புகள்")}
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T("Normal Working Day Across Districts", "இயல்பான வேலை நாள்")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  {T(
                    "No rain holidays or emergency school closures have been announced by District Collectors at this time.",
                    "தற்போதைக்கு மாவட்ட ஆட்சியர்களால் பள்ளி, கல்லூரிகளுக்கு விடுமுறை எதுவும் அறிவிக்கப்படவில்லை."
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

            {/* Structured Search FAQ Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
              </h3>
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {T("Who declares school holidays during heavy rain in TN?", "தமிழகத்தில் கனமழை விடுமுறையை யார் அறிவிக்கிறார்கள்?")}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {T(
                      "Each District Collector evaluates rainfall intensity and subway/road flooding to declare holidays for schools and colleges in their district.",
                      "அந்தந்த மாவட்ட ஆட்சித் தலைவர்கள் மழை அளவை பொறுத்து பள்ளி கல்லூரிகளுக்கான விடுமுறை அறிவிப்பை வெளியிடுவார்கள்."
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {T("What are the official emergency helplines?", "அவசர உதவி எண்கள் என்ன?")}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {T(
                      "Call 1077 for District Disaster Control Rooms, 1070 for State Disaster Management, and 1913 for Greater Chennai Corporation flood assistance.",
                      "மாவட்ட கட்டுப்பாட்டு அறைக்கு 1077, மாநில அவசர சேவைக்கு 1070 மற்றும் சென்னை மாநகராட்சிக்கு 1913 என்ற எண்களை அழைக்கவும்."
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
