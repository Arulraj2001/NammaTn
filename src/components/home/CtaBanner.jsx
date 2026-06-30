"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { Users, CheckCircle, ArrowRight } from "lucide-react";

export default function CtaBanner() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  return (
    <section className="bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          {/* Left */}
          <div className="flex items-center gap-4">
            {/* Icon cluster */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight mb-1">
                {T("Together, we can build a better Tamil Nadu", "சேர்ந்து, சிறந்த தமிழ்நாட்டை கட்டலாம்")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {T("Report. Verify. Resolve. That's the VizhiTN way.", "புகாரிடு. சரிபார். தீர். அதுவே VizhiTN வழி.")}
              </p>
            </div>
          </div>
          {/* Right CTA */}
          <Link to="/create" className="flex-shrink-0">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md whitespace-nowrap">
              {T("Log an Issue Now", "இப்போதே சிக்கல் பதிவிடு")} <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
