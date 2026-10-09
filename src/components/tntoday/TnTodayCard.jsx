import React, { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedTnToday } from "@/services/tnToday";
import { format } from "date-fns";
import { X, ArrowRight, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateTnTodayPoster, isImagePrompt } from "@/lib/tntodayPosterGenerator";

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

const AUTO_CLOSE_MS = 5000;

export default function TnTodayCard({ className }) {
  const { data: article, isLoading } = useQuery({
    queryKey: ["tn-today-featured"],
    queryFn: getFeaturedTnToday,
    staleTime: 300_000,
  });

  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(AUTO_CLOSE_MS);
  const [hasManuallyInteracted, setHasManuallyInteracted] = useState(false);
  const [posterSrc, setPosterSrc] = useState("");

  // Check session storage on client mount
  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem("vizhitn_tn_today_dismissed") === "true") {
        setIsDismissed(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Compute poster image
  useEffect(() => {
    if (article) {
      const rawImg = (article.featured_image || "").trim();
      if (!rawImg || isImagePrompt(rawImg)) {
        setPosterSrc(generateTnTodayPoster({
          title: article.title,
          category: article.category,
          subtitle: article.subtitle || article.summary || ""
        }));
      } else {
        setPosterSrc(rawImg);
      }
    }
  }, [article]);

  // Timed auto-collapse logic (runs once on load, pauses on hover)
  useEffect(() => {
    if (!mounted || !article || !isExpanded || isPaused || isDismissed || hasManuallyInteracted) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          setIsExpanded(false);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [mounted, article, isExpanded, isPaused, isDismissed, hasManuallyInteracted]);

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem("vizhitn_tn_today_dismissed", "true");
    } catch {
      // Ignore storage error
    }
  };

  const handleMinimize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHasManuallyInteracted(true);
    setIsExpanded(false);
  };

  const handleExpand = () => {
    setHasManuallyInteracted(true);
    setIsExpanded(true);
  };

  // Don't render if not mounted, dismissed, loading, or no article
  if (!mounted || isDismissed || isLoading || !article) {
    return null;
  }

  const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general;

  return (
    <aside
      aria-label="Today's featured story"
      className={cn(
        "fixed top-24 right-3 sm:right-6 z-40 max-w-[calc(100vw-24px)] pointer-events-auto",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          /* --- EXPANDED CARD STATE --- */
          <motion.div
            key="expanded"
            layout
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="w-[280px] sm:w-[310px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative text-left"
          >
            {/* Top Auto-Collapse Countdown Bar */}
            {timeLeft > 0 && !hasManuallyInteracted && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 z-30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-100 ease-linear"
                  style={{ width: `${(timeLeft / AUTO_CLOSE_MS) * 100}%` }}
                />
              </div>
            )}

            {/* Quick Action Buttons (Minimize & Dismiss) */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-30">
              <button
                type="button"
                onClick={handleMinimize}
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all touch-manipulation before:absolute before:inset-[-6px] before:content-['']"
                title="Minimize to top-right pill"
                aria-label="Minimize today's story"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all touch-manipulation before:absolute before:inset-[-6px] before:content-['']"
                title="Dismiss from homepage"
                aria-label="Dismiss today's story"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clickable Card Body */}
            <Link
              to={`/tn-today/${article.slug}`}
              className="block group"
            >
              {/* Featured Header Image */}
              <div className="relative h-28 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {posterSrc ? (
                  <img
                    src={posterSrc}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-2.5">
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm capitalize border", catColor)}>
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-3.5 pt-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="bg-blue-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded leading-none">
                    TN
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    TODAY'S STORY
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {article.reading_time || 4}m read
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-2.5">
                  {article.title}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    {article.publish_date ? format(new Date(article.publish_date), "d MMM") : "Today"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                    Read Story <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ) : (
          /* --- COLLAPSED STICKY PILL STATE --- */
          <motion.div
            key="collapsed"
            layout
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={handleExpand}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleExpand(); }}
            aria-label="Open today's story"
            className="flex items-center min-h-[44px] gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl rounded-full pl-3 pr-2 py-1.5 transition-all cursor-pointer group hover:border-blue-500/60 touch-manipulation"
          >
            {/* Live Indicator Dot + Badge */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded leading-none">
                TN TODAY
              </span>
            </div>

            {/* Truncated Headline Snippet */}
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 max-w-[140px] sm:max-w-[200px] truncate transition-colors">
              {article.title}
            </span>

            {/* Chevron to indicate it can expand */}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />

            {/* Direct Close / Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="relative flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0 ml-0.5 touch-manipulation before:absolute before:inset-[-6px] before:content-['']"
              title="Dismiss"
              aria-label="Dismiss today's story"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
