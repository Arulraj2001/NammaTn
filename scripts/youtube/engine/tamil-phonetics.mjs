// scripts/youtube/engine/tamil-phonetics.mjs
// Converts formal/technical Tamil, English acronyms, numbers, and helplines
// into warm, natural, colloquial spoken Tamil (பேச்சுத் தமிழ்) for viral retention.
// Includes everyday citizen legal and practical dispute guides.

/**
 * Normalizes English government acronyms, dispute terms, and department codes into spoken Tamil
 */
export function normalizeAcronymsToSpokenTamil(text) {
  if (!text) return '';

  const replacements = [
    // Government Departments & Utilities (Spoken Tanglish friendly)
    { regex: /\bTANGEDCO\b/gi, replacement: 'EB மின்வாரியம்' },
    { regex: /\bEB\b/gi, replacement: 'EB' },
    { regex: /\bCMRL\b/gi, replacement: 'Chennai Metro' },
    { regex: /\bMetro\b/gi, replacement: 'Metro' },
    { regex: /\bMTC\b/gi, replacement: 'MTC bus' },
    { regex: /\bSETC\b/gi, replacement: 'SETC bus' },
    { regex: /\bTWAD\b/gi, replacement: 'TWAD குடிநீர் வாரியம்' },
    { regex: /\bCMWSSB\b/gi, replacement: 'Metro Water' },
    { regex: /\bMetrowater\b/gi, replacement: 'Metro Water' },
    { regex: /\bGCC\b/gi, replacement: 'Chennai Corporation' },
    { regex: /\bCorporation\b/gi, replacement: 'corporation' },
    { regex: /\bNHAI\b/gi, replacement: 'NHAI நெடுஞ்சாலை' },
    { regex: /\bMinnalagam\b/gi, replacement: 'மின்னகம் Helpline' },
    { regex: /\bRTO\b/gi, replacement: 'RTO office' },
    { regex: /\bVAO\b/gi, replacement: 'VAO office' },

    // Everyday Legal & Dispute Terms
    { regex: /\bCSR\b/gi, replacement: 'CSR receipt' },
    { regex: /\bFIR\b/gi, replacement: 'FIR' },
    { regex: /\bTNRRRL\b/gi, replacement: 'தமிழ்நாடு வாடகைதாரர் சட்டம்' },
    { regex: /\bAdvance\b/gi, replacement: 'advance பணம்' },
    { regex: /\bPatta\b/gi, replacement: 'பட்டா' },
    { regex: /\bChitta\b/gi, replacement: 'சிட்டா' },
    { regex: /\bDigiLocker\b/gi, replacement: 'DigiLocker app' },

    // ── Grantha & Clumsy Tamil Transliterations → Crisp English Words ──
    // Eliminates TTS stutters on "ஹ" (ha), "டிரா" (tra), "ப்ளை" (plai), etc.
    { regex: /ஹவுஸ்|ஹவுசு/g, replacement: 'house' },
    { regex: /டிராபிக்/g, replacement: 'traffic' },
    { regex: /ரோடு|ரோட்டு/g, replacement: 'road' },
    { regex: /கம்ப்ளைன்ட்|கம்ப்ளையிண்ட்|கம்ப்ளைண்ட்/g, replacement: 'complaint' },
    { regex: /போலீஸ்\s*ஸ்டேஷன்/g, replacement: 'police station' },
    { regex: /போலீஸ்|போலீசு/g, replacement: 'police' },
    { regex: /கலெக்டர்/g, replacement: 'collector' },
    { regex: /சப்ஸ்டேஷன்/g, replacement: 'substation' },
    { regex: /டிரான்ஸ்பார்மர்/g, replacement: 'transformer' },
    { regex: /முனிசிபாலிட்டி/g, replacement: 'municipality' },
    { regex: /கார்ப்பரேஷன்/g, replacement: 'corporation' },
    { regex: /ஹெல்ப்லைன்/g, replacement: 'helpline' },
    { regex: /அப்டேட்ஸ்/g, replacement: 'updates' },
    { regex: /அப்டேட்/g, replacement: 'update' },
    { regex: /நோட்டீஸ்/g, replacement: 'notice' },
    { regex: /கான்ட்ராக்டர்/g, replacement: 'contractor' },
    { regex: /டெண்டர்/g, replacement: 'tender' },
    { regex: /பட்ஜெட்/g, replacement: 'budget' },
    { regex: /மீட்டர்/g, replacement: 'meter' },
    { regex: /லைசன்ஸ்/g, replacement: 'license' },
    { regex: /செக்\s*போஸ்ட்/g, replacement: 'check post' },
    { regex: /ஆபீஸ்|ஆபீசு/g, replacement: 'office' },
    { regex: /ஆபீசர்/g, replacement: 'officer' },
    { regex: /இன்ஸ்பெக்டர்/g, replacement: 'inspector' },
    { regex: /லைன்மேன்/g, replacement: 'linesman' },
    { regex: /சீட்டிங்/g, replacement: 'cheating' },
    { regex: /மெசேஜ்/g, replacement: 'message' },
    { regex: /லிங்க்/g, replacement: 'link' },
    { regex: /வீடியோ/g, replacement: 'video' },
    { regex: /போஸ்ட்/g, replacement: 'post' },
    { regex: /ஷார்ட்ஸ்/g, replacement: 'Shorts' },
    { regex: /கரண்ட்\s*கட்|பவர்கட்/g, replacement: 'power cut' },
    { regex: /பைப்லைன்/g, replacement: 'pipeline' },
    { regex: /டிரைனேஜ்/g, replacement: 'drainage' },
    { regex: /பிளாட்பார்ம்/g, replacement: 'platform' },
    { regex: /சார்ஜ்/g, replacement: 'charge' },
    { regex: /லேப்டாப்/g, replacement: 'laptop' },
    { regex: /அக்ரிமென்ட்/g, replacement: 'agreement' },
    { regex: /ரூல்ஸ்/g, replacement: 'rules' },
    { regex: /டாக்குமென்ட்/g, replacement: 'document' },
    { regex: /ஸ்கிரீன்ஷாட்/g, replacement: 'screenshot' },
    { regex: /வாட்ஸ்அப்/g, replacement: 'WhatsApp' },
    { regex: /ஸ்டெப்\s*1/g, replacement: 'Step 1' },
    { regex: /ஸ்டெப்\s*2/g, replacement: 'Step 2' },
    { regex: /ஸ்டெப்\s*3/g, replacement: 'Step 3' },
    { regex: /ஸ்டெப்/g, replacement: 'step' },

    // English Words -> Clean Spoken Form
    { regex: /\bPower Cut\b/gi, replacement: 'power cut' },
    { regex: /\bShutdown\b/gi, replacement: 'power cut' },
    { regex: /\bMaintenance\b/gi, replacement: 'maintenance' },
    { regex: /\bUpdate\b/gi, replacement: 'update' },
    { regex: /\bUpdates\b/gi, replacement: 'updates' },
    { regex: /\bAlert\b/gi, replacement: 'alert' },
    { regex: /\bComplaint\b/gi, replacement: 'complaint' },
    { regex: /\bPortal\b/gi, replacement: 'portal' },
    { regex: /\bWebsite\b/gi, replacement: 'website' },
    { regex: /\bHelpline\b/gi, replacement: 'helpline' },
    { regex: /\bvizhitn\.in\b/gi, replacement: 'விழி டிஎன் டாட் இன்' },
    { regex: /VizhiTN-ஐ|VizhiTN-யை/gi, replacement: 'விழி டிஎன்-ஐ' },
    { regex: /\bVizhiTN\b/gi, replacement: 'விழி டிஎன்' }
  ];

  let result = text;
  for (const item of replacements) {
    result = result.replace(item.regex, item.replacement);
  }

  result = result.replace(/(\d{1,2}):?00?\s*AM\s*(?:to|-)\s*(\d{1,2}):?00?\s*PM/gi, 'காலை $1 மணில இருந்து மதியம் $2 மணி வரைக்கும்');
  result = result.replace(/(\d{1,2}):?00?\s*AM/gi, 'காலை $1 மணிக்கு');
  result = result.replace(/(\d{1,2}):?00?\s*PM/gi, 'மதியம் $1 மணிக்கு');

  return result;
}

