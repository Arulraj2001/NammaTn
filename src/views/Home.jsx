'use client';

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  MapPin, AlertCircle, Shield, Zap, Briefcase, Home as HomeIcon,
  CheckCircle, Navigation, Search, RefreshCw, ArrowRight, Users,
  ShieldAlert, Wifi, Flame, ChevronRight, Plus, Building2,
  MessageSquare, ThumbsUp, Clock, ChevronDown, Star, Activity
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getActiveCivicPosts } from "@/services/posts";
import { getActiveSituations } from "@/services/situations";
import { getActiveListings } from "@/services/stayListings";
import { getActiveScams } from "@/services/scamAlerts";
import { getActiveEmergencies } from "@/services/emergencyPosts";
import { getAreas } from "@/services/areas";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import MyAreaPulse from "@/components/home/MyAreaPulse";

// Dynamically import map – avoids SSR issues
const InteractiveHomeMap = dynamic(
  () => import("@/components/home/InteractiveHomeMap"),
  {
    ssr: false,
    fallback: (
      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400 text-sm">
        Loading Map…
      </div>
    )
  }
);

/* ─── helpers ─────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const STATUS_LABELS = {
  reported: { label: "Open", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  under_review: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  citizen_verified_fixed: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};
function getStatusBadge(status) {
  return STATUS_LABELS[status] || { label: "Open", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" };
}

/* ─── area image mapping ──────────────────────────────────── */
const AREA_IMAGES = {
  velachery: "https://upload.wikimedia.org/wikipedia/commons/7/7f/India_-_Chennai_-_Velachery_-_Tansi_Nagar_from_the_MRTS_%282229573067%29.jpg",
  "anna-nagar": "https://upload.wikimedia.org/wikipedia/commons/1/18/Annanagar_Tower.jpg",
  adyar: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Guindy_Railway_Bridge_Adyar_River_Chennai_Jul18_DSC05379.jpg",
  tambaram: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tambaram_Chennai_Railway_station_board.jpeg",
  omr: "https://upload.wikimedia.org/wikipedia/commons/e/e6/OMR_Express_way.jpg",
  "rs-puram": "https://upload.wikimedia.org/wikipedia/commons/6/67/MC_%40RS_PURAM_COIMBATORE.JPG",
  "t-nagar": "https://upload.wikimedia.org/wikipedia/commons/0/0f/T_Nagar_Chennai.jpg",
  "kk-nagar": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Sivan-Park-KK-Nagar-Chennai-Beginning.JPG",
  perambur: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Perambur_railway_station.jpg",
  porur: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Porur_Lake_Chennai.jpg",
  srirangam: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Srirangam_Temple_Gopuram_View.jpg",
  "saibaba-colony": "https://upload.wikimedia.org/wikipedia/commons/4/44/Anamalais_Toyota%2C_coimbatore.jpg",
  singanallur: "https://upload.wikimedia.org/wikipedia/commons/8/86/Singanallur_Lake_JEG_JEG6969.jpg",
  "thillai-nagar": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Uccipillaiyar-Temple-Rockfort-Trichy-TanilNadu-India.jpg",
  "kk-nagar-madurai": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Madurai_Meenakshi_Temple_Gopuram.jpg",
  "anna-nagar-madurai": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Madurai_Meenakshi_Temple_Gopuram.jpg"
};
const getAreaImage = (slug) => AREA_IMAGES[slug] || "https://upload.wikimedia.org/wikipedia/commons/1/10/Anna_Nagar_Tower_Chennai.jpg";

