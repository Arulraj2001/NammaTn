import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Send, Shield, MapPin, MessageSquare, Archive, AlertTriangle,
  Users, ThumbsUp, Reply, MoreHorizontal, Bell, BellOff, Share2,
  FileText, Flag, CheckCircle2, X, Clock, Tag, ChevronDown, Smile, Paperclip,
  Lock, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { checkSpam, getSession } from "@/lib/spamGuard";
import { sanitizeText, checkRateLimit } from "@/lib/security";
import { checkContentSafety } from "@/lib/contentSafety";
import { useAuth } from "@/lib/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const MSG_TYPE_CONFIG = {
  update:       { label_en: "Update",    label_ta: "புதுப்பிப்பு",   color: "text-blue-700 dark:text-blue-300",   emoji: "📢" },
  alert:        { label_en: "Alert",     label_ta: "எச்சரிக்கை",     color: "text-red-700 dark:text-red-300",     emoji: "🚨" },
  question:     { label_en: "Question",  label_ta: "கேள்வி",         color: "text-purple-700 dark:text-purple-300", emoji: "❓" },
  help:         { label_en: "Help",      label_ta: "உதவி",           color: "text-orange-700 dark:text-orange-300", emoji: "🙏" },
  confirmation: { label_en: "Confirmed", label_ta: "உறுதிப்படுத்தல்", color: "text-green-700 dark:text-green-300",  emoji: "✅" },
  resolution:   { label_en: "Resolved",  label_ta: "தீர்வு",         color: "text-emerald-700 dark:text-emerald-300", emoji: "🎉" },
};