/**
 * Splits text into 2 to 4-word spoken micro-clauses based on punctuation and natural breathing pauses.
 * Essential for millisecond-accurate audio/caption synchronization.
 *
 * @param {string} text - Raw narration text
 * @param {number} [maxWords=4] - Max words per audio micro-chunk
 * @returns {string[]} Array of short clauses
 */
export function splitIntoSpokenClauses(text, maxWords = 4) {
  if (!text) return [];
  const clean = text.replace(/\s+/g, ' ').trim();
  // Split on punctuation (. ! ? , ; : ... or danda)
  const rawSegments = clean.split(/(?<=[.!?।,\;:\-])\s+|(?<=\.\.\.)\s+/);

  const clauses = [];
  let current = '';

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    const words = trimmed.split(/\s+/).filter(Boolean);
    // If this segment has more than maxWords, break it into maxWords chunks
    if (words.length > maxWords) {
      if (current) {
        clauses.push(current);
        current = '';
      }
      for (let i = 0; i < words.length; i += maxWords) {
        clauses.push(words.slice(i, i + maxWords).join(' '));
      }
      continue;
    }

    const combined = (current + ' ' + trimmed).trim();
    const wordCount = combined.split(/\s+/).length;
    if (wordCount <= maxWords) {
      current = combined;
    } else {
      if (current) clauses.push(current);
      current = trimmed;
    }
  }

  if (current) clauses.push(current);
  return clauses.map(c => c.trim()).filter(Boolean);
}

