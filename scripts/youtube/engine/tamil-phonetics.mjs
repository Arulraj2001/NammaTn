// scripts/youtube/engine/tamil-phonetics.mjs
// Converts formal/technical Tamil, English acronyms, numbers, and helplines
// into warm, natural, colloquial spoken Tamil (பேச்சுத் தமிழ்) for viral retention.

/**
 * Normalizes English government acronyms and department codes into spoken Tamil
 */
export function normalizeAcronymsToSpokenTamil(text) {
  if (!text) return '';

  const replacements = [
    // Helplines with natural spoken numbers
    { regex: /\b1912\b/g, replacement: '1912 (ஒன்னு ஒன்பது ஒன்னு ரெண்டு)' },
    { regex: /\b1913\b/g, replacement: '1913 (ஒன்னு ஒன்பது ஒன்னு மூணு)' },
    { regex: /\b1930\b/g, replacement: '1930 (ஒன்னு ஒன்பது மூணு பூஜ்ஜியம்)' },
    { regex: /\b1100\b/g, replacement: '1100 (ஒன்னு ஒன்னு பூஜ்ஜியம் பூஜ்ஜியம்)' },
    { regex: /\b1070\b/g, replacement: '1070 (ஒன்னு பூஜ்ஜியம் ஏழு பூஜ்ஜியம்)' },
    { regex: /\b1077\b/g, replacement: '1077 (ஒன்னு பூஜ்ஜியம் ஏழு ஏழு)' },

    // Government Departments & Utilities
    { regex: /\bTANGEDCO\b/gi, replacement: 'டான்ஜெட்கோ மின்வாரியம்' },
    { regex: /\bEB\b/gi, replacement: 'இபி' },
    { regex: /\bCMRL\b/gi, replacement: 'சென்னை மெட்ரோ' },
    { regex: /\bMetro\b/gi, replacement: 'மெட்ரோ' },
    { regex: /\bMTC\b/gi, replacement: 'மாநகர அரசு பேருந்து' },
    { regex: /\bSETC\b/gi, replacement: 'விரைவு அரசு பேருந்து' },
    { regex: /\bTWAD\b/gi, replacement: 'குடிநீர் வாரியம்' },
    { regex: /\bCMWSSB\b/gi, replacement: 'சென்னை மெட்ரோ வாட்டர்' },
    { regex: /\bMetrowater\b/gi, replacement: 'மெட்ரோ வாட்டர்' },
    { regex: /\bGCC\b/gi, replacement: 'சென்னை மாநகராட்சி' },
    { regex: /\bCorporation\b/gi, replacement: 'மாநகராட்சி' },
    { regex: /\bNHAI\b/gi, replacement: 'தேசிய நெடுஞ்சாலை ஆணையம்' },
    { regex: /\bMinnalagam\b/gi, replacement: 'மின்னகம் 24x7 கட்டுப்பாட்டு மையம்' },
    { regex: /\bSubstation\b/gi, replacement: 'சப்ஸ்டேஷன்' },
    { regex: /\bTransformer\b/gi, replacement: 'டிரான்ஸ்பார்மர்' },

    // Everyday Words
    { regex: /\bPower Cut\b/gi, replacement: 'கரண்ட் கட்' },
    { regex: /\bShutdown\b/gi, replacement: 'மின்தடை' },
    { regex: /\bMaintenance\b/gi, replacement: 'பராமரிப்பு வேலை' },
    { regex: /\bUpdate\b/gi, replacement: 'அப்டேட்' },
    { regex: /\bUpdates\b/gi, replacement: 'அப்டேட்ஸ்' },
    { regex: /\bAlert\b/gi, replacement: 'முக்கிய அறிவிப்பு' },
    { regex: /\bComplaint\b/gi, replacement: 'கம்ப்ளைன்ட்' },
    { regex: /\bPortal\b/gi, replacement: 'வலைத்தளம்' },
    { regex: /\bWebsite\b/gi, replacement: 'வலைத்தளம்' },
    { regex: /\bHelpline\b/gi, replacement: 'உதவி எண்' },
    { regex: /\bvizhitn\.in\b/gi, replacement: 'விழி டிஎன் டாட் இன்' }
  ];

  let result = text;
  for (const item of replacements) {
    result = result.replace(item.regex, item.replacement);
  }

  // Convert common time formats: "9:00 AM to 2:00 PM" -> "காலை 9 மணில இருந்து மதியம் 2 மணி வரைக்கும்"
  result = result.replace(/(\d{1,2}):?00?\s*AM\s*(?:to|-)\s*(\d{1,2}):?00?\s*PM/gi, 'காலை $1 மணில இருந்து மதியம் $2 மணி வரைக்கும்');
  result = result.replace(/(\d{1,2}):?00?\s*AM/gi, 'காலை $1 மணிக்கு');
  result = result.replace(/(\d{1,2}):?00?\s*PM/gi, 'மதியம் $1 மணிக்கு');

  return result;
}

