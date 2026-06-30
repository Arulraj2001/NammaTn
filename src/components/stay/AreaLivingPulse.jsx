import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "@/lib/router-compat";
import { Activity, Briefcase, MessageSquare, Zap, Droplets, ArrowRight } from "lucide-react";

function PulseItem({ icon: PulseIcon, color, label, count, empty }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <PulseIcon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${empty ? "text-slate-400" : "text-slate-900 dark:text-white"}`}>
        {empty ? "None" : count}
      </span>
    </div>
  );
}

export default function AreaLivingPulse({ districtSlug, districtName, areaSlug, areaName }) {
  const { data: stayCount = [] } = useQuery({
    queryKey: ["pulse-stay", districtSlug, areaSlug],
    queryFn: () => areaSlug
      ? base44.entities.StayListing.filter({ district_slug: districtSlug, area_slug: areaSlug, status: "active" }, "-created_date", 5)
      : base44.entities.StayListing.filter({ district_slug: districtSlug, status: "active" }, "-created_date", 5),
    enabled: !!districtSlug,
    staleTime: 60000,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["pulse-jobs", districtSlug],
    queryFn: () => base44.entities.JobAlert.filter({ district_slug: districtSlug, status: "active" }, "-created_date", 5),
    enabled: !!districtSlug,
    staleTime: 60000,
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ["pulse-disc", districtSlug],
    queryFn: () => base44.entities.CommunityDiscussion.filter({ district_slug: districtSlug, status: "active" }, "-created_date", 5),
    enabled: !!districtSlug,
    staleTime: 60000,
  });

  const { data: situations = [] } = useQuery({
    queryKey: ["pulse-sit", districtSlug],
    queryFn: () => base44.entities.SituationUpdate.filter({ district_slug: districtSlug, status: "active" }, "-created_date", 3),
    enabled: !!districtSlug,
    staleTime: 60000,
  });

  const waterIssues = discussions.filter(d => d.topic === "water").length;
  const trafficIssues = situations.filter(s => s.situation_type === "traffic").length;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-indigo-600" />
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">
          Area Living Pulse
        </h3>
        <span className="text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
          {areaName || districtName}
        </span>
      </div>

      <div className="space-y-0 divide-y divide-indigo-100 dark:divide-indigo-800/40">
        <PulseItem icon={Activity} color="text-blue-500" label="Active Stay Listings" count={stayCount.length} empty={!stayCount.length} />
        <PulseItem icon={Briefcase} color="text-green-500" label="Nearby Job Alerts" count={jobs.length} empty={!jobs.length} />
        <PulseItem icon={MessageSquare} color="text-purple-500" label="Community Discussions" count={discussions.length} empty={!discussions.length} />
        <PulseItem icon={Droplets} color="text-cyan-500" label="Water Issues" count={waterIssues} empty={!waterIssues} />
        <PulseItem icon={Zap} color="text-yellow-500" label="Traffic Reports" count={trafficIssues} empty={!trafficIssues} />
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800/40">
        {districtSlug && (
          <>
            <Link to={`/jobs?district=${districtSlug}`} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Jobs <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/community" className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Discuss <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/situations" className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Situations <ArrowRight className="w-3 h-3" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}