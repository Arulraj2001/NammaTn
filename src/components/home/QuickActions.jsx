"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, Zap, AlertTriangle, ShieldAlert, Calculator, FileText, CreditCard, HelpCircle } from "lucide-react";

const QUICK_ACTIONS = [
  { path: "/create", icon: <Plus className="w-5 h-5" />, bg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", en: "Report Issue", ta: "சிக்கல் புகார்", sub_en: "Log civic problem", sub_ta: "குடிமை சிக்கல் பதிவு" },
  { path: "/tneb-bill-calculator", icon: <Calculator className="w-5 h-5" />, bg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400", en: "EB Calculator", ta: "மின் கட்டணம்", sub_en: "100 units subsidy", sub_ta: "மானியக் கணக்கீடு" },
  { path: "/patta-chitta-online-status", icon: <FileText className="w-5 h-5" />, bg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400", en: "Patta Chitta", ta: "பட்டா சிட்டா", sub_en: "Land records check", sub_ta: "நில ஆவண சரிபார்ப்பு" },
  { path: "/tnpds-smart-ration-card-status", icon: <CreditCard className="w-5 h-5" />, bg: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-600 dark:text-indigo-400", en: "Ration Card", ta: "ரேஷன் கார்டு", sub_en: "TNPDS smart card", sub_ta: "குடும்ப அட்டை சேவை" },
  { path: "/power-cuts-today-tamil-nadu", icon: <Zap className="w-5 h-5" />, bg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400", en: "Power Cuts", ta: "மின்தடை", sub_en: "Live EB shutdown", sub_ta: "மின்தடை நேரம்" },
  { path: "/school-college-holiday-alerts", icon: <AlertTriangle className="w-5 h-5" />, bg: "bg-rose-100 dark:bg-rose-900/30", iconColor: "text-rose-600 dark:text-rose-400", en: "Holiday Alert", ta: "பள்ளி விடுமுறை", sub_en: "Collector orders", sub_ta: "மழை விடுமுறை தகவல்" },
  { path: "/help", icon: <HelpCircle className="w-5 h-5" />, bg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-600 dark:text-red-400", en: "Emergency", ta: "அவசரகாலம்", sub_en: "Helplines & SOS", sub_ta: "அவசர உதவி எண்கள்" },
  { path: "/scams", icon: <ShieldAlert className="w-5 h-5" />, bg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", en: "Scam Alert", ta: "மோசடி எச்சரிக்கை", sub_en: "Report 1930 scams", sub_ta: "மோசடி தடுப்பு" },
];

export default function QuickActions() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  return (
    <section id="quick-actions" className="bg-civic-50/50 dark:bg-[#071E3D] border-b-2 border-civic-200 dark:border-civic-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-base font-black text-civic-900 dark:text-white mb-4">
          {T("Quick Actions & Citizen Services", "விரைவு செயல்கள் & மக்கள் சேவைகள்")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.path + action.en} to={action.path}>
              <div className="group flex flex-col items-center text-center p-4 rounded-2xl border-2 border-civic-200 dark:border-civic-800 bg-white dark:bg-[#0D2B52] hover:border-civic-500 hover:shadow-lg hover:shadow-civic-500/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.iconColor} flex items-center justify-center mb-2.5`}>
                  {action.icon}
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-civic-500 transition-colors leading-tight mb-0.5">
                  {T(action.en, action.ta)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {T(action.sub_en, action.sub_ta)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
