import React from "react";
import { Zap, Droplets, CreditCard, AlertTriangle, Ambulance, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Real Tamil Nadu civic problem guides
const GUIDES = [
  {
    id: "power-cut",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    title_en: "Power Cut in your area",
    title_ta: "உங்கள் பகுதியில் மின் தடை",
    steps_en: ["Call TANGEDCO: 94987 94987 or 1912", "Register complaint at tnebltd.org", "WhatsApp: 98403 98403"],
    steps_ta: ["TANGEDCO: 94987 94987 அழைக்கவும்", "tnebltd.org இல் புகார் பதிவு", "WhatsApp: 98403 98403"],
  },
  {
    id: "water-supply",
    icon: Droplets,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    title_en: "Water Supply not available",
    title_ta: "குடிநீர் வழங்கல் இல்லை",
    steps_en: ["Call CMWSSB: 044-45674567", "File at twad.tn.gov.in", "WhatsApp: 99400 99400"],
    steps_ta: ["CMWSSB: 044-45674567 அழைக்கவும்", "twad.tn.gov.in இல் பதிவு", "WhatsApp: 99400 99400"],
  },
  {
    id: "ration-card",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    title_en: "Ration Card issue",
    title_ta: "குடும்ப அட்டை சிக்கல்",
    steps_en: ["Visit tnpds.gov.in for updates", "Apply new card at e-Sevai centre", "Helpline: 1967"],
    steps_ta: ["tnpds.gov.in இல் புதுப்பித்தல்", "e-Sevai மையத்தில் புதிய அட்டை", "உதவி எண்: 1967"],
  },
  {
    id: "bribery",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    title_en: "Bribery at Govt Office",
    title_ta: "அரசு அலுவலகத்தில் லஞ்சம்",
    steps_en: ["Call Anti-Corruption: 1064", "File at vigilance.tn.gov.in", "You can remain anonymous"],
    steps_ta: ["ஊழல் தடுப்பு: 1064 அழைக்கவும்", "vigilance.tn.gov.in இல் புகார்", "அடையாளம் வெளிப்படுத்தல் தேவையில்லை"],
  },
  {
    id: "ambulance",
    icon: Ambulance,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    title_en: "Need Medical Help",
    title_ta: "மருத்துவ உதவி தேவை",
    steps_en: ["Call 108 for free ambulance", "Call 104 for mobile health services", "CMCHIS covers ₹5 lakh treatment"],
    steps_ta: ["108 — இலவச ஆம்புலன்ஸ்", "104 — மொபைல் சுகாதார சேவை", "CMCHIS — ₹5 லட்சம் சிகிச்சை"],
  },
  {
    id: "scheme",
    icon: FileText,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    title_en: "Apply for a Govt Scheme",
    title_ta: "அரசு திட்டம் விண்ணப்பம்",
    steps_en: ["Check eligibility at myscheme.gov.in", "Apply at tnesevai.tn.gov.in", "Nearest CSC / e-Sevai centre"],
    steps_ta: ["myscheme.gov.in இல் தகுதி சரிபார்க்கவும்", "tnesevai.tn.gov.in இல் விண்ணப்பிக்கவும்", "அருகிலுள்ள CSC / e-Sevai மையம்"],
  },
];

export default function WhatToDoSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section id="guides" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>❓</span>
          {T("What to Do If...", "என்ன செய்ய வேண்டும்...")}
        </h2>
        <Link
          to="/awareness/guides"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all guides", "அனைத்து வழிகாட்டிகள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          const title = T(guide.title_en, guide.title_ta);
          return (
            <Link
              key={guide.id}
              to={`/awareness/guides#${guide.id}`}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${guide.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white mb-2 leading-snug line-clamp-3 flex-1">
                {title}
              </p>
              <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5 font-medium mt-auto">
                {T("View Guide", "வழிகாட்டி")} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Export guide data for the dedicated guides page
export { GUIDES };
