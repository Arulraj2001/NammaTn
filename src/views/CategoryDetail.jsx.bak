"use client";
import React, { useState } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Newspaper, BookOpen, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryBySlug } from "@/lib/categories";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { getCategoryPosts } from "@/services/posts";
import { getPublishedTnToday } from "@/services/tnToday";
import { isPubliclyVisible } from "@/lib/visibility";
import { getCategoryStats } from "@/services/analytics";
import CategoryStatsPanel from "@/components/category/CategoryStatsPanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { injectFAQStructuredData } from "@/lib/seo";
import AdSlot from "@/components/ads/AdSlot";

const SORT_OPTIONS = [
  { value: "-created_date", en: "Newest", ta: "புதியவை" },
  { value: "-upvotes", en: "Most Voted", ta: "அதிக வாக்குகள்" },
];

export default function CategoryDetail({ initialSlug, initialData }) {
  const routeParams = useParams();
  const slug = initialSlug || routeParams.slug;
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const category = getCategoryBySlug(slug);
  const [sort, setSort] = useState("-created_date");

  const catName = category ? category.name_en : "Category";

  usePageMeta({
    title: category ? `${T(category.name_en, category.name_ta)} Civic Reports & Resolution SLA | VizhiTN` : "Category | VizhiTN",
    description: category ? `Explore community reports, standard resolution timelines, and official complaint helplines for ${category.name_en} across Tamil Nadu.` : "",
  });

  React.useEffect(() => {
    if (!category) return;

    const catFaqs = [
      {
        question: `What is the standard resolution time (SLA) for ${catName} complaints in Tamil Nadu?`,
        answer: `Municipal service level agreements typically target 24 to 48 hours for urgent outages or leaks, and 7 to 14 days for structural repairs.`
      },
      {
        question: `How can I file an official complaint for ${catName} issues?`,
        answer: `Log a civic receipt on VizhiTN to generate a pre-filled complaint template. You can copy it to submit directly to the CM Cell portal (1100) or local Municipal Corporation.`
      },
      {
        question: `How do citizens verify fixed ${catName} issues on VizhiTN?`,
        answer: `Residents upload 'after' proof photos or confirm resolution. Once 3+ citizens verify the fix, the receipt is marked Citizen Verified Fixed.`
      }
    ];

    injectFAQStructuredData(catFaqs, slug);
  }, [category, slug, catName]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["category-posts", slug],
    queryFn: () => getCategoryPosts(slug, 30),
    initialData: initialData?.posts,
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: tnTodayArticles = [] } = useQuery({
    queryKey: ["category-tn-today-news", slug],
    queryFn: () => getPublishedTnToday({ limit: 4, category: slug }),
    staleTime: 120_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["category-stats", slug],
    queryFn: () => getCategoryStats(slug),
    initialData: initialData?.stats,
    enabled: !!slug,
    staleTime: 120_000,
  });

  const sorted = [...posts].filter(isPubliclyVisible).sort((a, b) => {
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

      {/* Reciprocal Internal Links: TN Today News & Awareness Resources */}
      {tnTodayArticles.length > 0 && (
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                {T(`TN Today Reports in ${category.name_en}`, `${category.name_ta} பற்றிய TN Today செய்திகள்`)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {T(`In-depth journalism, state policy updates, and civic guides relating to ${category.name_en}`, `${category.name_en} தொடர்பான முக்கியமான செய்திகள் மற்றும் வழிகாட்டல்கள்`)}
              </p>
            </div>
            <Link to={`/tn-today/category/${slug}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              {T("View Category Stories", "அனைத்து கட்டுரைகளும்")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tnTodayArticles.slice(0, 4).map((article) => (
              <Link
                key={article.id}
                to={`/tn-today/${article.slug}`}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-mono block w-fit mb-2">
                    {article.category || "General"}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  {article.subtitle && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {article.subtitle}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Read Article</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Evergreen Category SLA Matrix & FAQs (SEO Powerhouse) */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            📋 {T(`${category.name_en} Resolution SLA & Escalation Guide`, `${category.name_en} தீர்வு காலக்கெடு மற்றும் புகார் வழிகாட்டி`)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T(`Standard civic resolution timelines and official department escalation channels in Tamil Nadu`, `தமிழ்நாடு மாநகராட்சி புகார் தீர்வு காலக்கெடு மற்றும் உதவி எண்கள்`)}
          </p>
        </div>

        {/* SLA Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">⏱️ Target Resolution SLA</span>
            <p className="text-slate-500 dark:text-slate-400">Emergency & Urgent Faults</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">24 – 48 Hours</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">🏛️ Level 1 Escalation</span>
            <p className="text-slate-500 dark:text-slate-400">Local Ward / Zonal Engineer</p>
            <p className="font-semibold text-blue-600 dark:text-blue-400">Municipal Corporation</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">🚀 Level 2 Escalation</span>
            <p className="text-slate-500 dark:text-slate-400">CM Special Cell Helpline</p>
            <p className="font-semibold text-purple-600 dark:text-purple-400">Toll-Free: 1100</p>
          </div>
        </div>

        {/* Category FAQs */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 text-xs">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
            ❓ Frequently Asked Questions about {category.name_en}
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 space-y-3 pt-1">
            <div className="pt-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">What is the standard resolution time (SLA) for {category.name_en} issues?</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Municipal service level agreements target 24 to 48 hours for emergency outages and leaks, and 7 to 14 days for structural work.
              </p>
            </div>
            <div className="pt-3">
              <p className="font-bold text-slate-800 dark:text-slate-200">How can I file an official complaint for {category.name_en}?</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Log a civic receipt on VizhiTN to generate a pre-filled complaint template ready for the CM Cell portal (1100) or local Corporation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
