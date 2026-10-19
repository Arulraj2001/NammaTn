// scripts/youtube/engine/script-writer.mjs
// Production-grade 5-Act investigative documentary script engine
// Narrator: "Kavitha" — 28-year-old Tamil Nadu civic journalist persona
// Target: 6–8 minutes (46+ narrationClauses minimum across 5 Acts)

import { GoogleGenAI } from '@google/genai';
import { normalizeAcronymsToSpokenTamil, sanitizeClauseText } from './tamil-phonetics.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

// Candidate models in reliability order (most stable first)
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest'
];

// Category → FLUX scene visual prompt mapping for cinematic B-roll
const CATEGORY_FLUX_PROMPTS = {
  'electricity': 'Tamil Nadu TANGEDCO electrical linesman in safety helmet working on transformer post, Chennai city street, overcast sky, documentary photojournalism style, cinematic',
  'water-sanitation': 'Chennai Metrowater underground pipeline repair work, workers with orange vests, flooded street, real journalism documentary photo',
  'road-infrastructure': 'Potholed road in Tamil Nadu city with vehicles navigating, aerial drone shot, dramatic light, documentary realism',
  'transport': 'Chennai Metro CMRL station platform with commuters, modern architecture, busy urban rush hour, documentary style',
  'public-safety': 'Tamil Nadu police officer at community awareness event, city backdrop, documentary photojournalism',
  'healthcare': 'Tamil Nadu government hospital PHC entrance with patients waiting, documentary photojournalism style',
  'education': 'Tamil Nadu government school classroom with students and teacher, natural light, documentary style',
  'agriculture': 'Tamil Nadu farmer in paddy field, irrigation canal, golden hour light, documentary realism',
  'environment': 'Lake desilting work near Chennai, earth-moving machinery, workers, documentary photojournalism',
  'government-schemes': 'Tamil Nadu government office with citizens collecting documents, queue, busy, documentary',
  'local-development': 'Ward-level construction work in Tamil Nadu municipality, workers, equipment, documentary',
  'general': 'Tamil Nadu civic government building exterior with citizens, documentary journalism style'
};

/**
 * Returns a category-specific FLUX image generation prompt for scene visuals
 * @param {string} categorySlug
 * @returns {string}
 */
export function getCategoryFluxPrompt(categorySlug) {
  return CATEGORY_FLUX_PROMPTS[categorySlug] || CATEGORY_FLUX_PROMPTS['general'];
}

/**
 * Uses Gemini as an automated Visual Art Director to synthesize high-stakes,
 * conflict-driven photorealistic prompts for Cloudflare FLUX / Imagen thumbnail generation.
 * Follows the YouTube creator high-CTR blueprint:
 * - Direct conflict or shock action matching the title
 * - Dramatic lighting (rim light, high saturation, sharp focal depth)
 * - Clear empty safe zone for typography overlay
 *
 * @param {Object} params
 * @param {string} params.title - Article/Post title
 * @param {string} params.category - Category slug
 * @param {'16:9'|'9:16'} [params.aspectRatio='9:16']
 * @param {'A'|'B'} [params.variant='A'] - 'A' = Curiosity Question Hook, 'B' = Proof/Shock Warning
 * @returns {Promise<string>}
 */
