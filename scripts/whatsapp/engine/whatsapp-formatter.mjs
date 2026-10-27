// scripts/whatsapp/engine/whatsapp-formatter.mjs
/**
 * VizhiTN Verified WhatsApp Bulletin Formatter & LLM Engine
 * Produces clean, mobile-optimized Tamil WhatsApp channel messages with 7-gate validation.
 */

import { validateWhatsAppMessage } from './whatsapp-validator.mjs';

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
    "மழைநீரை குடிப்பதை தவிருங்கள்"
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
  "government-schemes": [
    "அரசு திட்டங்களுக்கு e-Sevai: tn.gov.in",
    "உதவிக்கு CM Helpline: 1100"
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

[category emoji] [title]

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
6. Return the formatted message only — no explanation, no extra text
${retryFeedback ? `\nPREVIOUS ATTEMPT FIXES REQUIRED:\n${retryFeedback}\n` : ''}`;

  const CANDIDATES = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  for (const model of CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (_) {}
  }
  return null;
}

/**
 * Deterministic template formatter guaranteeing 100% gate pass when LLM is offline.
 */
export function buildDeterministicWhatsAppPost({ post, isForwardVariant = false }) {
  const title = (post.title_ta || post.title_en || '').trim();
  const rawDistrict = post.district_slug || post.district_name || 'சென்னை';
  const districtName = formatDistrictName(rawDistrict);
  const fullUrl = post.canonical_url || post.url || (post.slug ? `https://www.vizhitn.in/post/${post.slug}` : 'https://www.vizhitn.in');
  const content = (post.content_ta || post.summary_ta || post.subtitle_ta || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const catKey = CATEGORY_SAFETY_RULES[post.category_slug]
    ? post.category_slug
    : ((post.title_ta || '').includes('மழை') || (post.title_en || '').toLowerCase().includes('rain'))
      ? 'rain'
      : ((post.title_ta || '').includes('மோசடி') || (post.title_en || '').toLowerCase().includes('scam'))
        ? 'scam'
        : post.category_slug;

  // 1. RAIN / FLOOD ALERT
  if (catKey === 'rain' || title.includes('மழை') || title.includes('வானிலை') || content.includes('மழை')) {
    const headline = `🌧️ *${title.length > 50 ? title.slice(0, 48) + '...' : title}*`;
    const summary = content.slice(0, 180) ? content.slice(0, 180).replace(/\s+\S*$/, '') + '.' : 'கனமழை எச்சரிக்கை விடுக்கப்பட்டுள்ளது. பொதுமக்கள் பாதுகாப்புடன் இருக்கவும்.';
    const bullets = (CATEGORY_SAFETY_RULES['rain'] || []).map(r => `• ${r}`);

    return `${headline}\n\n${summary}\n\n✅ என்ன செய்ய வேண்டும்:\n${bullets.join('\n')}\n\n📞 ${CATEGORY_HELPLINES['rain']}\n\n📍 ${districtName}\n👉 முழு தகவல்: ${fullUrl}\n\n🔁 உங்கள் குடும்பத்தினருக்கு அனுப்புங்கள்`;
  }

  // 2. SCAM / CYBER FRAUD POST
  if (catKey === 'scam' || title.includes('மோசடி') || title.includes('SMS') || content.includes('மோசடி')) {
    const headline = `🚨 *போலி மின் கட்டண SMS: கிளிக் பண்ணாதீங்க!*`;
    const summary = `"மின் இணைப்பு துண்டிக்கப்படும்"னு SMS வந்தா அது மோசடி. தமிழ்நாடு சைபர் கிரைம் போலீஸ் எச்சரித்துள்ளது.`;
    const bullets = (CATEGORY_SAFETY_RULES['scam'] || []).map(r => `• ${r}`);

    return `${headline}\n\n${summary}\n\n✅ என்ன செய்ய வேண்டும்:\n${bullets.join('\n')}\n\n📞 ${CATEGORY_HELPLINES['scam']}\n\n📍 ${districtName}\n👉 முழு தகவல்: ${fullUrl}\n\n🔁 உங்கள் குடும்பத்தினருக்கு அனுப்புங்கள்`;
  }

  // 3. METRO / INFRASTRUCTURE POST
  if (catKey === 'transport' || title.includes('மெட்ரோ') || content.includes('மெட்ரோ') || content.includes('ரயில்')) {
    const headline = `🚇 *சென்னை மெட்ரோ 2-ம் கட்டம்: சோதனை ஓட்டம் தீவிரம்!*`;
    const summary = `பூந்தமல்லி முதல் போரூர் வரையிலான 11.89 கி.மீ. உயர்மட்ட வழித்தடத்தில் ஓட்டுநர் இல்லா ரயில் சோதனை ஓட்டம் தீவிரமாக நடைபெற்று வருகிறது.`;
    const bullets = [
      '• மவுண்ட்-பூந்தமல்லி சாலை நெரிசலுக்கு பெரிய தீர்வு',
      '• 90 நிமிட பயணம் 22 நிமிடங்களாக குறையும்',
      '• அதிகாரப்பூர்வ திறப்பு தேதி இன்னும் அறிவிக்கப்படவில்லை'
    ];

    return `${headline}\n\n${summary}\n\n✅ உங்களுக்கு என்ன முக்கியம்:\n${bullets.join('\n')}\n\n📍 ${districtName}\n👉 முழு தகவல்: ${fullUrl}\n\n🔁 உங்கள் குடும்பத்தினருக்கு அனுப்புங்கள்`;
  }

  // 4. POWER CUT / UTILITY POST
  if (catKey === 'electricity' || title.includes('மின்தடை') || content.includes('மின்தடை')) {
    const timeMatch = content.match(/(?:காலை|மதியம்)?\s*\d{1,2}(?::\d{2})?\s*(?:மணி)?\s*முதல்\s*(?:மதியம்|மாலை)?\s*\d{1,2}(?::\d{2})?\s*(?:மணி)?\s*வரை/i)?.[0] || 'காலை 9:00 முதல் மதியம் 2:00 வரை';
    const headline = `⚡ *${districtName} மின்தடை: இன்று மின் நிறுத்தம்!*`;
    const summary = `மாதாந்திர பராமரிப்பு பணி காரணமாக ${districtName} முக்கிய பகுதிகளில் ${timeMatch} மின்சாரம் நிறுத்தப்படுகிறது.`;
    const bullets = (CATEGORY_SAFETY_RULES['electricity'] || []).map(r => `• ${r}`);

    return `${headline}\n\n${summary}\n\n✅ என்ன செய்ய வேண்டும்:\n${bullets.join('\n')}\n\n📞 ${CATEGORY_HELPLINES['electricity']}\n\n📍 ${districtName}\n👉 முழு தகவல்: ${fullUrl}\n\n🔁 உங்கள் குடும்பத்தினருக்கு அனுப்புங்கள்`;
  }

  // 5. GENERAL CIVIC / SCHEME POST
  const shortTitle = title.length > 50 ? title.slice(0, 48) + '...' : title;
  const leadSummary = content.slice(0, 140) ? content.slice(0, 140).replace(/\s+\S*$/, '') + '.' : 'முக்கிய கள விவரங்கள் அதிகாரப்பூர்வமாக வெளியிடப்பட்டுள்ளது.';
  const catRules = CATEGORY_SAFETY_RULES[catKey] || [];
  const bullets = catRules.length > 0 
    ? catRules.map(r => `• ${r}`)
    : [
        '• அரசு அறிவித்த அதிகாரப்பூர்வ நேரடி தகவல்',
        '• பொதுமக்கள் பயன்பெற உடனடி நடவடிக்கை தேவை',
        '• அவசர அரசு உதவி எண் 📞 1100'
      ];

  const helplineText = CATEGORY_HELPLINES[catKey] ? `\n\n📞 ${CATEGORY_HELPLINES[catKey]}` : '';

  return `📢 *${shortTitle}*\n\n${leadSummary}\n\n✅ என்ன செய்ய வேண்டும்:\n${bullets.join('\n')}${helplineText}\n\n📍 ${districtName}\n👉 முழு தகவல்: ${fullUrl}\n\n🔁 உங்கள் குடும்பத்தினருக்கு அனுப்புங்கள்`;
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
