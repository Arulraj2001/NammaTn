"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe, ExternalLink, Share2, ArrowLeft, ShieldCheck,
  Lock, Copy, Check, MessageCircle, AlertTriangle, Building2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessPortalDetail({ portal }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [copied, setCopied] = useState(false);

  if (!portal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white mb-3">
            {T("Portal not found", "இணையதளம் கண்டறியப்படவில்லை")}
          </p>
          <Link
            href="/awareness/portals"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {T("Back to Portals Directory", "அனைத்து அரசு இணையதளங்களுக்கும் திரும்பு")}
          </Link>
        </div>
      </div>
    );
  }

  const name = lang === "ta" ? (portal.name_ta || portal.name_en) : portal.name_en;
  const desc = lang === "ta" ? (portal.description_ta || portal.description_en) : portal.description_en;
  const dept = lang === "ta" ? (portal.dept_ta || portal.dept_en) : portal.dept_en;
  const category = lang === "ta" ? (portal.category_ta || portal.category_en) : portal.category_en;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portal.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : portal.url;
    const msg = `🏛️ *${name}*\n\n🔗 *${T("Official URL:", "அதிகாரப்பூர்வ தளம்:")}* ${portal.url}\n\n📄 *${T("Details & Services Guide:", "விவரம்:")}*\n${url}\n\n_Via VizhiTN Civic Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const isGovDomain = portal.url?.includes(".gov.in") || portal.url?.includes(".nic.in");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-6 pb-24 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/awareness/portals"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {T("Back to Portals Directory", "அனைத்து அரசு தளங்கள்")}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Link", "இணைப்பை நகலெடு")}
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
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0 text-cyan-600 dark:text-cyan-400">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {category && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                    {category}
                  </span>
                )}
                {isGovDomain && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    {T("Verified .gov.in Domain", "சரிபார்க்கப்பட்ட அரசு தளம்")}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {name}
              </h1>
              {dept && (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  🏛️ {dept}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {desc && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/60 mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {T("About This Portal & Online Services", "இத்தளத்தின் சேவைகள் பற்றிய விவரம்")}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {desc}
              </p>
            </div>
          )}

          {/* Verified Launch Action Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block mb-1">
                {T("Official Web Address", "அதிகாரப்பூர்வ முகவரி")}
              </span>
              <p className="text-base sm:text-lg font-mono font-bold break-all">
                {portal.url}
              </p>
            </div>
            <a
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              {T("Launch Official Portal", "தளத்திற்குச் செல்லவும்")}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Security & Anti-Phishing Advisory */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-300">
                🛡️ {T("Anti-Phishing & Data Safety Advisory", "இணைய பாதுகாப்பு மற்றும் தரவு பாதுகாப்பு எச்சரிக்கை")}
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                {T(
                  "Always verify the browser address bar before entering Aadhaar numbers, OTPs, or payment details. Genuine Tamil Nadu government portals end with '.tn.gov.in', '.gov.in', or '.nic.in'. Never send passwords or OTPs over WhatsApp or unofficial SMS links.",
                  "ஆதார் எண், வங்கி OTP போன்றவற்றை உள்ளிடும் முன் இணைய முகவரியை சரிபார்க்கவும். அதிகாரப்பூர்வ தமிழ்நாடு அரசு தளங்கள் '.tn.gov.in' அல்லது '.gov.in' என்றே முடியும். போலியான SMS இணைப்புகளை நம்ப வேண்டாம்."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="portals" />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        <a
          href={portal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {T("Open Official Portal ↗", "அரசு தளம் ↗")}
        </a>
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
