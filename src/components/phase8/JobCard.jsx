import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Briefcase, Clock, Phone, Flag, AlertTriangle, Users, Package, Wrench, FileText, Box, User, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/spamGuard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";

const TYPE_CONFIG = {
  local_hiring: {
    label: "Local Hiring",
    bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    border: "border-emerald-500",
    iconBoxBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30",
    btnBg: "bg-[#044732] hover:bg-[#033626] text-white",
    icon: User,
  },
  delivery: {
    label: "Delivery",
    bg: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    border: "border-orange-500",
    iconBoxBg: "bg-orange-50 text-orange-600 dark:bg-orange-900/30",
    btnBg: "bg-orange-500 hover:bg-orange-600 text-white",
    icon: Package,
  },
  helper: {
    label: "Helper Required",
    bg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    border: "border-indigo-500",
    iconBoxBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30",
    btnBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
    icon: Wrench,
  },
  temporary: {
    label: "Temporary",
    bg: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    border: "border-sky-500",
    iconBoxBg: "bg-sky-50 text-sky-600 dark:bg-sky-900/30",
    btnBg: "bg-sky-600 hover:bg-sky-700 text-white",
    icon: FileText,
  },
  urgent_manpower: {
    label: "Urgent Manpower",
    bg: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
    border: "border-pink-500",
    iconBoxBg: "bg-pink-50 text-pink-600 dark:bg-pink-900/30",
    btnBg: "bg-pink-600 hover:bg-pink-700 text-white",
    icon: Box,
  },
  part_time: {
    label: "Part-time",
    bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    border: "border-blue-500",
    iconBoxBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30",
    btnBg: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: Clock,
  },
  other: {
    label: "Other",
    bg: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    iconBoxBg: "bg-slate-50 text-slate-600 dark:bg-slate-800",
    btnBg: "bg-slate-700 hover:bg-slate-800 text-white",
    icon: Briefcase,
  },
};

const REPORT_REASONS = [
  { value: "fake_job", label: "Fake job post" },
  { value: "advance_fee", label: "Asked for advance payment" },
  { value: "misleading", label: "Misleading information" },
  { value: "scam_fraud", label: "Scam / Fraud" },
  { value: "wrong_contact", label: "Wrong contact info" },
  { value: "spam", label: "Spam / Duplicate" },
  { value: "other", label: "Other" },
];

export default function JobCard({ item }) {
  const { data: creatorProfile = null } = useQuery({
    queryKey: ["creator-profile", item.created_by_id],
    queryFn: async () => {
      if (!item.created_by_id) return null;
      const { data, error } = await supabase
        .from("profile")
        .select("trust_score")
        .eq("id", item.created_by_id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!item.created_by_id,
    staleTime: 60_000,
  });

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("fake_job");
  const [reported, setReported] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const age = item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : "recently";
  const cfg = TYPE_CONFIG[item.job_type] || TYPE_CONFIG.other;
  const TypeIcon = cfg.icon;

  const handleReport = async () => {
    if (submitting || reported) return;
    setSubmitting(true);
    const session = getSession();
    const key = `job_reported_${item.id}_${session}`;
    if (localStorage.getItem(key)) { setReported(true); setShowReport(false); setSubmitting(false); return; }
    await base44.entities.Report.create({
      target_type: "job_alert",
      target_id: item.id,
      reason: reportReason,
      reporter_session: session,
    }).catch(() => {});
    await base44.entities.JobAlert.update(item.id, { report_count: (item.report_count || 0) + 1 }).catch(() => {});
    localStorage.setItem(key, "1");
    setReported(true);
    setShowReport(false);
    setSubmitting(false);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-3xl border-2 ${cfg.border} hover:shadow-xl transition-all duration-200 p-5 flex flex-col justify-between relative`}>
      <div>
        {/* Header: Icon box + Type badge + Age */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.iconBoxBg}`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${cfg.bg}`}>
                {cfg.label}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{age}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Company / Poster Name */}
        {item.company_or_poster_name && (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            {item.company_or_poster_name}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
          {item.description}
        </p>
      </div>

      <div>
        {/* Location & Duration row */}
        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {item.area_name ? `${item.area_name}, ${item.district_name}` : item.district_name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {item.duration || "Full-time"}
          </span>
        </div>

        {/* Salary row */}
        {item.salary_info && (
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mb-4">
            <span>💵</span>
            <span>{item.salary_info}</span>
          </div>
        )}

        {/* Bottom CTA & Report */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {item.contact_visible && item.contact_info ? (
            <a
              href={`tel:${item.contact_info.replace(/\s/g, "")}`}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${cfg.btnBg}`}
            >
              <Phone className="w-4 h-4" />
              <span>Contact: {item.contact_info}</span>
            </a>
          ) : (
            <div className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold ${cfg.btnBg}`}>
              <Phone className="w-4 h-4" />
              <span>Apply / View Details</span>
            </div>
          )}

          {/* Report link */}
          <div className="flex items-center">
            {reported ? (
              <span className="text-[11px] text-slate-400">Reported</span>
            ) : showReport ? (
              <div className="absolute right-3 bottom-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-2 z-20 flex flex-col gap-2 w-48">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowReport(false)} className="text-xs text-slate-400 px-2 py-1">Cancel</button>
                  <button onClick={handleReport} disabled={submitting} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg">
                    {submitting ? "..." : "Submit"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
