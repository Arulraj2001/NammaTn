"use client";
import React from "react";
import { Award, CheckCircle, Users, ExternalLink, Share2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AwarenessSchemeDetail({ scheme }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  if (!scheme) return <div className="min-h-screen flex items-center justify-center"><p>{T("Scheme not found", "திட்டம் கண்டறியப்படவில்லை")}</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{lang === "ta" ? scheme.name_ta : scheme.name_en}</h1>
              <div className="flex flex-wrap gap-2">
                {scheme.category_en && (
                  <span className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium">{lang === "ta" ? scheme.category_ta : scheme.category_en}</span>
                )}
                {scheme.is_featured && (
                  <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">⭐ {T("Featured", "சிறப்பு")}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Department */}
        {scheme.department_en && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">{T("Department", "துறை")}</h3>
            <p className="text-lg text-slate-900 dark:text-white">{lang === "ta" ? scheme.department_ta : scheme.department_en}</p>
          </div>
        )}

        {/* Benefits */}
        {scheme.benefits_en && (
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-green-900 dark:text-green-400 mb-3">
              <CheckCircle className="w-5 h-5" />
              {T("Benefits", "நன்மைகள்")}
            </h3>
            <p className="text-green-800 dark:text-green-300">{lang === "ta" ? scheme.benefits_ta : scheme.benefits_en}</p>
          </div>
        )}

        {/* Eligibility */}
        {scheme.eligibility_en && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-3">{T("Eligibility", "தகுதி")}</h3>
            <p className="text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{lang === "ta" ? scheme.eligibility_ta : scheme.eligibility_en}</p>
          </div>
        )}

        {/* Apply & Links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{T("Apply Now", "இப்போது விண்ணப்பிக்கவும்")}</h3>
          <div className="space-y-3">
            {scheme.apply_url && (
              <a href={scheme.apply_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <span className="font-medium">{T("Apply on Official Portal", "அரசு இணையதளத்தில் விண்ணப்பிக்கவும்")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {scheme.website_url && scheme.website_url !== scheme.apply_url && (
              <a href={scheme.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="font-medium">{T("Learn More", "மேலும் தெரிந়து கொள்ளுங்கள்")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
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
