import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadModerationQueue, buildReportMap } from "@/services/ai/moderationQueue";
import { getPriorityLabel, getTrustLabel } from "@/services/ai/trustScore";
import { updatePostStatus } from "@/services/admin/posts";
import { logModerationAction } from "@/services/admin/moderation";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Shield, Clock, CheckCircle, Flag, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const QUEUE_LABELS = {
  pending_review: { label: "Pending", color: "text-slate-600", bg: "bg-slate-100" },
  high_priority: { label: "High Priority", color: "text-red-600", bg: "bg-red-50" },
  flagged_spam: { label: "Spam", color: "text-amber-600", bg: "bg-amber-50" },
  abuse_reports: { label: "Abuse", color: "text-orange-600", bg: "bg-orange-50" },
  sensitive_data: { label: "Sensitive", color: "text-purple-600", bg: "bg-purple-50" },
};

export default function ModerationQueuePanel() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["moderation-queue"],
    queryFn: async () => {
      const reportMap = await buildReportMap();
      return loadModerationQueue(reportMap);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const filtered = filter === "all" ? queue : queue.filter((p) => p._queueType === filter);

  const counts = {
    all: queue.length,
    high_priority: queue.filter((p) => p._queueType === "high_priority").length,
    abuse_reports: queue.filter((p) => p._queueType === "abuse_reports").length,
    pending_review: queue.filter((p) => p._queueType === "pending_review").length,
  };

  const act = async (post, status, action) => {
    await updatePostStatus(post.id, status);
    await logModerationAction({ target_type: "post", target_id: post.id, action, admin_email: "admin" });
    queryClient.invalidateQueries({ queryKey: ["moderation-queue"] });
    toast({ description: `Post ${action}.` });
    setExpanded(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Moderation Queue</h3>
          {queue.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {queue.length}
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto">
        {[
          { key: "all", label: "All" },
          { key: "high_priority", label: "High Priority" },
          { key: "abuse_reports", label: "Abuse" },
          { key: "pending_review", label: "Pending" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              filter === tab.key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={cn("ml-1.5 opacity-80", filter === tab.key ? "text-blue-100" : "")}>
                ({counts[tab.key]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Queue items */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading queue…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Queue is clear</p>
          </div>
        ) : (
          filtered.map((post) => {
            const priority = getPriorityLabel(post._priority);
            const trust = getTrustLabel(post._trustScore);
            const queueMeta = QUEUE_LABELS[post._queueType] || QUEUE_LABELS.pending_review;
            const isExpanded = expanded === post.id;

            return (
              <div key={post.id} className="px-4 py-3">
                {/* Row */}
                <div className="flex items-start gap-3">
                  {/* Priority dot */}
                  <div className={cn("mt-1 w-2 h-2 rounded-full flex-shrink-0", {
                    "bg-red-500": post._priority >= 70,
                    "bg-orange-400": post._priority >= 45 && post._priority < 70,
                    "bg-amber-300": post._priority >= 20 && post._priority < 45,
                    "bg-slate-300": post._priority < 20,
                  })} />

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : post.id)}
                      className="text-sm font-medium text-slate-800 line-clamp-1 text-left hover:text-blue-600 w-full"
                    >
                      {post.title_en}
                    </button>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", queueMeta.bg, queueMeta.color)}>
                        {queueMeta.label}
                      </span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium border", priority.bg, priority.color)}>
                        {priority.label}
                      </span>
                      {post._reportCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <Flag className="w-3 h-3" /> {post._reportCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                        <Clock className="w-3 h-3" />
                        {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className={cn("w-4 h-4 text-slate-400 flex-shrink-0 transition-transform", isExpanded && "rotate-90")} />
                </div>

                {/* Expanded actions */}
                {isExpanded && (
                  <div className="mt-3 ml-5 p-3 bg-slate-50 rounded-xl space-y-2">
                    <p className="text-xs text-slate-500 line-clamp-3">{post.content_en || "No content"}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{post.district_name}</span>
                      <span>•</span>
                      <span className="capitalize">{post.post_type?.replace("_", " ")}</span>
                      <span>•</span>
                      <span className={cn("px-1.5 py-0.5 rounded", trust.bg, trust.color)}>
                        Trust: {post._trustScore}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => act(post, "active", "approved")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => act(post, "flagged", "flagged")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" /> Keep Flagged
                      </button>
                      <button
                        onClick={() => act(post, "removed", "deleted")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}