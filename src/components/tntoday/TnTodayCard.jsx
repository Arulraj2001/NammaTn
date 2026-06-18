import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedTnToday } from "@/services/tnToday";
import { format } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = {
  infrastructure: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  education:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  healthcare:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  environment:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  economy:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  governance:     "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  transport:      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  agriculture:    "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  technology:     "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  social:         "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  general:        "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

/**
 * TnTodayCard — Compact homepage card showing the latest TN Today story.
 * Designed to sit elegantly in the Home page sidebar/section without
 * being noisy. Matches the NammaTN blue/white design system.
 */
export default function TnTodayCard({ className }) {
  const { data: article, isLoading } = useQuery({
    queryKey: ["tn-today-featured"],
    queryFn: getFeaturedTnToday,
    staleTime: 300_000,
  });

  if (isLoading) {
    return (
      <div className={cn("bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-pulse", className)}>
        <div className="h-32 bg-slate-100 dark:bg-slate-700" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <Link to="/tn-today" className={cn("block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-blue-300 transition-colors group", className)}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center">
            <span className="text-white font-black text-[9px]">TN</span>
          </div>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">TN Today</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Daily headline coming soon. Stay tuned for today's story.</p>
        <p className="text-xs text-blue-600 mt-2 font-medium group-hover:underline">Visit TN Today →</p>
      </Link>
    );
  }

  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general;

  return (
    <Link to={`/tn-today/${article.slug}`}
      className={cn(
        "block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group",
        className
      )}>
      {/* Image */}
      {article.featured_image && (
        <div className="relative overflow-hidden h-36">
          <img src={article.featured_image} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-2">
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full capitalize", catColor)}>
              {article.category}
            </span>
          </div>
        </div>
      )}

      <div className="p-3">
        {/* TN Today badge */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded bg-blue-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-[8px] leading-none">TN</span>
          </div>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Today's Story</span>
          <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />{article.reading_time || 5}m
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5">
          {article.title}
        </h3>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
            {article.subtitle}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          {article.publish_date && (
            <span className="text-[10px] text-slate-400">
              {format(new Date(article.publish_date), "d MMM")}
            </span>
          )}
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:gap-1 transition-all ml-auto">
            Read more <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
