"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail, MessageSquare, Shield, HelpCircle, Phone,
  Clock, AlertTriangle, Building2, CheckCircle2, ChevronDown,
  ChevronUp, Sparkles, Scale, ExternalLink, ArrowRight,
  ShieldAlert, Send, FileText, Info
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import ContactForm, { TOPIC_OPTIONS } from "@/components/contact/ContactForm";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

export default function Contact() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [activeTopic, setActiveTopic] = useState("content_report");
  const [openFaq, setOpenFaq] = useState(0);

  usePageMeta({
    title: "Contact VizhiTN | Citizen Helpdesk, Grievance Officer & Newsroom",
    description: "Contact the VizhiTN team for citizen support, content moderation disputes, official municipal department liaison, or editorial dispatches across Tamil Nadu.",
  });

  const TOPIC_CARDS = [
    {
      id: "content_report",
      icon: Shield,
      color: "bg-red-500",
      text_color: "text-red-700 dark:text-red-400",
      border_color: "border-red-300 dark:border-red-800",
      en: "Content Report & Privacy",
      ta: "உள்ளடக்க புகார் & தனியுரிமை",
      en_desc: "Removal of private photos, incorrect locations, or defamatory claims.",
      ta_desc: "தனிநபர் புகைப்படம், தவறான இடம் அல்லது அவதூறு நீக்க கோரிக்கை.",
      sla: "< 6h"
    },
    {
      id: "general",
      icon: MessageSquare,
      color: "bg-blue-500",
      text_color: "text-blue-700 dark:text-blue-400",
      border_color: "border-blue-300 dark:border-blue-800",
      en: "General Feedback & Ideas",
      ta: "பொது கருத்து & ஆலோசனைகள்",
      en_desc: "Feature requests, ideas to improve civic engagement in Tamil Nadu.",
      ta_desc: "தள மேம்பாட்டு யோசனைகள் மற்றும் பொதுமக்கள் கருத்துக்கள்.",
      sla: "< 24h"
    },
    {
      id: "support",
      icon: HelpCircle,
      color: "bg-emerald-500",
      text_color: "text-emerald-700 dark:text-emerald-400",
      border_color: "border-emerald-300 dark:border-emerald-800",
      en: "Technical & Account Help",
      ta: "தொழில்நுட்ப உதவி & கணக்கு",
      en_desc: "Trouble signing in, photo uploads failing, or GPS pin inaccuracies.",
      ta_desc: "உள்நுழைவு சிக்கல், புகைப்படம் பதிவேற்றம், ஜிபிஎஸ் இருப்பிட பிழை.",
      sla: "< 12h"
    },
    {
      id: "other",
      icon: Building2,
      color: "bg-purple-500",
      text_color: "text-purple-700 dark:text-purple-400",
      border_color: "border-purple-300 dark:border-purple-800",
      en: "Department Liaison",
      ta: "அரசுத் துறை தொடர்பு",
      en_desc: "Official inquiries by Ward Councillors, GCC, TANGEDCO, and TWAD.",
      ta_desc: "மாநகராட்சி, மின்வாரியம் மற்றும் அரசு அதிகாரிகளின் நேரடி தொடர்பு.",
      sla: "< 12h"
    },
  ];

  const FAQS = [
    {
      q_en: "How quickly does the team review a Content Report or Privacy dispute?",
      q_ta: "உள்ளடக்க புகார் அல்லது தனியுரிமை கோரிக்கை எவ்வளவு நேரத்தில் பரிசீலிக்கப்படும்?",
      a_en: "Content disputes involving privacy, personal residence photos, or factual inaccuracies are prioritized under our 6-hour emergency SLA by our Resident Grievance Officer.",
      a_ta: "தனிநபர் தனியுரிமை, தவறான தகவல் தொடர்பான புகார்கள் எங்கள் குறைதீர்ப்பு அதிகாரியால் 6 மணி நேரத்திற்குள் முன்னுரிமையுடன் பரிசீலிக்கப்படும்."
    },
    {
      q_en: "Can government officials or municipal engineers verify citizen complaints on VizhiTN?",
      q_ta: "அரசு அதிகாரிகள் அல்லது நகராட்சி பொறியாளர்கள் VizhiTN தளத்தில் புகார்களை சரிபார்க்க முடியுமா?",
      a_en: "Yes. Municipal engineers, Ward Councillors, and departmental staff can request an official verification badge to comment directly on citizen issues and update status to 'Claimed Fixed'.",
      a_ta: "ஆம். நகராட்சி பொறியாளர்கள், வார்டு உறுப்பினர்கள் அதிகாரப்பூர்வ சரிபார்ப்பு பெற்று புகார்களுக்கு நேரடியாக பதிலளித்து 'சரிசெய்யப்பட்டது' என புதுப்பிக்கலாம்."
    },
    {
      q_en: "Is my personal data or whistleblower identity protected when submitting reports?",
      q_ta: "புகார் அளிக்கும்போது எனது தனிப்பட்ட தகவல்கள் பாதுகாக்கப்படுமா?",
      a_en: "Absolutely. All contact communications are confidential and encrypted. We adhere strictly to digital privacy laws and never share citizen contact details with third-party agencies.",
      a_ta: "முழுமையாக பாதுகாக்கப்படும். உங்கள் தொடர்பு விவரங்கள் முற்றிலும் ரகசியமாக வைக்கப்படும். எந்தவொரு மூன்றாம் தரப்பு நிறுவனங்களுடனும் பகிரப்படாது."
    },
    {
      q_en: "How do I report a life-threatening civic emergency immediately?",
      q_ta: "உயிருக்கு ஆபத்தான அவசர நிலையை உடனடியாக எவ்வாறு தெரிவிப்பது?",
      a_en: "For live wire snaps, flooding in subways, or medical emergencies, do not wait for email responses. Please dial 112 (Unified), 108 (Ambulance), 1912 (Minnalagam EB), or 1070 (Disaster) directly.",
      a_ta: "மின்கம்பி அறுந்து விழுதல், மழை வெள்ள மீட்பு அல்லது மருத்துவ அவசரங்களுக்கு மின்னஞ்சல் அனுப்ப காத்திருக்காமல் 112, 108, 1912 அல்லது 1070 எண்களை உடனே அழைக்கவும்."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {T("CITIZEN HELPDESK & EDITORIAL GRIEVANCE DESK", "குடிமக்கள் உதவி மையம் & குறைதீர்ப்பு பிரிவு")}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3 text-white">
              {T("Contact VizhiTN | We Are Here to Listen", "VizhiTN தொடர்பு மையம் | உங்கள் குரலுக்கு முன்னுரிமை")}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed mb-4">
              {T(
                "Connect with our civic moderation desk, editorial newsroom, or technical support team. We review citizen feedback, content dispute appeals, and municipal partnerships across all 38 districts of Tamil Nadu.",
                "கருத்துக்கள், உள்ளடக்க புகார்கள், நகராட்சி கூட்டாண்மை மற்றும் செய்திக் குறிப்புகளுக்கு எங்கள் சென்னை தலைமையகத்தை தொடர்பு கொள்ளலாம்."
              )}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-white/10 flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {T("Average Response: < 24 Hours", "சராசரி பதில் நேரம்: < 24 மணி நேரம்")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Shield className="w-4 h-4 text-blue-400" /> {T("Grievance Redressal Compliant", "சட்டப்பூர்வ குறைதீர்ப்பு மையம்")}
              </span>
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE TOPIC PRE-SELECTORS ── */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {T("Select an Inquiry Category", "தொடர்புக்கான பிரிவை தேர்வு செய்க")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {T("Click any card below to pre-fill the inquiry form with guaranteed response SLAs.", "தேவைப்படும் பிரிவை தேர்வு செய்து விரைவாக செய்தி அனுப்பலாம்.")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TOPIC_CARDS.map((t) => {
              const Icon = t.icon;
              const active = activeTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTopic(t.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    active
                      ? `bg-white dark:bg-slate-900 ${t.border_color} ring-2 ring-blue-500 shadow-md`
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-9 h-9 rounded-xl ${t.color} text-white flex items-center justify-center font-bold shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        SLA: {t.sla}
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold mb-1 ${active ? t.text_color : "text-slate-900 dark:text-white"}`}>
                      {T(t.en, t.ta)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {T(t.en_desc, t.ta_desc)}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
                    <span className={active ? t.text_color : "text-slate-400"}>
                      {active ? T("Selected ✓", "தேர்வு செய்யப்பட்டது ✓") : T("Select this →", "தேர்வு செய்க →")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2-COLUMN MAIN DESK (FORM & ACCOUNTABILITY SIDEBAR) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLUMNS: CONTACT FORM */}
          <div className="lg:col-span-2">
            <ContactForm activeTopic={activeTopic} onTopicSelect={setActiveTopic} />
          </div>

          {/* RIGHT 1 COLUMN: SIDEBAR DESKS */}
          <div className="space-y-4">

            {/* Direct Department Inboxes Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                {T("Direct Department Inboxes", "துறைசார் நேரடி மின்னஞ்சல்கள்")}
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                  <span className="font-bold text-blue-950 dark:text-blue-200 block">
                    {T("Citizen Support Desk", "பொதுமக்கள் உதவி மையம்")}
                  </span>
                  <a href="mailto:vizhitnin@gmail.com" className="text-blue-600 dark:text-blue-400 font-mono font-semibold hover:underline">
                    vizhitnin@gmail.com
                  </a>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {T("General platform & technical support", "பொதுவான தொழில்நுட்ப உதவிகள்")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {T("Editorial & Newsroom Desk", "செய்தி & தலையங்கப் பிரிவு")}
                  </span>
                  <a href="mailto:vizhitnin@gmail.com" className="text-blue-600 dark:text-blue-400 font-mono hover:underline">
                    vizhitnin@gmail.com
                  </a>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {T("Civic tips, breaking issues & dispatches", "உள்ளூர் நிகழ்வுகள் மற்றும் ஆதாரங்கள்")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {T("Resident Grievance Officer", "குறைதீர்ப்பு அதிகாரி")}
                  </span>
                  <a href="mailto:vizhitnin@gmail.com" className="text-blue-600 dark:text-blue-400 font-mono hover:underline">
                    vizhitnin@gmail.com
                  </a>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {T("IT Rules 2021 compliance & content dispute", "சட்டப்பூர்வ குறைதீர்ப்பு & தனியுரிமை")}
                  </span>
                </div>
              </div>
            </div>

            {/* Committed Response SLA Desk */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                {T("Response Turnaround SLAs", "பதில் அளிக்கும் கால வரம்பு")}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-semibold">
                  <span>{T("Privacy & Content Dispute", "தனியுரிமை & புகார்")}</span>
                  <span className="font-black font-mono">&lt; 6 Hours</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold">
                  <span>{T("Technical & Account Help", "தொழில்நுட்ப உதவி")}</span>
                  <span className="font-black font-mono">&lt; 12 Hours</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  <span>{T("General Feedback & Inquiries", "பொது கருத்துக்கள்")}</span>
                  <span className="font-black font-mono">&lt; 24-48 Hours</span>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Warning */}
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                {T("LIFE & CIVIC EMERGENCY NOTICE", "அவசர கால அறிவிப்பு")}
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed mb-3">
                {T(
                  "For immediate life hazards, snapped live power wires, flood emergencies, or acute medical needs, do not send an email inquiry.",
                  "மின்கம்பி அறுந்து விழுதல் அல்லது தீவிர மருத்துவ அவசரங்களுக்கு மின்னஞ்சல் அனுப்ப காத்திருக்க வேண்டாம்."
                )}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="tel:112"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3 fill-current" />
                  {T("Call 112", "112 அழைக்க")}
                </a>
                <Link
                  href="/helplines"
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl inline-flex items-center gap-1 transition-colors"
                >
                  {T("All Helplines →", "அனைத்து எண்கள் →")}
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {T("Contact & Moderation FAQs", "தொடர்பு & குறைதீர்ப்பு சந்தேகங்கள்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {T("Clarifications on complaint dispute policies, government liaisons, and privacy.", "புகார் மேலாண்மை கொள்கை மற்றும் தனியுரிமை விளக்கங்கள்.")}
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {T(faq.q_en, faq.q_ta)}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <p className="mt-3">{T(faq.a_en, faq.a_ta)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Universal Cross-Links */}
        <UniversalCrossLinks pageType="support" />
      </div>
    </div>
  );
}
