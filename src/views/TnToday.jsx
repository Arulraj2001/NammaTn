"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getPublishedTnToday, getFeaturedTnToday } from "@/services/tnToday";
import { format } from "date-fns";
import { Clock, Calendar, ArrowRight, BookOpen, Search, X, Tag } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TN_TODAY_CATEGORIES as CATEGORIES } from '@/lib/tnTodayCategories';
import { useLanguage } from "@/context/LanguageContext";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";
import { isImagePrompt } from "@/lib/tntodayPosterGenerator";

/**
 * Resolves clean 16:9 editorial imagery for TN Today articles.
 * Replaces legacy broken /api/og? civic images and prompt text with Discover-ready category banners.
 */
export function resolveEditorialImage(article) {
  if (!article) return "/images/tntoday/general.webp";
  const raw = (article.featured_image || "").trim();
  if (!raw || isImagePrompt(raw) || raw.includes("/api/og?")) {
    const cat = (article.category || "general").toLowerCase();
    return `/images/tntoday/${cat}.webp`;
  }
  return raw;
}

// ─── Featured article hero card ───────────────────────────────────────────────
function FeaturedCard({ article }) {
  const { lang } = useLanguage();
  const cat = CATEGORIES.find(c => c.value === article.category);
  const displayTitle = (lang === "ta" && article.title_ta) ? article.title_ta : article.title;
  const displaySubtitle = (lang === "ta" && article.subtitle_ta) ? article.subtitle_ta : article.subtitle;
  const imgSrc = resolveEditorialImage(article);
  const categoryLabel = (lang === "ta" && cat?.label_ta) ? cat.label_ta : (cat?.label || "Special Report");

  return (
    <Link to={`/tn-today/${article.slug}`}
      className="block relative overflow-hidden rounded-2xl group shadow-lg hover:shadow-2xl transition-all border-2 border-slate-300 dark:border-slate-700 bg-slate-900">
      <div className="w-full aspect-[16/9] max-h-[380px] sm:max-h-[440px] overflow-hidden relative">
        <Image src={imgSrc} alt={displayTitle} width={1200} height={675} unoptimized
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Top Floating Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-blue-600 text-white shadow-md flex items-center gap-1.5">
            {cat?.emoji || '📰'} {categoryLabel}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
            ● {lang === 'ta' ? 'சிறப்புக் கள ஆய்வு' : 'SPECIAL REPORT'}
          </span>
        </div>

        {/* Bottom Headline & Metadata Over Photo */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-7 z-10">
          <h2 className="font-black text-white text-lg sm:text-2xl md:text-3xl leading-snug line-clamp-2 drop-shadow-md mb-2 group-hover:text-blue-300 transition-colors">
            {displayTitle}
          </h2>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 mb-3.5 font-medium drop-shadow-sm">
              {displaySubtitle}
            </p>
          )}

          <div className="flex items-center gap-3 text-white/90 text-xs font-bold pt-2 border-t border-white/15">
            <span suppressHydrationWarning className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              {article.publish_date ? format(new Date(article.publish_date), "d MMM yyyy") : "Today"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {article.reading_time || 5} min read
            </span>
            <span className="ml-auto flex items-center gap-1 text-white font-extrabold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
              {lang === "ta" ? "முழுக் கதை வாசியுங்கள்" : "Read Full Story"} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
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
  const imgSrc = resolveEditorialImage(article);
  const categoryLabel = (lang === "ta" && cat?.label_ta) ? cat.label_ta : (cat?.label || "General");

  return (
    <Link to={`/tn-today/${article.slug}`}
      className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
      <div className="w-full sm:w-44 h-36 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-950">
        <Image src={imgSrc} alt={displayTitle} width={400} height={225} unoptimized
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
          {cat?.emoji} {categoryLabel}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5">
            {displayTitle}
          </h3>
          {displaySubtitle && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2 font-normal">
              {displaySubtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-bold pt-1">
          {article.publish_date && (
            <span suppressHydrationWarning className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />{format(new Date(article.publish_date), "d MMM yyyy")}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />{article.reading_time || 5} min read
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

  const PAGE_SIZE = 20;

  const {
    data: articlesData = { pages: [] },
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["tn-today-articles", currentCategory ?? ""],
    queryFn: ({ pageParam = 0 }) => getPublishedTnToday({
      category: currentCategory || null,
      limit: PAGE_SIZE,
      offset: pageParam,
    }),
    initialPageParam: 0,
    initialData: !currentCategory && initialArticles.length
      ? { pages: [initialArticles], pageParams: [0] }
      : undefined,
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    staleTime: 0,
    gcTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const articles = articlesData.pages.flat();

  const filtered = articles.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.title?.toLowerCase().includes(q) || a.subtitle?.toLowerCase().includes(q);
  });

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
              {filtered.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load More Pagination — fetches the next page from the database */}
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 font-extrabold px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all text-xs flex items-center gap-2"
                >
                  <span>{isFetchingNextPage ? "Loading more stories…" : "Load More Stories"}</span>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState categoryLabel={activeCategory?.label} />
        )}

        {/* Universal SEO Cross-Links */}
        <UniversalCrossLinks pageType="tn-today" />
      </div>
    </div>
  );
}
