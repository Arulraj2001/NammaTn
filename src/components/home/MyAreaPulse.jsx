import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bell, AlertTriangle, ShieldAlert, CheckCircle,
  MapPin, Pencil, ArrowRight, Loader2
} from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { useLanguage } from "@/context/LanguageContext";

/* ── helpers ─────────────────────────────────────────── */
const TODAY_START = new Date();
TODAY_START.setHours(0, 0, 0, 0);

/* Fetch posts filtered by area_slug in the last 30 days */
async function fetchAreaPosts(areaSlug) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let q = supabase
    .from("post")
    .select("id, civic_receipt_status, category_slug, post_type, created_date, status")
    .gte("created_date", since)
    .order("created_date", { ascending: false })
    .limit(500);

  if (areaSlug) {
    q = q.eq("area_slug", areaSlug);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

/* Fetch emergency posts for area */
async function fetchAreaEmergencies(areaSlug) {
  let q = supabase
    .from("emergency_post")
    .select("id, status, created_date")
    .eq("status", "active")
    .limit(100);
  if (areaSlug) q = q.eq("area_slug", areaSlug);
  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

/* Fetch scam alerts for area */
async function fetchAreaScams(areaSlug) {
  let q = supabase
    .from("scam_alert")
    .select("id, status, created_date")
    .in("status", ["active", "verified"])
    .limit(100);
  if (areaSlug) q = q.eq("area_slug", areaSlug);
  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

/* ── persisted area preference ─────────────────────── */
function getSavedArea() {
  try {
    const raw = localStorage.getItem("ntn_selected_area");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveArea(area) {
  try {
    localStorage.setItem("ntn_selected_area", JSON.stringify(area));
  } catch {}
}

/* ── pulse stat card ────────────────────────────────── */
function PulseCard({ count, icon, label, sub, color, bg, border, to, loading }) {
  const Icon = icon;
  return (
    <Link to={to} className="flex-1 min-w-0">
      <div className={`flex flex-col items-center justify-center text-center px-2 py-2 rounded-2xl border ${bg} ${border} hover:shadow-md hover:border-blue-400/40 dark:hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 h-full`}>
        {loading ? (
          <Loader2 className="w-4 h-4 text-slate-300 animate-spin mb-1" />
        ) : (
          <span className={`text-xl font-extrabold ${color} leading-none mb-0.5`}>
            {count}
          </span>
        )}
        <div className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center my-1`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
        <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-snug">{label}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{sub}</p>
      </div>
    </Link>
  );
}

/* ── Area Picker Modal (lightweight) ─────────────────── */
function AreaPickerModal({ areas, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const filtered = areas.filter((a) => {
    const q = search.toLowerCase();
    return !q || (a.name_en || "").toLowerCase().includes(q) || (a.name_ta || "").includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {T("Choose Your Area", "உங்கள் பகுதியை தேர்வு செய்யுங்கள்")}
          </h3>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg">
            ✕
          </button>
        </div>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={T("Search area…", "பகுதி தேடுங்கள்…")}
          className="w-full mb-3 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="overflow-y-auto space-y-1 flex-1">
          {filtered.slice(0, 30).map((area) => (
            <button
              key={area.id}
              onClick={() => { saveArea(area); onSelect(area); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left transition-colors group"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {area.name_en}
                </p>
                {area.district_name_en && (
                  <p className="text-[11px] text-slate-400">{area.district_name_en}</p>
                )}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">
              {T("No areas found", "பகுதிகள் கிடைக்கவில்லை")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function MyAreaPulse({ allAreas = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const [selectedArea, setSelectedArea] = useState(() => getSavedArea());
  const [showPicker, setShowPicker] = useState(false);

  /* Persist whenever changed */
  useEffect(() => {
    if (selectedArea) saveArea(selectedArea);
  }, [selectedArea]);

  const areaSlug = selectedArea?.slug || null;

  /* ── Live data queries ─────────────────────────── */
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["area-pulse-posts", areaSlug],
    queryFn: () => fetchAreaPosts(areaSlug),
    staleTime: 60_000,
  });

  const { data: emergencies = [], isLoading: emergLoading } = useQuery({
    queryKey: ["area-pulse-emergencies", areaSlug],
    queryFn: () => fetchAreaEmergencies(areaSlug),
    staleTime: 60_000,
  });

  const { data: scams = [], isLoading: scamsLoading } = useQuery({
    queryKey: ["area-pulse-scams", areaSlug],
    queryFn: () => fetchAreaScams(areaSlug),
    staleTime: 60_000,
  });

  const loading = postsLoading || emergLoading || scamsLoading;

  /* ── Compute pulse stats from real data ─────────── */
  const openIssues = posts.filter((p) =>
    ["reported", "open", "pending", "under_review", "in_progress"].includes(p.status)
  ).length;

  const alerts = posts.filter((p) => {
    const cat = (p.category_slug || "").toLowerCase();
    return (
      cat.includes("water") ||
      cat.includes("power") ||
      cat.includes("electricity") ||
      cat.includes("road") ||
      p.post_type === "situation"
    );
  }).length;

  const emergency = emergencies.length;

  const scamWarnings = scams.length;

  const resolvedToday = posts.filter((p) => {
    const isResolved = ["resolved", "citizen_verified_fixed", "closed"].includes(p.status);
    const isToday = p.created_date && new Date(p.created_date) >= TODAY_START;
    return isResolved && isToday;
  }).length;

  /* ── Stat card definitions ─────────────────────── */
  const STATS = [
    {
      count: openIssues,
      icon: Bell,
      label: T("Open Issues", "திறந்த புகார்கள்"),
      sub: T("Needs attention", "கவனம் தேவை"),
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-100 dark:border-red-900/30",
      to: selectedArea ? `/area/${areaSlug}` : "/explore",
    },
    {
      count: alerts,
      icon: Bell,
      label: T("Alerts", "எச்சரிக்கைகள்"),
      sub: T("Stay informed", "தகவலுடன் இருங்கள்"),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-900/30",
      to: "/explore",
    },
    {
      count: emergency,
      icon: AlertTriangle,
      label: T("Emergency", "அவசர நிலை"),
      sub: T("Need help", "உதவி தேவை"),
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-100 dark:border-orange-900/30",
      to: "/help",
    },
    {
      count: scamWarnings,
      icon: ShieldAlert,
      label: T("Scam Warning", "மோசடி எச்சரிக்கை"),
      sub: T("Be careful", "எச்சரிக்கையாக இருங்கள்"),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-100 dark:border-purple-900/30",
      to: "/scams",
    },
    {
      count: resolvedToday,
      icon: CheckCircle,
      label: T("Resolved Today", "இன்று தீர்க்கப்பட்டது"),
      sub: T("Thanks to citizens", "குடிமக்களுக்கு நன்றி"),
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-100 dark:border-green-900/30",
      to: selectedArea ? `/area/${areaSlug}` : "/explore",
    },
  ];

  const areaLabel = selectedArea
    ? `${selectedArea.name_en}${selectedArea.district_name_en ? `, ${selectedArea.district_name_en}` : ""}`
    : T("All of Tamil Nadu", "தமிழ்நாடு முழுவதும்");

  return (
    <>
      {/* ── Area Picker Modal ── */}
      {showPicker && (
        <AreaPickerModal
          areas={allAreas}
          onSelect={setSelectedArea}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* ── My Area Pulse Section ── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {T("My Area Pulse", "என் பகுதி துடிப்பு")}
              </h2>

              {/* Area badge + change */}
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-xs">{areaLabel}</span>
                <Pencil className="w-3 h-3 flex-shrink-0 opacity-60" />
                <span className="text-blue-500 font-semibold">{T("Change", "மாற்று")}</span>
              </button>

              {/* Live dot */}
              {!loading && (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  {T("Live", "நேரடி")}
                </span>
              )}
            </div>

            {/* View My Area → */}
            <Link
              to={selectedArea ? `/area/${areaSlug}` : "/areas"}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {T("View My Area", "என் பகுதி பார்")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5 stat cards */}
          <div className="grid grid-cols-5 gap-2 max-w-4xl mx-auto">
            {STATS.map((stat, i) => (
              <PulseCard key={i} {...stat} loading={loading} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
