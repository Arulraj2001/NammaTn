"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { MapPin, ArrowRight } from "lucide-react";
import { getPowerCutAreas } from "@/lib/powerCutAreas";
import { useLanguage } from "@/context/LanguageContext";

export default function NearbyDistrictAreas({ districtSlug, districtName, currentAreaSlug = "" }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  if (!districtSlug) return null;

  const areas = getPowerCutAreas(districtSlug);
  if (!areas || areas.length === 0) return null;

  // Filter out the current area if viewing a specific area post
  const displayAreas = areas.filter((a) => a.slug !== currentAreaSlug).slice(0, 10);

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-5 mb-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          {T(`Explore Other Areas in ${districtName || "this District"}`, `${districtName || "மாவட்டத்தின்"} பிற பகுதிகள்`)}
        </h4>
        <Link
          to={`/${districtSlug}`}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
        >
          {T("All Areas", "அனைத்தும்")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayAreas.map((area) => (
          <Link
            key={area.slug}
            to={`/power-cuts-today-tamil-nadu/${districtSlug}/${area.slug}`}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-700/60 dark:hover:bg-blue-900/30 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/50 dark:border-slate-600 transition-all hover:scale-105"
          >
            {lang === "ta" ? area.name_ta || area.name_en : area.name_en}
          </Link>
        ))}
      </div>
    </div>
  );
}
