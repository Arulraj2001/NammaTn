import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Send, AlertTriangle, Radio, Users, LogIn, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { checkSpam, getSession } from "@/lib/spamGuard";
import { sanitizeText, checkRateLimit } from "@/lib/security";
import { checkContentSafety } from "@/lib/contentSafety";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import ReportButton from "@/components/posts/ReportButton";

const CHANNELS = [
  { value: "general", label: "TN Main Chat", emoji: "🏛️", desc: "Tamil Nadu public room" },
  { value: "nearby", label: "Nearby Chat", emoji: "📍", desc: "District-level discussion" },
  { value: "emergency", label: "Emergency Chat", emoji: "🚨", desc: "Urgent help & alerts" },
];

const MSG_TYPE_CONFIG = {
  update:       { label: "Update",    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800", badge: "text-blue-600 bg-blue-100 dark:bg-blue-900/40", emoji: "📢" },
  question:     { label: "Question",  color: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800", badge: "text-purple-600 bg-purple-100", emoji: "❓" },
  alert:        { label: "Alert",     color: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800", badge: "text-red-600 bg-red-100", emoji: "🚨" },
  help:         { label: "Help",      color: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800", badge: "text-orange-600 bg-orange-100", emoji: "🙏" },
  confirmation: { label: "Confirmed", color: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800", badge: "text-green-600 bg-green-100", emoji: "✅" },
};

const COOLDOWN_MS = 7000;
const MAX_MSG_LEN = 300;

export default function LiveChatTab() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const qc = useQueryClient();
  const session = getSession();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();
  const bottomRef = useRef(null);
  const sendingRef = useRef(false); // prevent double-post

  const [channel, setChannel] = useState("general");
  const [text, setText] = useState("");
  const [msgType, setMsgType] = useState("update");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [spamWarning, setSpamWarning] = useState(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["live-chat", channel],
    queryFn: () => base44.entities.LiveChatMessage.filter(
      { channel, status: "active" },
      "created_date",
      80
    ),
    refetchInterval: 7000,
    staleTime: 0,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const showWarning = (msg) => {
    setSpamWarning(msg);
    setTimeout(() => setSpamWarning(null), 4000);
  };

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      requireAuth(() => {}, T("Sign in to chat", "அரட்டையடிக்க உள்நுழையுங்கள்"));
      return;
    }
    if (sendingRef.current || sending || cooldown > 0) return;

    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length < 2) { showWarning(T("Message is too short.", "செய்தி மிகவும் குறுகியது.")); return; }
    if (trimmed.length > MAX_MSG_LEN) { showWarning(T(`Max ${MAX_MSG_LEN} characters.`, `அதிகபட்சம் ${MAX_MSG_LEN} எழுத்துகள்.`)); return; }

    // Rate limit: 8 msgs / 60s
    if (!checkRateLimit(`chat_${channel}`, 8, 60_000)) {
      showWarning(T("You're posting too fast. Please wait.", "நீங்கள் மிக வேகமாக இடுகிறீர்கள். காத்திருக்கவும்."));
      return;
    }

    const spamCheck = checkSpam(session, trimmed);
    if (spamCheck.blocked) {
      const msgs = {
        muted: T(`You are muted for ${spamCheck.muteRemaining}s.`, `${spamCheck.muteRemaining}s தடைசெய்யப்பட்டீர்கள்.`),
        duplicate: T("Don't repeat the same message.", "அதே செய்தியை மீண்டும் அனுப்பாதீர்கள்."),
        flood: T("Slow down! Too many messages.", "மெதுவாக! மிக அதிக செய்திகள்."),
        content_policy: T("Message blocked by content filter.", "செய்தி வடிகட்டியால் தடுக்கப்பட்டது."),
      };
      showWarning(msgs[spamCheck.reason] || T("Message blocked.", "செய்தி தடுக்கப்பட்டது."));
      return;
    }

    // Content safety
    const safety = checkContentSafety(trimmed);
    if (!safety.safe) {
      showWarning(T("Message blocked — violates community guidelines.", "செய்தி தடுக்கப்பட்டது — சமுதாய வழிகாட்டுதல்களை மீறுகிறது."));
      return;
    }

    sendingRef.current = true;
    setSending(true);
    await base44.entities.LiveChatMessage.create({
      channel,
      content: sanitizeText(trimmed),
      message_type: msgType,
      author_session: session,
      author_id: user?.id || null,
      author_label: user?.full_name || "Community Member",
      status: safety.needsReview ? "active" : "active", // still shown, flagged in metadata
      report_count: 0,
    });
    setText("");
    setSending(false);
    sendingRef.current = false;
    setCooldown(Math.ceil(COOLDOWN_MS / 1000));
    qc.invalidateQueries({ queryKey: ["live-chat", channel] });
  }, [text, sending, cooldown, channel, msgType, session, qc, isAuthenticated, user]);

  const isAdmin = user?.role === "admin";

  const handleHideMessage = async (msgId) => {
    await base44.entities.LiveChatMessage.update(msgId, {
      status: "hidden",
      hidden_by: user?.id,
    });
    qc.invalidateQueries({ queryKey: ["live-chat", channel] });
  };

  const currentChannel = CHANNELS.find((c) => c.value === channel);

  return (
    <div className="flex flex-col" style={{ height: "min(640px, 78vh)" }}>
      {/* Channel Switcher */}
      <div className="flex gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto flex-shrink-0">
        {CHANNELS.map((c) => (
          <button
            key={c.value}
            onClick={() => setChannel(c.value)}
            className={`flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl text-left transition-all ${
              channel === c.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300"
            }`}
          >
            <span className="text-xs font-semibold">{c.emoji} {c.label}</span>
            <span className={`text-xs ${channel === c.value ? "text-blue-100" : "text-slate-400"}`}>{c.desc}</span>
          </button>
        ))}
      </div>

      {/* Room info */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>{T("Live", "நேரடி")} · {currentChannel?.label}</span>
        </div>
        <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {messages.length > 0 ? `${messages.length} messages` : T("Be the first to join", "முதலில் சேருங்கள்")}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-14">
            <Radio className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">{T("No messages yet", "இன்னும் செய்திகள் இல்லை")}</p>
            <p className="text-xs text-slate-400 mt-1">{T("Start the conversation.", "உரையாடலை தொடங்குங்கள்.")}</p>
          </div>
        )}
        {messages.map((m) => {
          const cfg = MSG_TYPE_CONFIG[m.message_type] || MSG_TYPE_CONFIG.update;
          return (
            <div key={m.id} className={`rounded-xl border p-3 ${cfg.color}`}>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{m.author_label}</span>
                  {m.district_name && <span className="text-slate-400">📍 {m.district_name}</span>}
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${cfg.badge}`}>{cfg.emoji} {cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {m.created_date ? formatDistanceToNow(new Date(m.created_date), { addSuffix: true }) : ""}
                  </span>
                  <ReportButton targetType="chat_message" targetId={m.id} compact />
                  {isAdmin && (
                    <button
                      onClick={() => handleHideMessage(m.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                      title="Hide message"
                    >
                      <EyeOff className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 break-words leading-relaxed">{m.content}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!isAuthenticated ? (
        <div className="flex-shrink-0 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => requireAuth(() => {}, T("Sign in to join the live chat", "நேரடி அரட்டையில் சேர உள்நுழையுங்கள்"))}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {T("Sign in to join the live chat", "நேரடி அரட்டையில் சேர உள்நுழையுங்கள்")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex-shrink-0 mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
          {spamWarning && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {spamWarning}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <select
              value={msgType}
              onChange={(e) => setMsgType(e.target.value)}
              className="border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none flex-shrink-0"
            >
              {Object.entries(MSG_TYPE_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.emoji} {c.label}</option>
              ))}
            </select>
            {cooldown > 0 && (
              <span className="text-xs text-slate-400">{T(`Wait ${cooldown}s`, `${cooldown}s காத்திருங்கள்`)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={T("Type a message...", "ஒரு செய்தி தட்டச்சு செய்யுங்கள்...")}
              maxLength={MAX_MSG_LEN}
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" size="sm" disabled={sending || cooldown > 0 || !text.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-3 flex-shrink-0">
              {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-slate-400">{T("Keep it respectful. Spam and abuse are auto-blocked.", "மரியாதையாக வையுங்கள். ஸ்பேம் தானாக தடுக்கப்படும்.")}</p>
        </form>
      )}
    </div>
  );
}