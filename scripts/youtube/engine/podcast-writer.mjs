// scripts/youtube/engine/podcast-writer.mjs
// Gemini-Powered Duo Conversational Podcast Script Engine
// Hosts: "Karthik" (ValluvarNeural) & "Kavitha" (PallaviNeural)
// Target: 8–10 minute high-retention 5-Act dialogue for Vizhi Uncut (விழி பாட்காஸ்ட்)

import { GoogleGenAI } from '@google/genai';
import { normalizeAcronymsToSpokenTamil, sanitizeClauseText } from './tamil-phonetics.mjs';

import { parseAndRepairScriptJson } from './script-writer.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest'
];

/**
 * Generates a full 5-Act duo podcast conversation script
 * @param {Object} topic - Podcast topic from PODCAST_CATALOG
 * @returns {Promise<Object>} Structured script with acts, dialogue turns, SEO metadata
 */
export async function generatePodcastScript(topic) {
  const apiKey = process.env.YOUTUBE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing YOUTUBE_GEMINI_API_KEY in environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the master showrunner for "Vizhi Uncut" (விழி பாட்காஸ்ட்), Tamil Nadu's #1 investigative duo podcast hosted by:
1. "Karthik" (Male, 30): Relatable, street-smart investigative journalist. Asks the questions every ordinary Tamilian is thinking. Gets shocked, challenges absurdities, pushes for practical clarity.
2. "Kavitha" (Female, 28): Systems decoder and legal researcher. Sharp, composed, authoritative. Breaks down the hidden psychology, technical loopholes, RBI circulars, and Supreme Court rulings.

They have incredible banter: friendly, respectful, but intensely passionate about protecting citizens. They NEVER preach or read like a textbook. They speak colloquial Chennai/Tamil Nadu Tamil (பேச்சுத் தமிழ்) with natural English code-switching.

━━━━━━━━━━━━━━━━━━━━━
EPISODE TOPIC DOSSIER:
━━━━━━━━━━━━━━━━━━━━━
- Series: ${topic.seriesNameEn} (${topic.seriesNameTa})
- Episode Title: ${topic.episodeTitleEn} (${topic.episodeTitleTa})
- Location / District: ${topic.district || 'Tamil Nadu'}
- Core Incident Case Brief: ${topic.caseBrief}
- Key Legal Tool / Defense: ${topic.legalSectionOrTool}
- Official Helpline: ${topic.helplineText}

━━━━━━━━━━━━━━━━━━━━━
MANDATORY 5-ACT STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━
The conversation MUST flow through 5 distinct Acts:
ACT 1: "The Shock Hook" (Incident in the listener's face. Karthik reveals the unbelievable loss/danger, Kavitha highlights the psychological hook).
ACT 2: "Anatomy of the Trap" (Step-by-step how the victim got reeled in. The illusion of safety/authority).
ACT 3: "The Systemic Loophole" (Why banks, police, or platforms fail to stop it. The hidden mechanism most people don't know).
ACT 4: "The Legal Counter-Attack" (The exact laws, Supreme Court rulings, RBI circulars, or Golden Hour steps that defeat it).
ACT 5: "The Golden Shield & Outro" (The one golden rule for families. Strong call to share with parents and report local issues at vizhitn.in).

━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━━
STRICT SCRIPTWRITING RULES (TARGET LENGTH: 8 TO 12 MINUTES):
━━━━━━━━━━━━━━━━━━━━━
1. TARGET DURATION: Total conversation MUST run for 8 to 12 minutes (average 10.5 minutes at 120 wpm).
2. TOTAL SPOKEN WORDS: The total Tamil spoken word count across all 5 Acts MUST be between 1,150 and 1,350 words.
3. TURNS & PACING: Each Act MUST contain 4 deep, well-developed dialogue turns (alternating between Karthik and Kavitha, total 20 turns).
4. TURN LENGTH (CRITICAL): Each turn MUST be 45 to 65 spoken Tamil words (30 to 40 seconds of speaking time). This allows the host to explain complete investigative mechanics, real case examples, or legal clauses without feeling rushed.
5. EMOTION TAGS: Every turn MUST have an emotion tag:
   - For Karthik: "shock" | "curious" | "skeptical" | "empowering"
   - For Kavitha: "explaining" | "serious" | "revealing" | "empowering"
6. NUMBERS & HELPLINES: ALWAYS write helpline numbers and statistics as clean numeric digits (e.g. 1930, 1912, 1100, 1033, 42, 48). NEVER spell them out in Tamil words (NEVER write "ஒன்று ஒன்பது மூன்று பூஜ்ஜியம்").
7. ENGLISH LOANWORDS: Write everyday tech and legal words in clean English script (OTP, video call, Skype, WhatsApp, account, police, complaint, court, link, download, app, CBI, FIR, biometric, scanner, credit score).
8. TONE: Pure conversational பேச்சுத் தமிழ். Use natural conversational markers: "கவனிச்சுப் பாருங்க", "ஆனா உண்மை என்னன்னா", "யோசிச்சுப் பாருங்க", "நேர்மையா சொல்லணும்னா", "கார்த்திக், நீங்க சொல்றது சரிதான் ஆனா...".
9. OUTRO: End Act 5 with an empowering community call-to-action:
   "உங்க ஏரியாவில நடக்கிற எந்த பிரச்சனையா இருந்தாலும் — vizhitn.in-ல நீங்களே நேரடியா report பண்ணுங்க. உங்க ஒரு பதிவு உங்க பக்கத்துல இருக்கிற ஆயிரம் பேரை காப்பாத்தும்."

━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON ONLY):
━━━━━━━━━━━━━━━━━━━━━
Return ONLY valid JSON matching this exact structure:
{
  "youtubeTitle": "Punchy high-CTR bilingual title (under 90 chars)",
  "thumbnailHookTa": "3 to 4 word shocking Tamil thumbnail hook",
  "acts": [
    {
      "actNum": 1,
      "actTitleEn": "The Shock Hook",
      "actTitleTa": "அதிர்ச்சி ஆரம்பம்",
      "turns": [
        {
          "speaker": "karthik",
          "emotion": "shock",
          "text": "spoken Tamil dialogue (45 to 65 words)"
        },
        {
          "speaker": "kavitha",
          "emotion": "revealing",
          "text": "spoken Tamil dialogue (45 to 65 words)"
        }
      ]
    }
  ],
  "chapterTimestamps": ["0:00 - Act 1 Title", "2:00 - Act 2 Title", "..."],
  "tags": ["Tag1", "Tag2"],
  "summaryTa": "2 sentence summary of the episode in Tamil"
}
`;

  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[PODCAST SCRIPT] Calling ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '';
      const scriptJson = parseAndRepairScriptJson(responseText);

      if (!scriptJson || !scriptJson.acts || scriptJson.acts.length < 5) {
        throw new Error(`Incomplete acts: expected 5 acts, got ${scriptJson?.acts?.length || 0}`);
      }

      const totalWords = scriptJson.acts.reduce((sum, act) => {
        return sum + (act.turns || []).reduce((tSum, turn) => {
          return tSum + (turn.text || '').trim().split(/\s+/).filter(Boolean).length;
        }, 0);
      }, 0);

      const estimatedMinutes = (totalWords / 120).toFixed(1);
      console.log(`[PODCAST SCRIPT ✓] Synthesized with ${modelName}: 5 Acts, ${scriptJson.acts.reduce((s, a) => s + (a.turns?.length || 0), 0)} turns, ${totalWords} total words (~${estimatedMinutes} mins)`);

      return scriptJson;
    } catch (err) {
      console.warn(`[PODCAST SCRIPT WARN] ${modelName} failed: ${err.message}. Waiting 2.5s and trying next model...`);
      lastError = err;
      await new Promise(r => setTimeout(r, 2500));
    }
  }

  console.warn(`[PODCAST SCRIPT WARN] All Gemini models failed (${lastError?.message || 'unknown'}). Engaging resilient podcast script fallback...`);
  return generateFallbackPodcastScript(topic);
}

/**
 * Builds a structured, high-quality 5-Act Karthik & Kavitha dialogue fallback
 * Guarantees podcast generation uptime during Gemini outages
 */
export function generateFallbackPodcastScript(topic) {
  const titleTa = topic.episodeTitleTa || topic.episodeTitleEn || 'விழி தமிழ்நாடு சிறப்பு புலனாய்வு';
  const titleEn = topic.episodeTitleEn || topic.id || 'Vizhi Uncut Podcast';
  const brief = topic.caseBrief || 'தமிழ்நாட்டில் பொதுமக்கள் சந்திக்கும் மிக முக்கியமான பிரச்சனை குறித்த நேரடி ஆய்வு.';
  const tool = topic.legalSectionOrTool || 'சட்டரீதியான உரிமைகள், தகவல் அறியும் உரிமை சட்டம் மற்றும் அதிகாரப்பூர்வ புகார் மையங்கள்.';
  const helpline = topic.helplineText || '1100 / 1912 / 1930';

  console.log('[PODCAST FALLBACK] Generating production 5-Act fallback Karthik & Kavitha duo script...');

  return {
    youtubeTitle: `${titleTa} | Vizhi Uncut Duo Podcast`,
    thumbnailHookTa: topic.thumbnailText || 'யாரும் சொல்லாத உண்மை',
    summaryTa: `${titleTa} குறித்த விரிவான புலனாய்வு விவாதம். கார்த்திக் மற்றும் கவிதா வழங்கும் வழிகாட்டி.`,
    tags: topic.tags || ['TamilNadu', 'VizhiTN', 'Podcast', 'TNNews'],
    chapterTimestamps: [
      '0:00 - The Shock Hook',
      '2:00 - Anatomy of the Trap',
      '4:15 - The Systemic Loophole',
      '6:30 - The Legal Counter-Attack',
      '8:45 - The Golden Shield & Outro'
    ],
    acts: [
      {
        actNum: 1,
        actTitleEn: 'The Shock Hook',
        actTitleTa: 'அதிர்ச்சி பின்னணி',
        turns: [
          {
            speaker: 'karthik',
            emotion: 'shock',
            text: `கவிதா, இன்னைக்கு நாம பேச போற விஷயம் தமிழ்நாட்டுல இருக்குற ஒவ்வொரு குடும்பத்தையும் நேரடியா பாதிக்கக்கூடிய ஒன்னு. ${brief}`
          },
          {
            speaker: 'kavitha',
            emotion: 'revealing',
            text: `கார்த்திக், நீங்க சொல்றது நூற்றுக்கு நூறு உண்மை. மக்கள் இத சாதாரண நிர்வாக அலட்சியம்னு நெனைக்கிறாங்க, ஆனா தரைமட்டத்துல நடக்குற உண்மை நிலவரமே வேற.`
          },
          {
            speaker: 'karthik',
            emotion: 'curious',
            text: `பாதிக்கப்பட்ட மக்களோட நேரடி புகார்களை பார்க்கும்போது, அரசு அதிகாரிகளோட மெத்தனப்போக்கு தான் இதுக்கு முக்கியமான காரணமா தெரியுது. இது எப்படி ஆரம்பிக்குது?`
          },
          {
            speaker: 'kavitha',
            emotion: 'serious',
            text: `ஆரம்பத்துல சிறிய பிரச்சனையா தெரியுற ஒரு விஷயம், சரியான நேரத்துல அதிகாரிகள் நடவடிக்கை எடுக்காததால பெரிய நிர்வாக தோல்வியா மாறுது.`
          }
        ]
      },
      {
        actNum: 2,
        actTitleEn: 'Anatomy of the Trap',
        actTitleTa: 'கள நிலவரம்',
        turns: [
          {
            speaker: 'karthik',
            emotion: 'skeptical',
            text: `ஆனா பொதுமக்கள் தொடர்ந்து மனு கொடுத்தும் சம்பந்தப்பட்ட துறை அதிகாரிகள் ஏன் நடவடிக்கை எடுக்க தயங்குறாங்க? அதுக்கு என்ன காரணம்?`
          },
          {
            speaker: 'kavitha',
            emotion: 'explaining',
            text: `துறைகளுக்கு இடையேயான ஒருங்கிணைப்பு இல்லாமை மற்றும் நிதி ஒதுக்கீடு செய்வதில் ஏற்படும் தாமதம் தான் முக்கிய காரணம். கீழ்மட்ட அதிகாரிகளுக்கு பொறுப்புடைமை கிடையாது.`
          },
          {
            speaker: 'karthik',
            emotion: 'shock',
            text: `வரி செலுத்தும் பொதுமக்களோட பணம் எங்கே போகுதுன்னு தெரியாம, மக்கள் அடிப்படை சேவைக்கு கூட அலைஞ்சு திரிய வேண்டியிருக்கு.`
          },
          {
            speaker: 'kavitha',
            emotion: 'revealing',
            text: `உண்மை என்னன்னா, சட்டப்படி மக்கள் தங்களோட உரிமைகளை அதிகாரப்பூர்வமா வலியுறுத்தாத வரைக்கும் இந்த அமைப்பில் மாற்றம் வர்றது ரொம்ப கஷ்டம்.`
          }
        ]
      },
      {
        actNum: 3,
        actTitleEn: 'The Systemic Loophole',
        actTitleTa: 'நிர்வாக குறைபாடு',
        turns: [
          {
            speaker: 'karthik',
            emotion: 'curious',
            text: `அப்போ பொதுமக்களுக்கு அரசு தரப்பிலிருந்து கிடைக்க வேண்டிய வெளிப்படைத்தன்மை எங்கே இடிபடுது? இதை சரி செய்ய சட்டத்தில் வழி இருக்கா?`
          },
          {
            speaker: 'kavitha',
            emotion: 'serious',
            text: `நிச்சயமா இருக்கு கார்த்திக். அரசு அலுவலகங்களில் ஒவ்வொரு சேவைக்கும் காலக்கெடு நிர்ணயிக்கப்பட்ட குடிமக்கள் சாசனம் சிட்டிசன் சார்ட்டர் நடைமுறையில இருக்கு.`
          },
          {
            speaker: 'karthik',
            emotion: 'skeptical',
            text: `ஆனா அந்த குடிமக்கள் சாசனம் பல அலுவலகங்கள்ல வெறும் அறிவிப்பு பலகையா மட்டும் தான் இருக்கு, யாரும் அதை மதிக்கிறதில்லையே.`
          },
          {
            speaker: 'kavitha',
            emotion: 'explaining',
            text: `அதனால தான் நாம் அடுத்த கட்ட சட்ட நடவடிக்கைக்கு போகணும். புகார் மனுவுக்கு ஒப்புகைச் சீட்டு வாங்கிட்டு, மேல்முறையீடு செய்யணும்.`
          }
        ]
      },
      {
        actNum: 4,
        actTitleEn: 'The Legal Counter-Attack',
        actTitleTa: 'சட்டரீதியான தீர்வு',
        turns: [
          {
            speaker: 'karthik',
            emotion: 'empowering',
            text: `கவிதா, ஒரு சாதாரண குடிமகன் தன்னோட உரிமையை நிலைநாட்ட உடனடியாக என்னென்ன சட்ட கருவிகளை பயன்படுத்தலாம்?`
          },
          {
            speaker: 'kavitha',
            emotion: 'empowering',
            text: `${tool} முதலமைச்சர் தனிப்பிரிவு 1100 மற்றும் தகவல் அறியும் உரிமை சட்டம் RTI மூலமா 30 நாட்களுக்குள் எழுத்துப்பூர்வமான பதில் பெற முடியும்.`
          },
          {
            speaker: 'karthik',
            emotion: 'curious',
            text: `அரசு அவசர உதவிக்கு என்னென்ன எண்களை மக்கள் தொடர்பு கொள்ளலாம்?`
          },
          {
            speaker: 'kavitha',
            emotion: 'explaining',
            text: `அதிகாரப்பூர்வ உதவிக்கு ${helpline} ஆகிய எண்களை தொடர்பு கொள்ளலாம். ஆதாரங்களை பாதுகாப்பாக சேமித்து வைப்பது ரொம்பவே முக்கியம்.`
          }
        ]
      },
      {
        actNum: 5,
        actTitleEn: 'The Golden Shield & Outro',
        actTitleTa: 'மக்களின் அதிகாரம் & விழித்தெழு',
        turns: [
          {
            speaker: 'karthik',
            emotion: 'empowering',
            text: `ரொம்ப தெளிவான வழிகாட்டுதல் கவிதா. நாம உரிமைகளை தெரிஞ்சுக்கிட்டா மட்டும் போதாது, அதை துணிச்சலோட பயன்படுத்தவும் ஆரம்பிக்கணும்.`
          },
          {
            speaker: 'kavitha',
            emotion: 'empowering',
            text: `ஆமாம் கார்த்திக். நம்முடைய விழிப்புணர்வு தான் ஊழலுக்கும் அலட்சியத்திற்கும் எதிரான மிக பெரிய பாதுகாப்பு கேடயம்.`
          },
          {
            speaker: 'karthik',
            emotion: 'empowering',
            text: `உங்க பகுதியில நடக்கிற எந்த பிரச்சனையா இருந்தாலும், அதை புகைப்படம் மற்றும் வீடியோ ஆதாரத்தோட vizhitn.in இணையதளத்தில் நேரடியாக பதிவு பண்ணுங்க.`
          },
          {
            speaker: 'kavitha',
            emotion: 'revealing',
            text: `நீங்க பண்ற ஒரு பதிவு உங்க பக்கத்துல இருக்கிற ஆயிரம் குடும்பங்களை பாதுகாக்கும். விழிப்போடு இருப்போம், மாற்றத்தை உருவாக்குவோம்!`
          }
        ]
      }
    ]
  };
}