/**
 * Cleans narration clause text:
 * 1. Strips leading numbers, bullets, list markers (e.g. "1. ", "2) ", "2 ", "- ", "* ")
 * 2. Strips trailing punctuation (commas, semicolons)
 * 3. Corrects common grammatical/typographical errors in generated Tamil
 */
export function sanitizeClauseText(text) {
  if (!text) return '';
  let cleaned = String(text).trim();

  // Strip leading numbering or bullet prefixes: "1. ", "2) ", "2 ", "- ", "* ", "• ", "# "
  cleaned = cleaned.replace(/^[\s\d\.\)\:\-\*\•\–\—]+(?=[^\d\s\.\)\:\-\*\•\–\—])/g, '').trim();
  cleaned = cleaned.replace(/^\d+\s+/g, '').trim();

  // Strip trailing punctuation
  cleaned = cleaned.replace(/[,;:\s]+$/g, '').trim();

  // Fix common spelling / grammatical slips
  cleaned = cleaned.replace(/எதிர்காலத்தக்கு/g, 'எதிர்காலத்துக்கு');
  cleaned = cleaned.replace(/திட்டத்தக்கு/g, 'திட்டத்துக்கு');
  cleaned = cleaned.replace(/பகுதியிலயும்/g, 'பகுதியிலும்');

  return cleaned;
}

/**
 * Curated Repository of High-Impact Everyday Citizen Disputes & Solutions
 */
