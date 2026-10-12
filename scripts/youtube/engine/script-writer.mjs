// scripts/youtube/engine/script-writer.mjs
// Generates production-grade, 4-6 minute investigative documentary scripts in spoken Tamil
// Uses Google GenAI SDK with deep civic context and street-level journalistic rigor

import { GoogleGenAI } from '@google/genai';
import { normalizeAcronymsToSpokenTamil } from './tamil-phonetics.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview'
];

/**
 * Generates an in-depth 5-Act documentary script for a TN Today article
 * @param {Object} article - Supabase tn_today article record
 * @returns {Promise<Object>} Structured documentary script with 5 chapters
 */
export async function generateDocumentaryScript(article) {
  const apiKey = process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing YOUTUBE_GEMINI_API_KEY in environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are the Senior Investigative Journalism Director and Viral Documentary Producer for "VizhiTN" (Tamil Nadu's premier civic and public infrastructure channel, akin to Vox, Dhruv Rathee, and Madras Central).

Write an ultra-compelling, 4 to 5.5-minute in-depth documentary video script in natural, engaging colloquial Spoken Tamil (பேச்சுத் தமிழ், NOT bookish/formal Tamil).

### Article Context:
- Title (English): ${article.title_en || article.title}
- Title (Tamil): ${article.title_ta || ''}
- Category: ${article.category_slug || article.category || 'Infrastructure & Governance'}
- District / Area: ${article.district_focus || 'Tamil Nadu'}
- Department / Authority: ${article.department_name || 'Tamil Nadu Government'}
- Helpline: ${article.helpline || '1100 / 1912'}
- Summary: ${article.summary_ta || article.summary_en || ''}
- Full Content: ${(article.content_ta || article.content_en || '').slice(0, 3000)}

### Critical Scriptwriting Rules:
1. **Tone**: Warm, authoritative, journalistic, and relatable spoken Tamil (பேச்சுத் தமிழ்). Use natural phrasing like "ஹலோ மக்களே", "கவனிச்சு பாத்தீங்கன்னா", "ஆனா கள நிலவரம் என்ன", "யோசிச்சு பாருங்க".
2. **Numbers & Helplines**: Never repeat numbers or bracketed words. Mention digits once cleanly (e.g. "ஒன்று ஒன்பது ஒன்று இரண்டு").
3. **No Empty Filler**: Include real street names, landmark junctions, route corridors, station names, budget figures, and travel time differences.
4. **Target Length**: The narration across all 5 chapters MUST contain a total of 550 to 750 spoken Tamil words (~4 to 5 minutes of spoken audio at 130 wpm).
5. **Outro Rule**: In Chapter 5, DO NOT say "share your problems to us". Instead, empower citizens to directly post and report issues on the website:
   "உங்க ஏரியாவில நடக்கிற ரோடு, குடிநீர், மின்சாரம் போன்ற எந்த ஒரு பிரச்சனையாக இருந்தாலும், vizhitn.in இணையதளத்தில் நீங்களே நேரடியாக போட்டோ, வீடியோவோட பதிவு பண்ணுங்க. உங்க பக்கத்துல என்ன நடக்குதுன்னு ஒட்டுமொத்த தமிழக மக்களும் உடனே தெரிஞ்சுக்கட்டும்! விழி தமிழ்நாடு சேனலை மறக்காம சப்ஸ்கிரைப் பண்ணிக்கோங்க மக்களே!"

### Structure (Exactly 5 Chapters):
- **Chapter 1: The Commuter Pain Point Hook (0:00 - 0:45)**: Why this project matters to ordinary people right now. Traffic, daily delay, or civic problem.
- **Chapter 2: Specifications, Route & Engineering Data (0:45 - 1:50)**: Exact corridor, budget in Crores, stations, technical specs.
- **Chapter 3: Ground Reality & Local Hurdles (1:50 - 3:00)**: Real ground problems during construction—damaged service lanes, drainage, waterlogging, dust, citizen demands.
- **Chapter 4: Future Commuter Payoff & Travel Impact (3:00 - 4:00)**: Travel time reduction (e.g. from 50 mins to 18 mins), interchanges, ticket rates.
- **Chapter 5: Civic Accountability & vizhitn.in Outro (4:00 - 5:00)**: Government agency responsibility, helpline numbers, and the vizhitn.in citizen reporting call to action.

### Output JSON Format:
Respond ONLY with a valid JSON object matching this schema:
{
  "youtubeTitle": "Bilingual punchy title under 90 characters",
  "thumbnailHookTa": "3 to 5 words curiosity hook in Tamil for 16:9 thumbnail",
  "chapters": [
    {
      "chapterNum": "01 / 05",
      "headlineTa": "4 to 7 words Tamil headline",
      "headlineEn": "English subhead",
      "narrationClauses": [
        "Sentence 1 in spoken conversational Tamil...",
        "Sentence 2...",
        "Sentence 3...",
        "Sentence 4...",
        "Sentence 5..."
      ],
      "facts": [
        "Fact 1 with hard data...",
        "Fact 2 with specific numbers/stations...",
        "Fact 3 with ground impact..."
      ]
    }
  ]
}
`;

  let rawText = null;
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[GEMINI SCRIPTWRITER] Calling ${modelName} to synthesize 5-Act investigative documentary...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (rawText) {
        console.log(`[GEMINI SCRIPTWRITER ✓] Successfully synthesized script using ${modelName}`);
        break;
      }
    } catch (err) {
      console.warn(`[GEMINI WARN] Model ${modelName} failed (${err.message}). Trying next...`);
      lastError = err;
    }
  }

  if (!rawText) {
    throw lastError || new Error('All Gemini models failed to generate script.');
  }

  let script;
  try {
    script = JSON.parse(rawText);
  } catch (parseErr) {
    // Attempt markdown json strip
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    script = JSON.parse(cleaned);
  }

  // Normalize all narration clauses through spoken phonetics (no duplicate numbers)
  if (script.chapters && Array.isArray(script.chapters)) {
    script.chapters.forEach(ch => {
      if (ch.narrationClauses && Array.isArray(ch.narrationClauses)) {
        ch.narrationClauses = ch.narrationClauses.map(c => normalizeAcronymsToSpokenTamil(c));
      }
    });
  }

  console.log(`[GEMINI SCRIPTWRITER] Generated ${script.chapters?.length || 0} Acts for documentary.`);
  return script;
}
