// scripts/youtube/engine/live-exam-generator.mjs
/**
 * VizhiTN Autonomous Dynamic Exam Intelligence & Live Syllabus Sourcing Engine
 * Generates paired Morning Lesson (50s) + Evening Quiz (5 Questions with Timer)
 * Grounded 100% in Tamil Nadu State Board (TNSCERT Samacheer Kalvi) syllabus.
 * Zero static hardcoding — dynamic live generation with automatic fallback cache.
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const SYLLABUS_DOMAINS = [
  {
    unit: 'Unit 8',
    domainName: 'Tamil Nadu Freedom Struggle & Palayakkarar Revolts',
    focus: 'பூலித்தேவர், வேலு நாச்சியார், வீரபாண்டிய கட்டபொம்மன், மருது சகோதரர்கள், தீரன் சின்னமலை, 1806 வேலூர் புரட்சி'
  },
  {
    unit: 'Unit 8',
    domainName: 'Archaeological Excavations & Sangam Civilization',
    focus: 'கீழடி (சிவகங்கை), பொருந்தல் (திண்டுக்கல்), கொடும்பமணல் (ஈரோடு), ஆதிச்சநல்லூர் (தூத்துக்குடி), பூம்புகார் துறைமுகம்'
  },
  {
    unit: 'Unit 8',
    domainName: 'Tamil Literature & Socio-Religious Reform Movements',
    focus: 'பதினெண்கீழ்க்கணக்கு நூல்கள், சிலப்பதிகாரம், மணிமேகலை, அயோத்திதாச பண்டிதர், இரட்டைமலை சீனிவாசன், பெரியார்'
  },
  {
    unit: 'Unit 9',
    domainName: 'Tamil Nadu Administration, E-Governance & Social Justice',
    focus: 'நீதிக்கட்சி சாதனைகள் (1920-1937), மதிய உணவு திட்டம் பரிணாமம், e-Sevai, தகவல் அறியும் உரிமை சட்டம், தமிழ்நாடு இடஒதுக்கீடு வரலாறு'
  },
  {
    unit: 'Unit 9',
    domainName: 'Tamil Nadu Geography, Water Resources & Wildlife',
    focus: 'மேற்கு தொடர்ச்சி மலை கணவாய்கள், காவிரியின் துணையாறுகள், ராம்சார் ஈரநிலங்கள் (Ramsar Sites), தமிழ்நாட்டின் ஜிஐ டேக் (GI Tags)'
  },
  {
    unit: 'Polity',
    domainName: 'Indian Constitution & Landmark Governance Articles',
    focus: 'அடிப்படை உரிமைகள் (சரத்து 14-32), பஞ்சாயத்து ராஜ் 73/74 திருத்தம், தமிழக சட்டமன்ற வரலாறு, உயர் நீதிமன்ற அதிகாரங்கள்'
  },
  {
    unit: 'Schemes',
    domainName: 'High-Impact Tamil Nadu Government Welfare Schemes',
    focus: 'கலைஞர் மகளிர் உரிமைத் தொகை, புதுமைப் பெண் திட்டம், தமிழ்ப் புதல்வன் திட்டம், மக்களைத் தேடி மருத்துவம், நான் முதல்வன்'
  }
];

function getTodayDomain(dateStr = null) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return SYLLABUS_DOMAINS[dayOfYear % SYLLABUS_DOMAINS.length];
}

const PACKAGE_STORE_DIR = path.resolve('scripts/youtube/calendar');

export async function getOrGenerateDailyPackage(targetDateStr = null) {
  const today = targetDateStr || new Date().toISOString().split('T')[0];
  if (!fs.existsSync(PACKAGE_STORE_DIR)) fs.mkdirSync(PACKAGE_STORE_DIR, { recursive: true });

  const packageFile = path.join(PACKAGE_STORE_DIR, `exam_package_${today}.json`);
  if (fs.existsSync(packageFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
      if (data && data.morningLesson && data.eveningQuiz && data.eveningQuiz.questions?.length >= 5) {
        console.log(`[EXAM ENGINE ✓] Loaded cached live package for ${today}: "${data.morningLesson.topicTitleTa}"`);
        return data;
      }
    } catch (_) {}
  }

  console.log(`[EXAM ENGINE] Synthesizing fresh dynamic exam package for ${today}...`);
  const domain = getTodayDomain(today);
  console.log(`[SYLLABUS ROTATION] Domain: ${domain.unit} — "${domain.domainName}" (${domain.focus})`);

  const apiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key missing in environment.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are the Chief Academic Director for TNPSC and Competitive Exams at VizhiTN.
Generate a synchronized 2-part daily educational broadcast package in TAMIL for today (${today}).

SYLLABUS TARGET:
- Unit: ${domain.unit}
- Domain: ${domain.domainName}
- Suggested Focus: ${domain.focus}

REQUIREMENTS:

PART 1: MORNING 50-SECOND HIGH-YIELD GK LESSON (YouTube Shorts)
1. "topicTitleTa": Clear, high-authority Tamil title (e.g. "கீழடி அகழாய்வு: 2600 ஆண்டு தமிழர் நாகரிகம்!").
2. "emotionalHookTa": 1 punchy sentence igniting the government job dream and self-discipline ("ஒரு மார்க்ல போஸ்டிங் தவறவிட்டவங்கள கேட்டா தெரியும் இந்த ஒரு கேள்வியோட வலி! உங்க பெற்றோரின் உழைப்பை வெற்றியாக்க இந்த 50 விநாடிகள் முழுசா பாருங்க!").
3. "coreFactsTa": Array of exactly 4 concise, high-yield bullet facts directly from TNSCERT Samacheer Kalvi textbooks (Std 6-12).
4. "spokenScriptTa": High-speed, information-dense Tamil voiceover script (around 120-140 words, no fluff, zero long greetings, straight into facts).
5. "eveningCliffhangerTa": Exact closing hook: "இன்னைக்கு நாம பார்த்த இந்த பாடத்துல இருந்து இன்னைக்கு சாயங்காலம் 7 மணிக்கு 5 முக்கியமான கேள்விகள் வரப்போகுது! உங்களால 5/5 எடுக்க முடியுமானு டெஸ்ட் பண்ணி பார்க்க ரெடியா இருங்க! உடனே சப்ஸ்கிரைப் பண்ணி வச்சுக்கோங்க!"
6. "samacheerCitation": Standard textbook reference (e.g. "11-ஆம் வகுப்பு வரலாறு, அலகு 3, பக்கம் 42").

PART 2: EVENING 5-QUESTION RAPID TIMER QUIZ (YouTube Shorts)
Strictly based on the facts taught in PART 1!
Generate exactly 5 multiple choice questions:
- "qNum": 1 to 5
- "questionTa": Crisp, clear exam question.
- "options": Array of 4 options with "key" ("A", "B", "C", "D") and "text".
- "correctKey": "A" or "B" or "C" or "D".
- "explanationTa": 1 short sentence explanation.
- "spokenQuestionTa": Conversational spoken Tamil version of the question for voiceover.

CRUCIAL RULE: In the video, the answers are NEVER revealed!
Add a closing field:
- "closingChallengeTa": "5-க்கு உங்க ஸ்கோர் என்ன? 1-A, 2-C ன்னு உங்க 5 விடைகளை உடனே கமெண்ட் பண்ணுங்க! சரியான விடை கீழே உள்ள Pinned Comment-ல் 2 மணி நேரத்தில் வெளியிடப்படும்!"

OUTPUT FORMAT:
Return PURE, VALID JSON ONLY (no markdown blocks, no backticks, no comments).
{
  "date": "${today}",
  "domain": "${domain.domainName}",
  "unit": "${domain.unit}",
  "morningLesson": {
    "topicTitleTa": "...",
    "emotionalHookTa": "...",
    "coreFactsTa": ["...", "...", "...", "..."],
    "spokenScriptTa": "...",
    "eveningCliffhangerTa": "...",
    "samacheerCitation": "..."
  },
  "eveningQuiz": {
    "quizTitleTa": "...",
    "questions": [
      {
        "qNum": 1,
        "questionTa": "...",
        "spokenQuestionTa": "...",
        "options": [
          {"key": "A", "text": "..."},
          {"key": "B", "text": "..."},
          {"key": "C", "text": "..."},
          {"key": "D", "text": "..."}
        ],
        "correctKey": "B",
        "explanationTa": "..."
      }
    ],
    "closingChallengeTa": "..."
  }
}
`;

  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let packageData = null;

  for (const model of models) {
    try {
      console.log(`[EXAM GENERATOR] Calling Gemini API (${model})...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 4000
        }
      });

      const text = response.text.trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      packageData = JSON.parse(cleaned);
      if (packageData.morningLesson && packageData.eveningQuiz?.questions?.length >= 5) {
        break;
      }
    } catch (err) {
      console.warn(`[EXAM GENERATOR WARN] ${model} failed: ${err.message}. Retrying next...`);
    }
  }

  if (!packageData) {
    throw new Error('Failed to generate dynamic exam package via Gemini.');
  }

  fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2), 'utf-8');
  console.log(`[EXAM GENERATOR ✓] Successfully saved dynamic package for ${today}: "${packageData.morningLesson.topicTitleTa}"`);
  return packageData;
}

/**
 * Sunday 20-Minute Mega Mock Test Package Generator (20 Comprehensive Exam Questions)
 * Rotates across Unit 8, Unit 9, Polity, Geography, Economy, Science and Government Schemes.
 */
