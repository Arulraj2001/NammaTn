import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";

const getIcon = (name) => LucideIcons[name] || LucideIcons.Award;

const CATEGORY_BADGE_COLORS = {
  water: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  women: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  education: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  health: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  employment: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  housing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function getCategoryBadge(categoryEn) {
  const key = (categoryEn || "").toLowerCase();
  for (const [k, cls] of Object.entries(CATEGORY_BADGE_COLORS)) {
    if (key.includes(k)) return cls;
  }
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
}

export default function SchemesSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: schemes = [], isLoading } = useQuery({
    queryKey: ["awarenessSchemes"],
    queryFn: () => base44.entities.AwarenessScheme.filter({ is_active: true }, "sort_order"),
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-52 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          {T("Key Government Schemes", "முக்கிய அரசு திட்டங்கள்")}
        </h2>
        <Link
          to="/awareness/schemes"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all schemes", "அனைத்து திட்டங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {schemes.slice(0, 6).map((scheme) => {
          const Icon = getIcon(scheme.icon);
          const name = lang === "ta" ? scheme.name_ta || scheme.name_en : scheme.name_en;
          const category = lang === "ta" ? scheme.category_ta || scheme.category_en : scheme.category_en;
          const description = lang === "ta" ? scheme.description_ta || scheme.description_en : scheme.description_en;
          const badgeCls = getCategoryBadge(scheme.category_en);

          return (
            <div
              key={scheme.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5 ${badgeCls}`}>
                    {category}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">
                    {name}
                  </h3>
                </div>
              </div>

              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                  {description}
                </p>
              )}

              <div className="flex gap-2 mt-auto">
                {scheme.website_url && (
                  <a
                    href={scheme.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {T("Check Eligibility", "தகுதி சரிபார்")}
                  </a>
                )}
                {scheme.apply_url && (
                  <a
                    href={scheme.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {T("Apply Now", "விண்ணப்பிக்க")}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
