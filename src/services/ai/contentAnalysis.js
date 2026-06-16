/**
 * Content Analysis Service — AI-ready, local rule engine fallback.
 * Migrated to run completely locally, removing Base44 InvokeLLM dependency.
 */

// ─── Toxic / Abusive language patterns (local fast-check) ───────────────────────
const TOXIC_PATTERNS = [
  /\b(fuck|shit|bastard|bitch|asshole|idiot|stupid|moron|cunt|dick|piss off)\b/i,
  /\b(kill yourself|die|go to hell|shut up)\b/i,
];

const HATE_PATTERNS = [
  /\b(terrorist|jihadi|rapist community|all [a-z]+ are|those people are)\b/i,
];

const SPAM_PATTERNS = [
  /\b(buy now|click here|free money|earn \$\d+|100% free|limited offer|act now|whatsapp me|call me at)\b/i,
  /https?:\/\/[^\s]+\s+https?:\/\/[^\s]+\s+https?:\/\/[^\s]+/i, // 3+ links
  /(.)\1{9,}/, // 10+ repeated chars
  /^\s*[\u0900-\u097F\s]{0,5}\s*$/, // near-empty non-latin
];

// Sensitive data patterns (Indian context)
const SENSITIVE_PATTERNS = {
  phone: /(\+91[\s-]?)?[6-9]\d{9}/g,
  aadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  pan: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
  email_in_text: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
};

// Local classification keywords
const COMPLAINT_KEYWORDS = ["leak", "broken", "pothole", "garbage", "trash", "power", "water", "electricity", "street", "road", "complaint", "drainage", "sewage", "noise", "illegal"];
const APPRECIATION_KEYWORDS = ["thanks", "thank", "appreciate", "good job", "great work", "congratulations", "happy to", "welcoming", "solved", "fixed", "restored"];
const ALERT_KEYWORDS = ["alert", "warning", "caution", "danger", "hazard", "fire", "accident", "blocked", "closed", "emergency"];

function localClassify(title = "", content = "") {
  const text = `${title} ${content}`.toLowerCase();
  if (ALERT_KEYWORDS.some(k => text.includes(k))) return "alert";
  if (COMPLAINT_KEYWORDS.some(k => text.includes(k))) return "complaint";
  if (APPRECIATION_KEYWORDS.some(k => text.includes(k))) return "appreciation";
  return "discussion";
}

// ─── Local checks ─────────────────────────────────────────────────────────

export function localSpamCheck(text) {
  if (!text) return { isSpam: false, confidence: 0, reasons: [] };
  const reasons = [];
  SPAM_PATTERNS.forEach((p) => { if (p.test(text)) reasons.push(p.source.slice(0, 40)); });
  const confidence = Math.min(reasons.length * 0.35, 1);
  return { isSpam: reasons.length > 0, confidence: parseFloat(confidence.toFixed(2)), reasons };
}

export function localToxicityCheck(text) {
  if (!text) return { isToxic: false, isHateSpeech: false, confidence: 0, matches: [] };
  const matches = [];
  TOXIC_PATTERNS.forEach((p) => { if (p.test(text)) matches.push("abusive_language"); });
  HATE_PATTERNS.forEach((p) => { if (p.test(text)) matches.push("potential_hate_speech"); });
  const confidence = Math.min(matches.length * 0.5, 1);
  return {
    isToxic: matches.includes("abusive_language"),
    isHateSpeech: matches.includes("potential_hate_speech"),
    confidence: parseFloat(confidence.toFixed(2)),
    matches,
  };
}

export function detectSensitiveData(text) {
  if (!text) return { hasSensitive: false, findings: [] };
  const findings = [];
  Object.entries(SENSITIVE_PATTERNS).forEach(([type, re]) => {
    re.lastIndex = 0;
    const found = text.match(re);
    if (found) findings.push({ type, count: found.length });
  });
  return { hasSensitive: findings.length > 0, findings };
}

// ─── Local Powered Analysis ───────────────────────────────────────────────

/**
 * Classify post type and detect issues using local heuristics.
 */
export async function analyzePost(title, content) {
  const text = `${title}\n\n${content}`;
  const spamLocal = localSpamCheck(text);
  const toxicLocal = localToxicityCheck(text);
  const sensitive = detectSensitiveData(text);
  const classification = localClassify(title, content);

  const toxicityScore = toxicLocal.confidence;
  const spamScore = spamLocal.confidence;

  const issues = [
    ...toxicLocal.matches,
    ...spamLocal.reasons.slice(0, 2),
  ].filter(Boolean).slice(0, 5);

  return {
    classification,
    classification_confidence: 0.8,
    toxicity_score: parseFloat(toxicityScore.toFixed(2)),
    spam_score: parseFloat(spamScore.toFixed(2)),
    needs_review: toxicityScore > 0.4 || spamScore > 0.4 || sensitive.hasSensitive,
    issues,
    suggestions: [],
    sensitive,
    source: "local",
  };
}

/**
 * Lightweight comment toxicity check (local).
 */
export async function analyzeComment(content) {
  const toxicLocal = localToxicityCheck(content);
  const spamLocal = localSpamCheck(content);
  const sensitive = detectSensitiveData(content);

  return {
    toxicity_score: toxicLocal.confidence,
    spam_score: spamLocal.confidence,
    needs_review: toxicLocal.confidence > 0.4 || spamLocal.confidence > 0.4 || sensitive.hasSensitive,
    issues: [...toxicLocal.matches, ...spamLocal.reasons],
    sensitive,
    source: "local",
  };
}

/**
 * Classify post type from content.
 */
export async function classifyContent(title, content) {
  return {
    classification: localClassify(title, content),
    confidence: 0.8
  };
}