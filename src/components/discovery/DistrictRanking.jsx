import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ArrowRight, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getTrendingDistricts } from "@/services/trending";
import { getDistrictBySlug } from "@/lib/districts";

export default function DistrictRanking({ limit = 8 }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: districts = [], isLoading } = useQuery({
    queryKey: ["trending-districts"],
    queryFn: getTrendingDistricts,
    staleTime: 180_000,
  });

  const top = districts.slice(0, limit);
  const max = top[0]?.engagement || 1;

  const RANK_COLORS = ["text-yellow-500", "text-slate-400", "text-amber-700"];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          {T("Most Active Districts", "மிகவும் செயலில் உள்ள மாவட்டங்கள்")}
        </h3>
        <Link to="/districts" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          {T("View all", "அனைத்தும்")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-9 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {top.map((d, i) => {
            const info = getDistrictBySlug(d.slug);
            const name = info ? T(info.name_en, info.name_ta) : d.name || d.slug;
            const pct = Math.round((d.engagement / max) * 100);
            return (
              <Link key={d.slug} to={`/district/${d.slug}`} className="flex items-center gap-3 group hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl px-2 py-1.5 transition-colors">
                <span className={`text-xs font-bold w-5 text-center ${RANK_COLORS[i] || "text-slate-400"}`}>#{i + 1}</span>
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{name}</span>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{d.postCount || 0} posts</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}