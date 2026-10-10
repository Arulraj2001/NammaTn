"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getPublishedTnToday, getFeaturedTnToday } from "@/services/tnToday";
import { generateTnTodayPoster, isImagePrompt } from "@/lib/tntodayPosterGenerator";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_TAG_COLORS = {
  infrastructure: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
  water:          "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/40",
  electricity:    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
  education:      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
  healthcare:     "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",
  governance:     "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40",
  transport:      "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/40",
  general:        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

function resolveCoverImage(article) {
  if (!article) return "";
  const rawImg = (article.featured_image || "").trim();
  if (!rawImg || isImagePrompt(rawImg)) {
    return generateTnTodayPoster({
      title: article.title,
      category: article.category,
      subtitle: article.subtitle || article.summary || "",
    });
  }
  return rawImg;
}

export default function TnTodaySpotlight() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" && ta ? ta : en);

  const { data: featured } = useQuery({
    queryKey: ["home-tntoday-featured"],
    queryFn: getFeaturedTnToday,
    staleTime: 300_000,
  });

  const { data: recentArticles = [], isLoading } = useQuery({
    queryKey: ["home-tntoday-recent"],
    queryFn: () => getPublishedTnToday({ limit: 5 }),
    staleTime: 300_000,
  });

  // Pick lead story (featured if available, else first recent article)
  const lead = featured || recentArticles[0];
  // Pick remaining 3 stories for the side list
  const sideStories = recentArticles.filter((a) => !lead || a.id !== lead.id).slice(0, 3);

  if (isLoading && recentArticles.length === 0) {
    return (
      <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!lead) return null;

  const leadImage = resolveCoverImage(lead);
  const leadTitle = T(lead.title, lead.title_ta);
  const leadSummary = T(lead.summary || lead.subtitle, lead.summary_ta || lead.subtitle_ta);
  const leadCategory = lead.category || "governance";
  const leadTimeAgo = lead.publish_date
    ? formatDistanceToNow(new Date(lead.publish_date), { addSuffix: true })
    : "";

  return (
    <section className="py-12 bg-white dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{T("TN Today Newsroom", "டிஎன் டுடே சிறப்புச் செய்திகள்")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {T("State Development & Civic Insights", "தமிழ்நாடு வளர்ச்சி & ஆளுகை சிறப்பு பார்வை")}
            </h2>
          </div>
          <Link
            to="/tn-today"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex-shrink-0 group"
          >
            <span>{T("Explore all stories", "அனைத்து செய்திகளையும் பார்க்க")}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 2-Column Responsive Magazine Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main / Lead Story (7 cols on desktop) */}
          <article className="lg:col-span-7 flex flex-col justify-between bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
            <Link to={`/tn-today/${lead.slug}`} className="block relative overflow-hidden aspect-[16/9] sm:aspect-[21/10] bg-slate-800">
              {leadImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={leadImage}
                  alt={leadTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-900 to-indigo-950 text-white/40">
                  <BookOpen className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm backdrop-blur-md uppercase tracking-wider ${
                    CATEGORY_TAG_COLORS[leadCategory] || CATEGORY_TAG_COLORS.general
                  }`}
                >
                  {leadCategory}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-sm flex items-center gap-1">
                  ★ {T("Lead Story", "முக்கிய செய்தி")}
                </span>
              </div>
            </Link>

            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                  {leadTimeAgo && <span>{leadTimeAgo}</span>}
                  {lead.reading_time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {lead.reading_time} {T("min read", "நிமி வாசிப்பு")}
                    </span>
                  )}
                  {lead.author_name && (
                    <span className="hidden sm:inline">• {lead.author_name}</span>
                  )}
                </div>

                <Link to={`/tn-today/${lead.slug}`}>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-3">
                    {leadTitle}
                  </h3>
                </Link>

                {leadSummary && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {leadSummary}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <Link
                  to={`/tn-today/${lead.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-blue-600 dark:text-blue-400 group-hover:underline"
                >
                  <span>{T("Read Full Analysis", "முழு ஆய்வை வாசிக்க")}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <span className="text-xs text-slate-400">VizhiTN Editorial</span>
              </div>
            </div>
          </article>

          {/* 3 Side Editorial Briefs (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {sideStories.map((item) => {
              const itemTitle = T(item.title, item.title_ta);
              const itemCat = item.category || "general";
              const itemImage = resolveCoverImage(item);
              const timeAgo = item.publish_date
                ? formatDistanceToNow(new Date(item.publish_date), { addSuffix: true })
                : "";

              return (
                <article
                  key={item.id}
                  className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400/40 dark:hover:border-blue-600/40 transition-all flex gap-4 items-center group"
                >
                  <Link
                    to={`/tn-today/${item.slug}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 relative"
                  >
                    {itemImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={itemImage}
                        alt={itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          CATEGORY_TAG_COLORS[itemCat] || CATEGORY_TAG_COLORS.general
                        }`}
                      >
                        {itemCat}
                      </span>
                      {timeAgo && (
                        <span className="text-[11px] text-slate-400">{timeAgo}</span>
                      )}
                    </div>

                    <Link to={`/tn-today/${item.slug}`}>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-1.5">
                        {itemTitle}
                      </h4>
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.reading_time && (
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" /> {item.reading_time}m read
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Quick Browse Categories Strip */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {T("Looking for district-specific reporting?", "மாவட்ட ரீதியான செய்திகள் வேண்டுமா?")}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {T("Covering infrastructure, healthcare, water & policy", "உள்கட்டமைப்பு, சுகாதாரம் மற்றும் அரசு திட்டங்கள்")}
                </p>
              </div>
              <Link
                to="/tn-today"
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              >
                {T("View All", "பார்க்க")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
