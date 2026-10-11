"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { MapPin, Search, RefreshCw, ArrowRight, ChevronDown, X, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveCivicPosts } from "@/services/posts";
import { getActiveSituations } from "@/services/situations";
import { findNearestDistrict } from "@/lib/geoDistrict";
import { DISTRICTS } from "@/lib/districts";

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

  useEffect(() => {
    const timer = setTimeout(() => setShouldLoadMap(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const { data: civicPosts = [] } = useQuery({
    queryKey: ["home-civic-posts"],
    queryFn: () => getActiveCivicPosts(40),
    staleTime: 300_000,
  });
  const { data: situations = [] } = useQuery({
    queryKey: ["home-situations"],
    queryFn: () => getActiveSituations(25),
    staleTime: 300_000,
  });

  const allMapItems = useMemo(() => [
    ...filterExpiredSituations(situations).map(s => ({ ...s, post_type: "situation" })),
    ...civicPosts.map(p => ({ ...p, post_type: p.post_type || "civic" })),
  ], [civicPosts, situations]);

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
      if (!item.latitude || !item.longitude) return false;
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(item.latitude),
        parseFloat(item.longitude)
      );
      return dist <= 60;
    });
  };

  const activeCount = getNearbyItems(allMapItems).length;

  const detectedDistrict = useMemo(() => {
    if (!userLocation) return null;
    return findNearestDistrict(userLocation.latitude, userLocation.longitude);
  }, [userLocation]);

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4.75rem)] flex flex-col justify-between bg-gradient-to-b from-civic-50/70 via-white to-white dark:from-[#071E3D] dark:via-[#071E3D] dark:to-[#0A2246] border-b-2 border-civic-200 dark:border-civic-900 pt-6 pb-4 sm:pt-8 sm:pb-5 lg:pt-10 lg:pb-6">
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
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

          {/* ── LEFT: CIVIC IDENTITY & INTERACTION ── */}
          <div className="w-full lg:w-[48%] flex-shrink-0 text-left">
            {/* Live State Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civic-100 dark:bg-civic-900/60 border border-civic-200 dark:border-civic-800 text-[11px] font-black tracking-wider uppercase text-civic-900 dark:text-civic-200 mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{T("Tamil Nadu Civic Proof & Utility Alerts", "தமிழ்நாடு ஹைப்பர்லோகல் குடிமை சான்றுகள்")}</span>
              <span className="text-civic-400">•</span>
              <span className="text-civic-600 dark:text-civic-300 font-bold">{T("38 Districts", "38 மாவட்டங்கள்")}</span>
            </div>

            {/* Authoritative Headline with unique word styling */}
            <h1 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black leading-[1.2] tracking-tight mb-3">
              <span className="text-civic-900 dark:text-white">
                {T("Know what's happening", "என்ன நடக்கிறது என்று தெரிந்து கொள்ளுங்கள்")}
              </span>
              <span className="bg-gradient-to-r from-civic-600 via-sky-500 to-civic-400 bg-clip-text text-transparent font-black ml-1.5">
                {T("in your area", "உங்கள் பகுதியில்")},
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-black text-[0.82em] align-middle shadow-2xs hover:scale-105 transition-transform select-none">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>{T("verified", "சரிபார்க்கப்பட்டு")}</span>
              </span>
              <span className="text-civic-900 dark:text-white inline-flex items-center ml-1">
                <span>{T("in real-time", "நிகழ்நேரத்தில்")}</span>
                <span className="relative flex h-2.5 w-2.5 ml-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-civic-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-civic-500"></span>
                </span>
                <span>.</span>
              </span>
            </h1>

            {/* Subtitle Explaining Platform Scope */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-5 max-w-xl">
              {T(
                "Document local civic issues with proof, track scheduled power cuts & collector holiday notices, and access verified welfare schemes across all 38 districts of Tamil Nadu.",
                "அனைத்து 38 மாவட்டங்களுக்கான மின்தடை அறிவிப்புகள், ஆட்சியர் பள்ளி விடுமுறை தகவல்கள், குடிமக்கள் குறைதீர்ப்பு சான்றுகள் மற்றும் அரசு நலத்திட்ட வழிகாட்டிகள்."
              )}
            </p>

            {/* 4 Core Pillars Grid (Shows what entire website does) */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <Link
                to="/power-cuts-today-tamil-nadu"
                className="group p-2.5 rounded-xl bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-800 hover:border-civic-500 hover:shadow-xs transition-all flex items-start gap-2"
              >
                <span className="text-base">⚡</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-civic-900 dark:text-white group-hover:text-civic-600 truncate">
                    {T("Power & Rain Alerts", "மின்தடை & மழை எச்சரிக்கை")}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {T("TANGEDCO 1912, Metrowater", "மின்வாரியம், குடிநீர், மழை")}
                  </p>
                </div>
              </Link>

              <Link
                to="/create"
                className="group p-2.5 rounded-xl bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-800 hover:border-civic-500 hover:shadow-xs transition-all flex items-start gap-2"
              >
                <span className="text-base">📋</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-civic-900 dark:text-white group-hover:text-civic-600 truncate">
                    {T("Civic Proof Receipts", "குடிமக்கள் குறைதீர்ப்பு")}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {T("Report & track to fixed", "புகார் பதிவு & தீர்வு கண்காணிப்பு")}
                  </p>
                </div>
              </Link>

              <Link
                to="/schemes"
                className="group p-2.5 rounded-xl bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-800 hover:border-civic-500 hover:shadow-xs transition-all flex items-start gap-2"
              >
                <span className="text-base">⚖️</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-civic-900 dark:text-white group-hover:text-civic-600 truncate">
                    {T("Schemes & Rights", "அரசு நலத்திட்டங்கள் & RTI")}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {T("Magalir Urimai ₹1k, RTI 2005", "மகளிர் உரிமை, RTI மாதிரி")}
                  </p>
                </div>
              </Link>

              <Link
                to="/districts"
                className="group p-2.5 rounded-xl bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-800 hover:border-civic-500 hover:shadow-xs transition-all flex items-start gap-2"
              >
                <span className="text-base">🏛️</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-civic-900 dark:text-white group-hover:text-civic-600 truncate">
                    {T("38 District Feeds", "38 மாவட்ட நுழைவுவாயில்")}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {T("Hyperlocal alerts & MLA info", "உள்ளூர் செய்திகள் & MLA விவரம்")}
                  </p>
                </div>
              </Link>
            </div>

            {/* ── LOCATION INTERACTION & SMART RESULT ── */}
            <div className="space-y-3">
              {/* If location is NOT detected yet */}
              {!userLocation && (
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 bg-civic-500 hover:bg-civic-600 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-civic-500/25 disabled:opacity-80"
                  >
                    {locating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span>{locating ? T("Detecting your district...", "உங்கள் மாவட்டம் கண்டறியப்படுகிறது...") : T("Use My Location", "என் இடத்தை பயன்படுத்து")}</span>
                  </button>

                  <Link
                    to="/districts"
                    className="inline-flex items-center gap-2 border-2 border-civic-200 dark:border-civic-700 bg-white dark:bg-[#0D2B52] hover:bg-civic-50 dark:hover:bg-civic-900/40 text-civic-900 dark:text-civic-100 font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-2xs"
                  >
                    <Search className="w-4 h-4 text-civic-500" />
                    <span>{T("Search 38 Districts", "38 மாவட்டங்கள்")}</span>
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
                      title={T("Clear location filter", "இருப்பிட வடிகட்டியை அழி")}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 pt-2 border-t border-civic-100 dark:border-civic-800/80">
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
            <div className="w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-3xl overflow-hidden bg-slate-900 border-2 border-civic-200 dark:border-civic-800 relative shadow-xl">
              {shouldLoadMap ? (
                <InteractiveHomeMap items={allMapItems} userLocation={userLocation} />
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

              {/* Floating Top Controls */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-sm pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {T("Live", "நிகழ்நேர சம்பவ வரைபடம்")}
                </span>

                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-[#071E3D]/95 backdrop-blur-md hover:bg-white text-civic-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-civic-200 dark:border-civic-700 shadow-md transition-all pointer-events-auto hover:border-civic-500"
                >
                  {T("Full Map", "முழு வரைபடம்")} <ArrowRight className="w-3.5 h-3.5 text-civic-500" />
                </Link>
              </div>

              {/* Bottom Quick Legend */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
                <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] text-white/90">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> ⚡ Power</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> 🌧️ Rain</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> 🛠️ Civic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLL PEEK CUE (Guiding towards Quick Actions below) ── */}
      <a
        href="#quick-actions"
        className="relative z-10 hidden lg:flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-civic-600 dark:text-slate-500 dark:hover:text-civic-300 pt-3 select-none transition-colors"
      >
        <span>{T("Scroll down to explore Quick Citizen Actions & 38-District Feeds", "விரைவு குடிமை சேவைகள் மற்றும் 38 மாவட்டங்களை காண கீழே உருட்டவும்")}</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </a>
    </section>
  );
}
