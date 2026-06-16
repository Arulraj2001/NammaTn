import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import CivicReceiptCard from "./CivicReceiptCard";

function StatBox({ label, value, cls }) {
  return (
    <div className={`p-3 rounded-xl text-center border ${cls}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-slate-500 leading-tight">{label}</p>
    </div>
  );
}

export default function DistrictCivicStats({ districtSlug, districtName }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["civic-district", districtSlug],
    queryFn: () => base44.entities.Post.filter(
      { district_slug: districtSlug, post_type: "complaint", status: "active" },
      "-created_date",
      50
    ),
    enabled: !!districtSlug,
    staleTime: 60_000,
  });

  const stats = {
    total: posts.length,
    verified: posts.filter(p => p.civic_status === "community_verified").length,
    needsComplaint: posts.filter(p => p.civic_status === "complaint_needed").length,
    followup: posts.filter(p => p.civic_status === "under_followup").length,
    fixed: posts.filter(p => p.civic_status === "citizen_verified_fixed").length,
  };

  const recent = posts.slice(0, 4);

  if (isLoading) return <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;
  if (!posts.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {T("Civic Receipts", "குடிமை ரசீதுகள்")} — {districtName}
          </h3>
          <p className="text-xs text-slate-500">
            {T("Report. Prove. Resolve.", "புகார். நிரூபி. தீர்.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
        <StatBox label={T("Total", "மொத்தம்")} value={stats.total} cls="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600" />
        <StatBox label={T("Verified", "சரிபார்க்கப்பட்டது")} value={stats.verified} cls="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-600" />
        <StatBox label={T("Needs Complaint", "புகார் தேவை")} value={stats.needsComplaint} cls="bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600" />
        <StatBox label={T("Follow-up", "தொடர்")} value={stats.followup} cls="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800 text-yellow-600" />
        <StatBox label={T("Fixed ✓", "சரி ✓")} value={stats.fixed} cls="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600" />
      </div>

      {recent.length > 0 && (
        <>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {T("Recent Civic Receipts", "சமீபத்திய குடிமை ரசீதுகள்")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {recent.map(p => <CivicReceiptCard key={p.id} post={p} />)}
          </div>
        </>
      )}

      <Link
        to={`/district/${districtSlug}`}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        {T("View all civic issues →", "அனைத்து சிக்கல்களையும் காண →")}
      </Link>
    </div>
  );
}