import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/districts";
import DiscussionForm from "./DiscussionForm";
import DiscussionThread from "./DiscussionThread";
import { formatDistanceToNow } from "date-fns";

const districtList = DISTRICTS.map((d) => ({ slug: d.slug, name: d.name_en || d.name }));

export default function AreaDiscussionsTab() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [district, setDistrict] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const qc = useQueryClient();

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["area-discussions", district],
    queryFn: () => district
      ? base44.entities.CommunityDiscussion.filter({ status: "active", district_slug: district }, "-created_date", 50)
      : base44.entities.CommunityDiscussion.filter({ status: "active" }, "-created_date", 50),
  });

  if (activeDiscussion) {
    return <DiscussionThread discussion={activeDiscussion} onBack={() => setActiveDiscussion(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{T("All Districts", "அனைத்து மாவட்டங்கள்")}</option>
          {districtList.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-3.5 h-3.5 mr-1" />
          {T("Post", "இடு")}
        </Button>
      </div>

      {showForm && (
        <DiscussionForm
          districtSlug={district}
          districtName={districtList.find((d) => d.slug === district)?.name}
          onClose={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["area-discussions"] }); }}
        />
      )}

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-slate-400 text-center py-8">Loading...</p>}
        {!isLoading && discussions.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">{T("No discussions for this area yet.", "இந்த பகுதிக்கு விவாதங்கள் இல்லை.")}</p>
          </div>
        )}
        {discussions.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            onClick={() => setActiveDiscussion(d)}
          >
            <div className="flex items-start gap-2 flex-wrap mb-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{d.area_name ? `${d.area_name}, ` : ""}{d.district_name || T("All TN", "அனைத்து TN")}
              </span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{d.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{d.content}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{d.reply_count || 0}</span>
              <span>{d.created_date ? formatDistanceToNow(new Date(d.created_date), { addSuffix: true }) : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}