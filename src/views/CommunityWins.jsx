'use client';

import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy, ArrowLeft, Share2, CheckCircle2, ChevronLeft, ChevronRight,
  SlidersHorizontal, Users, MapPin, Calendar, Image as ImageIcon,
  ArrowUpRight, Award, TrendingUp, Star, Filter, RefreshCw,
  ChevronDown, X, FileText, Plus, Eye
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getActivePosts } from "@/services/posts";
import { getAreas } from "@/services/areas";
import { CATEGORIES } from "@/lib/categories";
import { DISTRICTS } from "@/lib/districts";
import ShareWinModal from "@/components/community/ShareWinModal";

/* ─── helpers ────────────────────────────────────────────── */
function timeAgo(dateStr, lang) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (lang === "ta") {
    if (days === 0) return "இன்று";
    if (days === 1) return "நேற்று";
    if (days < 7) return `${days} நாட்களுக்கு முன்பு`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} வாரம்${weeks > 1 ? "ங்கள்" : ""} முன்பு`;
    }
    const months = Math.floor(days / 30);
    return `${months} மாதம்${months > 1 ? "ங்கள்" : ""} முன்பு`;
  }
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
}

const TIME_RANGES = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "most_verified", label: "Most Verified" },
  { value: "oldest", label: "Oldest First" },
];

const CAT_ICON_MAP = {
  "road-infrastructure": { icon: "🛣️", label: "Roads", label_ta: "சாலைகள்", color: "bg-blue-100 text-blue-700" },
  "water-sanitation": { icon: "💧", label: "Water Supply", label_ta: "நீர் விநியோகம்", color: "bg-cyan-100 text-cyan-700" },
  electricity: { icon: "⚡", label: "Electricity", label_ta: "மின்சாரம்", color: "bg-yellow-100 text-yellow-700" },
  environment: { icon: "🌿", label: "Cleanliness", label_ta: "சுத்தம்", color: "bg-green-100 text-green-700" },
  "local-development": { icon: "🏗️", label: "Drainage", label_ta: "வடிகால்", color: "bg-orange-100 text-orange-700" },
  "public-safety": { icon: "🛡️", label: "Safety", label_ta: "பாதுகாப்பு", color: "bg-red-100 text-red-700" },
};

function getCatInfo(slug, lang) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const map = CAT_ICON_MAP[slug];
  const label = lang === "ta" ? (cat?.name_ta || map?.label_ta || slug) : (cat?.name_en || map?.label || slug);
  return {
    icon: map?.icon || cat?.icon || "✅",
    label: label,
    color: map?.color || "bg-slate-100 text-slate-700",
  };
}

/* ─── Filter Select ────────────────────────────────────────── */
function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="all">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

/* ─── Stats card ───────────────────────────────────────────── */
function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{label}</p>
      </div>
    </div>
  );
}

/* ─── Win Card ─────────────────────────────────────────────── */
function WinCard({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const cat = getCatInfo(post.category_slug, lang);
  const hasImage = !!post.image_url;

  const dObj = DISTRICTS.find((d) => d.slug === post.district_slug || d.name_en === post.district_name);
  const districtDisplay = dObj ? T(dObj.name_en, dObj.name_ta) : (post.district_name || T("Tamil Nadu", "தமிழ்நாடு"));

  return (
    <Link to={`/post/${post.id}`} className="block group">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all duration-200 overflow-hidden flex items-stretch">
        {/* Before / After thumbnails */}
        <div className="flex-shrink-0 flex w-44 sm:w-52">
          {hasImage ? (
            <>
              <div className="relative w-1/2 bg-slate-100 dark:bg-slate-800">
                <img
                  src={post.image_url}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-slate-900/70 text-white px-1.5 py-0.5 rounded-md">
                  {T("Before", "முன்பு")}
                </span>
              </div>
              <div className="relative w-1/2 bg-slate-100 dark:bg-slate-800">
                <img
                  src={post.after_image_url || post.image_url}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-green-600/90 text-white px-1.5 py-0.5 rounded-md">
                  {T("After", "பின்பு")}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cat.color}`}>
                {cat.icon} {cat.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" /> {T("Resolved", "தீர்க்கப்பட்டது")}
              </span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-0.5">
            {lang === "ta" ? (post.title_ta || post.title || "குடிமைப் பிரச்சனை தீர்க்கப்பட்டது") : (post.title_en || post.title || "Civic Issue Resolved")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {post.area_name && <>{post.area_name}, </>}{districtDisplay}
          </p>

          {(lang === "ta" ? post.content_ta : post.content_en) && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2">
              {lang === "ta" ? post.content_ta : post.content_en}
            </p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {timeAgo(post.updated_date || post.created_date, lang)}
            </span>
            {post.verification_count > 0 && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <Users className="w-3 h-3" />
                {lang === "ta" 
                  ? `${post.verification_count} குடிமக்களால் சரிபார்க்கப்பட்டது` 
                  : `Verified by ${post.verification_count} citizen${post.verification_count !== 1 ? "s" : ""}`}
              </span>
            )}
            {post.civic_receipt_id && (
              <span className="flex items-center gap-1 text-blue-500 font-mono">
                <FileText className="w-3 h-3" /> {post.civic_receipt_id}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center px-3 text-slate-300 dark:text-slate-600">
          <ChevronRight className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

/* ─── Empty state ──────────────────────────────────────────── */
function EmptyState({ hasFilters, onClearFilters }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
      <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Trophy className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">
        {hasFilters
          ? T("No wins match your filters", "உங்கள் வடிகட்டிகளுக்குப் பொருத்தமான வெற்றிகள் எதுவும் இல்லை")
          : T("No community wins recorded yet", "சமூக வெற்றிகள் இன்னும் பதிவு செய்யப்படவில்லை")}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
        {hasFilters
          ? T("Try changing the district, category, or time range to find more wins.", "கூடுதல் வெற்றிகளைக் கண்டறிய மாவட்டம், வகை அல்லது நேர வரம்பை மாற்றி முயற்சிக்கவும்.")
          : T("When civic issues get resolved, they'll appear here. Be the first to share a community win in your area.", "குடிமைப் பிரச்சனைகள் தீர்க்கப்படும்போது, அவை இங்கே தோன்றும். உங்கள் பகுதியில் சமூக வெற்றியைப் பகிர்ந்து கொள்ளும் முதல் நபராக இருங்கள்.")}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> {T("Clear Filters", "வடிகட்டிகளை நீக்கு")}
          </button>
        )}
        <Link to="/create" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" /> {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
        </Link>
        <Link to="/explore" className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Eye className="w-3.5 h-3.5" /> {T("View Active Issues", "செயலில் உள்ள சிக்கல்களைப் பார்")}
        </Link>
      </div>
    </div>
  );
}

/* ─── Sidebar: Wins by Category ───────────────────────────── */
function WinsByCategory({ wins }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const cats = useMemo(() => {
    const map = {};
    wins.forEach((w) => {
      const slug = w.category_slug || "general";
      map[slug] = (map[slug] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slug, count]) => ({ slug, count, ...getCatInfo(slug, lang) }));
  }, [wins, lang]);

  const max = cats[0]?.count || 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-900 dark:text-white text-sm">
          {T("Wins by Category", "வகை வாரியாக வெற்றிகள்")}
        </span>
        <Link to="/explore" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          {T("View all", "அனைத்தையும் பார்")} <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      {cats.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">{T("No data yet", "தரவுகள் இன்னும் இல்லை")}</p>
      ) : (
        <div className="space-y-3">
          {cats.map(({ slug, count, icon, label }) => (
            <div key={slug} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{label}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white ml-2">{count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar: Top Areas ───────────────────────────────────── */
function TopAreas({ wins }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const areas = useMemo(() => {
    const map = {};
    wins.forEach((w) => {
      if (!w.area_name) return;
      const key = w.area_slug || w.area_name;
      if (!map[key]) map[key] = { name: w.area_name, slug: w.area_slug, count: 0 };
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [wins]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-900 dark:text-white text-sm">
          {T("Top Areas This Week", "இந்த வாரத்தின் முக்கிய பகுதிகள்")}
        </span>
        <Link to="/areas" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          {T("View all", "அனைத்தையும் பார்")} <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      {areas.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">{T("No area data yet", "பகுதி தரவுகள் இன்னும் இல்லை")}</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {areas.map((area, i) => (
            <div key={area.slug || area.name} className="flex items-center gap-3 py-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {area.name}
              </span>
              <span className="text-xs font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                {area.count} {T(`win${area.count !== 1 ? "s" : ""}`, `வெற்றி${area.count !== 1 ? "கள்" : ""}`)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar: Top Contributors ────────────────────────────── */
function TopContributors({ wins }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const contribs = useMemo(() => {
    const map = {};
    wins.forEach((w) => {
      const id = w.created_by_id;
      if (!id) return;
      if (!map[id]) map[id] = { name: w.author_name || (lang === "ta" ? "குடிமகன்" : "Citizen"), id, count: 0 };
      map[id].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [wins, lang]);

  const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-900 dark:text-white text-sm">
          {T("Top Contributors", "சிறந்த பங்களிப்பாளர்கள்")}
        </span>
        <Link to="/leaderboard" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          {T("View leaderboard", "மதிப்பீட்டுப் பட்டியலைப் பார்")} <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
      {contribs.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">{T("No contributor data yet", "பங்களிப்பாளர் தரவுகள் இன்னும் இல்லை")}</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {contribs.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 py-2.5">
              <div className={`w-7 h-7 rounded-full ${COLORS[i]} flex items-center justify-center flex-shrink-0`}>
                <span className="text-[11px] font-bold text-white">
                  {(c.name || "C").charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                {c.count} {T("verified", "சரிபார்க்கப்பட்டது")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Pagination ───────────────────────────────────────────── */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
            p === page
              ? "bg-blue-600 text-white"
              : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          {p}
        </button>
      ))}
      {totalPages > 5 && (
        <>
          <span className="text-slate-400 text-sm">…</span>
          <button
            onClick={() => onChange(totalPages)}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

export default function CommunityWins() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  usePageMeta({
    title: "Community Wins | NammaTN",
    description: "Verified civic improvements and resolved issues across Tamil Nadu — real progress made by real citizens.",
  });

  const [districtFilter, setDistrictFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: rawPosts = [], isLoading } = useQuery({
    queryKey: ["community-wins-posts"],
    queryFn: () => getActivePosts(200),
    staleTime: 60_000,
  });

  // Only resolved / citizen_verified_fixed posts
  const allWins = useMemo(() =>
    rawPosts.filter((p) =>
      p.civic_status === "citizen_verified_fixed" ||
      p.civic_status === "resolved"
    ), [rawPosts]);

  const cutoff = useMemo(() => {
    const now = Date.now();
    if (timeFilter === "today") return now - 86400_000;
    if (timeFilter === "week") return now - 7 * 86400_000;
    if (timeFilter === "month") return now - 30 * 86400_000;
    return 0;
  }, [timeFilter]);

  const filtered = useMemo(() => {
    return allWins.filter((p) => {
      if (districtFilter !== "all" && p.district_slug !== districtFilter) return false;
      if (categoryFilter !== "all" && p.category_slug !== categoryFilter) return false;
      if (cutoff && new Date(p.created_date).getTime() < cutoff) return false;
      return true;
    }).sort((a, b) => {
      if (sort === "most_verified") return (b.verification_count || 0) - (a.verification_count || 0);
      if (sort === "oldest") return new Date(a.created_date) - new Date(b.created_date);
      return new Date(b.created_date) - new Date(a.created_date);
    });
  }, [allWins, districtFilter, categoryFilter, cutoff, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = useCallback((setter) => (val) => {
    setter(val);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setDistrictFilter("all");
    setCategoryFilter("all");
    setTimeFilter("all");
    setSort("newest");
    setPage(1);
  }, []);

  const hasFilters = districtFilter !== "all" || categoryFilter !== "all" || timeFilter !== "all";

  // Derived stats
  const thisMonthCutoff = Date.now() - 30 * 86400_000;
  const winsThisMonth = allWins.filter((p) => new Date(p.created_date).getTime() >= thisMonthCutoff).length;
  const citizensInvolved = allWins.reduce((sum, p) => sum + (p.verification_count || 0), 0);
  const uniqueDistricts = new Set(allWins.map((p) => p.district_slug).filter(Boolean)).size;
  const catCounts = {};
  allWins.forEach((p) => { if (p.category_slug) catCounts[p.category_slug] = (catCounts[p.category_slug] || 0) + 1; });
  const topCatSlug = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCat = getCatInfo(topCatSlug);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg">
            <Trophy className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              {T("Community Wins", "சமூக வெற்றிகள்")}
            </h1>
            <p className="text-indigo-200 text-sm font-medium">
              {T("Real progress made in our communities", "நம் சமூகங்களில் நிஜ முன்னேற்றம்")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sub-header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link to="/community" className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {T("Community Wins", "சமூக வெற்றிகள்")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {T("Verified and resolved issues that made our areas better.", "எங்கள் பகுதிகளை மேம்படுத்திய சரிபார்க்கப்பட்டு தீர்க்கப்பட்ட சிக்கல்கள்.")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            {T("Share a Win", "வெற்றி பகிர்")}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left: main feed ── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <FilterSelect
                value={districtFilter}
                onChange={handleFilterChange(setDistrictFilter)}
                placeholder={T("All Districts", "அனைத்து மாவட்டங்கள்")}
                options={DISTRICTS.map((d) => ({ value: d.slug, label: T(d.name_en, d.name_ta) }))}
              />
              <FilterSelect
                value={categoryFilter}
                onChange={handleFilterChange(setCategoryFilter)}
                placeholder={T("All Categories", "அனைத்து பிரிவுகள்")}
                options={CATEGORIES.map((c) => ({ value: c.slug, label: `${c.icon} ${T(c.name_en, c.name_ta)}` }))}
              />
              <FilterSelect
                value={timeFilter}
                onChange={handleFilterChange(setTimeFilter)}
                placeholder={T("All Time", "எல்லா காலமும்")}
                options={TIME_RANGES.filter((r) => r.value !== "all").map((r) => ({
                  value: r.value,
                  label: r.value === "today" ? T("Today", "இன்று") : r.value === "week" ? T("This Week", "இந்த வாரம்") : T("This Month", "இந்த மாதம்")
                }))}
              />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1.5"
                >
                  <X className="w-3 h-3" /> {T("Clear", "நீக்கு")}
                </button>
              )}
              <div className="ml-auto">
                <FilterSelect
                  value={sort}
                  onChange={setSort}
                  placeholder={T("Sort", "வரிசைப்படுத்து")}
                  options={SORT_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.value === "newest" ? T("Newest First", "புதியவை முதலில்") : o.value === "most_verified" ? T("Most Verified", "அதிகம் சரிபார்க்கப்பட்டவை") : T("Oldest First", "பழையவை முதலில்")
                  }))}
                />
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                value={isLoading ? "—" : allWins.length.toLocaleString()}
                label={T("Wins Achieved", "பெறப்பட்ட வெற்றிகள்")}
                color="bg-green-50 dark:bg-green-900/20"
              />
              <StatCard
                icon={<Users className="w-5 h-5 text-blue-600" />}
                value={isLoading ? "—" : citizensInvolved.toLocaleString()}
                label={T("Citizens Involved", "பங்கேற்ற குடிமக்கள்")}
                color="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatCard
                icon={<MapPin className="w-5 h-5 text-purple-600" />}
                value={isLoading ? "—" : uniqueDistricts}
                label={T("Districts", "மாவட்டங்கள்")}
                color="bg-purple-50 dark:bg-purple-900/20"
              />
              <StatCard
                icon={<Star className="w-5 h-5 text-orange-500" />}
                value={isLoading ? "—" : (topCatSlug ? topCat.icon : "—")}
                label={isLoading ? T("Loading…", "ஏற்றப்படுகிறது...") : topCatSlug ? `${topCat.label} — ${T("Most Wins", "அதிக வெற்றிகள்")}` : T("Most Wins", "அதிக வெற்றிகள்")}
                color="bg-orange-50 dark:bg-orange-900/20"
              />
            </div>

            {/* Results count */}
            {!isLoading && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {filtered.length > 0
                  ? T(`Showing ${filtered.length} verified win${filtered.length !== 1 ? "s" : ""}`, `சரிபார்க்கப்பட்ட ${filtered.length} வெற்றிகள் காட்டப்படுகின்றன`)
                  : T("No results", "முடிவுகள் எதுவும் இல்லை")}
                {hasFilters && ` (${T("filtered", "வடிகட்டப்பட்டது")})`}
              </p>
            )}

            {/* Win cards */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 h-28 animate-pulse" />
                ))}
              </div>
            ) : paged.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
            ) : (
              <>
                <div className="space-y-3">
                  {paged.map((post) => <WinCard key={post.id} post={post} />)}
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 border border-green-100 dark:border-green-800/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">
                  {T("Know about a resolved issue?", "தீர்க்கப்பட்ட ஒரு சிக்கலைப் பற்றி தெரியுமா?")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {T("Share it as a community win and help others trust the process.", "அதை ஒரு சமூக வெற்றியாகப் பகிர்ந்து, மற்றவர்கள் இந்தச் செயல்முறையை நம்ப உதவிடுங்கள்.")}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> {T("Share a Win", "வெற்றி பகிர்")}
                </button>
                <Link to="/create" className="flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <FileText className="w-3.5 h-3.5" /> {T("Civic Receipt", "குடிமை ரசீது")}
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="lg:w-64 space-y-4 flex-shrink-0">
            <WinsByCategory wins={filtered} />
            <TopAreas wins={filtered} />
            <TopContributors wins={allWins} />
          </div>
        </div>
      </div>

      {/* Share Win Modal */}
      {showShareModal && <ShareWinModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
}
