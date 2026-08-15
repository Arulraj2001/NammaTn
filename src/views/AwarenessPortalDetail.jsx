"use client";
import React from "react";
import { Globe, ExternalLink, Share2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AwarenessPortalDetail({ portal }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  if (!portal) return <div className="min-h-screen flex items-center justify-center"><p>{T("Portal not found", "இணையதளம் கண்டறியப்படவில்லை")}</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{lang === "ta" ? portal.name_ta : portal.name_en}</h1>
              {portal.category_en && (
                <span className="inline-block bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 px-3 py-1 rounded-full text-xs font-medium">{lang === "ta" ? portal.category_ta : portal.category_en}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {portal.description_en && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("About", "பற்றி")}</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{lang === "ta" ? portal.description_ta : portal.description_en}</p>
          </div>
        )}

        {/* Portal Link */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-400 mb-4">
            <ExternalLink className="w-5 h-5" />
            {T("Visit Portal", "இணையதளத்தைப் பார்க்கவும்")}
          </h3>
          <a href={portal.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center break-all">
            {portal.url}
          </a>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            ℹ️ {T("This is an official government portal. Always verify the URL before entering personal information.", "இது ஒரு அரசு அதிகாரப்பூர்வ வலைத்தளம். ব்যক্তிগত தகவல் உள்ளிடுமுன் URL ஐ சரிபார்க்கவும்.")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
            <Share2 className="w-4 h-4" />
            {T("Share", "பகிர்")}
          </button>
        </div>
      </div>
    </div>
  );
}