export async function generateArtDirectedVisualPrompt({
  title,
  category = 'general',
  aspectRatio = '9:16',
  variant = 'A'
}) {
  const apiKey = process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const baseFallback = getCategoryFluxPrompt(category);
    if (variant === 'B') {
      return `${baseFallback}, emergency red warning indicator, close-up high contrast evidence, dramatic cinematic documentary photo, 8k, photorealistic`;
    }
    return `${baseFallback}, person looking in shock and curiosity, dramatic side lighting, high saturation, hyperrealistic photojournalism`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const promptInstructions = `
You are a world-class documentary photojournalist and editorial art director (Reuters, BBC News, The Hindu, National Geographic) specialized in authentic investigative journalism for Tamil Nadu, India.

Video Topic: "${title}"
Category: "${category}"
Format: "${aspectRatio}"
Variant Goal: "${variant === 'A' ? 'Wide Establishing Ground Scene (Authentic environment directly representing the topic)' : 'Close-up Forensic Proof Evidence (Physical evidence, screen, document, meter, or tool directly representing the problem)'}"

TASK:
Write a single-paragraph FLUX image generation prompt (in English, 40 to 60 words) that describes an authentic, gritty, cinematic documentary photograph.

STRICT EDITORIAL RULES:
1. STRICT TOPIC RELEVANCE: Depict the EXACT subject of the news story:
   - For electricity/power cuts: TANGEDCO utility pole, power lines, transformer, electrical substation, lineman at work.
   - For water/sanitation: Metrowater valve, drinking water pipeline leak, distribution tanker, municipal drainage.
   - For cyber crime/phone scams/fake jobs: Concerned South Indian citizen in an urban room looking at their smartphone screen, or cyber police advisory command room, close-up of mobile banking alert or WhatsApp message interface.
   - For roads/transport: CMRL metro train, MTC bus, road pothole repair with steam roller, asphalt paving.
   - For ration/schemes: Citizen with Smart Ration Card at e-Sevai centre, Taluk office counter, official certificate.
2. NO SCREAMING FACES OR CARICATURES: ABSOLUTELY NEVER generate screaming people, wide-open mouths, or exaggerated cartoonish shock. If any person is present, they must be dignified, serious, and authentic (e.g. concerned Tamil citizen, field technician, police officer).
3. Lighting & Style: Natural cinematic documentary lighting, photorealistic 35mm film texture, high dynamic range, depth of field, 8k realism.
4. Composition: Clean composition leaving the upper-third and center clear for broadcast news typography overlays.
5. NO TEXT OR WATERMARKS: Do NOT include English or Tamil text, letters, or numbers in the image.
6. Return ONLY the prompt paragraph. No intro, no quotes, no markdown.
`;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptInstructions,
          config: {
            temperature: 0.6,
            maxOutputTokens: 120
          }
        });
        const text = response?.text?.trim();
        if (text && text.length > 25) {
          const cleanPrompt = text.replace(/^["'`]|["'`]$/g, '').replace(/^(Prompt|Visual prompt):\s*/i, '').trim();
          console.log(`[ART DIRECTOR ✓] Generated ${variant === 'A' ? 'Curiosity' : 'Proof'} FLUX Prompt: "${cleanPrompt.slice(0, 90)}..."`);
          return cleanPrompt;
        }
      } catch (_) {
        // Fall to next candidate model
      }
    }
  } catch (err) {
    console.warn('[ART DIRECTOR WARN] Falling back to category prompt:', err.message);
  }

  const baseFallback = getCategoryFluxPrompt(category);
  return variant === 'B'
    ? `${baseFallback}, close-up authentic civic evidence, dramatic cinematic documentary photo, 8k, photorealistic, no text`
    : `${baseFallback}, authentic Tamil Nadu street documentary photojournalism, cinematic natural lighting, 8k realism, serious documentary`;
}


/**
 * Builds tiered YouTube metadata: title, description, chapters, hashtags
 * @param {Object} params
 * @returns {Object} { title, description, tags, hashtags }
 */
