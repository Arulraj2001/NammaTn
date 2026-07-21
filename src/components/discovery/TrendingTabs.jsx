import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame, Calendar, TrendingUp, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getTrendingPosts } from "@/services/trending";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";

const DATE_TABS = [
  { id: "today", icon: Flame, en: "Today", ta: "இன்று" },
  { id: "week", icon: Calendar, en: "This Week", ta: "இந்த வாரம்" },
  { id: "month", icon: TrendingUp, en: "This Month", ta: "இந்த மாதம்" },
  { id: "all", icon: TrendingUp, en: "All Time", ta: "எல்லா நேரமும்" },
];

// Trending reason pill
function TrendingReason({ reason }) {
  if (!reason) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 px-2 py-0.5 rounded-full">
      🔥 {reason}
    </span>
  );
}

export default function TrendingTabs({ limit = 9, initialPosts }) {
  const [dateTab, setDateTab] = useState("week");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [civicOnly, setCivicOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["trending-posts", dateTab, districtFilter, categoryFilter, civicOnly],
    queryFn: () => getTrendingPosts(limit, {
      district: districtFilter !== "all" ? districtFilter : "all",
      category: categoryFilter !== "all" ? categoryFilter : "all",
      civicOnly,
      dateRange: dateTab,
    }),
    initialData: dateTab === "week" && districtFilter === "all" && categoryFilter === "all" && !civicOnly
      ? initialPosts
      : undefined,
    staleTime: 120_000,
  });

  const activeFilters = [districtFilter !== "all", categoryFilter !== "all", civicOnly].filter(Boolean).length;

  const clearFilters = () => {
    setDistrictFilter("all"); setCategoryFilter("all"); setCivicOnly(false);
  };

  return (
    <div>
      {/* Date tabs */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {DATE_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setDateTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  dateTab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {T(t.en, t.ta)}
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || activeFilters > 0 ? "bg-orange-600 text-white border-orange-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {T("Filters", "வடிகட்டிகள்")}
          {activeFilters > 0 && <span className={`text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold ${activeFilters > 0 ? "bg-white text-orange-600" : ""}`}>{activeFilters}</span>}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{T("District", "மாவட்டம்")}</label>
              <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white">
                <option value="all">{T("All Districts", "அனைத்து மாவட்டங்கள்")}</option>
                {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{T("Category", "வகை")}</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white">
                <option value="all">{T("All Categories", "அனைத்து வகைகளும்")}</option>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {T(c.name_en, c.name_ta)}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={civicOnly} onChange={(e) => setCivicOnly(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{T("Civic Receipts only", "குடிமை ரசீதுகள் மட்டும்")}</span>
              </label>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                  <X className="w-3 h-3" /> {T("Clear filters", "வடிகட்டிகளை அழி")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Posts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <Flame className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">{T("No trending activity yet for this period.", "இந்த காலகட்டத்தில் டிரெண்டிங் நடவடிக்கை இல்லை.")}</p>
          <p className="text-xs text-slate-400 mt-1">{T("Recent public activity will appear here.", "சமீபத்திய பொது நடவடிக்கை இங்கே தோன்றும்.")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="relative">
              {p._reason && (
                <div className="mb-1.5">
                  <TrendingReason reason={p._reason} />
                </div>
              )}
              <PostCard post={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