export const CITIZEN_DISPUTE_TOPICS = [
  {
    id: 'tenant-advance-dispute',
    titleTa: 'வீட்டு அட்வான்ஸ் பணத்தை ஓனர் தர மறுத்தால் என்ன செய்யணும்?',
    titleEn: 'Landlord refusing to return rental advance money: Step-by-step solution',
    seoTitleBilingual: 'Landlord Advance Return Law | வாடகை அட்வான்ஸ் பிரச்சனைக்கு தீர்வு! #Shorts #VizhiTN',
    category: 'வாடகை உரிமைகள்',
    hookTa: 'வீட்டை காலி பண்ணும்போது ஓனர் அட்வான்ஸ் பணத்தை தர மாட்றாரா? இந்த மூணு வழிய ஃபாலோ பண்ணுங்க!',
    step1Behave: 'முதல்ல கோபப்பட்டு சண்டை போடாதீங்க. காலி பண்றதுக்கு 30 நாள் முன்னாடியே வாட்ஸ்அப் அல்லது ஈமெயில்ல எழுத்துப்பூர்வமா நோட்டீஸ் அனுப்புங்க.',
    step2Evidence: 'வீட்டை காலி பண்ணும்போது வீட்டின் நிலையை தெளிவா வீடியோ எடுத்து வெச்சுக்கோங்க. கரண்ட் பில் மற்றும் வாடகை ரசீதுகளை பத்திரமா வையுங்க.',
    step3Legal: 'அப்படியும் தரலைனா தமிழ்நாடு வாடகைதாரர் சட்டம் 2019 படி ரென்ட் கோர்ட்ல ஆன்லைன்ல மனு தாக்கல் பண்ணலாம். தேவைப்பட்டா போலீஸ்ல பிரிவு 406 நம்பிக்கை மோசடி புகார் தரலாம்.',
    helplineText: 'முதல்வர் உதவி மையம் 1100 மற்றும் சட்ட உதவி மையம்',
    keywords: ['landlord advance problem tamil', 'rental advance dispute legal rules', 'tn rent court chennai', 'vadagai advance thara marukirar', 'vizhitn', 'citizen rights tamil', 'house rent agreement rules tamil nadu'],
    hashtags: ['#TamilShorts', '#VizhiTN', '#CitizenRightsTamil', '#TenantRights', '#RentalAdvance', '#TamilNadu', '#LawTamil', '#Shorts']
  },
  {
    id: 'traffic-police-key-snatch',
    titleTa: 'டிராபிக் போலீஸ் வண்டி சாவியை பிடுங்கினா என்ன சட்டம் சொல்லுது?',
    titleEn: 'Can Traffic Police snatch your bike vehicle keys? Your legal rights',
    seoTitleBilingual: 'Traffic Police Bike Key Rule | டிராபிக் போலீஸ் சாவி பிடுங்கலாமா? #Shorts #VizhiTN',
    category: 'மோட்டார் வாகன சட்டம்',
    hookTa: 'வண்டியில போகும்போது டிராபிக் போலீஸ் உங்க சாவியை பிடுங்குறாங்களா? சட்டப்படி இது செல்லுமா?',
    step1Behave: 'பதட்டப்படாம அமைதியா பேசுங்க. சட்டம் மற்றும் டிஜிபி உத்தரவுப்படி எந்த போலீஸும் உங்க வண்டி சாவியை பிடுங்கவோ, உங்களை தாக்கவோ உரிமை இல்லை.',
    step2Evidence: 'ஒரிஜினல் ஆர்சி புக் இல்லைனாலும், டிஜிலாக்கர் ஆப்ல இருக்கிற ஆவணங்களை காட்டினாலே 100 சதவீதம் செல்லும். அபராதத்தை ஆன்லைன்ல மட்டுமே செலுத்துங்க.',
    step3Legal: 'அத்துமீறி மிரட்டினா டிராபிக் கண்ட்ரோல் ரூம் எண் 103-க்கு போன் பண்ணி போலீஸ் அதிகாரியின் பேட்ஜ் நம்பரை சொல்லி புகார் பண்ணலாம்.',
    helplineText: 'போக்குவரத்து உதவி எண்: 103 | காவல்துறை புகார்',
    keywords: ['traffic police bike key snatch tamil', 'motor vehicle act rules tamil nadu', 'can police take bike keys', 'traffic challan dispute tamil', 'digilocker valid for traffic police', 'vizhitn', 'tamil nadu police rules'],
    hashtags: ['#TrafficRules', '#TrafficPoliceTamil', '#MotorVehicleAct', '#VizhiTN', '#TamilShorts', '#CitizenRightsTamil', '#Shorts']
  },
  {
    id: 'patta-transfer-delay',
    titleTa: 'பட்டா மாறுதல் ஆன்லைனில் தாமதமானால் யாருக்கு புகார் செய்யணும்?',
    titleEn: 'Patta transfer delayed at Taluk Office? Legal escalation steps',
    seoTitleBilingual: 'Taluk Office Patta Transfer Delay | பட்டா பெயர் மாற்றம் தாமதம் தீர்வு! #Shorts #VizhiTN',
    category: 'அரசு சேவைகள்',
    hookTa: 'விஏஓ அல்லது தாலுகா ஆபீஸ்ல பட்டா பெயர் மாற்ற தாமதம் பண்றாங்களா? சட்டப்படி என்ன தீர்வு?',
    step1Behave: 'முதல்ல e-Sevai மையம் வழியா பட்டா மாறுதலுக்கு ஆன்லைன்ல விண்ணப்பிச்சு அப்ளிகேஷன் நம்பர் வாங்கி வெச்சுக்கோங்க.',
    step2Evidence: 'விண்ணப்பித்து 15 நாட்களுக்கு மேல் ஆகியும் காரணமில்லாம தாமதித்தால், ஆன்லைன் அக்னாலெட்ஜ்மென்ட் காப்பியை எடுத்துக்கோங்க.',
    step3Legal: 'காரணமில்லாம தாமதித்தால் சிஎம் செல் 1100 அல்லது வருவாய் கோட்டாட்சியர் (RDO) அலுவலகத்தில் மேல்முறையீடு செய்யலாம்.',
    helplineText: 'சிஎம் செல் உதவி எண்: 1100 | e-Sevai: 1800 425 6000',
    keywords: ['patta transfer status tamil', 'taluk office patta change delay solution', 'esevai patta transfer status', 'vizhitn', 'revenue department tamil nadu'],
    hashtags: ['#PattaTransfer', '#TalukOffice', '#VizhiTN', '#TamilShorts', '#CitizenRightsTamil', '#Shorts']
  },
  {
    id: 'neighbor-parking-nuisance',
    titleTa: 'அக்கம்பக்கத்தினர் அத்துமீறி பார்க்கிங் தடுத்தால் என்ன வழி?',
    titleEn: 'Neighbor blocking your gate or parking dispute: Legal solution',
    seoTitleBilingual: 'Neighbor Gate Parking Law | கேட் வழிமறித்து பார்க்கிங் செய்தால் சட்டம்! #Shorts #VizhiTN',
    category: 'பொது அமைதி',
    hookTa: 'உங்க வீட்டு கேட்டுக்கு முன்னாடி பக்கத்து வீட்டுக்காரர் வண்டியை நிறுத்தி தொந்தரவு பண்றாரா? இப்படி பண்ணுங்க!',
    step1Behave: 'முதல்ல நேரடியா பேசி சுமுகமா முடிக்க பாருங்க. அப்பார்ட்மென்ட் அல்லது தெரு நலச்சங்க நிர்வாகிகளிடம் ஒரு வார்த்தை சொல்லி வைங்க.',
    step2Evidence: 'தொடர்ந்து வழிமறித்தால் கேட்டுக்கு முன்னாடி நிக்கிற வண்டியை தேதி மற்றும் நேரத்தோடு போட்டோ மற்றும் வீடியோ எடுத்து வெச்சுக்கோங்க.',
    step3Legal: 'பொதுவழி மறிப்பு என்பது சட்டப்படி குற்றம். மாநகராட்சி கட்டுப்பாட்டு அறை 1913 அல்லது உள்ளூர் காவல் நிலையத்தில் பிரிவு 133 பொது தொல்லை கீழ் சிஎஸ்ஆர் ரசீது பெற்று புகார் தரலாம்.',
    helplineText: 'மாநகராட்சி: 1913 | அவசர உதவி: 100 / 112',
    keywords: ['neighbor parking blocking gate tamil', 'public nuisance section 133 crpc', 'chennai corporation parking complaint 1913', 'apartment parking dispute solution', 'vizhitn', 'street parking law tamil nadu'],
    hashtags: ['#ParkingDispute', '#PublicNuisance', '#Corporation1913', '#VizhiTN', '#TamilShorts', '#CitizenRightsTamil', '#Shorts']
  },
  {
    id: 'fake-loan-app-threat',
    titleTa: 'ஆன்லைன் லோன் ஆப் மிரட்டல் வந்தால் உடனே என்ன செய்யணும்?',
    titleEn: 'Harassed by online loan recovery agents? Immediate Golden Hour steps',
    seoTitleBilingual: 'Fake Loan App Threat Solution | போலி லோன் ஆப் மிரட்டலா? உடனடி தீர்வு! #Shorts #VizhiTN',
    category: 'சைபர் பாதுகாப்பு',
    hookTa: 'லோன் ஆப் மூலமா மிரட்டி வாட்ஸ்அப்ல மார்ஃபிங் போட்டோ அனுப்புறாங்களா? ஒரு பைசா கூட கட்டாதீங்க!',
    step1Behave: 'பயந்து போய் அவங்க கேக்குற பணத்தை கட்டாதீங்க. முதல்ல அந்த ஆப்பை அன்-இன்ஸ்டால் பண்ணிட்டு, உங்க போன் காண்டாக்ட் பெர்மிஷனை ஆப் பண்ணுங்க.',
    step2Evidence: 'அவங்க அனுப்புற மிரட்டல் மெசேஜ்கள், போன் நம்பர்கள், மற்றும் வங்கி பரிவர்த்தனை விவரங்களை ஸ்கிரீன்ஷாட் எடுத்து ஆதாரமா வையுங்க.',
    step3Legal: 'உடனே தேசிய சைபர் கிரைம் உதவி எண் 1930-க்கு போன் பண்ணுங்க. அல்லது cybercrime.gov.in-ல புகார் பதிவு பண்ணா அந்த போலி வங்கி கணக்குகள் முடக்கப்படும்.',
    helplineText: 'தேசிய சைபர் கிரைம் உதவி எண்: 1930 (24x7)',
    keywords: ['fake loan app blackmail solution tamil', 'cyber crime helpline 1930 chennai', 'loan recovery harassment police complaint', 'whatsapp morphing photo threat solution', 'vizhitn', 'cyber safety tamil nadu'],
    hashtags: ['#CyberCrime1930', '#LoanAppScam', '#CyberSecurityTamil', '#VizhiTN', '#TamilShorts', '#CitizenRightsTamil', '#Shorts']
  }
];

