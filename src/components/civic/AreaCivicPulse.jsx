import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Clock, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getDaysOpen } from "@/lib/civicReceipt";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import AreaSponsorBadge from "@/components/sponsors/AreaSponsorBadge";

export default function AreaCivicPulse({ areaSlug, areaName, districtSlug }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: posts = [] } = useQuery({
    queryKey: ["area-civic-issues", areaSlug],
    queryFn: () => base44.entities.Post.filter({ area_slug: areaSlug, post_type: "complaint", status: "active" }, "-created_date", 50),
    enabled: !!areaSlug,
    staleTime: 60_000,
    select: (data) => data.filter((p) => p.moderation_status !== "hidden" && p.is_publicly_visible !== false),
  });

  const active = posts.filter((p) => p.status !== "removed" && p.civic_status !== "citizen_verified_fixed" && p.civic_status !== "duplicate_invalid");

  const longestOpen = [...active].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).slice(0, 3);
  const mostVerified = [...active].sort((a, b) => (b.verification_count || 0) - (a.verification_count || 0)).slice(0, 3);
  const needsComplaint = active.filter((p) => !p.official_complaint_id && ["reported", "community_verified", "complaint_needed"].includes(p.civic_status)).slice(0, 3);
  const unresolvedAfterComplaint = active.filter((p) => p.official_complaint_id && ["complaint_filed", "under_followup", "unresolved_escalated"].includes(p.civic_status)).slice(0, 3);

  if (posts.length === 0) return null;

  const IssueRow = ({ p }) => (
    <Link to={`/post/${p.id}`} className="flex items-start gap-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 -mx-2 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">{p.title_en}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <CivicStatusBadge status={p.civic_status || "reported"} size="xs" />
          <span className="text-[10px] text-slate-400">{getDaysOpen(p.created_date)}d · {p.verification_count || 0} ✓</span>
        </div>
      </div>
    </Link>
  );

  const Section = ({ title, icon: SectionIcon, items, color }) => items.length === 0 ? null : (
    <div>
      <div className={`flex items-center gap-1.5 mb-2`}>
        <SectionIcon className={`w-3.5 h-3.5 ${color}`} />
        <p className={`text-xs font-semibold ${color}`}>{title}</p>
      </div>
      <div className="space-y-0.5">
        {items.map((p) => <IssueRow key={p.id} p={p} />)}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {T("Civic Issues Pulse", "குடிமை சிக்கல்கள் நாடி")}
          </h3>
          <p className="text-xs text-slate-500">{active.length} {T("open issues in this area", "திறந்த சிக்கல்கள்")}</p>
        </div>
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{areaName}</span>
      </div>

      <div className="mb-3">
        <AreaSponsorBadge areaSlug={areaSlug} districtSlug={districtSlug} />
      </div>

      <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-700">
        <Section title={T("Longest Open Issues", "நீண்ட காலமாக திறந்திருக்கும் சிக்கல்கள்")} icon={Clock} items={longestOpen} color="text-red-500" />
        {mostVerified.length > 0 && <div className="pt-3"><Section title={T("Most Verified (Unresolved)", "அதிகம் சரிபார்க்கப்பட்டவை (தீர்க்கப்படாதவை)")} icon={Users} items={mostVerified} color="text-indigo-500" /></div>}
        {needsComplaint.length > 0 && <div className="pt-3"><Section title={T("Waiting for Official Complaint ID", "அதிகாரப்பூர்வ புகார் ID காத்திருக்கிறது")} icon={AlertTriangle} items={needsComplaint} color="text-orange-500" /></div>}
        {unresolvedAfterComplaint.length > 0 && <div className="pt-3"><Section title={T("Unresolved After Complaint Filed", "புகார் தாக்கலுக்கு பிறகும் தீர்க்கப்படாதவை")} icon={TrendingUp} items={unresolvedAfterComplaint} color="text-red-600" /></div>}
      </div>
    </div>
  );
}