import React, { useState } from "react";
import { analyzePost } from "@/services/ai/contentAnalysis";
import { computeContentTrustScore, getPriorityLabel } from "@/services/ai/trustScore";
import AiAnalysisBadge from "./AiAnalysisBadge";
import SensitiveDataWarning from "./SensitiveDataWarning";
import { Zap, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * AI Moderation Assistant panel for the post preview dialog.
 * Props: post (Post object), reportCount (number)
 */
export default function AiModerationAssistant({ post, reportCount = 0 }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    const result = await analyzePost(post.title_en, post.content_en || "");
    setLoading(false);
    setAnalysis(result);
  };

  const trustScore = analysis ? computeContentTrustScore(post, reportCount) : null;
  const priority = trustScore !== null ? getPriorityLabel(100 - trustScore) : null;

  return (
    <div className="border border-blue-100 rounded-xl bg-blue-50/30 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">AI Moderation Assistant</span>
          <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={runAnalysis}
          disabled={loading}
          className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Zap className="w-3 h-3 mr-1" />
          )}
          {loading ? "Analyzing…" : analysis ? "Re-analyze" : "Analyze Post"}
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2.5">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>AI suggestions assist human review. Final decisions are always made by moderators.</span>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{error}</p>
      )}

      {!analysis && !loading && (
        <p className="text-xs text-slate-500 text-center py-2">
          Click "Analyze Post" to get AI moderation suggestions for this content.
        </p>
      )}

      {analysis && (
        <div className="space-y-3">
          <AiAnalysisBadge analysis={{
            ...analysis,
            sensitive_findings: analysis.sensitive?.findings?.map((f) => f.type) || [],
          }} />

          {/* Sensitive data warning */}
          {analysis.sensitive?.hasSensitive && (
            <SensitiveDataWarning findings={analysis.sensitive.findings} />
          )}

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-slate-700 mb-2">Suggestions</p>
              {analysis.suggestions.map((s, i) => (
                <p key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">→</span> {s}
                </p>
              ))}
            </div>
          )}

          {/* Review recommendation */}
          {analysis.needs_review && (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Zap className="w-3.5 h-3.5" />
              AI recommends human review of this content
            </div>
          )}

          <p className="text-xs text-slate-400 text-right">
            Source: {analysis.source === "ai" ? "AI Analysis" : "Pattern Detection"}
          </p>
        </div>
      )}
    </div>
  );
}