/**
 * Generates an ultra-engaging, spoken conversational script for Daily Civic Shorts
 */
export function createConversationalShortsScript(posts, districtName = 'தமிழ்நாடு') {
  const parts = [];

  const hookVariations = [
    `ஹலோ மக்களே! இன்னைக்கு உங்க ஏரியால கரண்ட் கட் மற்றும் முக்கிய நிர்வாக அப்டேட்ஸ் இருக்கான்னு நோட் பண்ணிக்கோங்க!`,
    `ஹலோ மக்களே! நீங்க தெரிஞ்சுக்க வேண்டிய மூன்று முக்கியமான மாவட்ட நிர்வாக அப்டேட்ஸ் இதோ!`,
    `நோட் பண்ணி வெச்சுக்கோங்க மக்களே! இன்னைக்கு உங்க பகுதியில இந்த முக்கிய வேலைகள் நடக்குது!`
  ];
  const hook = hookVariations[Math.floor(Math.random() * hookVariations.length)];
  parts.push(hook);

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

  parts.push(`மின் தடை புகார்களுக்கு 1912 எண்ணையும், மாநகராட்சி புகார்களுக்கு 1913 எண்ணையும் தொடர்பு கொள்ளலாம்.`);
  parts.push(`உங்க ஏரியாவில நடக்கிற பிரச்சனைகளை vizhitn.in இணையதளத்தில் நீங்களே நேரடியாக பதிவு பண்ணுங்க. உங்க பக்கத்துல என்ன நடக்குதுன்னு ஒட்டுமொத்த தமிழகமும் தெரிஞ்சுக்கட்டும்! விழி தமிழ்நாடு சேனலை மறக்காம சப்ஸ்கிரைப் பண்ணிக்கோங்க மக்களே!`);

  return parts;
}

