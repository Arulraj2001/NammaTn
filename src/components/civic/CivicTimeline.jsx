import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  FileText, CheckCircle, AlertTriangle, Users, Camera,
  TrendingUp, Shield, MessageSquare, Star, Clock
} from "lucide-react";

const EVENT_ICONS = {
  created: { icon: FileText, color: "bg-blue-500 border-blue-300" },
  verify: { icon: Users, color: "bg-indigo-500 border-indigo-300" },
  community_verified: { icon: CheckCircle, color: "bg-indigo-600 border-indigo-400" },
  complaint_filed: { icon: FileText, color: "bg-amber-500 border-amber-300" },
  follow_up: { icon: TrendingUp, color: "bg-yellow-500 border-yellow-300" },
  claim_fixed: { icon: Camera, color: "bg-teal-500 border-teal-300" },
  citizen_verified_fixed: { icon: Star, color: "bg-green-500 border-green-300" },
  still_not_fixed: { icon: AlertTriangle, color: "bg-red-500 border-red-300" },
  escalate: { icon: Shield, color: "bg-red-600 border-red-400" },
  status_change: { icon: CheckCircle, color: "bg-slate-500 border-slate-300" },
  admin_note: { icon: MessageSquare, color: "bg-purple-500 border-purple-300" },
  duplicate: { icon: AlertTriangle, color: "bg-slate-400 border-slate-300" },
  screenshot: { icon: Camera, color: "bg-blue-400 border-blue-300" },
};

const ACTOR_LABELS = {
  admin: { label: "VizhiTN Admin", style: "text-purple-600 font-semibold" },
  system: { label: "System", style: "text-slate-400 italic" },
  user: { label: null, style: "text-slate-500" },
};

function getIcon(event_type, eventText) {
  if (!event_type) {
    // Guess from text
    if (/created|reported/i.test(eventText)) return EVENT_ICONS.created;
    if (/verified|confirm/i.test(eventText)) return EVENT_ICONS.community_verified;
    if (/complaint|filed/i.test(eventText)) return EVENT_ICONS.complaint_filed;
    if (/follow.up/i.test(eventText)) return EVENT_ICONS.follow_up;
    if (/fixed.*photo|claim/i.test(eventText)) return EVENT_ICONS.claim_fixed;
    if (/citizen.*fixed|resolved/i.test(eventText)) return EVENT_ICONS.citizen_verified_fixed;
    if (/not fixed|still/i.test(eventText)) return EVENT_ICONS.still_not_fixed;
    if (/escalat/i.test(eventText)) return EVENT_ICONS.escalate;
    if (/admin/i.test(eventText)) return EVENT_ICONS.admin_note;
    if (/duplicate/i.test(eventText)) return EVENT_ICONS.duplicate;
    if (/screenshot/i.test(eventText)) return EVENT_ICONS.screenshot;
    return EVENT_ICONS.status_change;
  }
  return EVENT_ICONS[event_type] || EVENT_ICONS.status_change;
}

export default function CivicTimeline({ events = [] }) {
  if (!events.length) return null;

  // Deduplicate: skip if same event text within 60 seconds
  const deduped = [];
  events.forEach((ev) => {
    const last = deduped[deduped.length - 1];
    if (last && last.event === ev.event) {
      const diff = Math.abs(new Date(ev.timestamp) - new Date(last.timestamp));
      if (diff < 60_000) return; // skip near-duplicate
    }
    deduped.push(ev);
  });

  return (
    <div className="space-y-0">
      {deduped.map((ev, i) => {
        const { icon: Icon, color } = getIcon(ev.event_type, ev.event);
        const actorInfo = ACTOR_LABELS[ev.actor_type] || ACTOR_LABELS.user;
        const isLast = i === deduped.length - 1;

        return (
          <div key={i} className="flex gap-3 relative">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
            )}

            {/* Icon dot */}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 z-10 ${color}`}>
              <Icon className="w-3 h-3 text-white" />
            </div>

            {/* Content */}
            <div className={`${isLast ? "pb-0" : "pb-4"} min-w-0 flex-1`}>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{ev.event}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {ev.timestamp && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                  </span>
                )}
                {ev.by && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
                    <span className={`text-xs ${actorInfo.style}`}>{ev.by}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}