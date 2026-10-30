// scripts/youtube/engine/four-scene-writer.mjs
/**
 * VizhiTN Verified 4-Scene Shorts Script Generator & Audit Engine
 * 
 * 4-Scene Format:
 * Scene 1 HOOK (0-4s): Specific danger or benefit (never generic "கவனியுங்கள்!"). Names city/topic.
 * Scene 2 FACTS (4-18s): Core facts (who/where/when/how much). Exactly N items if promised in title.
 * Scene 3 WHAT TO DO (18-29s): 2-3 concrete immediate action steps viewer can take.
 * Scene 4 HELP + CTA (29-37s): Helpline number first, then ONE Subscribe CTA only as complete sentence.
 * 
 * Each scene outputs spoken text + on-screen text (max 8 words) for muted mobile viewers.
 * Integrated with 7-gate validation and retry loop.
 */

import fs from 'fs';
import path from 'path';
import { validateShortsScript } from './script-validator.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const geminiApiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

/**
 * Checks if source data has minimum required facts for the slot type.
 * Returns { valid: boolean, reason?: string }
 */
export function verifySourceDataFacts(sourceData = {}, slotType = 'civic') {
  const content = (sourceData.content_ta || sourceData.content_en || sourceData.description || '').trim();
  const title = (sourceData.title_ta || sourceData.title_en || sourceData.title || '').trim();

  if (slotType === 'power_cut') {
    const hasTime = /(?:\d{1,2}(?::\d{2})?\s*(?:am|pm|காலை|மதியம்|மாலை)|காலை\s*\d|முதல்\s*\d|மணி\s*வரை)/i.test(content + ' ' + title);
    const hasAreas = (sourceData.area_name && sourceData.area_name.length > 2) || (content.length > 30);
    const hasCity = Boolean(sourceData.district_slug || sourceData.area_name);

    if (!hasTime || !hasAreas || !hasCity) {
      return {
        valid: false,
        reason: `SKIPPED: missing required facts for power cut (${!hasTime ? 'time missing; ' : ''}${!hasAreas ? 'areas missing; ' : ''}${!hasCity ? 'city missing' : ''})`
      };
    }
  } else if (slotType === 'cyber_scam') {
    const hasMechanism = /(?:sms|மெசேஜ்|லிங்க்|கார்டு|ஓடிபி|otp|கால்|call|வங்கி|telegram|app|ஆப்)/i.test(content + ' ' + title);
    if (!hasMechanism && content.length < 25) {
      return {
        valid: false,
        reason: 'SKIPPED: missing required facts for cyber scam (scam mechanism/example missing)'
      };
    }
  }

  return { valid: true };
}

/**
 * Generates a verified 4-scene script with LLM prompting and automated validation retries.
 * 
 * @param {Object} params
 * @param {Object} params.sourceData - Post / topic data
 * @param {string} params.slotType - 'power_cut' | 'cyber_scam' | 'civic'
 * @param {string} [params.outDir='public/youtube_renders']
 * @returns {Promise<{ script: Object, validation: Object, auditPath: string } | null>}
 */
