import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import DiscussionForm from "./DiscussionForm";
import DiscussionThread from "./DiscussionThread";

const TYPE_COLORS = {
  civic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  awareness: "bg-green-100 text-green-700",
  local_concern: "bg-orange-100 text-orange-700",
  positive: "bg-emerald-100 text-emerald-700",
  question: "bg-purple-100 text-purple-700",
  live_event: "bg-red-100 text-red-700",
};

function DiscussionCard({ item, onClick }) {
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
      onClick={() => onClick(item)}
    >
      <div className="flex flex-wrap gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[item.discussion_type] || "bg-slate-100 text-slate-600"}`}>
          {item.discussion_type?.replace("_", " ")}
        </span>
        {item.district_name && <span className="text-xs text-slate-400">📍 {item.district_name}</span>}
        {item.is_resolved && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle className="w-3 h-3" /> Resolved
          </span>
        )}
      </div>
      <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{item.title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.content}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{item.reply_count || 0}</span>
        <span>👍 {item.helpful_count || 0}</span>
        <span>{item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : ""}</span>
      </div>
    </div>
  );
}

export default function CommunityHallTab() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [showForm, setShowForm] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const qc = useQueryClient();

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["community-hall"],
    queryFn: () => base44.entities.CommunityDiscussion.filter({ status: "active" }, "-created_date", 50),
  });

  const pinned = discussions.filter((d) => d.is_pinned);
  const regular = discussions.filter((d) => !d.is_pinned);

  if (activeDiscussion) {
    return (
      <DiscussionThread
        discussion={activeDiscussion}
        onBack={() => setActiveDiscussion(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
          {T("Community Hall — Public Discussions", "சமுதாய மண்டபம் — பொது விவாதங்கள்")}
        </h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-3.5 h-3.5 mr-1" />
          {T("Start Discussion", "விவாதம் தொடங்கு")}
        </Button>
      </div>

      {showForm && (
        <DiscussionForm onClose={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["community-hall"] }); }} />
      )}

      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">📌 Pinned</p>
          {pinned.map((d) => <DiscussionCard key={d.id} item={d} onClick={setActiveDiscussion} />)}
        </div>
      )}

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-slate-400 text-center py-8">Loading...</p>}
        {!isLoading && regular.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">{T("No discussions yet. Start one!", "இன்னும் விவாதங்கள் இல்லை. தொடங்குங்கள்!")}</p>
          </div>
        )}
        {regular.map((d) => <DiscussionCard key={d.id} item={d} onClick={setActiveDiscussion} />)}
      </div>
    </div>
  );
}