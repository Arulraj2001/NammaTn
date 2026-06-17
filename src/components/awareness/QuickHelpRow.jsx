import React from "react";
import { Phone, Shield, FileText, Globe, Gift, Info } from "lucide-react";

const CATEGORIES = [
  {
    id: "emergency",
    icon: Phone,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    label_en: "Emergency Numbers",
    label_ta: "அவசர எண்கள்",
    anchor: "emergency",
  },
  {
    id: "rights",
    icon: Shield,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    label_en: "Citizen Rights",
    label_ta: "குடிமக்கள் உரிமைகள்",
    anchor: "resources",
  },
  {
    id: "complaint",
    icon: FileText,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    label_en: "File a Complaint",
    label_ta: "புகார் அளிக்க",
    anchor: "resources",
  },
  {
    id: "portals",
    icon: Globe,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    label_en: "Government Portals",
    label_ta: "அரசு இணையதளங்கள்",
    anchor: "portals",
  },
  {
    id: "schemes",
    icon: Gift,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    label_en: "Schemes & Benefits",
    label_ta: "திட்டங்கள் & சலுகைகள்",
    anchor: "schemes",
  },
  {
    id: "rti",
    icon: Info,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    label_en: "RTI Information",
    label_ta: "தகவல் உரிமை",
    anchor: "resources",
  },
];

export default function QuickHelpRow({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="py-6">
      <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
        <span className="text-yellow-500">⚡</span>
        {T("Quick Help", "விரைவு உதவி")}
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => scrollTo(cat.anchor)}
              className="flex-shrink-0 flex flex-col items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-5 py-3 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all cursor-pointer min-w-[100px]"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 text-center leading-tight">
                {T(cat.label_en, cat.label_ta)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
