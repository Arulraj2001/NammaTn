import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, MessageSquare, Send, CheckCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const REPLY_TYPES = [
  { value: "update", label: "Update" },
  { value: "confirmation", label: "Confirmation" },
  { value: "question", label: "Question" },
  { value: "help", label: "Help" },
  { value: "resolution", label: "Resolution" },
];

const REPLY_TYPE_COLORS = {
  update: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  confirmation: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
  question: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
  help: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
  resolution: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
};

export default function DiscussionThread({ discussion, onBack }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState("");
  const [replyType, setReplyType] = useState("update");
  const [sending, setSending] = useState(false);
  const lastSentRef = useRef(0);

  const sessionRef = useRef(null);
  if (!sessionRef.current) {
    let s = localStorage.getItem("tn_session");
    if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem("tn_session", s); }
    sessionRef.current = s;
  }

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ["discussion-replies", discussion.id],
    queryFn: () => base44.entities.DiscussionReply.filter({ discussion_id: discussion.id, status: "active" }, "created_date", 100),
  });

  const handleReply = async (e) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || sending) return;
    if (Date.now() - lastSentRef.current < 5000) return; // spam guard
    setSending(true);
    lastSentRef.current = Date.now();

    const newReply = await base44.entities.DiscussionReply.create({
      discussion_id: discussion.id,
      content: trimmed,
      reply_type: replyType,
      author_session: sessionRef.current,
      author_label: "Community Member",
      is_anonymous: true,
      status: "active",
    });

    // Update reply count on parent discussion
    await base44.entities.CommunityDiscussion.update(discussion.id, {
      reply_count: (discussion.reply_count || 0) + 1,
    });

    setReplyText("");
    setSending(false);
    qc.invalidateQueries({ queryKey: ["discussion-replies", discussion.id] });
    qc.invalidateQueries({ queryKey: ["community-hall"] });
    qc.invalidateQueries({ queryKey: ["area-discussions"] });
  };

  const handleHelpful = async (reply) => {
    await base44.entities.DiscussionReply.update(reply.id, {
      helpful_count: (reply.helpful_count || 0) + 1,
    });
    qc.invalidateQueries({ queryKey: ["discussion-replies", discussion.id] });
  };

  const TYPE_COLORS = {
    civic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    awareness: "bg-green-100 text-green-700",
    local_concern: "bg-orange-100 text-orange-700",
    positive: "bg-emerald-100 text-emerald-700",
    question: "bg-purple-100 text-purple-700",
    live_event: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <ArrowLeft className="w-4 h-4" /> {T("Back to discussions", "விவாதங்களுக்கு திரும்பு")}
      </button>

      {/* Discussion body */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[discussion.discussion_type] || "bg-slate-100 text-slate-600"}`}>
            {discussion.discussion_type?.replace("_", " ")}
          </span>
          {discussion.district_name && <span className="text-xs text-slate-400">📍 {discussion.district_name}</span>}
          {discussion.is_resolved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3 h-3" /> Resolved</span>
          )}
        </div>
        <h2 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-2">{discussion.title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{discussion.content}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{replies.length} {T("replies", "பதில்கள்")}</span>
          <span>{discussion.created_date ? formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true }) : ""}</span>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{T("Replies", "பதில்கள்")} ({replies.length})</p>
        {isLoading && <p className="text-sm text-slate-400 text-center py-4">Loading...</p>}
        {!isLoading && replies.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">{T("No replies yet. Be the first!", "இன்னும் பதில்கள் இல்லை.")}</p>
        )}
        {replies.map((r) => (
          <div key={r.id} className={`rounded-xl border p-3 ${REPLY_TYPE_COLORS[r.reply_type] || "bg-slate-50 border-slate-200"}`}>
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{r.author_label}</span>
                <span className="px-1.5 py-0.5 rounded text-xs font-medium opacity-75 bg-white/50 dark:bg-black/20">{r.reply_type}</span>
              </div>
              <span className="text-xs text-slate-400">{r.created_date ? formatDistanceToNow(new Date(r.created_date), { addSuffix: true }) : ""}</span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 break-words">{r.content}</p>
            <button
              onClick={() => handleHelpful(r)}
              className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ThumbsUp className="w-3 h-3" /> {r.helpful_count || 0} {T("helpful", "உதவியானது")}
            </button>
          </div>
        ))}
      </div>

      {/* Reply form */}
      <form onSubmit={handleReply} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{T("Add a reply", "பதில் சேர்க்கவும்")}</p>
        <div className="flex gap-2">
          <select
            value={replyType}
            onChange={(e) => setReplyType(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            {REPLY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={T("Write your reply...", "உங்கள் பதிலை எழுதுங்கள்...")}
            rows={2}
            maxLength={500}
            className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <Button type="submit" size="sm" disabled={sending || !replyText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white self-end px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}