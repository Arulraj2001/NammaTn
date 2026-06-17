import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Briefcase, Clock, Phone, BadgeCheck, Sparkles, Crown, Flag, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/spamGuard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";

const TYPE_LABELS = {
  part_time:       "Part-time",
  temporary:       "Temporary",
  local_hiring:    "Local Hiring",
  delivery:        "Delivery",
  helper:          "Helper Required",
  urgent_manpower: "Urgent Manpower",
  other:           "Work Alert",
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
  // Query creator's trust score
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

  const age = item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : "";

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
    // Increment report_count
    await base44.entities.JobAlert.update(item.id, { report_count: (item.report_count || 0) + 1 }).catch(() => {});
    localStorage.setItem(key, "1");
    setReported(true);
    setShowReport(false);
    setSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Type + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              {TYPE_LABELS[item.job_type] || "Work Alert"}
            </span>
            {item.is_verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
            {item.is_featured && !item.is_sponsored && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
            {item.is_sponsored && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white">
                <Crown className="w-3 h-3" /> Sponsored
              </span>
            )}
            {item.safety_status === "suspicious" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                <AlertTriangle className="w-3 h-3" /> Under Review
              </span>
            )}
          </div>

          <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</p>
          {item.company_or_poster_name && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.company_or_poster_name}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{item.description}</p>
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.area_name ? `${item.area_name}, ` : ""}{item.district_name}</span>
            {item.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>}
            {item.salary_info && <span className="font-medium text-green-600 dark:text-green-400">{item.salary_info}</span>}
            <span className="text-slate-300">{age}</span>
            {item.created_by && (
              <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                👤 {item.created_by} (★ {creatorProfile?.trust_score || 10})
              </span>
            )}
          </div>
          {item.contact_visible && item.contact_info && (
            <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">{item.contact_info}</span>
            </div>
          )}

          {/* Report */}
          <div className="mt-3 flex items-center justify-between">
            <span />
            {reported ? (
              <span className="text-xs text-slate-400">Reported. Thank you.</span>
            ) : showReport ? (
              <div className="flex items-center gap-2 flex-wrap">
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                  className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none">
                  {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <button onClick={handleReport} disabled={submitting}
                  className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60">
                  {submitting ? "..." : "Submit"}
                </button>
                <button onClick={() => setShowReport(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowReport(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                <Flag className="w-3 h-3" /> Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}