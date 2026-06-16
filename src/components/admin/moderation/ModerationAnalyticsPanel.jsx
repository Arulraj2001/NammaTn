import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Flag, ShieldCheck, Zap, MessageSquare } from "lucide-react";

export default function ModerationAnalyticsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["moderation-analytics"],
    queryFn: fetchModerationAnalytics,
    staleTime: 120_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = data || { flagged: 0, removed: 0, reports: 0, comments_flagged: 0, by_reason: [] };

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={Flag} label="Flagged Posts" value={stats.flagged} color="text-amber-600" bg="bg-amber-50" />
        <KpiCard icon={ShieldCheck} label="Removed Posts" value={stats.removed} color="text-red-600" bg="bg-red-50" />
        <KpiCard icon={TrendingUp} label="Pending Reports" value={stats.reports} color="text-orange-600" bg="bg-orange-50" />
        <KpiCard icon={MessageSquare} label="Flagged Comments" value={stats.comments_flagged} color="text-purple-600" bg="bg-purple-50" />
      </div>

      {/* Reports by reason chart */}
      {stats.by_reason.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-semibold text-slate-800">Reports by Reason</h4>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.by_reason} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="reason" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v) => [v, "Reports"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.by_reason.map((entry, index) => (
                  <Cell key={index} fill={REASON_COLORS[index % REASON_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Action distribution */}
      {stats.actions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Recent Moderation Actions</h4>
          <div className="flex flex-wrap gap-2">
            {stats.actions.map((a) => (
              <span key={a.action} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-medium text-slate-800 capitalize">{a.action}</span>
                <span className="text-slate-400">{a.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const REASON_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#f97316"];

function KpiCard({ icon: IconComp, label, value, color, bg }) {
  const Icon = IconComp;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

async function fetchModerationAnalytics() {
  const [posts, reports, comments, logs] = await Promise.all([
    base44.entities.Post.list("-created_date", 500),
    base44.entities.Report.list("-created_date", 500),
    base44.entities.Comment.list("-created_date", 500),
    base44.entities.ModerationLog.list("-created_date", 200),
  ]);

  // Count by report reason
  const reasonMap = {};
  reports.forEach((r) => {
    const key = r.reason?.replace(/_/g, " ") || "other";
    reasonMap[key] = (reasonMap[key] || 0) + 1;
  });
  const by_reason = Object.entries(reasonMap)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Count by action
  const actionMap = {};
  logs.forEach((l) => {
    actionMap[l.action] = (actionMap[l.action] || 0) + 1;
  });
  const actions = Object.entries(actionMap)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count);

  return {
    flagged: posts.filter((p) => p.status === "flagged").length,
    removed: posts.filter((p) => p.status === "removed").length,
    reports: reports.filter((r) => r.status === "pending").length,
    comments_flagged: comments.filter((c) => c.status === "flagged").length,
    by_reason,
    actions,
  };
}