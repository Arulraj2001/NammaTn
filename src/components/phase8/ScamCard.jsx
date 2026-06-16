import React, { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { MapPin, ShieldAlert } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import ConfirmButton from "./ConfirmButton";

const TYPE_LABELS = {
  fake_agent:       "Fake Agent",
  fake_job:         "Fake Job Scam",
  fraud_call:       "Fraud Call",
  online_scam:      "Online Scam",
  fake_document:    "Fake Document Service",
  local_cheating:   "Local Cheating Alert",
  other:            "Scam Alert",
};

const WARN_CONFIG = {
  critical: "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10",
  high:     "border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10",
  medium:   "border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10",
  low:      "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
};

export default function ScamCard({ item, compact = false }) {
  const handleConfirmed = useCallback(async (newCount) => {
    await base44.entities.ScamAlert.update(item.id, { confirm_count: newCount });
  }, [item.id]);

  return (
    <div className={`rounded-2xl border-2 p-4 hover:shadow-md transition-all ${WARN_CONFIG[item.warning_level] || WARN_CONFIG.medium}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              ⚠ {TYPE_LABELS[item.scam_type] || "Scam Alert"}
            </span>
            {item.is_verified && <VerifiedBadge />}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              item.warning_level === "critical" ? "bg-red-200 text-red-800" :
              item.warning_level === "high" ? "bg-orange-200 text-orange-800" :
              "bg-yellow-200 text-yellow-800"
            }`}>
              {item.warning_level?.toUpperCase()}
            </span>
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</p>
          {!compact && item.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-2">
              ⚠ Public awareness: {item.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.area_name ? `${item.area_name}, ` : ""}{item.district_name}</span>
            <span>{item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : ""}</span>
          </div>
          {!compact && (
            <div className="mt-3">
              <ConfirmButton
                targetType="scam_alert"
                targetId={item.id}
                confirmCount={item.confirm_count || 0}
                districtSlug={item.district_slug}
                onConfirmed={handleConfirmed}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}