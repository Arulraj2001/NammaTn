"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe, ExternalLink, Share2, ArrowLeft, ShieldCheck,
  Lock, Copy, Check, MessageCircle, AlertTriangle, Building2,
  Sparkles, CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessPortalDetail({ portal }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);

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

  const name = T(portal.name_en, portal.name_ta);
  const desc = T(portal.description_en, portal.description_ta);
  const dept = T(portal.dept_en, portal.dept_ta);
  const category = T(portal.category_en, portal.category_ta);
  const cleanUrl = portal.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const isGovDomain = portal.url?.includes(".gov.in") || portal.url?.includes(".nic.in");

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(portal.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyPage = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://www.vizhitn.in/awareness/portal/${portal.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : `https://www.vizhitn.in/awareness/portal/${portal.slug}`;
    const msg = `🏛️ *${name}*\n\n🔗 *${T("Official URL:", "அதிகாரப்பூர்வ முகவரி:")}* ${portal.url}\n\n📄 *${T("Services & Verification Guide:", "சேவை வழிகாட்டல் விபரம்:")}*\n${pageUrl}\n\n_Via VizhiTN Civic Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 sm:pb-20">
      {/* Top Header & Breadcrumb Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/awareness/portals"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{T("All Government Portals", "அனைத்து அரசு தளங்கள்")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {copiedPage ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPage ? T("Link Copied", "நகலெடுக்கப்பட்டது") : T("Copy Link", "இணைப்பை நகலெடு")}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{T("Share", "பகிர்")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Main Hero Card */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              <Sparkles className="w-3.5 h-3.5" />
              {T("Tamil Nadu Official Digital Service", "அதிகாரப்பூர்வ அரசு இணைய சேவை")}
            </span>

            {category && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {category}
              </span>
            )}

            {isGovDomain && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {T("Verified .gov.in Domain", "சரிபார்க்கப்பட்ட அரசு தளம்")}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {name}
          </h1>

          {dept && (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <Building2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              <span>{dept}</span>
            </div>
          )}

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {desc}
          </p>

          {/* Launch & Official URL Action Banner */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-100 block mb-1">
                {T("Official Web Address (SSL Verified)", "அதிகாரப்பூர்வ இணைய முகவரி")}
              </span>
              <p className="text-base sm:text-lg font-mono font-bold break-all">
                {portal.url}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleCopyUrl}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-xs transition-colors border border-white/20"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? T("URL Copied", "நகலெடுக்கப்பட்டது") : T("Copy URL", "URL நகலெடு")}</span>
              </button>

              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-cyan-50 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <span>{T("Launch Official Portal", "தளத்திற்குச் செல்")}</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
              </a>
            </div>
          </div>
        </section>

        {/* Security & Anti-Phishing Advisory */}
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                🛡️ {T("Anti-Phishing & Data Safety Notice", "இணைய பாதுகாப்பு மற்றும் போலி தள எச்சரிக்கை")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {T(
                  "Always verify the browser address bar before entering your Aadhaar number, bank credentials, or OTPs. Official Tamil Nadu portals terminate with '.tn.gov.in', '.gov.in', or '.nic.in'. Genuine departments will never ask for your passwords or UPI PINs.",
                  "ஆதார் எண், வங்கி விவரங்களை உள்ளிடும் முன் உலாவி முகவரியை சரிபார்க்கவும். அதிகாரப்பூர்வ தமிழ்நாடு அரசு தளங்கள் '.tn.gov.in' அல்லது '.gov.in' என்றே முடியும். அரசு ஒருபோதும் UPI பின் அல்லது கடவுச்சொல்லை கேட்காது."
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/awareness/guide/cyber-fraud"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {T("Read 1930 Cyber Fraud SOP", "1930 சைபர் கிரைம் வழிகாட்டல்")}
                </Link>
                <Link
                  href="/rights"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-600/40 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                >
                  {T("Statutory Citizen Rights", "சட்டப்பூர்வ உரிமைகள்")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Cross Linking */}
        <AwarenessRelatedLinks currentSection="portals" />
      </div>

      {/* Mobile Sticky Floating Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        <a
          href={portal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-xs text-center"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{T("Launch Portal", "தளத்திற்குச் செல்")}</span>
        </a>
        <button
          onClick={handleCopyUrl}
          aria-label="Copy URL"
          className="w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 flex-shrink-0 active:scale-95 transition-transform"
        >
          {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={handleWhatsAppShare}
          aria-label="Share on WhatsApp"
          className="w-11 h-11 flex items-center justify-center bg-emerald-600 text-white rounded-xl flex-shrink-0 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
