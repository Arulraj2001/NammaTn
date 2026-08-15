"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import {
  Shield, BookOpen, Gift, FileText, AlertTriangle, Building2,
  Zap, MessageCircle, HelpCircle, Map, ArrowRight, ExternalLink
} from "lucide-react";

export default function AwarenessRelatedLinks({ currentSection }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const ARTICLES_LINKS = [
    {
      title_en: "Tamil Nadu e-Sevai Online Certificate Guide",
      title_ta: "தமிழ்நாடு இ-சேவை சான்றிதழ்கள் வழிகாட்டி",
      href: "/awareness/article/tamil-nadu-esevai-online-services-guide",
      tag_en: "e-Sevai Guide",
      tag_ta: "இ-சேவை",
    },
    {
      title_en: "How to File RTI Application in Tamil Nadu",
      title_ta: "தமிழ்நாட்டில் RTI மனு தாக்கல் செய்யும் முறை",
      href: "/awareness/article/how-to-file-rti-application-tamil-nadu-guide",
      tag_en: "RTI Filing",
      tag_ta: "RTI வழிகாட்டி",
    },
    {
      title_en: "Patta, Chitta & EC Verification Guide",
      title_ta: "பட்டா, சிட்டா & வில்லங்கச் சான்றிதழ் சரிபார்ப்பு",
      href: "/awareness/article/patta-chitta-fmb-ec-land-records-guide-tamil-nadu",
      tag_en: "Land Records",
      tag_ta: "நில ஆவணங்கள்",
    },
    {
      title_en: "Traffic Police Vehicle Checks & Driver Rights",
      title_ta: "வாகன சோதனையின் போது ஓட்டுநர்களின் சட்ட உரிமைகள்",
      href: "/awareness/article/traffic-police-vehicle-check-citizen-rights-guide",
      tag_en: "Traffic Laws",
      tag_ta: "போக்குவரத்து விதி",
    },
    {
      title_en: "CMCHIS Health Insurance ₹5 Lakh Cashless Coverage",
      title_ta: "முதலமைச்சர் காப்பீட்டுத் திட்டத்தில் ₹5 லட்சம் சிகிச்சை",
      href: "/awareness/article/cmchis-health-insurance-coverage-hospital-guide",
      tag_en: "Health Scheme",
      tag_ta: "சுகாதாரக் காப்பீடு",
    },
  ];

  const RIGHTS_LINKS = [
    {
      title_en: "Right to Information Act 2005 (RTI)",
      title_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005",
      href: "/awareness/right/right-to-information-act-2005",
      desc_en: "Demand answers & government files within 30 days.",
      desc_ta: "அரசு ஆவணங்களை 30 நாளில் பெறும் உரிமை.",
    },
    {
      title_en: "Consumer Protection Rights (Act 2019)",
      title_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள் 2019",
      href: "/awareness/right/consumer-protection-rights-2019",
      desc_en: "File online consumer cases without a lawyer.",
      desc_ta: "வழக்கறிஞர் இன்றி நுகர்வோர் வழக்கு பதிவு.",
    },
    {
      title_en: "Senior Citizens Protection & Maintenance Act",
      title_ta: "மூத்த குடிமக்கள் பாதுகாப்பு சட்டம்",
      href: "/awareness/right/senior-citizens-protection-act",
      desc_en: "Statutory rights for care, maintenance & property.",
      desc_ta: "முதியோர் பராமரிப்பு & சொத்து பாதுகாப்பு உரிமை.",
    },
    {
      title_en: "Traffic Police Vehicle Inspection Rules",
      title_ta: "போக்குவரத்து வாகன சோதனை விதிகள்",
      href: "/awareness/right/traffic-police-check-citizen-rights",
      desc_en: "DigiLocker validity, officer ranks & key snatching rules.",
      desc_ta: "டிஜிலாக்கர் செல்லுபடி & சாவி பிடுங்கத் தடை.",
    },
  ];

  const CIVIC_TOOLS = [
    {
      title_en: "Bribe Tracker Log",
      title_ta: "லஞ்சக் கண்காணிப்பு",
      href: "/bribes",
      icon: AlertTriangle,
      desc_en: "Track & report local corruption demands anonymously.",
      desc_ta: "உள்ளூர் லஞ்சக் புகார்களைக் கண்காணிக்கவும்.",
      color: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800/50",
    },
    {
      title_en: "Local Scam Alerts",
      title_ta: "மோசடி எச்சரிக்கைகள்",
      href: "/scams",
      icon: Shield,
      desc_en: "Stay safe from job, land, and digital financial scams.",
      desc_ta: "வேலை மற்றும் நில மோசடிகளில் இருந்து பாதுகாப்பாக இருக்கவும்.",
      color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
    },
    {
      title_en: "Government Offices Directory",
      title_ta: "அரசு அலுவலகங்கள்",
      href: "/offices",
      icon: Building2,
      desc_en: "Find VAO, Tahsildar, EB, and Corporation offices in TN.",
      desc_ta: "உள்ளூர் VAO, தாசில்தார், EB அலுவலகங்களைக் கண்டறியவும்.",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    },
    {
      title_en: "Ask Local Community",
      title_ta: "உள்ளூரினரிடம் கேளுங்கள்",
      href: "/ask",
      icon: MessageCircle,
      desc_en: "Get real answers about procedures & locations from locals.",
      desc_ta: "உள்ளூர் மக்களிடம் கேள்விகள் கேட்டு தெளிவு பெறவும்.",
      color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
    },
  ];

  return (
    <section className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-10">
      {/* ── Related Knowledge Base Articles ────────────────── */}
      {currentSection !== "articles" && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {T("Related In-Depth Knowledge Articles", "தொடர்புடைய அறிவுத் தளம் கட்டுரைகள்")}
              </h3>
            </div>
            <Link
              href="/awareness/articles"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>{T("View All Articles", "அனைத்து கட்டுரைகள்")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ARTICLES_LINKS.map((art, idx) => (
              <Link
                key={idx}
                href={art.href}
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 mb-2">
                    {T(art.tag_en, art.tag_ta)}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {T(art.title_en, art.title_ta)}
                  </h4>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{T("Read Article", "வாசிக்க")}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Related Statutory Rights ────────────────────────── */}
      {currentSection !== "rights" && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {T("Statutory Rights & Protection Laws", "குடிமக்களுக்கான சட்டப்பூர்வ உரிமைகள்")}
              </h3>
            </div>
            <Link
              href="/awareness/rights"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>{T("View All Rights", "அனைத்து உரிமைகள்")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RIGHTS_LINKS.map((r, idx) => (
              <Link
                key={idx}
                href={r.href}
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition shadow-sm"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {T(r.title_en, r.title_ta)}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {T(r.desc_en, r.desc_ta)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Direct Civic Transparency & Action Tools ───────── */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {T("Civic Transparency & Action Tools", "குடிமைச் செயலி கருவிகள்")}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CIVIC_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Link
                key={idx}
                href={tool.href}
                className={`p-4 rounded-xl border transition shadow-sm hover:shadow-md flex flex-col justify-between ${tool.color}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <h4 className="text-sm font-bold leading-tight">
                      {T(tool.title_en, tool.title_ta)}
                    </h4>
                  </div>
                  <p className="text-xs opacity-90 leading-snug">
                    {T(tool.desc_en, tool.desc_ta)}
                  </p>
                </div>
                <div className="mt-3 text-xs font-bold flex items-center gap-1">
                  <span>{T("Open Tool", "திற")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
