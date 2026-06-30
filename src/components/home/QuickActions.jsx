"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, Zap, Home as HomeIcon, Briefcase, ShieldAlert, Building2 } from "lucide-react";

const QUICK_ACTIONS = [
  { path: "/create",   icon: <Plus className="w-5 h-5" />,       bg: "bg-blue-100 dark:bg-blue-900/30",   iconColor: "text-blue-600 dark:text-blue-400",   en: "Report Issue",    ta: "சிக்கல் புகார்",     sub_en: "Log a civic problem",      sub_ta: "குடிமை சிக்கல் பதிவு" },
  { path: "/help",     icon: <Zap className="w-5 h-5" />,         bg: "bg-red-100 dark:bg-red-900/30",     iconColor: "text-red-600 dark:text-red-400",     en: "Emergency",       ta: "அவசரகாலம்",           sub_en: "Request urgent help",      sub_ta: "அவசர உதவி கேளுங்கள்" },
  { path: "/stay",     icon: <HomeIcon className="w-5 h-5" />,    bg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", en: "Find Stay",    ta: "தங்குமிடம் தேடு",   sub_en: "Rooms & PG nearby",        sub_ta: "அருகில் PG & அறைகள்" },
  { path: "/jobs",     icon: <Briefcase className="w-5 h-5" />,   bg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400", en: "Jobs",            ta: "வேலை",                sub_en: "Local job updates",        sub_ta: "உள்ளூர் வேலை வாய்ப்பு" },
  { path: "/scams",    icon: <ShieldAlert className="w-5 h-5" />, bg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400", en: "Scam Alert",  ta: "மோசடி எச்சரிக்கை",  sub_en: "Report a scam",            sub_ta: "மோசடி புகாரிடு" },
  { path: "/offices",  icon: <Building2 className="w-5 h-5" />,   bg: "bg-blue-100 dark:bg-blue-900/30",   iconColor: "text-blue-600 dark:text-blue-400",   en: "Office Ratings",  ta: "அலுவலக மதிப்பீடு",  sub_en: "Govt office reviews",      sub_ta: "அரசு அலுவலக மதிப்பு" },
];

export default function QuickActions() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
          {T("Quick Actions", "விரைவு செயல்கள்")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.path + action.en} to={action.path}>
              <div className="group flex flex-col items-center text-center p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.iconColor} flex items-center justify-center mb-2.5`}>
                  {action.icon}
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-0.5">
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
