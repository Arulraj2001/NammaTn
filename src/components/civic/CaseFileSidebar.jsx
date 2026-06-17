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
  const trustScore = authorTrustScore || 0;

  // Days-open color
  const daysColor =
    days > 60
      ? "text-red-600 dark:text-red-400"
      : days > 30
        ? "text-orange-600 dark:text-orange-400"
        : days > 7
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-green-600 dark:text-green-400";

  // Trust level
  const trustLevel =
    trustScore > 70
      ? { label: "Trusted", label_ta: "நம்பகமான", color: "text-green-600 dark:text-green-400" }
      : trustScore > 40
        ? { label: "Active", label_ta: "செயலில்", color: "text-blue-600 dark:text-blue-400" }
        : { label: "New", label_ta: "புதிய", color: "text-slate-500 dark:text-slate-400" };

  const esc = ESCALATION_COLORS[escalation.color] || ESCALATION_COLORS.slate;

  // Lifecycle statuses for progress stepper
  const lifecycleStatuses = LIFECYCLE_KEYS.map((key) => CIVIC_STATUSES.find((s) => s.key === key)).filter(Boolean);

  return (
    <div className="sticky top-24 space-y-4">
      {/* ── Quick Stats ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {T("Quick Stats", "சுருக்கமான புள்ளிவிவரம்")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCell
            icon={Clock}
            label={T("Days Open", "திறந்த நாட்கள்")}
            value={days}
            valueClass={daysColor}
          />
          <StatCell
            icon={CheckCircle2}
            label={T("Verifications", "சரிபார்ப்புகள்")}
            value={`✓ ${verificationCount}`}
            valueClass="text-indigo-600 dark:text-indigo-400"
          />
          <StatCell
            icon={MessageSquare}
            label={T("Complaints Filed", "புகார்கள்")}
            value={complaintsCount}
            valueClass="text-amber-600 dark:text-amber-400"
          />
          <StatCell
            icon={ChevronRight}
            label={T("Follow-ups", "தொடர்கள்")}
            value={followUpCount}
            valueClass="text-yellow-600 dark:text-yellow-400"
          />
          <StatCell
            icon={ThumbsDown}
            label={T("Still Not Fixed", "இன்னும் சரியாகவில்லை")}
            value={stillNotFixedCount}
            valueClass={stillNotFixedCount > 0 ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}
            colSpan
          />
        </div>
      </div>

      {/* ── Escalation Status ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {T("Escalation Status", "மேல்முறையீடு நிலை")}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${esc.dot}`} />
          <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${esc.badge}`}>
            {T(`Level ${escalation.level}`, `நிலை ${escalation.level}`)} — {escalation.label}
          </span>
        </div>

        {/* Next action recommendation */}
        {escalation.level >= 4 && (
          <div className="mt-2 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                {T("Escalation Recommended", "மேல்முறையீடு பரிந்துரைக்கப்படுகிறது")}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {T(
                  "This issue has exceeded the expected resolution time. Consider escalating to a higher authority.",
                  "இந்த சிக்கல் எதிர்பார்த்த தீர்வு நேரத்தை மீறியுள்ளது. உயர் அதிகாரிகளுக்கு மேல்முறையீடு செய்யுங்கள்."
                )}
              </p>
            </div>
          </div>
        )}

        {escalation.level === 3 && (
          <div className="mt-2 flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 dark:text-orange-300">
              {T(
                "Follow-up is overdue. Send a follow-up message to the department.",
                "தொடர் கண்காணிப்பு தாமதமாகிவிட்டது. துறைக்கு தொடர் செய்தி அனுப்புங்கள்."
              )}
            </p>
          </div>
        )}

        {escalation.level <= 2 && escalation.level > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {T("On track — no escalation needed yet.", "சரியான பாதையில் — இன்னும் மேல்முறையீடு தேவையில்லை.")}
          </p>
        )}
      </div>

      {/* ── Case Progress ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {T("Case Progress", "வழக்கு முன்னேற்றம்")}
        </h3>
        <div className="space-y-0">
          {lifecycleStatuses.map((status, idx) => {
            const isCompleted = status.step < currentStep;
            const isCurrent = status.key === currentStatusKey;
            const isFuture = status.step > currentStep;

            return (
              <div key={status.key} className="flex items-start gap-2.5">
                {/* Vertical line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                          ? "bg-blue-500 ring-2 ring-blue-300 dark:ring-blue-700"
                          : "bg-slate-200 dark:bg-slate-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    ) : isCurrent ? (
                      <CircleDot className="w-3 h-3 text-white" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    )}
                  </div>
                  {idx < lifecycleStatuses.length - 1 && (
                    <div
                      className={`w-0.5 h-5 ${
                        isCompleted
                          ? "bg-green-400 dark:bg-green-600"
                          : "bg-slate-200 dark:bg-slate-600"
                      }`}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={`text-xs pt-0.5 leading-tight ${
                    isCompleted
                      ? "text-green-700 dark:text-green-400 font-medium"
                      : isCurrent
                        ? "text-blue-700 dark:text-blue-300 font-semibold"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {lang === "ta" ? status.label_ta : status.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Author Trust ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ★ {trustScore}
            </span>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 ${trustLevel.color}`}
          >
            {T(trustLevel.label, trustLevel.label_ta)}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {T("Author Trust Score", "ஆசிரியர் நம்பகத் தரம்")}
        </p>
      </div>
    </div>
  );
}

function StatCell({ icon: Icon, label, value, valueClass = "text-slate-700 dark:text-slate-200", colSpan }) {
  return (
    <div
      className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 ${
        colSpan ? "col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-lg font-bold leading-tight ${valueClass}`}>{value}</p>
    </div>
  );
}
