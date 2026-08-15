import React from "react";
import { Phone, Shield, FileText, Globe, Gift, BookOpen } from "lucide-react";
import { Link } from "@/lib/router-compat";

const CATEGORIES = [
  {
    id: "emergency",
    icon: Phone,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    label_en: "Emergency Helplines",
    label_ta: "அவசர எண்கள்",
    url: "/awareness/emergency",
  },
  {
    id: "rights",
    icon: Shield,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    label_en: "Citizen Rights",
    label_ta: "குடிமக்கள் உரிமைகள்",
    url: "/awareness/rights",
  },
  {
    id: "articles",
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    label_en: "Knowledge Articles",
    label_ta: "அறிவுத் தளம்",
    url: "/awareness/articles",
  },
  {
    id: "portals",
    icon: Globe,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    label_en: "Government Portals",
    label_ta: "அரசு இணையதளங்கள்",
    url: "/awareness/portals",
  },
  {
    id: "schemes",
    icon: Gift,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    label_en: "Schemes & Benefits",
    label_ta: "திட்டங்கள் & சலுகைகள்",
    url: "/awareness/schemes",
  },
  {
    id: "guides",
    icon: FileText,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    label_en: "What To Do If...",
    label_ta: "அவசர வழிகாட்டிகள்",
    url: "/awareness/guides",
  },
];

export default function QuickHelpRow({ lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);

  return (
    <div className="py-5 sm:py-6">
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
        <span>⚡</span>
        {T("Quick Help Directories", "விரைவு உதவிப் பிரிவுகள்")}
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.url}
              className="flex flex-col items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-2 py-3 sm:px-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 text-center leading-tight">
                {T(cat.label_en, cat.label_ta)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
