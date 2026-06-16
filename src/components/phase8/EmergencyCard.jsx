import React, { useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Phone, CheckCircle } from "lucide-react";
import UrgencyBadge from "./UrgencyBadge";
import VerifiedBadge from "./VerifiedBadge";
import ConfirmButton from "./ConfirmButton";
import dynamic from "next/dynamic";

const LocationDisplayMap = dynamic(() => import("@/components/media/LocationDisplayMap"), { ssr: false });


const TYPE_LABELS = {
  blood_requirement: { label: "🩸 Blood Required", color: "text-red-600" },
  ambulance_help:    { label: "🚑 Ambulance Help", color: "text-red-600" },
  flood_assistance:  { label: "🌊 Flood Help", color: "text-blue-600" },
  medicine_support:  { label: "💊 Medicine Support", color: "text-green-600" },
  missing_person:    { label: "🔍 Missing Person", color: "text-orange-600" },
  community_help:    { label: "🤝 Community Help", color: "text-purple-600" },
  other:             { label: "❗ Emergency", color: "text-slate-600" },
};

export default function EmergencyCard({ item, compact = false }) {
  const cfg = TYPE_LABELS[item.emergency_type] || TYPE_LABELS.other;

  const handleConfirmed = useCallback(async (newCount) => {
    await base44.entities.EmergencyPost.update(item.id, { confirm_count: newCount });
  }, [item.id]);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-4 hover:shadow-md transition-all ${
      item.urgency === "critical" ? "border-red-300 dark:border-red-800" : "border-orange-200 dark:border-orange-800"
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
          <UrgencyBadge level={item.urgency} />
          {item.is_verified && <VerifiedBadge />}
          {item.is_resolved && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="w-3 h-3" /> Resolved
            </span>
          )}
        </div>
      </div>
      <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</p>
      {!compact && item.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-3">{item.description}</p>
      )}
      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.area_name ? `${item.area_name}, ` : ""}{item.district_name}</span>
        <span>{item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : ""}</span>
      </div>
      {!compact && item.contact_visible && item.contact_info && (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">{item.contact_info}</span>
        </div>
      )}
      {!compact && item.latitude && item.longitude && (
        <div className="mt-2.5">
          <LocationDisplayMap latitude={item.latitude} longitude={item.longitude} />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline transition-all mt-1"
          >
            <MapPin className="w-3.5 h-3.5" /> Directions on Google Maps
          </a>
        </div>
      )}
      {!compact && (
        <div className="mt-3">
          <ConfirmButton
            targetType="emergency_post"
            targetId={item.id}
            confirmCount={item.confirm_count || 0}
            districtSlug={item.district_slug}
            onConfirmed={handleConfirmed}
          />
        </div>
      )}
    </div>
  );
}