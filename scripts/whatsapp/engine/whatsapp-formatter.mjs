// scripts/whatsapp/engine/whatsapp-formatter.mjs
/**
 * VizhiTN Verified WhatsApp Bulletin Formatter & LLM Engine
 * Produces clean, mobile-optimized Tamil WhatsApp channel messages with 8-gate validation.
 */

import { validateWhatsAppMessage, VIZHITN_CHANNEL_FOLLOW_LINK } from './whatsapp-validator.mjs';
import { formatRealNewsWhatsAppBulletin } from '../../../src/lib/whatsappChannel.js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const geminiApiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export const CATEGORY_SAFETY_RULES = {
  "electricity": [
    "மின்தடை நேரத்திற்கு முன்பே போன், லேப்டாப் சார்ஜ் செய்யுங்கள்",
    "குடிநீர் தண்ணீர் மோட்டார் முன்கூட்டியே நிரப்புங்கள்",
    "மின்தடை நேரம் முடிந்த பிறகும் மின்சாரம் வரவில்லை என்றால் 1912 அழைக்கவும்"
  ],
  "water-sanitation": [
    "குடிநீர் முன்கூட்டியே பாத்திரங்களில் சேமியுங்கள்",
    "அவசர குடிநீர் தேவைக்கு TWAD டேங்கர்: 1916",
    "கொதிக்க வைத்த பாதுகாப்பான குடிநீரை அருந்துங்கள்"
  ],
  "rain": [
    "அவசியமில்லாமல் வெளியே செல்லாதீங்கள்",
    "வெள்ளம் தேங்கும் பகுதிகளில் வாகனம் ஓட்டாதீங்கள்",
    "மின் கம்பங்கள் மற்றும் மரங்களில் இருந்து விலகி இருங்கள்"
  ],
  "road-infrastructure": [
    "இந்த பகுதியில் வாகனம் எச்சரிக்கையுடன் ஓட்டுங்கள்",
    "இரவு நேரத்தில் குழி உள்ள பகுதிகளை தவிருங்கள்",
    "சாலை புகார்: GCC 1913 அல்லது vizhitn.in"
  ],
  "public-safety": [
    "அவசர நிலையில் காவல்துறை: 100",
    "பெண்கள் உதவி: 181",
    "ஆம்புலன்ஸ்: 108"
  ],
  "scam": [
    "OTP, PIN யாரிடமும் சொல்லாதீங்கள்",
    "சந்தேக லிங்க் கிளிக் பண்ணாதீங்கள்",
    "சைபர் கிரைம் புகார்: 1930"
  ],
  "environment": [
    "மாசு புகார் TNPCB: 044-28524573",
    "வன உயிரினம் தொடர்பு: வனத்துறை 1926",
    "பொது இடங்களில் குப்பை போடாதீங்கள்"
  ],
  "tn-politics": [],
  "education": [
    "விண்ணப்பிக்க கடைசி தேதியை முன்கூட்டியே சரிபார்க்கவும்",
    "அதிகாரப்பூர்வ அரசு போர்ட்டலில் மட்டுமே விண்ணப்பிக்கவும்",
    "போலி வேலைவாய்ப்பு முகவர்களிடம் பணம் கொடுத்து ஏமாறாதீர்கள்"
  ],
  "government-schemes": [
    "அரசு திட்டங்களுக்கு e-Sevai மையம் அல்லது tnesevai.tn.gov.in அணுகவும்",
    "அனைத்து அரசு நலத்திட்ட விண்ணப்பங்களும் முற்றிலும் இலவசம் — இடைத்தரகர்களை தவிர்க்கவும்",
    "சந்தேகங்களுக்கு முதலமைச்சரின் உதவி மையம்: 1100"
  ]
};