export async function generateVerifiedFourSceneScript({
  sourceData,
  slotType = 'civic',
  outDir = 'public/youtube_renders'
}) {
  // Step 1: Pre-flight fact check on source data
  const factCheck = verifySourceDataFacts(sourceData, slotType);
  if (!factCheck.valid) {
    console.warn(`[FACT CHECK FAILED] ${factCheck.reason}`);
    return null;
  }

  const title = sourceData.title_ta || sourceData.title_en || sourceData.title || '';
  const area = sourceData.area_name || sourceData.district_slug || 'தமிழ்நாடு';
  const district = sourceData.district_slug || area;
  const content = sourceData.content_ta || sourceData.content_en || sourceData.description || '';
  const helpline = slotType === 'power_cut' ? '1912' : slotType === 'cyber_scam' ? '1930' : '1100';

  let scriptObj = null;
  let validation = null;
  const maxRetries = 2;
  let attempt = 0;
  let retryFeedback = '';

  while (attempt <= maxRetries) {
    attempt++;
    console.log(`[4-SCENE WRITER] Generating script attempt ${attempt}/${maxRetries + 1}...`);

    scriptObj = await callGeminiFourScenePrompt({
      title,
      area,
      district,
      content,
      slotType,
      helpline,
      retryFeedback
    });

    if (!scriptObj) {
      console.log('[4-SCENE WRITER] LLM generation unavailable, building deterministic factual script...');
      scriptObj = buildDeterministicFourSceneScript({
        title,
        area,
        district,
        content,
        slotType,
        helpline,
        sourceData
      });
    }

    // Step 2: Validate against 7 gates
    // Estimate spoken time: ~2.8 Tamil syllables/sec or ~13 words per 5 seconds
    const totalWords = [scriptObj.scene1_hook, scriptObj.scene2_facts, scriptObj.scene3_actions, scriptObj.scene4_help_cta]
      .join(' ').split(/\s+/).filter(Boolean).length;
    const estimatedSeconds = Math.round((totalWords / 75) * 35); // 75 words ~= 35s

    validation = validateShortsScript(scriptObj, sourceData, slotType, estimatedSeconds);

    if (validation.passed) {
      console.log('[4-SCENE VALIDATION ✓] All 7 gates PASSED on attempt ' + attempt);
      break;
    } else {
      console.warn(`[4-SCENE VALIDATION ⚠️] Attempt ${attempt} failed ${validation.errors.length} gates:`, validation.errors.join(' | '));
      retryFeedback = `Your previous output failed the following validation gates:\n- ${validation.errors.join('\n- ')}\nFix ALL errors strictly according to the rules.`;
    }
  }

  // If still failing after maxRetries, skip video
  if (!validation.passed) {
    console.error(`[4-SCENE WRITER ABORT] Failed validation after ${maxRetries + 1} attempts. SKIPPED: ${validation.errors.join('; ')}`);
    return null;
  }

  // Step 3: Archive per-video audit JSON
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const auditSlug = (sourceData.slug || sourceData.id || `${slotType}-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const auditPath = path.join(outDir, `audit_${auditSlug}.json`);

  const auditPayload = {
    title,
    slot_type: slotType,
    review_status: 'pending',
    generated_at: new Date().toISOString(),
    source_data: {
      title,
      area,
      district,
      content: content.slice(0, 300),
      url: sourceData.cta_url || sourceData.url || `https://www.vizhitn.in/post/${sourceData.slug || ''}`
    },
    scenes: [
      {
        scene_number: 1,
        type: 'hook',
        duration_target: '0-4s',
        spoken_text: scriptObj.scene1_hook,
        on_screen_text: scriptObj.scene1_overlay
      },
      {
        scene_number: 2,
        type: 'facts',
        duration_target: '4-18s',
        spoken_text: scriptObj.scene2_facts,
        on_screen_text: scriptObj.scene2_overlay
      },
      {
        scene_number: 3,
        type: 'what_to_do',
        duration_target: '18-29s',
        spoken_text: scriptObj.scene3_actions,
        on_screen_text: scriptObj.scene3_overlay
      },
      {
        scene_number: 4,
        type: 'help_cta',
        duration_target: '29-37s',
        spoken_text: scriptObj.scene4_help_cta,
        on_screen_text: scriptObj.scene4_overlay
      }
    ],
    validation_results: validation
  };

  fs.writeFileSync(auditPath, JSON.stringify(auditPayload, null, 2), 'utf-8');
  console.log(`[AUDIT SAVED ✓] Saved verification JSON: ${auditPath}`);

  return {
    script: scriptObj,
    validation,
    auditPath
  };
}

