"use client";

import React from "react";
import Link from "next/link";
import {
  Shield, CheckCircle2, FileText, AlertTriangle,
  Scale, Lock, Eye, Building2, Phone, Mail, Award, Clock
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

export default function EditorialPolicy() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  usePageMeta({
    title: "Editorial Standards, Sourcing & Ethics Policy | VizhiTN",
    description: "The official editorial constitution of VizhiTN: primary source verification, strict non-partisan integrity, AI transparency, and citizen accountability standards.",
  });

  const PRINCIPLES = [
    {
      num: "01",
      title_en: "Primary Government & Departmental Sourcing Only",
      title_ta: "அரசு அதிகாரப்பூர்வ தகவல்கள் மட்டுமே",
      desc_en: "Every civic alert, power cut notification, road closure, and welfare scheme guide published on VizhiTN must cite and link back to a named primary source: official Government Orders (G.O.), DIPR Tamil Nadu press releases, TANGEDCO circulars, or emergency control room announcements.",
      desc_ta: "VizhiTN தளத்தில் வெளியாகும் ஒவ்வொரு மின்தடை, குடிநீர் மற்றும் நலத்திட்ட தகவல்களும் அரசு செய்திக்குறிப்பு (DIPR), மின்வாரிய அறிவிப்புகள் (1912) மற்றும் மாநகராட்சி ஆணைகளை அடிப்படையாகக் கொண்டு மட்டுமே வெளியிடப்படுகின்றன."
    },
    {
      num: "02",
      title_en: "Absolute Non-Partisan Editorial Independence",
      title_ta: "முழுமையான நடுநிலை மற்றும் அரசியல் சார்பின்மை",
      desc_en: "VizhiTN operates with complete editorial independence. We do not publish speculative political rumors, unverified party claims, or election forecasts. Our focus is strictly confined to public administration, civic infrastructure, citizen rights, and government welfare delivery.",
      desc_ta: "VizhiTN எந்தவொரு அரசியல் கட்சியையோ அல்லது அமைப்பையோ சாராதது. அரசியல் வதந்திகள் அல்லது ஆதாரமற்ற ஊகங்கள் எமது தளத்தில் வெளியிடப்படுவதில்லை. மக்கள் நலன் மற்றும் பொது உள்கட்டமைப்பு சேவைகளே எமது தலையாய நோக்கம்."
    },
    {
      num: "03",
      title_en: "Zero Hallucination & Fact-Checking Rigor",
      title_ta: "கற்பனைக் கதைகள் தவிர்ப்பு & உண்மைச் சரிபார்ப்பு",
      desc_en: "We strictly ban vague or speculative reporting. Scheduled power cuts must list exact street names and exact hours (e.g. '9:00 AM to 2:00 PM'). Rain alerts must cite official District Collector ROC orders or IMD red/orange bulletins. If an order cannot be corroborated, it is not published.",
      desc_ta: "தோராயமான அல்லது உறுதிப்படுத்தப்படாத செய்திகள் கண்டிப்பாக தவிர்க்கப்படுகின்றன. மின்தடை அறிவிப்புகள் குறிப்பிட்ட தெருக்கள் மற்றும் நேரத்துடனும் (காலை 9 முதல் மதியம் 2 வரை), மழை விடுமுறை அறிவிப்புகள் மாவட்ட ஆட்சியர் உத்தரவுடனும் மட்டுமே வெளியிடப்படுகின்றன."
    },
    {
      num: "04",
      title_en: "AI Transparency & Human Editorial Supervision",
      title_ta: "செயற்கை நுண்ணறிவு நெறிமுறைகள் & மனித மேற்பார்வை",
      desc_en: "While modern computational tools and RSS data ingestion assist our newsroom in sorting district gazettes and bilingual translation (Tamil and English), every single editorial publication is guided and validated under human editorial supervision.",
      desc_ta: "தொழில்நுட்ப மற்றும் தரவு சேகரிப்பு கருவிகள் உதவினாலும், அனைத்து செய்திகளும் VizhiTN ஆசிரியர் குழுவின் மனித ஆய்வுக்குப் பின்னரே வாசகர்களுக்கு வழங்கப்படுகின்றன."
    },
    {
      num: "05",
      title_en: "Commercial Firewall & Advertising Independence",
      title_ta: "விளம்பரத் தலையீடு அற்ற சுதந்திரமான தளம்",
      desc_en: "Advertisers and sponsors have zero influence over our civic verification, citizen complaint tracking, or emergency utility advisories. Sponsored content, if any, is clearly labeled and strictly firewalled from editorial reporting.",
      desc_ta: "விளம்பரதாரர்கள் எமது குடிமை குறைதீர்ப்பு அல்லது அவசர எச்சரிக்கை செய்திகளில் எந்தவொரு தலையீடும் செய்ய முடியாது. பொதுச் செய்திகள் முற்றிலும் பாரபட்சமற்றவை."
    },
    {
      num: "06",
      title_en: "Public Accountability & 24-Hour Corrections",
      title_ta: "வெளிப்படையான திருத்தக் கொள்கை (24 மணி நேரம்)",
      desc_en: "We believe accountability is the core of trust. If any error of fact, timing, or location is identified by readers or municipal authorities, it is investigated immediately and corrected on the public record within 24 hours.",
      desc_ta: "தகவல் அல்லது நேரத்தில் ஏதேனும் தவறு இருப்பின், சுட்டிக்காட்டப்பட்ட 24 மணி நேரத்திற்குள் எமது ஆசிரியர் குழு அதை ஆராய்ந்து உரிய திருத்தத்தை வெளிப்படையாக வெளியிடும்."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <section className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            {T("Editorial Standards & Publishing Ethics", "VizhiTN தலையங்கக் கொள்கை")}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {T("The VizhiTN Editorial Constitution", "செய்தி வெளியீட்டு நெறிமுறைகள்")}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            {T(
              "Our non-negotiable rules for factual integrity, primary government verification, non-partisan coverage, and citizen trust across Tamil Nadu.",
              "தமிழ்நாட்டின் 38 மாவட்டங்களிலும் நம்பகமான, அரசு அங்கீகரிக்கப்பட்ட குடிமைச் செய்திகளை வழங்க நாங்கள் பின்பற்றும் வழிகாட்டு நெறிமுறைகள்."
            )}
          </p>
        </div>
      </section>

      {/* Main Principles */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {PRINCIPLES.map((p, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl sm:text-3xl font-black text-blue-600/40 dark:text-blue-400/30 font-mono">
                  {p.num}
                </span>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {T(p.title_en, p.title_ta)}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {T(p.desc_en, p.desc_ta)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Whitelist */}
        <div className="mt-12 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl p-6 sm:p-8 border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center gap-2 mb-3 text-blue-900 dark:text-blue-300 font-bold text-base sm:text-lg">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {T("Primary Departmental Sources Whitelist", "அங்கீகரிக்கப்பட்ட அரசு தகவல் மூலங்கள்")}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            {T(
              "Every civic notification references working emergency control numbers. Our automated and manual checks corroborate updates with:",
              "எமது செய்திகள் கீழ்க்கண்ட அரசு கட்டுப்பாட்டு அறைகள் மற்றும் உதவி எண்களுடன் நேரடியாக ஒப்பிடப்படுகின்றன:"
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 font-mono">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              ⚡ <strong>TANGEDCO Minnalagam:</strong> 1912 / 94987 94987
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              🏛️ <strong>Greater Chennai Corporation:</strong> 1913
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              💧 <strong>Metrowater / CMWSSB:</strong> 044-45674567
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              📋 <strong>Civil Supplies & PDS (Ration):</strong> 1967
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              🚨 <strong>National Cyber Crime Helpline:</strong> 1930
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              🌧️ <strong>Disaster Management (TNDMA):</strong> 1070 / 1077
            </div>
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-6">
          <Link href="/editorial-team" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {T("Meet the Editorial Board →", "ஆசிரியர் குழுவைப் பார்க்க →")}
          </Link>
          <Link href="/fact-check-policy" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {T("Fact-Checking & Corrections SLA →", "உண்மை சரிபார்ப்பு & திருத்த விதிகள் →")}
          </Link>
          <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {T("Submit a Grievance or Correction →", "தகவல் திருத்தத்திற்கு விண்ணப்பிக்க →")}
          </Link>
        </div>
      </section>

      {/* Cross Links */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <UniversalCrossLinks />
      </div>
    </div>
  );
}