export const CATEGORY_HELPLINES = {
  "electricity": "⚡ TANGEDCO: 1912",
  "water-sanitation": "💧 TWAD குடிநீர்: 1916",
  "rain": "🌧️ மாவட்ட கட்டுப்பாட்டு அறை: 1077 | NDRF: 1070",
  "road-infrastructure": "🚧 PWD புகார்: 1800-425-0005",
  "public-safety": "🚨 காவல்துறை: 100 | பெண்கள்: 181",
  "scam": "⚠️ சைபர் கிரைம்: 1930",
  "environment": "🌿 TNPCB: 044-28524573",
  "education": "📚 மாணவர் / கல்வி உதவி: 14417",
  "tn-politics": "",
  "government-schemes": "📋 CM Helpline: 1100"
};

/**
 * High-level export for formatting a WhatsApp message from a post object.
 */
export async function formatWhatsAppMessage(post) {
  const result = await generateVerifiedWhatsAppPost({ post });
  return result.message;
}

/**
 * Generates a verified WhatsApp channel message with automated retry loop.
 */
export async function generateVerifiedWhatsAppPost({ post, isForwardVariant = false }) {
  const maxRetries = 2;
  let attempt = 0;
  let retryFeedback = '';
  let finalMessage = '';
  let validation = null;

  while (attempt <= maxRetries) {
    attempt++;
    console.log(`[WHATSAPP FORMATTER] Generating post attempt ${attempt}/${maxRetries + 1}...`);

    let candidate = await callGeminiWhatsAppPrompt({ post, retryFeedback, isForwardVariant });

    if (!candidate) {
      console.log('[WHATSAPP FORMATTER] LLM unavailable, generating deterministic clean bulletin...');
      candidate = buildDeterministicWhatsAppPost({ post, isForwardVariant });
    } else {
      // Gate 7B compliance: always ensure the channel follow-link appears at the end of LLM output
      if (!candidate.includes(VIZHITN_CHANNEL_FOLLOW_LINK)) {
        candidate = `${candidate.trimEnd()}\n\n📲 VizhiTN Channel Follow: ${VIZHITN_CHANNEL_FOLLOW_LINK}`;
      }
    }

    validation = validateWhatsAppMessage(candidate, post, { isForwardVariant });

    if (validation.passed) {
      console.log(`[WHATSAPP VALIDATION ✓] All 7 gates PASSED on attempt ${attempt}`);
      finalMessage = candidate;
      break;
    } else {
      console.warn(`[WHATSAPP VALIDATION ⚠️] Attempt ${attempt} failed:`, validation.errors.join(' | '));
      retryFeedback = `Your previous WhatsApp bulletin failed validation:\n- ${validation.errors.join('\n- ')}\nCorrect all issues strictly.`;
    }
  }

  if (!validation.passed) {
    console.error(`[WHATSAPP FORMATTER ABORT] Failed validation after ${maxRetries + 1} attempts. Falling back to deterministic template.`);
    finalMessage = buildDeterministicWhatsAppPost({ post, isForwardVariant });
    validation = validateWhatsAppMessage(finalMessage, post, { isForwardVariant });
  }

  return {
    message: finalMessage,
    validation
  };
}

