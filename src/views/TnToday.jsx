"use client";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublishedTnToday, getFeaturedTnToday } from "@/services/tnToday";
import { format } from "date-fns";
import { Clock, Calendar, ArrowRight, BookOpen, Search, X, Tag } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { value: "", label: "All Topics", emoji: "📰" },
  { value: "infrastructure", label: "Infrastructure", emoji: "🏗️", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  { value: "education",      label: "Education",      emoji: "🎓", color: "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
  { value: "healthcare",     label: "Healthcare",     emoji: "🏥", color: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
  { value: "environment",    label: "Environment",    emoji: "🌿", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
  { value: "economy",        label: "Economy",        emoji: "💰", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
  { value: "governance",     label: "Governance",     emoji: "🏛️", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
  { value: "transport",      label: "Transport",      emoji: "🚌", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
  { value: "agriculture",    label: "Agriculture",    emoji: "🌾", color: "text-lime-600 bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800" },
  { value: "technology",     label: "Technology",     emoji: "💻", color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800" },
  { value: "social",         label: "Social",         emoji: "👥", color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800" },
  { value: "general",        label: "General",        emoji: "📋", color: "text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
];

// ─── Featured article hero card ───────────────────────────────────────────────
function FeaturedCard({ article }) {
  const cat = CATEGORIES.find(c => c.value === article.category);
  return (
    <Link to={`/tn-today/${article.slug}`}
      className="block relative overflow-hidden rounded-2xl group shadow-lg hover:shadow-xl transition-shadow">
      {article.featured_image ? (
        <>
          <img src={article.featured_image} alt={article.title}
            className="w-full h-[300px] sm:h-[400px] object-cover group-hover:scale-[1.01] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </>
      ) : (
        <div className="w-full h-[300px] sm:h-[400px] bg-gradient-to-br from-blue-700 to-blue-900" />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wide">
            📰 TN TODAY · TODAY'S STORY
          </span>
          {cat?.value && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30 uppercase">
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2 group-hover:text-blue-200 transition-colors">
          {article.title}
        </h2>
        {article.subtitle && (
          <p className="text-sm text-white/80 line-clamp-2 mb-3">{article.subtitle}</p>
        )}
        <div className="flex items-center gap-3 text-white/70 text-xs">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
            {article.publish_date ? format(new Date(article.publish_date), "d MMM yyyy") : "Today"}
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.reading_time || 5} min read</span>
          <span className="ml-auto flex items-center gap-1 text-white font-semibold text-sm group-hover:gap-2 transition-all">
            Read Full Story <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Article list card ────────────────────────────────────────────────────────
function ArticleCard({ article }) {
  const cat = CATEGORIES.find(c => c.value === article.category);
  return (
    <Link to={`/tn-today/${article.slug}`}
      className="flex gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group">
      {article.featured_image ? (
        <img src={article.featured_image} alt={article.title}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity" />
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-900/60 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-7 h-7 text-blue-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          {cat?.value && (
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", cat.color)}>
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">{article.subtitle}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {article.publish_date && (
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />{format(new Date(article.publish_date), "d MMM yyyy")}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />{article.reading_time || 5} min
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
        {categoryLabel ? `No stories in ${categoryLabel} yet` : "No stories published yet"}
      </h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
        TN Today publishes one important Tamil Nadu story every day. Check back tomorrow for the next headline.
      </p>
    </div>
  );
}

// ─── Main Archive Page ────────────────────────────────────────────────────────
export default function TnToday() {
  const { category: routeCategory } = useParams();
  const [activeCategory, setActiveCategory] = useState(routeCategory || "");
  const [searchQ, setSearchQ] = useState("");

  const cat = CATEGORIES.find(c => c.value === activeCategory);

  usePageMeta({
    title: activeCategory
      ? `TN Today – ${cat?.label || ""} Stories | NammaTN`
      : "TN Today – Tamil Nadu's Daily Headline | NammaTN",
    description: "Read Tamil Nadu's most important civic stories, curated daily by the NammaTN editorial team.",
  });

  const { data: featured } = useQuery({
    queryKey: ["tn-today-featured"],
    queryFn: getFeaturedTnToday,
    staleTime: 300_000,
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["tn-today-archive", activeCategory],
    queryFn: () => getPublishedTnToday({ limit: 50, category: activeCategory || null }),
    staleTime: 300_000,
  });

  const filtered = articles.filter(a => {
    if (!searchQ) return true;
    return (
      a.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      a.subtitle?.toLowerCase().includes(searchQ.toLowerCase())
    );
  });

  // Latest story for featured if no explicit featured set
  const featuredArticle = featured || articles[0];
  const restArticles = filtered.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Editorial header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
                  <span className="text-white font-black text-xs">TN</span>
                </div>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">TN TODAY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Tamil Nadu's Daily Headline
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
                One story a day. What matters most in Tamil Nadu, explained for citizens.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Published daily at 8:00 AM IST
              </div>
              <p className="text-xs text-slate-400">{articles.length} stories published</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ── Category filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setActiveCategory(c.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0",
                activeCategory === c.value
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300"
              )}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search TN Today stories..." className="pl-9 text-sm" />
          {searchQ && (
            <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-[380px] bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState categoryLabel={cat?.label} />
        ) : (
          <div className="space-y-4">
            {/* Featured hero card */}
            {!searchQ && !activeCategory && featuredArticle && (
              <FeaturedCard article={featuredArticle} />
            )}

            {/* Article list */}
            {restArticles.map(a => <ArticleCard key={a.id} article={a} />)}

            {/* Category empty fallback */}
            {restArticles.length === 0 && (activeCategory || searchQ) && (
              <EmptyState categoryLabel={cat?.label} />
            )}
          </div>
        )}

        {/* Archive navigation */}
        <div className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" /> Browse by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.value).map(c => (
              <button key={c.value} onClick={() => setActiveCategory(c.value)}
                className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all", c.color || "text-slate-600 bg-slate-50 border-slate-200")}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
