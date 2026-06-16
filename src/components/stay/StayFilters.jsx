import React from "react";
import { Search, X } from "lucide-react";
import { DISTRICTS } from "@/lib/districts";

const RENT_RANGES = [
  { label: "Any", min: 0, max: 999999 },
  { label: "Under ₹3k", min: 0, max: 3000 },
  { label: "₹3k–6k", min: 3000, max: 6000 },
  { label: "₹6k–10k", min: 6000, max: 10000 },
  { label: "₹10k–15k", min: 10000, max: 15000 },
  { label: "₹15k+", min: 15000, max: 999999 },
];

export default function StayFilters({ filters, onChange, areas = [] }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const hasActiveFilters = filters.district || filters.gender !== "any" || filters.rentRange !== 0 || filters.search;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={filters.search || ""}
          onChange={e => set("search", e.target.value)}
          placeholder="Search area, landmark, college, metro..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {filters.search && (
          <button onClick={() => set("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* District */}
      <div className="grid grid-cols-2 gap-2">
        <select value={filters.district || ""} onChange={e => set("district", e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
        </select>

        {/* Gender */}
        <select value={filters.gender || "any"} onChange={e => set("gender", e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
          <option value="any">Any Gender</option>
          <option value="boys">Boys Only</option>
          <option value="girls">Girls Only</option>
          <option value="co_living">Co-Living</option>
        </select>
      </div>

      {/* Rent Range */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Rent Range</p>
        <div className="flex gap-1.5 flex-wrap">
          {RENT_RANGES.map((r, i) => (
            <button key={i} onClick={() => set("rentRange", i)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${filters.rentRange === i ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button onClick={() => onChange({ search: "", district: "", gender: "any", rentRange: 0 })}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
          <X className="w-3 h-3" /> Clear filters
        </button>
      )}
    </div>
  );
}

export { RENT_RANGES };