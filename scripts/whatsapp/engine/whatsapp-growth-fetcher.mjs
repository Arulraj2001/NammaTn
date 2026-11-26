// scripts/whatsapp/engine/whatsapp-growth-fetcher.mjs
/**
 * VizhiTN Live Verified WhatsApp Channel Growth Fetcher
 *
 * Enforces Strict Zero-Hallucination Verification:
 * - Every slot pulls from LIVE Supabase records, Google News RSS, and Gemini Search Grounding.
 * - If NO real verified content exists for a slot, returns null so the bot cleanly skips uploading.
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { isAlreadyDispatched } from '../../lib/dispatch-ledger.mjs';
import { TNPSC_QUIZ_BANK } from '../../youtube/engine/exam-quiz-catalog.mjs';
import { getRecentlyUsedQuestionIds } from '../../youtube/engine/broadcast-logger.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

function getGeminiKeys() {
  return [
    process.env.NEW_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.YOUTUBE_GEMINI_API_KEY,
    process.env.NEW2_GEMINI_API_KEY,
  ].filter(Boolean);
}

export function getIstClock() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  const date = ist.toISOString().slice(0, 10);
  const [y, m, d] = date.split('-');
  const monthsTa = ['ஜன', 'பிப்', 'மார்ச்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
  const tamilDate = `${parseInt(d, 10)} ${monthsTa[parseInt(m, 10) - 1]} ${y}`;
  return {
    date,
    tamilDate,
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
    dayOfWeek: ist.getUTCDay(),
  };
}

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch {
    return null;
  }
}

async function fetchGoogleNewsRss(queries = [], hl = 'ta', gl = 'IN') {
  const items = [];
  const seen = new Set();

  for (const q of queries) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${gl}:${hl}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
      if (!res.ok) continue;

      const xml = await res.text();
      const blocks = xml.split('<item>').slice(1);
      for (const block of blocks) {
        const titleMatch = block.match(/<title>([^<]+)<\/title>/);
        const linkMatch = block.match(/<link>([^<]+)<\/link>/);
        const sourceMatch = block.match(/<source[^>]*>([^<]+)<\/source>/);
        const pubDateMatch = block.match(/<pubDate>([^<]+)<\/pubDate>/);

        if (!titleMatch) continue;
        const cleanTitle = titleMatch[1]
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/\s*-\s*[^-]+$/, '')
          .trim();

        const key = cleanTitle.toLowerCase();
        if (cleanTitle.length > 12 && !seen.has(key)) {
          seen.add(key);
          items.push({
            title: cleanTitle,
            link: linkMatch ? linkMatch[1].trim() : '',
            source: sourceMatch ? sourceMatch[1].trim() : 'News',
            pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
          });
        }
      }
    } catch (err) {
      console.warn(`[WA RSS WARN] Query "${q}" error: ${err.message}`);
    }
  }
  return items;
}

async function callGeminiJson(prompt, { useSearchGrounding = false } = {}) {
  const keys = getGeminiKeys();
  if (keys.length === 0) return null;

  const models = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  for (const apiKey of keys) {
    const ai = new GoogleGenAI({ apiKey });
    for (const model of models) {
      try {
        const config = {
          temperature: 0.15,
          maxOutputTokens: 2048,
        };
        if (useSearchGrounding) {
          config.tools = [{ googleSearch: {} }];
        } else {
          config.responseMimeType = 'application/json';
        }

        const resp = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const raw = resp?.text || '';
        const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        if (!cleaned) continue;
        return JSON.parse(cleaned);
      } catch (err) {
        const msg = err?.message || '';
        if (msg.includes('429') || msg.includes('404')) continue;
      }
    }
  }
  return null;
}

/**
 * 1. "Top 5 Headlines in 60 Seconds" Morning/Night Capsule
 * Pulls live TN Today + active Supabase civic posts + live Google News Tamil RSS.
 * Returns null if fewer than 3 real verified headlines are found.
 */
