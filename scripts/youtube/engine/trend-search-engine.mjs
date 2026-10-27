// scripts/youtube/engine/trend-search-engine.mjs
/**
 * VizhiTN Autonomous Trend & Keyword Intelligence Engine
 * Dynamically resolves top-ranking search queries, high-CTR Tamil titles,
 * 3-second pattern-interrupt spoken hooks, and live SEO tag clusters.
 * 
 * 4 High-Retention Statewide Pillars:
 * 1. UTILITY: TNEB Bill Hacks, 100 Free Units, Tariff Slabs, Patta Chitta Online Transfer
 * 2. SCAM: Cyber Crime 1930, Digital Arrest, Fake EB Bill SMS, Part-Time Telegram Fraud
 * 3. SCHEME: Kalaignar Magalir Urimai Thogai ₹1000, Smart Ration Card, e-Sevai Guides
 * 4. RIGHTS: Traffic Police Rules, Tenant Rights, RTI Filing, Consumer Court
 */

import fs from 'fs';
import path from 'path';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const geminiApiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export const HIGH_RETENTION_PILLARS = {
  utility: {
    name: 'TNEB & Property Utility Hacks',
    seedKeywords: ['tneb bill calculation', 'tneb tariff slabs tamil', 'patta chitta online transfer', 'how to reduce eb bill tamil', '100 units free electricity calculation'],
    defaultTopics: [
      {
        id: 'tneb-slab-shock',
        titleTa: 'உங்கள் EB பில் திடீரென இரட்டிப்பாக வர இதுதான் காரணம்! | TNEB Slabs Explained',
        titleEn: 'Why Your TNEB Electricity Bill Came Double This Month | Tariff Slabs',
        spokenHook: 'உங்கள் வீட்டில் மாதம் 500 யூனிட்டுக்கு மேல் கரண்ட் ஓடுதா? இந்த ஒரு தப்பை மட்டும் பண்ணாதீங்க, பில் இரட்டிப்பாக வரும்!',
        realityBeat: 'TNEB-ல் 500 யூனிட்டுக்கு மேல் போனால் மொத்த யூனிட்டுக்குமான கட்டண விகிதம் உயரும். மேலும் 100 இலவச யூனிட் கணக்கீடும் மாறும்.',
        solutionBeat: 'vizhitn.in/tneb-bill-calculator கருவியைப் பயன்படுத்தி உங்கள் மின் பயன்பாட்டை முன்கூட்டியே கணக்கிட்டு பணத்தை மிச்சப்படுத்துங்கள்.',
        helpline: 'TANGEDCO மின்னகம்: 1912',
        ctaUrl: 'https://www.vizhitn.in/tneb-bill-calculator',
        tags: [
          'TNEB Bill Calculation Tamil', 'TNEB Electricity Bill', 'EB Bill Calculator Tamil',
          'TNEB 100 Units Free', 'TNEB Tariff Slabs 2026', 'How to reduce EB bill',
          'EB Bill Shock Tamil', 'TANGEDCO Minnalagam', 'TNEB Online Payment',
          'Smart Meter Tamil Nadu', 'TNEB Reading Check', 'TNEB Unit Rates',
          'Tamil Nadu Electricity', 'VizhiTN Utility', 'TNEB Bill Hack',
          'Chennai EB Bill', 'Coimbatore TNEB', 'Madurai EB', 'Tamil Tech Tips',
          'EB Bill Saving Tricks', 'Home Electricity Savings'
        ]
      },
      {
        id: 'patta-chitta-online-transfer',
        titleTa: 'தாலுகா ஆபீஸ் போகாமல் 5 நிமிடத்தில் பட்டா பெயர் மாற்றம்! | Patta Chitta Online',
        titleEn: 'How to Transfer Patta Online in 5 Minutes Without Middlemen',
        spokenHook: 'பட்டா பெயர் மாற்றம் செய்ய தாலுகா ஆபீஸ் அலைந்து பணத்தை வீணாக்காதீங்க! மொபைலிலேயே 5 நிமிடத்தில் அப்ளை செய்யலாம்!',
        realityBeat: 'தமிழ்நாடு அரசு இப்போது anyvany.tn.gov.in மூலம் பட்டா மாறுதல் விண்ணப்பங்களை முழுமையாக ஆன்லைனில் செயல்படுத்தியுள்ளது.',
        solutionBeat: 'கிரயப்பத்திரம் மற்றும் EC பதிவேற்றி உடனே விண்ணப்பிக்கலாம். விண்ணப்ப நிலையை vizhitn.in-ல் நேரடியாக டிராக் செய்யுங்கள்.',
        helpline: 'வருவாய்த்துறை உதவி: 1100',
        ctaUrl: 'https://www.vizhitn.in/patta-chitta-online-status',
        tags: [
          'Patta Chitta Online Tamil', 'Patta Name Transfer Tamil', 'Tamil Nilam Online',
          'How to apply patta online', 'Patta Chitta Download', 'Villangam Certificate Online',
          'EC Online Tamil Nadu', 'Taluk Office Patta', 'Natham Patta Tamil',
          'UDR Patta Correction', 'Land Registration Tamil Nadu', 'Guideline Value Check',
          'Patta Status Check', 'VizhiTN Citizen Guide', 'Patta Online Apply',
          'Tamil Nadu Land Records', 'Anyvany TN Gov In', 'Survey Number Check',
          'Property Documents Tamil', 'Land Buying Guide Tamil'
        ]
      }
    ]
  },

  scam: {
    name: 'Cyber Fraud & Scam Defense',
    seedKeywords: ['cyber crime helpline 1930', 'digital arrest scam tamil', 'fake eb bill sms fraud', 'telegram part time job scam tamil', 'aadhaar aeps scam'],
    defaultTopics: [
      {
        id: 'digital-arrest-cbi-fraud',
        titleTa: 'டிஜிட்டல் அரெஸ்ட் மோசடி: போலி போலீஸ் வீடியோ காலில் ₹40 லட்சம் பறிபோனது எப்படி?',
        titleEn: 'Digital Arrest Scam Alert: How Fake CBI Video Calls Steal Savings',
        spokenHook: 'காவல்துறை அல்லது சிபிஐ பெயரில் உங்களுக்கு வீடியோ கால் வருகிறதா? உடனே கட் பண்ணுங்க, இது டிஜிட்டல் அரெஸ்ட் மோசடி!',
        realityBeat: 'கொரியரில் போதைப்பொருள் வந்ததாக மிரட்டி, போலியான சுப்ரீம் கோர்ட் வாரண்ட் காட்டி பல மணி நேரம் அடைத்து வைத்து பணத்தை பறிக்கிறார்கள்.',
        solutionBeat: 'போலீஸ் ஒருபோதும் வீடியோ காலில் கைது செய்யாது. உடனடியாக 1930 சைபர் கிரைம் உதவி எண்ணை அழைத்து வங்கி கணக்குகளை முடக்குங்கள்!',
        helpline: 'தேசிய சைபர் கிரைம்: 1930',
        ctaUrl: 'https://www.vizhitn.in/scams',
        tags: [
          'Digital Arrest Scam Tamil', 'Cyber Crime 1930 Helpline', 'Fake Police Video Call',
          'CBI Scam Tamil Nadu', 'FedEx Courier Scam', 'Online Fraud Alert Tamil',
          'Cyber Police Tamil Nadu', 'Bank Fraud Prevention', '1930 Golden Hour Rule',
          'Cybercrime Gov In', 'Skype Police Scam', 'Online Money Fraud Tamil',
          'VizhiTN Scam Alert', 'Chennai Cyber Crime', 'Coimbatore Cyber Crime',
          'How to report cyber crime', 'Bank Account Freeze Cyber', 'OTP Scam Tamil'
        ]
      },
      {
        id: 'fake-eb-disconnection-sms',
        titleTa: 'இன்று இரவு கரண்ட் கட் ஆகும் என்ற SMS வந்ததா? வங்கி பணம் பறிபோகும் ஆபத்து!',
        titleEn: 'Electricity Bill Unpaid Disconnection SMS Scam Alert',
        spokenHook: 'இன்று இரவு 9 மணிக்கு உங்கள் மின்சாரம் துண்டிக்கப்படும் என ஒரு மொபைல் நம்பரில் இருந்து SMS வந்ததா? அந்த லிங்கை தொடாதீர்கள்!',
        realityBeat: 'மின்சார வாரியம் ஒருபோதும் 10 இலக்க மொபைல் எண்களில் இருந்தோ அல்லது APK ஆப் பதிவிறக்க லிங்க் வழியாகவோ எச்சரிக்கை அனுப்பாது.',
        solutionBeat: 'மின்தடை மற்றும் பில் நிலுவை விவரங்களை TANGEDCO-வின் 1912 என்ற அதிகாரப்பூர்வ எண்ணில் மட்டுமே சரிபாருங்கள்!',
        helpline: 'மின்னகம் 24x7: 1912 | சைபர்: 1930',
        ctaUrl: 'https://www.vizhitn.in/scams',
        tags: [
          'EB Bill SMS Scam Tamil', 'Electricity Bill Fraud Alert', 'TANGEDCO Fake SMS',
          'Power cut message fraud', 'Cyber Crime Tamil Nadu', '1930 Helpline',
          'Bank Fraud Tamil', 'APK Fraud Link', 'TNEB Fake Message',
          'Online Scam Prevention', 'Tamil Nadu Police Advisory', 'VizhiTN Scams',
          '1912 Helpline', 'Minnalagam TNEB', 'Electricity Disconnection Fake SMS'
        ]
      }
    ]
  },

  scheme: {
    name: 'Government Welfare Schemes & Entitlements',
    seedKeywords: ['magalir urimai thogai status check', 'magalir urimai rejected appeal', 'smart ration card new member add', 'kalaignar kanavu illam apply'],
    defaultTopics: [
      {
        id: 'magalir-urimai-appeal-guide',
        titleTa: 'மகளிர் உரிமைத் தொகை ₹1000 நிராகரிக்கப்பட்டதா? RDO-விடம் மேல்முறையீடு செய்யும் வழி!',
        titleEn: 'Kalaignar Magalir Urimai Thogai Rejected Appeal Process',
        spokenHook: 'மகளிர் உரிமைத் தொகை உங்களுக்கு வரவில்லையா அல்லது நிராகரிக்கப்பட்டதா? கவலைப்படாதீங்க, மேல்முறையீடு செய்ய எளிய வழி உண்டு!',
        realityBeat: 'விண்ணப்பம் நிராகரிக்கப்பட்டதற்கான காரணத்தை e-Sevai போர்ட்டலில் அறிந்து, 30 நாட்களுக்குள் RDO அலுவலகத்தில் மேல்முறையீடு செய்யலாம்.',
        solutionBeat: 'தேவையான வருமானச் சான்றிதழ் மற்றும் ஆவணங்களை தயார் செய்து மேல்முறையீடு செய்யுங்கள். முழு வழிகாட்டியை vizhitn.in-ல் படியுங்கள்!',
        helpline: 'முதலமைச்சர் உதவி மையம்: 1100',
        ctaUrl: 'https://www.vizhitn.in/schemes',
        tags: [
          'Magalir Urimai Thogai Tamil', 'Kalaignar Magalir Urimai Status', 'Magalir Urimai Rejected Appeal',
          '1000 Rupees Scheme Tamil Nadu', 'RDO Appeal Magalir Urimai', 'CM Helpline 1100',
          'Tamil Nadu Welfare Schemes', 'e Sevai Magalir Urimai', 'Kalaignar Scheme 2026',
          'Women Entitlement Scheme', 'Ration Card 1000 Scheme', 'VizhiTN Schemes',
          'Tamil Nadu Government Schemes', 'Magalir Urimai Eligibility', 'Ration Card Status'
        ]
      }
    ]
  },

  rights: {
    name: 'Citizen Legal & Police Rights',
    seedKeywords: ['traffic police fine rules tamil', 'police stop rights tamil', 'rti online application tamil nadu', 'tenant deposit rights'],
    defaultTopics: [
      {
        id: 'traffic-police-vehicle-check-rights',
        titleTa: 'வாகன சோதனையில் வண்டி சாவியை போலீஸ் பிடுங்கலாமா? உங்கள் சட்டப்பூர்வ உரிமைகள்!',
        titleEn: 'Can Traffic Police Remove Vehicle Key During Inspection? Citizen Rights',
        spokenHook: 'வாகன சோதனையின் போது போலீஸ் உங்கள் வண்டி சாவியை உருவலாமா? சட்டம் என்ன சொல்கிறது தெரியுமா?',
        realityBeat: 'மோட்டார் வாகன சட்டத்தின்படி வாகன சாவியை வலுக்கட்டாயமாக பிடுங்க எந்த போலீஸ் அதிகாரிக்கும் அதிகாரம் இல்லை. SI அல்லது அதற்கு மேல் உள்ள அதிகாரிகளே அபராதம் விதிக்க முடியும்.',
        solutionBeat: 'டிஜிலாக்கர் (DigiLocker) செயலியில் உங்கள் RC மற்றும் ஓட்டுனர் உரிமத்தை காண்பித்தால் போதுமானது. அசல் ஆவணங்களை தர வேண்டிய அவசியமில்லை.',
        helpline: 'போக்குவரத்து உதவி: 103 | CM Cell: 1100',
        ctaUrl: 'https://www.vizhitn.in/rights',
        tags: [
          'Traffic Police Rules Tamil', 'Vehicle Check Rights Tamil', 'Motor Vehicle Act 2026',
          'Traffic Challan Rights', 'DigiLocker Valid or Not Tamil', 'Citizen Rights Tamil Nadu',
          'Traffic Police Key Remove Law', 'Traffic Fine Rules', 'Police Power Limit Tamil',
          'Legal Awareness Tamil', 'VizhiTN Citizen Rights', 'Law Advice Tamil',
          'Traffic Helpline 103', 'Chennai Traffic Police', 'Coimbatore Traffic'
        ]
      }
    ]
  }
};