export async function getOrGenerateWeeklyMockPackage(targetDateStr = null) {
  const today = targetDateStr || new Date().toISOString().split('T')[0];
  if (!fs.existsSync(PACKAGE_STORE_DIR)) fs.mkdirSync(PACKAGE_STORE_DIR, { recursive: true });

  const packageFile = path.join(PACKAGE_STORE_DIR, `weekly_mock_package_${today}.json`);
  if (fs.existsSync(packageFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
      if (data && data.questions && data.questions.length >= 15) {
        console.log(`[WEEKLY MOCK ✓] Loaded cached weekly mock package for ${today} (${data.questions.length} questions)`);
        return data;
      }
    } catch (_) {}
  }

  console.log(`[WEEKLY MOCK] Synthesizing fresh 20-question Mega Mock Test package for ${today}...`);
  const apiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key missing in environment.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are the Chief Academic Director for TNPSC and Competitive Exams at VizhiTN.
Generate a comprehensive 20-Question Weekly Mega Mock Test in TAMIL for Sunday examination revision.
Ground every question strictly in Tamil Nadu State Board (TNSCERT Samacheer Kalvi) textbooks (Standards 6 to 12).

SYLLABUS DISTRIBUTION (20 QUESTIONS):
1. Questions 1-6 (Unit 8): Tamil Nadu Freedom Struggle, Velu Nachiyar, Palayakkarar, Keezhadi, Sangam Literature, Social Reformers (Periyar, Ayothidhasar).
2. Questions 7-12 (Unit 9): Tamil Nadu Administration, Justice Party achievements, E-Governance, reservation milestones, Human Development Index (HDI).
3. Questions 13-16 (Indian Polity): Fundamental Rights, Directive Principles, 73rd/74th Constitutional Amendments, High Court & Governor powers.
4. Questions 17-20 (Tamil Nadu Geography & Schemes): River systems, Ramsar wetland sites, Pudhumai Penn, Magalir Urimai, Naan Mudhalvan schemes.

FOR EACH QUESTION:
- "qNum": 1 to 20
- "unitTag": "Unit 8" / "Unit 9" / "Indian Polity" / "TN Geography & Schemes"
- "topic": Topic name (e.g. "வேலு நாச்சியார் மற்றும் சிவகங்கை மீட்பு")
- "questionTa": Authentic, challenging TNPSC Group 4 / Group 2 exam question in formal Tamil.
- "spokenQuestionTa": Clear voiceover narration reading the question and 4 options.
- "options": Array of 4 options with "key" ("A", "B", "C", "D") and "text".
- "correctKey": "A" / "B" / "C" / "D"
- "explanationTa": Clear explanation including historical context, why the option is right, and memory mnemonic trick.
- "spokenExplanationTa": Clear, engaging teacher voiceover explaining the answer and memory tip.
- "samacheerCitation": Standard citation (e.g. "10-ஆம் வகுப்பு வரலாறு, அலகு 9, பக்கம் 112").

TITLE & INTRO:
- "titleTa": "TNPSC குரூப் 4 & 2: வாராந்திர மெகா மாதிரித் தேர்வு (20 முக்கிய வினாக்கள் & முழு விடைக்குறிப்பு)"
- "titleEn": "TNPSC Group 4 & 2 Weekly Mega Mock Test - 20 High Yield Questions with Samacheer Explanations"
- "introHookTa": "வணக்கம் தேர்வர்களே! உங்கள் அரசுப் பணி கனவை நனவாக்க, இந்த வாரத்தின் 20 அதிமுக்கிய வினாக்களுடன் கூடிய மெகா மாதிரித் தேர்வு இதோ. ஒவ்வொரு வினாவுக்கும் 5 நொடிகள் அவகாசம் தரப்படும். உங்கள் மதிப்பெண்களை இறுதியில் குறித்துக் கொள்ளுங்கள்!"
- "outroTa": "20 வினாக்களில் உங்கள் மதிப்பெண் என்ன என்பதை மறக்காமல் கமெண்ட் பண்ணுங்க! அடுத்த வாரம் முழு சிலபஸ் மாதிரித் தேர்விற்கு இப்போதே VizhiTN-ஐ சப்ஸ்கிரைப் செய்து பெல் ஐகானை கிளிக் பண்ணிக்கோங்க!"

OUTPUT FORMAT:
Return PURE, VALID JSON ONLY (no markdown blocks, no backticks, no comments).
{
  "date": "${today}",
  "titleTa": "...",
  "titleEn": "...",
  "introHookTa": "...",
  "outroTa": "...",
  "questions": [
    {
      "qNum": 1,
      "unitTag": "Unit 8",
      "topic": "...",
      "questionTa": "...",
      "spokenQuestionTa": "...",
      "options": [
        {"key": "A", "text": "..."},
        {"key": "B", "text": "..."},
        {"key": "C", "text": "..."},
        {"key": "D", "text": "..."}
      ],
      "correctKey": "B",
      "explanationTa": "...",
      "spokenExplanationTa": "...",
      "samacheerCitation": "..."
    }
  ]
}
`;

  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let mockData = null;

  for (const model of models) {
    try {
      console.log(`[WEEKLY MOCK] Calling Gemini API (${model})...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 6000
        }
      });

      const text = response.text.trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      mockData = JSON.parse(cleaned);
      if (mockData.questions && mockData.questions.length >= 15) {
        break;
      }
    } catch (err) {
      console.warn(`[WEEKLY MOCK WARN] ${model} failed: ${err.message}. Retrying next...`);
    }
  }

  if (!mockData || !mockData.questions || mockData.questions.length < 15) {
    throw new Error('Failed to generate weekly mock package via Gemini.');
  }

  fs.writeFileSync(packageFile, JSON.stringify(mockData, null, 2), 'utf-8');
  console.log(`[WEEKLY MOCK ✓] Successfully saved dynamic mock package for ${today} (${mockData.questions.length} questions)`);
  return mockData;
}
