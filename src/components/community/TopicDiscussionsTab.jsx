import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import DiscussionForm from "./DiscussionForm";
import DiscussionThread from "./DiscussionThread";
import { formatDistanceToNow } from "date-fns";

const TOPICS = [
  { value: "general", label: "General", emoji: "💬" },
  { value: "water", label: "Water", emoji: "💧" },
  { value: "traffic", label: "Traffic", emoji: "🚗" },
  { value: "offices", label: "Offices", emoji: "🏢" },
  { value: "jobs", label: "Jobs", emoji: "💼" },
  { value: "emergency", label: "Emergency", emoji: "🚨" },
  { value: "transport", label: "Transport", emoji: "🚌" },
  { value: "internet", label: "Internet", emoji: "📡" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "healthcare", label: "Healthcare", emoji: "🏥" },
  { value: "development", label: "Development", emoji: "🏗" },
];

export default function TopicDiscussionsTab() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [topic, setTopic] = useState("general");
  const [showForm, setShowForm] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const qc = useQueryClient();

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["topic-discussions", topic],
    queryFn: () => base44.entities.CommunityDiscussion.filter({ status: "active", topic }, "-created_date", 50),
  });

  if (activeDiscussion) {
    return <DiscussionThread discussion={activeDiscussion} onBack={() => setActiveDiscussion(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Topic Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TOPICS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTopic(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              topic === t.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-3.5 h-3.5 mr-1" />
          {T("Post", "இடு")}
        </Button>
      </div>

      {showForm && (
        <DiscussionForm
          onClose={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["topic-discussions"] }); }}
        />
      )}

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-slate-400 text-center py-8">Loading...</p>}
        {!isLoading && discussions.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">{T(`No discussions under "${TOPICS.find(t => t.value === topic)?.label}" yet.`, "இந்த தலைப்பில் விவாதங்கள் இல்லை.")}</p>
          </div>
        )}
        {discussions.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            onClick={() => setActiveDiscussion(d)}
          >
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{d.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{d.content}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{d.reply_count || 0}</span>
              {d.district_name && <span>📍 {d.district_name}</span>}
              <span>{d.created_date ? formatDistanceToNow(new Date(d.created_date), { addSuffix: true }) : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}