"use client";

import React from "react";
import { Droplets, Users, GraduationCap, Heart, Briefcase, Award, ArrowRight, ExternalLink, Sparkles, Coins } from "lucide-react";
import Link from "next/link";
import { getAllSchemes } from "@/lib/awarenessServer";

const CATEGORY_ICONS = {
  "Women Welfare": Users,
  "Education": GraduationCap,
  "Health": Heart,
  "Social Welfare": Award,
  "Employment": Briefcase,
};

const CATEGORY_COLORS = {
  "Women Welfare": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "Education": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "Health": "bg-red-500/10 text-red-600 dark:text-red-400",
  "Social Welfare": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Employment": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export default function SchemesSection({ lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const schemes = getAllSchemes().slice(0, 6);

  return (
    <section id="schemes" className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="text-amber-500">★</span>
            {T("Key Government Schemes (திட்டங்கள்)", "முக்கிய அரசு திட்டங்கள்")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T("Direct benefit transfers, healthcare, and welfare assistance in Tamil Nadu", "தமிழ்நாட்டின் நேரடி நிதி உதவி, இலவச மருத்துவம் மற்றும் நலத்திட்டங்கள்")}
          </p>
        </div>
        <Link
          href="/schemes"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 flex-shrink-0"
        >
          {T("View all schemes", "அனைத்து திட்டங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {schemes.map((scheme) => {
          const Icon = CATEGORY_ICONS[scheme.category_en] || Award;
          const iconBg = CATEGORY_COLORS[scheme.category_en] || "bg-indigo-500/10 text-indigo-600";
          const name = T(scheme.name_en, scheme.name_ta);
          const dept = T(scheme.department_en, scheme.department_ta);
          const benefit = T(
            scheme.financial_benefit_en || scheme.benefits_en,
            scheme.financial_benefit_ta || scheme.benefits_ta
          );

          return (
            <article
              key={scheme.slug}
              className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {scheme.category_en}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  <Link href={`/schemes/${scheme.slug}`}>
                    {name}
                  </Link>
                </h3>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                  {dept}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 line-clamp-1">
                    {benefit}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {scheme.documents_required_en?.length || 4} {T("docs required", "ஆவணங்கள்")}
                </span>

                <Link
                  href={`/schemes/${scheme.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>{T("Check Eligibility", "தகுதி விவரம்")}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
