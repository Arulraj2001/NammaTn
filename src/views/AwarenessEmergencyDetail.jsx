"use client";
import React from "react";
import { AlertCircle, Phone, Share2, Copy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

export default function AwarenessEmergencyDetail({ emergency }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [copied, setCopied] = useState(false);

  if (!emergency) return <div className="min-h-screen flex items-center justify-center"><p>{T("Contact not found", "தொடர்பு கண்டறியப்படவில்லை")}</p></div>;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(emergency.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header - Prominent Emergency */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-red-900 dark:text-red-400 mb-2">{emergency.number}</h1>
              <p className="text-xl text-red-800 dark:text-red-300">{lang === "ta" ? emergency.name_ta : emergency.name_en}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`tel:${emergency.number}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-colors">
              <Phone className="w-5 h-5" />
              {T("Call Now", "இப்போது அழைக்கவும்")}
            </a>
            <button onClick={handleCopyNumber} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Copy className="w-4 h-4" />
              {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Number", "எண்ணை நகலெடுக்கவும்")}
            </button>
          </div>
        </div>

        {/* Description */}
        {emergency.description_en && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("About", "பற்றி")}</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{lang === "ta" ? emergency.description_ta : emergency.description_en}</p>
          </div>
        )}

        {/* 24/7 Badge */}
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
          <p className="text-center text-sm font-bold text-green-700 dark:text-green-400">
            🕐 {T("Available 24/7 - Always", "24/7 - எப்போதும் கிடைக்கக்கூடியது")}
          </p>
        </div>

        {/* Emergency Tips */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-3">💡 {T("Important Tips", "முக்கியமான குறிப்புகள்")}</h3>
          <ul className="space-y-2 text-amber-800 dark:text-amber-300 text-sm">
            <li>✓ {T("Stay calm and provide clear information", "அமைதியாக இருந்து தெளிவான தகவலை வழங்கவும்")}</li>
            <li>✓ {T("Know your exact location/address", "உங்கள் சரியான இடம்/முகவரியை அறிந்து கொள்ளுங்கள்")}</li>
            <li>✓ {T("Follow the responder's instructions", "பதிலளிப்பாளரின் அறிவுரைகளைப் பின்பற்றுங்கள்")}</li>
            <li>✓ {T("Keep the line open until help arrives", "உதவி வரும் வரை வரியைத் திறந்து வைக்கவும்")}</li>
          </ul>
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
