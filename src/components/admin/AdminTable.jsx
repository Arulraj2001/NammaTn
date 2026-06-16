import React from "react";
import { cn } from "@/lib/utils";

export function AdminTable({ children, className }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function AdminTh({ children, className }) {
  return (
    <th className={cn("text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200", className)}>
      {children}
    </th>
  );
}

export function AdminTd({ children, className }) {
  return (
    <td className={cn("px-4 py-3 border-b border-slate-100 text-slate-700", className)}>
      {children}
    </td>
  );
}

export function AdminTr({ children, className }) {
  return (
    <tr className={cn("hover:bg-slate-50 transition-colors", className)}>
      {children}
    </tr>
  );
}