/**
 * Adds natural urgency rhythm to Tamil TTS text.
 * edge-tts doesn't support full SSML but responds to:
 * - Commas → short pause (~200ms)
 * - Ellipsis → longer pause (~500ms)
 * - Exclamation → rising pitch hint
 * This function inserts strategic commas and punctuation around
 * high-urgency Tamil civic words so the voice slows and stresses them.
 *
 * @param {string} text - Tamil narration text
 * @param {'short'|'long'} [mode='short'] - 'short' for Shorts (more punchy), 'long' for documentary
 * @returns {string} Text with urgency rhythm markers
 */
export function addUrgencyPauses(text, mode = 'short') {
  if (!text) return '';

  // Words that should be preceded by a micro-pause for stress effect
  const urgencyWords = [
    // High-alert civic words
    'அவசரம்', 'அவசர', 'எச்சரிக்கை', 'கவனம்', 'கவனியுங்கள்',
    'உடனடியாக', 'உடனே', 'உஷார்', 'உஷாரா',
    // Action words
    'அழைக்கவும்', 'செய்யுங்கள்', 'பண்ணுங்க', 'பதிவு',
    // Status words
    'நிறுத்தம்', 'தடை', 'மாற்றம்', 'சேதம்', 'கோளாறு',
    // Helpline triggers
    '1912', '1913', '1930', '1100', '1070', '1077', '103',
  ];

  let result = text;

  // Insert a comma-pause before urgency words (edge-tts treats commas as ~200ms pause)
  for (const word of urgencyWords) {
    // Only add comma if not already preceded by punctuation
    const pattern = new RegExp(`([^,\\.!?\\s])\\s+(${word})`, 'g');
    result = result.replace(pattern, `$1, $2`);
  }

  if (mode === 'short') {
    // For Shorts: add exclamation stress after key action phrases
    result = result
      .replace(/கவனியுங்கள்([^!])/g, 'கவனியுங்கள்!$1')
      .replace(/உஷாரா இருங்க([^!])/g, 'உஷாரா இருங்க!$1')
      .replace(/உடனே செக் பண்ணுங்க([^!])/g, 'உடனே செக் பண்ணுங்க!$1');
  }

  return result;
}

