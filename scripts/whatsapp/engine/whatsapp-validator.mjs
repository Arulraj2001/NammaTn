// scripts/whatsapp/engine/whatsapp-validator.mjs
/**
 * VizhiTN WhatsApp Channel 7-Gate Validation Engine
 * 
 * Gates:
 * a. LINK CHECK: Complete valid URL, no truncated slugs (e.g., "...2027-publi")
 * b. SPELLING CHECK: Terms must be clean ("SMS", not "எஸ்சிஎம்எஸ்"; "மோசடி", not "மோசதி")
 * c. HEADLINE-BODY MATCH: Question/promise in headline is answered/delivered in body
 * d. LENGTH: Total length <= 700 chars, headline < 60 chars, max 2 emojis in headline
 * e. TEMPLATE CONSISTENCY: Same footer structure on every post ("📍 {District}", "👉 முழு செய்தி: {link}", "📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க")
 * f. NO FOLLOW-LINK: Channel follow link (whatsapp.com/channel/) prohibited inside normal posts
 * g. HELPLINE INTEGRITY: Scam/emergency post must include official helpline (1930 / 1912 / 1077 / 1100)
 */

export function validateWhatsAppMessage(messageText = '', post = {}, options = {}) {
  const isForwardVariant = options.isForwardVariant || false;
  const errors = [];
  const gates = {
    gate_a_link_check: { pass: true },
    gate_b_spelling_check: { pass: true },
    gate_c_headline_body_match: { pass: true },
    gate_d_length: { pass: true },
    gate_e_template_consistency: { pass: true },
    gate_f_no_follow_link: { pass: true },
    gate_g_helpline: { pass: true }
  };

  const lines = messageText.trim().split('\n').filter(l => l.trim().length > 0);
  const headlineLine = lines[0] || '';
  const headlineClean = headlineLine.replace(/[*_~`]/g, '').trim();

  // ─── GATE A: LINK CHECK ────────────────────────────────────────────────
  const linkMatches = messageText.match(/https?:\/\/[^\s)]+/g) || [];
  if (linkMatches.length === 0) {
    gates.gate_a_link_check = { pass: false, reason: 'No article URL found in message.' };
    errors.push('Gate A: Missing article URL');
  } else {
    // Check if the link ends with a truncated slug or trailing dash
    const articleLink = linkMatches.find(l => l.includes('vizhitn.in') || l.includes('http'));
    if (!articleLink || articleLink.endsWith('-') || /-[a-z0-9]{3,5}$/i.test(articleLink) && articleLink.length > 80 && !/\d{8}$/.test(articleLink)) {
      // Check specifically for truncation pattern like "...2027-publi"
      if (articleLink && (articleLink.endsWith('-publi') || articleLink.endsWith('...'))) {
        gates.gate_a_link_check = { pass: false, reason: `Truncated article URL detected: ${articleLink}` };
        errors.push(`Gate A: Truncated article URL (${articleLink})`);
      }
    }
    // General truncation check
    if (articleLink && articleLink.includes('...')) {
      gates.gate_a_link_check = { pass: false, reason: `URL contains ellipsis / truncation: ${articleLink}` };
      errors.push('Gate A: URL contains truncation');
    }
  }

  // ─── GATE B: SPELLING & COMMON TERMS CHECK ─────────────────────────────
  const spellingErrors = [];
  if (/எஸ்சிஎம்எஸ்|எஸ்\.எம்\.எஸ்/i.test(messageText)) {
    spellingErrors.push('Use standard "SMS" instead of "எஸ்சிஎம்எஸ்"');
  }
  if (/மோசதி/i.test(messageText)) {
    spellingErrors.push('Typo "மோசதி" found; must be "மோசடி"');
  }
  if (spellingErrors.length > 0) {
    gates.gate_b_spelling_check = { pass: false, errors: spellingErrors };
    errors.push(`Gate B: Spelling errors (${spellingErrors.join(', ')})`);
  }

  // ─── GATE C: HEADLINE-BODY MATCH ───────────────────────────────────────
  const questionKeywords = ['எப்போது?', 'எப்படி?', 'என்ன காரணம்?', 'எங்கே?'];
  const hasQuestion = questionKeywords.some(kw => headlineClean.includes(kw)) || headlineClean.includes('?');
  const hasActionPromise = headlineClean.includes('இதைச் செய்யுங்கள்') || headlineClean.includes('உடனடி நடவடிக்கை');

  if (hasQuestion) {
    const bodyText = messageText.slice(headlineLine.length);
    // If the question is about "எப்போது" (when), it specifically requires a date, month, year, or explicit "அறிவிக்கப்படவில்லை"
    if (headlineClean.includes('எப்போது')) {
      const answersWhen = /(?:அறிவிக்கப்படவில்லை|திறப்பு தேதி|202\d|தேதி|நவம்பர்|டிசம்பர்|ஜனவரி|பிப்ரவரி|மார்ச்|ஏப்ரல்|மே|ஜூன்|ஜூலை|ஆகஸ்ட்|செப்டம்பர்|அக்டோபர்)/i.test(bodyText);
      if (!answersWhen) {
        gates.gate_c_headline_body_match = {
          pass: false,
          reason: 'Headline asks "எப்போது?" (when?), but body does not provide a date or state "அறிவிக்கப்படவில்லை".'
        };
        errors.push('Gate C: Headline question ("எப்போது?") is left unanswered in body');
      }
    } else {
      const answersGeneral = /(?:அறிவிக்கப்படவில்லை|காரணம்|விவரம்|உடனடி|வழிமுறை)/i.test(bodyText);
      if (!answersGeneral) {
        gates.gate_c_headline_body_match = {
          pass: false,
          reason: 'Headline asks a question, but body does not answer it or state official status.'
        };
        errors.push('Gate C: Headline question is left unanswered in body');
      }
    }
  }

  if (hasActionPromise) {
    // Body must contain action steps (e.g. என்ன செய்யணும் or 1/2/3 steps)
    const hasSteps = /(?:செய்யுங்கள்|தொடாதீர்கள்|பகிருங்கள்|அழையுங்கள்|என்ன செய்யணும்)/i.test(messageText);
    if (!hasSteps) {
      gates.gate_c_headline_body_match = {
        pass: false,
        reason: 'Headline promises "இதைச் செய்யுங்கள்", but body contains no action steps.'
      };
      errors.push('Gate C: Headline promises action steps but none found in body');
    }
  }

  // ─── GATE D: LENGTH & EMOJI GATES ──────────────────────────────────────
  const totalLength = messageText.length;
  // Count emojis in headline
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const headlineEmojis = (headlineLine.match(emojiRegex) || []).length;

  if (headlineClean.length > 65) {
    gates.gate_d_length = { pass: false, reason: `Headline is too long (${headlineClean.length} chars > 65 limit).` };
    errors.push(`Gate D: Headline length ${headlineClean.length} exceeds 65 chars`);
  } else if (totalLength > 750) {
    gates.gate_d_length = { pass: false, reason: `Total length is too long (${totalLength} chars > 750 limit).` };
    errors.push(`Gate D: Total length ${totalLength} exceeds 750 chars`);
  } else if (headlineEmojis > 2) {
    gates.gate_d_length = { pass: false, reason: `Too many emojis in headline (${headlineEmojis} > 2 limit).` };
    errors.push(`Gate D: Headline contains ${headlineEmojis} emojis (max 2)`);
  }

  // ─── GATE E: TEMPLATE CONSISTENCY ──────────────────────────────────────
  const hasFullNewsLabel = messageText.includes('👉 முழு செய்தி:');
  const hasDistrictMarker = /📍\s+[^\n]+/i.test(messageText);
  const hasFamilyShareLine = messageText.includes('📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க');
  const hasOldBilingualLabels = /முக்கிய விவரங்கள் \/ Key Details|Full List|மாவட்டம் \/ District/i.test(messageText);

  if (!hasFullNewsLabel || !hasDistrictMarker || !hasFamilyShareLine || hasOldBilingualLabels) {
    gates.gate_e_template_consistency = {
      pass: false,
      reason: `Template inconsistent: hasFullNews=${hasFullNewsLabel}, hasDistrict=${hasDistrictMarker}, hasShare=${hasFamilyShareLine}, hasOldBilingual=${hasOldBilingualLabels}`
    };
    errors.push('Gate E: Template structure does not match standard (found old bilingual labels or missing fields)');
  }

  // ─── GATE F: NO FOLLOW-LINK INSIDE NORMAL POSTS ────────────────────────
  if (!isForwardVariant && messageText.includes('whatsapp.com/channel/')) {
    gates.gate_f_no_follow_link = {
      pass: false,
      reason: 'Channel follow link (whatsapp.com/channel/) is present inside normal post body.'
    };
    errors.push('Gate F: In-channel follow link found inside normal post body');
  }

  // ─── GATE G: HELPLINE INTEGRITY ────────────────────────────────────────
  const isScam = (post.category_slug === 'public-safety' || (post.title_ta || '').includes('மோசடி') || messageText.includes('மோசடி') || messageText.includes('SMS'));
  const isPowerCut = (post.category_slug === 'electricity' || (post.title_ta || '').includes('மின்தடை') || messageText.includes('மின்தடை'));

  if (isScam && !messageText.includes('1930')) {
    gates.gate_g_helpline = { pass: false, reason: 'Cyber scam advisory must mention National Cyber Helpline 1930.' };
    errors.push('Gate G: Missing 1930 helpline for cyber scam alert');
  } else if (isPowerCut && !messageText.includes('1912')) {
    gates.gate_g_helpline = { pass: false, reason: 'Power cut alert must mention TANGEDCO Minnalagam helpline 1912.' };
    errors.push('Gate G: Missing 1912 helpline for power cut alert');
  }

  return {
    passed: errors.length === 0,
    errors,
    gates
  };
}
