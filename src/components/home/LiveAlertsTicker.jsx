"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, Zap, AlertTriangle, ArrowRight, PhoneCall } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveSituations } from "@/services/situations";
import { getActiveCivicPosts } from "@/services/posts";

export default function LiveAlertsTicker() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const { data: situations = [] } = useQuery({
    queryKey: ["ticker-situations"],
    queryFn: () => getActiveSituations(6),
    staleTime: 120_000,
  });

  const { data: civicPosts = [] } = useQuery({
    queryKey: ["ticker-alerts"],
    queryFn: () => getActiveCivicPosts(6),
    staleTime: 120_000,
  });

  // Pick top active emergency/alert items
  const alertPosts = civicPosts.filter((p) => p.post_type === "alert" || p.urgency_level === "high" || p.urgency_level === "critical");
  const liveItems = [...situations, ...alertPosts].slice(0, 3);

  if (liveItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border-y border-slate-800 text-white text-xs py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        {/* Pulse beacon */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-rose-400">
            {T("Live Alerts", "நேரடி கள நிலவரம்")}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
        </div>

        {/* Alerts ticker items */}
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 overflow-hidden text-slate-300">
          {liveItems.map((item, idx) => {
            const title = T(item.title_en || item.title, item.title_ta || item.title);
            const district = item.district_slug || item.district_name || "";
            const helpline = item.assigned_department || (item.situation_type === "eb_shutdown" ? "1912" : "");
            const path = item.situation_type ? "/situations" : (item.slug ? `/post/${item.slug}` : `/post/${item.id}`);

            return (
              <Link
                key={item.id || idx}
                to={path}
                className="hover:text-blue-400 flex items-center gap-1.5 transition-colors group truncate max-w-full sm:max-w-[420px]"
              >
                <span className="text-amber-400 font-bold flex-shrink-0">
                  {item.situation_type === "eb_shutdown" || item.category_slug === "electricity" ? "⚡" : "⚠️"}
                </span>
                {district && (
                  <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded flex-shrink-0">
                    {district}
                  </span>
                )}
                <span className="truncate font-medium text-slate-200 group-hover:underline">
                  {title}
                </span>
                {helpline && helpline.includes("1912") && (
                  <span className="text-[10px] text-amber-300 font-bold hidden md:inline-flex items-center gap-0.5">
                    <PhoneCall className="w-2.5 h-2.5" /> 1912
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* View all link */}
        <div className="flex-shrink-0 self-end sm:self-auto">
          <Link
            to="/power-cuts-today-tamil-nadu"
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
          >
            {T("All advisories", "அனைத்து அறிவிப்புகள்")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
