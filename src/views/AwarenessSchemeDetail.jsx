"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, CheckSquare, Square, ExternalLink, Phone,
  FileText, ChevronDown, ArrowLeft, Copy, Check, MessageCircle,
  Sparkles, Building2, Coins, ArrowRight, HelpCircle,
  AlertCircle, ShieldCheck
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
          <p className="text-base font-bold text-slate-800 dark:text-white mb-3">
            {T("Scheme not found", "திட்டம் கண்டறியப்படவில்லை")}
          </p>
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-civic-600 dark:text-civic-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {T("Back to All Schemes", "அனைத்து திட்டங்களுக்கும் திரும்பு")}
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
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#071324] text-slate-800 dark:text-slate-100 pb-20">
      
      {/* ── STICKY TOP SUB-BAR ── */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0c1f38]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 hover:text-civic-600 dark:hover:text-civic-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{T("All Schemes", "திட்டங்கள்")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors font-medium text-[11px]"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? T("Copied", "நகலெடுக்கப்பட்டது") : T("Copy Link", "இணைப்பு")}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors text-[11px]"
            >
              <MessageCircle className="w-3 h-3" />
              <span>{T("Share", "பகிர்")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* ── BREADCRUMBS ── */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-civic-600 dark:hover:text-civic-300">
                {T("Home", "முகப்பு")}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/schemes" className="hover:text-civic-600 dark:hover:text-civic-300">
                {T("Government Schemes", "அரசு திட்டங்கள்")}
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs" aria-current="page">
              {name}
            </li>
          </ol>
        </nav>

        {/* ── 2-COLUMN UNIFIED EDITORIAL LAYOUT (Zero Card Fatigue) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================================================================ */}
          {/* MAIN ARTICLE / GUIDE CONTENT (Left 8 Cols)                       */}
          {/* ================================================================ */}
          <main className="lg:col-span-8 bg-white dark:bg-[#0c1f38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xs">
            
            {/* Header / Title Block */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-civic-50 text-civic-700 dark:bg-civic-950 dark:text-civic-300 border border-civic-200 dark:border-civic-800">
                  <Sparkles className="w-3 h-3 text-civic-500" />
                  {categoryBadge || T("Welfare Scheme", "அரசு திட்டம்")}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  {T("Active 2026", "2026 நடைமுறையில் உள்ளது")}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {name}
              </h1>

              {dept && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dept}</span>
                </div>
              )}
            </div>

            {/* Benefit Highlight Strip (Slim & High-Impact) */}
            <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border-l-4 border-emerald-500 rounded-r-xl p-4 mb-6">
              <div className="flex items-start gap-2.5">
                <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-0.5">
                    {T("Financial Entitlement / Benefit", "அரசு நிதி உதவி & சலுகை விவரம்")}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-100 leading-snug">
                    {benefit}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Who is Eligible? */}
            <section className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-civic-600 dark:text-civic-400" />
                <span>{T("Who is Eligible? (Statutory Criteria)", "யார் தகுதியானவர்கள்? (விதிகள்)")}</span>
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pl-1">
                {lang === "ta" ? scheme.eligibility_ta : scheme.eligibility_en}
              </div>
            </section>

            {/* Section 2: How & Where to Apply (Numbered Process) */}
            <section className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-civic-600 dark:text-civic-400" />
                <span>{T("How to Apply (Step-by-Step)", "விண்ணப்பிக்கும் முறை")}</span>
              </h2>

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4 pl-1">
                {lang === "ta" ? scheme.how_to_apply_ta : scheme.how_to_apply_en}
              </div>

              {scheme.where_to_apply_en && (
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    📍 {T("Where to Submit / Location:", "விண்ணப்பிக்க வேண்டிய இடம்:")}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {lang === "ta" ? scheme.where_to_apply_ta : scheme.where_to_apply_en}
                  </p>
                </div>
              )}
            </section>

            {/* Section 3: Required Documents Interactive Checklist */}
            {docs.length > 0 && (
              <section className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>{T("Required Documents Checklist", "தேவையான ஆவணங்கள்")}</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {T("Tick documents you have gathered:", "தயார் செய்த ஆவணங்களை டிக் செய்து சரிபார்க்கவும்:")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {completedDocsCount}/{docs.length}
                    </span>
                    <button
                      onClick={handleCopyChecklist}
                      className="text-[11px] font-semibold text-civic-600 dark:text-civic-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedDocs ? T("Copied!", "நகலானது!") : T("Copy List", "நகலெடு")}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {docs.map((doc, idx) => {
                    const isChecked = !!checkedDocs[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleDoc(idx)}
                        className={`cursor-pointer flex items-center gap-2.5 p-2 rounded-lg border transition-all select-none text-xs ${
                          isChecked
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                            : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <button type="button" aria-label={`Toggle doc ${idx + 1}`} className="flex-shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <span className={`flex-1 ${isChecked ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200 font-medium"}`}>
                          {doc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 4: Frequently Asked Questions */}
            {faqs.length > 0 && (
              <section className="mb-4">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-civic-600 dark:text-civic-400" />
                  <span>{T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}</span>
                </h2>

                <div className="space-y-2 mt-3">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    const question = T(faq.q_en, faq.q_ta);
                    const answer = T(faq.a_en, faq.a_ta);

                    return (
                      <div
                        key={idx}
                        className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-900/40"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-3 text-left gap-2"
                        >
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {question}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-180 text-civic-500" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="p-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c1f38]">
                            {answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </main>

          {/* ================================================================ */}
          {/* STICKY QUICK ACTION SIDEBAR (Right 4 Cols)                       */}
          {/* ================================================================ */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-16">
            
            <div className="bg-white dark:bg-[#0c1f38] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {T("Official Application Desk", "அதிகாரப்பூர்வ சேவை மையம்")}
              </h3>

              {/* Primary Apply Button */}
              {scheme.apply_url && (
                <a
                  href={scheme.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <span>{T("Apply on Official Portal", "அரசு தளத்தில் விண்ணப்பிக்க")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Helpline Call Button */}
              {helplineNum && (
                <a
                  href={`tel:${helplineNum.replace(/[^0-9]/g, "")}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{T("Call Helpline:", "உதவி எண்:")} {helplineNum}</span>
                </a>
              )}

              {/* Department Website */}
              {scheme.website_url && scheme.website_url !== scheme.apply_url && (
                <a
                  href={scheme.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span>{T("Department Portal", "துறை தளம்")}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              {/* Link back to CM Vijay Governance Tracker */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/tn-politics/cm-vijay"
                  className="w-full inline-flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-bold transition-colors"
                >
                  <span>🏛️ {T("CM Vijay Governance Tracker", "முதல்வர் விஜய் அரசு கண்காணிப்பகம்")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bribe / Delay Escalation Alert */}
            <div className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{T("Application Delayed or Bribe Asked?", "மனு தாமதமா? லஞ்சம் கேட்கப்பட்டதா?")}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {T(
                  "You have the statutory right to benefit. Log an evidence report on VizhiTN to notify local activists.",
                  "தகுதி இருந்தும் தாமதமானால் VizhiTN தளத்தில் புகார் பதிவு செய்யலாம்."
                )}
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-civic-600 dark:text-civic-400 hover:underline"
              >
                <span>{T("Report on VizhiTN →", "புகார் பதிவு செய்க →")}</span>
              </Link>
            </div>

          </aside>

        </div>

        {/* ── RELATED SCHEMES & GUIDES ── */}
        <div className="mt-10">
          <AwarenessRelatedLinks currentSection="schemes" />
        </div>

      </div>

      {/* ── MOBILE STICKY FLOATING ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c1f38]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 sm:hidden shadow-xl flex items-center gap-2">
        {scheme.apply_url && (
          <a
            href={scheme.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 bg-civic-600 text-white font-bold text-xs rounded-xl shadow-xs text-center"
          >
            <span>{T("Apply Online", "விண்ணப்பிக்க")}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {helplineNum && (
          <a
            href={`tel:${helplineNum.replace(/[^0-9]/g, "")}`}
            className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-emerald-600 text-white font-bold text-xs rounded-xl text-center"
          >
            <Phone className="w-3 h-3" />
            <span>{helplineNum}</span>
          </a>
        )}
      </div>

    </div>
  );
}
