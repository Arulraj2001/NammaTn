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
    // Helplines: Speak digits clearly once, no repeated words or brackets
    { regex: /\b1912\b/g, replacement: 'ஒன்று ஒன்பது ஒன்று இரண்டு' },
    { regex: /\b1913\b/g, replacement: 'ஒன்று ஒன்பது ஒன்று மூன்று' },
    { regex: /\b1930\b/g, replacement: 'ஒன்று ஒன்பது மூன்று பூஜ்ஜியம்' },
    { regex: /\b1100\b/g, replacement: 'ஒன்று ஒன்று பூஜ்ஜியம் பூஜ்ஜியம்' },
    { regex: /\b1070\b/g, replacement: 'ஒன்று பூஜ்ஜியம் ஏழு பூஜ்ஜியம்' },
    { regex: /\b1077\b/g, replacement: 'ஒன்று பூஜ்ஜியம் ஏழு ஏழு' },
    { regex: /\b1064\b/g, replacement: 'ஒன்று பூஜ்ஜியம் ஆறு நான்கு' },
    { regex: /\b1915\b/g, replacement: 'ஒன்று ஒன்பது ஒன்று ஐந்து' },
    { regex: /\b103\b/g, replacement: 'ஒன்று பூஜ்ஜியம் மூன்று' },

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
    { regex: /\bDVAC\b/gi, replacement: 'லஞ்ச ஒழிப்புத் துறை' },
    { regex: /\bRTO\b/gi, replacement: 'ஆர்டிஓ அலுவலகம்' },
    { regex: /\bVAO\b/gi, replacement: 'கிராம நிர்வாக அலுவலர்' },

    // Everyday Legal & Dispute Terms
    { regex: /\bCSR\b/gi, replacement: 'சிஎஸ்ஆர் ரசீது' },
    { regex: /\bFIR\b/gi, replacement: 'எப்ஐஆர் முதல் தகவல் அறிக்கை' },
    { regex: /\bTNRRRL\b/gi, replacement: 'தமிழ்நாடு வாடகைதாரர் ஒழுங்குமுறை சட்டம்' },
    { regex: /\bAdvance\b/gi, replacement: 'வீட்டு அட்வான்ஸ் பணம்' },
    { regex: /\bPatta\b/gi, replacement: 'பட்டா' },
    { regex: /\bChitta\b/gi, replacement: 'சிட்டா' },
    { regex: /\bDigiLocker\b/gi, replacement: 'டிஜிலாக்கர் ஆப்' },

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

  result = result.replace(/(\d{1,2}):?00?\s*AM\s*(?:to|-)\s*(\d{1,2}):?00?\s*PM/gi, 'காலை $1 மணில இருந்து மதியம் $2 மணி வரைக்கும்');
  result = result.replace(/(\d{1,2}):?00?\s*AM/gi, 'காலை $1 மணிக்கு');
  result = result.replace(/(\d{1,2}):?00?\s*PM/gi, 'மதியம் $1 மணிக்கு');

  return result;
}

/**
 * Splits text into 3 to 6-second spoken clauses based on natural breath and punctuation pauses
 */
export function splitIntoSpokenClauses(text) {
  if (!text) return [];
  const clean = text.replace(/\s+/g, ' ').trim();
  const rawSegments = clean.split(/(?<=[.!?।])\s+|(?<=[,;])\s+/);

  const clauses = [];
  let current = '';

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    const wordCount = (current + ' ' + trimmed).trim().split(/\s+/).length;
    if (wordCount <= 12) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) clauses.push(current);
      current = trimmed;
    }
  }

  if (current) clauses.push(current);
  return clauses;
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
    id: 'patta-transfer-bribe',
    titleTa: 'பட்டா மாறுதலுக்கு லஞ்சம் கேட்டா யாருக்கு புகார் செய்யணும்?',
    titleEn: 'Bribe demanded for Patta transfer at Taluk Office? DVAC Helpline',
    seoTitleBilingual: 'Taluk Office Patta Bribe Law | பட்டா மாறுதலுக்கு லஞ்சம் கேட்டா புகார்! #Shorts #VizhiTN',
    category: 'அரசு சேவைகள்',
    hookTa: 'விஏஓ அல்லது தாலுகா ஆபீஸ்ல பட்டா பெயர் மாற்ற லஞ்சம் கேக்குறாங்களா? ஒரு ரூபாய் கூட தராதீங்க!',
    step1Behave: 'நேரடியா லஞ்சம் கொடுக்க மறுத்துடுங்க. முதல்ல e-Sevai மையம் வழியா பட்டா மாறுதலுக்கு ஆன்லைன்ல விண்ணப்பிச்சு அப்ளிகேஷன் நம்பர் வாங்கி வெச்சுக்கோங்க.',
    step2Evidence: 'விண்ணப்பித்து 15 நாட்களுக்கு மேல் ஆகியும் காரணமில்லாம தாமதித்தால், ஆன்லைன் அக்னாலெட்ஜ்மென்ட் காப்பியை எடுத்துக்கோங்க.',
    step3Legal: 'நேரடியா லஞ்சம் கேட்டா லஞ்ச ஒழிப்புத் துறையின் 24 மணி நேர இலவச உதவி எண் 1064-க்கு கால் பண்ணுங்க. அல்லது சிஎம் செல் 1100-ல புகார் பதிவு பண்ணுங்க.',
    helplineText: 'லஞ்ச ஒழிப்புத் துறை (DVAC): 1064 | சிஎம் செல்: 1100',
    keywords: ['patta transfer bribe complaint tamil', 'dvac toll free number 1064', 'taluk office patta change delay solution', 'esevai patta transfer status', 'viva vao bribe complaint', 'vizhitn', 'anti corruption tamil nadu'],
    hashtags: ['#PattaTransfer', '#DVAC1064', '#AntiCorruption', '#TalukOffice', '#VizhiTN', '#TamilShorts', '#CitizenRightsTamil', '#Shorts']
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

  parts.push(`மின் தடை புகார்களுக்கு ஒன்று ஒன்பது ஒன்று இரண்டு எண்ணையும், மாநகராட்சி புகார்களுக்கு ஒன்று ஒன்பது ஒன்று மூன்று எண்ணையும் தொடர்பு கொள்ளலாம்.`);
  parts.push(`உங்க ஏரியாவில நடக்கிற பிரச்சனைகளை vizhitn.in இணையதளத்தில் நீங்களே நேரடியாக பதிவு பண்ணுங்க. உங்க பக்கத்துல என்ன நடக்குதுன்னு ஒட்டுமொத்த தமிழகமும் தெரிஞ்சுக்கட்டும்! விழி தமிழ்நாடு சேனலை மறக்காம சப்ஸ்கிரைப் பண்ணிக்கோங்க மக்களே!`);

  return parts;
}
