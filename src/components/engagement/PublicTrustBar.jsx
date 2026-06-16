import React from "react";
import { ThumbsUp, ThumbsDown, Users } from "lucide-react";

export default function PublicTrustBar({ upvotes = 0, downvotes = 0, commentCount = 0, lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const total = upvotes + downvotes;
  const ratio = total > 0 ? Math.round((upvotes / total) * 100) : 100;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {T("Community Trust", "சமுதாய நம்பகத்தன்மை")}
        </span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ratio}% {T("positive", "நேர்மறை")}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${ratio}%` }}
        />
      </div>
      <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />{upvotes}</span>
        <span className="flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5 text-red-400" />{downvotes}</span>
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" />{commentCount} {T("comments", "கருத்துகள்")}</span>
      </div>
    </div>
  );
}