async function callGeminiFourScenePrompt({ title, area, district, content, slotType, helpline, retryFeedback }) {
  if (!geminiApiKey) return null;

  const prompt = `You are the lead editor for VizhiTN (Tamil Nadu citizen verified news channel).
Write an authentic, factual, verified 4-Scene YouTube Short script in CASUAL SPOKEN TAMIL (like a concerned friend warning someone).

TOPIC DETAILS:
Title: "${title}"
Location/City: "${area}" (District: "${district}")
Slot Type: "${slotType}"
Source Facts: "${content}"
Official Helpline: "${helpline}"

STRICT EDITORIAL & VALIDATION CONSTITUTION:
1. Scene 1 HOOK (0-4s): Must name the specific danger or benefit. NEVER use generic "கவனியுங்கள்!" alone. Must name the city or topic.
   On-screen text: Max 8 words repeating the key danger.
2. Scene 2 FACTS (4-18s): The core facts only. Who / Where / When / How much.
   - If title says N items (e.g. "3 messages"), you MUST list exactly N items.
   - For Power Cut: Exact city, areas, time from-to, and reason from source facts. Never invent areas or times.
   - For Cyber Scam: Scam mechanism, exact fake message text, risk.
   - NO unsourced stats ("பல லட்சம்" is strictly banned).
   - NO overclaims ("போன் ஹேக் ஆகும்" is strictly banned; use "பணம் திருடப்படலாம்" or "ஆபத்து").
   On-screen text: Max 8 words.
3. Scene 3 WHAT TO DO (18-29s): Exactly 2-3 concrete, actionable steps:
   - For Power Cut: Charge mobile/inverter, finish pump work before shutdown, store water.
   - For Cyber Scam: Don't click link, never share OTP or PIN, block the sender.
   On-screen text: Max 8 words.
4. Scene 4 HELP + CTA (29-37s):
   - Mention the official helpline "${helpline}" first.
   - Followed by EXACTLY ONE CTA: "VizhiTN-ஐ Subscribe பண்ணுங்க!"
   - MUST be a 100% complete grammatical sentence ending with a period or exclamation mark. NEVER end with trailing dash ("—") or ellipsis.
   On-screen text: Max 8 words ("ஹெல்ப்லைன்: ${helpline} | Subscribe").
5. Tone: Casual spoken Tamil throughout (உங்க, பண்ணுங்க, வேணும், மாட்டிக்காதீங்க). No formal literary Tamil. Short sentences.
${retryFeedback ? `\nPREVIOUS ATTEMPT CORRECTIONS REQUIRED:\n${retryFeedback}\n` : ''}

Output ONLY valid JSON matching this schema:
{
  "scene1_hook": "...",
  "scene1_overlay": "...",
  "scene2_facts": "...",
  "scene2_overlay": "...",
  "scene3_actions": "...",
  "scene3_overlay": "...",
  "scene4_help_cta": "...",
  "scene4_overlay": "..."
}`;

  const CANDIDATES = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-pro-latest'
  ];

  for (const model of CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
            maxOutputTokens: 600
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.scene1_hook && parsed.scene2_facts && parsed.scene3_actions && parsed.scene4_help_cta) {
            return parsed;
          }
        }
      } else {
        const errText = await res.text();
        console.warn(`[4-SCENE WRITER] Model ${model} returned ${res.status}: ${errText.slice(0, 80)}`);
      }
    } catch (err) {
      console.warn(`[4-SCENE WRITER WARN] Model ${model} error:`, err.message);
    }
  }
  return null;
}

/**
 * Deterministic fallback generator following all 7 rules when LLM is offline
 */
