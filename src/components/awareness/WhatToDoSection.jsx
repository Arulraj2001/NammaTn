import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";

const getIcon = (name) => LucideIcons[name] || LucideIcons.FileText;

const GUIDE_COLORS = [
  "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
];

export default function WhatToDoSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["awarenessGuides"],
    queryFn: () => base44.entities.AwarenessGuide.filter({ is_active: true }, "sort_order"),
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          {T("What to Do If...", "என்ன செய்ய வேண்டும்...")}
        </h2>
        <Link
          to="/awareness/guides"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all guides", "அனைத்து வழிகாட்டிகள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Scrollable row */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {guides.slice(0, 6).map((guide, idx) => {
          const Icon = getIcon(guide.icon);
          const title = lang === "ta" ? guide.title_ta || guide.title_en : guide.title_en;
          const colorCls = GUIDE_COLORS[idx % GUIDE_COLORS.length];
          return (
            <div
              key={guide.id}
              className="flex-shrink-0 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorCls}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3 line-clamp-2 leading-snug">
                {title}
              </p>
              <button className="mt-auto text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium">
                {T("View Guide", "வழிகாட்டி")} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