export async function fetchMorningTop5Headlines() {
  const ist = getIstClock();
  const supabase = getSupabase();
  const rawPool = [];

  if (supabase) {
    try {
      const since48h = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      const [tnRes, postRes] = await Promise.all([
        supabase
          .from('tn_today')
          .select('title,title_ta,category,publish_date')
          .eq('status', 'published')
          .gte('publish_date', since48h)
          .order('publish_date', { ascending: false })
          .limit(8),
        supabase
          .from('post')
          .select('title_ta,title_en,district_slug,category_slug,urgency_level,created_date')
          .eq('status', 'active')
          .gte('created_date', since48h)
          .order('created_date', { ascending: false })
          .limit(12),
      ]);

      (tnRes?.data || []).forEach(a => rawPool.push({ title: a.title_ta || a.title, source: 'VizhiTN TN Today' }));
      (postRes?.data || []).forEach(p => rawPool.push({ title: p.title_ta || p.title_en, source: `VizhiTN ${p.district_slug || 'TN'}` }));
    } catch (e) {
      console.warn('[TOP5 SUPABASE WARN]', e.message);
    }
  }

  const rssItems = await fetchGoogleNewsRss([
    'Tamil Nadu government announcement OR scheme when:24h',
    'சென்னை தமிழ்நாடு முக்கிய செய்தி அரசு when:24h',
    'TNPSC OR school college Tamil Nadu announcement when:24h',
  ], 'ta', 'IN');

  rssItems.slice(0, 20).forEach(r => rawPool.push({ title: r.title, source: r.source }));

  if (rawPool.length < 3) {
    console.log('[TOP5 SKIP] Insufficient live headlines (<3 verified items).');
    return null;
  }

  const prompt = `You are the Tamil News Editor for VizhiTN WhatsApp Channel. Today is ${ist.date} (${ist.tamilDate}).
From ONLY these real fetched news items below, pick the 5 most useful Tamil Nadu civic, government scheme, weather, transport, education, or economy headlines (NO cinema gossip, NO partisan attacks, NO invented facts):
${JSON.stringify(rawPool.slice(0, 28), null, 2)}

Return STRICT JSON:
{
  "verified": true,
  "headlines": [
    { "emoji": "🏛️", "textTa": "Crisp 1-line Tamil headline under 110 chars", "source": "Exact source name" }
  ]
}
If fewer than 3 real public-interest headlines exist in the list, set "verified": false.`;

  const parsed = await callGeminiJson(prompt);
  if (!parsed?.verified || !Array.isArray(parsed.headlines) || parsed.headlines.length < 3) {
    console.log('[TOP5 SKIP] No verified civic/TN headlines passed editorial check.');
    return null;
  }

  return {
    date: ist.date,
    tamilDate: ist.tamilDate,
    headlines: parsed.headlines.slice(0, 5),
  };
}

/**
 * 2. Statewide Consolidated Power Cut & Rain Holiday Digest
 * Queries Supabase active alerts + live TANGEDCO/TNPDCL & Collector Holiday RSS.
 * Returns null if ZERO real shutdowns/holidays are active today/tomorrow.
 */
