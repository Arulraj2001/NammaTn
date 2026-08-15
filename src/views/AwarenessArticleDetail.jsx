"use client";

import React from "react";
import { BookOpen, Clock, Calendar, ArrowLeft, Share2, Tag, ExternalLink } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

export default function AwarenessArticleDetail({ article }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {T("Article not found", "கட்டுரை கிடைக்கவில்லை")}
        </h2>
        <Link href="/awareness/articles" className="mt-4 inline-block text-sm text-emerald-600 font-semibold">
          ← {T("Back to Knowledge Articles", "கட்டுரைகள் பக்கத்திற்குத் திரும்பவும்")}
        </Link>
      </div>
    );
  }

  const contentText = T(article.content_en, article.content_ta) || "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { name: T("Awareness", "விழிப்புணர்வு"), href: "/awareness" },
            { name: T("Articles", "கட்டுரைகள்"), href: "/awareness/articles" },
            { name: T(article.title_en, article.title_ta), href: `/awareness/article/${article.slug}` },
          ]}
        />

        <Link
          href="/awareness/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{T("Back to Articles", "கட்டுரைகள் பக்கத்திற்கு")}</span>
        </Link>

        <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              {T(article.category_en, article.category_ta)}
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime || "5 min read"}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date || "Aug 15, 2026"}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {T(article.title_en, article.title_ta)}
          </h1>

          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-emerald-500">
            {T(article.summary_en, article.summary_ta)}
          </p>

          <div className="mt-8 prose prose-slate dark:prose-invert max-w-none space-y-4 text-slate-700 dark:text-slate-200 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {contentText}
          </div>
        </article>
      </div>
    </div>
  );
}
