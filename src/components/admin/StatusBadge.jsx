import React from "react";

const CONFIGS = {
  active: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  flagged: "bg-orange-100 text-orange-700",
  removed: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  dismissed: "bg-slate-100 text-slate-600",
  actioned: "bg-blue-100 text-blue-700",
  reviewed: "bg-blue-100 text-blue-700",
  banner: "bg-purple-100 text-purple-700",
  native: "bg-indigo-100 text-indigo-700",
};

export default function StatusBadge({ status }) {
  const cls = CONFIGS[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}