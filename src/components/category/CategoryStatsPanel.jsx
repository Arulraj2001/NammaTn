import React from "react";
import { Link } from "@/lib/router-compat";
import { MapPin, ThumbsUp, MessageSquare, TrendingUp } from "lucide-react";

const TYPE_COLORS = {
  complaint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  appreciation: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  alert: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  local_update: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  discussion: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function CategoryStatsPanel({ stats, lang }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  if (!stats) return null;

  const maxDistrict = stats.topDistricts?.[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* Metrics */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">{T("Category Overview", "வகை கண்ணோட்டம்")}</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: T("Posts", "பதிவுகள்"), value: stats.totalPosts, icon: TrendingUp, color: "text-blue-500" },
            { label: T("Upvotes", "வாக்குகள்"), value: stats.totalUpvotes, icon: ThumbsUp, color: "text-green-500" },
            { label: T("Comments", "கருத்துகள்"), value: stats.totalComments, icon: MessageSquare, color: "text-purple-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className="text-lg font-bold text-slate-900 dark:text-white">{value || 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Post type breakdown */}
        {stats.byType && Object.keys(stats.byType).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100 dark:border-slate-700">
            {Object.entries(stats.byType).map(([type, count]) => (
              <span key={type} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[type] || "bg-slate-100 text-slate-600"}`}>
                {type.replace("_", " ")} ({count})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Top Districts */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {T("Top Districts", "முன்னணி மாவட்டங்கள்")}
        </h3>
        <div className="space-y-2">
          {stats.topDistricts?.slice(0, 5).map((td) => (
            <Link key={td.slug} to={`/${td.slug}/`} className="flex items-center gap-2 group">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-blue-600 truncate">{td.name}</span>
                  <span className="text-xs text-slate-400 ml-1">{td.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-green-400" style={{ width: `${(td.count / maxDistrict) * 100}%` }} />
                </div>
              </div>
            </Link>
          ))}
          {(!stats.topDistricts || stats.topDistricts.length === 0) && (
            <p className="text-xs text-slate-400">{T("No data yet", "தரவு இல்லை")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