/**
 * Splits text into 3 to 6-second spoken clauses based on natural breath and punctuation pauses
 * @param {string} text
 * @returns {Array<string>}
 */
export function splitIntoSpokenClauses(text) {
  if (!text) return [];

  // Normalize spaces
  const clean = text.replace(/\s+/g, ' ').trim();

  // Split on sentence boundaries and strong pauses
  const rawSegments = clean.split(/(?<=[.!?।])\s+|(?<=[,;])\s+/);

  const clauses = [];
  let current = '';

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    // Keep clauses around 5-10 words each
    const wordCount = (current + ' ' + trimmed).trim().split(/\s+/).length;
    if (wordCount <= 12) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) clauses.push(current);
      current = trimmed;
    }
  }

  if (current) {
    clauses.push(current);
  }

  return clauses;
}

/**
 * Generates an ultra-engaging, spoken conversational script for Daily Civic Shorts
 * @param {Array<Object>} posts - Top civic alerts
 * @param {string} districtName - District focus
 */
export function createConversationalShortsScript(posts, districtName = 'தமிழ்நாடு') {
  const parts = [];

  // 1. Viral Stop-Scroll Hook (0 - 5s)
  const hookVariations = [
    `ஹலோ மக்களே! இன்னைக்கு உங்க ஏரியால கரண்ட் கட் இருக்கான்னு நோட் பண்ணிக்கோங்க!`,
    `ஹலோ மக்களே! நீங்க தெரிஞ்சுக்க வேண்டிய மூன்று முக்கியமான மாவட்ட நிர்வாக அப்டேட்ஸ் இதோ!`,
    `நோட் பண்ணி வெச்சுக்கோங்க மக்களே! இன்னைக்கு உங்க பகுதியில இந்த முக்கிய வேலைகள் நடக்குது!`
  ];
  const hook = hookVariations[Math.floor(Math.random() * hookVariations.length)];
  parts.push(hook);

  // 2. Body Points (Conversational & Crisp)
  posts.forEach((p, idx) => {
    const title = normalizeAcronymsToSpokenTamil(p.title_ta || p.title_en);
    const area = p.area_name || p.district_slug || 'முக்கிய பகுதி';

    if (p.category_slug === 'electricity') {
      parts.push(`முதலாவதா, ${area} ஏரியால பராமரிப்பு பணிகளுக்காக மின்சாரம் நிறுத்தம் செய்யப்படுது.`);
      parts.push(`போன், லேப்டாப்ப சீக்கிரமா சார்ஜ் பண்ணி வெச்சுக்கோங்க மக்களே!`);
    } else if (p.category_slug === 'water-sanitation') {
      parts.push(`அடுத்ததா, ${area} பகுதியில குடிநீர் குழாய் பராமரிப்பு பணிகள் நடக்குது. தேவையான தண்ணிய முன்கூட்டியே பிடிச்சு வெச்சுக்கோங்க.`);
    } else if (p.category_slug === 'transport') {
      parts.push(`போக்குவரத்து அப்டேட்: ${title}. இந்த வழியா போறவங்க இதை கவனிச்சுக்கோங்க.`);
    } else {
      parts.push(`அடுத்த முக்கிய தகவல்: ${title}.`);
    }
  });

  // 3. Emergency Helpline Action & Outro CTA (Friendly & Helpful)
  parts.push(`கரண்ட் கட் புகார்களுக்கு 1912 உதவி எண்ணையும், மாநகராட்சி புகார்களுக்கு 1913 எண்ணையும் உடனே அழைக்கலாம்.`);
  parts.push(`இந்த தகவலை உங்க பிரண்ட்ஸ் மற்றும் குடும்பத்தினருக்கு மறக்காம ஷேர் பண்ணுங்க.`);
  parts.push(`முழு விவரங்களை தெரிஞ்சுக்க விழி டிஎன் டாட் இன் வலைத்தளத்தை பாருங்க, சப்ஸ்கிரைப் பண்ணிக்கோங்க!`);

  return parts;
}
