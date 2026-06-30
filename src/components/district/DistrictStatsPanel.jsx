import React from "react";
import { Link } from "@/lib/router-compat";
import { AlertTriangle, Star, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export default function DistrictStatsPanel({ stats, lang }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  if (!stats) return null;

  const maxCat = stats.topCategories?.[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* Metrics */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">{T("Activity Overview", "செயல்பாடு கண்ணோட்டம்")}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: AlertTriangle, label: T("Complaints", "புகார்கள்"), value: stats.complaints, color: "text-red-500" },
            { icon: Star, label: T("Appreciations", "பாராட்டுகள்"), value: stats.appreciations, color: "text-yellow-500" },
            { icon: ThumbsUp, label: T("Upvotes", "வாக்குகள்"), value: stats.totalUpvotes, color: "text-blue-500" },
            { icon: MessageSquare, label: T("Comments", "கருத்துகள்"), value: stats.totalComments, color: "text-purple-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{value || 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment bar */}
        {stats.totalPosts > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{T("Positive", "நேர்மறை")} {stats.positiveRatio}%</span>
              <span>{T("Complaints", "புகார்கள்")} {stats.complaintRatio}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.positiveRatio}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${stats.complaintRatio}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Top Categories */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {T("Top Categories", "முன்னணி வகைகள்")}
        </h3>
        <div className="space-y-2">
          {stats.topCategories?.slice(0, 5).map((tc) => {
            const cat = CATEGORIES.find((c) => c.slug === tc.slug);
            return (
              <Link key={tc.slug} to={`/category/${tc.slug}`} className="flex items-center gap-2 group">
                <span className="text-sm">{cat?.icon || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-blue-600 truncate">{cat ? (lang === "ta" ? cat.name_ta : cat.name_en) : tc.slug}</span>
                    <span className="text-xs text-slate-400 ml-1">{tc.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${(tc.count / maxCat) * 100}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
          {(!stats.topCategories || stats.topCategories.length === 0) && (
            <p className="text-xs text-slate-400">{T("No data yet", "தரவு இல்லை")}</p>
          )}
        </div>
      </div>
    </div>
  );
}