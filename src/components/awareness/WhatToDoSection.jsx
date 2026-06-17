import React from "react";
import { Zap, Droplets, CreditCard, AlertTriangle, Ambulance, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const GUIDES = [
  {
    id: "power-cut",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    title_en: "Power Cut in your area",
    title_ta: "உங்கள் பகுதியில் மின் தடை",
  },
  {
    id: "water-supply",
    icon: Droplets,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    title_en: "Water Supply not available",
    title_ta: "குடிநீர் வழங்கல் இல்லை",
  },
  {
    id: "ration-card",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    title_en: "Ration Card not working",
    title_ta: "குடும்ப அட்டை சிக்கல்",
  },
  {
    id: "bribery",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    title_en: "Bribery at Government Office",
    title_ta: "அரசு அலுவலகத்தில் லஞ்சம்",
  },
  {
    id: "ambulance",
    icon: Ambulance,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    title_en: "Need Ambulance or Medical Help",
    title_ta: "ஆம்புலன்ஸ் அல்லது மருத்துவ உதவி",
  },
  {
    id: "scheme",
    icon: FileText,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    title_en: "Apply for a Government Scheme",
    title_ta: "அரசு திட்டத்திற்கு விண்ணப்பிக்க",
  },
];

export default function WhatToDoSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section id="guides" className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span>❓</span>
          {T("What to Do If...", "என்ன செய்ய வேண்டும்...")}
        </h2>
        <Link
          to="/awareness"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all guides", "அனைத்து வழிகாட்டிகள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Scrollable row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          const title = T(guide.title_en, guide.title_ta);
          return (
            <div
              key={guide.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${guide.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3 leading-snug line-clamp-3 flex-1">
                {title}
              </p>
              <button className="mt-auto text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors w-full justify-center">
                {T("View Guide", "வழிகாட்டி")} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
