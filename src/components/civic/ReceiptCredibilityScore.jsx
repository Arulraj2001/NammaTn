import React from "react";
import { ShieldCheck, Users, Camera, Star, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { computeReceiptCredibility } from "@/lib/computeReceiptCredibility";

const RING_SIZE = 72;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function scoreColor(score) {
  if (score >= 70) return { text: "text-emerald-600 dark:text-emerald-400", ring: "#10b981", bar: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
  if (score >= 40) return { text: "text-amber-600 dark:text-amber-400", ring: "#f59e0b", bar: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" };
  return { text: "text-red-600 dark:text-red-400", ring: "#ef4444", bar: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/20" };
}

export default function ReceiptCredibilityScore({ post, authorTrustScore = 0, complaintTrackers = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  // Derive complaint-side inputs from trackers array
  const complaintCount = Array.isArray(complaintTrackers) ? complaintTrackers.length : 0;
  const hasScreenshot = Array.isArray(complaintTrackers) && complaintTrackers.some((t) => t.screenshot_url);

  const { total, verification, evidence, author, complaint, breakdown } =
    computeReceiptCredibility(post, authorTrustScore, complaintCount, hasScreenshot);

  const sc = scoreColor(total);
  const dashOffset = RING_CIRCUMFERENCE - (total / 100) * RING_CIRCUMFERENCE;

  const factors = [
    {
      icon: Users,
      label: T("Verification", "சரிபார்ப்பு"),
      score: verification,
      detail: `${breakdown.verificationCount}/5`,
      color: "bg-indigo-500",
      track: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      icon: Camera,
      label: T("Evidence", "ஆதாரம்"),
      score: evidence,
      detail: `${[breakdown.hasPhotos, breakdown.hasGps, breakdown.hasDescription, breakdown.hasLocationText].filter(Boolean).length}/4`,
      color: "bg-blue-500",
      track: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Star,
      label: T("Author Trust", "ஆசிரியர் நம்பகத்தன்மை"),
      score: author,
      detail: `★ ${author}`,
      color: "bg-purple-500",
      track: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: FileText,
      label: T("Official", "அதிகாரப்பூர்வ"),
      score: complaint,
      detail: `${complaintCount} ${T("filed", "தாக்கல்")}`,
      color: "bg-amber-500",
      track: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
          {T("Receipt Credibility Score", "ரசீது நம்பகத்தன்மை மதிப்பெண்")}
        </span>
      </div>

      <div className="px-5 py-4 flex items-start gap-5">
        {/* Circular ring */}
        <div className="flex-shrink-0 relative flex items-center justify-center">
          <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            {/* Progress */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={sc.ring}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
          </svg>
          <span className={`absolute text-lg font-extrabold ${sc.text}`}>{total}</span>
        </div>

        {/* Factor bars */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {factors.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <f.icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {f.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 ml-2 flex-shrink-0">
                    {f.detail}
                  </span>
                </div>
                <div className={`h-1.5 rounded-full ${f.track} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${f.color} transition-all duration-500`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer label */}
      <div className={`px-5 py-2 text-center ${sc.bg}`}>
        <p className={`text-xs font-semibold ${sc.text}`}>
          {total >= 70
            ? T("High Credibility — Well-documented issue", "உயர் நம்பகத்தன்மை — நன்கு ஆவணப்படுத்தப்பட்ட சிக்கல்")
            : total >= 40
            ? T("Moderate — More evidence or verifications would strengthen this receipt", "நடுத்தர — மேலும் ஆதாரங்கள் அல்லது சரிபார்ப்புகள் இந்த ரசீதை வலுப்படுத்தும்")
            : T("Low — This receipt needs more community verification and evidence", "குறைவு — இந்த ரசீதுக்கு மேலும் சமுதாய சரிபார்ப்பு மற்றும் ஆதாரம் தேவை")}
        </p>
      </div>
    </div>
  );
}
