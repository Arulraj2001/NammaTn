"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText, Mail, Download, ExternalLink, Globe, Shield,
  Building2, MapPin, Zap, CheckCircle2, ArrowRight, BookOpen,
  Scale, Flame, AlertCircle, Share2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import UniversalCrossLinks from "@/components/seo/UniversalCrossLinks";

export default function Press() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const KEY_FACTS = [
    { label_en: "Live Since", label_ta: "துவக்கம்", value: "2026", sub_en: "Founded in Chennai", sub_ta: "சென்னையில் தொடங்கப்பட்டது" },
    { label_en: "Districts Covered", label_ta: "மாவட்டங்கள்", value: "38", sub_en: "All revenue districts", sub_ta: "அனைத்து 38 மாவட்டங்கள்" },
    { label_en: "Active Civic Reports", label_ta: "குடிமைப் புகார்கள்", value: "650+", sub_en: "GPS & photo verified", sub_ta: "புகைப்பட சான்றுடன்" },
    { label_en: "TN Today Articles", label_ta: "செய்தி கட்டுரைகள்", value: "166+", sub_en: "In-depth investigative", sub_ta: "ஆழமான புலனாய்வு" },
    { label_en: "Total Sitemap URLs", label_ta: "தளப்பக்கங்கள்", value: "1,400+", sub_en: "Indexed public URLs", sub_ta: "பொது இணைப்புகள்" },
    { label_en: "Languages", label_ta: "மொழிகள்", value: "EN + TA", sub_en: "Bilingual coverage", sub_ta: "இருமொழி சேவை" },
  ];

  const PLATFORM_SECTIONS = [
    {
      title_en: "Civic Reports & Victory Wall",
      title_ta: "குடிமை புகார்கள் & வெற்றிச் சுவர்",
      desc_en: "Citizen-reported road craters, water leaks, and municipal hazards with GPS proof.",
      desc_ta: "பொதுமக்கள் சமர்ப்பிக்கும் சாலை, கழிவுநீர், மின்தடை புகார்கள்.",
      href: "/explore",
      tag: "Proof Engine"
    },
    {
      title_en: "TN Today Newsroom",
      title_ta: "TN Today செய்திப் பிரிவு",
      desc_en: "Original ground reporting on Tamil Nadu state policies, infrastructure, and governance.",
      desc_ta: "தமிழக உள்கட்டமைப்பு மற்றும் அரசு திட்டங்கள் குறித்த செய்திகள்.",
      href: "/tn-today",
      tag: "Editorial"
    },
    {
      title_en: "Power Cuts Today Tamil Nadu",
      title_ta: "இன்றைய மின்தடை அறிவிப்புகள்",
      desc_en: "Live scheduled substation shutdowns from TANGEDCO across all 38 districts.",
      desc_ta: "மின்வாரியத்தின் திட்டமிட்ட பராமரிப்பு மின்தடை அட்டவணை.",
      href: "/power-cuts-today-tamil-nadu",
      tag: "Utility Dispatches"
    },
    {
      title_en: "RTI Assistant",
      title_ta: "தகவல் அறியும் உரிமை உதவியாளர்",
      desc_en: "Instant, legally formatted Right to Information application generator for Tamil Nadu.",
      desc_ta: "தமிழ்நாடு அரசு துறைகளுக்கான ஆர்டிஐ மனு வரைவு செயலி.",
      href: "/rti",
      tag: "Citizen Rights"
    },
    {
      title_en: "Cyber Scam Radar & 1930 Hotline",
      title_ta: "சைபர் மோசடி தடுப்பு & 1930 உதவி எண்",
      desc_en: "Real-time alerts on fake EB bill SMS, Telegram scams, and 1930 Golden Hour freeze guides.",
      desc_ta: "போலி மின்கட்டண குறுஞ்செய்தி, வங்கி மோசடி எச்சரிக்கைகள் மற்றும் 1930 வழிகாட்டிகள்.",
      href: "/scams",
      tag: "Public Safety"
    },
    {
      title_en: "Helplines Directory",
      title_ta: "அரசு அவசர உதவி எண்கள்",
      desc_en: "24x7 verified departmental phone numbers including Minnalagam 1912, GCC 1913, 1930.",
      desc_ta: "மின்னகம் 1912, மாநகராட்சி 1913, சைபர் கிரைம் 1930 எண்கள்.",
      href: "/helplines",
      tag: "Emergency SOS"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* ── HEADER & ABOUT SECTION ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Globe className="w-3.5 h-3.5" />
            {T("Press Room & Media Kit", "பத்திரிகை அறை & ஊடக தொகுப்பு")}
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {T("The Eyes of Tamil Nadu", "தமிழ்நாட்டின் விழி")}
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-6">
            {T(
              "VizhiTN was born to give 7.2 crore citizens persistent public proof, real-time utility transparency, and verified accountability across all 38 districts.",
              "7.2 கோடி தமிழக மக்களுக்கு நிலையான பொது ஆதாரம், நிகழ்நேர பயன்பாட்டு வெளிப்படைத்தன்மை மற்றும் அனைத்து 38 மாவட்டங்களிலும் உறுதிசெய்யப்பட்ட பொறுப்புணர்வை வழங்க விழிடிஎன் உருவாக்கப்பட்டது."
            )}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {T(
              "Founded in Chennai in 2026, VizhiTN operates as a bilingual (English & Tamil) NewsMediaOrganization and citizen civic tech network. By uniting citizen photojournalism with official departmental transparency, VizhiTN bridges the gap between public grievances and municipal resolution.",
              "2026 ஆம் ஆண்டு சென்னையில் தொடங்கப்பட்ட விழிடிஎன், ஆங்கிலம் மற்றும் தமிழ் இருமொழிகளிலும் இயங்கும் சுயேச்சையான செய்தி ஊடகம் மற்றும் குடிமக்கள் தொழில்நுட்ப தளமாகும்."
            )}
          </p>
        </div>

        {/* ── KEY FACTS GRID ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {T("Key Facts & Figures", "முக்கிய தரவுகள் & எண்கள்")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {T("Verified platform metrics as of 2026", "2026 ஆம் ஆண்டின் சரிபார்க்கப்பட்ட அளவீடுகள்")}
              </p>
            </div>
            <div className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-400">
              {T("Coverage: Power cuts, water, roads, scams, helplines, schemes, citizen rights", "மின்வெட்டு, குடிநீர், சாலை, மோசடி தடுப்பு, உதவி எண்கள், திட்டங்கள்")}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {KEY_FACTS.map((fact, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">
                  {fact.value}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {T(fact.label_en, fact.label_ta)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {T(fact.sub_en, fact.sub_ta)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PLATFORM SECTIONS ── */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {T("Platform Ecosystem & Sections", "தளத்தின் முக்கிய பிரிவுகள்")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
            {T("Direct links for journalists, researchers, and directories", "பத்திரிகையாளர்கள் மற்றும் ஆய்வாளர்களுக்கான நேரடி இணைப்புகள்")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLATFORM_SECTIONS.map((sec, idx) => (
              <Link
                key={idx}
                href={sec.href}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sec.tag}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {T(sec.title_en, sec.title_ta)}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {T(sec.desc_en, sec.desc_ta)}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  vizhitn.in{sec.href}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── MEDIA DOWNLOAD ASSETS & BOILERPLATE ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
              {T("Brand Assets & Media Resources", "ஊடக ஆவணங்கள் & லோகோ")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {T("Official high-resolution graphics and site descriptions for publication", "செய்தி வெளியீடுகளுக்கான அதிகாரப்பூர்வ லோகோ மற்றும் குறிப்புகள்")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo download */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <Image
                    src="/apple-touch-icon.png"
                    alt="VizhiTN Brand Logo"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">VizhiTN Official Icon</h4>
                  <p className="text-xs text-slate-500">PNG format (512x512, transparent / high-res)</p>
                </div>
              </div>
              <a
                href="/apple-touch-icon.png"
                download="vizhitn-logo.png"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-900 transition-colors flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>

            {/* OG Image download */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Editorial Card / OG Banner</h4>
                  <p className="text-xs text-slate-500">1200x630 social share graphic</p>
                </div>
              </div>
              <a
                href="/og-image.png"
                download="vizhitn-og.png"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-900 transition-colors flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          </div>

          {/* Boilerplate Copy for Journalists */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Boilerplate for Journalists & Directories
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 select-all">
              &quot;VizhiTN helps Tamil Nadu residents report civic issues, track resolutions, share local alerts, find public resources, and connect with their community.&quot;
            </p>
          </div>
        </div>

        {/* ── MEDIA INQUIRIES & CONTACT DESK ── */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <Mail className="w-3.5 h-3.5" />
              Direct Press Desk
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Journalist Inquiries & Editorial Briefings
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Our newsroom desk provides real-time civic data, district incident statistics, and interview responses for local and national reporters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
            <a
              href="mailto:vizhitnin@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-950 font-bold text-xs rounded-xl shadow-lg hover:bg-blue-50 transition-all text-center"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              vizhitnin@gmail.com
            </a>
          </div>
        </div>

        {/* Universal Cross-Links */}
        <UniversalCrossLinks pageType="support" />

      </div>
    </div>
  );
}
