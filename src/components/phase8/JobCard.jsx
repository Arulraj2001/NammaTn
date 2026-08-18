import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Briefcase, Clock, Phone, BadgeCheck, Sparkles, Crown, Flag, AlertTriangle, Zap, Package, Hammer, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/spamGuard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";

const TYPE_CONFIG = {
  part_time:       { label: "Part-time",      accent: "border-l-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20",    text: "text-blue-700 dark:text-blue-300",    icon: Clock,     iconColor: "text-blue-500" },
  temporary:       { label: "Temporary",       accent: "border-l-violet-500",  bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-300", icon: Clock,    iconColor: "text-violet-500" },
  local_hiring:    { label: "Local Hiring",    accent: "border-l-green-500",   bg: "bg-green-50 dark:bg-green-900/20",  text: "text-green-700 dark:text-green-300",  icon: Users,     iconColor: "text-green-500" },
  delivery:        { label: "Delivery",        accent: "border-l-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20",  text: "text-amber-700 dark:text-amber-300",  icon: Package,   iconColor: "text-amber-500" },
  helper:          { label: "Helper Required", accent: "border-l-orange-500",  bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300", icon: Hammer,   iconColor: "text-orange-500" },
  urgent_manpower: { label: "Urgent",          accent: "border-l-red-500",     bg: "bg-red-50 dark:bg-red-900/20",      text: "text-red-700 dark:text-red-300",      icon: Zap,       iconColor: "text-red-500" },
  other:           { label: "Work Alert",      accent: "border-l-slate-400",   bg: "bg-slate-50 dark:bg-slate-800",     text: "text-slate-600 dark:text-slate-300",  icon: Briefcase, iconColor: "text-slate-500" },
};

const REPORT_REASONS = [
  { value: "fake_job",      label: "Fake job post" },
  { value: "advance_fee",   label: "Asked for advance payment" },
  { value: "misleading",    label: "Misleading information" },
  { value: "scam_fraud",    label: "Scam / Fraud" },
  { value: "wrong_contact", label: "Wrong contact info" },
  { value: "spam",          label: "Spam / Duplicate" },
  { value: "other",         label: "Other" },
];

function getFreshnessLabel(createdDate) {
  if (!createdDate) return null;
  const hoursAgo = (Date.now() - new Date(createdDate).getTime()) / 3_600_000;
  if (hoursAgo < 3)  return { label: "Just posted", dot: "bg-green-500", text: "text-green-700 dark:text-green-400" };
  if (hoursAgo < 24) return { label: "Today",       dot: "bg-green-400", text: "text-green-600 dark:text-green-400" };
  if (hoursAgo < 72) return { label: "Recent",      dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" };
  return null;
}

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

  const age = item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : "";
  const freshness = getFreshnessLabel(item.created_date);
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
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 ${cfg.accent} hover:shadow-lg transition-all duration-200 overflow-hidden`}>
      <div className="p-4">
        {/* Header: type badge + freshness + age */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              <TypeIcon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
              {cfg.label}
            </span>
            {freshness && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${freshness.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${freshness.dot}`} />
                {freshness.label}
              </span>
            )}
            {item.is_verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
            {item.is_sponsored && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white">
                <Crown className="w-3 h-3" /> Sponsored
              </span>
            )}
            {item.is_featured && !item.is_sponsored && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
            {item.safety_status === "suspicious" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="w-3 h-3" /> Under Review
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">{age}</span>
        </div>

        {/* Title */}
        <p className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-1">{item.title}</p>
        {item.company_or_poster_name && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">{item.company_or_poster_name}</p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">{item.description}</p>

        {/* Meta pills */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {item.area_name ? `${item.area_name}, ${item.district_name}` : item.district_name}
          </span>
          {item.duration && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" /> {item.duration}
            </span>
          )}
          {item.salary_info && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
              ðŸ’° {item.salary_info}
            </span>
          )}
          {item.created_by && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              ðŸ‘¤ {item.created_by} Â· â˜… {creatorProfile?.trust_score || 10}
            </span>
          )}
        </div>

        {/* Contact CTA button */}
        {item.contact_visible && item.contact_info && (
          <a
            href={`tel:${item.contact_info.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors mb-3"
          >
            <Phone className="w-4 h-4" />
            {item.contact_info}
          </a>
        )}

        {/* Report */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-700/50">
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
  );
}
