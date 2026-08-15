"use client";

import React from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { Shield, BookOpen, Gift, FileText, Globe, Phone, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS = [
  { path: "/awareness", icon: Home, en: "Awareness Home", ta: "முக்கிய பக்கம்" },
  { path: "/awareness/rights", icon: Shield, en: "Citizen Rights", ta: "குடிமக்கள் உரிமைகள்" },
  { path: "/awareness/articles", icon: BookOpen, en: "Articles", ta: "கட்டுரைகள்" },
  { path: "/awareness/schemes", icon: Gift, en: "Schemes & Benefits", ta: "அரசு திட்டங்கள்" },
  { path: "/awareness/guides", icon: FileText, en: "Guides", ta: "வழிகாட்டிகள்" },
  { path: "/awareness/portals", icon: Globe, en: "Portals", ta: "இணையதளங்கள்" },
  { path: "/awareness/emergency", icon: Phone, en: "Emergency", ta: "அவசர எண்கள்" },
];

export default function AwarenessSubNav({ activePath }) {
  const { lang } = useLanguage();
  const location = useLocation();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const currentPath = activePath || location.pathname;

  return (
    <nav aria-label="Awareness Navigation" className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== "/awareness" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{T(item.en, item.ta)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
