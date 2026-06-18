import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, EyeOff, RotateCcw, Trash2, Flag, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { hideComment, restoreComment, deleteComment } from "@/services/comments";
import { updateReportStatus } from "@/services/admin/reports";

const STATUS_COLORS = {
  active: "bg-green-50 text-green-700",
  flagged: "bg-amber-50 text-amber-700",
  hidden: "bg-red-50 text-red-600",
  removed: "bg-slate-100 text-slate-400",
};

export default function CommentModerationPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("flagged");
  const [expandedId, setExpandedId] = useState(null);
  const [hideReason, setHideReason] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments", filter],
    queryFn: async () => {
      if (filter === "all") return await base44.entities.Comment.list("-created_date", 100);
      // is_pending_review does not exist in DB; flagged comments are tracked via status="flagged"
      if (filter === "pending") return await base44.entities.Comment.filter({ status: "flagged" }, "-created_date", 100);
      return await base44.entities.Comment.filter({ status: filter }, "-created_date", 100);
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // Also load reports for comments
  const { data: reports = [] } = useQuery({
    queryKey: ["admin-comment-reports"],
    queryFn: () => base44.entities.Report.filter({ target_type: "comment", status: "pending" }, "-created_date", 200),
    staleTime: 15_000,
  });

  const reportsByTarget = reports.reduce((acc, r) => {
    acc[r.target_id] = (acc[r.target_id] || 0) + 1;
    return acc;
  }, {});

  const act = async (id, action, reason = "") => {
    if (action === "hide") await hideComment(id, "admin", reason);
    else if (action === "restore") await restoreComment(id);
    else if (action === "delete") await deleteComment(id);

    // Mark related reports as reviewed
    const related = reports.filter((r) => r.target_id === id);
    await Promise.all(related.map((r) => updateReportStatus(r.id, "reviewed", action)));

    qc.invalidateQueries({ queryKey: ["admin-comments"] });
    qc.invalidateQueries({ queryKey: ["admin-comment-reports"] });
    toast({ description: `Comment ${action}d.` });
    setExpandedId(null);
    setHideReason("");
  };

  const TABS = [
    { key: "flagged", label: "Flagged" },
    { key: "pending", label: "Reported (≥3)" },
    { key: "hidden", label: "Hidden" },
    { key: "active", label: "Active" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <MessageSquare className="w-4 h-4 text-purple-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Comment Moderation</h3>
        {reports.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-auto">
            {reports.length} reports
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              filter === tab.key ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No comments in this category</p>
          </div>
        ) : (
          comments.map((c) => {
            const isExpanded = expandedId === c.id;
            const reportCount = reportsByTarget[c.id] || 0;
            return (
              <div key={c.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="text-sm text-slate-800 line-clamp-2 text-left hover:text-purple-600 w-full"
                    >
                      {c.content}
                    </button>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", STATUS_COLORS[c.status] || "bg-slate-100 text-slate-500")}>
                        {c.status}
                      </span>
                      {c.status === "flagged" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">flagged for review</span>
                      )}
                      {reportCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <Flag className="w-3 h-3" /> {reportCount} report{reportCount > 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {c.created_date ? formatDistanceToNow(new Date(c.created_date), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 ml-2 p-3 bg-slate-50 rounded-xl space-y-2">
                    <p className="text-xs text-slate-600 whitespace-pre-wrap">{c.content}</p>
                    <p className="text-xs text-slate-400">
                      By: {c.is_anonymous ? "Anonymous" : c.author_name || "Unknown"} ·
                      Post ID: {c.post_id?.slice(0, 8)}…
                    </p>
                    {c.hidden_reason && (
                      <p className="text-xs text-red-500">Hidden reason: {c.hidden_reason}</p>
                    )}

                    {/* Hide reason input for hide action */}
                    {(c.status === "active" || c.status === "flagged") && (
                      <div className="flex gap-2 items-center">
                        <input
                          value={hideReason}
                          onChange={(e) => setHideReason(e.target.value)}
                          placeholder="Hide reason (optional)"
                          className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                        <button
                          onClick={() => act(c.id, "hide", hideReason)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg"
                        >
                          <EyeOff className="w-3 h-3" /> Hide
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      {c.status === "hidden" && (
                        <button
                          onClick={() => act(c.id, "restore")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                      )}
                      {c.status !== "removed" && (
                        <button
                          onClick={() => { if (window.confirm("Permanently delete this comment?")) act(c.id, "delete"); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 text-xs font-medium rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
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