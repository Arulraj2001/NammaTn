"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight } from "lucide-react";

const TOP_CATEGORIES = [
  { slug: "power-cut",    icon: "⚡", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800", iconBg: "bg-yellow-100 dark:bg-yellow-900/40", en: "Power Cuts",           ta: "மின் வெட்டு",       desc_en: "View outages near you",    desc_ta: "அருகில் மின் வெட்டு" },
  { slug: "water-supply", icon: "💧", bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800",    iconBg: "bg-blue-100 dark:bg-blue-900/40",    en: "Water Issues",         ta: "நீர் சிக்கல்",      desc_en: "Track disruptions",        desc_ta: "தடங்கல்கள் கண்காணி" },
  { slug: "road-issues",  icon: "🚧", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", iconBg: "bg-orange-100 dark:bg-orange-900/40", en: "Road Problems",       ta: "சாலை சிக்கல்",     desc_en: "Report & verify",          desc_ta: "புகார் & சரிபார்" },
  { slug: "scam-alert",   icon: "⚠️", bg: "bg-red-50 dark:bg-red-900/20",     border: "border-red-200 dark:border-red-800",     iconBg: "bg-red-100 dark:bg-red-900/40",     en: "Scam Alerts",          ta: "மோசடி எச்சரிக்கை", desc_en: "Stay protected",           desc_ta: "பாதுகாப்பாக இருங்கள்" },
  { slug: "offices",      icon: "🏛️", bg: "bg-teal-50 dark:bg-teal-900/20",   border: "border-teal-200 dark:border-teal-800",   iconBg: "bg-teal-100 dark:bg-teal-900/40",   en: "Government Services",  ta: "அரசு சேவைகள்",     desc_en: "Office info & more",       desc_ta: "அலுவலக தகவல்" },
  { slug: "stay",         icon: "🏠", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800", iconBg: "bg-purple-100 dark:bg-purple-900/40", en: "Stays & Rooms",       ta: "தங்குமிடம்",       desc_en: "Find verified stays",      desc_ta: "சரிபார்க்கப்பட்ட அறை" },
  { slug: "jobs",         icon: "💼", bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800",  iconBg: "bg-green-100 dark:bg-green-900/40",  en: "Local Jobs",           ta: "உள்ளூர் வேலை",     desc_en: "Community jobs",           desc_ta: "சமூக வேலைகள்" },
  { slug: "others",       icon: "···", bg: "bg-slate-50 dark:bg-slate-800",   border: "border-slate-200 dark:border-slate-700", iconBg: "bg-slate-200 dark:bg-slate-700",     en: "More",                 ta: "மேலும்",            desc_en: "All categories",           desc_ta: "அனைத்து வகைகள்" },
];

export default function TopCategories() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const getCategoryPath = (slug) => {
    switch (slug) {
      case "power-cut": return "/category/electricity";
      case "water-supply": return "/category/water-sanitation";
      case "road-issues": return "/category/road-infrastructure";
      case "scam-alert": return "/scams";
      case "offices": return "/offices";
      case "stay": return "/stay";
      case "jobs": return "/jobs";
      case "others": return "/explore";
      default: return `/category/${slug}`;
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {T("Top Categories", "முக்கிய வகைகள்")}
          </h2>
          <Link to="/explore" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {T("View all categories", "அனைத்து வகைகள்")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {TOP_CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={getCategoryPath(cat.slug)}>
              <div className={`${cat.bg} ${cat.border} border rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group h-full`}>
                <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center mx-auto mb-2 text-lg`}>
                  {cat.icon}
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-0.5">
                  {T(cat.en, cat.ta)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {T(cat.desc_en, cat.desc_ta)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