/**
 * Resolves a live trending topic for a given pillar.
 * If Gemini API is available, attempts dynamic live search grounding.
 * Otherwise, deterministically rotates through the verified high-retention catalog.
 */
export async function resolveTrendingPillarTopic(pillar = 'utility') {
  const pillarConfig = HIGH_RETENTION_PILLARS[pillar] || HIGH_RETENTION_PILLARS.utility;
  const catalog = pillarConfig.defaultTopics;

  // Fallback / deterministic selection by day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const selectedIndex = dayOfYear % catalog.length;
  const baseTopic = catalog[selectedIndex];

  if (!geminiApiKey) {
    return { ...baseTopic, pillar, isLiveGrounding: false };
  }

  // Attempt dynamic live trend enhancement via Gemini
  try {
    const prompt = `You are the lead YouTube strategist for VizhiTN (Tamil Nadu citizen advocacy channel).
Topic Pillar: "${pillarConfig.name}"
Keywords: ${pillarConfig.seedKeywords.join(', ')}

Analyze current YouTube Tamil search queries and create an irresistible, viral 30-second YouTube Short topic outline:
1. High-CTR Spoken Hook in Tamil (first 3 seconds pattern-interrupt shock or curiosity).
2. Reality & Problem in Tamil (10 seconds - why citizens face this).
3. Practical Solution & Action in Tamil (10 seconds - official helpline or vizhitn.in tool).
4. Viral YouTube Title in Tamil + English.
5. 20 high-ranking search tags in Tamil/English.

Return ONLY a valid JSON object matching this schema:
{
  "titleTa": "தமிழ் தலைப்பு",
  "titleEn": "English Title",
  "spokenHook": "3 வினாடி ஈர்ப்பு வாக்கியம்",
  "realityBeat": "பிரச்சனை விவரம்",
  "solutionBeat": "தீர்வு மற்றும் உதவி எண்",
  "helpline": "அதிகாரப்பூர்வ உதவி எண்",
  "tags": ["tag1", "tag2", ...]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json'
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        if (parsed.titleTa && parsed.spokenHook && parsed.solutionBeat) {
          return {
            id: `${pillar}-${Date.now()}`,
            pillar,
            titleTa: parsed.titleTa,
            titleEn: parsed.titleEn || baseTopic.titleEn,
            spokenHook: parsed.spokenHook,
            realityBeat: parsed.realityBeat || baseTopic.realityBeat,
            solutionBeat: parsed.solutionBeat,
            helpline: parsed.helpline || baseTopic.helpline,
            ctaUrl: baseTopic.ctaUrl,
            tags: parsed.tags && parsed.tags.length >= 10 ? parsed.tags : baseTopic.tags,
            isLiveGrounding: true
          };
        }
      }
    }
  } catch (err) {
    console.warn('[TrendSearchEngine] Dynamic trend query failed, falling back to curated evergreen topic:', err.message);
  }

  return { ...baseTopic, pillar, isLiveGrounding: false };
}
