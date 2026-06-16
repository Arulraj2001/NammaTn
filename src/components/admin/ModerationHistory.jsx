import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getLogsForTarget } from "@/services/admin/moderation";
import { formatDistanceToNow } from "date-fns";
import { Shield, Clock } from "lucide-react";

const ACTION_COLORS = {
  approved: "text-green-600",
  rejected: "text-red-600",
  deleted: "text-red-700",
  flagged: "text-amber-600",
  dismissed: "text-slate-500",
  actioned: "text-blue-600",
  created: "text-blue-500",
  updated: "text-slate-600",
};

/**
 * Renders audit history for a specific post/comment/report target.
 * Props: target_id (string)
 */
export default function ModerationHistory({ target_id }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["mod-history", target_id],
    queryFn: () => getLogsForTarget(target_id),
    enabled: !!target_id,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-slate-100 rounded" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-xs text-slate-400 py-2">No moderation history.</p>
    );
  }

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
        <Shield className="w-3.5 h-3.5" /> Moderation History
      </h4>
      {logs.map((log) => (
        <div key={log.id} className="flex items-start justify-between gap-2 text-xs py-1.5 border-b border-slate-100 last:border-0">
          <div className="min-w-0">
            <span className={`font-semibold capitalize ${ACTION_COLORS[log.action] || "text-slate-600"}`}>
              {log.action}
            </span>
            {log.note && (
              <span className="text-slate-400 ml-1.5 truncate">— {log.note}</span>
            )}
            <span className="block text-slate-400 text-[10px] mt-0.5">{log.admin_email}</span>
          </div>
          <span className="flex items-center gap-1 text-slate-400 flex-shrink-0 text-[10px]">
            <Clock className="w-2.5 h-2.5" />
            {log.created_date ? formatDistanceToNow(new Date(log.created_date), { addSuffix: true }) : ""}
          </span>
        </div>
      ))}
    </div>
  );
}