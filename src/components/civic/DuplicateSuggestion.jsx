import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { base44 } from "@/api/base44Client";
import { Copy, AlertTriangle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getDaysOpen } from "@/lib/civicReceipt";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";

export default function DuplicateSuggestion({ districtSlug, categorySlug, onContinueNew, onConfirmExisting }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: similar = [] } = useQuery({
    queryKey: ["similar-issues", districtSlug, categorySlug],
    queryFn: () => base44.entities.Post.filter(
      { district_slug: districtSlug, category_slug: categorySlug, post_type: "complaint" },
      "-created_date",
      10
    ),
    enabled: !!districtSlug && !!categorySlug,
    staleTime: 30_000,
    select: (data) => data.filter((p) =>
      p.status !== "removed" &&
      p.civic_status !== "citizen_verified_fixed" &&
      p.civic_status !== "duplicate_invalid"
    ).slice(0, 5),
  });

  if (similar.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
      <div className="flex items-start gap-2 mb-3">
        <Copy className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
            {T("Similar issues found in this area", "இந்த பகுதியில் இதே மாதிரி சிக்கல்கள் காணப்படுகின்றன")}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            {T("Before creating a new report, check if your issue already exists below. You can confirm an existing issue instead.", "புதிய புகார் உருவாக்குவதற்கு முன், உங்கள் சிக்கல் ஏற்கனவே இருக்கிறதா என்று சரிபார்க்கவும்.")}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {similar.map((p) => (
          <Link
            key={p.id}
            to={`/post/${p.id}`}
            target="_blank"
            className="flex items-start gap-2 p-2.5 bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40 rounded-xl hover:border-amber-300 transition-colors group"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">{p.title_en}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <CivicStatusBadge status={p.civic_status || "reported"} size="xs" />
                {p.civic_receipt_id && (
                  <span className="text-[10px] font-mono text-slate-400">{p.civic_receipt_id}</span>
                )}
                <span className="text-[10px] text-slate-400">{getDaysOpen(p.created_date)}d · {p.verification_count || 0} ✓</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onConfirmExisting}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-all"
        >
          {T("Confirm an Existing Issue", "இருக்கும் சிக்கலை உறுதிப்படு")}
        </button>
        <button
          onClick={onContinueNew}
          className="flex items-center gap-1.5 px-3 py-2 border border-amber-300 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
        >
          {T("Continue as New Issue", "புதிய சிக்கலாக தொடரவும்")}
        </button>
      </div>
    </div>
  );
}