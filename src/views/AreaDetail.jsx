'use client';

import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  MapPin, ArrowLeft, ShieldAlert, FileText, AlertTriangle,
  Plus, CheckCircle, Zap, Droplets, Construction, Users,
  ArrowRight, Clock, ChevronRight, Share2, RefreshCw,
  Star, Trophy, Flame, Building2, PhoneCall, BadgeCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getAreaBySlug } from "@/services/areas";
import { getAreaCivicPosts } from "@/services/posts";
import { getActiveScams } from "@/services/scamAlerts";
import { getActiveEmergencies } from "@/services/emergencyPosts";
import { supabase } from "@/api/supabaseClient";

// Dynamic map (no SSR)
const InteractiveHomeMap = dynamic(
  () => import("@/components/home/InteractiveHomeMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400 text-sm rounded-xl">
        Loading Map…
      </div>
    ),
  }
);

/* ── helpers ──────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

const TODAY_START = new Date();
TODAY_START.setHours(0, 0, 0, 0);

const STATUS_META = {
  reported:               { label: "Open",          color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  open:                   { label: "Open",          color: "bg-blue-100 text-blue-700" },
  under_review:           { label: "In Review",     color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  in_progress:            { label: "In Progress",   color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  complaint_needed:       { label: "Needs Action",  color: "bg-orange-100 text-orange-700" },
  resolved:               { label: "Resolved",      color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  citizen_verified_fixed: { label: "Resolved",      color: "bg-green-100 text-green-700" },
  closed:                 { label: "Closed",        color: "bg-slate-100 text-slate-600" },
  escalated:              { label: "Escalated",     color: "bg-red-100 text-red-700" },
};

function statusBadge(s) {
  return STATUS_META[s] || { label: s || "Open", color: "bg-slate-100 text-slate-600" };
}

/* ── Area header image ──────────────────────────────── */
const AREA_IMAGES = {
  velachery: "/images/areas/velachery.jpg",
  "anna-nagar": "/images/areas/anna-nagar.jpg",
  adyar: "/images/areas/adyar.jpg",
  tambaram: "/images/areas/tambaram.jpeg",
  "rs-puram": "/images/areas/rs-puram.jpg",
  "t-nagar": "/images/areas/t-nagar.jpg",
  "kk-nagar": "/images/areas/kk-nagar.jpg",
  perambur: "/images/areas/perambur.jpg",
  srirangam: "/images/areas/srirangam.jpg",
  "saibaba-colony": "/images/areas/saibaba-colony.jpg",
  singanallur: "/images/areas/singanallur.jpg",
  "thillai-nagar": "/images/areas/thillai-nagar.jpg",
};
const getAreaImg = (slug) =>
  AREA_IMAGES[slug] || "/images/areas/default.jpg";

/* ── Stat chip in header ──────────────────────────── */
function HeaderStat({ icon, count, label, color }) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-base font-extrabold text-slate-800 dark:text-white">{count}</span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

/* ── Area Pulse row card ──────────────────────────── */
function PulseStatCard({ icon, count, label, sub, color, bg, to }) {
  const Icon = icon;
  return (
    <Link to={to} className="flex-1 min-w-0 group">
      <div className={`flex flex-col items-center text-center px-2 py-3 rounded-xl border ${bg} hover:shadow-sm transition-shadow`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className={`text-xl font-extrabold ${color} leading-none`}>{count}</span>
        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5 leading-tight">{label}</p>
        {sub && <p className="text-[10px] text-blue-500 group-hover:underline mt-0.5">{sub}</p>}
      </div>
    </Link>
  );
}

/* ── Receipt card ─────────────────────────────────── */
function ReceiptCard({ post, T }) {
  const sb = statusBadge(post.civic_status || post.status);
  const cats = (post.category_slug || "").toLowerCase();
  const level = post.verification_count >= 10 ? 3 : post.verification_count >= 5 ? 2 : 1;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {post.civic_receipt_id && (
            <p className="text-[11px] text-slate-400 font-mono mb-0.5">{post.civic_receipt_id}</p>
          )}
          <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">
            {post.title || post.description?.slice(0, 60) || T("Civic Issue", "குடிமை சிக்கல்")}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${sb.color}`}>
          {sb.label}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 mb-2">
        <span className="flex items-center gap-0.5">
          <MapPin className="w-3 h-3" />
          {post.area_name || post.area_slug || ""}
        </span>
        {post.verification_count > 0 && (
          <span className="flex items-center gap-0.5">
            <BadgeCheck className="w-3 h-3 text-blue-500" />
            {T(`Verified by ${post.verification_count} citizens`, `${post.verification_count} குடிமக்களால் சரிபார்க்கப்பட்டது`)}
          </span>
        )}
        <span className="ml-auto">{timeAgo(post.created_date)}</span>
      </div>
      {level && (
        <div className="flex items-center gap-1 mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            level === 3 ? "bg-red-100 text-red-700" : level === 2 ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
          }`}>
            Level {level}
          </span>
        </div>
      )}
      <Link
        to={`/post/${post.id}`}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        {T("View Details →", "விவரங்கள் பார் →")}
      </Link>
    </div>
  );
}

