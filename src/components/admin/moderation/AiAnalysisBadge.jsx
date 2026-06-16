import React from "react";
import { AlertTriangle, CheckCircle, Zap, ShieldAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shows a compact AI analysis summary badge for a post or comment.
 * Props: analysis (ContentAnalysis object), compact (bool)
 */
export default function AiAnalysisBadge({ analysis, compact = false }) {
  if (!analysis) return null;

  const { toxicity_score = 0, spam_score = 0, needs_review, issues = [], sensitive_findings = [] } = analysis;

  const hasSensitive = sensitive_findings.length > 0;
  const isHighToxicity = toxicity_score >= 0.5;
  const isHighSpam = spam_score >= 0.5;
  const isClean = !needs_review && toxicity_score < 0.2 && spam_score < 0.2 && !hasSensitive;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {isHighToxicity && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200">
            <AlertTriangle className="w-3 h-3" />
            Toxic {Math.round(toxicity_score * 100)}%
          </span>
        )}
        {isHighSpam && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
            <Zap className="w-3 h-3" />
            Spam {Math.round(spam_score * 100)}%
          </span>
        )}
        {hasSensitive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
            <ShieldAlert className="w-3 h-3" />
            Sensitive
          </span>
        )}
        {isClean && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Clean
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">AI Analysis</span>
        <span className={cn(
          "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
          analysis.analysis_source === "ai" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
        )}>
          {analysis.analysis_source === "ai" ? "AI" : "Local"}
        </span>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        <ScoreBar label="Toxicity" score={toxicity_score} dangerAt={0.4} />
        <ScoreBar label="Spam" score={spam_score} dangerAt={0.4} />
      </div>

      {/* Classification */}
      {analysis.classification && analysis.classification !== "unknown" && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3 h-3" />
          <span>Suggested type: <strong className="capitalize text-slate-700">{analysis.classification.replace(/_/g, " ")}</strong></span>
          {analysis.classification_confidence && (
            <span className="text-slate-400">({Math.round(analysis.classification_confidence * 100)}%)</span>
          )}
        </div>
      )}

      {/* Sensitive data */}
      {hasSensitive && (
        <div className="flex items-start gap-2 text-xs text-purple-700 bg-purple-50 rounded-lg p-2">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>Sensitive data detected: {sensitive_findings.join(", ")}</span>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <ul className="space-y-1">
          {issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
              {issue}
            </li>
          ))}
        </ul>
      )}

      {isClean && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle className="w-3.5 h-3.5" />
          No issues detected
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score, dangerAt }) {
  const pct = Math.round(score * 100);
  const color = score >= dangerAt + 0.2 ? "bg-red-500"
    : score >= dangerAt ? "bg-amber-400"
    : "bg-green-400";

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className={score >= dangerAt ? "font-semibold text-red-600" : ""}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}