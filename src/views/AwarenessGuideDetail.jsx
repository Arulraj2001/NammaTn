"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone, ExternalLink, BookOpen, Share2, ArrowLeft,
  CheckCircle2, AlertCircle, MessageCircle, Copy, Check, ChevronRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessGuideDetail({ guide }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [copied, setCopied] = useState(false);

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white mb-3">
            {T("Guide not found", "வழிகாட்டுதல் கண்டறியப்படவில்லை")}
          </p>
          <Link
            href="/awareness/guides"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {T("Back to Citizen Guides", "அனைத்து வழிகாட்டிகளுக்கும் திரும்பு")}
          </Link>
        </div>
      </div>
    );
  }

  const steps = lang === "ta" ? (guide.steps_ta || guide.steps_en || []) : (guide.steps_en || []);
  const title = lang === "ta" ? (guide.title_ta || guide.title_en) : guide.title_en;
  const dept = lang === "ta" ? (guide.department_ta || guide.department_en) : (guide.department_en || "");
  const helplines = guide.helpline_numbers || [];
  const primaryHelpline = helplines[0] || (guide.helpline ? guide.helpline.split("/")[0].trim() : null);

  const handleWhatsAppShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://www.vizhitn.in/awareness/guides";
    const msg = `📢 *${title}*\n\n🏛️ *${T("Department:", "துறை:")}* ${dept}\n\n📖 *${T("Read Step-by-Step Action Guide:", "படிப்படியான வழிகாட்டல் விபரம்:")}*\n${url}\n\n_Via VizhiTN Civic Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCopySteps = () => {
    const text = steps.map((s, i) => `${i + 1}. ${s}`).join("\n\n");
    navigator.clipboard.writeText(`${title}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-6 pb-24 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/awareness/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {T("Back to Citizen Guides", "அனைத்து வழிகாட்டிகள்")}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySteps}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Steps", "படிகளை நகலெடு")}
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {T("Share", "பகிர்")}
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
                {T("Citizen Action Guide", "குடிமக்கள் வழிகாட்டி")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>
              {dept && (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  🏛️ {dept}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-Step Action Roadmap */}
        {steps.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {T("Step-by-Step Action Roadmap", "படிப்படியான வழிகாட்டுதல் முறை")}
              </h2>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                {steps.length} {T("Steps", "படிகள்")}
              </span>
            </div>

            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 transition-colors hover:border-blue-300"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helplines & Official Portal Section */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Official Helplines */}
          {helplines.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-base mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {T("Verified Department Helplines", "சரிபார்க்கப்பட்ட உதவி எண்கள்")}
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-4">
                {T("Toll-free departmental assistance available 24x7 for Tamil Nadu citizens:", "தமிழ்நாடு குடிமக்களுக்கான இலவச துறைசார் உதவி எண்கள்:")}
              </p>
              <div className="space-y-2">
                {helplines.map((num, i) => (
                  <a
                    key={i}
                    href={`tel:${num.replace(/[^0-9]/g, "")}`}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500 shadow-xs transition-all"
                  >
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-base">{num}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-md">
                      <Phone className="w-3 h-3" /> {T("Call", "அழை")}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official Portal */}
          {guide.portal_url && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-base mb-2 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {T("Official Government Portal", "அரசு அதிகாரப்பூர்வ இணையதளம்")}
                </h3>
                <p className="text-xs text-indigo-800 dark:text-indigo-400 mb-4">
                  {T("Access direct departmental services, track petitions, and submit applications securely on the official portal.", "அரசு தளத்தில் நேரடியாக விண்ணப்பிக்கவும் உங்கள் மனுவின் நிலையை அறியவும்.")}
                </p>
              </div>
              <a
                href={guide.portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                {T("Visit Official Portal", "இணையதளத்திற்குச் செல்லவும்")}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Escalation Flywheel Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-amber-900 dark:text-amber-300">
                {T("Issue Still Unresolved by Officials?", "துறை அதிகாரிகளால் இன்னும் பிரச்சினை தீர்க்கப்படவில்லையா?")}
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                {T(
                  "If your complaint has exceeded statutory resolution timeframes or officials demand bribes, publish a citizen proof report on VizhiTN to bring community transparency and administrative escalation.",
                  "அரசு குறிப்பிட்ட காலத்திற்குள் உங்கள் பிரச்சினைக்கு தீர்வு காணப்படவில்லையெனில், VizhiTN தளத்தில் ஆதாரங்களுடன் பதிவிட்டு துறைசார் கவனத்திற்கு கொண்டு செல்லுங்கள்."
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  {T("Post Report on VizhiTN", "VizhiTN-ல் புகார் பதிவு செய்")}
                </Link>
                <Link
                  href="/bribes"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-600/40 text-amber-900 dark:text-amber-300 font-semibold text-xs rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                >
                  {T("View Bribe Tracker", "லஞ்சப் பதிவேடு")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="guides" />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        {guide.portal_url && (
          <a
            href={guide.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {T("Official Portal", "இணையதளம்")}
          </a>
        )}
        {primaryHelpline && (
          <a
            href={`tel:${primaryHelpline.replace(/[^0-9]/g, "")}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {primaryHelpline}
          </a>
        )}
        <button
          onClick={handleWhatsAppShare}
          aria-label="Share on WhatsApp"
          className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl flex-shrink-0 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
