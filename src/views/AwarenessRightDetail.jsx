"use client";

import React from "react";
import { Shield, FileText, Building, CheckCircle2, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import FormattedArticleContent from "@/components/awareness/FormattedArticleContent";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessRightDetail({ right }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  if (!right) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {T("Right detail not found", "விவரங்கள் கிடைக்கவில்லை")}
        </h2>
        <Link href="/awareness/rights" className="mt-4 inline-block text-sm text-blue-600 font-semibold">
          ← {T("Back to Citizen Rights", "குடிமக்கள் உரிமைகளுக்குத் திரும்பவும்")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <AwarenessSubNav activePath="/awareness/rights" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/awareness/rights"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{T("Back to Citizen Rights", "குடிமக்கள் உரிமைகள் பக்கத்திற்கு")}</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {T("Statutory Right", "சட்டப்பூர்வ உரிமை")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {T(right.name_en, right.name_ta)}
              </h1>
            </div>
          </div>

          <p className="mt-6 text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {T(right.desc_en, right.desc_ta)}
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                {T("Detailed Statutory Overview", "சட்டப்பூர்வ விரிவான விளக்கம்")}
              </h3>
              <div className="mt-2">
                <FormattedArticleContent content={T(right.content_en, right.content_ta)} />
              </div>
            </div>

            {right.key_points_en && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {T("Key Provisions & Rules", "முக்கிய சட்ட விதிகள்")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(lang === "ta" ? right.key_points_ta : right.key_points_en).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                {T("Responsible Department", "பொறுப்பான துறை")}: <strong className="text-slate-800 dark:text-slate-200">{T(right.department_en, right.department_ta)}</strong>
              </span>
              {right.portal_url && (
                <a
                  href={right.portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                >
                  <span>{T("Open Government Portal", "அரசு தளம் திற")}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="right-detail" />
      </div>
    </div>
  );
}
