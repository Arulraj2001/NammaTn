import React from "react";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getDepartmentRoute } from "@/lib/departmentRouting";
import { getDaysOpen } from "@/lib/civicReceipt";

const RESOLVED_STATUSES = ["citizen_verified_fixed", "community_solved"];

export default function AccountabilityMeter({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const route = getDepartmentRoute(post.category_slug);
  const followUp = route.follow_up_days;
  const escalation = route.escalation_days;
  const daysOpen = getDaysOpen(post.created_date);
  const isResolved = RESOLVED_STATUSES.includes(post.civic_status);

  // The bar spans from 0 to max(escalation * 1.25, daysOpen * 1.1) so we always
  // have room to show the marker even if the issue has exceeded escalation_days.
  const barMax = Math.max(escalation * 1.25, daysOpen * 1.1, escalation + 7);
  const followUpPct = (followUp / barMax) * 100;
  const escalationPct = (escalation / barMax) * 100;
  const markerPct = Math.min((daysOpen / barMax) * 100, 100);

  // Determine zone for label colouring
  const zone =
    daysOpen <= followUp ? "green" : daysOpen <= escalation ? "yellow" : "red";

  const zoneStyles = {
    green: "text-emerald-600 dark:text-emerald-400",
    yellow: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  };

  if (isResolved) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            {T("SLA Tracker", "SLA கண்காணிப்பு")}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-emerald-500/20 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 w-full" />
        </div>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
          ✓ {T("Resolved", "தீர்க்கப்பட்டது")} — {daysOpen}{" "}
          {T("days", "நாட்கள்")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            {T("SLA Tracker", "SLA கண்காணிப்பு")}
          </span>
        </div>
        {zone === "red" && (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            {T("Overdue", "காலாவதி")}
          </span>
        )}
      </div>

      {/* Gradient bar */}
      <div className="relative h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-visible">
        {/* Green zone */}
        <div
          className="absolute top-0 left-0 h-full rounded-l-full bg-emerald-500/70 dark:bg-emerald-500/50"
          style={{ width: `${followUpPct}%` }}
        />
        {/* Yellow zone */}
        <div
          className="absolute top-0 h-full bg-amber-500/70 dark:bg-amber-500/50"
          style={{ left: `${followUpPct}%`, width: `${escalationPct - followUpPct}%` }}
        />
        {/* Red zone */}
        <div
          className="absolute top-0 h-full rounded-r-full bg-red-500/70 dark:bg-red-500/50"
          style={{ left: `${escalationPct}%`, width: `${100 - escalationPct}%` }}
        />

        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${markerPct}%` }}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-md ${
              zone === "green"
                ? "bg-emerald-500"
                : zone === "yellow"
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
          />
        </div>
      </div>

      {/* Scale labels */}
      <div className="relative mt-1 h-4 text-[11px] font-bold text-slate-600 dark:text-slate-400">
        <span className="absolute left-0">{T("Day 0", "நாள் 0")}</span>
        <span
          className="absolute -translate-x-1/2 text-emerald-600 dark:text-emerald-400 font-extrabold"
          style={{ left: `${followUpPct}%` }}
        >
          {followUp}
        </span>
        <span
          className="absolute -translate-x-1/2 text-red-600 dark:text-red-400 font-extrabold"
          style={{ left: `${escalationPct}%` }}
        >
          {escalation}
        </span>
      </div>

      {/* Summary text */}
      <p className={`text-xs font-bold mt-1 ${zoneStyles[zone]}`}>
        {T(
          `Day ${daysOpen} — Follow-up expected by Day ${followUp}, escalation after Day ${escalation}`,
          `நாள் ${daysOpen} — தொடர் நாள் ${followUp}-க்குள், மேல்முறையீடு நாள் ${escalation}-க்குப் பின்`,
        )}
      </p>
    </div>
  );
}