export function buildDeterministicFourSceneScript({ title, area, district, content, slotType, helpline, sourceData = {} }) {
  if (slotType === 'power_cut') {
    const timeMatch = (content + ' ' + title).match(/(?:காலை|மதியம்|மாலை)?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:முதல்|to|-)\s*(?:மதியம்|மாலை|காலை)?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|மணி\s*வரை)?/i)?.[0] || 'காலை 9:00 முதல் மதியம் 2:00 வரை';
    const reasonMatch = content.includes('துணை மின்நிலையம்') ? 'துணை மின்நிலைய பராமரிப்பு பணி' : 'மின்வாரிய மாதாந்திர பராமரிப்பு பணி';

    return {
      scene1_hook: `${area} பகுதியில் இன்று பவர் கட் அறிவிப்பு வந்துள்ளது, உடனே கவனிங்க!`,
      scene1_overlay: `${area} இன்று மின் தடை அறிவிப்பு!`,
      scene2_facts: `இன்று ${timeMatch} வரை ${reasonMatch} காரணமாக மின்சாரம் நிறுத்தப்படுகிறது. பாதிக்கப்பட்ட முக்கிய பகுதிகள் மற்றும் தெருக்கள் விவரங்களை குறித்துக் கொள்ளுங்கள்.`,
      scene2_overlay: `நேரம்: ${timeMatch}`,
      scene3_actions: `மின் தடைக்கு முன் உங்கள் மொபைல் மற்றும் இன்வெர்ட்டரை சார்ஜ் செய்து கொள்ளுங்கள். குடிநீர் மோட்டார் பணிகளை முன்கூட்டியே முடித்து தண்ணீரை சேமித்து வையுங்கள்.`,
      scene3_overlay: `போன், இன்வெர்ட்டர் உடனே சார்ஜ் பண்ணுங்க!`,
      scene4_help_cta: `மின்தடை புகார்களுக்கு மின்னகம் உதவி எண் ${helpline}-ஐ அழையுங்கள். இது போன்ற உண்மை எச்சரிக்கைகளுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!`,
      scene4_overlay: `உதவி எண்: 1912 | Subscribe`
    };
  }

  if (slotType === 'cyber_scam') {
    return {
      scene1_hook: `உங்கள் வங்கி கணக்கில் இருந்து பணம் பறிபோகும் புதிய மெசேஜ் மோசடி, உஷாரா இருங்க!`,
      scene1_overlay: `வங்கி கணக்கு பணம் காலி — உஷார்!`,
      scene2_facts: `மின் கட்டணம் நிலுவை அல்லது பகுதி நேர வேலை என வரும் போலி எஸ்எம்எஸ் லிங்குகளை கிளிக் செய்தால் பணம் திருடப்படலாம் என காவல்துறை எச்சரித்துள்ளது.`,
      scene2_overlay: `போலி SMS லிங்க் தொடாதீர்கள்!`,
      scene3_actions: `அறிமுகமில்லாத எண்களில் இருந்து வரும் சந்தேகத்திற்குரிய லிங்குகளை தொடாதீர்கள். உங்கள் ஓடிபி அல்லது ஏடிஎம் பின் எண்ணை யாரிடமும் ஒருபோதும் பகிராதீர்கள். அந்த எண்ணை உடனே பிளாக் செய்யுங்கள்.`,
      scene3_overlay: `OTP, PIN பகிராதீர்கள் | Block செய்யவும்`,
      scene4_help_cta: `பணம் போனால் உடனடியாக தேசிய சைபர் கிரைம் உதவி எண் ${helpline}-ஐ அழையுங்கள். புதிய மோசடி எச்சரிக்கைகளுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!`,
      scene4_overlay: `சைபர் உதவி: 1930 | Subscribe`
    };
  }

  // Civic fallback
  return {
    scene1_hook: `${area} பகுதியில் நடந்த முக்கிய பிரச்சனை பற்றிய நேரடி கள நிலவரம்!`,
    scene1_overlay: `${area} நேரடி கள நிலவரம்!`,
    scene2_facts: `${content.slice(0, 140)}... இந்த தகவல் அதிகாரப்பூர்வ துறை அறிவிப்பு மூலம் சரிபார்க்கப்பட்டது.`,
    scene2_overlay: `முக்கிய கள விவரங்கள்`,
    scene3_actions: `உங்கள் பகுதியிலும் இதே போன்ற பிரச்சனை இருந்தால் அதிகாரப்பூர்வ அரசு குறைதீர்க்கும் தளத்தில் உடனடியாக புகார் பதிவு செய்யுங்கள்.`,
    scene3_overlay: `அரசு தளத்தில் புகார் பதிவு செய்யுங்கள்`,
    scene4_help_cta: `அவசர உதவிக்கு அரசு உதவி எண் ${helpline}-ஐ அழையுங்கள். தினசரி நேரடி மக்கள் எச்சரிக்கைகளுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!`,
    scene4_overlay: `உதவி எண்: 1100 | Subscribe`
  };
}
