import React from "react";
import { Zap, Droplets, CreditCard, Ambulance, FileText, ArrowRight, ShieldAlert, Home } from "lucide-react";
import Link from "next/link";
import { getAllGuides } from "@/lib/awarenessServer";

const ICON_MAP = {
  "power-cut": Zap,
  "water-supply": Droplets,
  "ration-card": CreditCard,
  "medical-emergency": Ambulance,
  "cyber-fraud": ShieldAlert,
  "property-tax": Home,
  "patta-chitta": FileText,
};

const COLOR_MAP = {
  "power-cut": "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  "water-supply": "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
  "ration-card": "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  "medical-emergency": "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  "cyber-fraud": "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  "property-tax": "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  "patta-chitta": "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
};

export default function WhatToDoSection({ lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const guides = getAllGuides().slice(0, 6);

  return (
    <section id="guides" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-civic-900 dark:text-white flex items-center gap-1.5">
            <span>❓</span>
            {T("What to Do If... (Civic Problem SOPs)", "என்ன செய்ய வேண்டும்... (தீர்வுகள்)")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T("Verified Standard Operating Procedures & phone call scripts", "மின்சாரம், குடிநீர், ரேஷன் மற்றும் லஞ்சப் புகார்களுக்கான உடனடி வழிகாட்டிகள்")}
          </p>
        </div>
        <Link
          href="/awareness/guides"
          className="text-xs text-civic-600 dark:text-civic-300 hover:text-civic-800 dark:hover:text-white hover:underline flex items-center gap-1 font-bold flex-shrink-0"
        >
          {T("View all guides", "அனைத்து வழிகாட்டிகள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {guides.map((guide) => {
          const Icon = ICON_MAP[guide.slug] || FileText;
          const colorClass = COLOR_MAP[guide.slug] || "bg-civic-100 text-civic-600";
          const title = T(guide.title_en, guide.title_ta);

          return (
            <Link
              key={guide.slug}
              href={`/awareness/guide/${guide.slug}`}
              className="bg-white dark:bg-[#0D2B52] border-2 border-civic-200 dark:border-civic-800 hover:border-civic-500 rounded-2xl p-4 hover:shadow-md transition-all flex flex-col items-center text-center group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${colorClass} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-civic-900 dark:text-white group-hover:text-civic-600 dark:group-hover:text-civic-300 mb-2 leading-snug line-clamp-2 flex-1">
                {title}
              </p>
              <span className="text-[11px] text-civic-600 dark:text-civic-300 group-hover:text-civic-800 group-hover:underline flex items-center gap-0.5 font-bold mt-auto">
                {T("View SOP", "வழிகாட்டி")} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
