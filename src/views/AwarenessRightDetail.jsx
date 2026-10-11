"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Shield, FileText, Building, CheckCircle2, ExternalLink, ArrowLeft,
  MessageCircle, AlertTriangle, Copy, Check, PhoneCall, Clock, Scale,
  HelpCircle, ChevronDown, Sparkles, BookOpen, Share2, Compass, AlertOctagon,
  Lightbulb, ArrowRight
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import FormattedArticleContent from "@/components/awareness/FormattedArticleContent";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";
import RtiDraftGenerator from "@/components/tools/RtiDraftGenerator";

export default function AwarenessRightDetail({ right }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [copiedKey, setCopiedKey] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  if (!right) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {T("Statutory Right detail not found", "சட்ட விபரம் கிடைக்கவில்லை")}
        </h2>
        <Link href="/rights" className="mt-4 inline-block text-sm text-blue-600 font-semibold hover:underline">
          ← {T("Back to Citizen Rights Directory", "குடிமக்கள் உரிமைகள் கையேட்டிற்குத் திரும்பவும்")}
        </Link>
      </div>
    );
  }

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleWhatsAppShare = () => {
    const title = lang === "ta" ? right.name_ta : right.name_en;
    const desc = lang === "ta" ? right.desc_ta : right.desc_en;
    const section = lang === "ta" ? right.statutory_section_ta : right.statutory_section_en;
    const url = typeof window !== "undefined" ? window.location.href : `https://www.vizhitn.in/rights/${right.slug}`;
    const msg = `⚖️ *${title}*\n📜 *${section || T("Statutory Law in Tamil Nadu", "தமிழ்நாடு சட்டப்பூர்வ உரிமை")}*\n\n🛡️ *${T("Your Legal Rights in Tamil Nadu:", "தமிழ்நாட்டில் உங்கள் சட்டப்பூர்வ உரிமைகள்:")}*\n${desc}\n\n📄 *${T("Read Full Statutory Rules, Script & Helplines:", "முழு சட்ட விதிகள், வார்த்தைகள் & உதவி எண்கள்:")}*\n${url}\n\n_Via VizhiTN Civic Transparency Platform_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-24 sm:pb-16">
      <AwarenessSubNav activePath="/awareness/rights" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Top Navigation & Action Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/rights"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{T("Back to All Citizen Rights", "அனைத்து குடிமக்கள் உரிமைகளுக்கும்")}</span>
          </Link>

          <div className="flex items-center gap-2">
            {right.helpline && (
              <a
                href={`tel:${right.helpline}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                title={T(`Call official helpline ${right.helpline}`, `அழைக்க ${right.helpline}`)}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{T("Call", "அழைக்க")} {right.helpline}</span>
              </a>
            )}
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிருங்கள்")}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Main Content (col-8), Sidebar (col-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <main className="lg:col-span-8 space-y-6">
            
            {/* Main Legal Dossier Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex-shrink-0 border border-blue-100 dark:border-blue-800">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 uppercase tracking-wide">
                      {T("Statutory Right & Protection", "சட்டப்பூர்வ குடிமக்கள் உரிமை")}
                    </span>
                    {right.statutory_section_en && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {T(right.statutory_section_en, right.statutory_section_ta)}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-1.5 leading-tight">
                    {T(right.name_en, right.name_ta)}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {T("Governing Authority", "அரசுத் துறை")}: <strong className="text-slate-700 dark:text-slate-300">{T(right.department_en, right.department_ta)}</strong>
                  </p>
                </div>
              </div>

              {/* Fast Fact Badges Grid: SLA, Penalty, Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-xs">
                {right.timeline_sla_en && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold mb-1">
                      <Clock className="w-4 h-4" />
                      <span>{T("Statutory SLA", "சட்ட காலக்கெடு")}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold block leading-snug">
                      {T(right.timeline_sla_en, right.timeline_sla_ta)}
                    </span>
                  </div>
                )}

                {right.penalty_en && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{T("Officer Penalty", "அதிகாரி அபராதம்")}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold block leading-snug">
                      {T(right.penalty_en, right.penalty_ta)}
                    </span>
                  </div>
                )}

                {right.fee_en && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                      <Scale className="w-4 h-4" />
                      <span>{T("Court / Application Fee", "மனு கட்டணம்")}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold block leading-snug">
                      {T(right.fee_en, right.fee_ta)}
                    </span>
                  </div>
                )}
              </div>

              {/* Core Summary Description */}
              <p className="mt-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {T(right.desc_en, right.desc_ta)}
              </p>

              {/* VERBAL DEFENSE SCRIPT BOX */}
              {right.verbal_script_en && (
                <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-300">
                        {T("Citizen Verbal Script — What to Say to the Official", "அதிகாரியிடம் நீங்கள் பேச வேண்டிய சட்டப்பூர்வ பதில்")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(lang === "ta" ? right.verbal_script_ta : right.verbal_script_en, "verbal-script")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition shadow-xs"
                    >
                      {copiedKey === "verbal-script" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">{T("Copied!", "நகலெடுக்கப்பட்டது!")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{T("Copy Script", "பதிலை நகலெடு")}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <blockquote className="text-sm sm:text-base text-slate-800 dark:text-slate-100 italic leading-relaxed bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border-l-4 border-amber-500 mt-2">
                    &ldquo;{T(right.verbal_script_en, right.verbal_script_ta)}&rdquo;
                  </blockquote>
                  <p className="mt-3 text-[11px] text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{T("Tip: Recite calmly. Citing the exact statutory section legally binds the officer to record reasons for refusal.", "குறிப்பு: அமைதியாகப் பேசுங்கள். சட்டப் பிரிவைக் குறிப்பிடுவது அதிகாரியை சட்ட விதிகளுக்குள் செயல்பட வைக்கும்.")}</span>
                  </p>
                </div>
              )}

              {/* DETAILED STATUTORY OVERVIEW */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {T("Comprehensive Statutory Breakdown", "சட்டப்பூர்வ விரிவான விளக்கம்")}
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <FormattedArticleContent content={T(right.content_en, right.content_ta)} />
                  </div>
                </div>

                {/* KEY STATUTORY RULES GRID */}
                {right.key_points_en && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      {T("Key Statutory Rules & Citizen Protections", "முக்கிய சட்ட விதிகள் & குடிமக்கள் பாதுகாப்புகள்")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(lang === "ta" ? right.key_points_ta : right.key_points_en).map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP BY STEP ACTION ROADMAP */}
                {right.steps_en && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      {T("Step-by-Step Enforcement Roadmap (நடவடிக்கை வழிகாட்டி)", "படிப்படியான நடவடிக்கை வழிகாட்டி")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(lang === "ta" ? right.steps_ta : right.steps_en).map((step, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs inline-flex items-center justify-center mb-2 shadow-xs">
                            {idx + 1}
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PORTAL & HELPLINE ACTIONS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    {T("Official Department", "அரசுத் துறை")}: <strong className="text-slate-800 dark:text-slate-200">{T(right.department_en, right.department_ta)}</strong>
                  </div>
                  {right.portal_url && (
                    <a
                      href={right.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm self-start sm:self-auto"
                    >
                      <span>{T("Open Government Portal", "அரசு அதிகாரப்பூர்வ தளம் திற")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* FREQUENTLY ASKED QUESTIONS (FAQS) ACCORDION */}
            {right.faqs && right.faqs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {T("Frequently Asked Legal Questions", "அடிக்கடி கேட்கப்படும் சட்டக் கேள்விகள்")}
                  </h3>
                </div>

                <div className="space-y-3">
                  {right.faqs.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-4 text-left bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white pr-4">
                            {T(faq.q_en, faq.q_ta)}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {T(faq.a_en, faq.a_ta)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DEFENSE SHIELD ANTI-CORRUPTION NOTICE */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-black">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300">
                    {T("Rights Denied or Official Extortion?", "உரிமை மறுக்கப்பட்டதா அல்லது லஞ்சம் கேட்கப்பட்டதா?")}
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                    {T(
                      "In Tamil Nadu, no public officer can withhold statutory services or demand unauthorized speed money. If your application is rejected without written reasons or an officer demands a bribe, file an anonymous complaint on DVAC Helpline (1064) or document proof on VizhiTN.",
                      "தமிழ்நாட்டில் எந்தவொரு அரசு அதிகாரியும் காரணமின்றி சேவையை மறுக்கவோ லஞ்சம் கோரவோ முடியாது. லஞ்சம் கேட்கப்பட்டால் DVAC உதவி எண் 1064 ஐ அழைக்கலாம் அல்லது VizhiTN தளத்தில் ஆதாரத்துடன் புகாரளிக்கலாம்."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* IF RTI: EMBEDDED DRAFT GENERATOR */}
            {right.slug === "right-to-information-act-2005" && (
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-blue-500/30 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {T("Instant Tamil Nadu RTI Application Generator", "தமிழ்நாடு உடனடி RTI மனு தயாரிக்கும் கருவி")}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {T("Draft a legally compliant RTI application ready to print or copy.", "அச்சு செய்யக்கூடிய சட்டப்பூர்வ RTI மனுவை உடனடியாகப் பெறுங்கள்.")}
                    </p>
                  </div>
                </div>
                <RtiDraftGenerator />
              </div>
            )}
          </main>

          {/* Right-Side Sticky Sidebar */}
          <aside className="lg:col-span-4 sticky top-28 space-y-6">
            
            {/* Quick Action Box: Emergency Helpline */}
            {right.helpline && (
              <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-6 border border-emerald-800/40 shadow-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {T("Official Grievance Desk", "அரசு குறைதீர் உதவி மையம்")}
                </span>
                <h3 className="text-xl font-black mt-1">
                  {T(right.helpline_name_en || "Official Helpline", right.helpline_name_ta || "உதவி எண்")}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {T("Toll-free direct line to authorized departmental officers.", "அங்கீகரிக்கப்பட்ட துறை அதிகாரிகளைத் தொடர்புகொள்ள இலவச தொலைபேசி எண்.")}
                </p>
                <a
                  href={`tel:${right.helpline}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition active:scale-95"
                >
                  <PhoneCall className="w-4 h-4 text-slate-950" />
                  <span>{T("Call", "அழைக்க")} {right.helpline}</span>
                </a>
              </div>
            )}

            {/* Sidebar Related Legal Links */}
            <SidebarRelatedLinks
              type="right"
              currentSlug={right.slug}
            />
          </aside>
        </div>

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="right-detail" />
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:hidden shadow-lg flex items-center gap-2">
        {right.helpline && (
          <a
            href={`tel:${right.helpline}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{T("Call", "அழைக்க")} {right.helpline}</span>
          </a>
        )}
        <button
          onClick={handleWhatsAppShare}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிருங்கள்")}</span>
        </button>
      </div>
    </div>
  );
}
