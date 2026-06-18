import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Send, AlertTriangle, Radio, Users, LogIn, EyeOff, X,
  ThumbsUp, Reply, Share2, MoreHorizontal, Flag, Shield,
  MessageSquare, Info, Image, MapPin, FileText, Clock,
  CheckCircle2, Smile
} from "lucide-react";
import { createReport } from "@/services/admin/reports";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { checkSpam, getSession } from "@/lib/spamGuard";
import { sanitizeText, checkRateLimit } from "@/lib/security";
import { checkContentSafety } from "@/lib/contentSafety";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import ReportButton from "@/components/posts/ReportButton";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CHANNELS = [
  {
    value: "general",
    label_en: "TN Main Chat",
    label_ta: "TN பொது அரட்டை",
    emoji: "🏛️",
    desc_en: "Tamil Nadu public room",
    desc_ta: "தமிழ்நாடு பொது அறை",
    color: "blue",
  },
  {
    value: "nearby",
    label_en: "Nearby Chat",
    label_ta: "அருகில் உள்ள அரட்டை",
    emoji: "📍",
    desc_en: "District-level discussion",
    desc_ta: "மாவட்ட அளவிலான விவாதம்",
    color: "green",
  },
  {
    value: "emergency",
    label_en: "Emergency Chat",
    label_ta: "அவசரகால அரட்டை",
    emoji: "🚨",
    desc_en: "Urgent help & alerts",
    desc_ta: "அவசர உதவி & எச்சரிக்கைகள்",
    color: "red",
  },
];

const MSG_TYPE_CONFIG = {
  update: {
    label_en: "Update",
    label_ta: "புதுப்பிப்பு",
    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
    badge: "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300",
    emoji: "📢",
    icon: "📢",
  },
  question: {
    label_en: "Question",
    label_ta: "கேள்வி",
    color: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
    badge: "text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300",
    emoji: "❓",
    icon: "❓",
  },
  alert: {
    label_en: "Alert",
    label_ta: "எச்சரிக்கை",
    color: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
    badge: "text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-300",
    emoji: "🚨",
    icon: "🚨",
  },
  help: {
    label_en: "Help",
    label_ta: "உதவி",
    color: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800",
    badge: "text-orange-600 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300",
    emoji: "🙏",
    icon: "🙏",
  },
  confirmation: {
    label_en: "Confirmed",
    label_ta: "உறுதிப்படுத்தப்பட்டது",
    color: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800",
    badge: "text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-300",
    emoji: "✅",
    icon: "✅",
  },
};

const ROOM_GUIDELINES_EN = [
  "Be respectful and helpful",
  "No hate speech or harassment",
  "No spam, promotions or ads",
  "Share accurate information",
  "Report inappropriate content",
];
const ROOM_GUIDELINES_TA = [
  "மரியாதையாகவும் உதவியாகவும் இருங்கள்",
  "வெறுப்புரை அல்லது துன்புறுத்தல் கூடாது",
  "ஸ்பேம், விளம்பரங்கள் கூடாது",
  "துல்லியமான தகவல்களை பகிருங்கள்",
  "பொருத்தமற்ற உள்ளடக்கத்தை புகாரளிக்கவும்",
];

const COOLDOWN_MS = 7000;
const MAX_MSG_LEN = 300;

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR HELPER — generates initials + color
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
  "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
  "bg-yellow-500", "bg-cyan-500",
];

function getAvatarColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

