/**
 * Security utilities — client-side hardening layer.
 * XSS sanitization, input validation, rate limiting, spam detection.
 */

// ─── XSS / Input Sanitization ────────────────────────────────────────────────

const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

export function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"'/]/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

/** Strip all HTML tags from a string */
export function stripTags(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "");
}

/** Sanitize user-provided text: strip tags + trim */
export function sanitizeText(str) {
  if (typeof str !== "string") return "";
  return stripTags(str).trim().replace(/\s{3,}/g, "  ");
}

/** Sanitize an object's string fields recursively (depth-limited) */
export function sanitizePayload(obj, depth = 0) {
  if (depth > 5 || obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeText(obj);
  if (Array.isArray(obj)) return obj.map((v) => sanitizePayload(v, depth + 1));
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizePayload(v, depth + 1)])
    );
  }
  return obj;
}

// ─── URL Validation ───────────────────────────────────────────────────────────

export function isSafeUrl(url) {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

// ─── File Validation ──────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // SECURITY: image/svg+xml removed — SVGs can contain embedded scripts (XSS)
  "video/mp4",
  "video/webm",
  "video/ogg",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "application/pdf",
]);

const DANGEROUS_EXTENSIONS = new Set([
  "exe", "sh", "bat", "cmd", "ps1", "vbs", "js", "msi",
  "dll", "so", "dmg", "pkg", "deb", "rpm", "py", "php",
  "rb", "pl", "jar", "class", "apk",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateFile(file) {
  const errors = [];
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    errors.push(`File type "${file.type}" is not allowed.`);
  }
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    errors.push(`File extension ".${ext}" is not allowed.`);
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(`File exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
  }
  if (file.name.length > 200) {
    errors.push("File name is too long.");
  }

  return { valid: errors.length === 0, errors };
}

// ─── Rate Limiting (client-side) ──────────────────────────────────────────────

const rateLimitStore = new Map(); // key → { count, windowStart }

/**
 * Client-side rate limiter using localStorage + memory.
 * Returns true if the action is allowed, false if rate-limited.
 * @param {string} key  - action identifier (e.g. "post_create", "comment")
 * @param {number} limit - max requests
 * @param {number} windowMs - window in milliseconds
 */
export function checkRateLimit(key, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const stored = (() => {
    try {
      const raw = localStorage.getItem(`rl_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const entry = stored && now - stored.windowStart < windowMs
    ? stored
    : { count: 0, windowStart: now };

  if (entry.count >= limit) return false;

  entry.count += 1;
  try {
    localStorage.setItem(`rl_${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full — allow action
  }
  return true;
}

/** Get remaining seconds until a rate-limit window resets */
export function getRateLimitResetIn(key, windowMs = 60_000) {
  try {
    const raw = localStorage.getItem(`rl_${key}`);
    if (!raw) return 0;
    const { windowStart } = JSON.parse(raw);
    const remaining = windowMs - (Date.now() - windowStart);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  } catch {
    return 0;
  }
}

// ─── Spam Detection ───────────────────────────────────────────────────────────

const SPAM_PATTERNS = [
  /\b(buy now|click here|free money|earn \$\d+|100% free|limited offer|act now)\b/i,
  /https?:\/\/[^\s]{3,}\s+https?:\/\/[^\s]{3,}\s+https?:\/\/[^\s]{3,}/i, // 3+ links
  /(.)\1{8,}/, // 8+ repeated characters
];

export function detectSpam(text) {
  if (!text || typeof text !== "string") return false;
  return SPAM_PATTERNS.some((re) => re.test(text));
}

/** Detect near-duplicate content using simple character n-gram similarity */
export function getSimilarity(a, b) {
  if (!a || !b) return 0;
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  const longer = na.length > nb.length ? na : nb;
  const shorter = na.length > nb.length ? nb : na;
  if (longer.length === 0) return 1;
  const matchLen = longer.length - levenshteinDistance(longer, shorter);
  return matchLen / longer.length;
}

function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// ─── Session / CSRF helpers ───────────────────────────────────────────────────

export function getSessionId() {
  try {
    let sid = localStorage.getItem("tn_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("tn_session_id", sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

// ─── Content Length Guards ────────────────────────────────────────────────────

export const LIMITS = {
  title: { min: 5, max: 200 },
  content: { min: 10, max: 5000 },
  comment: { min: 2, max: 1000 },
  authorName: { min: 0, max: 80 },
  searchQuery: { min: 1, max: 150 },
};

export function validateLength(value, type) {
  const lim = LIMITS[type];
  if (!lim) return null;
  if (value.length < lim.min) return `Minimum ${lim.min} characters required.`;
  if (value.length > lim.max) return `Maximum ${lim.max} characters allowed.`;
  return null;
}