async function callGeminiWhatsAppPrompt({ post, retryFeedback, isForwardVariant }) {
  if (!geminiApiKey) return null;

  // Get category-specific rules BEFORE building prompt
  const catKey = CATEGORY_SAFETY_RULES[post.category_slug]
    ? post.category_slug
    : ((post.title_ta || '').includes('மழை') || (post.title_en || '').toLowerCase().includes('rain'))
      ? 'rain'
      : ((post.title_ta || '').includes('மோசடி') || (post.title_en || '').toLowerCase().includes('scam'))
        ? 'scam'
        : post.category_slug;

  const categoryRules = CATEGORY_SAFETY_RULES[catKey] || [];
  const categoryHelpline = CATEGORY_HELPLINES[catKey] || "🆘 அவசர உதவி: 112";
  const rulesText = categoryRules.length > 0
    ? categoryRules.map(r => `• ${r}`).join('\n')
    : "";

  const postUrl = post.canonical_url || post.url || (post.slug ? `https://www.vizhitn.in/post/${post.slug}` : 'https://www.vizhitn.in');

  const prompt = `
நீ VizhiTN WhatsApp channel bot formatter.

இந்த civic post-ஐ WhatsApp message-ஆக மாற்று.

POST விவரங்கள்:
Title: ${post.title_ta || post.title_en}
Content: ${post.content_ta?.slice(0, 300) || post.content_en?.slice(0, 300)}
Category: ${post.category_slug}
Post type: ${post.post_type}
District: ${post.district_slug}
Area: ${post.area_name || post.district_slug}
Helpline: ${categoryHelpline}

SAFETY TIPS FOR THIS CATEGORY ONLY:
${rulesText || "இல்லை — tips section skip பண்ணு"}

STRICT FORMAT (இதை மட்டும் பின்பற்று):

[category emoji] [சுருக்கமான தலைப்பு — MUST be under 60 characters]

[content — 2-3 sentences max, simple Tamil]

${rulesText ? `✅ என்ன செய்ய வேண்டும்:\n${rulesText}` : ""}

📞 ${categoryHelpline}

📍 ${post.area_name || post.district_slug || 'தமிழ்நாடு'}
👉 முழு தகவல்: ${postUrl}

🔁 உங்கள் குடும்பத்தினருக்கு அனுப்புங்கள்

RULES:
1. ONLY use the safety tips listed above for this category — do NOT add tips from other categories
2. Rain alert = rain tips ONLY. Never add OTP/cyber fraud/bank tips to rain alerts
3. Scam alert = fraud tips ONLY. Never add rain/flood tips to scam alerts
4. If categoryRules is empty, skip the "என்ன செய்ய வேண்டும்" section entirely
5. Keep total message under 300 words
6. HEADLINE MUST BE SHORTER THAN 60 CHARACTERS
7. Return the formatted message only — no explanation, no extra text
${retryFeedback ? `\nPREVIOUS ATTEMPT FIXES REQUIRED:\n${retryFeedback}\n` : ''}`;

  const CANDIDATES = [
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-pro-latest'
  ];
  for (const model of CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.25, maxOutputTokens: 450 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text.trim().replace(/^```(?:markdown)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }
      } else {
        const errText = await res.text();
        console.warn(`[WHATSAPP FORMATTER] ${model} HTTP ${res.status}: ${errText.slice(0, 100)}`);
      }
    } catch (fetchErr) {
      console.warn(`[WHATSAPP FORMATTER] ${model} fetch failed: ${fetchErr.message}`);
    }
  }
  return null;
}

/**
 * Deterministic template formatter guaranteeing 100% gate pass when LLM is offline.
 * Produces clean, professional Tamil newsroom bulletins without AI bot tropes.
 * Always appends the mandatory VizhiTN channel follow-link as a suffix (Gate 7B compliance).
 */
export function buildDeterministicWhatsAppPost({ post, isForwardVariant = false }) {
  const rawTitle = (post.title_ta || post.title_en || 'VizhiTN எச்சரிக்கை').trim();
  const safeTitle = rawTitle.length > 60 ? (rawTitle.slice(0, 57).replace(/\s+\S*$/, '') + '...') : rawTitle;

  let message = formatRealNewsWhatsAppBulletin({ post: { ...post, title_ta: safeTitle, title_en: safeTitle } });
  // Gate 7B compliance: always ensure the channel follow-link appears at the end
  if (!message.includes(VIZHITN_CHANNEL_FOLLOW_LINK)) {
    message = `${message.trimEnd()}\n\n📲 VizhiTN Channel Follow: ${VIZHITN_CHANNEL_FOLLOW_LINK}`;
  }
  return message;
}

function formatDistrictName(slug = '') {
  const map = {
    chennai: 'சென்னை',
    coimbatore: 'கோவை',
    madurai: 'மதுரை',
    tiruchirappalli: 'திருச்சி',
    salem: 'சேலம்',
    tirunelveli: 'திருநெல்வேலி',
    thanjavur: 'தஞ்சாவூர்',
    vellore: 'வேலூர்',
    erode: 'ஈரோடு',
    krishnagiri: 'கிருஷ்ணகிரி',
    hosur: 'ஓசூர்',
    dharmapuri: 'தருமபுரி',
    namakkal: 'நாமக்கல்',
    cuddalore: 'கடலூர்'
  };
  return map[slug.toLowerCase()] || slug || 'தமிழ்நாடு';
}