// ── Tamil to High-Retention Tanglish Caption Converter ────────────────────────

const TANGLISH_VOWELS = {
  '\u0B85': 'A', '\u0B86': 'AA', '\u0B87': 'I', '\u0B88': 'EE',
  '\u0B89': 'U', '\u0B8A': 'OO', '\u0B8E': 'E', '\u0B8F': 'AE',
  '\u0B90': 'AI', '\u0B92': 'O', '\u0B93': 'OA', '\u0B94': 'AU',
  '\u0B83': 'K'
};

const TANGLISH_CONSONANTS = {
  '\u0B95': 'K', '\u0B99': 'NG', '\u0B9A': 'S', '\u0B9E': 'NJ',
  '\u0B9F': 'T', '\u0BA3': 'N', '\u0BA4': 'TH', '\u0BA8': 'N',
  '\u0BA9': 'N', '\u0BAA': 'P', '\u0BAE': 'M', '\u0BAF': 'Y',
  '\u0BB0': 'R', '\u0BB1': 'R', '\u0BB2': 'L', '\u0BB3': 'L',
  '\u0BB4': 'ZH', '\u0BB5': 'V', '\u0B9C': 'J', '\u0BB7': 'SH',
  '\u0BB8': 'S', '\u0BB9': 'H'
};

const TANGLISH_SIGNS = {
  '\u0BBE': 'AA', '\u0BBF': 'I', '\u0BC0': 'EE', '\u0BC1': 'U',
  '\u0BC2': 'OO', '\u0BC6': 'E', '\u0BC7': 'E', '\u0BC8': 'AI',
  '\u0BCA': 'O', '\u0BCB': 'O', '\u0BCC': 'AU'
};

const TANGLISH_VIRAMA = '\u0BCD';

