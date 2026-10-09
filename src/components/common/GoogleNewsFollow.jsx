"use client";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * GoogleNewsFollow Component
 * Strategic Discover accelerator: encourages readers to "Follow" VizhiTN in Google News,
 * heavily amplifying Chrome Discover push velocity for subsequent articles.
 */
export default function GoogleNewsFollow({ className = "" }) {
  const { language } = useLanguage();
  const isTa = language === "ta";

  const googleNewsUrl = "https://news.google.com/publications/CAowlufHDA";

  return (
    <a
      href={googleNewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Official Google News stylized icon */}
        <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            {/* Google News multi-colored folded newspaper badge */}
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" fill="#F8F9FA" />
            <path d="M18 7H6v3h12V7z" fill="#4285F4" />
            <path d="M11 12H6v5h5v-5z" fill="#EA4335" />
            <path d="M18 12h-5v2h5v-2z" fill="#FBBC05" />
            <path d="M18 15h-5v2h5v-2z" fill="#34A853" />
          </svg>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Google News
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Official
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
            {isTa ? "Google News-ல் VizhiTN-ஐ பின்தொடரவும்" : "Follow VizhiTN on Google News"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {isTa ? "முக்கிய செய்திகள் உடனுக்குடன் பெற" : "Get breaking stories directly on your feed"}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 dark:hover:text-white text-xs font-bold transition-all shadow-xs group-hover:scale-105">
          <span>+ {isTa ? "பின்தொடர்" : "Follow"}</span>
        </span>
      </div>
    </a>
  );
}
