/**
 * Content safety checks for comments, chat messages, and discussions.
 * Centralizes all detection logic — no duplicate implementations.
 */

// ─── Sensitive data patterns ──────────────────────────────────────────────────
const PHONE_RE = /(\+91|0)?[6-9]\d{9}/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/[^\s]{4,}/gi;

// ─── Abuse/hate patterns (Tamil Nadu context) ────────────────────────────────
const ABUSE_PATTERNS = [
  /\b(spam|hack|phish)\b/i,
  /(.)\1{8,}/,                                       // 8+ repeated chars
  /\b(die|kill yourself|idiot|stupid fool|bastard)\b/i,
  /\b(caste slur placeholder)\b/i,                   // extend with actual slurs
];

const SCAM_PATTERNS = [
  /\b(earn \$\d+|free money|click here to claim|send otp|share your otp|wire transfer)\b/i,
  /\b(100% profit|guaranteed returns|investment scheme)\b/i,
];

const POLITICAL_PATTERNS = [
  /\b(vote for|bjp|dmk|aiadmk|congress) (is|are) (corrupt|criminals|traitors)\b/i,
];

/**
 * Run all safety checks on text.
 * Returns { safe, warnings: string[], flags: string[] }
 * warnings = user-visible soft warnings (submit allowed with review flag)
 * flags = hard blocks (submit rejected)
 */
export function checkContentSafety(text) {
  if (!text || typeof text !== "string") return { safe: true, warnings: [], flags: [] };

  const warnings = [];
  const flags = [];

  // Hard blocks
  for (const re of ABUSE_PATTERNS) {
    if (re.test(text)) {
      flags.push("abusive_content");
      break;
    }
  }
  for (const re of SCAM_PATTERNS) {
    if (re.test(text)) {
      flags.push("scam_keywords");
      break;
    }
  }

  // Repeated chars / spam-like
  if (/(.)\1{5,}/.test(text)) flags.push("repetitive_spam");

  // Soft warnings — allowed but flagged for review
  if (PHONE_RE.test(text)) warnings.push("phone_number");
  if (EMAIL_RE.test(text)) warnings.push("email_address");
  if (URL_RE.test(text)) warnings.push("external_link");
  for (const re of POLITICAL_PATTERNS) {
    if (re.test(text)) { warnings.push("political_content"); break; }
  }

  return {
    safe: flags.length === 0,
    warnings,
    flags,
    needsReview: warnings.length > 0,
  };
}

/** User-friendly message for a flag/warning type */
export function safetyMessage(type) {
  const map = {
    abusive_content: "Your message contains content that violates community guidelines.",
    scam_keywords: "Your message was blocked — it resembles scam or fraud content.",
    repetitive_spam: "Your message looks like spam (too many repeated characters).",
    phone_number: "Your message contains a phone number. It will be reviewed for safety.",
    email_address: "Your message contains an email address and will be reviewed.",
    external_link: "Your message contains a link and will be reviewed before publishing.",
    political_content: "Your message contains political content and will be reviewed.",
  };
  return map[type] || "Your message was flagged for review.";
}

/** Short safety reminder shown near input boxes */
export const SAFETY_REMINDER_EN =
  "Keep discussion safe and useful. Do not post private phone numbers, personal attacks, hate speech, or unverified accusations.";
export const SAFETY_REMINDER_TA =
  "விவாதத்தை பாதுகாப்பாகவும் பயனுள்ளதாகவும் வையுங்கள். தனியார் தொலைபேசி எண்கள், தனிப்பட்ட தாக்குதல்கள், வெறுப்பு பேச்சு அல்லது சரிபார்க்கப்படாத குற்றச்சாட்டுகளை இடவேண்டாம்.";