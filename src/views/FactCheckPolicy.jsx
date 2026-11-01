"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2, Clock, ShieldAlert, Mail,
  AlertTriangle, FileText, Check, HelpCircle, ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

export default function FactCheckPolicy() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  usePageMeta({
    title: "Fact-Checking & Corrections Policy | VizhiTN",
    description: "Learn how VizhiTN verifies civic alerts, cross-checks departmental notices, and maintains a transparent, public 24-hour corrections protocol across Tamil Nadu.",
  });

  const WORKFLOW = [
    {
      step: "Step 1",
      title_en: "Primary Order & Notice Acquisition",
      title_ta: "அதிகாரப்பூர்வ உத்தரவுகள் பெறுதல்",
      desc_en: "We monitor official departmental publishing channels: DIPR releases, district collectorate circulars, TANGEDCO substation schedules, and Southern Railway operational bulletins. Secondary media reports or social media rumors are never accepted without primary corroboration.",
      desc_ta: "செய்தி மக்கள் தொடர்புத்துறை (DIPR), மாவட்ட ஆட்சியர் அலுவலக சுற்றறிக்கைகள், மின்வாரிய பராமரிப்பு அட்டவணைகள் ஆகியவற்றை நேரடியாகப் பெற்று செய்திகள் தொகுக்கப்படுகின்றன. சமூக ஊடக வதந்திகள் ஏற்கப்படுவதில்லை."
    },
    {
      step: "Step 2",
      title_en: "Geographic & Feeder Boundary Cross-Check",
      title_ta: "புவியியல் மற்றும் பகுதி எல்லை சரிபார்ப்பு",
      desc_en: "For municipal and electricity notices, our desk checks exact substation names, feeder numbers, and ward boundaries against official municipal maps to prevent false panic in unaffected neighborhoods.",
      desc_ta: "மின்தடை அல்லது குடிநீர் பராமரிப்பு அறிவிப்புகளில் குறிப்பிடப்படும் துணை மின்நிலையம் மற்றும் வார்டு பகுதிகள் வரைபடங்கள் மூலம் துல்லியமாக சரிபார்க்கப்படுகின்றன."
    },
    {
      step: "Step 3",
      title_en: "Control Room Verification",
      title_ta: "அரசு கட்டுப்பாட்டு அறை உறுதிப்படுத்தல்",
      desc_en: "In urgent weather or emergency events, notices are cross-referenced directly with 24x7 control rooms: GCC Control (1913), TANGEDCO Minnalagam (1912), or District Disaster Control (1077).",
      desc_ta: "மழை வெள்ளம் அல்லது அவசர காலங்களில், மாநகராட்சி கட்டுப்பாட்டு அறை (1913) மற்றும் பேரிடர் மேலாண்மை அறை (1077) தொடர்பு கொள்ளப்பட்டு உண்மைத்தன்மை உறுதி செய்யப்படுகிறது."
    },
    {
      step: "Step 4",
      title_en: "Citizen Ground-Truth & Photo Receipts",
      title_ta: "பொதுமக்கள் கள ஆதாரம் & புகைப்பட ரசீதுகள்",
      desc_en: "For civic complaints (burst pipelines, pothole hazards, street light failures), our platform requires timestamped evidence or GPS verification from local residents before surfacing grievance receipts on the live feed.",
      desc_ta: "குடிநீர் கசிவு அல்லது சாலை சீரமைப்பு புகார்களுக்கு, பொதுமக்களின் ஜிபிஎஸ் குறியீட்டுடன் கூடிய புகைப்பட சான்றுகள் கள ஆதாரமாக இணைக்கப்படுகின்றன."
    }
  ];

  const SLA = [
    {
      type_en: "Critical Utility & Public Safety",
      type_ta: "அவசர பயன்பாடு & பாதுகாப்பு",
      time: "< 2 Hours",
      desc_en: "Misreported power cut timings, road hazard coordinates, or storm subway closures are corrected within 120 minutes."
    },
    {
      type_en: "General News & Scheme Details",
      type_ta: "பொதுச் செய்தி & அரசு திட்டங்கள்",
      time: "< 24 Hours",
      desc_en: "Documentation requirements, eligibility age limits, or circular numbers are audited and corrected within 24 hours."
    },
    {
      type_en: "Public Clarification Notices",
      type_ta: "வெளிப்படையான திருத்தக் குறிப்பு",
      time: "Immediate",
      desc_en: "Every corrected article features a visible 'Correction & Update' box at the top, stating the date, time, and exact nature of the change."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <section className="bg-gradient-to-b from-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
            {T("Fact-Checking & Corrections Standards", "உண்மை சரிபார்ப்பு & திருத்த நெறிமுறைகள்")}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {T("How VizhiTN Verifies Facts", "VizhiTN தகவல்களை எவ்வாறு சரிபார்க்கிறது?")}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-indigo-100/90 leading-relaxed">
            {T(
              "Our rigorous 4-step verification framework, strict anti-misinformation rules, and transparent public corrections commitment.",
              "போலிச் செய்திகளைத் தவிர்த்து, 100% நம்பகமான அரசு மற்றும் மக்கள் நலத் தகவல்களை வழங்க நாங்கள் பின்பற்றும் 4 அடுக்கு சரிபார்ப்பு முறை."
            )}
          </p>
        </div>
      </section>

      {/* 4-Step Pipeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {T("The 4-Step Verification Workflow", "4 அடுக்கு சரிபார்ப்பு வழிமுறை")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {T("Every alert and guide passes through these checks before publication.", "ஒவ்வொரு செய்தியும் வாசகர்களை சென்றடையும் முன் இந்த ஆய்வுக்கு உட்படுத்தப்படுகிறது.")}
          </p>
        </div>

        <div className="space-y-6">
          {WORKFLOW.map((w, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                0{idx + 1}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {w.step}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 mb-1.5">
                  {T(w.title_en, w.title_ta)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {T(w.desc_en, w.desc_ta)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Corrections Protocol */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-bold text-xl">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {T("Our Public Corrections Protocol", "வெளிப்படையான திருத்த உத்தரவாதம்")}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {T(
              "We hold ourselves accountable to our readers. When an error is confirmed, we correct it promptly and transparently without silent deletion.",
              "வாசகர்களின் நம்பிக்கையே எமது பலம். செய்தியில் ஏதேனும் தவறு இருப்பின், அதனை ரகசியமாக நீக்காமல், வெளிப்படையான திருத்தக் குறிப்புடன் புதுப்பிக்கிறோம்."
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SLA.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">
                  {s.time}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {T(s.type_en, s.type_ta)}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {s.desc_en}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-xl border border-amber-200 dark:border-amber-900/40">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-600" />
              {T("How to Request a Fact-Check or Correction", "தகவல் சரிபார்ப்பு அல்லது திருத்தம் கோர")}
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-200/80 leading-relaxed mb-3">
              {T(
                "If you spot an inaccurate street name, outdated timing, or revised departmental circular, please notify our editorial desk immediately.",
                "ஏதேனும் தகவலில் மாற்றம் இருப்பின், அதனை எமது ஆசிரியர் குழுவிற்கு உடனே தெரிவிக்கலாம்."
              )}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="text-slate-900 dark:text-white font-bold">Email: vizhitnin@gmail.com</span>
              <span className="text-slate-400">|</span>
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 underline font-sans font-semibold">
                {T("Submit via Online Helpdesk Form →", "இணையவழி உதவி மையம் மூலம் அனுப்ப →")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cross Links */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <UniversalCrossLinks />
      </div>
    </div>
  );
}

