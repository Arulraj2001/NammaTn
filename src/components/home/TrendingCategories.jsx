import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/categories";

export default function TrendingCategories() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        {T("Browse by Category", "வகையால் உலாவுக")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} to={`/category/${cat.slug}`}>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {T(cat.name_en, cat.name_ta)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}