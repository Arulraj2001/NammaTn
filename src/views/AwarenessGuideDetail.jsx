"use client";
import React from "react";
import { Phone, ExternalLink, FileText, BookOpen, Share2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AwarenessGuideDetail({ guide }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  if (!guide) return <div className="min-h-screen flex items-center justify-center"><p>{T("Guide not found", "வழிகாட்டுதல் கண்டறியப்படவில்லை")}</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{lang === "ta" ? guide.title_ta : guide.title_en}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{lang === "ta" ? guide.department_ta : guide.department_en}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        {guide.steps_en && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{T("Step-by-step guide", "படிப்படியான வழிகாட்டல்")}</h2>
            <ol className="space-y-3">
              {(lang === "ta" ? guide.steps_ta : guide.steps_en).map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <span className="text-slate-700 dark:text-slate-300 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Contact Info */}
        {guide.helpline_numbers && guide.helpline_numbers.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-green-900 dark:text-green-400 mb-4">
              <Phone className="w-5 h-5" />
              {T("Helpline", "உதவி வரி")}
            </h3>
            <div className="space-y-2">
              {guide.helpline_numbers.map((number, i) => (
                <a key={i} href={`tel:${number}`} className="flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
                  <Phone className="w-4 h-4 text-green-700 dark:text-green-400" />
                  <span className="font-mono text-green-700 dark:text-green-400">{number}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Portal Link */}
        {guide.portal_url && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 mb-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 dark:text-indigo-400 mb-3">
              <ExternalLink className="w-5 h-5" />
              {T("Official Portal", "அரசு இணையதளம்")}
            </h3>
            <a href={guide.portal_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              {T("Visit Portal", "இணையதளத்தைப் பார்க்கவும்")}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

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
