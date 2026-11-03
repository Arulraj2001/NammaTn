// scripts/youtube/engine/live-motivation-generator.mjs
/**
 * VizhiTN Autonomous Night Reflection & Daily Motivation Generator
 * Synthesizes grounded, emotionally powerful Tamil life lessons and mindset scripts
 * for competitive exam aspirants, students, and working-class dreamers.
 *
 * Strict Rules:
 * - Zero toxic hustle culture, zero fake get-rich-quick fluff
 * - 100% Authentic middle-class reality, parents' sacrifice, and historical Tamil resilience
 * - Dynamic generation with persistent calendar caching
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const MOTIVATION_PILLARS = [
  {
    pillarId: 'parents-sacrifice',
    themeTa: 'பெற்றோரின் வியர்வை & நடுத்தரக் குடும்பக் கனவு',
    focus: 'அப்பா அம்மாவின் கடின உழைப்பு, சைக்கிள் மிதித்து சேர்த்த பணம், பழைய செருப்பு, குடும்ப வறுமையை வெல்லும் ஒரே ஆயுதம் படிப்பு மட்டுமே.'
  },
  {
    pillarId: 'solitude-discipline',
    themeTa: 'தயாரிப்பின் தனிமை ஒரு தவம்',
    focus: 'ஊர் சுற்றும் நண்பர்கள் மத்தியில் ஒரு சிறிய அறையில் தனியாகப் படிக்கும் தனிமை தண்டனை அல்ல, அது வாழ்க்கையைச் செதுக்கும் சிற்பக்கூடம்.'
  },
  {
    pillarId: 'overcoming-failure',
    themeTa: 'ஒரு மார்க் தோல்வி & கட்-ஆஃப் கவலைகளில் இருந்து மீள்வது',
    focus: 'தோல்வி என்பது முடிவு அல்ல, அது சரியான பாடத்தைக் கற்றுக்கொள்ளும் இடைவேளை. மனம் தளராமல் அடுத்த அடியை எடுத்து வைக்கும் துணிவு.'
  },
  {
    pillarId: 'tamil-icons-resilience',
    themeTa: 'வரலாற்று நாயகர்களின் விடாமுயற்சி',
    focus: 'காமராஜர் தெருவிளக்கில் படித்தது, டாக்டர் முத்துலட்சுமி ரெட்டி தடைகளை உடைத்தது, அப்துல் கலாம் தோல்விகளை எதிர்கொண்ட விதம்.'
  },
  {
    pillarId: 'bedtime-mindset',
    themeTa: 'நாளைய விடியல் உங்களுக்கானது — அமைதியான நம்பிக்கை',
    focus: 'இன்றைய சோர்வு நாளைக்கான உரமாகும். நாளை அதிகாலை மீண்டும் தொடங்குவோம் என்ற உறுதியோடு மன அமைதியுடன் உறங்கச் செல்லும் ஊக்கம்.'
  }
];

function getTodayPillar(dateStr = null) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return MOTIVATION_PILLARS[dayOfYear % MOTIVATION_PILLARS.length];
}

const PACKAGE_STORE_DIR = path.resolve('scripts/youtube/calendar');

/**
 * Retrieve cached or dynamically generate today's 45-second motivation package
 *
 * @param {string|null} targetDateStr - Optional 'YYYY-MM-DD'
 * @returns {Promise<Object>} Motivation script package
 */
export async function getOrGenerateMotivationPackage(targetDateStr = null) {
  const today = targetDateStr || new Date().toISOString().split('T')[0];
  if (!fs.existsSync(PACKAGE_STORE_DIR)) fs.mkdirSync(PACKAGE_STORE_DIR, { recursive: true });

  const packageFile = path.join(PACKAGE_STORE_DIR, `motivation_package_${today}.json`);
  if (fs.existsSync(packageFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
      if (data && data.spokenScriptTa && data.titleTa) {
        console.log(`[MOTIVATION ENGINE ✓] Loaded cached package for ${today}: "${data.titleTa}"`);
        return data;
      }
    } catch (_) {}
  }

  const pillar = getTodayPillar(today);
  console.log(`[MOTIVATION ENGINE] Synthesizing fresh night motivation script for ${today}...`);
  console.log(`[PILLAR] ${pillar.themeTa}`);

  const apiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key missing in environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the Senior Storyteller and Mindset Coach at VizhiTN.
Write a deeply moving, 40 to 45-second night reflection and motivation script in TAMIL for competitive exam aspirants and students studying late at night (${today}).

PILLAR THEME:
- Theme: ${pillar.themeTa}
- Core Focus: ${pillar.focus}

TONE & STYLE:
- Calm, emotional, grounded, and intensely inspiring.
- Not screaming, not toxic hustle culture. Pure emotional truth of a Tamil middle-class family.
- Word count of spoken script: EXACTLY 90 to 110 words in formal yet conversational Tamil (approx. 40-45 seconds when spoken at measured pace).
- Spoken words must be clear without difficult compound words.

OUTPUT STRUCTURE:
1. "titleTa": High-curiosity emotional title (e.g. "அப்பா வாங்கித் தந்த அந்த நோட்டுப் புத்தகம்... | Night Reflection").
2. "heroQuoteTa": 1 memorable, poetic punchline (max 10 words) to display prominently on screen.
3. "scene1SpokenTa": Opening hook acknowledging their struggle or the night silence (approx 25-30 words).
4. "scene2SpokenTa": The core perspective shift / parents' sacrifice / wisdom (approx 35-40 words).
5. "scene3SpokenTa": Calming bedtime closing message & tomorrow's hope + Share CTA (approx 30-35 words).
6. "spokenScriptTa": Full continuous voiceover text combining Scene 1 + 2 + 3.

OUTPUT FORMAT:
Return PURE, VALID JSON ONLY (no markdown blocks, no backticks, no comments).
{
  "date": "${today}",
  "pillarId": "${pillar.pillarId}",
  "themeTa": "${pillar.themeTa}",
  "titleTa": "...",
  "heroQuoteTa": "...",
  "scene1SpokenTa": "...",
  "scene2SpokenTa": "...",
  "scene3SpokenTa": "...",
  "spokenScriptTa": "..."
}
`;

  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
  let packageData = null;

  for (const model of models) {
    try {
      console.log(`[MOTIVATION GENERATOR] Calling Gemini (${model})...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.5,
          maxOutputTokens: 2048
        }
      });

      const text = response.text.trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      packageData = JSON.parse(cleaned);

      if (packageData && packageData.titleTa && packageData.spokenScriptTa) {
        console.log(`[MOTIVATION GENERATOR ✓] Successfully synthesized script using ${model}!`);
        break;
      }
    } catch (err) {
      console.warn(`[MOTIVATION GENERATOR WARN] ${model} failed: ${err.message}. Retrying next...`);
    }
  }

  if (!packageData) {
    throw new Error('Failed to generate motivation package via Gemini.');
  }

  fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2), 'utf-8');
  console.log(`[MOTIVATION GENERATOR ✓] Saved package to ${packageFile}`);
  return packageData;
}

