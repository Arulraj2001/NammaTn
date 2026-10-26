"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { MapPin, Search, RefreshCw, ArrowRight, ChevronDown, X, Zap, FileCheck2, ShieldCheck, Building2, Radio } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getActivePosts } from "@/services/posts";
import { findNearestDistrict } from "@/lib/geoDistrict";
import { DISTRICTS, DISTRICT_COORDS } from "@/lib/districts";

const InteractiveHomeMap = dynamic(
  () => import("@/components/home/InteractiveHomeMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-400 text-xs">
        Connecting to Tamil Nadu civic feeds…
      </div>
    )
  }
);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function HomeHero({ userLocation, setUserLocation }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [locating, setLocating] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mapCategory, setMapCategory] = useState("all");

  const matchedDistricts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return DISTRICTS.filter(
      (d) =>
        d.name_en.toLowerCase().includes(q) ||
        (d.name_ta && d.name_ta.includes(q)) ||
        d.slug.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setShouldLoadMap(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Fetch active posts across all districts to populate statewide map activity
  const { data: rawPosts = [] } = useQuery({
    queryKey: ["home-all-active-posts"],
    queryFn: () => getActivePosts(100),
    staleTime: 300_000,
  });

  const allMapItems = useMemo(() => [
    ...rawPosts.map(p => ({ ...p, post_type: p.post_type || "civic" })),
  ], [rawPosts]);

  // Dynamic category filtering for map markers
  const filteredMapItems = useMemo(() => {
    if (mapCategory === "all") return allMapItems;
    if (mapCategory === "power") {
      return allMapItems.filter(p => p.category_slug === "electricity" || p.category_slug === "power-cut" || p.title_en?.toLowerCase().includes("power") || p.title_ta?.includes("மின்தடை"));
    }
    if (mapCategory === "rain") {
      return allMapItems.filter(p => p.category_slug === "weather" || p.category_slug === "rain" || p.title_en?.toLowerCase().includes("rain") || p.title_en?.toLowerCase().includes("holiday") || p.title_ta?.includes("மழை"));
    }
    if (mapCategory === "civic") {
      return allMapItems.filter(p => p.post_type === "complaint" || p.civic_receipt_id || p.category_slug === "road-infrastructure" || p.category_slug === "water-sanitation");
    }
    return allMapItems;
  }, [allMapItems, mapCategory]);

  const powerCount = useMemo(() => allMapItems.filter(p => p.category_slug === "electricity" || p.category_slug === "power-cut" || p.title_en?.toLowerCase().includes("power") || p.title_ta?.includes("மின்தடை")).length, [allMapItems]);
  const rainCount = useMemo(() => allMapItems.filter(p => p.category_slug === "weather" || p.category_slug === "rain" || p.title_en?.toLowerCase().includes("rain") || p.title_en?.toLowerCase().includes("holiday") || p.title_ta?.includes("மழை")).length, [allMapItems]);
  const civicCount = useMemo(() => allMapItems.filter(p => p.post_type === "complaint" || p.civic_receipt_id || p.category_slug === "road-infrastructure" || p.category_slug === "water-sanitation").length, [allMapItems]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getNearbyItems = (items) => {
    if (!userLocation) return items;
    return items.filter(item => {
      let lat = parseFloat(item.latitude);
      let lng = parseFloat(item.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        if (item.district_slug && DISTRICT_COORDS[item.district_slug]) {
          [lat, lng] = DISTRICT_COORDS[item.district_slug];
        }
      }
      if (isNaN(lat) || isNaN(lng)) return false;
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        lat,
        lng
      );
      return dist <= 65;
    });
  };

  const activeCount = getNearbyItems(allMapItems).length;

  const detectedDistrict = useMemo(() => {
    if (!userLocation) return null;
    return findNearestDistrict(userLocation.latitude, userLocation.longitude);
  }, [userLocation]);

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)] flex flex-col justify-between bg-gradient-to-b from-civic-50/70 via-white to-white dark:from-[#071E3D] dark:via-[#071E3D] dark:to-[#0A2246] border-b-2 border-civic-200 dark:border-civic-900 pt-4 pb-2 sm:pt-6 sm:pb-3 lg:pt-5 lg:pb-3">
      {/* ── Background Texture: Atmospheric Glow Orbs & Civic Dot Matrix ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Soft Ambient Light Orb 1 - Top Left */}
        <div className="absolute -top-20 -left-20 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-civic-200/40 dark:bg-civic-800/20 rounded-full blur-3xl opacity-80" />
        {/* Soft Ambient Light Orb 2 - Right Behind Map */}
        <div className="absolute top-1/4 -right-16 w-80 sm:w-[520px] h-80 sm:h-[520px] bg-sky-200/35 dark:bg-sky-900/20 rounded-full blur-3xl opacity-75" />
        {/* Precision Civic Dot Matrix Grid with edge fading */}
        <div className="absolute inset-0 civic-dot-grid civic-dot-mask opacity-85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-center">

          {/* ── LEFT: CIVIC IDENTITY & INTERACTION ── */}
          <div className="w-full lg:w-[48%] flex-shrink-0 text-left">
            {/* Live Stats Bar (Trust Builder Above the Fold) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white/10 dark:text-slate-100 text-[11px] font-bold tracking-wide mb-2 shadow-sm border border-slate-700/50">
              <span className="flex items-center gap-1.5 text-red-400 uppercase tracking-widest font-black text-[10px]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {T("LIVE", "நேரலை")}
              </span>
              <span className="text-white/30">|</span>
              <span>650+ {T("Reports", "அறிக்கைகள்")}</span>
              <span className="text-white/30">|</span>
              <span>38 {T("Districts", "மாவட்டங்கள்")}</span>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="text-emerald-400 font-medium hidden sm:inline">{T("Updated 4m ago", "இப்போது புதுப்பிக்கப்பட்டது")}</span>
            </div>

            {/* Authoritative Headline - Smooth reading flow without badge interruption */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.35rem] font-black leading-[1.2] tracking-tight mb-2">
              {lang === "ta" ? (
                <>
                  <span className="text-civic-900 dark:text-white block">
                    உங்கள் பகுதியில் என்ன நடக்கிறது?
                  </span>
                  <span className="bg-gradient-to-r from-civic-600 via-sky-500 to-civic-400 bg-clip-text text-transparent font-black">
                    உண்மைச் சான்றுகளுடன் நிகழ்நேரத்தில்..
                  </span>
                </>
              ) : (
                <>
                  <span className="text-civic-900 dark:text-white block">
                    Know what&apos;s happening in your area —
                  </span>
                  <span className="bg-gradient-to-r from-civic-600 via-sky-500 to-civic-400 bg-clip-text text-transparent font-black">
                    verified, in real-time.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle Explaining Platform Scope */}
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-snug font-medium mb-3 max-w-xl">
              {T(
                "Document local civic issues with proof, track scheduled power cuts & collector holiday notices across all 38 districts of Tamil Nadu.",
                "அனைத்து 38 மாவட்டங்களுக்கான மின்தடை, பள்ளி விடுமுறை, மக்கள் குறைதீர்ப்பு சான்றுகள் & அரசு நலத்திட்டங்கள்."
              )}
            </p>

            {/* 4 Core Pillars Grid (Shows what entire website does) with Lucide Icons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                to="/power-cuts-today-tamil-nadu"
                className="group p-2 rounded-xl bg-white dark:bg-[#0D2B52] border border-civic-200 dark:border-civic-800 hover:border-amber-400 hover:shadow-xs transition-all flex items-center gap-2"
              >
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[11.5px] font-bold text-civic-900 dark:text-white group-hover:text-amber-600 truncate">
                      {T("Power & Rain Alerts", "மின்தடை & மழை எச்சரிக்கை")}
                    </p>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    {T("TANGEDCO 1912, Metrowater", "மின்வாரியம், குடிநீர், மழை")}
                  </p>
                </div>
              </Link>

              <Link
                to="/create"
                className="group p-2 rounded-xl bg-white dark:bg-[#0D2B52] border border-civic-200 dark:border-civic-800 hover:border-blue-400 hover:shadow-xs transition-all flex items-center gap-2"
              >
                <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-civic-900 dark:text-white group-hover:text-blue-600 truncate">
                    {T("Civic Proof Receipts", "குடிமக்கள் குறைதீர்ப்பு")}
                  </p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    {T("Report & track to fixed", "புகார் பதிவு & தீர்வு கண்காணிப்பு")}
                  </p>
                </div>
              </Link>

              <Link
                to="/schemes"
                className="group p-2 rounded-xl bg-white dark:bg-[#0D2B52] border border-civic-200 dark:border-civic-800 hover:border-emerald-400 hover:shadow-xs transition-all flex items-center gap-2"
              >
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-civic-900 dark:text-white group-hover:text-emerald-600 truncate">
                    {T("Schemes & Rights", "அரசு நலத்திட்டங்கள் & RTI")}
                  </p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    {T("Magalir Urimai ₹1k, RTI 2005", "மகளிர் உரிமை, RTI மாதிரி")}
                  </p>
                </div>
              </Link>

              <Link
                to="/districts"
                className="group p-2 rounded-xl bg-white dark:bg-[#0D2B52] border border-civic-200 dark:border-civic-800 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center gap-2"
              >
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-civic-900 dark:text-white group-hover:text-indigo-600 truncate">
                    {T("38 District Feeds", "38 மாவட்ட நுழைவுவாயில்")}
                  </p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate">
                    {T("Hyperlocal alerts & civic info", "உள்ளூர் எச்சரிக்கைகள் & தகவல்கள்")}
                  </p>
                </div>
              </Link>
            </div>

            {/* ── PREDICTIVE SEARCH BAR + LOCATION & UTILITY CTAS ── */}
            <div className="space-y-2">
              {/* Inline Predictive Search Bar */}
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-700 shadow-xs focus-within:border-civic-500 focus-within:ring-2 focus-within:ring-civic-500/20 transition-all">
                  <Search className="w-3.5 h-3.5 text-civic-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                    placeholder={T("Search your town or district (e.g. Tambaram, Coimbatore, Madurai)...", "உங்கள் மாவட்டம் அல்லது பகுதியை தேடுங்கள்...")}
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Predictive Dropdown */}
                {searchFocused && matchedDistricts.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#071E3D] border-2 border-civic-200 dark:border-civic-700 rounded-xl shadow-xl z-50 p-1 space-y-0.5">
                    {matchedDistricts.map((d) => (
                      <Link
                        key={d.slug}
                        to={`/${d.slug}`}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-civic-50 dark:hover:bg-civic-900/40 text-xs transition"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">
                          {lang === "ta" ? d.name_ta : d.name_en}
                        </span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                          {T("Open District Feed", "தகவல்கள்")} <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Trio: Location + 38 Districts + Top Traffic Power Cuts */}
              {!userLocation && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 bg-civic-500 hover:bg-civic-600 active:scale-95 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shadow-civic-500/20 disabled:opacity-80 flex-shrink-0"
                  >
                    {locating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                    <span>{locating ? T("Detecting...", "கண்டறியப்படுகிறது...") : T("Use My Location", "என் இடத்தை பயன்படுத்து")}</span>
                  </button>

                  <Link
                    to="/districts"
                    className="inline-flex items-center gap-1.5 border border-civic-200 dark:border-civic-700 bg-white dark:bg-[#0D2B52] hover:bg-civic-50 dark:hover:bg-civic-900/40 text-civic-900 dark:text-civic-100 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-2xs flex-shrink-0"
                  >
                    <Building2 className="w-3.5 h-3.5 text-civic-500" />
                    <span>{T("Browse 38 Districts", "38 மாவட்டங்கள்")}</span>
                  </Link>

                  <Link
                    to="/power-cuts-today-tamil-nadu"
                    className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-2xs flex-shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{T("Power Cuts Today", "இன்றைய மின்தடை")}</span>
                  </Link>
                </div>
              )}

              {/* Smart District Presence Result (Replaces clumsy pill when detected) */}
              {userLocation && detectedDistrict && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-800 shadow-sm animate-in fade-in slide-in-from-top-1 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-civic-100 dark:bg-civic-900/60 text-civic-600 dark:text-civic-300 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-civic-900 dark:text-white">
                            {T(detectedDistrict.name_en, detectedDistrict.name_ta)}, TN
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            {T("Detected Nearest", "கண்டறியப்பட்டது")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {activeCount > 0 ? `${activeCount} ${T("active incidents & utility updates nearby", "செயலில் உள்ள சம்பவங்கள்")}` : T("Hyperlocal feeds active for this circle", "அனைத்து உள்ளூர் அறிவிப்புகளும் இணைக்கப்பட்டுள்ளன")}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setUserLocation(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Clear location"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-civic-100 dark:border-civic-800">
                    <Link
                      to={`/${detectedDistrict.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-civic-600 dark:text-civic-300 hover:text-civic-800 dark:hover:text-white hover:underline"
                    >
                      <span>{T(`Open ${detectedDistrict.name_en} Feed`, `${detectedDistrict.name_ta} பக்கம் செல்`)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <span className="text-slate-300 dark:text-slate-700">|</span>

                    <div className="relative">
                      <button
                        onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-civic-600"
                      >
                        <span>{T("Switch District", "மாவட்டம் மாற்று")}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {districtDropdownOpen && (
                        <div className="absolute left-0 bottom-full mb-2 w-56 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-[#071E3D] border-2 border-civic-200 dark:border-civic-700 shadow-xl z-50 p-1">
                          {DISTRICTS.map((d) => (
                            <Link
                              key={d.slug}
                              to={`/${d.slug}`}
                              onClick={() => {
                                setUserLocation({ latitude: 13.0827, longitude: 80.2707 }); // switch anchor
                                setDistrictDropdownOpen(false);
                              }}
                              className="block w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-civic-50 dark:hover:bg-civic-900/50 rounded-lg transition-colors"
                            >
                              {T(d.name_en, d.name_ta)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: INTERACTIVE STATE RADAR MAP ── */}
          <div className="w-full lg:flex-1 flex flex-col">
            <div className="w-full h-[320px] sm:h-[380px] lg:h-[450px] xl:h-[470px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border-2 border-civic-200 dark:border-civic-800 relative shadow-xl">
              {shouldLoadMap ? (
                <InteractiveHomeMap items={filteredMapItems} userLocation={userLocation} />
              ) : (
                <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center text-center p-6 select-none relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-civic-500/20 border border-civic-500/40 flex items-center justify-center text-civic-400 mb-3 animate-pulse z-10">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-white font-black text-sm mb-1 z-10">
                    {T("Tamil Nadu Civic Incident Map", "தமிழ்நாடு குடிமை வரைபடம்")}
                  </p>
                  <p className="text-slate-400 text-xs max-w-xs z-10">
                    {T("Connecting to 38 district live feeds…", "38 மாவட்ட நேரடி ஊட்டங்கள் இணைக்கப்படுகின்றன…")}
                  </p>
                </div>
              )}

              {/* Floating Top Status Controls */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-sm pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{allMapItems.length} {T("Live Incidents Across 38 Districts", "நிகழ்நேர சம்பவங்கள்")}</span>
                </span>

                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-[#071E3D]/95 backdrop-blur-md hover:bg-white text-civic-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-civic-200 dark:border-civic-700 shadow-md transition-all pointer-events-auto hover:border-civic-500"
                >
                  {T("Full Map", "முழு வரைபடம்")} <ArrowRight className="w-3.5 h-3.5 text-civic-500" />
                </Link>
              </div>

              {/* Interactive Category Filter Pills (Prominent & Touch-friendly) */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1.5 z-20 pointer-events-auto">
                <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/15 text-[11px] text-white shadow-lg overflow-x-auto">
                  <button
                    onClick={() => setMapCategory("all")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      mapCategory === "all" ? "bg-white text-slate-900 shadow-sm" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{T("All", "அனைத்தும்")}</span>
                    <span className="text-[10px] opacity-75">({allMapItems.length})</span>
                  </button>

                  <button
                    onClick={() => setMapCategory("power")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      mapCategory === "power" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>⚡ {T("Power", "மின்தடை")}</span>
                    {powerCount > 0 && <span className="text-[10px] font-black bg-amber-400/30 px-1 rounded">+{powerCount}</span>}
                  </button>

                  <button
                    onClick={() => setMapCategory("rain")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      mapCategory === "rain" ? "bg-red-500 text-white shadow-sm" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>🌧️ {T("Rain", "மழை")}</span>
                    {rainCount > 0 && <span className="text-[10px] font-black bg-red-400/30 px-1 rounded">+{rainCount}</span>}
                  </button>

                  <button
                    onClick={() => setMapCategory("civic")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      mapCategory === "civic" ? "bg-blue-500 text-white shadow-sm" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>🛠️ {T("Civic", "குடிமை")}</span>
                    {civicCount > 0 && <span className="text-[10px] font-black bg-blue-400/30 px-1 rounded">+{civicCount}</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLL PEEK CUE (Guiding towards Quick Actions below) ── */}
      <a
        href="#district-strip"
        className="relative z-10 hidden lg:flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-civic-600 dark:text-slate-500 dark:hover:text-civic-300 pt-1 select-none transition-colors"
      >
        <span>{T("Scroll down to explore Quick District Feeds & Citizen Services", "மாவட்ட வாரியான தகவல்கள் மற்றும் விரைவு சேவைகளை காண கீழே உருட்டவும்")}</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </a>
    </section>
  );
}
