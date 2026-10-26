"use client";

import React, { useRef } from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/districts";
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function DistrictQuickStrip() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white dark:bg-[#071E3D] border-b border-civic-200 dark:border-civic-800 py-3 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Label */}
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-100 flex-shrink-0 pr-1 border-r border-slate-200 dark:border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{T("Quick District Feeds:", "மாவட்ட வாரியாக:")}</span>
            <span className="sm:hidden">{T("Districts:", "மாவட்டம்:")}</span>
          </div>

          {/* Scroll Buttons for Desktop */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="hidden sm:flex w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Horizontally scrollable pills strip */}
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
          >
            {DISTRICTS.map((d) => (
              <Link
                key={d.slug}
                to={`/${d.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#0D2B52] hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all flex-shrink-0 whitespace-nowrap active:scale-95"
              >
                <span>{lang === "ta" ? d.name_ta : d.name_en}</span>
              </Link>
            ))}

            <Link
              to="/districts"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all flex-shrink-0 whitespace-nowrap"
            >
              <span>{T("All 38 Districts", "38 மாவட்டங்கள்")}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="hidden sm:flex w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
