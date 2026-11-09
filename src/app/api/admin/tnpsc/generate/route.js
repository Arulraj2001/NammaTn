import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { subject = 'general-tamil', count = 10 } = await request.json();

    const apiKey = process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are the lead academic syllabus expert for Tamil Nadu TNPSC examinations (Group 4, Group 2, VAO) at VizhiTN.
Generate exactly ${count} high-yield, 100% verified multiple choice questions (MCQ) for the subject: "${subject}".

Strict Academic Rules:
1. Ground every question strictly in the official Tamil Nadu State Board Samacheer Kalvi textbooks (Standards 6 to 12).
2. Must include exact textbook book citations (e.g., "10-ஆம் வகுப்பு தமிழ் - இயல் 4, பக்க எண் 84").
3. Must reference relevant TNPSC Previous Year Question (PYQ) patterns or years (e.g., "TNPSC Group 4 2022").
4. Formulate 4 realistic options (A, B, C, D) in Tamil with only one unambiguous correct key.
5. Provide a crisp 1-2 sentence explanation in Tamil.

Return ONLY a clean JSON array with no extra markdown formatting or conversational commentary:
[
  {
    "id": "tnpsc-${subject}-\${Date.now()}-1",
    "subject_slug": "${subject}",
    "question_ta": "Question in Tamil",
    "question_en": "Question in English",
    "options": [
      { "key": "A", "text": "Option A in Tamil" },
      { "key": "B", "text": "Option B in Tamil" },
      { "key": "C", "text": "Option C in Tamil" },
      { "key": "D", "text": "Option D in Tamil" }
    ],
    "correct_key": "A",
    "explanation_ta": "Explanation in Tamil",
    "book_citation": "Standard & Book Chapter",
    "pyq_reference": "Exam reference",
    "difficulty": "medium",
    "is_daily_challenge": true
  }
]`;

    const CANDIDATES = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
    let questions = [];
    let lastErr = null;

    for (const model of CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          questions = parsed.map((q, idx) => ({
            ...q,
            id: q.id || `tnpsc-${subject}-${Date.now()}-${idx + 1}`,
            subject_slug: subject,
          }));
          break;
        }
      } catch (err) {
        lastErr = err;
      }
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: lastErr?.message || 'Failed to generate questions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

