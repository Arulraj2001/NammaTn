// scripts/youtube/engine/podcast-writer.mjs
// Gemini-Powered Duo Conversational Podcast Script Engine
// Hosts: "Karthik" (ValluvarNeural) & "Kavitha" (PallaviNeural)
// Target: 8–10 minute high-retention 5-Act dialogue for Vizhi Uncut (விழி பாட்காஸ்ட்)

import { GoogleGenAI } from '@google/genai';
import { normalizeAcronymsToSpokenTamil, sanitizeClauseText } from './tamil-phonetics.mjs';

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
      const scriptJson = JSON.parse(responseText);

      if (!scriptJson.acts || scriptJson.acts.length < 5) {
        throw new Error(`Incomplete acts: expected 5 acts, got ${scriptJson.acts?.length || 0}`);
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

  throw new Error(`[PODCAST SCRIPT FATAL] All Gemini models failed: ${lastError?.message}`);
}
