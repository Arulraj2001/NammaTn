"use client";

import React from "react";
import { PhoneCall, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const VERIFIED_HELPLINES = [
  { id: "cm_cell", name_en: "CM Helpline (TNNPRP)", name_ta: "முதல்வர் உதவி எண்", phone: "1100", category: "general", desc_en: "Statewide Grievance Redressal", desc_ta: "மாநில பொதுமக்கள் குறைதீர்ப்பு" },
  { id: "gcc", name_en: "Greater Chennai Corporation (GCC)", name_ta: "சென்னை மாநகராட்சி", phone: "1913", category: "road-infrastructure", desc_en: "Floods, Sanitation, Roads & Potholes", desc_ta: "மழை வெள்ளம், சுகாதாரம், சாலைகள்" },
  { id: "metrowater", name_en: "Metrowater (CMWSSB)", name_ta: "சென்னை குடிநீர் வாரியம்", phone: "044-45674567", category: "water-sanitation", desc_en: "Drinking Water Supply & Drainage", desc_ta: "குடிநீர் விநியோகம், கழிவுநீர் அகற்றம்" },
  { id: "tangedco", name_en: "TANGEDCO Minnalagam", name_ta: "மின்வாரியம் மின்னகம்", phone: "1912", category: "electricity", desc_en: "Power Cuts & Line Snaps 24x7", desc_ta: "மின்தடை, கம்பி அறுந்தது 24x7" },
  { id: "cyber_crime", name_en: "National Cyber Crime Helpline", name_ta: "சைபர் க்ரைம் உதவி எண்", phone: "1930", category: "public-safety", desc_en: "Financial Scams, Fake SMS & Frauds", desc_ta: "வங்கி மோசடி, போலி மெசேஜ்" },
  { id: "ration", name_en: "Civil Supplies & Ration Cards", name_ta: "உணவுப்பொருள் & ரேஷன் அட்டை", phone: "1967", category: "government-schemes", desc_en: "Smart Ration Card Grievances", desc_ta: "ஸ்மார்ட் ரேஷன் அட்டை புகார்கள்" },
  { id: "cbe_corp", name_en: "Coimbatore Corporation Control", name_ta: "கோவை மாநகராட்சி உதவி மையம்", phone: "0422-2302323", category: "road-infrastructure", desc_en: "Coimbatore City Civic Complaints", desc_ta: "கோவை மாநகர குடிமை புகார்கள்" },
];

export default function VerifiedHelplineBar({ categorySlug = null }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // If specific category is provided, put that category's helpline first
  const sortedHelplines = React.useMemo(() => {
    if (!categorySlug) return VERIFIED_HELPLINES;
    return [...VERIFIED_HELPLINES].sort((a, b) => {
      if (a.category === categorySlug) return -1;
      if (b.category === categorySlug) return 1;
      return 0;
    });
  }, [categorySlug]);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            {T("Verified Tamil Nadu Emergency & Department Helplines", "சரிபார்க்கப்பட்ட தமிழ்நாடு அவசர & அரசு உதவி எண்கள்")}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 self-start sm:self-auto">
          {T("24x7 WORKING DIRECT LINES", "24x7 செயல்பாட்டில் உள்ள எண்கள்")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedHelplines.slice(0, 6).map((line) => (
          <div
            key={line.id}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700/60 flex items-center justify-between gap-3 group"
          >
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-100 truncate">
                {lang === "ta" ? line.name_ta : line.name_en}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {lang === "ta" ? line.desc_ta : line.desc_en}
              </p>
            </div>
            <a
              href={`tel:${line.phone.replace(/[^0-9]/g, '')}`}
              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white text-xs font-black tracking-tight shadow-sm transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{line.phone}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
