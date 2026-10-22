import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { action, topic_title, category, full_script } = await request.json();

    const apiKey = process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    if (action === 'extract_short') {
      if (!full_script) {
        return NextResponse.json({ error: 'Full script is required to extract a short' }, { status: 400 });
      }

      const prompt = `You are the lead editor for VizhiTN (விழிTN) YouTube Channel.
Extract a high-impact 50-second companion YouTube Short script in conversational Tanglish / Tamil from this podcast episode script.

Source Script:
"${full_script.slice(0, 4000)}"

Rules:
1. Duration: Exactly 50 seconds (~110-130 spoken words).
2. Format:
   - [HOOK] 0-5s: A provocative question or shocking real-world situation.
   - [INSIGHT] 5-40s: Exactly 3 rapid practical action steps or money/rights facts.
   - [CTA] 40-50s: Call to watch the full episode on VizhiTN.
3. Tone: Direct, punchy, authentic Tamil conversation (e.g., "மக்களே, இத நோட் பண்ணுங்க...").

Return ONLY a clean JSON object in this exact format:
{
  "hook": "First 3-second opening hook line",
  "short_script": "Complete spoken voiceover text for the 50-second short"
}`;

      const CANDIDATES = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
      let parsed = {};
      let extractErr = null;

      for (const model of CANDIDATES) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: 'application/json' },
          });
          if (response.text) {
            parsed = JSON.parse(response.text || '{}');
            break;
          }
        } catch (err) {
          extractErr = err;
          console.warn(`[GEMINI SHORT RETRY] ${model} failed, trying next candidate...`);
        }
      }

      if (!parsed.short_script && extractErr) {
        throw extractErr;
      }

      return NextResponse.json({ success: true, ...parsed });
    }

    // Default: Generate full 13-15 min podcast script
    if (!topic_title) {
      return NextResponse.json({ error: 'Topic title is required' }, { status: 400 });
    }

    const podcastPrompt = `You are the chief scriptwriter for VizhiTN Uncut Podcast (விழிTN அன்கட் போட்காஸ்ட்).
Write a complete, highly engaging 13 to 15-minute spoken podcast episode script in natural Conversational Tamil / Tanglish.

Topic: "${topic_title}"
Category: "${category || 'General Civic / Personal Growth'}"

Structure Guidelines (Total: ~1,800 to 2,000 spoken words):
1. [INTRO & HOOK] (~1.5 mins, 200 words):
   - Warm, energetic greeting ("வணக்கம் மக்களே! விழிTN அன்கட் போட்காஸ்ட்டிற்கு உங்களை வரவேற்கிறோம்...")
   - The relatable real-life scenario or everyday challenge in Tamil Nadu.
2. [CHAPTER 1: THE REAL PROBLEM & HIDDEN TRUTHS] (~3.5 mins, 450 words):
   - What happens behind the scenes. Common mistakes people make.
3. [CHAPTER 2: STEP-BY-STEP PRACTICAL ROADMAP] (~4 mins, 550 words):
   - 3 to 4 actionable, concrete steps with exact portal names, helpline numbers, or financial math.
4. [CHAPTER 3: COMMON MYTHS VS FACTS] (~2.5 mins, 350 words):
   - Debunking 2 widespread misconceptions.
5. [CONCLUSION & ACTION CHECKLIST] (~2 mins, 250 words):
   - Clear takeaway summary, practical challenge for the listener, and signature VizhiTN outro.

Style Rules:
- Conversational, warm, empathetic, and knowledgeable.
- Use smooth Tamil blended with everyday conversational English terms ("Tanglish" like smart card, EMI, bank balance, document, online portal, complaint).
- DO NOT mention politics, political parties, or controversial politicians.
- Include clear [SCENE 1], [SCENE 2], ... [SCENE 14] markers every ~120 words to guide image generation.

Write out the full word-for-word spoken transcript:`;

    const CANDIDATES = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
    let scriptText = '';
    let scriptErr = null;

    for (const model of CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: podcastPrompt,
        });
        if (response.text) {
          scriptText = response.text;
          break;
        }
      } catch (err) {
        scriptErr = err;
        console.warn(`[GEMINI SCRIPT RETRY] ${model} failed, trying next candidate...`);
      }
    }

    if (!scriptText && scriptErr) {
      throw scriptErr;
    }
    const wordCount = scriptText.trim().split(/\s+/).length;
    const estimatedSec = Math.round((wordCount / 135) * 60);

    return NextResponse.json({
      success: true,
      script: scriptText,
      word_count: wordCount,
      estimated_duration_sec: estimatedSec,
    });
  } catch (error) {
    console.error('[Generate Script Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate script' }, { status: 500 });
  }
}
