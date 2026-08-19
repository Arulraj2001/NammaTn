"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import {
  Shield, BookOpen, AlertTriangle, Building2,
  Zap, ArrowRight, Phone
} from "lucide-react";
import CustomAdBanner from "@/components/ads/CustomAdBanner";

export default function SidebarRelatedLinks({ type = "article", category, currentSlug, extraLinks = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const QUICK_ARTICLES = [
    { title_en: "e-Sevai Certificates Guide", title_ta: "இ-சேவை சான்றிதழ்கள் வழிகாட்டி", href: "/awareness/article/tamil-nadu-esevai-online-services-guide" },
    { title_en: "RTI Application Filing Guide", title_ta: "RTI விண்ணப்பிக்கும் முறை", href: "/awareness/article/how-to-file-rti-application-tamil-nadu-guide" },
    { title_en: "Patta & Land Records Verification", title_ta: "பட்டா & நில ஆவணங்கள் சரிபார்ப்பு", href: "/awareness/article/patta-chitta-fmb-ec-land-records-guide-tamil-nadu" },
    { title_en: "Traffic Police Inspection Rights", title_ta: "வாகன சோதனை ஓட்டுநர் உரிமைகள்", href: "/awareness/article/traffic-police-vehicle-check-citizen-rights-guide" },
    { title_en: "CMCHIS Health Insurance ₹5 L Coverage", title_ta: "முதலமைச்சர் காப்பீட்டுத் திட்டம்", href: "/awareness/article/cmchis-health-insurance-coverage-hospital-guide" },
  ].filter(a => a.href !== `/awareness/article/${currentSlug}`);

  const QUICK_RIGHTS = [
    { title_en: "Right to Information (RTI Act 2005)", title_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005", href: "/awareness/right/right-to-information-act-2005" },
    { title_en: "Consumer Protection Rights 2019", title_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள்", href: "/awareness/right/consumer-protection-rights-2019" },
    { title_en: "Senior Citizens Protection Act", title_ta: "மூத்த குடிமக்கள் பாதுகாப்பு சட்டம்", href: "/awareness/right/senior-citizens-protection-act" },
  ].filter(r => r.href !== `/awareness/right/${currentSlug}`);

  return (
    <aside className="space-y-6">
      {/* ── Bottom Dedicated Sidebar Ad Slot (#2) ──────────── */}
      <CustomAdBanner slot="sidebar_bottom" />

      {/* ── Quick Tools & Action Box ──────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{T("Civic Tools & Action", "குடிமைச் செயலி கருவிகள்")}</span>
        </h3>
        <div className="space-y-2">
          <Link
            href="/bribes"
            className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {T("Report Corruption / Bribe Demand", "லஞ்சப் புகார் அளிக்குக")}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/scams"
            className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-400 hover:bg-amber-100 transition-colors text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {T("Check & Report Fraud / Scams", "மோசடி எச்சரிக்கை சாரி பார்")}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/offices"
            className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {T("Find Nearby Public Offices", "அரசு அலுவலகங்கள் கண்டறி")}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Related Knowledge Articles ───────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>{T("Essential Guides", "அத்தியாவசிய வழிகாட்டிகள்")}</span>
          </h3>
          <Link href="/awareness/articles" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            {T("View All", "அனைத்தும்")}
          </Link>
        </div>
        <div className="space-y-2.5">
          {QUICK_ARTICLES.slice(0, 4).map((art, idx) => (
            <Link
              key={idx}
              href={art.href}
              className="block p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition group"
            >
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                {T(art.title_en, art.title_ta)}
              </h4>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Statutory Citizen Rights ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>{T("Statutory Rights", "சட்டப்பூர்வ உரிமைகள்")}</span>
          </h3>
          <Link href="/awareness/rights" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
            {T("View All", "அனைத்தும்")}
          </Link>
        </div>
        <div className="space-y-2.5">
          {QUICK_RIGHTS.map((r, idx) => (
            <Link
              key={idx}
              href={r.href}
              className="block p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border-2 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition group"
            >
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {T(r.title_en, r.title_ta)}
              </h4>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Direct Custom Ad Banner Slot ─────────────────── */}
      <CustomAdBanner slot="sidebar" />

      {/* ── Emergency Contact Card ──────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm border-2 border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-4 h-4 text-rose-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {T("TN Emergency Helplines", "தமிழ்நாடு அவசர எண்கள்")}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <div className="bg-white/10 p-2 rounded-lg text-center border border-white/10">
            <span className="block text-[10px] text-slate-300 font-medium">{T("Police", "காவல்துறை")}</span>
            <span className="font-extrabold text-rose-400">100 / 112</span>
          </div>
          <div className="bg-white/10 p-2 rounded-lg text-center border border-white/10">
            <span className="block text-[10px] text-slate-300 font-medium">{T("Ambulance", "ஆம்புலன்ஸ்")}</span>
            <span className="font-extrabold text-rose-400">108</span>
          </div>
          <div className="bg-white/10 p-2 rounded-lg text-center border border-white/10">
            <span className="block text-[10px] text-slate-300 font-medium">{T("Women Helpline", "பெண்கள் உதவி")}</span>
            <span className="font-extrabold text-rose-400">181</span>
          </div>
          <div className="bg-white/10 p-2 rounded-lg text-center border border-white/10">
            <span className="block text-[10px] text-slate-300 font-medium">{T("Cyber Crime", "சைபர் குற்றங்கள்")}</span>
            <span className="font-extrabold text-rose-400">1930</span>
          </div>
        </div>
        <Link
          href="/help"
          className="mt-3 block text-center py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          {T("View All Emergency Support →", "அனைத்து அவசர உதவி எண்கள் →")}
        </Link>
      </div>
    </aside>
  );
}
