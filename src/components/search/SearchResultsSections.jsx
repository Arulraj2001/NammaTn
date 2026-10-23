import React from "react";
import { Link } from "@/lib/router-compat";
import { AlertTriangle } from "lucide-react";

export default function SearchResultsSections({ scams, T }) {
  return (
    <>
      {scams && scams.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            ⚠️ {T("Scam Alerts", "மோசடி எச்சரிக்கைகள்")} ({scams.length})
          </p>
          <div className="space-y-2">
            {scams.slice(0, 5).map((s) => (
              <Link key={s.id} to="/scams" className="flex items-start gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-3 hover:shadow-sm transition-all">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.district_name}{s.area_name ? ` · ${s.area_name}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}