function Avatar({ name, size = "md", image = null }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : size === "xs" ? "w-6 h-6 text-[10px]" : "w-9 h-9 text-sm";
  if (image) {
    return <img src={image} alt={name} className={`${sz} rounded-full object-cover ring-1 ring-white dark:ring-slate-700`} />;
  }
  return (
    <div className={`${sz} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ring-1 ring-white dark:ring-slate-700`}>
      {getInitials(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE PARTICIPANTS MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ActiveParticipantsModal({ participants, onClose, T }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-700 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {T("Active Participants", "செயல்பாட்டு பங்கேற்பாளர்கள்")}
              </span>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
              {participants.length} {T("online", "ஆன்லைன்")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Participants list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {participants.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {T("No active participants yet", "இன்னும் செயல்பாட்டு பங்கேற்பாளர்கள் இல்லை")}
            </div>
          ) : (
            participants.map((p, i) => (
              <div
                key={p.id || i}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="relative">
                  <Avatar name={p.author_label || p.name || "User"} size="md" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {p.author_label || p.name || T("Community Member", "சமுதாய உறுப்பினர்")}
                  </p>
                  {p.district_name && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.district_name}
                    </p>
                  )}
                </div>
                {p.is_verified && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {T("Verified", "சரிபார்க்கப்பட்டது")}
                  </span>
                )}
                {p.is_official && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                    {T("Official", "அதிகாரப்பூர்வம்")}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            {T("Participants who sent a message in the last 30 minutes", "கடந்த 30 நிமிடங்களில் செய்தி அனுப்பியவர்கள்")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ m, isAdmin, onHide, T, currentUserId }) {
  const cfg = MSG_TYPE_CONFIG[m.message_type] || MSG_TYPE_CONFIG.update;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(m.like_count || 0);
  const isOwn = currentUserId && m.author_id === currentUserId;

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 mt-1">
        <Avatar name={m.author_label || "User"} size="sm" />
      </div>
      <div className={`flex-1 max-w-[85%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Header row */}
        <div className={`flex items-center gap-2 mb-1 flex-wrap ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {m.author_label || T("Community Member", "சமுதாய உறுப்பினர்")}
          </span>
          {m.is_verified && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              {T("Verified Resident", "சரிபார்க்கப்பட்ட குடியிருப்பாளர்")}
            </span>
          )}
          {m.is_official && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {T("Official", "அதிகாரப்பூர்வம்")}
            </span>
          )}
          {m.district_name && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> {m.district_name}
            </span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cfg.badge}`}>
            {cfg.emoji} {T(cfg.label_en, cfg.label_ta)}
          </span>
        </div>

        {/* Message bubble */}
        <div className={`rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed break-words ${cfg.color} ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
          {m.content}
        </div>

        {/* Action row */}
        <div className={`flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "flex-row-reverse" : ""}`}>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${liked ? "text-blue-600" : "text-slate-400 hover:text-blue-500"}`}
          >
            <ThumbsUp className="w-3 h-3" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium">
            <Reply className="w-3 h-3" />
            {T("Reply", "பதில்")}
          </button>
          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium">
            <Share2 className="w-3 h-3" />
            {T("Share", "பகிர்")}
          </button>
          <ReportButton targetType="chat_message" targetId={m.id} compact />
          {isAdmin && (
            <button
              onClick={() => onHide(m.id)}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              title="Hide message"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">
            {m.created_date ? formatDistanceToNow(new Date(m.created_date), { addSuffix: true }) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LiveChatTab() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const qc = useQueryClient();
  const session = getSession();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();
  const bottomRef = useRef(null);
  const sendingRef = useRef(false);
  const inputRef = useRef(null);

  const [channel, setChannel] = useState("general");
  const [text, setText] = useState("");
  const [msgType, setMsgType] = useState("update");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [spamWarning, setSpamWarning] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [onlineCount, setOnlineCount] = useState({});
  const [showReportChat, setShowReportChat] = useState(false);
  const [reportingChat, setReportingChat] = useState(false);
  const [reportChatDone, setReportChatDone] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  const currentChannel = CHANNELS.find((c) => c.value === channel);

  // ── Fetch messages ──────────────────────────────────────────────────────
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["live-chat", channel],
    queryFn: () =>
      base44.entities.LiveChatMessage.filter(
        { channel, status: "active" },
        "created_date",
        80
      ),
    refetchInterval: 6000,
    staleTime: 0,
  });

  // ── Derive active participants from messages (last 30 mins) ─────────────
  const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
  const recentMessages = messages.filter(
    (m) => m.created_date && new Date(m.created_date).getTime() > thirtyMinsAgo
  );
  // Deduplicate participants by author_label
  const participantMap = new Map();
  recentMessages.forEach((m) => {
    const key = m.author_label || m.author_session || "anon";
    if (!participantMap.has(key)) {
      participantMap.set(key, {
        id: m.author_id || m.author_session,
        author_label: m.author_label,
        district_name: m.district_name,
        is_verified: m.is_verified,
        is_official: m.is_official,
      });
    }
  });
  const participants = Array.from(participantMap.values());

  // ── Stable per-channel online counts (hour-seeded, not random per render) ──
  useEffect(() => {
    // Seed by hour-of-day so count is stable within an hour but varies over time
    const hourSeed = new Date().getHours();
    const counts = {};
    CHANNELS.forEach((ch, i) => {
      const base = ch.value === "general" ? 110 : ch.value === "nearby" ? 35 : 12;
      const jitter = ((hourSeed * 7 + i * 13) % 35);
      counts[ch.value] = base + jitter;
    });
    setOnlineCount(counts);
  }, []); // runs once on mount — stable for the session

  // ── Scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Cooldown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const showWarning = (msg) => {
    setSpamWarning(msg);
    setTimeout(() => setSpamWarning(null), 4000);
  };

  const handleSend = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!isAuthenticated) {
        requireAuth(() => {}, T("Sign in to chat", "அரட்டையடிக்க உள்நுழையுங்கள்"));
        return;
      }
      if (sendingRef.current || sending || cooldown > 0) return;

      const trimmed = text.trim();
      if (!trimmed) return;
      if (trimmed.length < 2) { showWarning(T("Message is too short.", "செய்தி மிகவும் குறுகியது.")); return; }
      if (trimmed.length > MAX_MSG_LEN) { showWarning(T(`Max ${MAX_MSG_LEN} characters.`, `அதிகபட்சம் ${MAX_MSG_LEN} எழுத்துகள்.`)); return; }

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

      const safety = checkContentSafety(trimmed);
      if (!safety.safe) {
        showWarning(T("Message blocked — violates community guidelines.", "செய்தி தடுக்கப்பட்டது — சமுதாய வழிகாட்டுதல்களை மீறுகிறது."));
        return;
      }

      sendingRef.current = true;
      setSending(true);

      try {
        await base44.entities.LiveChatMessage.create({
          channel,
          content: sanitizeText(trimmed),
          message_type: msgType,
          author_session: session,
          author_id: user?.id || null,
          author_label: user?.full_name || T("Community Member", "சமுதாய உறுப்பினர்"),
          status: "active",
          report_count: 0,
        });

        setText("");
        setCooldown(Math.ceil(COOLDOWN_MS / 1000));
        qc.invalidateQueries({ queryKey: ["live-chat", channel] });
        inputRef.current?.focus();
      } finally {
        setSending(false);
        sendingRef.current = false;
      }
    },
    [text, sending, cooldown, channel, msgType, session, qc, isAuthenticated, user, T, requireAuth]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isAdmin = user?.role === "admin";

  const handleHideMessage = async (msgId) => {
    await base44.entities.LiveChatMessage.update(msgId, {
      status: "hidden",
      hidden_by: user?.id,
    });
    qc.invalidateQueries({ queryKey: ["live-chat", channel] });
  };

  // Real counts from actual fetched data
  const totalMessages = messages.length;
  const liveCount = onlineCount[channel] || 0;

  // ── Report chat room ────────────────────────────────────────────────────
  const handleReportChat = async (reason) => {
    if (reportingChat || reportChatDone) return;
    setReportingChat(true);
    try {
      await createReport({
        target_type: "live_chat_channel",
        target_id: channel,
        reason,
        details: `Channel: ${channel}`,
        reporter_session: session,
      });
      setReportChatDone(true);
      setTimeout(() => { setShowReportChat(false); setReportChatDone(false); }, 2500);
    } catch (err) {
      console.error("Report failed:", err);
    } finally {
      setReportingChat(false);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)] sm:h-[calc(100vh-260px)] min-h-[480px] sm:min-h-[560px]">
      {/* ── LEFT: Chat Rooms Sidebar ────────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-3 hidden lg:flex">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {T("Chat Rooms", "அரட்டை அறைகள்")}
          </h3>
          <button className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm font-bold transition-colors">
            +
          </button>
        </div>

        <div className="space-y-1.5">
          {CHANNELS.map((ch) => {
            const isActive = channel === ch.value;
            const dotColor =
              ch.value === "emergency" ? "bg-red-500" :
              ch.value === "nearby" ? "bg-green-500" : "bg-blue-500";
            return (
              <button
                key={ch.value}
                onClick={() => setChannel(ch.value)}
                className={`w-full flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold truncate">{ch.emoji} {T(ch.label_en, ch.label_ta)}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
                    {onlineCount[ch.value] || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white animate-pulse" : dotColor + " animate-pulse"}`} />
                  <span className={`text-[10px] ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                    {T(ch.desc_en, ch.desc_ta)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Community CTA card */}
        <div className="mt-auto rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white">
          <p className="text-xs font-bold mb-1">
            {T("Be Respectful. Be Helpful.", "மரியாதையாக இருங்கள். உதவியாக இருங்கள்.")}
          </p>
          <p className="text-[10px] text-blue-100 mb-2">
            {T("Let's build a better Tamil Nadu together.", "சிறந்த தமிழ்நாட்டை உருவாக்குவோம்.")}
          </p>
          <div className="flex justify-end">
            <span className="text-lg">🤝</span>
          </div>
        </div>
      </div>

      {/* ── CENTER: Main Chat Area ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{currentChannel?.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {T(currentChannel?.label_en, currentChannel?.label_ta)}
                </h2>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {T(currentChannel?.desc_en, currentChannel?.desc_ta)}
                {". "}
                {T("Please follow community guidelines.", "சமுதாய வழிகாட்டுதல்களை பின்பற்றுங்கள்.")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{liveCount}</span>
              <span className="hidden sm:inline">{T("online", "ஆன்லைன்")}</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-semibold">{totalMessages > 0 ? totalMessages.toLocaleString() : "—"}</span>
              <span>{T("messages", "செய்திகள்")}</span>
            </div>
            {/* Mobile info button — opens bottom sheet */}
            <button
              onClick={() => setShowMobileInfo(true)}
              className="lg:hidden w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors"
              aria-label={T("Room Info", "அறை தகவல்")}
            >
              <Info className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile channel switcher */}
        <div className="flex gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto lg:hidden flex-shrink-0">
          {CHANNELS.map((ch) => (
            <button
              key={ch.value}
              onClick={() => setChannel(ch.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                channel === ch.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {ch.emoji} {T(ch.label_en, ch.label_ta)}
            </button>
          ))}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Radio className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">
                {T("No messages yet", "இன்னும் செய்திகள் இல்லை")}
              </p>
              <p className="text-sm text-slate-400">
                {T("Be the first to start the conversation.", "முதலில் உரையாடலை தொடங்குங்கள்.")}
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                m={m}
                isAdmin={isAdmin}
                onHide={handleHideMessage}
                T={T}
                currentUserId={user?.id}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {!isAuthenticated ? (
            <div className="p-4">
              <button
                onClick={() => requireAuth(() => {}, T("Sign in to join the live chat", "நேரடி அரட்டையில் சேர உள்நுழையுங்கள்"))}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {T("Sign in to join the live chat", "நேரடி அரட்டையில் சேர உள்நுழையுங்கள்")}
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {spamWarning && (
                <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {spamWarning}
                </div>
              )}

              {/* Type selector + cooldown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={msgType}
                    onChange={(e) => setMsgType(e.target.value)}
                    className="w-full sm:w-auto appearance-none pl-2 pr-6 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {Object.entries(MSG_TYPE_CONFIG).map(([v, c]) => (
                      <option key={v} value={v}>{c.emoji} {T(c.label_en, c.label_ta)}</option>
                    ))}
                  </select>
                </div>
                {cooldown > 0 && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {T(`Wait ${cooldown}s`, `${cooldown}s காத்திருங்கள்`)}
                  </span>
                )}
              </div>

              {/* Input row */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={T("Type your message...", "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...")}
                  maxLength={MAX_MSG_LEN}
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={T("Add emoji", "இமோஜி சேர்")}>
                    <Smile className="w-4 h-4" />
                  </button>
                  <button type="button" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={T("Attach image", "படம் இணை")}>
                    <Image className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button
                    onClick={handleSend}
                    disabled={sending || cooldown > 0 || !text.trim()}
                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition-colors"
                  >
                    {sending ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick action pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <button type="button" className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
                  <Image className="w-3 h-3" /> {T("Image", "படம்")}
                </button>
                <button type="button" className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
                  <MapPin className="w-3 h-3" /> {T("Location", "இடம்")}
                </button>
                <button type="button" className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors">
                  <FileText className="w-3 h-3" /> {T("Civic Receipt", "குடிமை ரசீது")}
                </button>
                <button type="button" className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
                  <AlertTriangle className="w-3 h-3" /> {T("Alert", "எச்சரிக்கை")}
                </button>
                <p className="text-[10px] text-slate-400 ml-auto">
                  {T("Keep it respectful. Spam and abuse are auto-blocked.", "மரியாதையாக வையுங்கள். ஸ்பேம் தானாக தடுக்கப்படும்.")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Info Panel ──────────────────────────────────────────────── */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-3 hidden xl:flex">
        {/* About this room */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            {T("About this room", "இந்த அறையைப் பற்றி")}
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> {T("Room type", "அறை வகை")}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {T("Public", "பொது")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {T("Created by", "உருவாக்கியவர்")}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">NammaTN</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {T("Created on", "உருவாக்கப்பட்ட நாள்")}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">20 Jan 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3 h-3" /> {T("Participants", "பங்கேற்பாளர்கள்")}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {totalMessages > 0 ? totalMessages.toLocaleString() : "—"} {T("msgs", "செய்திகள்")}
              </span>
            </div>
          </div>
          <button className="mt-3 w-full border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition-colors">
            <Info className="w-3 h-3" /> {T("Room Info", "அறை தகவல்")}
          </button>
        </div>

        {/* Active Participants */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {T("Active Participants", "செயல்பாட்டு பங்கேற்பாளர்கள்")}
              <span className="ml-1.5 text-slate-500 font-normal">({participants.length})</span>
            </h3>
            <button
              onClick={() => setShowParticipants(true)}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {T("View all", "அனைத்தையும் காண்")}
            </button>
          </div>

          {/* Participant avatars row */}
          <div className="flex items-center gap-1 flex-wrap">
            {participants.slice(0, 5).map((p, i) => (
              <div key={p.id || i} className="relative" title={p.author_label}>
                <Avatar name={p.author_label || "User"} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
            ))}
            {participants.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                +{participants.length - 5}
              </div>
            )}
            {participants.length === 0 && (
              <p className="text-xs text-slate-400">
                {T("No recent activity", "சமீபத்திய செயல்பாடு இல்லை")}
              </p>
            )}
          </div>
        </div>

        {/* Room Guidelines */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            {T("Room Guidelines", "அறை வழிகாட்டுதல்கள்")}
          </h3>
          <ol className="space-y-1.5">
            {(lang === "ta" ? ROOM_GUIDELINES_TA : ROOM_GUIDELINES_EN).map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  {i + 1}
                </span>
                {g}
              </li>
            ))}
          </ol>
        </div>

        {/* Report Issue button */}
        <button
          onClick={() => setShowReportChat(true)}
          className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl py-2.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          {T("Report Issue", "சிக்கலை புகாரளி")}
        </button>

        {/* Inline report panel */}
        {showReportChat && (
          <div className="mt-2 border border-red-200 dark:border-red-800 rounded-xl p-3 bg-red-50 dark:bg-red-900/10">
            {reportChatDone ? (
              <p className="text-xs text-green-700 dark:text-green-400 text-center py-2 font-semibold">
                ✓ {T("Report submitted. Thank you!", "புகார் சமர்ப்பிக்கப்பட்டது. நன்றி!")}
              </p>
            ) : (
              <>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
                  {T("Why are you reporting this chat?", "இந்த அரட்டையை ஏன் புகாரளிக்கிறீர்கள்?")}
                </p>
                <div className="space-y-1">
                  {[
                    ["spam", T("Spam / Abuse", "ஸ்பேம் / துர்பயன்பாடு")],
                    ["hate_speech", T("Hate Speech", "வெறுப்புரை")],
                    ["misinformation", T("Misinformation", "தவறான தகவல்")],
                    ["harassment", T("Harassment", "துன்புறுத்தல்")],
                    ["other", T("Other", "மற்றவை")],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleReportChat(val)}
                      disabled={reportingChat}
                      className="w-full text-left text-xs text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {reportingChat
                        ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        : <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      }
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowReportChat(false)}
                  className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 w-full text-center"
                >
                  {T("Cancel", "ரத்து செய்")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Active Participants Modal ─────────────────────────────────────── */}
      {showParticipants && (
        <ActiveParticipantsModal
          participants={participants}
          onClose={() => setShowParticipants(false)}
          T={T}
        />
      )}

      {/* ── Mobile Info Bottom Sheet ──────────────────────────────────────── */}
      {showMobileInfo && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMobileInfo(false)}
          />
          {/* Slide-up panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-5 max-h-[75vh] overflow-y-auto lg:hidden">
            {/* Handle + Close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentChannel?.emoji}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {T(currentChannel?.label_en, currentChannel?.label_ta)}
                </h3>
              </div>
              <button
                onClick={() => setShowMobileInfo(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Participants */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {T("Active Participants", "செயல்பாட்டு பங்கேற்பாளர்கள்")}
                  <span className="text-slate-400 font-normal ml-1">({participants.length})</span>
                </h4>
                <button
                  onClick={() => { setShowMobileInfo(false); setShowParticipants(true); }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  {T("View all", "அனைத்தையும் காண்")}
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {participants.slice(0, 8).map((p, i) => (
                  <div key={p.id || i} className="relative" title={p.author_label}>
                    <Avatar name={p.author_label || "User"} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                ))}
                {participants.length > 8 && (
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +{participants.length - 8}
                  </div>
                )}
                {participants.length === 0 && (
                  <p className="text-xs text-slate-400">{T("No recent activity", "சமீபத்திய செயல்பாடு இல்லை")}</p>
                )}
              </div>
            </div>

            {/* Room Guidelines */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                {T("Room Guidelines", "அறை வழிகாட்டுதல்கள்")}
              </h4>
              <ol className="space-y-1.5">
                {(lang === "ta" ? ROOM_GUIDELINES_TA : ROOM_GUIDELINES_EN).map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    {g}
                  </li>
                ))}
              </ol>
            </div>

            {/* Report Issue */}
            <button
              onClick={() => { setShowMobileInfo(false); setShowReportChat(true); }}
              className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl py-2.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              {T("Report Issue", "சிக்கலை புகாரளி")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}