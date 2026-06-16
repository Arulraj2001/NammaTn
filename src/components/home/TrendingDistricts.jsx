import React from "react";
import { Link } from "react-router-dom";
import { MapPin, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/districts";

const FEATURED = ["chennai", "coimbatore", "madurai", "tiruchirappalli", "salem", "vellore", "erode", "thanjavur"];

export default function TrendingDistricts() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const featured = DISTRICTS.filter((d) => FEATURED.includes(d.slug));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {T("Trending Districts", "பிரபலமான மாவட்டங்கள்")}
        </h2>
        <Link to="/districts" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
          {T("View all →", "அனைத்தையும் காண →")}
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {featured.map((district) => (
          <Link key={district.slug} to={`/district/${district.slug}`} className="flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 min-w-[120px] text-center group">
              <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-500 group-hover:text-blue-600" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {T(district.name_en, district.name_ta)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}