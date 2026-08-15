"use client";
import React from "react";
import { HelpCircle, Share2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AwarenessFaqDetail({ faq }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  if (!faq) return <div className="min-h-screen flex items-center justify-center"><p>{T("FAQ not found", "FAQ கண்டறியப்படவில்லை")}</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{lang === "ta" ? faq.question_ta : faq.question_en}</h1>
              {faq.category_en && (
                <span className="inline-block bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-medium">{lang === "ta" ? faq.category_ta : faq.category_en}</span>
              )}
            </div>
          </div>
        </div>

        {/* Answer */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("Answer", "பதில்")}</h2>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{lang === "ta" ? faq.answer_ta : faq.answer_en}</p>
        </div>

        {/* Related FAQs Hint */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {T("Find more FAQs and guides to help with other civic questions and procedures.", "மற்ற பொதுக் கேள்விகள் மற்றும் நடைமுறைகளுக்கு உதவ கூடுதல் FAQ மற்றும் வழிகாட்டல் கண்டுபிடிக்கவும்.")}
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
