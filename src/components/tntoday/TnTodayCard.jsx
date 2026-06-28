import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedTnToday } from "@/services/tnToday";
import { format } from "date-fns";
import { X, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = {
  infrastructure: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30",
  education:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30",
  healthcare:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/30",
  environment:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
  economy:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30",
  governance:     "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/30",
  transport:      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/30",
  agriculture:    "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border-lime-200 dark:border-lime-800/30",
  technology:     "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/30",
  social:         "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800/30",
  general:        "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

export default function TnTodayCard({ className }) {
  const { data: article, isLoading } = useQuery({
    queryKey: ["tn-today-featured"],
    queryFn: getFeaturedTnToday,
    staleTime: 0,
  });

  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state if a new article ID is loaded (for live testing)
  useEffect(() => {
    setDismissed(false);
  }, [article?.id]);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
  };

  if (isLoading) {
    return (
      <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl animate-pulse flex flex-col gap-2.5 w-[240px]", className)}>
        <div className="h-24 sm:h-26 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (dismissed) {
    return null;
  }

  // --- CASE A: NO PINNED ARTICLE (Show simple placeholder card) ---
  if (!article) {
    return (
      <div
        className={cn(
          "block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 w-[240px] group relative text-left z-20",
          className
        )}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          type="button"
          className="absolute top-2 right-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 z-30"
          aria-label="Dismiss today's story"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1 mb-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-black text-[8px] leading-none">
            TN
          </div>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            TN TODAY
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-normal mb-2 pr-4">
          Daily headline coming soon. Stay tuned for today's story.
        </p>
        <Link to="/tn-today" className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Visit TN Today <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  // --- CASE B: PINNED ARTICLE IS ACTIVE (Show detailed featured card) ---
  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general;

  return (
    <Link 
      to={`/tn-today/${article.slug}`}
      className={cn(
        "block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-[5px] border-l-blue-600 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300 w-[240px] group relative text-left z-20",
        className
      )}
    >
      {/* Close button with circular translucent background */}
      <button 
        onClick={handleClose}
        type="button"
        className="absolute top-2.5 right-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm z-30"
        aria-label="Dismiss today's story"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Featured Header Image */}
      {article.featured_image ? (
        <div className="relative h-24 sm:h-26 bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            sizes="240px"
            className="object-cover"
            quality={75}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {/* Category pill on the bottom-left of the image */}
          <div className="absolute bottom-2 left-2">
            <span className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-sm capitalize border", catColor)}>
              {article.category}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative h-16 bg-gradient-to-br from-blue-600 to-indigo-800 flex-shrink-0">
          {/* Category pill */}
          <div className="absolute bottom-2 left-2">
            <span className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-sm capitalize border", catColor)}>
              {article.category}
            </span>
          </div>
        </div>
      )}

      {/* Body content */}
      <div className="p-3 pt-2.5">
        {/* Badge & Reading Time Row */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4.5 h-4.5 rounded bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-black text-[9px] leading-none">
            TN
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            TODAY'S STORY
          </span>
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" /> {article.reading_time || 5}m
          </span>
        </div>

        {/* Title (Blue colored link styling matching Reference 1) */}
        <h3 className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline leading-snug line-clamp-2 mb-2">
          {article.title}
        </h3>

        {/* Footer Row */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {article.publish_date ? format(new Date(article.publish_date), "d MMM") : "Today"}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
            Read more <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