/* ── Timeline item ────────────────────────────────── */
function TimelineItem({ post, T }) {
  const sb = statusBadge(post.civic_status || post.status);
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 flex-1 leading-snug">
            {post.title || post.description?.slice(0, 60) || T("Civic update", "குடிமை புதுப்பிப்பு")}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${sb.color}`}>
            {sb.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">{formatTime(post.created_date)}</p>
      </div>
    </div>
  );
}

/* ── Area Score gauge ─────────────────────────────── */
function AreaScoreGauge({ score, T }) {
  const circumference = 2 * Math.PI * 36;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? T("Good", "நல்லது") : score >= 60 ? T("Fair", "சுமார்") : T("Needs work", "மேம்பாடு தேவை");
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="rotate-[-90deg]" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-slate-800 dark:text-white">{score}</span>
          <span className="text-[9px] text-slate-400">/100</span>
        </div>
      </div>
      <p className="text-xs font-semibold mt-1" style={{ color }}>{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AreaDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const [mapFilter, setMapFilter] = useState("all");
  const [moreTab, setMoreTab] = useState("wins");

  /* ── Queries ────────────────────────────────────── */
  const { data: area, isLoading: areaLoading } = useQuery({
    queryKey: ["area", slug],
    queryFn: () => getAreaBySlug(slug),
    enabled: !!slug,
  });

  usePageMeta({
    title: area ? `${area.name_en} Area Pulse – NammaTN` : "Area – NammaTN",
    description: area
      ? `Live civic updates, active issues, and local news for ${area.name_en}, ${area.district_name_en || ""}.`
      : "",
  });

  const { data: civicPosts = [], isLoading: civicLoading } = useQuery({
    queryKey: ["area-civic-posts", slug],
    queryFn: () => getAreaCivicPosts(slug, 100),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: scams = [] } = useQuery({
    queryKey: ["area-scams", slug],
    queryFn: () => getActiveScams(30),
    select: (d) => d.filter((s) => s.area_slug === slug),
    staleTime: 60_000,
  });

  const { data: emergencies = [] } = useQuery({
    queryKey: ["area-emergencies", slug],
    queryFn: () => getActiveEmergencies(20),
    select: (d) => d.filter((e) => e.area_slug === slug),
    staleTime: 60_000,
  });

  /* ── Derived stats ──────────────────────────────── */
  const stats = useMemo(() => {
    const open = civicPosts.filter((p) =>
      ["reported", "open", "pending", "under_review", "in_progress", "complaint_needed"].includes(p.status || p.civic_status)
    ).length;
    const resolved = civicPosts.filter((p) =>
      ["resolved", "citizen_verified_fixed", "closed"].includes(p.status || p.civic_status)
    ).length;
    const alerts = civicPosts.filter((p) => {
      const cat = (p.category_slug || "").toLowerCase();
      return cat.includes("water") || cat.includes("power") || cat.includes("electricity") || cat.includes("road");
    }).length + scams.length;
    const active = civicPosts.filter((p) => p.status === "active" || p.status === "in_progress").length + emergencies.length;
    return { open, resolved, alerts, active };
  }, [civicPosts, scams, emergencies]);

  /* Pulse breakdown */
  const powerCuts = civicPosts.filter((p) => (p.category_slug || "").toLowerCase().includes("power") || (p.category_slug || "").toLowerCase().includes("electric")).length;
  const waterIssues = civicPosts.filter((p) => (p.category_slug || "").toLowerCase().includes("water")).length;
  const roadProblems = civicPosts.filter((p) => (p.category_slug || "").toLowerCase().includes("road") || (p.category_slug || "").toLowerCase().includes("infra")).length;
  const scamAlerts = scams.length;
  const emergencyReqs = emergencies.length;

  /* Today's timeline */
  const todayPosts = useMemo(() =>
    [...civicPosts]
      .filter((p) => p.created_date && new Date(p.created_date) >= TODAY_START)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 8),
    [civicPosts]
  );

  /* Active receipts */
  const activeReceipts = useMemo(() =>
    [...civicPosts]
      .filter((p) => !["resolved", "citizen_verified_fixed", "closed"].includes(p.status || p.civic_status))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 4),
    [civicPosts]
  );

  /* Community wins (resolved posts) */
  const communityWins = useMemo(() =>
    civicPosts
      .filter((p) => ["resolved", "citizen_verified_fixed"].includes(p.status || p.civic_status))
      .slice(0, 5),
    [civicPosts]
  );

  /* Map items */
  const mapItems = useMemo(() => {
    const all = civicPosts.map((p) => ({ ...p, post_type: "civic" }));
    if (mapFilter === "all") return all;
    return all.filter((p) => (p.category_slug || "").toLowerCase().includes(mapFilter));
  }, [civicPosts, mapFilter]);

  /* Area score (computed) */
  const areaScore = useMemo(() => {
    if (civicPosts.length === 0) return 75;
    const resRate = Math.min(100, Math.round((communityWins.length / Math.max(civicPosts.length, 1)) * 100));
    return Math.min(99, Math.max(40, 60 + resRate * 0.4));
  }, [civicPosts, communityWins]);

  /* ── Loading / 404 ──────────────────────────────── */
  if (areaLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (!area) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
      <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p>{T("Area not found.", "பகுதி கண்டுபிடிக்கப்படவில்லை.")}</p>
      <Link to="/areas" className="mt-4 inline-block text-blue-600 text-sm hover:underline">
        ← {T("All Areas", "அனைத்து பகுதிகள்")}
      </Link>
    </div>
  );

  const areaName = T(area.name_en, area.name_ta || area.name_en);
  const districtName = area.district_name_en || area.district_name || "";

  /* ── PULSE STATS array (for section 1) ─────────── */
  const PULSE_STATS = [
    { icon: Zap,          count: powerCuts,     label: T("Power Cuts", "மின் வெட்டு"),        sub: T("View →", "பார் →"), color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30", to: "/category/electricity" },
    { icon: Droplets,     count: waterIssues,   label: T("Water Issues", "நீர் சிக்கல்"),     sub: T("View →", "பார் →"), color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30", to: "/category/water-sanitation" },
    { icon: Construction, count: roadProblems,  label: T("Road Problems", "சாலை சிக்கல்"),   sub: T("View →", "பார் →"), color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30", to: "/category/road-infrastructure" },
    { icon: ShieldAlert,  count: scamAlerts,    label: T("Scam Alerts", "மோசடி எச்சரிக்கை"), sub: T("View →", "பார் →"), color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30", to: "/scams" },
    { icon: AlertTriangle, count: emergencyReqs, label: T("Emergency", "அவசர நிலை"),        sub: T("View →", "பார் →"), color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30", to: "/help" },
  ];

  /* ── MAP FILTER tabs ────────────────────────────── */
  const MAP_FILTERS = [
    { key: "all",   label: T("All", "அனைத்தும்") },
    { key: "power", label: T("Power", "மின்சாரம்") },
    { key: "water", label: T("Water", "நீர்") },
    { key: "road",  label: T("Road", "சாலை") },
    { key: "scam",  label: T("Scam", "மோசடி") },
  ];

  /* ─────────────────────────────────────────────────
     SHARED CONTENT blocks (rendered into both columns)
  ───────────────────────────────────────────────── */

  /* ── HEADER BLOCK ──────────────────────────────── */
  const HeaderBlock = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden mb-4">
      {/* Top bar: breadcrumb + share */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/areas" className="hover:text-blue-600">{T("All Areas", "அனைத்து பகுதிகள்")}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-800 dark:text-white font-medium">{areaName}</span>
        </div>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <Share2 className="w-3.5 h-3.5" /> {T("Share", "பகிர்")}
        </button>
      </div>

      {/* Area identity row */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-start gap-4">
          {/* Area avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-slate-200 dark:border-slate-600 relative bg-slate-100">
            <Image
              src={getAreaImg(slug)}
              alt={areaName}
              fill
              sizes="(max-width: 640px) 56px, 64px"
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">{areaName}</h1>
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{districtName}{districtName ? ", Tamil Nadu" : "Tamil Nadu"}</p>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <HeaderStat icon={ShieldAlert}  count={stats.alerts}   label={T("Alerts","எச்சரிக்கை")}     color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
              <HeaderStat icon={FileText}     count={stats.open}     label={T("Issues Open","திறந்தவை")} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
              <HeaderStat icon={CheckCircle}  count={stats.resolved} label={T("Resolved","தீர்க்கப்பட்டது")} color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
              <HeaderStat icon={Users}        count={stats.active}   label={T("Active","செயலில்")}        color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Badges + Change Area */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {civicPosts.length > 5 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded-full">
              <Flame className="w-3 h-3" /> {T("High Activity Area", "அதிக செயல்பாடு உள்ள பகுதி")}
            </span>
          )}
          <Link
            to="/areas"
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> {T("Change Area", "பகுதி மாற்று")}
          </Link>
        </div>

        {/* CTA */}
        <Link
          to={`/create?area=${slug}&district=${area.district_slug || ""}`}
          className="mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors w-full"
        >
          <Plus className="w-4 h-4" />
          {T("Create Civic Receipt in this area", "இந்த பகுதியில் குடிமை ரசீது உருவாக்கு")}
        </Link>
      </div>
    </div>
  );

  /* ── SECTION 1: AREA PULSE ─────────────────────── */
  const PulseSection = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
          1. {T("Area Pulse", "பகுதி துடிப்பு")}
        </h2>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <RefreshCw className="w-3 h-3" />
          {T("Updated 5 mins ago", "5 நிமிடம் முன்பு புதுப்பிக்கப்பட்டது")}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {PULSE_STATS.map((s, i) => (
          <PulseStatCard key={i} {...s} />
        ))}
      </div>
    </div>
  );

  /* ── SECTION 2: LIVE MAP ───────────────────────── */
  const MapSection = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
      <h2 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3">
        2. {T("Live Area Map", "நேரடி பகுதி வரைபடம்")}
      </h2>
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-hide">
        {MAP_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setMapFilter(f.key)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              mapFilter === f.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ height: "240px" }}>
        <InteractiveHomeMap items={mapItems} />
        <div className="absolute bottom-2 right-2 z-20">
          <Link
            to="/explore"
            className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            {T("View Full Map", "முழு வரைபடம்")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  /* ── SECTION 3: WHAT CHANGED TODAY ────────────── */
  const WhatChangedSection = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
          3. {T("What Changed Today", "இன்று என்ன மாறியது")}
        </h2>
        <Link to={`/area/${slug}`} className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
          {T("View all updates →", "அனைத்து புதுப்பிப்புகள் →")}
        </Link>
      </div>
      {civicLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
      ) : todayPosts.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">{T("No updates today yet.", "இன்று புதுப்பிப்புகள் இல்லை.")}</p>
      ) : (
        <div>
          {todayPosts.map((p) => <TimelineItem key={p.id} post={p} T={T} />)}
          <Link to="/explore" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 mt-2 font-medium">
            📋 {T("See all timeline updates →", "அனைத்து காலவரிசை புதுப்பிப்புகள் →")}
          </Link>
        </div>
      )}
    </div>
  );

  /* ── SECTION 4: ACTIVE CIVIC RECEIPTS ──────────── */
  const ReceiptsSection = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
          4. {T("Active Civic Receipts", "செயலில் உள்ள குடிமை ரசீதுகள்")}
        </h2>
        <Link to="/explore" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
          {T("View all receipts →", "அனைத்து ரசீதுகள் →")}
        </Link>
      </div>
      {civicLoading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
      ) : activeReceipts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">{T("No active issues right now. Great!", "இப்போது செயலில் உள்ள சிக்கல்கள் இல்லை. நல்லது!")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeReceipts.map((p) => <ReceiptCard key={p.id} post={p} T={T} />)}
        </div>
      )}
    </div>
  );

  /* ── SECTION 5: MORE IN THIS AREA ──────────────── */
  const MORE_TABS = [
    { key: "wins",   label: T("Community Wins", "சமூக வெற்றிகள்") },
    { key: "score",  label: T("Area Score", "பகுதி மதிப்பெண்") },
    { key: "emergency", label: T("Emergencies", "அவசர நிலைகள்") },
  ];

  const MoreSection = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
      <h2 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3">
        5. {T("More in this Area", "இந்த பகுதியில் மேலும்")}
      </h2>
      {/* Sub-tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {MORE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMoreTab(t.key)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              moreTab === t.key
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Community Wins */}
      {moreTab === "wins" && (
        <div className="space-y-2.5">
          {communityWins.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{T("No wins recorded yet. Be the first!", "இன்னும் வெற்றிகள் இல்லை. முதல்வராக இருங்கள்!")}</p>
          ) : (
            communityWins.map((p) => (
              <div key={p.id} className="flex items-start gap-2.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl p-3">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white line-clamp-2">
                    {p.title || p.description?.slice(0, 60) || T("Issue resolved", "சிக்கல் தீர்க்கப்பட்டது")}
                  </p>
                  {p.verification_count > 0 && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {T(`Verified by ${p.verification_count} citizens`, `${p.verification_count} குடிமக்களால் சரிபார்க்கப்பட்டது`)}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">{timeAgo(p.created_date)}</p>
                </div>
              </div>
            ))
          )}
          <Link to="/explore" className="text-xs text-blue-600 hover:underline font-medium">
            {T("View all community wins →", "அனைத்து சமூக வெற்றிகள் →")}
          </Link>
        </div>
      )}

      {/* Area Score */}
      {moreTab === "score" && (
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          <AreaScoreGauge score={Math.round(areaScore)} T={T} />
          <div className="flex-1 space-y-2 w-full">
            {[
              { label: T("Transparency", "வெளிப்படைத்தன்மை"), val: Math.min(99, Math.round(areaScore * 1.1)) },
              { label: T("Participation", "பங்கேற்பு"), val: Math.min(99, Math.round(areaScore * 0.95)) },
              { label: T("Resolution Rate", "தீர்வு விகிதம்"), val: Math.min(99, Math.round(areaScore)) },
              { label: T("Safety", "பாதுகாப்பு"), val: Math.min(99, Math.round(areaScore * 1.05)) },
              { label: T("Cleanliness", "சுகாதாரம்"), val: Math.min(99, Math.round(areaScore * 0.9)) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-28 flex-shrink-0">{item.label}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.val}%` }} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergencies */}
      {moreTab === "emergency" && (
        <div className="space-y-2.5">
          {emergencies.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{T("No active emergencies. Stay safe!", "செயலில் உள்ள அவசர நிலைகள் இல்லை. பாதுகாப்பாக இருங்கள்!")}</p>
          ) : (
            emergencies.map((e) => (
              <div key={e.id} className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">
                    {e.title || e.description?.slice(0, 60) || T("Emergency request", "அவசர கோரிக்கை")}
                  </p>
                  <p className="text-[10px] text-slate-400">{timeAgo(e.created_date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  /* ── Bottom CTA ─────────────────────────────────── */
  const BottomCTA = (
    <div className="bg-blue-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 mb-6">
      <div className="flex-1">
        <p className="text-white font-bold text-sm sm:text-base">
          {T(`See a problem in ${areaName}?`, `${areaName}-ல் சிக்கல் கண்டீர்களா?`)}
        </p>
        <p className="text-blue-100 text-xs mt-1">
          {T("Report it. Verify it. Resolve it. Together we build a better Tamil Nadu.", "புகாரிடுங்கள். சரிபார்க்கவும். தீர்க்கவும். நாம் சேர்ந்து ஒரு சிறந்த தமிழ்நாட்டை கட்டமைக்கிறோம்.")}
        </p>
      </div>
      <Link
        to={`/create?area=${slug}&district=${area.district_slug || ""}`}
        className="flex-shrink-0 flex items-center gap-2 bg-white text-blue-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
      >
        {T("Create Civic Receipt in this area →", "குடிமை ரசீது உருவாக்கு →")}
      </Link>
    </div>
  );

  /* ══════════════════════════════════════════════════
     RENDER — Desktop: 2 col | Mobile: single col
  ══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

        {/* Desktop 2-column / Mobile single column */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── LEFT COLUMN (desktop) / full on mobile ── */}
          <div className="flex-1 min-w-0">
            {/* Header always visible */}
            {HeaderBlock}

            {/* On mobile: all 5 sections stacked */}
            {/* On desktop: sections 1+2+5+CTA in left col, 3+4 in right col */}
            <div className="lg:hidden">
              {PulseSection}
              {MapSection}
              {WhatChangedSection}
              {ReceiptsSection}
              {MoreSection}
              {BottomCTA}
            </div>

            {/* Desktop left column: Pulse + Map + More + CTA */}
            <div className="hidden lg:block">
              {PulseSection}
              {MapSection}
              {MoreSection}
              {BottomCTA}
            </div>
          </div>

          {/* ── RIGHT COLUMN (desktop only) ── */}
          <div className="hidden lg:block w-[380px] xl:w-[420px] flex-shrink-0">
            {WhatChangedSection}
            {ReceiptsSection}

            {/* Quick links card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                {T("Quick Links", "விரைவு இணைப்புகள்")}
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Building2, label: T("Government Offices", "அரசு அலுவலகங்கள்"), to: "/offices" },
                  { icon: PhoneCall, label: T("Emergency Numbers", "அவசர எண்கள்"), to: "/awareness/emergency" },
                  { icon: Trophy,    label: T("Leaderboard", "முன்னணியாளர்கள்"), to: "/leaderboard" },
                  { icon: Star,      label: T("Popular Areas", "பிரபலமான பகுதிகள்"), to: "/areas" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.to} to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}