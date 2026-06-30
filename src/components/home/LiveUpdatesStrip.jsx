import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { Zap, HeartHandshake, ShieldAlert, ArrowRight } from "lucide-react";
import { getActiveSituations } from "@/services/situations";
import { getActiveEmergencies } from "@/services/emergencyPosts";
import { getActiveScams } from "@/services/scamAlerts";
import { useLanguage } from "@/context/LanguageContext";

export default function LiveUpdatesStrip() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: situations = [] } = useQuery({ queryKey: ["situations-home"], queryFn: () => getActiveSituations(5), staleTime: 60_000 });
  const { data: emergencies = [] } = useQuery({ queryKey: ["emergencies-home"], queryFn: () => getActiveEmergencies(3), staleTime: 60_000 });
  const { data: scams = [] } = useQuery({ queryKey: ["scams-home"], queryFn: () => getActiveScams(3), staleTime: 60_000 });

  if (!situations.length && !emergencies.length && !scams.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {T("Live TN Updates", "நேரடி தமிழ்நாடு புதுப்பிப்புகள்")}
        </h2>
        <Link to="/situations" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          {T("View all", "அனைத்தும்")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {situations.slice(0, 3).map((s) => (
          <Link key={s.id} to="/situations"
            className="flex-shrink-0 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-3 min-w-[220px] hover:shadow-md transition-all">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">{s.situation_type?.replace(/_/g, " ").toUpperCase()}</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{s.title}</p>
            <p className="text-xs text-slate-400 mt-1">{s.district_name}</p>
          </Link>
        ))}

        {emergencies.slice(0, 2).map((e) => (
          <Link key={e.id} to="/help"
            className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-3 min-w-[220px] hover:shadow-md transition-all">
            <div className="flex items-center gap-1.5 mb-1">
              <HeartHandshake className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">{T("EMERGENCY", "அவசரகாலம்")}</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{e.title}</p>
            <p className="text-xs text-slate-400 mt-1">{e.district_name}</p>
          </Link>
        ))}

        {scams.slice(0, 2).map((s) => (
          <Link key={s.id} to="/scams"
            className="flex-shrink-0 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-3 min-w-[220px] hover:shadow-md transition-all">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">{T("SCAM ALERT", "மோசடி எச்சரிக்கை")}</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{s.title}</p>
            <p className="text-xs text-slate-400 mt-1">{s.district_name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}