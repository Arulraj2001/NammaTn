"use client";
import Image from "next/image";
import React, { useState, useMemo } from "react";
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
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";
import { isImagePrompt } from "@/lib/tntodayPosterGenerator";
import { mediaProvenanceLabel } from "@/lib/mediaProvenance";
import NumberedPagination from "@/components/common/NumberedPagination";
import { toCdnMediaUrl } from "@/lib/cdn";
import GraphicHeroCard from "@/components/ui/GraphicHeroCard";

const VALID_EDITORIAL_GRAPHICS = new Set([
  'agriculture', 'economy', 'education', 'environment', 'general',
  'governance', 'healthcare', 'india', 'infrastructure', 'social',
  'technology', 'transport', 'world'
]);

/**
 * Resolves clean 16:9 editorial imagery for TN Today articles.
 * Strictly guarantees zero broken images:
 * 1. Valid Cloudflare FLUX images on Supabase Storage CDN
 * 2. Valid static category graphic cards (/images/tntoday/{cat}.webp)
 * Replaces broken local paths, stock news scrapers, and prompts with crisp category graphic cards.
 */
export function resolveEditorialImage(article) {
  if (!article) return "/images/tntoday/general.webp";
  const cat = (article.category || "general").toLowerCase();
  const raw = (article.featured_image || "").trim();

  if (!raw || isImagePrompt(raw) || raw.includes("/api/og?")) {
    return `/images/tntoday/${cat}.webp`;
  }

  // Reject scraped stock newsroom feeds
  if (
    raw.includes("thgim.com") ||
    raw.includes("newindianexpress") ||
    raw.includes("dtnext") ||
    raw.includes("unsplash") ||
    raw.includes("pexels")
  ) {
    return `/images/tntoday/${cat}.webp`;
  }

  // If local /images/tntoday/ path, ensure it exists in static assets
  if (raw.startsWith("/images/tntoday/")) {
    const slug = raw.replace("/images/tntoday/", "").replace(".webp", "").toLowerCase();
    if (VALID_EDITORIAL_GRAPHICS.has(slug)) {
      return raw;
    }
    return `/images/tntoday/${cat}.webp`;
  }

  // If remote CDN URL (Supabase storage)
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return toCdnMediaUrl(raw);
  }

  return `/images/tntoday/${cat}.webp`;
}

// ─── Featured article hero card ───────────────────────────────────────────────
function FeaturedCard({ article }) {
  const { lang } = useLanguage();
  const cat = CATEGORIES.find(c => c.value === article.category);
  const displayTitle = (lang === "ta" && article.title_ta) ? article.title_ta : article.title;
  const displaySubtitle = (lang === "ta" && article.subtitle_ta) ? article.subtitle_ta : article.subtitle;
  const categoryLabel = (lang === "ta" && cat?.label_ta) ? cat.label_ta : (cat?.label || "Special Report");

  return (
    <Link to={`/tn-today/${article.slug}`}
      className="block relative overflow-hidden rounded-3xl group shadow-lg hover:shadow-2xl transition-all border-2 border-slate-300 dark:border-slate-700 bg-slate-900">
      <GraphicHeroCard
        title={displayTitle}
        subtitle={displaySubtitle}
        category={article.category}
        tag={`${cat?.emoji || '📰'} ${categoryLabel}`}
        district={article.district_name || article.district_slug}
        variant="hero"
      />
    </Link>
  );
}

// ─── Article list card ────────────────────────────────────────────────────────
function ArticleCard({ article }) {
  const { lang } = useLanguage();
  const cat = CATEGORIES.find(c => c.value === article.category);
  const displayTitle = (lang === "ta" && article.title_ta) ? article.title_ta : article.title;
  const displaySubtitle = (lang === "ta" && article.subtitle_ta) ? article.subtitle_ta : article.subtitle;
  const categoryLabel = (lang === "ta" && cat?.label_ta) ? cat.label_ta : (cat?.label || "General");

  return (
    <Link to={`/tn-today/${article.slug}`}
      className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
      <div className="w-full sm:w-48 aspect-[16/9] sm:aspect-auto sm:h-28 rounded-xl overflow-hidden flex-shrink-0 relative">
        <GraphicHeroCard
          title={displayTitle}
          category={article.category}
          tag={categoryLabel}
          variant="card"
          className="h-full w-full"
        />
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
  const [currentPage, setCurrentPage] = useState(1);

  const activeCategory = CATEGORIES.find(c => c.value === currentCategory);

  usePageMeta({
    title: activeCategory ? `${activeCategory.label} | TN Today` : "TN Today - Tamil Nadu Community News & Journalism",
    description: "Daily verified community news, civic updates, scheme breakdowns, and deep dives across Tamil Nadu.",
    canonical: "https://vizhitn.in/tn-today",
  });

  const { data: featured } = useQuery({
    queryKey: ["tn-today-featured"],
    queryFn: getFeaturedTnToday,
    initialData: initialFeatured || undefined,
    staleTime: 0,
    gcTime: 30_000,
  });

  const PAGE_SIZE = 10;

  const {
    data: articles = [],
    isLoading,
  } = useQuery({
    queryKey: ["tn-today-articles", currentCategory ?? ""],
    queryFn: () => getPublishedTnToday({
      category: currentCategory || null,
      limit: 120,
    }),
    initialData: !currentCategory && initialArticles.length ? initialArticles : undefined,
    staleTime: 30_000,
    gcTime: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const filtered = useMemo(() => {
    return articles.filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title?.toLowerCase().includes(q) || a.subtitle?.toLowerCase().includes(q);
    });
  }, [articles, search]);

  const totalArticles = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedArticles = useMemo(() => {
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, startIndex]);

  return (
    <div id="tntoday-stories-top" className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
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
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search articles..."
              className="pl-9 pr-8 py-2 rounded-xl text-sm"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category filter pills ───────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link to="/tn-today"
            onClick={() => setCurrentPage(1)}
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
              onClick={() => setCurrentPage(1)}
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
              {paginatedArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Numbered Pagination (replaces Load More) */}
            <NumberedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalArticles}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setCurrentPage}
              scrollTargetId="tntoday-stories-top"
              itemLabel="stories"
            />
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