export function generateVideoMetadata({ article, script, isShort = false, chapterTimestamps = [] }) {
  const rawDistrict = (article.district_focus || article.district_slug || '').trim();
  const dept = normalizeAcronymsToSpokenTamil(article.department_name || 'Tamil Nadu Government');
  const helpline = article.helpline || '1912';
  const category = article.category_slug || 'general';
  const titleTa = article.title_ta || article.title_en || 'VizhiTN Tamil Nadu Update';

  // Sanitise district — reject slugs that are party names or non-geographic strings
  // Valid geographic slugs contain a place name
  const VALID_TN_DISTRICTS = [
    'chennai','coimbatore','madurai','tiruchirappalli','salem','tirunelveli',
    'vellore','erode','thoothukudi','dindigul','thanjavur','ranipet','chengalpattu',
    'kancheepuram','tiruvallur','namakkal','nilgiris','karur','ariyalur','perambalur',
    'cuddalore','villupuram','kallakurichi','krishnagiri','dharmapuri','tiruppur',
    'nagapattinam','tiruvarur','mayiladuthurai','pudukkottai','ramanathapuram',
    'sivaganga','virudhunagar','tenkasi','kanyakumari'
  ];
  const isGeoDistrict = rawDistrict && VALID_TN_DISTRICTS.some(d => rawDistrict.toLowerCase().includes(d));
  const districtLabel = isGeoDistrict
    ? rawDistrict.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 20)
    : 'Tamil Nadu';

  // --- Title (Under 65 chars for zero mobile truncation) ---
  let title;
  if (isShort) {
    const areaName = article.area_name || districtLabel;
    const shortArea = areaName.length > 18 ? areaName.slice(0, 16) + '..' : areaName;
    title = script?.youtubeTitle ||
      `${shortArea} மக்களுக்கு முக்கிய அறிவிப்பு! ${titleTa.slice(0, 36)} | #Shorts`;
  } else {
    const hook = script?.thumbnailHookTa || titleTa.slice(0, 40);
    title = script?.youtubeTitle ||
      `${hook}? | ${dept} உண்மை என்ன? | விழி தமிழ்நாடு ஆய்வு`;
  }
  title = title.replace(/[<>]/g, '').trim().slice(0, 95);

  // --- Category-specific Tier 2 hashtags ---
  const categoryHashtags = {
    'electricity': ['#TANGEDCO', '#PowerCut', '#மின்தடை', '#Minnalagam'],
    'water-sanitation': ['#Metrowater', '#குடிநீர்', '#CMWSSB', '#WaterCrisis'],
    'road-infrastructure': ['#GCC', '#Potholes', '#Infra', '#RoadRepair'],
    'transport': ['#CMRL', '#Metro', '#MTC', '#SouthernRailway'],
    'public-safety': ['#CyberCrime', '#PublicSafety', '#1930', '#PoliceHelpline'],
    'healthcare': ['#GovtHospital', '#HealthTN', '#PHC', '#BloodDonation'],
    'education': ['#TNSchools', '#Education', '#ExamUpdate', '#Scholarship'],
    'agriculture': ['#FarmerTN', '#Agri', '#IrrigationTN', '#CropInsurance'],
    'environment': ['#LakeRestoration', '#GreenTN', '#Pollution', '#Environment'],
    'government-schemes': ['#TNSchemes', '#Welfare', '#RationCard', '#eGov'],
    'local-development': ['#LocalBody', '#MunicipalTN', '#WardCouncil', '#CivicDev'],
    'general': ['#CivicNews', '#PublicNotice', '#TNAlert', '#Governance']
  };

  // Tier 3 — district slug to hashtag
  const districtSlugMap = {
    'chennai': '#Chennai', 'coimbatore': '#Coimbatore', 'madurai': '#Madurai',
    'tiruchirappalli': '#Trichy', 'salem': '#Salem', 'tirunelveli': '#Tirunelveli',
    'vellore': '#Vellore', 'erode': '#Erode', 'thoothukudi': '#Thoothukudi',
    'thanjavur': '#Thanjavur', 'dindigul': '#Dindigul', 'namakkal': '#Namakkal',
    'dharmapuri': '#Dharmapuri', 'krishnagiri': '#Krishnagiri', 'nilgiris': '#Nilgiris',
    'tiruppur': '#Tiruppur', 'kancheepuram': '#Kancheepuram', 'tiruvallur': '#Tiruvallur',
    'chengalpattu': '#Chengalpattu', 'cuddalore': '#Cuddalore', 'villupuram': '#Villupuram',
    'nagapattinam': '#Nagapattinam', 'mayiladuthurai': '#Mayiladuthurai', 'tiruvarur': '#Tiruvarur',
    'pudukkottai': '#Pudukkottai', 'perambalur': '#Perambalur', 'ariyalur': '#Ariyalur',
    'kallakurichi': '#Kallakurichi', 'ranipet': '#Ranipet', 'tirupattur': '#Tirupattur',
    'tenkasi': '#Tenkasi', 'virudhunagar': '#Virudhunagar', 'sivaganga': '#Sivaganga',
    'ramanathapuram': '#Ramanathapuram', 'karur': '#Karur', 'kanyakumari': '#Kanyakumari'
  };

  const tier1 = ['#TamilNadu', '#TNNews', '#விழிதமிழ்நாடு', '#VizhiTN', isShort ? '#Shorts' : '#TamilDocumentary'];
  const tier2 = categoryHashtags[category] || categoryHashtags['general'];
  const districtSlug = (article.district_slug || '').toLowerCase();
  const tier3 = [districtSlugMap[districtSlug] || '#TamilNaduNews', '#CivicIssues', '#TamilNaduGovt'];
  const hashtags = [...tier1, ...tier2, ...tier3].join(' ');

  // --- Tags array for YouTube API ---
  const tags = [
    'Tamil Nadu', 'TN News', 'VizhiTN', 'Civic Issues Tamil', districtLabel,
    dept, 'Tamil Nadu Government', 'Local Body News', 'Tamil Nadu Today',
    ...(tier2.map(h => h.replace('#', ''))),
    isShort ? 'Shorts' : 'Tamil Documentary'
  ].filter(Boolean).slice(0, 15);

  // --- Description ---
  let defaultChapters = chapterTimestamps;
  if (!isShort && (!defaultChapters || defaultChapters.length === 0)) {
    defaultChapters = [
      '0:00 கள ஆய்வு அறிமுகம் (Introduction)',
      '1:15 அரசு ஆணை & பின்னணி (Background & Official Orders)',
      '2:45 பாதிக்கப்பட்ட மக்கள் & கள நிலவரம் (Ground Reality)',
      '4:30 துறைசார் அதிகாரிகள் பதில் (Department Response)',
      '6:10 அதிகாரப்பூர்வ தீர்வு & உதவி எண் (Action Steps & Helplines)'
    ];
  }

  const chaptersBlock = defaultChapters.length > 0
    ? `\n📌 அத்தியாயங்கள் / Chapters:\n${defaultChapters.join('\n')}\n`
    : '';

  const aiDisclosure = `\nℹ️ YouTube Disclosure: This video combines automated public domain archival footage, data visualization, and synthetic voice technology to provide citizen awareness.\n`;

  const description = isShort
    ? `⚡ ${titleTa}\n\n` +
      `📍 மாவட்டம்: ${districtLabel} | 🏛️ துறை: ${dept} | 📞 அதிகாரப்பூர்வ உதவி: ${helpline}\n\n` +
      `📝 கள விவரங்கள்:\n${article.content_ta || article.content_en || article.summary_ta || titleTa}\n\n` +
      `📌 பொது மக்கள் கவனத்திற்கு:\n` +
      `உங்கள் பகுதியில் இந்த சேவை பாதிப்பு அல்லது பிரச்சனை ஏற்பட்டால் உடனடியாக மேலே உள்ள அதிகாரப்பூர்வ உதவி எண்ணை தொடர்பு கொண்டு புகார் பதிவு செய்யுங்கள்.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔴 உங்கள் ஏரியாவிலும் இந்த பிரச்சனை உள்ளதா?\n` +
      `தமிழ்நாடு முழுவதும் நடக்கும் நேரடி கள நிகழ்வுகள், மின் தடை மற்றும் அரசு அறிவிப்புகளை உடனே தெரிந்துகொள்ள vizhitn.in-ஐ பார்வையிடுங்கள்.\n` +
      `📲 YouTube App-ல் சப்ஸ்கிரைப் செய்ய: https://vizhitn.in/r/yt\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔎 முக்கிய தேடல் சொற்கள் (Search Terms): ${districtLabel} news today, ${category} Tamil Nadu, TN government announcements, ${dept} update, civic alert Tamil, vizhitn\n` +
      aiDisclosure + '\n' +
      hashtags
    : `🔍 ${titleTa} — முழு கள ஆய்வு மற்றும் அரசு ஆவணங்கள் விவரம்!\n\n` +
      `வழங்குபவர்: கவிதா (VizhiTN புலனாய்வு செய்தியாளர்)\n\n` +
      `📝 முழுமையான பின்னணி & கள விசாரணை:\n` +
      `${article.summary_ta || article.summary_en || article.content_ta?.slice(0, 500) || ''}\n` +
      chaptersBlock +
      `\n🏛️ பொறுப்புத் துறை: ${dept}\n` +
      `📞 அரசு அவசர உதவி மையம்: ${helpline}\n` +
      `🌐 அதிகாரப்பூர்வ போர்டல்: https://vizhitn.in/tn-today/${article.slug || ''}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔴 உங்க ஏரியால பிரச்சனை இருக்கா?\n` +
      `vizhitn.in-ல் நீங்களே நேரடியாக களப் புகாரை பதிவு செய்யலாம். உங்கள் ஒரு பதிவு உங்கள் பகுதியில் உள்ள ஆயிரக்கணக்கான மக்களுக்கு விழிப்புணர்வை தரும்.\n` +
      `📲 YouTube App-ல் தொடர: https://vizhitn.in/r/yt\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔎 Search Tags: Tamil Nadu investigative report, ${districtLabel} civic issues, ${dept} news, Tamil documentary, vizhitn news\n` +
      aiDisclosure + '\n' +
      hashtags;

  // Discussion firestarter pinned comment tailored by category
  let debatePrompt = `💬 உங்கள் பகுதியிலும் இந்த பிரச்சனை உள்ளதா? அல்லது அரசு அதிகாரிகள் நடவடிக்கை எடுத்துள்ளார்களா? கீழே கமெண்ட் செய்யுங்கள்! 👇`;
  if (category === 'electricity') {
    debatePrompt = `💬 உங்கள் பகுதியில் அடிக்கடி மின்தடை அல்லது வோல்டேஜ் பிரச்சனை இருக்கிறதா? உங்கள் ஊர் மற்றும் தெரு பெயரை கீழே கமெண்ட் செய்யுங்கள்! 👇`;
  } else if (category === 'water-sanitation') {
    debatePrompt = `💬 உங்கள் ஏரியாவில் குடிநீர் சப்ளை சீராக வருகிறதா? உங்கள் பகுதி நிலவரத்தை கீழே கமெண்ட் செய்யுங்கள்! 👇`;
  } else if (category === 'transport' || category === 'road-infrastructure') {
    debatePrompt = `💬 உங்கள் பகுதியில் இந்த சாலை அல்லது போக்குவரத்து பிரச்சனை எத்தனை நாட்களாக உள்ளது? உங்கள் அனுபவத்தை கீழே பகிருங்கள்! 👇`;
  }

  const pinnedComment = `${debatePrompt}\n\n` +
    `📌 உங்கள் பகுதி மக்களுக்கு உதவ உடனே Share செய்யுங்கள் ↗️\n` +
    `🔴 நேரடி கள புகாரை நீங்களே பதிவு செய்ய: https://vizhitn.in`;

  return { title, description, tags, hashtags, pinnedComment };
}

