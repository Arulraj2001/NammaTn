"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { MapPin, Search, RefreshCw, ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveCivicPosts } from "@/services/posts";
import { getActiveSituations } from "@/services/situations";
import HeroMicroAlerts from "./HeroMicroAlerts";

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

  useEffect(() => {
    // Mount map promptly without artificial 2.5s delay
    const timer = setTimeout(() => setShouldLoadMap(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const { data: civicPosts = [] } = useQuery({
    queryKey: ["home-civic-posts"],
    queryFn: () => getActiveCivicPosts(30),
    staleTime: 300_000,
  });
  const { data: situations = [] } = useQuery({
    queryKey: ["home-situations"],
    queryFn: () => getActiveSituations(20),
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
      () => setLocating(false)
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

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* LEFT COPY */}
          <div className="w-full lg:w-[44%] flex-shrink-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
              {T("Know what's happening in ", "என்ன நடக்கிறது என்று தெரிந்து கொள்ளுங்கள் ")}
              <span className="text-blue-600">{T("your area", "உங்கள் பகுதியில்")}</span>
              {T(" right now.", " இப்போதே.")}
            </h1>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
              {[
                { icon: "⚡", en: "Power cuts.",       ta: "மின் வெட்டு.", href: "/power-cuts-today-tamil-nadu" },
                { icon: "🌧️", en: "Holiday alerts.",   ta: "பள்ளி விடுமுறை.", href: "/school-college-holiday-alerts" },
                { icon: "💧", en: "Water issues.",     ta: "நீர் சிக்கல்." },
                { icon: "🚧", en: "Road problems.",    ta: "சாலை சிக்கல்." },
                { icon: "⚠️", en: "Scam alerts.",     ta: "மோசடி எச்சரிக்கை." },
                { icon: "📢", en: "Civic notices.",   ta: "அரசு அறிவிப்புகள்." },
              ].map((pill, i) => pill.href ? (
                <Link
                  key={i}
                  to={pill.href}
                  className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold underline decoration-amber-400/50 underline-offset-4 transition-colors"
                >
                  <span>{pill.icon}</span>{T(pill.en, pill.ta)}
                </Link>
              ) : (
                <span key={i} className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <span>{pill.icon}</span>{T(pill.en, pill.ta)}
                </span>
              ))}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {T("All in one place. Verified by citizens.", "ஒரே இடத்தில். குடிமக்களால் சரிபார்க்கப்பட்டது.")}
            </p>

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

            {/* Tiny Sized Live Alerts placed below location row */}
            <HeroMicroAlerts
              userLocation={userLocation}
              locating={locating}
              situations={situations}
              civicPosts={civicPosts}
              calculateDistance={calculateDistance}
            />
          </div>

          {/* RIGHT MAP */}
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="w-full h-[260px] sm:h-[340px] lg:h-[420px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 relative shadow-lg">
              {shouldLoadMap ? (
                <InteractiveHomeMap items={allMapItems} userLocation={userLocation} />
              ) : (
                <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center text-center p-6 select-none relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 animate-pulse z-10">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-white font-extrabold text-sm mb-1 z-10">
                    {T("Tamil Nadu Civic Incident Map", "தமிழ்நாடு குடிமை வரைபடம்")}
                  </p>
                  <p className="text-slate-400 text-xs max-w-xs z-10">
                    {T("Connecting to 38 district live feeds…", "38 மாவட்ட நேரடி ஊட்டங்கள் இணைக்கப்படுகின்றன…")}
                  </p>
                </div>
              )}
              <div className="absolute top-3 right-3 z-20">
                <Link to="/explore"
                  className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all">
                  {T("View full map", "முழு வரைபடம்")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
