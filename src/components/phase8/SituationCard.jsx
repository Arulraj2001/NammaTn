import React, { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Zap, Droplets, Car, CloudRain, Wifi, Building, AlertOctagon } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import UrgencyBadge from "./UrgencyBadge";
import ConfirmButton from "./ConfirmButton";

const TYPE_CONFIG = {
  eb_shutdown:        { icon: Zap, label: "EB Shutdown", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  water_shortage:     { icon: Droplets, label: "Water Shortage", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  traffic:            { icon: Car, label: "Heavy Traffic", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  flooding:           { icon: CloudRain, label: "Flooding", color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  internet_outage:    { icon: Wifi, label: "Internet Outage", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  office_closed:      { icon: Building, label: "Office Closed", color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-800" },
  protest:            { icon: AlertOctagon, label: "Protest / Bandh", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  transport_issue:    { icon: Car, label: "Transport Issue", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  local_emergency:    { icon: AlertOctagon, label: "Local Emergency", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  service_disruption: { icon: Wifi, label: "Service Disruption", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  other:              { icon: AlertOctagon, label: "Update", color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-800" },
};

export default function SituationCard({ item, compact = false }) {
  const cfg = TYPE_CONFIG[item.situation_type] || TYPE_CONFIG.other;
  const Icon = cfg.icon;

  const handleConfirmed = useCallback(async (newCount) => {
    await base44.entities.SituationUpdate.update(item.id, { confirm_count: newCount });
  }, [item.id]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
            <UrgencyBadge level={item.urgency} />
            {item.is_verified && <VerifiedBadge />}
            {item.is_resolved && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Resolved</span>
            )}
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{item.title}</p>
          {!compact && item.details && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.details}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              {item.area_name ? `${item.area_name}, ` : ""}{item.district_name}
            </span>
            <span className="text-xs text-slate-400">
              {item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : ""}
            </span>
          </div>
          {!compact && (
            <div className="mt-3">
              <ConfirmButton
                targetType="situation_update"
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