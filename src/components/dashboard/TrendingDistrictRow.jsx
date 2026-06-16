import React from "react";
import { Link } from "react-router-dom";
import { DISTRICTS } from "@/lib/districts";

export default function TrendingDistrictRow({ district, rank, max, lang }) {
  const d = DISTRICTS.find((x) => x.slug === district.slug);
  const name = d ? (lang === "ta" ? d.name_ta : d.name_en) : district.name;
  const pct = max > 0 ? (district.engagement / max) * 100 : 0;

  const rankColor = rank === 1 ? "text-yellow-500" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-orange-400" : "text-slate-300";

  return (
    <Link to={`/district/${district.slug}`} className="flex items-center gap-3 group py-1">
      <span className={`text-xs font-bold w-5 text-right ${rankColor}`}>#{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{name}</span>
          <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{district.postCount} posts</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}