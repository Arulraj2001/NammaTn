import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Shield, MapPin, MessageSquare, Archive, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { checkSpam, getSession } from "@/lib/spamGuard";

const MSG_TYPE_CONFIG = {
  update:       { label: "Update",       color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700", badge: "text-blue-600 bg-blue-100 dark:bg-blue-900/40", emoji: "📢" },
  alert:        { label: "Alert",        color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700", badge: "text-red-600 bg-red-100", emoji: "🚨" },
  question:     { label: "Question",     color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700", badge: "text-purple-600 bg-purple-100", emoji: "❓" },
  help:         { label: "Help",         color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700", badge: "text-orange-600 bg-orange-100", emoji: "🙏" },
  confirmation: { label: "Confirmed",    color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700", badge: "text-green-600 bg-green-100", emoji: "✅" },
  resolution:   { label: "Resolved",     color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700", badge: "text-emerald-700 bg-emerald-100", emoji: "🎉" },
};

const COOLDOWN_MS = 6000;

export default function LiveRoomThread({ room, onBack }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const qc = useQueryClient();
  const session = getSession();
  const bottomRef = useRef(null);
  const lastSentRef = useRef(0);
  const [text, setText] = useState("");
  const [msgType, setMsgType] = useState("update");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [spamWarning, setSpamWarning] = useState(null);
  const isLocked = room.status === "locked" || room.status === "archived";

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["room-messages", room.id],
    queryFn: () => base44.entities.LiveRoomMessage.filter({ room_id: room.id, status: "active" }, "created_date", 100),
    refetchInterval: 6000,
    staleTime: 0,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || cooldown > 0 || isLocked) return;
    if (trimmed.length < 3 || trimmed.length > 400) return;

    const spamCheck = checkSpam(session, trimmed);
    if (spamCheck.blocked) {
      const msgs = {
        muted: T(`You are temporarily muted for ${spamCheck.muteRemaining}s due to rapid posting.`, `வேகமான இடுகையிடல் காரணமாக ${spamCheck.muteRemaining}s தடைசெய்யப்பட்டீர்கள்.`),
        duplicate: T("Please don't post the same message again.", "அதே செய்தியை மீண்டும் இடாதீர்கள்."),
        flood: T("Too many messages. Please wait a moment.", "அதிக செய்திகள். சற்று காத்திருங்கள்."),
        content_policy: T("Your message was flagged by content filters.", "உங்கள் செய்தி உள்ளடக்க வடிகட்டிகளால் கொடியிடப்பட்டது."),
      };
      setSpamWarning(msgs[spamCheck.reason] || T("Message blocked.", "செய்தி தடுக்கப்பட்டது."));
      setTimeout(() => setSpamWarning(null), 4000);
      return;
    }

    setSending(true);
    lastSentRef.current = Date.now();

    await base44.entities.LiveRoomMessage.create({
      room_id: room.id,
      content: trimmed,
      message_type: msgType,
      author_session: session,
      author_label: "Community Member",
      status: "active",
    });

    // Update room message count
    await base44.entities.LiveRoom.update(room.id, {
      message_count: (room.message_count || 0) + messages.length + 1,
    });

    setText("");
    setSending(false);
    setCooldown(Math.ceil(COOLDOWN_MS / 1000));
    qc.invalidateQueries({ queryKey: ["room-messages", room.id] });
  }, [text, sending, cooldown, isLocked, session, msgType, room, messages.length, qc]);

  const pinned = messages.filter((m) => m.is_pinned);
  const regular = messages.filter((m) => !m.is_pinned);

  return (
    <div className="space-y-4">
      {/* Back + room header */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <ArrowLeft className="w-4 h-4" /> {T("Back to rooms", "அறைகளுக்கு திரும்பு")}
      </button>

      <div className={`rounded-2xl border-2 p-4 ${room.is_emergency ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10" : "border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800"}`}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {room.status === "active" && <span className="flex items-center gap-1 text-xs font-bold text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE</span>}
          {room.status === "archived" && <span className="text-xs text-slate-400 flex items-center gap-1"><Archive className="w-3 h-3" /> Archived</span>}
          {room.is_emergency && <span className="text-xs font-bold text-red-700 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">🚨 Emergency</span>}
          {room.district_name && <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{room.district_name}</span>}
        </div>
        <h2 className="font-bold text-slate-900 dark:text-white text-base">{room.title}</h2>
        {room.description && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{room.description}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{messages.length} messages</span>
          {room.created_date && <span>{formatDistanceToNow(new Date(room.created_date), { addSuffix: true })}</span>}
        </div>
      </div>

      {/* Pinned notice */}
      {room.pinned_notice && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-2.5 text-xs text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span><strong>Admin notice:</strong> {room.pinned_notice}</span>
        </div>
      )}

      {/* Pinned messages */}
      {pinned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">📌 {T("Pinned", "இணைக்கப்பட்டது")}</p>
          {pinned.map((m) => <MessageBubble key={m.id} msg={m} />)}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
          {T("Updates", "புதுப்பிப்புகள்")} <span className="text-slate-300">({regular.length})</span>
        </p>
        {isLoading && <div className="text-center py-6"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>}
        {!isLoading && regular.length === 0 && (
          <div className="text-center py-10">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">{T("No updates yet. Be the first to post!", "இன்னும் புதுப்பிப்புகள் இல்லை.")}</p>
          </div>
        )}
        {regular.map((m) => <MessageBubble key={m.id} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isLocked ? (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <Archive className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-sm text-slate-500">{room.status === "archived" ? T("This room is archived. Browse the history above.", "இந்த அறை காப்பகப்படுத்தப்பட்டது.") : T("This room is locked by admin.", "இந்த அறை நிர்வாகியால் பூட்டப்பட்டது.")}</p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
          {spamWarning && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {spamWarning}
            </div>
          )}
          <div className="flex items-center gap-2">
            <select
              value={msgType}
              onChange={(e) => setMsgType(e.target.value)}
              className="border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none flex-shrink-0"
            >
              {Object.entries(MSG_TYPE_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.emoji} {c.label}</option>
              ))}
            </select>
            {cooldown > 0 && (
              <span className="text-xs text-slate-400 ml-1">{T(`Wait ${cooldown}s`, `${cooldown}s காத்திருக்கவும்`)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={T("Share an update or ask for help...", "ஒரு புதுப்பிப்பை பகிர்க அல்லது உதவி கேளுங்கள்...")}
              rows={2}
              maxLength={400}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <Button type="submit" size="sm" disabled={sending || cooldown > 0 || !text.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-3 self-end flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-400">{T("Keep updates factual and helpful. Spam is auto-blocked.", "புதுப்பிப்புகளை உண்மையானதாகவும் உதவியானதாகவும் வையுங்கள்.")}</p>
        </form>
      )}
    </div>
  );
}

function MessageBubble({ msg }) {
  const cfg = MSG_TYPE_CONFIG[msg.message_type] || MSG_TYPE_CONFIG.update;
  return (
    <div className={`rounded-xl border p-3 ${cfg.color}`}>
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">{msg.author_label}</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${cfg.badge}`}>{cfg.emoji} {cfg.label}</span>
          {msg.is_admin && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
        </div>
        <span className="text-xs text-slate-400">{msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ""}</span>
      </div>
      <p className="text-sm text-slate-800 dark:text-slate-200 break-words leading-relaxed">{msg.content}</p>
    </div>
  );
}