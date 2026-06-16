import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Briefcase, Home as HomeIcon, Building2, Users } from "lucide-react";

export default function SearchResultsSections({ scams, jobs, stay, listings, discussions, T }) {
  return (
    <>
      {scams.length > 0 && (
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

      {jobs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            💼 {T("Job Alerts", "வேலை எச்சரிக்கைகள்")} ({jobs.length})
          </p>
          <div className="space-y-2">
            {jobs.slice(0, 5).map((j) => (
              <Link key={j.id} to="/jobs" className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 hover:shadow-sm transition-all">
                <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{j.title}</p>
                  <p className="text-xs text-slate-500">{j.district_name}{j.area_name ? ` · ${j.area_name}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stay.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            🏠 {T("Stay Listings", "தங்குமிட பட்டியல்")} ({stay.length})
          </p>
          <div className="space-y-2">
            {stay.slice(0, 5).map((s) => (
              <Link key={s.id} to="/stay" className="flex items-start gap-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-3 hover:shadow-sm transition-all">
                <HomeIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.district_name}{s.area_name ? ` · ${s.area_name}` : ""}{s.rent_amount ? ` · ₹${s.rent_amount}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {listings.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            🏢 {T("Local Listings", "உள்ளூர் பட்டியல்")} ({listings.length})
          </p>
          <div className="space-y-2">
            {listings.slice(0, 5).map((l) => (
              <Link key={l.id} to="/listings" className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-2xl p-3 hover:shadow-sm transition-all">
                <Building2 className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{l.business_name}</p>
                  <p className="text-xs text-slate-500">{l.category} · {l.district_name}{l.area_name ? ` · ${l.area_name}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {discussions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            💬 {T("Discussions", "விவாதங்கள்")} ({discussions.length})
          </p>
          <div className="space-y-2">
            {discussions.slice(0, 5).map((d) => (
              <Link key={d.id} to="/community" className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 hover:shadow-sm transition-all">
                <Users className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{d.title}</p>
                  <p className="text-xs text-slate-500">{d.district_name || ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}