export async function fetchConsolidatedPowerCuts({ mode = 'today' } = {}) {
  const ist = getIstClock();
  const supabase = getSupabase();
  const rawNotices = [];

  if (supabase) {
    try {
      const since36h = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from('post')
        .select('title_ta,title_en,content_ta,district_slug,area_name,location_text,category_slug,post_type,created_date')
        .eq('status', 'active')
        .in('category_slug', ['electricity', 'education', 'environment', 'water-sanitation'])
        .gte('created_date', since36h)
        .order('created_date', { ascending: false })
        .limit(25);

      (data || []).forEach(p => {
        rawNotices.push({
          title: p.title_ta || p.title_en,
          district: p.district_slug,
          area: p.area_name || p.location_text || '',
          snippet: (p.content_ta || '').slice(0, 250),
          source: 'VizhiTN DB',
        });
      });
    } catch (e) {
      console.warn('[POWER DIGEST SUPABASE WARN]', e.message);
    }
  }

  const queryTerm = mode === 'tomorrow'
    ? 'நாளை மின்தடை தமிழ்நாடு OR TANGEDCO tomorrow power cut Tamil Nadu when:24h'
    : 'இன்று மின்தடை தமிழ்நாடு OR பள்ளி விடுமுறை Tamil Nadu power cut today when:24h';

  const rssItems = await fetchGoogleNewsRss([queryTerm], 'ta', 'IN');
  rssItems.slice(0, 15).forEach(r => rawNotices.push({ title: r.title, snippet: '', source: r.source }));

  if (rawNotices.length === 0) {
    console.log(`[POWER DIGEST SKIP] Zero real power cut or holiday notices found for "${mode}".`);
    return null;
  }

  const prompt = `You are VizhiTN's Fact-Checked Civic Utility Editor. Today is ${ist.date} (${ist.tamilDate}). Target window: ${mode === 'tomorrow' ? 'TOMORROW advance notices' : 'TODAY active notices'}.
Analyze ONLY these raw verified notices:
${JSON.stringify(rawNotices, null, 2)}

RULES:
1. Extract ONLY real TANGEDCO/TNPDCL power shutdowns or District Collector rain school/college holidays clearly stated in the notices above.
2. NEVER invent street names, districts, or timings. If a notice has no timing, use "அதிகாரப்பூர்வ அறிவிப்பு நேரம்".
3. Group by district cleanly (max 6 districts).
4. If ZERO genuine active shutdowns or holidays exist in the input notices, return {"hasRealAlerts": false, "items": []}.

Return STRICT JSON:
{
  "hasRealAlerts": true,
  "alertKind": "power_cut" | "holiday" | "mixed",
  "headlineTa": "⚡ தமிழ்நாடு மின்தடை & முக்கிய அறிவிப்பு",
  "items": [
    { "districtTa": "சென்னை", "areasTa": "தாம்பரம், பல்லாவரம் முக்கிய பகுதிகள்", "timingTa": "9 AM - 2 PM" }
  ],
  "helpline": "1912"
}`;

  const parsed = await callGeminiJson(prompt);
  if (!parsed?.hasRealAlerts || !Array.isArray(parsed.items) || parsed.items.length === 0) {
    console.log(`[POWER DIGEST SKIP] Verification confirmed 0 real ${mode} shutdown/holiday alerts.`);
    return null;
  }

  return {
    date: ist.date,
    tamilDate: ist.tamilDate,
    mode,
    ...parsed,
    items: parsed.items.slice(0, 6),
  };
}

/**
 * 3. Live Verified TN Govt & Fresher Job Radar
 * Pulls live RSS + Gemini Google Search Grounding.
 * Returns null if NO currently open, source-verified job opening is found!
 */
export async function fetchVerifiedJobRadar({ dedupeChannel = 'whatsapp' } = {}) {
  const ist = getIstClock();
  const rssItems = await fetchGoogleNewsRss([
    'TNPSC notification OR TNUSRB recruitment OR TRB Tamil Nadu 2026 when:3d',
    'Tamil Nadu government jobs recruitment district collectorate notification when:3d',
    'Chennai fresher jobs OR Tamil Nadu IT hiring drive 2026 when:2d',
  ], 'en', 'IN');

  const tamilRss = await fetchGoogleNewsRss([
    'தமிழ்நாடு அரசு வேலைவாய்ப்பு அறிவிப்பு 2026 when:3d',
  ], 'ta', 'IN');

  const combined = [...rssItems, ...tamilRss].slice(0, 22);
  if (combined.length === 0) {
    console.log('[JOB RADAR SKIP] Zero live job RSS items found.');
    return null;
  }

  const prompt = `You are VizhiTN's Verified Job Desk. Today's date is ${ist.date} (${ist.tamilDate}).
Here are live job news headlines from the past 72 hours:
${JSON.stringify(combined.map(c => `${c.title} [${c.source}]`), null, 2)}

Use Google Search to verify ONE currently OPEN, genuine job/recruitment notification relevant to Tamil Nadu youth (Govt: TNPSC, TNUSRB, TRB, Collectorate, Central Govt/RRB/Bank OR Verified Reputed Fresher Drive).
STRICT ANTI-HALLUCINATION RULES:
1. Application deadline MUST NOT be expired (lastDate >= ${ist.date}, or ongoing verified drive).
2. Must provide a real, verified official portal or reputable notification URL (tnpsc.gov.in, tn.gov.in, rrbcdg.gov.in, ncs.gov.in, or official careers page). NEVER invent URLs.
3. If NO genuinely open, verified recruitment exists right now, return {"found": false}.

Return STRICT JSON ONLY:
{
  "found": true,
  "slug": "short-unique-id-without-spaces",
  "isGovt": true,
  "roleTa": "Tamil role title (concise)",
  "roleEn": "English role title",
  "orgTa": "Organization name in Tamil",
  "qualificationTa": "உதாரணம்: ஏதேனும் ஒரு பட்டம் / 12-ம் வகுப்பு",
  "salaryTa": "உதாரணம்: ₹20,600 - ₹65,500 / மாதம்",
  "vacanciesTa": "உதாரணம்: 150 பணியிடங்கள்",
  "lastDateTa": "DD MMM YYYY",
  "applyUrl": "https://verified-official-link",
  "sourceName": "Official Portal / News Source"
}`;

  const parsed = await callGeminiJson(prompt, { useSearchGrounding: true });
  if (!parsed?.found || !parsed.roleTa || !parsed.applyUrl || !parsed.applyUrl.startsWith('http')) {
    console.log('[JOB RADAR SKIP] No verified active job notification found today.');
    return null;
  }

  const jobSlug = `job-${(parsed.slug || parsed.roleEn || ist.date).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}`;
  if (dedupeChannel && isAlreadyDispatched(dedupeChannel, jobSlug)) {
    console.log(`[JOB RADAR SKIP] Opening "${jobSlug}" already broadcast to ${dedupeChannel}.`);
    return null;
  }

  return {
    ...parsed,
    slug: jobSlug,
    date: ist.date,
    tamilDate: ist.tamilDate,
  };
}

