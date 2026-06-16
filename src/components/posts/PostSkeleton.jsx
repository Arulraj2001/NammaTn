import React from "react";

export default function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
      <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
      <div className="flex justify-between">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}