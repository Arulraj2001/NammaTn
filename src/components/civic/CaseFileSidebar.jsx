import React from "react";
import {
  Star,
  User,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getDaysOpen, getCivicStatus } from "@/lib/civicReceipt";
import { getEscalationLevel } from "@/lib/departmentRouting";

export default function CaseFileSidebar({ post, authorTrustScore, complaintTrackers }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const days = getDaysOpen(post.created_date);
  const escalation = getEscalationLevel(post);
  const verificationCount = post.verification_count || 0;
  const complaintsCount = complaintTrackers?.length || 0;
  const followUpCount = post.follow_up_count || 0;
  const stillNotFixedCount = post.still_not_fixed_count || 0;
  const trustScore = authorTrustScore || 10;
  const progressValue = Math.min(100, ((escalation.level + 1) / 5) * 100);

  const progressionKeys = [
    "reported",
    "community_verified",
    "complaint_needed",
    "complaint_filed",
    "under_followup",
    "claimed_fixed",
    "citizen_verified_fixed",
  ];

  const currentStatusKey = post.civic_status || "reported";
  const currentIndex = Math.max(0, progressionKeys.indexOf(currentStatusKey) >= 0 ? progressionKeys.indexOf(currentStatusKey) : 0);

  const daysColor =
    days > 60
      ? "text-red-600 dark:text-red-400"
      : days > 30
        ? "text-orange-600 dark:text-orange-400"
        : days > 7
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-green-600 dark:text-green-400";

  return (
    <div className="space-y-4">
      {/* ── CARD 1: Author & Trust ── */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {post.is_anonymous ? T("Anonymous Citizen", "பெயர் வெளியிடாத குடிமகன்") : (post.author_name || T("Citizen Reporter", "செய்தியாளர்"))}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {T("Author Trust Profile", "ஆசிரியர் நம்பகத்தன்மை")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>★ {trustScore}</span>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Case Progress stepper ── */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
          {T("Case Progress", "கேஸ் முன்னேற்றம்")}
        </div>

        <div className="relative ml-2 pl-5">
          <div className="absolute left-[8px] top-1 bottom-1 w-px bg-slate-200 dark:bg-slate-700" />

          {progressionKeys.map((statusKey, idx) => {
            const status = getCivicStatus(statusKey);
            const isComplete = idx <= currentIndex;
            const isActive = statusKey === currentStatusKey;
            const dotColor = isActive ? "bg-blue-500 border-blue-200" : isComplete ? "bg-slate-400 border-slate-200" : "bg-slate-200 border-slate-200";
            const labelColor = isActive ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-300";

            return (
              <div key={statusKey} className="relative flex items-start gap-3 pb-3 last:pb-0">
                <div className={`relative z-10 mt-1 h-4 w-4 rounded-full border-2 ${dotColor}`} />
                <div className="leading-tight">
                  <div className={`text-sm ${labelColor}`}>
                    {T(status.label, status.label_ta)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CARD 3: Quick Stats ── */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {T("Quick Stats", "சுருக்கமான புள்ளிவிவரம்")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">{T("Days Open", "திறந்த நாட்கள்")}</span>
            <span className={`text-sm font-extrabold ${daysColor}`}>{days} {T("days", "நாட்கள்")}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">{T("Verifications", "சரிபார்ப்புகள்")}</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">✓ {verificationCount}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">{T("Complaints", "புகார்கள்")}</span>
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{complaintsCount} {T("filed", "தாக்கல்")}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">{T("Still Not Fixed", "இன்னும் சரியாகவில்லை")}</span>
            <span className={`text-sm font-extrabold ${stillNotFixedCount > 0 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}`}>{stillNotFixedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
