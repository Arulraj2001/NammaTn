"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone, Share2, Copy, Check, ArrowLeft,
  AlertTriangle, ShieldAlert, CheckCircle2, MessageCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessEmergencyDetail({ emergency }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [copied, setCopied] = useState(false);

  if (!emergency) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white mb-3">
            {T("Helpline contact not found", "அவசர தொடர்பு எண் கண்டறியப்படவில்லை")}
          </p>
          <Link
            href="/awareness/emergency"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {T("Back to Emergency Directory", "அனைத்து அவசர எண்களுக்கும் திரும்பு")}
          </Link>
        </div>
      </div>
    );
  }

  const name = lang === "ta" ? (emergency.name_ta || emergency.name_en) : emergency.name_en;
  const desc = lang === "ta" ? (emergency.description_ta || emergency.description_en) : emergency.description_en;
  const cleanPhone = emergency.number?.replace(/[^0-9]/g, "") || "";

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(cleanPhone || emergency.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const msg = `🚨 *${name}*\n\n📞 *${T("Helpline Number:", "உதவி எண்:")}* ${emergency.number}\n\nℹ️ ${desc}\n\n_Via VizhiTN 24x7 Emergency Directory_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-6 pb-24 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/awareness/emergency"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {T("Back to Emergency Helplines", "அனைத்து அவசர உதவி எண்கள்")}
          </Link>
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {T("Share Contact", "பகிர்")}
          </button>
        </div>

        {/* Hero Emergency Speed-Dial Card */}
        <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-xs text-white font-black text-xs uppercase tracking-wider rounded-full">
              24x7 TOLL-FREE EMERGENCY
            </span>
            <button
              onClick={handleCopyNumber}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Number", "எண்ணை நகலெடு")}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-5xl sm:text-7xl font-black tracking-tight font-mono">
                {emergency.number}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold mt-2 text-red-50">
                {name}
              </h1>
            </div>

            <a
              href={`tel:${cleanPhone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-red-600 hover:bg-red-50 font-black text-lg rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Phone className="w-6 h-6 fill-current" />
              {T("Dial Helpline Now", "இப்போது அழைக்கவும்")}
            </a>
          </div>
        </div>

        {/* About & Operational Details */}
        {desc && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {T("Service Scope & Guidelines", "சேவை விவரம் & வழிகாட்டல்")}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {desc}
            </p>
          </div>
        )}

        {/* Emergency Caller Protocol Tips */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl p-6 sm:p-8 mb-8">
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            {T("Critical Caller Instructions During Emergency", "அவசர அழைப்பின் போது கவனிக்க வேண்டியவை")}
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{T("State your exact location, district, landmark, and building name clearly to the operator.", "உங்கள் சரியான இடம், மாவட்டம், அருகில் உள்ள முக்கிய அடையாளம் ஆகியவற்றை தெளிவாகக் கூறவும்.")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{T("Explain the nature of emergency: number of injured people, fire intensity, or physical danger.", "அவசர நிலையின் தன்மையை விளக்கவும்: காயமடைந்தவர்களின் எண்ணிக்கை, ஆபத்தின் அளவு.")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{T("Stay on the call until the operator explicitly confirms dispatch of responders.", "அழைப்பு மைய அதிகாரி உறுதி செய்யும் வரை இணைப்பை துண்டிக்க வேண்டாம்.")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{T("Keep your phone free for incoming calls from the arriving emergency team.", "மீட்புக் குழுவினர் தொடர்பு கொள்ள வசதியாக உங்கள் தொலைபேசியை தொடர்ந்து செயல்பாட்டில் வைக்கவும்.")}</span>
            </li>
          </ul>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="emergency" />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        <a
          href={`tel:${cleanPhone}`}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-red-600 active:bg-red-700 text-white font-black text-sm rounded-xl shadow-md"
        >
          <Phone className="w-4 h-4 fill-current" />
          {T("Call " + emergency.number + " Now", emergency.number + " அழைக்கவும்")}
        </a>
        <button
          onClick={handleWhatsAppShare}
          aria-label="Share on WhatsApp"
          className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-xl flex-shrink-0 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
