import React from "react";

export default function ActivityChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  const formatDay = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short" });
  };

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{d.count}</span>
          <div className="w-full rounded-t-lg bg-blue-100 dark:bg-blue-900/30 overflow-hidden flex items-end" style={{ height: "80px" }}>
            <div
              className="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
              style={{ height: `${Math.max(4, (d.count / max) * 80)}px` }}
            />
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDay(d.date)}</span>
        </div>
      ))}
    </div>
  );
}