const TANGLISH_DICTIONARY = [
  // Civic & Utilities
  [/EB\s*மின்வாரியம்|மின்வாரியம்/gi, 'EB'],
  [/மின்தடை|பவர்\s*கட்|கரண்ட்\s*கட்/gi, 'POWER CUT'],
  [/மின்சார\s*புகார்களுக்கு/gi, 'POWER COMPLAINTS-KU'],
  [/மின்சார|மின்சாரம்/gi, 'POWER'],
  [/மின்னகம்/gi, 'MINNALAGAM'],
  [/உதவி\s*எண்/gi, 'HELPLINE'],
  [/உதவி\s*மையம்/gi, 'HELPLINE'],
  [/உதவி/gi, 'HELP'],
  [/புகார்களுக்கு/gi, 'COMPLAINTS-KU'],
  [/புகார்/gi, 'COMPLAINT'],
  [/அரசு\s*திட்டம்/gi, 'GOVT SCHEME'],
  [/குடிநீர்/gi, 'DRINKING WATER'],
  [/சாலை/gi, 'ROAD'],
  [/போக்குவரத்து/gi, 'TRAFFIC'],
  [/காவல்துறை/gi, 'POLICE'],
  [/ஆணையம்/gi, 'COMMISSION'],
  [/மாநகராட்சி/gi, 'CORPORATION'],
  [/நகராட்சி/gi, 'MUNICIPALITY'],

  // Locations
  [/திருச்சியில/gi, 'TRICHY-LA'],
  [/திருச்சி/gi, 'TRICHY'],
  [/சென்னையில/gi, 'CHENNAI-LA'],
  [/சென்னை/gi, 'CHENNAI'],
  [/கோவையில/gi, 'COIMBATORE-LA'],
  [/கோயம்புத்தூர்|கோவை/gi, 'COIMBATORE'],
  [/மதுரையில/gi, 'MADURAI-LA'],
  [/மதுரை/gi, 'MADURAI'],
  [/சேலத்துல/gi, 'SALEM-LA'],
  [/சேலம்/gi, 'SALEM'],
  [/தமிழ்நாடு/gi, 'TAMIL NADU'],

  // Spoken Vocabulary & Connectors
  [/இருக்கீங்களா/gi, 'IRUKKEENGALA?'],
  [/தெரியுமா/gi, 'THERIYUMA?'],
  [/இன்னைக்கு/gi, 'INNAIKU'],
  [/இன்று/gi, 'INNAIKU'],
  [/நாளைக்கு/gi, 'NAALAIKU'],
  [/நாளை/gi, 'NAALAI'],
  [/நேற்று/gi, 'NETHIKU'],
  [/பகுதிகளில்/gi, 'AREAS-LA'],
  [/பகுதிகள்/gi, 'AREAS'],
  [/பகுதி/gi, 'AREA'],
  [/ஏரியாவுல|ஏரியாவில்/gi, 'AREA-LA'],
  [/ஆகப்போகுது/gi, 'AAGA POGUDHU'],
  [/செய்யப்படுவதாக/gi, 'SEYYAPPADUVADHAGA'],
  [/அறிவித்துள்ளது/gi, 'ANNOUNCED'],
  [/அறிவிப்பு/gi, 'ALERT'],
  [/தொடர்பு\s*கொள்ளுங்க/gi, 'CONTACT PANNUMGA'],
  [/தொடர்பு/gi, 'CONTACT'],
  [/தகவல்களுக்கு/gi, 'UPDATES-KU'],
  [/தகவல்/gi, 'INFO'],
  [/கவனியுங்கள்/gi, 'NOTICE PANNUMGA'],
  [/கவனம்/gi, 'BE ALERT'],
  [/உடனே/gi, 'UDANE'],
  [/பண்ணுங்க/gi, 'PANNUMGA'],
  [/பாருங்க/gi, 'PAARUNGA'],
  [/கேளுங்க/gi, 'KAELUNGA'],
  [/போன்ற/gi, 'PONRA'],
  [/அதன்/gi, 'ADHAN'],
  [/மற்றும்/gi, 'MATTRUM'],
  [/அருகாமை/gi, 'NEARBY'],
  [/மக்கள்/gi, 'MAKKAL'],
  [/உங்கள்/gi, 'UNGA'],
  [/உங்க/gi, 'UNGA']
];

/**
 * Converts Tamil script to punchy, conversational Tanglish in English Latin characters.
 * Perfect for high-engagement mobile video captions (Shorts, Reels, TikTok, YouTube).
 *
 * @param {string} text - Raw spoken Tamil text
 * @returns {string} Clean uppercase Tanglish caption text
 */
export function toTanglish(text) {
  if (!text) return '';
  let str = String(text);

  // 1. High-retention conversational civic dictionary
  for (const [regex, rep] of TANGLISH_DICTIONARY) {
    str = str.replace(regex, rep);
  }

  // 2. Transliterate remaining Tamil syllables to English letters
  let out = '';
  const chars = Array.from(str);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (TANGLISH_VOWELS[ch]) {
      out += TANGLISH_VOWELS[ch];
    } else if (TANGLISH_CONSONANTS[ch]) {
      const next = chars[i + 1];
      if (next === TANGLISH_VIRAMA) {
        out += TANGLISH_CONSONANTS[ch];
        i++; // skip virama
      } else if (TANGLISH_SIGNS[next]) {
        out += TANGLISH_CONSONANTS[ch] + TANGLISH_SIGNS[next];
        i++; // skip sign
      } else {
        out += TANGLISH_CONSONANTS[ch] + 'A';
      }
    } else if (ch !== TANGLISH_VIRAMA && !TANGLISH_SIGNS[ch]) {
      out += ch;
    }
  }

  // 3. Post clean-ups: remove grammatical suffix artifacts, uppercase
  return out
    .replace(/-ஐ\b|-AI\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}


