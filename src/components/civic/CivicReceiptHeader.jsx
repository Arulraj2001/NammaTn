import React from "react";
import { FileText, MapPin, Clock, Tag, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import CivicStatusBadge from "./CivicStatusBadge";
import { getUrgency, getDaysOpen } from "@/lib/civicReceipt";
import { useLanguage } from "@/context/LanguageContext";

/** Main lifecycle steps (used for progress indicator) */
const LIFECYCLE_STEPS = [
  "reported",
  "community_verified",
  "complaint_needed",
  "complaint_filed",
  "under_followup",
  "claimed_fixed",
  "citizen_verified_fixed",
];

function getProgressColor(status) {
  if (status === "citizen_verified_fixed" || status === "community_solved") return "bg-green-500";
  if (status === "unresolved_escalated") return "bg-red-500";
  if (status === "claimed_fixed") return "bg-teal-500";
  if (status === "complaint_filed" || status === "under_followup") return "bg-amber-500";
  if (status === "community_verified" || status === "complaint_needed") return "bg-indigo-500";
  return "bg-blue-500";
}

export default function CivicReceiptHeader({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const urgency = getUrgency(post.urgency_level);
  const days = getDaysOpen(post.created_date);
  const currentStatus = post.civic_status || "reported";
  const currentStepIdx = LIFECYCLE_STEPS.indexOf(currentStatus);
  const isResolved = currentStatus === "citizen_verified_fixed" || currentStatus === "community_solved";
  const isEscalated = currentStatus === "unresolved_escalated";

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
      {/* Top bar — Case File Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-850 to-slate-900 dark:from-slate-900 dark:to-black px-5 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                  {T("PUBLIC CASE FILE", "பொது வழக்கு கோப்பு")}
                </p>
                <span className="text-[10px] text-slate-600 font-medium">•</span>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  {T("VizhiTN Civic Receipt", "VizhiTN குடிமை ரசீது")}
                </p>
              </div>
              {post.civic_receipt_id && (
                <p className="text-lg font-bold text-white font-mono tracking-wider">{post.civic_receipt_id}</p>
              )}
            </div>
          </div>
          <CivicStatusBadge status={currentStatus} />
        </div>

        {/* Step progress dots */}
        <div className="mt-3 flex items-center gap-1.5">
          {LIFECYCLE_STEPS.map((step, i) => {
            const isCompleted = currentStepIdx >= 0 && i <= currentStepIdx;
            const isCurrent = step === currentStatus;
            return (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === 0 ? "flex-[0.5]" : "flex-1"
                } ${
                  isCompleted
                    ? isCurrent
                      ? `${getProgressColor(currentStatus)} shadow-sm`
                      : "bg-slate-500"
                    : "bg-slate-700"
                }`}
              />
            );
          })}
          <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
            {isResolved
              ? T("Resolved ✓", "தீர்க்கப்பட்டது ✓")
              : isEscalated
                ? T("Escalated ⚠", "மேல்முறையீடு ⚠")
                : T(`Step ${Math.max(currentStepIdx + 1, 1)}/${LIFECYCLE_STEPS.length}`, `படி ${Math.max(currentStepIdx + 1, 1)}/${LIFECYCLE_STEPS.length}`)
            }
          </span>
        </div>
      </div>

      {/* Meta info grid */}
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetaItem
          icon={MapPin}
          label={T("Location", "இடம்")}
          value={[post.district_name, post.area_name].filter(Boolean).join(", ") || "—"}
        />
        <MetaItem
          icon={Tag}
          label={T("Category", "வகை")}
          value={post.category_name || "—"}
        />
        <MetaItem
          icon={Calendar}
          label={T("Reported", "புகாரளிக்கப்பட்டது")}
          value={post.created_date ? format(new Date(post.created_date), "dd MMM yyyy") : "—"}
        />
        <MetaItem
          icon={Clock}
          label={T("Days Open", "திறந்திருக்கும் நாட்கள்")}
          value={isResolved ? T("Closed", "மூடப்பட்டது") : `${days} ${T("days", "நாட்கள்")}`}
          valueClass={
            isResolved ? "text-green-600 dark:text-green-400"
            : days > 30 ? "text-red-600 font-bold"
            : days > 14 ? "text-orange-600"
            : days > 7 ? "text-yellow-600"
            : "text-slate-700 dark:text-slate-200"
          }
        />
      </div>

      {/* Urgency + verifications + complaint chips */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${urgency.bg} ${urgency.color}`}>
          ⚡ {T(urgency.label, urgency.label_ta)}
        </span>
        {(post.verification_count || 0) > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
            <Shield className="w-3 h-3 inline mr-1" />
            {post.verification_count} {T("community verified", "சமுதாயம் சரிபார்த்தது")}
          </span>
        )}
        {(post.official_complaint_id) && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
            📄 {post.official_complaint_id}
          </span>
        )}
        {post.location_text && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            📍 {post.location_text}
          </span>
        )}
      </div>

      {/* VizhiTN disclaimer */}
      <div className="px-5 pb-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          {T(
            "VizhiTN helps citizens document, verify, route, track, and prove local issues. VizhiTN is not a government office.",
            "VizhiTN குடிமக்கள் உள்ளூர் சிக்கல்களை ஆவணப்படுத்த, சரிபார்க்க, கண்காணிக்க உதவுகிறது. VizhiTN ஒரு அரசு அலுவலகம் அல்ல."
          )}
        </p>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value, valueClass = "text-slate-700 dark:text-slate-200" }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-sm font-semibold truncate ${valueClass}`}>{value}</p>
    </div>
  );
}