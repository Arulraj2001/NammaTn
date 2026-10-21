"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone, ExternalLink, BookOpen, Share2, ArrowLeft,
  CheckCircle2, AlertCircle, MessageCircle, Copy, Check,
  Clock, ShieldAlert, Sparkles, HelpCircle, ChevronDown,
  Building2, CheckSquare, Square
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessGuideDetail({ guide }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  const [openFaq, setOpenFaq] = useState(0);

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

  const title = T(guide.title_en, guide.title_ta);
  const summary = T(guide.summary_en, guide.summary_ta);
  const dept = T(guide.department_en, guide.department_ta);
  const sla = T(guide.sla_time_en, guide.sla_time_ta);
  const verbalScript = T(guide.verbal_script_en, guide.verbal_script_ta);
  const steps = lang === "ta" ? (guide.steps_ta || guide.steps_en || []) : (guide.steps_en || []);
  const faqs = guide.faqs || [];
  const helplines = guide.helpline_numbers || [];
  const primaryHelpline = helplines[0];

  const toggleStep = (idx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const handleCopyScript = () => {
    if (!verbalScript) return;
    navigator.clipboard.writeText(verbalScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://www.vizhitn.in/awareness/guide/${guide.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://www.vizhitn.in/awareness/guide/${guide.slug}`;
    const msg = `📢 *${title}*\n\n🏛️ *${T("Department:", "துறை:")}* ${dept}\n⏱️ *${T("Resolution SLA:", "தீர்வு காலக்கெடு:")}* ${sla}\n\n📖 *${T("Read Full Action SOP & Phone Scripts:", "படிப்படியான தீர்வு முறை & தொலைபேசி வழிகாட்டல்:")}*\n${url}\n\n_Via VizhiTN Civic Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 sm:pb-20">
      {/* Top Breadcrumb & Action Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/awareness/guides"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{T("All Citizen Guides", "அனைத்து வழிகாட்டிகள்")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? T("Link Copied", "இணைப்பு நகலெடுக்கப்பட்டது") : T("Copy Link", "இணைப்பை நகலெடு")}</span>
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
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              {T("Tamil Nadu Citizen Action SOP", "தமிழ்நாடு குடிமக்கள் தீர்வு வழிகாட்டல்")}
            </span>

            {guide.category && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {guide.category.replace("_", " ")}
              </span>
            )}

            {sla && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5" />
                {T(`Resolution SLA: ${sla}`, `தீர்வு காலக்கெடு: ${sla}`)}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {title}
          </h1>

          {dept && (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{dept}</span>
            </div>
          )}

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {summary}
          </p>

          {/* Quick Contact & Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            {helplines.map((num, i) => (
              <a
                key={i}
                href={`tel:${num.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{T("Call Helpline", "உதவி எண் அழை")}: {num}</span>
              </a>
            ))}

            {guide.whatsapp_number && (
              <a
                href={`https://wa.me/${guide.whatsapp_number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {guide.whatsapp_number}</span>
              </a>
            )}

            {guide.portal_url && (
              <a
                href={guide.portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <span>{T("Official Department Portal", "அரசு அதிகாரப்பூர்வ தளம்")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </section>

        {/* Verbal Phone Call Script Module */}
        {verbalScript && (
          <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-3xl border border-indigo-200 dark:border-indigo-800/60 p-6 sm:p-8 mb-8 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {T("What To Say on the Phone Call (Official Script)", "தொலைபேசியில் என்ன பேச வேண்டும்? (வார்த்தை வழிகாட்டல்)")}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {T("Read this exact script to the helpline operator so your complaint is registered without hesitation.", "அதிகாரியிடம் பேசும் போது இந்த வாக்கியங்களை அப்படியே பயன்படுத்துங்கள்.")}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyScript}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-2xs transition-colors flex-shrink-0"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? T("Script Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy Script", "ஸ்கிரிப்ட் நகலெடு")}</span>
              </button>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/60 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              "{verbalScript}"
            </div>
          </section>
        )}

        {/* Step-by-Step Action Checklist */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>{T("Step-by-Step Action Roadmap", "படிப்படியான செயல் முறை")}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {T("Check off each step as you complete it to ensure complete resolution.", "ஒவ்வொரு படியையும் முடித்தவுடன் டிக் செய்து முன்னேறுங்கள்.")}
              </p>
            </div>

            {/* Checklist Progress Bar */}
            <div className="sm:text-right">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {completedCount} / {steps.length} {T("Completed", "முடிந்தது")} ({progressPercent}%)
              </span>
              <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isChecked = !!completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`cursor-pointer flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all select-none ${
                    isChecked
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-blue-400"
                  }`}
                >
                  <button
                    type="button"
                    aria-label={`Mark step ${idx + 1}`}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                        {idx + 1}
                      </div>
                    )}
                  </button>

                  <div className="flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {T(`Step ${idx + 1}`, `படி ${idx + 1}`)}
                    </span>
                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        isChecked
                          ? "line-through text-slate-500 dark:text-slate-400 font-medium"
                          : "text-slate-800 dark:text-slate-200 font-medium"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>{T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              {T("Statutory rules, special circumstances, and common doubts resolved.", "சட்ட விதிகள் மற்றும் அடிக்கடி எழும் சந்தேகங்களுக்கான பதில்கள்.")}
            </p>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                const question = T(faq.q_en, faq.q_ta);
                const answer = T(faq.a_en, faq.a_ta);

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-3 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        {answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Escalation Flywheel Banner */}
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {T("Officials Refusing Action or Exceeded SLA?", "அதிகாரிகள் நடவடிக்கை எடுக்க மறுக்கிறார்களா?")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {T(
                  "If your grievance has not been resolved within the statutory SLA timeframe or officials refuse service, publish a citizen proof report on VizhiTN for public accountability and civic tracking.",
                  "அரசு குறித்த காலத்திற்குள் தீர்வு எட்டப்படாவிட்டாலோ அல்லது சேவை மறுக்கப்பட்டாலோ VizhiTN தளத்தில் ஆதாரங்களுடன் பதிவிடுங்கள்."
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {T("Post Citizen Evidence on VizhiTN", "VizhiTN-ல் புகார் பதிவு செய்")}
                </Link>
                <Link
                  href="/awareness/emergency"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-amber-600/40 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                >
                  {T("View Official Helplines", "அரசு உதவி எண்கள்")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Cross Linking */}
        <AwarenessRelatedLinks currentSection="guides" />
      </div>

      {/* Mobile Sticky Floating Footer Call Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        {primaryHelpline && (
          <a
            href={`tel:${primaryHelpline.replace(/[^0-9]/g, "")}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>{T("Call", "அழை")}: {primaryHelpline}</span>
          </a>
        )}
        {guide.portal_url && (
          <a
            href={guide.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-900 text-white dark:bg-slate-800 font-bold text-xs rounded-xl border border-slate-700 text-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{T("Portal", "இணையதளம்")}</span>
          </a>
        )}
        <button
          onClick={handleWhatsAppShare}
          aria-label="Share on WhatsApp"
          className="w-11 h-11 flex items-center justify-center bg-teal-600 text-white rounded-xl flex-shrink-0 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
