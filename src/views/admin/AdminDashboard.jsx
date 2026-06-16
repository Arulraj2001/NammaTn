import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, MessageSquare, Flag, CheckCircle, XCircle, Clock, Shield, AlertTriangle } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getDashboardStats } from "@/services/admin/posts";
import { getPendingReports } from "@/services/admin/reports";
import { getAllComments } from "@/services/admin/comments";
import { getModerationLogs } from "@/services/admin/moderation";
import { getQueueStats } from "@/services/ai/moderationQueue";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getDashboardStats,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ["admin-reports-pending"],
    queryFn: getPendingReports,
  });
  const { data: comments = [] } = useQuery({
    queryKey: ["admin-comments-latest"],
    queryFn: () => getAllComments(5),
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["admin-mod-logs"],
    queryFn: () => getModerationLogs(10),
  });
  const { data: queueStats } = useQuery({
    queryKey: ["queue-stats"],
    queryFn: getQueueStats,
    staleTime: 30_000,
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Posts" value={stats?.total} icon={FileText} color="blue" loading={statsLoading} />
        <StatCard label="Active Posts" value={stats?.active} icon={CheckCircle} color="green" loading={statsLoading} />
        <StatCard label="Flagged" value={stats?.flagged} icon={Flag} color="yellow" loading={statsLoading} />
        <StatCard label="Removed" value={stats?.removed} icon={XCircle} color="red" loading={statsLoading} />
      </div>

      {/* AI Moderation Queue Summary */}
      {queueStats && queueStats.total > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 text-sm">AI Moderation Queue Active</p>
              <p className="text-xs text-blue-700">
                {queueStats.total} items need review
                {queueStats.high_priority > 0 && ` · ${queueStats.high_priority} high priority`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {queueStats.high_priority > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3" /> {queueStats.high_priority} critical
              </span>
            )}
            <Link to="/admin/moderation" className="text-xs font-semibold text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              Open Queue →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reports */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-orange-500" />
              Pending Reports
              {reports.length > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{reports.length}</span>
              )}
            </h2>
            <Link to="/admin/reports" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No pending reports</p>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{r.target_type}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{r.reason}</span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Moderation Logs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Recent Actions
            </h2>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No moderation actions yet</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{log.action}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 capitalize">{log.target_type}</span>
                    {log.note && <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">{log.note}</p>}
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {log.created_date ? formatDistanceToNow(new Date(log.created_date), { addSuffix: true }) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Comments */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              Latest Comments
            </h2>
            <Link to="/admin/comments" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No comments yet</p>
          ) : (
            <div className="space-y-2">
              {comments.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{c.content}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{c.is_anonymous ? "Anonymous" : c.author_name}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}