const CATEGORY_COLORS = {
  "Water Supply":    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Electricity":     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  "Roads":           "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Sanitation":      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Emergency":       "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "Health":          "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

const COOLDOWN_MS = 6000;

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR HELPER
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
  "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
  "bg-yellow-600", "bg-cyan-600",
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

function Avatar({ name = "", size = "md", image = null }) {
  const sizes = {
    xs:  "w-6 h-6 text-[10px]",
    sm:  "w-8 h-8 text-xs",
    md:  "w-9 h-9 text-sm",
    lg:  "w-10 h-10 text-sm",
  };
  if (image) {
    return <img src={image} alt={name} className={`${sizes[size]} rounded-full object-cover ring-1 ring-white dark:ring-slate-800 flex-shrink-0`} />;
  }
  return (
    <div className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ring-1 ring-white dark:ring-slate-800`}>
      {getInitials(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE PARTICIPANTS MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ParticipantsModal({ participants, total, onClose, T }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm max-h-[75vh] flex flex-col border border-slate-200 dark:border-slate-700 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {T("Participants", "பங்கேற்பாளர்கள்")}
            </span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
              {total}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {participants.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {T("No participants yet", "இன்னும் பங்கேற்பாளர்கள் இல்லை")}
            </div>
          ) : (
            participants.map((p, i) => (
              <div key={p.id || i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="relative">
                  <Avatar name={p.author_label || "User"} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {p.author_label || T("Community Member", "சமுதாய உறுப்பினர்")}
                  </p>
                  {p.district_name && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {p.district_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {p.is_official && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                      {T("Official", "அதிகாரப்பூர்வம்")}
                    </span>
                  )}
                  {p.is_verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 rounded-b-2xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-400 text-center">
            {T("Active in the last 30 minutes", "கடந்த 30 நிமிடங்களில் செயல்பாட்டில்")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE ROW
// ─────────────────────────────────────────────────────────────────────────────

function MessageRow({ msg, T, isAdmin, onHide }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(msg.like_count || 0);
  const [showActions, setShowActions] = useState(false);
  const cfg = MSG_TYPE_CONFIG[msg.message_type] || MSG_TYPE_CONFIG.update;

  const handleLike = () => {
    setLiked((p) => !p);
    setLikeCount((c) => liked ? c - 1 : c + 1);
  };

  return (
    <div className="flex gap-3 group py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      {/* Avatar */}
      <Avatar name={msg.author_label || "User"} size="md" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {msg.author_label || T("Community Member", "சமுதாய உறுப்பினர்")}
            </span>
            {msg.is_verified && (
              <span className="flex items-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {T("Verified Resident", "சரிபார்க்கப்பட்ட குடியிருப்பாளர்")}
              </span>
            )}
            {msg.is_official && (
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                {T("Official", "அதிகாரப்பூர்வம்")}
              </span>
            )}
            {msg.is_admin && (
              <span className="text-[11px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>
            )}
            <span className="text-[11px] text-slate-400">
              · {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ""}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowActions((p) => !p)}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                <button onClick={() => { setShowActions(false); }} className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Reply className="w-3 h-3" /> {T("Reply", "பதில்")}
                </button>
                <button onClick={() => { setShowActions(false); }} className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Share2 className="w-3 h-3" /> {T("Share", "பகிர்")}
                </button>
                <button onClick={() => { setShowActions(false); }} className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                  <Flag className="w-3 h-3" /> {T("Report", "புகாரளி")}
                </button>
                {isAdmin && (
                  <button onClick={() => { onHide(msg.id); setShowActions(false); }} className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                    <X className="w-3 h-3" /> {T("Hide", "மறை")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message text */}
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words mb-2">
          {msg.content}
        </p>

        {/* Action row */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-blue-500"}`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
            {likeCount > 0 ? likeCount : T("Like", "மொத்தம்")}
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Reply className="w-3.5 h-3.5" />
            {T("Reply", "பதில்")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LiveRoomThread({ room, onBack }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const qc = useQueryClient();
  const session = getSession();
  const { user, isAuthenticated } = useAuth();
  const bottomRef = useRef(null);
  const sendingRef = useRef(false);
  const inputRef = useRef(null);

  const [text, setText] = useState("");
  const [msgType, setMsgType] = useState("update");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [spamWarning, setSpamWarning] = useState(null);
  const [following, setFollowing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [sortOrder, setSortOrder] = useState("most_recent");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const isLocked = room.status === "locked" || room.status === "archived";

  // ── Fetch messages ─────────────────────────────────────────────────────
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["room-messages", room.id],
    queryFn: () =>
      base44.entities.LiveRoomMessage.filter(
        { room_id: room.id, status: "active" },
        "created_date",
        100
      ),
    refetchInterval: 6000,
    staleTime: 0,
  });

  // ── Sort messages ───────────────────────────────────────────────────────
  const sortedMessages = [...messages].sort((a, b) => {
    const ta = new Date(a.created_date || 0).getTime();
    const tb = new Date(b.created_date || 0).getTime();
    return sortOrder === "most_recent" ? tb - ta : ta - tb;
  });

  // ── Derive participants from messages (last 30 min) ─────────────────────
  const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
  const recentMsgs = messages.filter(
    (m) => m.created_date && new Date(m.created_date).getTime() > thirtyMinsAgo
  );
  const participantMap = new Map();
  recentMsgs.forEach((m) => {
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
  const totalParticipants = room.participant_count || participants.length || 0;

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (sortOrder === "oldest") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sortOrder]);

  // ── Cooldown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const showWarning = (msg) => {
    setSpamWarning(msg);
    setTimeout(() => setSpamWarning(null), 4000);
  };

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (e) => {
      e?.preventDefault();
      if (sendingRef.current || sending || cooldown > 0 || isLocked) return;

      const trimmed = text.trim();
      if (!trimmed || trimmed.length < 3 || trimmed.length > 400) return;

      if (!checkRateLimit(`room_${room.id}`, 8, 60_000)) {
        showWarning(T("You're posting too fast.", "மிக வேகமாக இடுகிறீர்கள்."));
        return;
      }

      const spamCheck = checkSpam(session, trimmed);
      if (spamCheck.blocked) {
        const msgs = {
          muted: T(`Muted for ${spamCheck.muteRemaining}s.`, `${spamCheck.muteRemaining}s தடைசெய்யப்பட்டீர்கள்.`),
          duplicate: T("Don't post the same message.", "அதே செய்தியை மீண்டும் இடாதீர்கள்."),
          flood: T("Too many messages. Please wait.", "அதிக செய்திகள்."),
          content_policy: T("Message flagged by content filter.", "வடிகட்டியால் தடுக்கப்பட்டது."),
        };
        showWarning(msgs[spamCheck.reason] || T("Message blocked.", "செய்தி தடுக்கப்பட்டது."));
        return;
      }

      const safety = checkContentSafety(trimmed);
      if (!safety.safe) {
        showWarning(T("Message blocked — violates guidelines.", "வழிகாட்டுதல்களை மீறுகிறது."));
        return;
      }

      sendingRef.current = true;
      setSending(true);

      try {
        await base44.entities.LiveRoomMessage.create({
          room_id: room.id,
          content: sanitizeText(trimmed),
          message_type: msgType,
          author_session: session,
          author_label: user?.full_name || T("Community Member", "சமுதாய உறுப்பினர்"),
          author_id: user?.id || null,
          status: "active",
        });

        setText("");
        setCooldown(Math.ceil(COOLDOWN_MS / 1000));
        qc.invalidateQueries({ queryKey: ["room-messages", room.id] });
        inputRef.current?.focus();
      } finally {
        setSending(false);
        sendingRef.current = false;
      }
    },
    [text, sending, cooldown, isLocked, session, msgType, room, qc, user, T]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isAdmin = user?.role === "admin";

  const handleHide = async (msgId) => {
    await base44.entities.LiveRoomMessage.update(msgId, { status: "hidden" });
    qc.invalidateQueries({ queryKey: ["room-messages", room.id] });
  };

  const categoryColor = CATEGORY_COLORS[room.category] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
  const tags = room.tags ? (Array.isArray(room.tags) ? room.tags : room.tags.split(",").map(t => t.trim())) : [];

  return (
    <div className="flex gap-5">
      {/* ══════════════════════════════════════════════════════════════════════
          LEFT — Main content
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          {T("Back to Live Discussions", "நேரடி விவாதங்களுக்கு திரும்பு")}
        </button>

        {/* ── Room header card ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-4 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {room.status === "active" && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </span>
                )}
                {room.status === "archived" && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Archive className="w-3.5 h-3.5" /> {T("Archived", "காப்பகம்")}
                  </span>
                )}
                {room.status === "locked" && (
                  <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                    <Lock className="w-3.5 h-3.5" /> {T("Locked", "பூட்டப்பட்டது")}
                  </span>
                )}
                {room.is_emergency && (
                  <span className="text-xs font-bold text-red-700 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                    🚨 Emergency
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
                {room.title}
              </h1>

              {(room.area_name || room.district_name) && (
                <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {[room.area_name, room.district_name].filter(Boolean).join(", ")}
                </p>
              )}

              {room.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {room.description}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <strong className="text-slate-600 dark:text-slate-300">{totalParticipants}</strong>
                  {T("participants", "பங்கேற்பாளர்கள்")}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <strong className="text-slate-600 dark:text-slate-300">{messages.length}</strong>
                  {T("messages", "செய்திகள்")}
                </span>
                {room.created_date && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {T("Started", "தொடங்கியது")}{" "}
                    {formatDistanceToNow(new Date(room.created_date), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setFollowing((f) => !f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  following
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${following ? "fill-current" : ""}`} />
                {following ? T("Following", "பின்தொடர்கிறீர்கள்") : T("Follow", "பின்தொடர்")}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all">
                <Share2 className="w-3.5 h-3.5" />
                {T("Share", "பகிர்")}
              </button>
            </div>
          </div>
        </div>

        {/* ── Pinned admin notice ────────────────────────────────────────── */}
        {room.pinned_notice && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2 mb-4">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>{T("Admin Notice:", "நிர்வாக அறிவிப்பு:")}</strong> {room.pinned_notice}</span>
          </div>
        )}

        {/* ── Discussion updates ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col">
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {T("Discussion Updates", "விவாத புதுப்பிப்புகள்")}
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowSortMenu((p) => !p)}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
              >
                {sortOrder === "most_recent" ? T("Most recent", "மிக சமீபத்தியது") : T("Oldest first", "பழையது முதலில்")}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-20 min-w-[140px]">
                  {[["most_recent", T("Most recent", "மிக சமீபத்தியது")], ["oldest", T("Oldest first", "பழையது முதலில்")]].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => { setSortOrder(v); setShowSortMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${sortOrder === v ? "text-blue-600 font-semibold" : "text-slate-600 dark:text-slate-300"} hover:bg-slate-50 dark:hover:bg-slate-700`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 min-h-0" style={{ maxHeight: "380px" }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sortedMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {T("No updates yet", "இன்னும் புதுப்பிப்புகள் இல்லை")}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {T("Be the first to post an update.", "முதலில் ஒரு புதுப்பிப்பை இடுங்கள்.")}
                </p>
              </div>
            ) : (
              sortedMessages.map((msg) => (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  T={T}
                  isAdmin={isAdmin}
                  onHide={handleHide}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input area ──────────────────────────────────────────────── */}
          {isLocked ? (
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                {room.status === "archived" ? <Archive className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>
                  {room.status === "archived"
                    ? T("This room is archived.", "இந்த அறை காப்பகப்படுத்தப்பட்டது.")
                    : T("This room is locked by admin.", "இந்த அறை நிர்வாகியால் பூட்டப்பட்டது.")}
                </span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
              {spamWarning && (
                <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {spamWarning}
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* User avatar */}
                <Avatar name={user?.full_name || "NT"} image={user?.profile_image} size="md" />

                {/* Type selector */}
                <div className="relative flex-shrink-0">
                  <select
                    value={msgType}
                    onChange={(e) => setMsgType(e.target.value)}
                    className="appearance-none pl-2.5 pr-6 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {Object.entries(MSG_TYPE_CONFIG).map(([v, c]) => (
                      <option key={v} value={v}>{c.emoji} {T(c.label_en, c.label_ta)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>

                {/* Text input */}
                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 gap-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={T("Share an update or ask for help...", "புதுப்பிப்பை பகிர் அல்லது உதவி கேள்...")}
                    maxLength={400}
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={sending || cooldown > 0 || !text.trim() || isLocked}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  {sending ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Footer hint */}
              <p className="text-[11px] text-slate-400 mt-2 pl-11">
                {cooldown > 0
                  ? T(`Wait ${cooldown}s before posting again.`, `மீண்டும் இடுவதற்கு ${cooldown}s காத்திருங்கள்.`)
                  : T("Keep updates factual and helpful. Spam is auto-blocked.", "புதுப்பிப்புகளை உண்மையானதாக வையுங்கள். ஸ்பேம் தானாக தடுக்கப்படும்.")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT — Info panel
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-64 flex-shrink-0 space-y-3 hidden lg:block">

        {/* Room Info card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
            {T("Room Info", "அறை தகவல்")}
          </h3>

          {/* Creator row */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Avatar name={room.creator_name || room.created_by || "User"} size="sm" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {T("Room created by", "அறை உருவாக்கியவர்")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {room.creator_name || room.created_by || T("Community Member", "சமுதாய உறுப்பினர்")}
                </p>
              </div>
            </div>
            {room.created_date && (
              <span className="text-[11px] text-slate-400 flex-shrink-0">
                {formatDistanceToNow(new Date(room.created_date), { addSuffix: true })}
              </span>
            )}
          </div>

          {/* Room details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> {T("Room type", "அறை வகை")}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {T("Public", "பொது")}
              </span>
            </div>

            {(room.area_name || room.district_name) && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> {T("Area", "பகுதி")}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium text-right">
                  {room.area_name || room.district_name}
                </span>
              </div>
            )}

            {room.category && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> {T("Category", "வகை")}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColor}`}>
                  {room.category}
                </span>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-shrink-0">
                  <Tag className="w-3 h-3" /> {T("Tags", "குறிச்சொற்கள்")}
                </span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {tags.slice(0, 4).map((tag, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="mt-3 w-full border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 rounded-xl py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center gap-1.5 transition-colors">
            <Flag className="w-3.5 h-3.5" />
            {T("Report Inappropriate", "பொருத்தமற்றதை புகாரளி")}
          </button>
        </div>

        {/* Participants card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {T("Participants", "பங்கேற்பாளர்கள்")}
              <span className="ml-1.5 font-normal text-slate-400">({totalParticipants})</span>
            </h3>
            <button
              onClick={() => setShowParticipants(true)}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {T("View all", "அனைத்தையும் காண்")}
            </button>
          </div>

          {/* Avatar row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Current user first */}
            {user && (
              <div className="relative" title={T("You", "நீங்கள்")}>
                <Avatar name={user.full_name || "You"} image={user.profile_image} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
            )}
            {participants.slice(0, user ? 4 : 5).map((p, i) => (
              <div key={p.id || i} className="relative" title={p.author_label}>
                <Avatar name={p.author_label || "User"} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
            ))}
            {totalParticipants > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-500">
                +{totalParticipants - 5}
              </div>
            )}
            {participants.length === 0 && !user && (
              <p className="text-xs text-slate-400">{T("No recent activity", "சமீபத்திய செயல்பாடு இல்லை")}</p>
            )}
          </div>
          {user && (
            <p className="text-[11px] text-slate-400 mt-2">{T("You!", "நீங்கள்!")}</p>
          )}
        </div>

        {/* Quick Actions card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
            {T("Quick Actions", "விரைவு செயல்கள்")}
          </h3>
          <div className="space-y-1">
            {[
              { icon: FileText, label_en: "Create Civic Receipt", label_ta: "குடிமை ரசீது உருவாக்கு", color: "text-blue-600 dark:text-blue-400" },
              { icon: Share2, label_en: "Share Room", label_ta: "அறையை பகிர்", color: "text-green-600 dark:text-green-400" },
              { icon: Bell, label_en: "Follow Updates", label_ta: "புதுப்பிப்புகளை பின்தொடர்", color: "text-purple-600 dark:text-purple-400" },
              { icon: BellOff, label_en: "Mute Room", label_ta: "அறையை முடக்கு", color: "text-slate-500 dark:text-slate-400" },
            ].map(({ icon: Icon, label_en, label_ta, color }) => (
              <button
                key={label_en}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
              >
                <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                {T(label_en, label_ta)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Participants Modal ─────────────────────────────────────────────── */}
      {showParticipants && (
        <ParticipantsModal
          participants={participants}
          total={totalParticipants}
          onClose={() => setShowParticipants(false)}
          T={T}
        />
      )}
    </div>
  );
}