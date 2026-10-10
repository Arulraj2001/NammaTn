"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle, Share2, Copy, Check, ArrowLeft,
  MessageCircle, MessageSquareQuote, ChevronRight, PlusCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessFaqDetail({ faq }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [copied, setCopied] = useState(false);

  if (!faq) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white mb-3">
            {T("Question not found", "கேள்வி கண்டறியப்படவில்லை")}
          </p>
          <Link
            href="/awareness/faqs"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {T("Back to FAQs", "அனைத்து கேள்விகளுக்கும் திரும்பு")}
          </Link>
        </div>
      </div>
    );
  }

  const question = lang === "ta" ? (faq.question_ta || faq.q_ta || faq.question_en) : (faq.question_en || faq.q_en);
  const answer = lang === "ta" ? (faq.answer_ta || faq.a_ta || faq.answer_en) : (faq.answer_en || faq.a_en);
  const category = lang === "ta" ? (faq.category_ta || faq.category_en) : faq.category_en;

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(`Q: ${question}\n\nA: ${answer}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://www.vizhitn.in/awareness/faqs";
    const msg = `❓ *${question}*\n\n💡 *${T("Official Answer:", "விளக்கம்:")}*\n${answer}\n\n🔗 ${url}\n\n_Via VizhiTN Civic FAQ Directory_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-6 pb-24 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/awareness/faqs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {T("Back to Civic FAQs", "அனைத்து பொதுக் கேள்விகள்")}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAnswer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Answer", "பதிலை நகலெடு")}
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

        {/* Hero Question Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              {category && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-2">
                  {category}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {question}
              </h1>
            </div>
          </div>
        </div>

        {/* Verified Answer Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <MessageSquareQuote className="w-5 h-5" />
            <span>{T("Verified Citizen Answer & Procedure", "சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ பதில் & நடைமுறை")}</span>
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {answer}
          </div>
        </div>

        {/* Have a Question CTA */}
        <div className="bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800/60 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-purple-900 dark:text-purple-300 text-base mb-1">
              {T("Have another question not answered here?", "இங்கு விடை கிடைக்காத மற்றொரு கேள்வி உள்ளதா?")}
            </h3>
            <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-400">
              {T("Ask the VizhiTN community or consult citizen volunteers across Tamil Nadu.", "VizhiTN சமூகத்திடம் கேட்டு விடை பெறுங்கள்.")}
            </p>
          </div>
          <Link
            href="/ask"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {T("Ask Now", "கேள்வி கேளுங்கள்")}
          </Link>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="faqs" />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        <button
          onClick={handleCopyAnswer}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Answer", "பதில் நகலெடு")}
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {T("Share on WhatsApp", "வாட்ஸ்அப்")}
        </button>
      </div>
    </div>
  );
}