/**
 * Generates a production-grade 5-Act investigative documentary script
 * Narrator persona: "Kavitha" — civic journalist, warm, direct, colloquial Tamil
 * Target length: 6–8 minutes (minimum 46 narrationClauses across 5 Acts)
 *
 * @param {Object} article - Supabase tn_today article record
 * @returns {Promise<Object>} Structured documentary script with 5 chapters
 */
export async function generateDocumentaryScript(article) {
  // Exclusively use dedicated key for YouTube video content creation
  const apiKey = process.env.YOUTUBE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing YOUTUBE_GEMINI_API_KEY in environment. Set YOUTUBE_GEMINI_API_KEY in .env.local');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are "Kavitha" — a 28-year-old Tamil Nadu civic investigative journalist from Madurai who works in Chennai.
You write and narrate for "VizhiTN", Tamil Nadu's most trusted hyperlocal civic accountability channel.
Your style: Direct, warm, slightly sarcastic about government failures, passionate about citizen rights.
You speak colloquial Chennai Tamil (பேச்சுத் தமிழ்) with natural English code-switching.
You NEVER talk down to the audience. You treat every viewer as an intelligent adult who deserves straight answers.

Think of channels like Dhruv Rathee, Vox, and Madras Decoded — but for Tamil Nadu's streets and civic reality.

━━━━━━━━━━━━━━━━━━━━━
ARTICLE CONTEXT:
━━━━━━━━━━━━━━━━━━━━━
- Title (English): ${article.title_en || article.title}
- Title (Tamil): ${article.title_ta || ''}
- Category: ${article.category_slug || 'Infrastructure & Governance'}
- District / Area: ${article.district_focus || 'Tamil Nadu'}
- Department: ${article.department_name || 'Tamil Nadu Government'}
- Helpline: ${article.helpline || '1100 / 1912'}
- Summary: ${article.summary_ta || article.summary_en || ''}
- Full Content: ${(article.content_ta || article.content_en || '').slice(0, 4000)}

━━━━━━━━━━━━━━━━━━━━━
NARRATIVE STRUCTURE — MANDATORY:
━━━━━━━━━━━━━━━━━━━━━
Every script MUST follow the Villain → Victim → Revelation → Tool → Power arc:
1. VILLAIN: The broken system, negligent department, delayed project, unfair law
2. VICTIM: Named citizen, named area, named street — real, specific, not generic
3. REVELATION: The one thing most people don't know yet
4. TOOL: vizhitn.in, official helpline, RTI, government scheme the viewer can use TODAY
5. POWER: The viewer becomes the agent of change — not us, not the government, THEM

━━━━━━━━━━━━━━━━━━━━━
STRICT SCRIPTWRITING RULES:
━━━━━━━━━━━━━━━━━━━━━
1. TONE: Natural பேச்சுத் தமிழ். Phrases like "கவனிச்சுப் பாருங்க", "ஆனா கள நிலவரம் என்ன", "யோசிச்சுப் பாருங்க", "நேர்மையா சொல்லணும்னா".
2. NUMBERS & HELPLINES: Write all helpline numbers and numerical statistics as clean numeric digits (e.g. 1912, 1913, 1100, 1930, 1064, 103, 100). NEVER spell them out in Tamil words (never write "ஒன்று ஒன்பது ஒன்று இரண்டு"). The neural voice engine speaks numeric digits naturally, and video captions render crisp, high-contrast numbers on screen.
3. SPECIFICITY: Include REAL street names, landmark junctions, budget figures in Crores, exact travel times, station names. NEVER generic vague descriptions.
4. HOOK: Act 1 must START with the PROBLEM, not "ஹலோ மக்களே". First 2 sentences must contain the VILLAIN and VICTIM.
5. OUTRO (Act 5): Do NOT say "share this video", "subscribe now", or "send us your problem". Instead empower:
   "உங்க ஏரியாவில் நடக்கிற எந்த ஒரு பிரச்சனையாக இருந்தாலும் — road, குடிநீர், power cut, எதுவா இருந்தாலும் — vizhitn.in website-ல நீங்களே நேரடியா photo-வோட post பண்ணுங்க. உங்க ஒரு post உங்க பக்கத்துல இருக்கிற 1000 பேரை protect பண்ணும்."
6. LENGTH: The total narration across ALL 5 Acts MUST be 700–950 spoken Tamil words (6–8 minutes at 120 wpm).
7. ENGLISH LOANWORDS (CRITICAL FOR NEURAL VOICE QUALITY):
   The neural voice engine stumbles on clumsy Grantha transliterations (like ஹவுஸ் or டிராபிக்).
   Write common everyday English words in standard English script:
   - house (NOT ஹவுஸ்)
   - traffic (NOT டிராபிக்)
   - road (NOT ரோடு)
   - complaint (NOT கம்ப்ளைன்ட்)
   - police / police station (NOT போலீஸ் / போலீஸ் ஸ்டேஷன்)
   - power cut / current (NOT மின்தடை or கரண்ட் கட்)
   - substation / transformer / meter (NOT சப்ஸ்டேஷன் / டிரான்ஸ்பார்மர் / மீட்டர்)
   - collector / office / officer / inspector (NOT கலெக்டர் / ஆபீஸ் / ஆபீசர் / இன்ஸ்பெக்டர்)
   - budget / tender / contractor (NOT பட்ஜெட் / டெண்டர் / கான்ட்ராக்டர்)
   - notice / rules / agreement (NOT நோட்டீஸ் / ரூல்ஸ் / அக்ரிமென்ட்)
   - helpline / app / portal / website / link (NOT ஹெல்ப்லைன் / ஆப் / போர்டல் / வெப்சைட்)
   - hospital / school / college (NOT ஹாஸ்பிடல் / ஸ்கூல் / காலேஜ்)
   Example: "உங்க house பக்கத்துல traffic பிரச்சனை இருந்தா police station-ல complaint பண்ணுங்க."
8. DO NOT NUMBER narrationClauses. NEVER write "1. ", "2. ", "1) ", or bullet points. Each entry in the narrationClauses array MUST be a pure, standalone conversational spoken sentence.
9. REAL TAMIL WORDS & ACCURATE GRAMMAR: Always write proper Tamil spelling (e.g. "எதிர்காலத்துக்கு", NOT "எதிர்காலத்தக்கு"; "திட்டத்துக்கு", NOT "திட்டத்தக்கு"). Keep numbers as clean digits (1912, 1100).

━━━━━━━━━━━━━━━━━━━━━
CRITICAL CLAUSE REQUIREMENT — DO NOT IGNORE:
━━━━━━━━━━━━━━━━━━━━━
Each Act MUST have the following MINIMUM narrationClauses:
- Act 1 (Hook & Shock): MINIMUM 8 clauses
- Act 2 (Ground Reality): MINIMUM 12 clauses  
- Act 3 (System Failure): MINIMUM 10 clauses
- Act 4 (Rights & Tools): MINIMUM 10 clauses
- Act 5 (Power Outro): MINIMUM 6 clauses
TOTAL: 46 clauses minimum. Each clause = 1 sentence of 4–6 seconds spoken Tamil.
If you generate fewer than 40 total clauses across all Acts, you have FAILED this task. Count them.

━━━━━━━━━━━━━━━━━━━━━
5-ACT STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━
ACT 1 — THE VILLAIN REVEALED (0:00–1:15): Open with the problem hitting the viewer in the face. Who is suffering, where, right now. The villain is the system. NOT "ஹலோ மக்களே" — open with the civic pain point immediately.
ACT 2 — GROUND REALITY DEEP DIVE (1:15–3:00): Real data, real streets, real affected areas, real numbers. What the department said vs what citizens are actually experiencing.
ACT 3 — WHY THIS KEEPS HAPPENING (3:00–4:30): The systemic failure. Budget allocation problems, contractor delays, lack of accountability, RTI findings, inter-department blame.
ACT 4 — WHAT YOU CAN DO (4:30–6:00): Concrete citizen action. Specific helpline numbers spoken naturally once. RTI process. vizhitn.in citizen reporting. Government scheme if applicable.
ACT 5 — CIVIC EMPOWERMENT OUTRO (6:00–7:30): Resolution, if any. The power is with citizens. vizhitn.in CTA. No "subscribe" or "share" begging.

━━━━━━━━━━━━━━━━━━━━━
OUTPUT JSON FORMAT (respond ONLY with valid JSON, no markdown):
━━━━━━━━━━━━━━━━━━━━━
{
  "youtubeTitle": "Compelling bilingual title under 90 characters mixing Tamil + English",
  "thumbnailHookTa": "3–5 word Tamil curiosity hook for 16:9 thumbnail (e.g. யாரும் சொல்லாத உண்மை)",
  "chapters": [
    {
      "chapterNum": "01 / 05",
      "headlineTa": "4–7 word Tamil Act headline",
      "headlineEn": "Short English sub-headline",
      "narrationClauses": [
        "Clause 1 in conversational spoken Tamil...",
        "Clause 2...",
        "Clause 3...",
        "Clause 4...",
        "Clause 5...",
        "Clause 6...",
        "Clause 7...",
        "Clause 8..."
      ],
      "facts": [
        "Hard fact with number/figure...",
        "Ground impact with street/area name...",
        "Official data or RTI finding..."
      ]
    }
  ]
}
`;

  let rawText = null;
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[SCRIPTWRITER] Calling ${modelName} — generating Kavitha's 5-Act investigative script...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.75,
          maxOutputTokens: 8192
        }
      });

      rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (rawText && rawText.trim().length > 200) {
        console.log(`[SCRIPTWRITER ✓] Script synthesized with ${modelName}`);
        break;
      }
    } catch (err) {
      console.log(`[SCRIPTWRITER NOTICE] ${modelName} fallback: ${err.message}. Trying next model...`);
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error('All Gemini models failed to generate the documentary script.');
  }

  let script;
  try {
    script = JSON.parse(rawText);
  } catch {
    // Strip markdown code fences if model wrapped in ```json
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    script = JSON.parse(cleaned);
  }

  // Validate clause counts and warn if under-generated
  if (script.chapters && Array.isArray(script.chapters)) {
    let totalClauses = 0;
    script.chapters.forEach((ch, i) => {
      if (ch.narrationClauses && Array.isArray(ch.narrationClauses)) {
        totalClauses += ch.narrationClauses.length;
        // Apply phonetics normalization & sanitize leading numbers/bullets/typos
        ch.narrationClauses = ch.narrationClauses
          .map(c => sanitizeClauseText(normalizeAcronymsToSpokenTamil(c)))
          .filter(Boolean);
      }
    });
    console.log(`[SCRIPTWRITER] Total narrationClauses: ${totalClauses} | Target: 46+`);
    if (totalClauses < 40) {
      console.log(`[SCRIPTWRITER NOTICE] Under-generated: ${totalClauses} clauses. Video will be shorter than 6 minutes.`);
    }
  }

  console.log(`[SCRIPTWRITER] Generated ${script.chapters?.length || 0} Acts for documentary.`);
  return script;
}