/**
 * 4. Interactive Daily Poll (Alternates between TNPSC 1-Mark Poll & Civic Pulse Poll)
 * Uses 30-day R2 history so quiz polls never repeat!
 */
const CIVIC_PULSE_POLLS = [
  {
    id: 'civic-poll-eb',
    question: '⚡ இன்று உங்கள் பகுதியில் மின்தடை (Power Cut) ஏற்பட்டதா?',
    options: ['ஆம், முன்னறிவிப்பின்றி மின்தடை', 'ஆம், அறிவித்தபடி மின்தடை', 'இல்லை, சீரான மின்சாரம்'],
  },
  {
    id: 'civic-poll-water',
    question: '💧 உங்கள் வார்டில் குடிநீர் விநியோகம் சரியாக உள்ளதா?',
    options: ['ஆம், தினமும் சீராக வருகிறது', '2-3 நாட்களுக்கு ஒருமுறை வருகிறது', 'குடிநீர் தட்டுப்பாடு உள்ளது'],
  },
  {
    id: 'civic-poll-scam',
    question: '🚨 இந்த வாரம் உங்களுக்கு போலி மின் கட்டண / வங்கி மோசடி SMS வந்ததா?',
    options: ['ஆம், வந்தது (1930 புகார் அறிவேன்)', 'வந்தது, ஆனால் அது போலி என தெரியும்', 'இல்லை, எதுவும் வரவில்லை'],
  },
  {
    id: 'civic-poll-bus',
    question: '🚌 உங்கள் பகுதியில் அரசு நகரப் பேருந்துகள் குறித்த நேரத்தில் வருகிறதா?',
    options: ['ஆம், சரியான நேரத்தில் வருகிறது', 'அடிக்கடி தாமதமாகிறது', 'பேருந்து எண்ணிக்கை அதிகரிக்க வேண்டும்'],
  },
];

export async function fetchInteractiveDailyPoll() {
  const ist = getIstClock();
  // Even day of month -> Exam 1-Mark Poll; Odd day -> Civic Pulse Poll
  const dayNum = parseInt(ist.date.slice(8, 10), 10);

  if (dayNum % 2 === 0) {
    const usedIds = await getRecentlyUsedQuestionIds(30);
    const fresh = TNPSC_QUIZ_BANK.filter(q => !usedIds.has(q.id));
    const pool = fresh.length > 0 ? fresh : TNPSC_QUIZ_BANK;
    const picked = pool[dayNum % pool.length];

    return {
      kind: 'exam_quiz',
      id: `wa-quiz-poll-${picked.id}-${ist.date}`,
      question: `🎯 TNPSC / GK தினசரி 1-Mark: ${picked.questionTa}`,
      options: picked.options.map(o => `${o.key}) ${o.text}`),
      answerRevealHint: `✅ விடை மற்றும் சமச்சீர் விளக்கம்: ${picked.correctKey}) ${picked.options.find(x => x.key === picked.correctKey)?.text || ''}`,
    };
  }

  const civic = CIVIC_PULSE_POLLS[ist.dayOfWeek % CIVIC_PULSE_POLLS.length];
  return {
    kind: 'civic_pulse',
    id: `${civic.id}-${ist.date}`,
    question: civic.question,
    options: civic.options,
    answerRevealHint: null,
  };
}
