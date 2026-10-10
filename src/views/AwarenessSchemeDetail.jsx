"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award, CheckCircle, CheckSquare, Square, Users, ExternalLink,
  Share2, Phone, AlertCircle, HelpCircle, FileText, ChevronDown,
  ArrowLeft, Copy, Check, MessageCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessSchemeDetail({ scheme }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [checkedDocs, setCheckedDocs] = useState({});
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  if (!scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white mb-3">
            {T("Scheme not found", "திட்டம் கண்டறியப்படவில்லை")}
          </p>
          <Link
            href="/awareness/schemes"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {T("Back to all schemes", "அனைத்து திட்டங்களுக்கும் திரும்பு")}
          </Link>
        </div>
      </div>
    );
  }

  const toggleDoc = (index) => {
    setCheckedDocs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const docs = lang === "ta" ? (scheme.documents_required_ta || []) : (scheme.documents_required_en || []);
  const faqs = scheme.faqs || [];

  const handleCopyChecklist = () => {
    const text = docs.map((d, i) => `${i + 1}. ${d}`).join("\n");
    navigator.clipboard.writeText(`${lang === "ta" ? scheme.name_ta : scheme.name_en} - ${T("Required Documents Checklist", "தேவையான ஆவணங்கள்")}:\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const title = lang === "ta" ? scheme.name_ta : scheme.name_en;
    const benefit = lang === "ta" ? (scheme.financial_benefit_ta || scheme.benefits_ta) : (scheme.financial_benefit_en || scheme.benefits_en);
    const url = typeof window !== "undefined" ? window.location.href : "https://www.vizhitn.in/awareness/schemes";

    const msg = `📢 *${title}*\n\n💰 *${T("Benefit / Allowance:", "நிதி உதவி / சலுகை:")}* ${benefit}\n\n📄 *${T("Check Eligibility & Application Steps:", "தகுதி & விண்ணப்பிக்கும் முழு விவரம்:")}*\n${url}\n\n_Via VizhiTN Civic Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-6 pb-24 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/awareness/schemes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {T("Back to Schemes Encyclopedia", "அனைத்து அரசுத் திட்டங்கள்")}
          </Link>
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிருங்கள்")}
          </button>
        </div>

        {/* Hero Visual Banner (Generated Infographic) */}
        {scheme.image_url && (
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 mb-8 bg-slate-900">
            <Image
              src={scheme.image_url}
              alt={lang === "ta" ? scheme.name_ta : scheme.name_en}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
              <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-md">
                {lang === "ta" ? scheme.category_ta : scheme.category_en}
              </span>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-sm">
          {/* Header Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {lang === "ta" ? scheme.name_ta : scheme.name_en}
              </h1>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {lang === "ta" ? scheme.department_ta : scheme.department_en}
              </p>
            </div>
          </div>

          {/* Key Financial Benefit Highlight Banner */}
          {(scheme.financial_benefit_en || scheme.benefits_en) && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-2 border-emerald-500/30 rounded-2xl p-5 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                💰 {T("Financial Benefit / Entitlement", "நிதி உதவி / சலுகை விபரம்")}
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-emerald-200">
                {lang === "ta" ? (scheme.financial_benefit_ta || scheme.benefits_ta) : (scheme.financial_benefit_en || scheme.benefits_en)}
              </p>
            </div>
          )}

          {/* Who is Eligible Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {T("Who is Eligible? (Criteria)", "யார் தகுதியானவர்கள்? (நிபந்தனைகள்)")}
            </h2>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {lang === "ta" ? scheme.eligibility_ta : scheme.eligibility_en}
              </p>
            </div>
          </div>

          {/* Interactive Document Checklist */}
          {docs.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  {T("Required Documents Checklist", "தேவையான ஆவணங்கள் பட்டியல்")}
                </h2>
                <button
                  onClick={handleCopyChecklist}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy List", "பட்டியலை நகலெடு")}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {T("Click items you have already prepared to tick them off:", "நீங்கள் தயார் செய்த ஆவணங்களை கிளிக் செய்து டிக் செய்யவும்:")}
              </p>
              <div className="space-y-2">
                {docs.map((doc, idx) => {
                  const isChecked = !!checkedDocs[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDoc(idx)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                        isChecked
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={isChecked ? "line-through opacity-80" : ""}>{doc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* How to Apply & Where to Apply */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                📝 {T("How to Apply (Steps)", "விண்ணப்பிக்கும் முறை")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {lang === "ta" ? scheme.how_to_apply_ta : scheme.how_to_apply_en}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                📍 {T("Where to Apply", "விண்ணப்பிக்க வேண்டிய இடம்")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === "ta" ? scheme.where_to_apply_ta : scheme.where_to_apply_en}
              </p>
              {scheme.helpline && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    📞 {T("Official Department Helpline", "உதவி எண்")}
                  </span>
                  <a
                    href={`tel:${scheme.helpline.split('/')[0].replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Phone className="w-4 h-4" /> {scheme.helpline}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Application Links */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 mb-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              🚀 {T("Official Government Portals", "அதிகாரப்பூர்வ இணையதளங்கள்")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {scheme.apply_url && (
                <a
                  href={scheme.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
                >
                  {T("Apply on Official Portal", "அரசு தளத்தில் விண்ணப்பிக்கவும்")}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {scheme.website_url && scheme.website_url !== scheme.apply_url && (
                <a
                  href={scheme.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  {T("Department Website", "துறை இணையதளம்")}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Frequently Asked Questions (FAQ Section) */}
          {faqs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <span>{lang === "ta" ? faq.q_ta : faq.q_en}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                          {lang === "ta" ? faq.a_ta : faq.a_en}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VizhiTN Civic Escalation Flywheel Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-amber-900 dark:text-amber-300">
                  {T("Application Delayed or Demanded a Bribe?", "விண்ணப்பம் காரணமின்றி நிராகரிக்கப்பட்டதா அல்லது தாமதமா?")}
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                  {T(
                    "You have the statutory right to service under Tamil Nadu Citizen Charters. If any official demands a bribe or delays your verified application beyond time limits, document it anonymously on VizhiTN to bring community transparency and administrative escalation.",
                    "அரசு சேவைகளை குறிப்பிட்ட காலத்திற்குள் பெறுவது உங்கள் சட்டப்பூர்வ உரிமை. அதிகாரிகள் லஞ்சம் கேட்டாலோ அல்லது தேவையின்றி இழுத்தடித்தாலோ VizhiTN தளத்தில் பதிவிட்டு சமூக கவனத்திற்கும் துறைசார் நடவடிக்கைக்கும் கொண்டு செல்லுங்கள்."
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/create?category=government-schemes&scheme=${encodeURIComponent(scheme.slug)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    {T("Report Grievance on VizhiTN", "புகாரைப் பதிவு செய்")}
                  </Link>
                  <Link
                    href="/bribes"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-600/40 text-amber-900 dark:text-amber-300 font-semibold text-xs rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    {T("View Public Bribe Tracker", "லஞ்சப் பதிவேடு")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="schemes" />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        {scheme.apply_url && (
          <a
            href={scheme.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {T("Apply on Portal", "விண்ணப்பிக்கவும்")}
          </a>
        )}
        {scheme.helpline && (
          <a
            href={`tel:${scheme.helpline.split('/')[0].replace(/[^0-9]/g, '')}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {scheme.helpline.split('/')[0].trim()}
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

