"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createListing } from "@/services/stayListings";
import { DISTRICTS } from "@/lib/districts";
import {
  Upload, FileJson, ClipboardPaste, X, CheckCircle2, AlertCircle,
  Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAY_TYPES = ["pg_available", "shared_room", "roommate_needed", "temporary_stay", "hostel"];

const SAMPLE_STAY = [
  {
    title: "Executive Male PG Room near Tidal Park, Taramani",
    description: "Fully furnished 2-sharing AC room with Wi-Fi, 3 times food, laundry, and daily housekeeping. Walking distance to Tidal Park MRTS.",
    listing_type: "pg_available",
    district_slug: "chennai",
    district_name: "Chennai",
    area_name: "Taramani",
    rent_amount: 8500,
    gender_preference: "boys",
    contact_phone: "9876543210",
    is_verified: true,
    created_by: "Taramani PG Admin"
  },
  {
    title: "Single Roommate Needed in 2BHK Apartment",
    description: "Looking for a working professional roommate for a spacious AC bedroom with attached bath in RS Puram. Rent split equally.",
    listing_type: "roommate_needed",
    district_slug: "coimbatore",
    district_name: "Coimbatore",
    area_name: "RS Puram",
    rent_amount: 6000,
    gender_preference: "any",
    contact_phone: "9443210987",
    is_verified: true,
    created_by: "Rahul M."
  }
];

export default function ImportStay({ onDone }) {
  const queryClient = useQueryClient();
  const [rawInput, setRawInput] = useState("");
  const [parsed, setParsed] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ total: 0, current: 0, success: 0, failed: 0 });
  const [log, setLog] = useState([]);

  const handleParse = (text = rawInput) => {
    setParseError(null);
    if (!text.trim()) { setParsed([]); return; }
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [data];
      const validated = arr.map((item, idx) => {
        const errors = [];
        if (!item.title?.trim()) errors.push("Missing title");
        if (!item.description?.trim()) errors.push("Missing description");
        if (!item.district_slug?.trim()) errors.push("Missing district_slug");
        const districtObj = DISTRICTS.find(d => d.slug === item.district_slug);
        const resolvedDistrictName = item.district_name || districtObj?.name_en || item.district_slug;
        const resolvedStayType = STAY_TYPES.includes(item.listing_type) ? item.listing_type : "pg_available";

        return {
          ...item,
          _id: idx,
          listing_type: resolvedStayType,
          district_name: resolvedDistrictName,
          status: "active",
          safety_status: "approved",
          is_publicly_visible: true,
          _errors: errors,
        };
      });

      setParsed(validated);
      setStatus("parsed");
    } catch (e) {
      setParseError("Invalid JSON syntax: " + e.message);
      setParsed([]);
    }
  };

  const handleImport = async () => {
    const validItems = parsed.filter(p => p._errors.length === 0);
    if (validItems.length === 0) return;

    setStatus("importing");
    setProgress({ total: validItems.length, current: 0, success: 0, failed: 0 });
    setLog([]);

    let sCount = 0;
    let fCount = 0;

    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      const { _id, _errors, ...payload } = item;
      try {
        await createListing(payload);
        sCount++;
        setLog(l => [...l, { type: "success", msg: `✓ Imported: ${payload.title}` }]);
      } catch (err) {
        fCount++;
        setLog(l => [...l, { type: "error", msg: `✗ Failed: ${payload.title} — ${err.message}` }]);
      }
      setProgress({ total: validItems.length, current: i + 1, success: sCount, failed: fCount });
    }

    setStatus("done");
    queryClient.invalidateQueries({ queryKey: ["admin-stay"] });
    queryClient.invalidateQueries({ queryKey: ["stay-listings"] });
    if (onDone) onDone();
  };

  const loadSample = () => {
    const text = JSON.stringify(SAMPLE_STAY, null, 2);
    setRawInput(text);
    handleParse(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
        <div>
          <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Bulk Import Rooms & Stays</h3>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">
            Paste a JSON array of stay/room listings. Admin-imported listings are automatically active.
          </p>
        </div>
        <button onClick={loadSample} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-xl shadow-xs hover:bg-indigo-50">
          <Sparkles className="w-3.5 h-3.5" /> Load Sample JSON
        </button>
      </div>

      {status !== "done" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Paste JSON Data
            </label>
            {parsed.length > 0 && (
              <span className="text-xs font-medium text-slate-500">
                {parsed.filter(p => p._errors.length === 0).length} / {parsed.length} valid
              </span>
            )}
          </div>
          <textarea
            value={rawInput}
            onChange={(e) => { setRawInput(e.target.value); handleParse(e.target.value); }}
            placeholder='[\n  {\n    "title": "PG Room in Velachery",\n    "description": "...",\n    "listing_type": "pg_available",\n    "district_slug": "chennai"\n  }\n]'
            rows={8}
            className="w-full p-3 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {parseError && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {parseError}
            </p>
          )}
        </div>
      )}

      {parsed.length > 0 && status !== "done" && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Preview Items ({parsed.length})
          </h4>
          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">District</th>
                  <th className="p-2.5">Rent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parsed.map((item) => (
                  <tr key={item._id} className={cn(item._errors.length > 0 && "bg-red-50/50 dark:bg-red-900/10")}>
                    <td className="p-2.5">
                      {item._errors.length === 0 ? (
                        <span className="text-indigo-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold flex items-center gap-1" title={item._errors.join(", ")}>
                          <AlertCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">{item.title}</td>
                    <td className="p-2.5 text-slate-500">{item.listing_type}</td>
                    <td className="p-2.5 text-slate-500">{item.district_name}</td>
                    <td className="p-2.5 text-slate-500">{item.rent_amount ? `₹${item.rent_amount}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleImport}
              disabled={status === "importing" || parsed.filter(p => p._errors.length === 0).length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow transition-all disabled:opacity-50"
            >
              {status === "importing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import {parsed.filter(p => p._errors.length === 0).length} Stays
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Import Completed 🎉</h4>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
              {progress.success} Success · {progress.failed} Failed
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto font-mono text-xs space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {log.map((l, i) => (
              <div key={i} className={l.type === "success" ? "text-indigo-600" : "text-red-500"}>{l.msg}</div>
            ))}
          </div>
          <button
            onClick={() => { setStatus("idle"); setRawInput(""); setParsed([]); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Import More Stays
          </button>
        </div>
      )}
    </div>
  );
}
