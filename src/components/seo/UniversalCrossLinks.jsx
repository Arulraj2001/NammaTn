"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import {
  Shield, Gift, FileText, AlertTriangle,
  Zap, ArrowRight, Phone
} from "lucide-react";

export default function UniversalCrossLinks({ pageType }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // Define cross-link presets based on pageType
  const getLinks = () => {
    switch (pageType) {
      case "transparency":
        return {
          title_en: "Related Transparency & Rights Tools",
          title_ta: "தொடர்புடைய வெளிப்படைத்தன்மை & சட்ட உரிமைகள்",
          items: [
            { title_en: "How to File RTI Application in TN", title_ta: "தமிழ்நாட்டில் RTI மனு தாக்கல் செய்யும் முறை", href: "/awareness/article/how-to-file-rti-application-tamil-nadu-guide", icon: FileText, desc_en: "Demand answers & government files legally.", desc_ta: "சட்டப்பூர்வமாக பதில் மற்றும் ஆவணம் பெறவும்." },
            { title_en: "Right to Information Act 2005", title_ta: "தகவல் அறியும் உரிமைச் சட்டம் 2005", href: "/awareness/right/right-to-information-act-2005", icon: Shield, desc_en: "30-day mandatory window for government replies.", desc_ta: "30 நாளில் பதில் பெற சட்டப்பூர்வ உரிமை." },
            { title_en: "Local Scam & Fraud Alerts", title_ta: "உள்ளூர் மோசடி எச்சரிக்கைகள்", href: "/scams", icon: AlertTriangle, desc_en: "Protect yourself against job & financial scams.", desc_ta: "வேலை மற்றும் நிதி மோசடிகளில் இருந்து பாதுகாப்போம்." },
            { title_en: "Government Welfare Schemes", title_ta: "அரசு நலத்திட்டங்கள்", href: "/schemes", icon: Shield, desc_en: "Check eligibility for Magalir Urimai & subsidies.", desc_ta: "மகளிர் உரிமை மற்றும் அரசு மானியங்கள்." },
            { title_en: "e-Sevai Online Services Guide", title_ta: "இ-சேவை வழிகாட்டி", href: "/esevai", icon: FileText, desc_en: "Online certificate procedures & direct portals.", desc_ta: "வருமானம், சாதிச் சான்றிதழ் விண்ணப்ப வழிகாட்டல்." },
          ]
        };

      case "scams":
        return {
          title_en: "Related Protection & Consumer Guides",
          title_ta: "தொடர்புடைய பாதுகாப்பு & நுகர்வோர் வழிகாட்டிகள்",
          items: [
            { title_en: "Consumer Protection Rights Act 2019", title_ta: "நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள்", href: "/awareness/right/consumer-protection-rights-2019", icon: Shield, desc_en: "File consumer court cases online without a lawyer.", desc_ta: "வழக்கறிஞர் இன்றி ஆன்லைனில் வழக்கு பதிவிடல்." },
            { title_en: "Traffic Check Driver Rights", title_ta: "வாகன சோதனையின் போது ஓட்டுநர் உரிமைகள்", href: "/awareness/article/traffic-police-vehicle-check-citizen-rights-guide", icon: FileText, desc_en: "DigiLocker validity & key seizure rules.", desc_ta: "டிஜிலாக்கர் செல்லுபடி & சாவி பிடுங்கத் தடை." },
            { title_en: "24x7 Emergency Helplines", title_ta: "அவசர உதவி எண்கள்", href: "/helplines", icon: Phone, desc_en: "Dial 1930 Cyber Fraud, 1912 Minnalagam, 112 Unified.", desc_ta: "1930 சைபர் கிரைம், 1912 மின்சாரம், 112 எண்கள்." },
          ]
        };

      case "districts":
        return {
          title_en: "Explore District Services & Alerts",
          title_ta: "மாவட்ட சேவைகள் & எச்சரிக்கைகளை ஆராய்க",
          items: [
            { title_en: "District Power Cuts Today", title_ta: "மாவட்ட மின்தடை", href: "/power-cuts-today-tamil-nadu", icon: Zap, desc_en: "Scheduled substation power shutdowns.", desc_ta: "மின்வாரிய பராமரிப்பு மின்தடை நேரம்." },
            { title_en: "School & College Holiday Alerts", title_ta: "பள்ளி விடுமுறை அறிவிப்புகள்", href: "/school-college-holiday-alerts", icon: AlertTriangle, desc_en: "Collector rain notices & weather advisories.", desc_ta: "மாவட்ட ஆட்சியர் மழை விடுமுறை அறிவிப்புகள்." },
            { title_en: "TN Today State News", title_ta: "டிஎன் டுடே செய்திகள்", href: "/tn-today", icon: FileText, desc_en: "Daily verified state news and policies.", desc_ta: "தினசரி அரசு செய்திகள் மற்றும் திட்டங்கள்." },
            { title_en: "Emergency Helplines Directory", title_ta: "அரசு அவசர உதவி எண்கள்", href: "/helplines", icon: Phone, desc_en: "Direct dial 112, 108, 1912, 1930, 1070.", desc_ta: "24x7 சரிபார்க்கப்பட்ட அரசு அவசர எண்கள்." },
          ]
        };

      default:
        return {
          title_en: "Explore VizhiTN Citizen Services",
          title_ta: "VizhiTN குடிமைச் சேவைகளை ஆராய்க",
          items: [
            { title_en: "Citizen Statutory Rights", title_ta: "குடிமக்கள் சட்ட உரிமைகள்", href: "/rights", icon: Shield, desc_en: "RTI Act 2005 & Consumer Protection.", desc_ta: "தகவல் உரிமை & நுகர்வோர் பாதுகாப்பு." },
            { title_en: "Government Welfare Schemes", title_ta: "அரசு நலத்திட்டங்கள்", href: "/schemes", icon: Gift, desc_en: "Magalir Urimai, Pudhumai Penn & CMCHIS.", desc_ta: "மகளிர் உரிமை & புதுமைப் பெண்." },
            { title_en: "Local Scam Alerts", title_ta: "மோசடி எச்சரிக்கைகள்", href: "/scams", icon: AlertTriangle, desc_en: "Cyber & financial scam warnings.", desc_ta: "மோசடி தடுப்பு எச்சரிக்கைகள்." },
            { title_en: "Power Cuts Today", title_ta: "இன்றைய மின்தடை", href: "/power-cuts-today-tamil-nadu", icon: Zap, desc_en: "TANGEDCO substation shutdown schedules.", desc_ta: "மின்வாரிய பராமரிப்பு மின்தடை." },
          ]
        };
    }
  };

  const data = getLinks();

  return (
    <section className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          {data.title_ta && lang === "ta" ? data.title_ta : data.title_en}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {T(item.title_en, item.title_ta)}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {T(item.desc_en, item.desc_ta)}
                </p>
              </div>

              <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{T("Open Section", "பார்")}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
