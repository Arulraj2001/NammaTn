"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award, CheckCircle2, CheckSquare, Square, Users, ExternalLink,
  Share2, Phone, AlertCircle, HelpCircle, FileText, ChevronDown,
  ArrowLeft, Copy, Check, MessageCircle, Sparkles, Building2,
  Coins, Clock, ShieldAlert, CheckCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

export default function AwarenessSchemeDetail({ scheme }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [checkedDocs, setCheckedDocs] = useState({});
  const [copiedDocs, setCopiedDocs] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  if (!scheme) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-white mb-3">
            {T("Scheme not found", "திட்டம் கண்டறியப்படவில்லை")}
          </p>
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> {T("Back to All Schemes", "அனைத்து திட்டங்களுக்கும் திரும்பு")}
          </Link>
        </div>
      </div>
    );
  }

  const name = T(scheme.name_en, scheme.name_ta);
  const dept = T(scheme.department_en, scheme.department_ta);
  const benefit = T(
    scheme.financial_benefit_en || scheme.benefits_en,
    scheme.financial_benefit_ta || scheme.benefits_ta
  );
  const categoryBadge = T(scheme.category_en, scheme.category_ta);
  const docs = lang === "ta" ? (scheme.documents_required_ta || scheme.documents_required_en || []) : (scheme.documents_required_en || []);
  const faqs = scheme.faqs || [];
  const helplineNum = scheme.helpline ? scheme.helpline.split("/")[0].trim() : null;

  const toggleDoc = (index) => {
    setCheckedDocs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const completedDocsCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = docs.length > 0 ? Math.round((completedDocsCount / docs.length) * 100) : 0;

  const handleCopyChecklist = () => {
    const text = docs.map((d, i) => `${i + 1}. ${d}`).join("\n");
    navigator.clipboard.writeText(`${name} — ${T("Required Documents Checklist", "தேவையான ஆவணங்கள்")}:\n${text}`);
    setCopiedDocs(true);
    setTimeout(() => setCopiedDocs(false), 2000);
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://www.vizhitn.in/schemes/${scheme.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://www.vizhitn.in/schemes/${scheme.slug}`;
    const msg = `📢 *${name}*\n\n🏛️ *${T("Department:", "துறை:")}* ${dept}\n💰 *${T("Entitlement:", "நிதி உதவி / பலன்:")}* ${benefit}\n\n📄 *${T("Check Eligibility & Application Steps:", "தகுதி & விண்ணப்பிக்கும் முழு விவரம்:")}*\n${url}\n\n_Via VizhiTN Civic Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 sm:pb-20">
      {/* Top Header & Breadcrumb Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{T("All Government Schemes", "அனைத்து அரசு திட்டங்கள்")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? T("Link Copied", "நகலெடுக்கப்பட்டது") : T("Copy Link", "இணைப்பை நகலெடு")}</span>
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
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              {T("Tamil Nadu Public Welfare Scheme 2026", "தமிழ்நாடு அரசு நலத்திட்டம் 2026")}
            </span>

            {categoryBadge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {categoryBadge}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {name}
          </h1>

          {dept && (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>{dept}</span>
            </div>
          )}

          {/* Prominent Entitlement / Payout Banner */}
          <div className="mt-6 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 flex items-start gap-3.5">
            <Coins className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                {T("Financial Entitlement / Scheme Benefit", "அரசு நிதி உதவி / நலத்திட்ட சலுகை விபரம்")}
              </span>
              <p className="text-base sm:text-xl font-black text-slate-900 dark:text-emerald-100 leading-snug">
                {benefit}
              </p>
            </div>
          </div>

          {/* Quick Apply & Portal Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            {scheme.apply_url && (
              <a
                href={scheme.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <span>{T("Apply on Official Portal", "அரசு தளத்தில் விண்ணப்பிக்க")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {scheme.website_url && scheme.website_url !== scheme.apply_url && (
              <a
                href={scheme.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span>{T("Department Website", "துறை இணையதளம்")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {helplineNum && (
              <a
                href={`tel:${helplineNum.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{T("Helpline", "உதவி எண்")}: {helplineNum}</span>
              </a>
            )}
          </div>
        </section>

        {/* Eligibility Criteria Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{T("Who is Eligible? (Statutory Criteria)", "யார் தகுதியானவர்கள்? (விதிகள்)")}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            {T("Check the mandatory family income, age, land holding, and vehicle ownership limits.", "வயது, குடும்ப ஆண்டு வருமானம், நில அளவு மற்றும் வாகன விதிமுறைகள்.")}
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/60 font-medium text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
            {lang === "ta" ? scheme.eligibility_ta : scheme.eligibility_en}
          </div>
        </section>

        {/* Required Documents Interactive Checklist */}
        {docs.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-amber-500" />
                  <span>{T("Required Documents Checklist", "தேவையான ஆவணங்கள் பட்டியல்")}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {T("Click items you have gathered to tick them off before visiting the camp/portal.", "நீங்கள் தயார் செய்த ஆவணங்களை கிளிக் செய்து சரிபாருங்கள்.")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyChecklist}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {copiedDocs ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDocs ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy List", "பட்டியலை நகலெடு")}</span>
                </button>

                <div className="sm:text-right">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {completedDocsCount} / {docs.length}
                  </span>
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {docs.map((doc, idx) => {
                const isChecked = !!checkedDocs[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(idx)}
                    className={`cursor-pointer flex items-start gap-4 p-4 rounded-2xl border transition-all select-none ${
                      isChecked
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-indigo-400"
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Mark document ${idx + 1}`}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isChecked
                            ? "line-through text-slate-500 dark:text-slate-400 font-medium"
                            : "text-slate-800 dark:text-slate-200 font-medium"
                        }`}
                      >
                        {doc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* How & Where To Apply Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span>📝</span>
                <span>{T("How To Apply (Step-by-Step)", "விண்ணப்பிக்கும் முறை")}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {T("Application roadmap from token collection to biometric e-KYC:", "படிவம் பெறுதல் முதல் கைரேகை பதிவு வரை:")}
              </p>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {lang === "ta" ? scheme.how_to_apply_ta : scheme.how_to_apply_en}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span>📍</span>
                <span>{T("Where To Apply & Official Desk", "விண்ணப்பிக்க வேண்டிய இடம்")}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {T("Designated government offices, camps, and e-Sevai centres:", "அரசு அலுவலகங்கள் மற்றும் முகாம்கள்:")}
              </p>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-4">
                {lang === "ta" ? scheme.where_to_apply_ta : scheme.where_to_apply_en}
              </div>

              {helplineNum && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      {T("Official Helpline", "துறை உதவி எண்")}
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {helplineNum}
                    </span>
                  </div>
                  <a
                    href={`tel:${helplineNum.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{T("Call", "அழை")}</span>
                  </a>
                </div>
              )}
            </div>
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
              {T("Clarifications on rejections, appeals, bank passbook linking, and eligibility doubts.", "விண்ணப்ப நிராகரிப்பு, மேல்முறையீடு மற்றும் தகுதி சந்தேகங்கள்.")}
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
                {T("Application Stalled or Bribe Demanded?", "மனு தள்ளுபடி செய்யப்பட்டதா அல்லது லஞ்சம் கேட்கப்பட்டதா?")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {T(
                  "You have the statutory right to benefit if you meet official criteria. If an official demands a bribe or your verified application has been delayed without reason, file an evidence report on VizhiTN.",
                  "அரசு குறிப்பிட்ட தகுதிகள் இருந்தும் மனு ஏற்கப்படாவிட்டாலோ அல்லது இடைத்தரகர்கள் பணம் கேட்டாலோ VizhiTN தளத்தில் ஆதாரங்களுடன் பதிவிடுங்கள்."
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {T("Post Evidence on VizhiTN", "VizhiTN-ல் புகார் பதிவு செய்")}
                </Link>
                <Link
                  href="/bribes"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-amber-600/40 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                >
                  {T("DVAC Bribery Tracker", "லஞ்சப் பதிவேடு")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Cross Linking */}
        <AwarenessRelatedLinks currentSection="schemes" />
      </div>

      {/* Mobile Sticky Floating Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-xl flex items-center gap-2">
        {scheme.apply_url && (
          <a
            href={scheme.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs text-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{T("Apply on Portal", "விண்ணப்பிக்க")}</span>
          </a>
        )}
        {helplineNum && (
          <a
            href={`tel:${helplineNum.replace(/[^0-9]/g, "")}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-900 text-white dark:bg-slate-800 font-bold text-xs rounded-xl border border-slate-700 text-center"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{helplineNum}</span>
          </a>
        )}
        <button
          onClick={handleWhatsAppShare}
          aria-label="Share on WhatsApp"
          className="w-11 h-11 flex items-center justify-center bg-emerald-600 text-white rounded-xl flex-shrink-0 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
