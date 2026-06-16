import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueueStats } from "@/services/ai/moderationQueue";
import ModerationQueuePanel from "@/components/admin/moderation/ModerationQueuePanel";
import ModerationAnalyticsPanel from "@/components/admin/moderation/ModerationAnalyticsPanel";
import CommentModerationPanel from "@/components/admin/moderation/CommentModerationPanel";
import ChatModerationPanel from "@/components/admin/moderation/ChatModerationPanel";
import { Shield, BarChart2, List, MessageSquare, MessageCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "queue", label: "Posts Queue", icon: List },
  { key: "comments", label: "Comments", icon: MessageSquare },
  { key: "chat", label: "Live Chat", icon: MessageCircle },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
];

export default function AdminModeration() {
  const [tab, setTab] = useState("queue");

  const { data: stats } = useQuery({
    queryKey: ["queue-stats"],
    queryFn: getQueueStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">AI Moderation</h1>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Phase 7</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            AI-assisted review — humans make all final decisions
          </p>
        </div>

        {/* Queue stats bar */}
        {stats && (
          <div className="flex gap-3 flex-wrap">
            <StatPill label="Total Queue" value={stats.total} color="bg-slate-100 text-slate-700" />
            <StatPill label="High Priority" value={stats.high_priority} color="bg-red-50 text-red-700" />
            <StatPill label="Reports" value={stats.pending_reports} color="bg-orange-50 text-orange-700" />
            <StatPill label="Flagged Comments" value={stats.flagged_comments} color="bg-purple-50 text-purple-700" />
          </div>
        )}
      </div>

      {/* AI ethics notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 leading-relaxed">
          <strong>Human-First Moderation:</strong> AI analysis flags content for review and provides confidence scores.
          No content is automatically removed. All actions require admin confirmation.
          AI suggestions are advisory only — moderators retain full discretion.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "queue" && <ModerationQueuePanel />}
      {tab === "comments" && <CommentModerationPanel />}
      {tab === "chat" && <ChatModerationPanel />}
      {tab === "analytics" && <ModerationAnalyticsPanel />}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className={cn("px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2", color)}>
      <span className="font-bold text-base leading-none">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}