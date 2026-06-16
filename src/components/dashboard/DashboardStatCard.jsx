import React from "react";
import { motion } from "framer-motion";

const COLOR_MAP = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  green: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  cyan: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
};

export default function DashboardStatCard({ icon: Icon, label, value, color = "blue", loading }) {
  const colorCls = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorCls}`}>
        <Icon className="w-4 h-4" />
      </div>
      {loading ? (
        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value ?? "—"}</p>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{label}</p>
    </motion.div>
  );
}