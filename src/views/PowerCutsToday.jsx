"use client";

import React, { useState, useMemo } from "react";
import { Zap, PhoneCall, AlertTriangle, Filter, Search, CheckCircle2, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PostCard from "@/components/posts/PostCard";
import { Link } from "@/lib/router-compat";
import AdSlot from "@/components/ads/AdSlot";

const PRIORITY_DISTRICTS = [
  { slug: "all", name_en: "All Districts", name_ta: "அனைத்து மாவட்டங்கள்" },
  { slug: "chennai", name_en: "Chennai", name_ta: "சென்னை" },
  { slug: "coimbatore", name_en: "Coimbatore", name_ta: "கோயம்புத்தூர்" },
  { slug: "madurai", name_en: "Madurai", name_ta: "மதுரை" },
  { slug: "tiruchirappalli", name_en: "Tiruchirappalli", name_ta: "திருச்சிராப்பள்ளி" },
  { slug: "salem", name_en: "Salem", name_ta: "சேலம்" },
  { slug: "tirunelveli", name_en: "Tirunelveli", name_ta: "திருநெல்வேலி" },
  { slug: "tiruppur", name_en: "Tiruppur", name_ta: "திருப்பூர்" },
  { slug: "erode", name_en: "Erode", name_ta: "ஈரோடு" },
  { slug: "chengalpattu", name_en: "Chengalpattu", name_ta: "செங்கல்பட்டு" },
  { slug: "tiruvallur", name_en: "Tiruvallur", name_ta: "திருவள்ளூர்" },
];

export default function PowerCutsToday({ initialPosts = [] }) {
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
      <section className="bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-800 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-200 mb-3 border border-amber-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {T("LIVE TANGEDCO SUBSTATION FEED", "நேரடி மின்தடை அறிவிப்புகள்")}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3">
                {T("Tamil Nadu Power Cut Today", "தமிழ்நாடு இன்று மின்தடை பகுதிகள்")}
              </h1>
              <p className="text-amber-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                {T(
                  "Verified scheduled power shutdowns, maintenance timings (9 AM – 2 PM), affected streets, and 24x7 TANGEDCO Minnalagam helpline numbers across all 38 districts.",
                  "மின்வாரிய பராமரிப்பு பணி காரணமாக இன்று மற்றும் நாளை மின்சாரம் நிறுத்தப்படும் பகுதிகள், தெருக்கள் விவரம் மற்றும் மின்தடை உதவி எண்கள்."
                )}
              </p>
            </div>

            {/* Quick Helpline Card */}
            <div className="bg-black/30 backdrop-blur-lg border border-amber-400/40 rounded-2xl p-5 flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-bold tracking-wider uppercase">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                {T("TANGEDCO Minnalagam 24x7", "மின்வாரிய 24x7 உதவி எண்")}
              </div>
              <a
                href="tel:1912"
                className="text-3xl font-black tracking-tight text-white hover:text-emerald-300 transition-colors flex items-center gap-2"
              >
                1912
              </a>
              <p className="text-xs text-amber-200/80">
                {T("Call for snapped wires, transformer blast, or no-power complaints.", "மின் கம்பிகள் அறுந்து விழுதல் அல்லது மின் தடையின் போது அழைக்கவும்.")}
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
              placeholder={T("Search street, area, or substation...", "தெரு, பகுதி அல்லது துணை மின்நிலையம் தேடுக...")}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
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
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105"
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
                <Zap className="w-5 h-5 text-amber-500" />
                {T(
                  selectedDistrict === "all" ? "Scheduled Power Outages Today" : `${selectedDistrict.toUpperCase()} Power Cuts`,
                  selectedDistrict === "all" ? "இன்றைய மின்தடை அறிவிப்புகள்" : `${selectedDistrict.toUpperCase()} மின்தடை விவரங்கள்`
                )}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                {filteredPosts.length} {T("Reports", "அறிவிப்புகள்")}
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {T("No Major Power Cuts Reported", "குறிப்பிடத்தக்க மின்தடை இல்லை")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  {T(
                    "No scheduled maintenance shutdowns matching your search criteria. If your power is down, report it directly to TANGEDCO 1912.",
                    "தேடலுக்குரிய மின்தடை எதுவும் பதிவாகவில்லை. உங்கள் பகுதியில் மின்சாரம் இல்லையெனில் 1912 எண்ணிற்கு புகாரளிக்கவும்."
                  )}
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  {T("Report Local Power Issue", "மின்தடை புகார் பதிவிடுக")}
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
            {/* Citizen Rights & Helplines Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {T("Emergency Helplines", "மின்சார அவசர உதவி எண்கள்")}
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span>{T("Statewide Minnalagam", "மாநில மின்வாரிய உதவி எண்")}</span>
                  <a href="tel:1912" className="font-bold text-amber-600 dark:text-amber-400">1912</a>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span>{T("WhatsApp Grievances", "வாட்ஸ்அப் புகார்")}</span>
                  <span className="font-bold text-slate-800 dark:text-white">94987 94987</span>
                </li>
                <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span>{T("Chief Minister Helpline", "முதல்வர் உதவி எண்")}</span>
                  <a href="tel:1100" className="font-bold text-blue-600 dark:text-blue-400">1100</a>
                </li>
              </ul>
            </div>

            {/* Structured Search FAQ Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
              </h3>
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {T("How to check today's power cut in my area?", "எனது பகுதியில் இன்று மின்தடை உள்ளதா என அறிவது எப்படி?")}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {T(
                      "Filter by your district above or type your street name into the search bar. VizhiTN aggregates verified daily shutdown releases from all TANGEDCO distribution circles.",
                      "மேலே உள்ள மாவட்ட பட்டியலில் உங்கள் மாவட்டத்தை தேர்வு செய்து தெரு பெயரை தேடலாம். மின்வாரிய அறிவிப்புகள் உடனுக்குடன் புதுப்பிக்கப்படுகின்றன."
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {T("Why are shutdowns scheduled from 9:00 AM to 2:00 PM?", "காலை 9 முதல் மதியம் 2 மணி வரை ஏன் மின்சாரம் நிறுத்தப்படுகிறது?")}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {T(
                      "Substations conduct periodic transformer oil testing, tree trimming near high-tension lines, and feeder line maintenance during daytime off-peak hours.",
                      "துணை மின் நிலையங்களில் உள்ள மின்மாற்றிகள் பராமரிப்பு மற்றும் மின் கம்பிகளுக்கு இடையூறாக உள்ள மரக்கிளைகளை அகற்ற இப்பணி பகலில் மேற்கொள்ளப்படுகிறது."
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
