// Anti-spam and content safety utilities for TN Voice community

const ABUSIVE_PATTERNS = [
  /\b(spam|scam|hack|phish)\b/i,
  /(.)\1{6,}/, // Repeated characters: aaaaaaa
  /http[s]?:\/\/(?!tnvoice)/i, // External links (basic)
];

const FLOOD_WINDOW_MS = 30000; // 30 seconds
const MAX_MSGS_IN_WINDOW = 5;

// Per-session message tracking (in-memory, resets on refresh)
const sessionTracker = {};

export function getSession() {
  let s = localStorage.getItem("tn_session");
  if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("tn_session", s); }
  return s;
}

export function checkSpam(session, content) {
  const now = Date.now();
  if (!sessionTracker[session]) {
    sessionTracker[session] = { msgs: [], muted: false, muteUntil: 0, lastContent: "" };
  }
  const tracker = sessionTracker[session];

  // Check mute
  if (tracker.muted && now < tracker.muteUntil) {
    return { blocked: true, reason: "muted", muteRemaining: Math.ceil((tracker.muteUntil - now) / 1000) };
  } else if (tracker.muted && now >= tracker.muteUntil) {
    tracker.muted = false;
  }

  // Duplicate message
  if (tracker.lastContent === content.trim()) {
    return { blocked: true, reason: "duplicate" };
  }

  // Flood detection: prune old msgs
  tracker.msgs = tracker.msgs.filter((t) => now - t < FLOOD_WINDOW_MS);
  if (tracker.msgs.length >= MAX_MSGS_IN_WINDOW) {
    tracker.muted = true;
    tracker.muteUntil = now + 60000; // 1 minute mute
    return { blocked: true, reason: "flood" };
  }

  // Content safety
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(content)) {
      return { blocked: true, reason: "content_policy" };
    }
  }

  // Allow
  tracker.msgs.push(now);
  tracker.lastContent = content.trim();
  return { blocked: false };
}

export function getCooldownRemaining(session, cooldownMs) {
  const tracker = sessionTracker[session];
  if (!tracker || tracker.msgs.length === 0) return 0;
  const lastMsg = tracker.msgs[tracker.msgs.length - 1];
  const elapsed = Date.now() - lastMsg;
  return elapsed < cooldownMs ? cooldownMs - elapsed : 0;
}

export function isMuted(session) {
  const tracker = sessionTracker[session];
  if (!tracker) return false;
  return tracker.muted && Date.now() < tracker.muteUntil;
}