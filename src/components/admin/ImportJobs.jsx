"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/services/jobAlerts";
import { DISTRICTS } from "@/lib/districts";
import {
  Upload, FileJson, ClipboardPaste, X, CheckCircle2, AlertCircle,
  Loader2, Sparkles, Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

const JOB_TYPES = ["part_time", "temporary", "local_hiring", "delivery", "helper", "urgent_manpower", "other"];

const SAMPLE_JOBS = [
  {
    title: "Delivery Partners Needed – Adyar & Besant Nagar",
    description: "Urgent hiring for two-wheeler delivery executives for local groceries and food delivery. Flexible hours and daily payouts.",
    job_type: "delivery",
    district_slug: "chennai",
    district_name: "Chennai",
    area_name: "Adyar",
    company_or_poster_name: "SwiftDelivery TN",
    salary_info: "₹600 - ₹900 / day",
    duration: "Full-time / Part-time",
    contact_info: "9876543210",
    contact_visible: true,
    created_by: "SwiftDelivery Admin"
  },
  {
    title: "Billing Assistant for Supermarket in RS Puram",
    description: "Looking for a punctual computer operator for billing counter at retail grocery supermarket. Experience in Tally or POS preferred.",
    job_type: "local_hiring",
    district_slug: "coimbatore",
    district_name: "Coimbatore",
    area_name: "RS Puram",
    company_or_poster_name: "Sri Amman Traders",
    salary_info: "₹12,000 / month",
    duration: "Permanent",
    contact_info: "9443210987",
    contact_visible: true,
    created_by: "Amman Store"
  }
];

export default function ImportJobs({ onDone }) {
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
        const resolvedJobType = JOB_TYPES.includes(item.job_type) ? item.job_type : "local_hiring";

        return {
          ...item,
          _id: idx,
          job_type: resolvedJobType,
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
        await createJob(payload);
        sCount++;
        setLog(l => [...l, { type: "success", msg: `✓ Imported: ${payload.title}` }]);
      } catch (err) {
        fCount++;
        setLog(l => [...l, { type: "error", msg: `✗ Failed: ${payload.title} — ${err.message}` }]);
      }
      setProgress({ total: validItems.length, current: i + 1, success: sCount, failed: fCount });
    }

    setStatus("done");
    queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    if (onDone) onDone();
  };

  const loadSample = () => {
    const text = JSON.stringify(SAMPLE_JOBS, null, 2);
    setRawInput(text);
    handleParse(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
        <div>
          <h3 className="font-bold text-green-900 dark:text-green-300 text-sm">Bulk Import Jobs</h3>
          <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
            Paste a JSON array of job listings. Admin-imported jobs are automatically set to active.
          </p>
        </div>
        <button onClick={loadSample} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 font-semibold text-xs rounded-xl shadow-xs hover:bg-green-50">
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
            placeholder='[\n  {\n    "title": "Delivery Boy",\n    "description": "...",\n    "job_type": "delivery",\n    "district_slug": "chennai"\n  }\n]'
            rows={8}
            className="w-full p-3 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <th className="p-2.5">Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parsed.map((item) => (
                  <tr key={item._id} className={cn(item._errors.length > 0 && "bg-red-50/50 dark:bg-red-900/10")}>
                    <td className="p-2.5">
                      {item._errors.length === 0 ? (
                        <span className="text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold flex items-center gap-1" title={item._errors.join(", ")}>
                          <AlertCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">{item.title}</td>
                    <td className="p-2.5 text-slate-500">{item.job_type}</td>
                    <td className="p-2.5 text-slate-500">{item.district_name}</td>
                    <td className="p-2.5 text-slate-500">{item.salary_info || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleImport}
              disabled={status === "importing" || parsed.filter(p => p._errors.length === 0).length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow transition-all disabled:opacity-50"
            >
              {status === "importing" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import {parsed.filter(p => p._errors.length === 0).length} Jobs
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Import Completed 🎉</h4>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
              {progress.success} Success · {progress.failed} Failed
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto font-mono text-xs space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {log.map((l, i) => (
              <div key={i} className={l.type === "success" ? "text-green-600" : "text-red-500"}>{l.msg}</div>
            ))}
          </div>
          <button
            onClick={() => { setStatus("idle"); setRawInput(""); setParsed([]); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Import More Jobs
          </button>
        </div>
      )}
    </div>
  );
}