/* ─── static data ─────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { path: "/create",   icon: <Plus className="w-5 h-5" />,       bg: "bg-blue-100 dark:bg-blue-900/30",   iconColor: "text-blue-600 dark:text-blue-400",   en: "Report Issue",    ta: "சிக்கல் புகார்",     sub_en: "Log a civic problem",      sub_ta: "குடிமை சிக்கல் பதிவு" },
  { path: "/help",     icon: <Zap className="w-5 h-5" />,         bg: "bg-red-100 dark:bg-red-900/30",     iconColor: "text-red-600 dark:text-red-400",     en: "Emergency",       ta: "அவசரகாலம்",           sub_en: "Request urgent help",      sub_ta: "அவசர உதவி கேளுங்கள்" },
  { path: "/stay",     icon: <HomeIcon className="w-5 h-5" />,    bg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", en: "Find Stay",    ta: "தங்குமிடம் தேடு",   sub_en: "Rooms & PG nearby",        sub_ta: "அருகில் PG & அறைகள்" },
  { path: "/jobs",     icon: <Briefcase className="w-5 h-5" />,   bg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400", en: "Jobs",            ta: "வேலை",                sub_en: "Local job updates",        sub_ta: "உள்ளூர் வேலை வாய்ப்பு" },
  { path: "/scams",    icon: <ShieldAlert className="w-5 h-5" />, bg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400", en: "Scam Alert",  ta: "மோசடி எச்சரிக்கை",  sub_en: "Report a scam",            sub_ta: "மோசடி புகாரிடு" },
  { path: "/offices",  icon: <Building2 className="w-5 h-5" />,   bg: "bg-blue-100 dark:bg-blue-900/30",   iconColor: "text-blue-600 dark:text-blue-400",   en: "Office Ratings",  ta: "அலுவலக மதிப்பீடு",  sub_en: "Govt office reviews",      sub_ta: "அரசு அலுவலக மதிப்பு" },
];

const TOP_CATEGORIES = [
  { slug: "power-cut",    icon: "⚡", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800", iconBg: "bg-yellow-100 dark:bg-yellow-900/40", en: "Power Cuts",           ta: "மின் வெட்டு",       desc_en: "View outages near you",    desc_ta: "அருகில் மின் வெட்டு" },
  { slug: "water-supply", icon: "💧", bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800",    iconBg: "bg-blue-100 dark:bg-blue-900/40",    en: "Water Issues",         ta: "நீர் சிக்கல்",      desc_en: "Track disruptions",        desc_ta: "தடங்கல்கள் கண்காணி" },
  { slug: "road-issues",  icon: "🚧", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", iconBg: "bg-orange-100 dark:bg-orange-900/40", en: "Road Problems",       ta: "சாலை சிக்கல்",     desc_en: "Report & verify",          desc_ta: "புகார் & சரிபார்" },
  { slug: "scam-alert",   icon: "⚠️", bg: "bg-red-50 dark:bg-red-900/20",     border: "border-red-200 dark:border-red-800",     iconBg: "bg-red-100 dark:bg-red-900/40",     en: "Scam Alerts",          ta: "மோசடி எச்சரிக்கை", desc_en: "Stay protected",           desc_ta: "பாதுகாப்பாக இருங்கள்" },
  { slug: "offices",      icon: "🏛️", bg: "bg-teal-50 dark:bg-teal-900/20",   border: "border-teal-200 dark:border-teal-800",   iconBg: "bg-teal-100 dark:bg-teal-900/40",   en: "Government Services",  ta: "அரசு சேவைகள்",     desc_en: "Office info & more",       desc_ta: "அலுவலக தகவல்" },
  { slug: "stay",         icon: "🏠", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800", iconBg: "bg-purple-100 dark:bg-purple-900/40", en: "Stays & Rooms",       ta: "தங்குமிடம்",       desc_en: "Find verified stays",      desc_ta: "சரிபார்க்கப்பட்ட அறை" },
  { slug: "jobs",         icon: "💼", bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800",  iconBg: "bg-green-100 dark:bg-green-900/40",  en: "Local Jobs",           ta: "உள்ளூர் வேலை",     desc_en: "Community jobs",           desc_ta: "சமூக வேலைகள்" },
  { slug: "others",       icon: "···", bg: "bg-slate-50 dark:bg-slate-800",   border: "border-slate-200 dark:border-slate-700", iconBg: "bg-slate-200 dark:bg-slate-700",     en: "More",                 ta: "மேலும்",            desc_en: "All categories",           desc_ta: "அனைத்து வகைகள்" },
];

const GOVT_OFFICES = [
  { path: "/offices", icon: "⚡", label_en: "EB Office",      label_ta: "மின் அலுவலகம்",   sub_en: "Check status",         sub_ta: "நிலை சரிபார்" },
  { path: "/offices", icon: "🚗", label_en: "RTO",            label_ta: "RTO",               sub_en: "Info & reviews",       sub_ta: "தகவல் & மதிப்பு" },
  { path: "/offices", icon: "🏛️", label_en: "Taluk Office",  label_ta: "வட்டாட்சி",         sub_en: "Location & info",      sub_ta: "இடம் & தகவல்" },
  { path: "/offices", icon: "📋", label_en: "Passport Office",label_ta: "பாஸ்போர்ட் அலுவலகம்", sub_en: "Info & reviews",    sub_ta: "தகவல் & மதிப்பு" },
  { path: "/offices", icon: "···", label_en: "More Offices",  label_ta: "மேலும் அலுவலகங்கள்", sub_en: "All departments",   sub_ta: "அனைத்து துறைகள்" },
];

/* ─────────────────────────────────────────────────────────── */
export default function Home() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const getCategoryPath = (slug) => {
    switch (slug) {
      case "power-cut":
        return "/category/electricity";
      case "water-supply":
        return "/category/water-sanitation";
      case "road-issues":
        return "/category/road-infrastructure";
      case "scam-alert":
        return "/scams";
      case "offices":
        return "/offices";
      case "stay":
        return "/stay";
      case "jobs":
        return "/jobs";
      case "others":
        return "/explore";
      default:
        return `/category/${slug}`;
    }
  };

  usePageMeta({
    title: "NammaTN – Know what's happening in your area right now",
    description: "Report civic issues, see live alerts, find stays & jobs in Tamil Nadu. All in one place, verified by citizens.",
  });

  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  /* ── data queries ─────────────────── */
  const { data: civicPosts = [], isLoading: civicLoading } = useQuery({
    queryKey: ["home-civic-posts"],
    queryFn: () => getActiveCivicPosts(20),
    staleTime: 60_000,
  });
  const { data: situations = [] } = useQuery({
    queryKey: ["home-situations"],
    queryFn: () => getActiveSituations(20),
    staleTime: 60_000,
  });
  const { data: stays = [] } = useQuery({
    queryKey: ["home-stays"],
    queryFn: () => getActiveListings(20),
    staleTime: 60_000,
  });
  const { data: scams = [] } = useQuery({
    queryKey: ["home-scams"],
    queryFn: () => getActiveScams(20),
    staleTime: 60_000,
  });
  const { data: emergencies = [] } = useQuery({
    queryKey: ["home-emergencies"],
    queryFn: () => getActiveEmergencies(10),
    staleTime: 60_000,
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["home-areas"],
    queryFn: () => getAreas(10),
    staleTime: 300_000,
  });

  /* ── geolocation ──────────────────── */
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  /* ── filter expired situations ───── */
  const filterExpiredSituations = (items) => {
    const NOW = Date.now();
    return items.filter(s => {
      if (!s.created_date) return true;
      const elapsed = NOW - new Date(s.created_date).getTime();
      const TTL = { traffic: 3 * 3600_000, eb_shutdown: 12 * 3600_000, water_shortage: 24 * 3600_000, flooding: 48 * 3600_000 };
      return elapsed <= (TTL[s.situation_type] || 24 * 3600_000);
    });
  };

  /* ── map items ────────────────────── */
  const allMapItems = useMemo(() => [
    ...civicPosts.map(p => ({ ...p, post_type: "civic" })),
    ...filterExpiredSituations(situations).map(s => ({ ...s, post_type: "situation" })),
    ...stays.map(st => ({ ...st, post_type: "stay" })),
    ...scams.map(sc => ({ ...sc, post_type: "scam" })),
  ], [civicPosts, situations, stays, scams]);

  /* ── derived stats (filtered by 15km radius when user location is available) ── */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const getNearbyItems = (items) => {
    if (!userLocation) return items;
    return items.filter(item => {
      if (!item.latitude || !item.longitude) return false;
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(item.latitude),
        parseFloat(item.longitude)
      );
      return dist <= 15; // 15 km radius
    });
  };

  const nearbySituations = getNearbyItems(situations);
  const nearbyScams = getNearbyItems(scams);
  const nearbyCivicPosts = getNearbyItems(civicPosts);
  const nearbyEmergencies = getNearbyItems(emergencies);

  const powerIssues   = nearbySituations.filter(s => s.situation_type === "eb_shutdown").length;
  const waterAlerts   = nearbySituations.filter(s => s.situation_type === "water_shortage").length;
  const scamWarnings  = nearbyScams.length;
  const roadProblems  = nearbyCivicPosts.filter(p => p.category_slug?.includes("road")).length;
  const emergCount    = nearbyEmergencies.length;
  const activeCount   = getNearbyItems(allMapItems).length;

  const NEAR_YOU_STATS = [
    { path: "/category/electricity",       icon: "⚡", color: "text-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700", count: powerIssues, label_en: "Power Issues",       label_ta: "மின் சிக்கல்கள்",    sub_en: "areas affected",      sub_ta: "பகுதிகள் பாதிக்கப்பட்டன" },
    { path: "/category/water-sanitation",  icon: "💧", color: "text-blue-500",   bgColor: "bg-blue-50 dark:bg-blue-900/20",     border: "border-blue-200 dark:border-blue-700",   count: waterAlerts,  label_en: "Water Alert",        label_ta: "நீர் எச்சரிக்கை",   sub_en: "area affected",       sub_ta: "பகுதி பாதிக்கப்பட்டது" },
    { path: "/scams",                      icon: "⚠️", color: "text-red-500",   bgColor: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-700",     count: scamWarnings, label_en: "Scam Warnings",      label_ta: "மோசடி எச்சரிக்கை", sub_en: "new reports",         sub_ta: "புதிய புகார்கள்" },
    { path: "/category/road-infrastructure",icon: "🚧", color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-700",count: roadProblems, label_en: "Road Problems",      label_ta: "சாலை சிக்கல்கள்",   sub_en: "areas affected",      sub_ta: "பகுதிகள் பாதிக்கப்பட்டன" },
    { path: "/help",                       icon: "🚨", color: "text-rose-500",   bgColor: "bg-rose-50 dark:bg-rose-900/20",     border: "border-rose-200 dark:border-rose-700",   count: emergCount,   label_en: "Emergency Request",  label_ta: "அவசர கோரிக்கை",    sub_en: "needs help",          sub_ta: "உதவி தேவை" },
  ];

  /* ── top areas (by post_count desc) ─ */
  const topAreas = useMemo(() => {
    return [...areas]
      .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
      .slice(0, 5);
  }, [areas]);

  /* ── recent receipts ─────────────── */
  const recentReceipts = civicPosts.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ════════════════════════════════════════════════════
          HERO — split: left copy | right map
      ════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

            {/* LEFT COPY */}
            <div className="w-full lg:w-[44%] flex-shrink-0">
              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                {T("Know what's happening in ", "என்ன நடக்கிறது என்று தெரிந்து கொள்ளுங்கள் ")}
                <span className="text-blue-600">{T("your area", "உங்கள் பகுதியில்")}</span>
                {T(" right now.", " இப்போதே.")}
              </h1>

              {/* Category pills row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
                {[
                  { icon: "⚡", en: "Power cuts.",       ta: "மின் வெட்டு." },
                  { icon: "💧", en: "Water issues.",     ta: "நீர் சிக்கல்." },
                  { icon: "🚧", en: "Road problems.",    ta: "சாலை சிக்கல்." },
                  { icon: "⚠️", en: "Scam alerts.",     ta: "மோசடி எச்சரிக்கை." },
                  { icon: "👥", en: "Community updates.", ta: "சமூக செய்திகள்." },
                ].map((pill, i) => (
                  <span key={i} className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span>{pill.icon}</span>{T(pill.en, pill.ta)}
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {T("All in one place. Verified by citizens.", "ஒரே இடத்தில். குடிமக்களால் சரிபார்க்கப்பட்டது.")}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-70"
                >
                  {locating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  {T("Use My Location", "என் இடத்தை பயன்படுத்து")}
                </button>
                <Link to="/search">
                  <button className="flex items-center gap-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                    <Search className="w-4 h-4" />
                    {T("Search Area", "பகுதி தேடு")}
                  </button>
                </Link>
              </div>

              {/* Location + active count */}
              <div className="flex items-center gap-3 flex-wrap">
                <button className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {userLocation
                    ? `${userLocation.latitude.toFixed(2)}°N ${userLocation.longitude.toFixed(2)}°E`
                    : T("Tamil Nadu, India", "தமிழ்நாடு, இந்தியா")
                  }
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {activeCount > 0 && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    {activeCount} {T("active updates nearby", "அருகில் செயலில் உள்ள தகவல்கள்")}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT MAP */}
            <div className="w-full lg:flex-1">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800" style={{ height: "340px" }}>
                <InteractiveHomeMap items={allMapItems} userLocation={userLocation} />
                {/* View full map link */}
                <div className="absolute bottom-3 right-3 z-20">
                  <Link to="/explore"
                    className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all">
                    {T("View full map", "முழு வரைபடம்")} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          MY AREA PULSE — real-time stats for selected area
      ════════════════════════════════════════════════════ */}
      <MyAreaPulse allAreas={areas} />

      {/* ════════════════════════════════════════════════════
          QUICK ACTIONS
      ════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
            {T("Quick Actions", "விரைவு செயல்கள்")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.path + action.en} to={action.path}>
                <div className="group flex flex-col items-center text-center p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                  <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.iconColor} flex items-center justify-center mb-2.5`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-0.5">
                    {T(action.en, action.ta)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {T(action.sub_en, action.sub_ta)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHAT'S HAPPENING NEAR YOU
      ════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {T("What's happening near you?", "உங்கள் அருகில் என்ன நடக்கிறது?")}
            </h2>
            <Link to="/explore" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {T("View all", "அனைத்தும்")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {NEAR_YOU_STATS.map((stat, i) => (
              <Link key={i} to={stat.path}>
                <div className={`${stat.bgColor} ${stat.border} border rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}>
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-xl leading-none">{stat.icon}</span>
                    <span className={`text-2xl font-extrabold ${stat.color} leading-none`}>{stat.count}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-0.5">
                    {T(stat.label_en, stat.label_ta)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {stat.count} {T(stat.sub_en, stat.sub_ta)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TOP CATEGORIES
      ════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {T("Top Categories", "முக்கிய வகைகள்")}
            </h2>
            <Link to="/explore" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {T("View all categories", "அனைத்து வகைகள்")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {TOP_CATEGORIES.map((cat) => (
              <Link key={cat.slug} to={getCategoryPath(cat.slug)}>
                <div className={`${cat.bg} ${cat.border} border rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group h-full`}>
                  <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center mx-auto mb-2 text-lg`}>
                    {cat.icon}
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-0.5">
                    {T(cat.en, cat.ta)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {T(cat.desc_en, cat.desc_ta)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          RECENT CIVIC RECEIPTS
      ════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {T("Recent Civic Receipts", "அண்மை குடிமை ரசீதுகள்")}
            </h2>
            <Link to="/explore" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              {T("View all", "அனைத்தும்")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {civicLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 animate-pulse h-40" />
              ))}
            </div>
          ) : recentReceipts.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">
                {T("No civic receipts yet.", "இன்னும் குடிமை ரசீதுகள் இல்லை.")}
              </p>
              <Link to="/create">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors">
                  {T("Log First Issue", "முதல் சிக்கல் பதிவிடு")}
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentReceipts.map((post) => {
                const badge = getStatusBadge(post.civic_status);
                return (
                  <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-all flex flex-col">
                    {/* Receipt ID + Status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {post.civic_receipt_id || post.id?.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1.5 line-clamp-2 flex-1">
                      {lang === "ta" ? post.title_ta || post.title_en : post.title_en}
                    </h3>
                    {/* Location + time */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{post.area_name || post.district_name || "Tamil Nadu"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {timeAgo(post.created_date)}
                    </div>
                    {/* Footer: comments, likes, link */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MessageSquare className="w-3 h-3" />{post.comment_count || 0}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <ThumbsUp className="w-3 h-3" />{post.upvotes || 0}
                      </span>
                      <Link to={`/post/${post.id}`} className="ml-auto text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline whitespace-nowrap">
                        {T("Open Receipt", "ரசீது பார்")} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          POPULAR AREAS + GOVERNMENT SERVICES (2-col)
      ════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT: Popular Areas */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {T("Popular Areas", "பிரபலமான பகுதிகள்")}
                </h2>
                <Link to="/areas" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  {T("View all areas", "அனைத்து பகுதிகள்")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {(topAreas.length > 0 ? topAreas : [
                  { id: "1", name_en: "Velachery", name_ta: "வேளச்சேரி", post_count: 156, slug: "velachery" },
                  { id: "2", name_en: "Anna Nagar", name_ta: "அண்ணா நகர்", post_count: 142, slug: "anna-nagar" },
                  { id: "3", name_en: "Adyar", name_ta: "அடையாறு", post_count: 128, slug: "adyar" },
                  { id: "4", name_en: "Tambaram", name_ta: "தாம்பரம்", post_count: 114, slug: "tambaram" },
                  { id: "5", name_en: "OMR", name_ta: "OMR", post_count: 98, slug: "omr" },
                ]).map((area) => (
                  <Link key={area.id || area.slug} to={`/area/${area.slug}`} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                    {/* Circle avatar with image or fallback */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md group-hover:scale-105 transition-transform overflow-hidden border-2 border-white dark:border-slate-700 relative">
                      <span className="uppercase">
                        {(lang === "ta" ? area.name_ta || area.name_en : area.name_en)?.slice(0, 3)}
                      </span>
                      <img
                        src={getAreaImage(area.slug)}
                        alt={area.name_en}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => e.target.remove()}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {lang === "ta" ? area.name_ta || area.name_en : area.name_en}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {area.post_count || 0} {T("updates", "தகவல்கள்")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT: Government Services */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {T("Government Services", "அரசு சேவைகள்")}
                </h2>
                <Link to="/offices" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  {T("View all", "அனைத்தும்")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {GOVT_OFFICES.map((office, i) => (
                  <Link key={i} to={office.path}>
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-xl mb-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        {office.icon}
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-0.5">
                        {T(office.label_en, office.label_ta)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {T(office.sub_en, office.sub_ta)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            {/* Left */}
            <div className="flex items-center gap-4">
              {/* Icon cluster */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight mb-1">
                  {T("Together, we can build a better Tamil Nadu", "சேர்ந்து, சிறந்த தமிழ்நாட்டை கட்டலாம்")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {T("Report. Verify. Resolve. That's the NammaTN way.", "புகாரிடு. சரிபார். தீர். அதுவே NammaTN வழி.")}
                </p>
              </div>
            </div>
            {/* Right CTA */}
            <Link to="/create" className="flex-shrink-0">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md whitespace-nowrap">
                {T("Log an Issue Now", "இப்போதே சிக்கல் பதிவிடு")} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}