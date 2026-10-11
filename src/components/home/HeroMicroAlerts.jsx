"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import {
  ArrowRight, PhoneCall, RefreshCw, Zap, AlertTriangle,
  MapPin, CheckCircle2, ShieldAlert, Radio, FileText, Megaphone
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { findNearestDistrict } from "@/lib/geoDistrict";

export default function HeroMicroAlerts({
  userLocation,
  locating,
  onRescan,
  situations = [],
  civicPosts = [],
  calculateDistance,
}) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // Identify nearest district
  const nearestDistrict = useMemo(() => {
    if (!userLocation) return null;
    return findNearestDistrict(userLocation.latitude, userLocation.longitude);
  }, [userLocation]);

  // Combine situations & posts
  const allItems = useMemo(() => {
    return [
      ...situations.map((s) => ({ ...s, isSituation: true })),
      ...civicPosts,
    ];
  }, [situations, civicPosts]);

  // Filter items relevant to user's location
  const localItems = useMemo(() => {
    if (!userLocation) return [];

    return allItems.filter((item) => {
      // 1. Distance match
      if (item.latitude && item.longitude && calculateDistance) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(item.latitude),
          parseFloat(item.longitude)
        );
        if (dist <= 50) return true;
      }
      // 2. District slug match
      if (nearestDistrict?.slug && item.district_slug) {
        if (item.district_slug.toLowerCase() === nearestDistrict.slug.toLowerCase()) {
          return true;
        }
      }
      return false;
    });
  }, [allItems, userLocation, nearestDistrict, calculateDistance]);

  // Buckets: Alerts, Active Issues, Local Updates
  const { alerts, issues, updates } = useMemo(() => {
    const list = localItems.length > 0 ? localItems : allItems;

    const alertsList = list.filter(
      (item) =>
        item.isSituation ||
        item.post_type === "alert" ||
        item.urgency_level === "high" ||
        item.urgency_level === "critical"
    );

    const issuesList = list.filter(
      (item) =>
        !item.isSituation &&
        (item.post_type === "complaint" ||
          (!item.post_type && item.urgency_level !== "critical"))
    );

    const updatesList = list.filter(
      (item) =>
        item.post_type === "local_update" ||
        item.category_slug === "government-schemes" ||
        item.post_type === "discussion"
    );

    return {
      alerts: alertsList,
      issues: issuesList,
      updates: updatesList,
    };
  }, [localItems, allItems]);

  // Active filter tab: 'alerts' | 'issues' | 'updates'
  const [activeTab, setActiveTab] = useState("alerts");

  // Auto-switch to tab with items if alerts empty
  useEffect(() => {
    if (alerts.length > 0) setActiveTab("alerts");
    else if (issues.length > 0) setActiveTab("issues");
    else if (updates.length > 0) setActiveTab("updates");
  }, [alerts.length, issues.length, updates.length]);

  // ONLY display when locating or userLocation is active!
  // Idle state renders nothing so the hero stays clean by default.
  if (!locating && !userLocation) {
    return null;
  }

  // Active items for current tab
  const currentTabItems =
    activeTab === "alerts"
      ? alerts
      : activeTab === "issues"
      ? issues
      : updates;

  const displayList = currentTabItems.slice(0, 3);
  const districtName = nearestDistrict
    ? T(nearestDistrict.name_en, nearestDistrict.name_ta)
    : T("Your Neighborhood", "உங்கள் பகுதி");

  return (
    <div className="mt-4 p-3 rounded-2xl bg-white dark:bg-slate-800/95 border-2 border-blue-200 dark:border-blue-900/60 shadow-lg shadow-blue-500/5 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      {/* ── Locating / Radar Scanning State ── */}
      {locating ? (
        <div className="flex items-center gap-3 py-2 text-slate-700 dark:text-slate-200">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {T("Scanning live hyperlocal feeds…", "நேரடி பகுதி நிலவரங்கள் பெறப்படுகின்றன…")}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {T("Matching GPS coordinates to district civic grid…", "ஜிபிஎஸ் பகுதி குடிமைத் தகவல்களுடன் இணைக்கப்படுகிறது…")}
            </p>
          </div>
        </div>
      ) : (
        /* ── Fetched Hyperlocal Intel View ── */
        <div>
          {/* Header row: Location Badge + Rescan Action */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                📍 {districtName}
              </span>
              {nearestDistrict?.distanceKm !== undefined && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  ({nearestDistrict.distanceKm} km {T("radius", "சுற்றளவு")})
                </span>
              )}
            </div>

            {onRescan && (
              <button
                onClick={onRescan}
                className="text-[10px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                {T("Rescan", "மீண்டும் தேடு")}
              </button>
            )}
          </div>

          {/* 3 Hyperlocal Filter Pills */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === "alerts"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{T("Alerts", "எச்சரிக்கைகள்")}</span>
              <span className="text-[10px] opacity-80">({alerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("issues")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === "issues"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{T("Active Issues", "சிக்கல்கள்")}</span>
              <span className="text-[10px] opacity-80">({issues.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("updates")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === "updates"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Megaphone className="w-3 h-3" />
              <span>{T("Updates", "செய்திகள்")}</span>
              <span className="text-[10px] opacity-80">({updates.length})</span>
            </button>
          </div>

          {/* Active Items List */}
          {displayList.length > 0 ? (
            <div className="space-y-1.5">
              {displayList.map((item, idx) => {
                const title = T(item.title_en || item.title, item.title_ta || item.title);
                const area = item.area_name || item.location_text || item.district_name || "";
                const helpline =
                  item.assigned_department?.includes("1912") || item.situation_type === "eb_shutdown"
                    ? "1912"
                    : item.assigned_department?.includes("1913")
                    ? "1913"
                    : "";
                const path = item.isSituation
                  ? "/situations"
                  : item.slug
                  ? `/post/${item.slug}`
                  : `/post/${item.id}`;

                return (
                  <Link
                    key={item.id || idx}
                    to={path}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/40 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group text-xs border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50"
                  >
                    <span className="flex-shrink-0 text-sm">
                      {item.isSituation || item.situation_type === "eb_shutdown" || item.category_slug === "electricity"
                        ? "⚡"
                        : item.category_slug === "water-sanitation"
                        ? "💧"
                        : item.post_type === "complaint"
                        ? "⚠️"
                        : "📢"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {area && (
                          <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 leading-tight">
                            {area}
                          </span>
                        )}
                        <span className="truncate font-semibold text-xs leading-tight group-hover:underline">
                          {title}
                        </span>
                      </div>
                    </div>
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
            <div className="flex items-center gap-2 py-2 px-1 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                {T(
                  `No urgent ${activeTab} in this zone right now.`,
                  `தற்போது இப்பகுதியில் தீவிர ${activeTab === "alerts" ? "எச்சரிக்கைகள்" : "சிக்கல்கள்"} ஏதுமில்லை.`
                )}
              </span>
            </div>
          )}

          {/* Footer Action: District Gateway link */}
          {nearestDistrict?.slug && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                {localItems.length} {T("active items mapped", "பதிவுகள் இணைக்கப்பட்டுள்ளன")}
              </span>
              <Link
                to={`/${nearestDistrict.slug}`}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {T(`View all in ${districtName}`, `${districtName} அனைத்து பதிவுகள்`)}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
