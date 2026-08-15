"use client";
import React, { useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { getPublishedTnToday, getFeaturedTnToday } from "@/services/tnToday";
import { format } from "date-fns";
import { Clock, Calendar, ArrowRight, BookOpen, Search, X, Tag } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TN_TODAY_CATEGORIES as CATEGORIES } from '@/lib/tnTodayCategories';
import { useLanguage } from "@/context/LanguageContext";

// ─── Featured article hero card ───────────────────────────────────────────────
function FeaturedCard({ article }) {
  const { lang } = useLanguage();
  const cat = CATEGORIES.find(c => c.value === article.category);
  const displayTitle = (lang === "ta" && article.title_ta) ? article.title_ta : article.title;
  const displaySubtitle = (lang === "ta" && article.subtitle_ta) ? article.subtitle_ta : article.subtitle;

  return (
    <Link to={`/tn-today/${article.slug}`}
      className="block relative overflow-hidden rounded-2xl group shadow-lg hover:shadow-xl transition-shadow border-2 border-slate-300 dark:border-slate-700">
      {article.featured_image ? (
        <>
          <img src={article.featured_image} alt={displayTitle}
            className="w-full h-[300px] sm:h-[400px] object-cover group-hover:scale-[1.01] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </>
      ) : (
        <div className="w-full h-[300px] sm:h-[400px] bg-gradient-to-br from-blue-700 to-blue-900" />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wide shadow-sm">
            📰 TN TODAY · {lang === "ta" ? "இன்றைய செய்தி" : "TODAY'S STORY"}
          </span>
          {cat?.value && (
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30 uppercase">
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2 group-hover:text-blue-200 transition-colors">
          {displayTitle}
        </h2>
        {displaySubtitle && (
          <p className="text-sm text-white/90 font-medium line-clamp-2 mb-3">{displaySubtitle}</p>
        )}
        <div className="flex items-center gap-3 text-white/80 text-xs font-bold">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-300" />
            {article.publish_date ? format(new Date(article.publish_date), "d MMM yyyy") : "Today"}
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-300" />{article.reading_time || 5} min read</span>
          <span className="ml-auto flex items-center gap-1 text-white font-extrabold text-sm group-hover:gap-2 transition-all">
            {lang === "ta" ? "முழு கதை வாசியுங்கள்" : "Read Full Story"} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Article list card ────────────────────────────────────────────────────────
function ArticleCard({ article }) {
  const { lang } = useLanguage();
  const cat = CATEGORIES.find(c => c.value === article.category);
  const displayTitle = (lang === "ta" && article.title_ta) ? article.title_ta : article.title;
  const displaySubtitle = (lang === "ta" && article.subtitle_ta) ? article.subtitle_ta : article.subtitle;

  return (
    <Link to={`/tn-today/${article.slug}`}
      className="flex gap-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group">
      {article.featured_image ? (
        <img src={article.featured_image} alt={displayTitle}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-900/60 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-7 h-7 text-blue-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          {cat?.value && (
            <span className={cn("text-xs font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs", cat.color)}>
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5">
          {displayTitle}
        </h3>
        {displaySubtitle && (
          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2 font-medium">{displaySubtitle}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-bold">
          {article.publish_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />{format(new Date(article.publish_date), "d MMM yyyy")}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />{article.reading_time || 5} min
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ categoryLabel }) {
  return (
    <div className="text-center py-16 px-4">
      <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
        No articles published yet
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        {categoryLabel ? `No articles under "${categoryLabel}".` : "Check back soon for fresh community journalism and guides."}
      </p>
    </div>
  );
}

export default function TnToday({ initialArticles = [], initialFeatured = null }) {
  const { category: currentCategory } = useParams();
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  const activeCategory = CATEGORIES.find(c => c.value === currentCategory);

  usePageMeta({
    title: activeCategory ? `${activeCategory.label} | TN Today` : "TN Today - Tamil Nadu Community News & Journalism",
    description: "Daily verified community news, civic updates, scheme breakdowns, and deep dives across Tamil Nadu.",
    canonical: "https://www.vizhitn.in/tn-today",
  });

  const { data: featured } = useQuery({
    queryKey: ["tn-today-featured"],
    queryFn: getFeaturedTnToday,
    initialData: initialFeatured || undefined,
    staleTime: 0,
    gcTime: 30_000,
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["tn-today-articles", currentCategory ?? ""],
    queryFn: () => getPublishedTnToday(currentCategory || null),
    initialData: !currentCategory ? (initialArticles.length ? initialArticles : undefined) : undefined,
    staleTime: 0,
    gcTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const filtered = articles.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.title?.toLowerCase().includes(q) || a.subtitle?.toLowerCase().includes(q);
  });

  // Reset visible count when category or search changes
  React.useEffect(() => { setVisibleCount(10); }, [currentCategory, search]);

  const displayedArticles = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              VizhiTN Public Journalism
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {activeCategory ? `${activeCategory.emoji} ${activeCategory.label}` : "📰 TN Today"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Verified community news, citizen stories, and public service journalism for Tamil Nadu.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="pl-9 pr-8 py-2 rounded-xl text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category filter pills ───────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link to="/tn-today"
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border-2",
              !currentCategory
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500"
            )}>
            <Tag className="w-3.5 h-3.5 text-blue-500" /> All Stories
          </Link>
          {CATEGORIES.filter(cat => cat.value).map(cat => (
            <Link key={cat.value} to={`/tn-today/category/${cat.value}`}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border-2",
                currentCategory === cat.value
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500"
              )}>
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Featured Hero (only on main /tn-today page when no search filter) ── */}
        {!currentCategory && !search && featured && (
          <FeaturedCard article={featured} />
        )}

        {/* ── Articles Grid ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load More Pagination */}
            {filtered.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2"
                >
                  <span>Load More Stories ({filtered.length - visibleCount} remaining)</span>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState categoryLabel={activeCategory?.label} />
        )}

      </div>
    </div>
  );
}
