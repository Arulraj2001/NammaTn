import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Zap, AlertTriangle, ShieldAlert, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";

const SECTION_CONFIG = [
  { key: "situations", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", label: "Live Situations", link: "/situations" },
  { key: "emergencies", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", label: "Emergency Help", link: "/help" },
  { key: "scams", icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", label: "Scam Alerts", link: "/scams" },
  { key: "questions", icon: HelpCircle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Questions", link: "/ask" },
  { key: "discussions", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", label: "Community Discussions", link: "/community" },
];

function PulseSection({ cfg, items }) {
  const Icon = cfg.icon;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg}`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">{cfg.label}</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">{items.length}</span>
        </div>
        <Link to={cfg.link} className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="px-4 py-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{item.title || item.title_en}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {item.district_name || ""}{" "}
              · {item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : ""}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-4 py-4 text-xs text-slate-400 text-center">No recent activity</p>
        )}
      </div>
    </div>
  );
}

export default function TnPulseTab() {
  const { data: situations = [], isLoading: l1 } = useQuery({
    queryKey: ["pulse-situations"],
    queryFn: () => base44.entities.SituationUpdate.filter({ status: "active" }, "-created_date", 5),
  });
  const { data: emergencies = [], isLoading: l2 } = useQuery({
    queryKey: ["pulse-emergencies"],
    queryFn: () => base44.entities.EmergencyPost.filter({ status: "active" }, "-created_date", 5),
  });
  const { data: scams = [], isLoading: l3 } = useQuery({
    queryKey: ["pulse-scams"],
    queryFn: () => base44.entities.ScamAlert.filter({ status: "active" }, "-created_date", 5),
  });
  const { data: questions = [], isLoading: l4 } = useQuery({
    queryKey: ["pulse-questions"],
    queryFn: () => base44.entities.Question.filter({ status: "open" }, "-created_date", 5),
  });
  const { data: discussions = [], isLoading: l5 } = useQuery({
    queryKey: ["pulse-discussions"],
    queryFn: () => base44.entities.CommunityDiscussion.filter({ status: "active" }, "-created_date", 5),
  });

  const isLoading = l1 || l2 || l3 || l4 || l5;
  const DATA = { situations, emergencies, scams, questions, discussions };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="p-4 space-y-3">
              {[...Array(2)].map((_, j) => <div key={j} className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {SECTION_CONFIG.map((cfg) => (
        <PulseSection key={cfg.key} cfg={cfg} items={DATA[cfg.key] || []} />
      ))}
    </div>
  );
}