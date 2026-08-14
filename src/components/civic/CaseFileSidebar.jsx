import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Star,
  MessageSquare,
  ThumbsDown,
  CircleDot,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CIVIC_STATUSES, getDaysOpen } from "@/lib/civicReceipt";
import { getEscalationLevel } from "@/lib/departmentRouting";

// The main 7 lifecycle steps (reported → citizen_verified_fixed)
const LIFECYCLE_KEYS = [
  "reported",
  "community_verified",
  "complaint_needed",
  "complaint_filed",
  "under_followup",
  "claimed_fixed",
  "citizen_verified_fixed",
];

const ESCALATION_COLORS = {
  green: {
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    dot: "bg-green-500",
  },
  slate: {
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  indigo: {
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  orange: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  red: {
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    dot: "bg-red-500",
  },
};

export default function CaseFileSidebar({ post, authorTrustScore, complaintTrackers }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const days = getDaysOpen(post.created_date);
  const escalation = getEscalationLevel(post);
  const currentStatusKey = post.civic_status || "reported";
  const currentStep = CIVIC_STATUSES.find((s) => s.key === currentStatusKey)?.step || 1;

  const verificationCount = post.verification_count || 0;
  const complaintsCount = complaintTrackers?.length || 0;
  const followUpCount = post.follow_up_count || 0;
  const stillNotFixedCount = post.still_not_fixed_count || 0;
  const trustScore = authorTrustScore || 10;

  // Days-open color
  const daysColor =
    days > 60
      ? "text-red-600 dark:text-red-400"
      : days > 30
        ? "text-orange-600 dark:text-orange-400"
        : days > 7
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-green-600 dark:text-green-400";

  const esc = ESCALATION_COLORS[escalation.color] || ESCALATION_COLORS.slate;

  // Lifecycle statuses for progress stepper
  const lifecycleStatuses = LIFECYCLE_KEYS.map((key) => CIVIC_STATUSES.find((s) => s.key === key)).filter(Boolean);

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      {/* ── Case File Header & Author Trust ── */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            {T("Public Case File", "பொது வழக்கு கோப்பு")}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>★ {trustScore}</span>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        {/* ── Inline Quick Stats Grid ── */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="bg-slate-50 dark:bg-slate-700/40 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{T("Days", "நாட்கள்")}</span>
            <span className={`text-xs font-extrabold ${daysColor}`}>{days}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/40 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{T("Verified", "சரி")}</span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">✓{verificationCount}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/40 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{T("Filed", "புகார்")}</span>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">{complaintsCount}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/40 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{T("Fixed?", "சரியா?")}</span>
            <span className={`text-xs font-extrabold ${stillNotFixedCount > 0 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}`}>{stillNotFixedCount}</span>
          </div>
        </div>

        {/* ── Escalation Status ── */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{T("Escalation", "மேல்முறையீடு")}</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${esc.dot}`} />
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${esc.badge}`}>
              {T(`Level ${escalation.level}`, `நிலை ${escalation.level}`)} — {escalation.label}
            </span>
          </div>
        </div>

        {/* ── Compact Progress Stepper ── */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            {T("Progress Stepper", "முன்னேற்றப் படிகள்")}
          </p>
          <div className="space-y-1">
            {lifecycleStatuses.map((status) => {
              const isCompleted = status.step < currentStep;
              const isCurrent = status.key === currentStatusKey;

              return (
                <div key={status.key} className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isCurrent
                          ? "bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-600"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
                    ) : isCurrent ? (
                      <CircleDot className="w-2.5 h-2.5 stroke-[2.5]" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] truncate leading-tight ${
                      isCompleted
                        ? "text-green-800 dark:text-green-300 font-bold"
                        : isCurrent
                          ? "text-blue-800 dark:text-blue-300 font-extrabold"
                          : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {lang === "ta" ? status.label_ta : status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
