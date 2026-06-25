import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryBySlug } from "@/lib/categories";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { getCategoryPosts } from "@/services/posts";
import { getCategoryStats } from "@/services/analytics";
import CategoryStatsPanel from "@/components/category/CategoryStatsPanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import AdSlot from "@/components/ads/AdSlot";

const SORT_OPTIONS = [
  { value: "-created_date", en: "Newest", ta: "புதியவை" },
  { value: "-upvotes", en: "Most Voted", ta: "அதிக வாக்குகள்" },
];

export default function CategoryDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const category = getCategoryBySlug(slug);
  const [sort, setSort] = useState("-created_date");
  usePageMeta({
    title: category ? `${T(category.name_en, category.name_ta)} | VizhiTN` : "Category | VizhiTN",
    description: category ? `Browse community posts in the ${category.name_en} category across Tamil Nadu.` : "",
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["category-posts", slug],
    queryFn: () => getCategoryPosts(slug, 30),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["category-stats", slug],
    queryFn: () => getCategoryStats(slug),
    enabled: !!slug,
    staleTime: 120_000,
  });

  const sorted = [...posts].sort((a, b) => {
    if (sort === "-upvotes") return (b.upvotes || 0) - (a.upvotes || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">{T("Category not found.", "வகை கண்டுபிடிக்கப்படவில்லை.")}</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">{T("← Home", "← முகப்பு")}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {T("Home", "முகப்பு")}
      </Link>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 mb-8 flex items-center gap-4">
        <div className="text-4xl">{category.icon}</div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {T(category.name_en, category.name_ta)}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {posts.length} {T("posts in this category", "இந்த வகையில் பதிவுகள்")}
          </p>
        </div>
      </div>

      <CategoryStatsPanel stats={stats} lang={lang} />
      <AdSlot placement="category" className="mb-4" />

      {/* Sort */}
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">{sorted.length} {T("results", "முடிவுகள்")}</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                sort === s.value ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {T(s.en, s.ta)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">{category.icon}</div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">{T("No posts in this category yet.", "இந்த வகையில் இன்னும் பதிவுகள் இல்லை.")}</p>
          <Link to="/create" className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            {T("Share the first post", "முதல் பதிவை பகிரவும்")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}