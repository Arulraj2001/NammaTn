"use client";

import React, { useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { ArrowRight, PhoneCall, RefreshCw, Zap, AlertTriangle, Droplets } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroMicroAlerts({
  userLocation,
  locating,
  situations = [],
  civicPosts = [],
  calculateDistance,
}) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // Filter urgent civic posts
  const alertPosts = useMemo(() => {
    return civicPosts.filter(
      (p) => p.post_type === "alert" || p.urgency_level === "high" || p.urgency_level === "critical"
    );
  }, [civicPosts]);

  // Combine situations and urgent alerts
  const allAlerts = useMemo(() => {
    return [...situations, ...alertPosts];
  }, [situations, alertPosts]);

  // Determine local vs statewide items
  const { displayItems, isNearbyMatch } = useMemo(() => {
    if (userLocation && calculateDistance) {
      const nearby = allAlerts.filter((item) => {
        if (!item.latitude || !item.longitude) return false;
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(item.latitude),
          parseFloat(item.longitude)
        );
        return dist <= 60;
      });

      if (nearby.length > 0) {
        return { displayItems: nearby.slice(0, 3), isNearbyMatch: true };
      }
    }

    return { displayItems: allAlerts.slice(0, 3), isNearbyMatch: false };
  }, [allAlerts, userLocation, calculateDistance]);

  return (
    <div className="mt-4 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-xs">
      {/* Micro Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-200/60 dark:border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400">
            {T("Live Alerts", "நேரடி எச்சரிக்கைகள்")}
          </span>
          {userLocation && (
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                isNearbyMatch
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600"
              }`}
            >
              {isNearbyMatch ? T("Near You", "உங்கள் அருகில்") : T("TN State", "தமிழகம்")}
            </span>
          )}
        </div>

        <Link
          to="/power-cuts-today-tamil-nadu"
          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-0.5"
        >
          {T("All advisories", "அனைத்து அறிவிப்புகள்")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Micro Alert Items or Fetching State */}
      {locating ? (
        <div className="flex items-center gap-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin text-blue-500 flex-shrink-0" />
          <span className="truncate">
            {T("Detecting your area & fetching local alerts…", "பகுதி கண்டறிந்து எச்சரிக்கைகள் பெறப்படுகின்றன…")}
          </span>
        </div>
      ) : displayItems.length > 0 ? (
        <div className="space-y-1">
          {displayItems.map((item, idx) => {
            const title = T(item.title_en || item.title, item.title_ta || item.title);
            const district = item.district_slug || item.district_name || "";
            const helpline =
              item.assigned_department?.includes("1912") || item.situation_type === "eb_shutdown"
                ? "1912"
                : item.assigned_department?.includes("1913")
                ? "1913"
                : "";
            const path = item.situation_type
              ? "/situations"
              : item.slug
              ? `/post/${item.slug}`
              : `/post/${item.id}`;

            const icon =
              item.situation_type === "eb_shutdown" || item.category_slug === "electricity" ? (
                <span className="text-amber-500 font-bold text-xs flex-shrink-0">⚡</span>
              ) : item.situation_type === "water_shortage" || item.category_slug === "water-sanitation" ? (
                <span className="text-cyan-500 font-bold text-xs flex-shrink-0">💧</span>
              ) : (
                <span className="text-orange-500 font-bold text-xs flex-shrink-0">⚠️</span>
              );

            return (
              <Link
                key={item.id || idx}
                to={path}
                className="flex items-center gap-1.5 py-1 px-1 rounded-md hover:bg-white dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group text-xs"
              >
                {icon}
                {district && (
                  <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0 leading-tight">
                    {district}
                  </span>
                )}
                <span className="truncate flex-1 font-medium leading-tight group-hover:underline">
                  {title}
                </span>
                {helpline && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hidden sm:inline-flex items-center gap-0.5 flex-shrink-0">
                    <PhoneCall className="w-2.5 h-2.5" /> {helpline}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 py-1 italic">
          {T("No critical alerts active right now.", "தற்போது தீவிர எச்சரிக்கைகள் ஏதுமில்லை.")}
        </p>
      )}
    </div>
  );
}
