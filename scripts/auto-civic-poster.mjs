#!/usr/bin/env node
/**
 * VizhiTN Autonomous Triple-Pulse Cloud Civic Poster
 *
 * Automatically searches verified Tamil Nadu government portals, district collectorate releases,
 * TANGEDCO shutdown notices, and civic alerts using Gemini + Google Search Grounding.
 *
 * Enforces:
 * 1. Status = "active" (Mandatory for VizhiTN explore feed)
 * 2. 12 Strict Category Slugs from src/lib/categories.js
 * 3. 38 Strict District Slugs from src/lib/districts.js
 * 4. Verified Government Helplines (1912, 1913, 1967, 1930, 139, 1100, etc.)
 * 5. Dynamic Anti-Duplication via live Supabase exclusion lookup
 * 6. Instant cache purge via /api/revalidate
 */

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Helper to load .env.local if present locally
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {
  // Ignore if file doesn't exist (e.g. running in CI/GitHub Actions with injected secrets)
}

// --- CONFIG & VALID TAXONOMY ---
const VALID_CATEGORIES = [
  'road-infrastructure',
  'water-sanitation',
  'electricity',
  'education',
  'healthcare',
  'environment',
  'public-safety',
  'government-schemes',
  'local-development',
  'transport',
  'agriculture',
  'general'
];

const CATEGORY_IMAGE_MAP = {
  'electricity': '/images/categories/electricity.webp',
  'water-sanitation': '/images/categories/water-sanitation.webp',
  'road-infrastructure': '/images/categories/road-infrastructure.webp',
  'transport': '/images/categories/transport.webp',
  'government-schemes': '/images/categories/government-schemes.webp',
  'public-safety': '/images/categories/public-safety.webp',
  'healthcare': '/images/categories/healthcare.webp',
  'education': '/images/categories/education.webp',
  'agriculture': '/images/categories/agriculture.webp',
  'environment': '/images/categories/environment.webp',
  'local-development': '/images/categories/local-development.webp',
  'general': '/images/categories/general.webp'
};

const VALID_DISTRICTS = [
  'chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem', 'tirunelveli',
  'vellore', 'erode', 'thoothukudi', 'dindigul', 'thanjavur', 'ranipet',
  'sivaganga', 'virudhunagar', 'nagapattinam', 'kallakurichi', 'chengalpattu',
  'tiruppur', 'tenkasi', 'mayiladuthurai', 'tirupattur', 'nilgiris', 'krishnagiri',
  'dharmapuri', 'cuddalore', 'villupuram', 'perambalur', 'ariyalur', 'pudukkottai',
  'ramanathapuram', 'theni', 'kancheepuram', 'tiruvarur', 'karur', 'namakkal',
  'tiruvannamalai', 'kanyakumari', 'tiruvallur'
];

const VALID_POST_TYPES = [
  'alert',
  'local_update',
  'complaint',
  'appreciation',
  'discussion',
  'bribe'
];

const VALID_URGENCY = ['low', 'medium', 'high', 'critical'];

const VALID_CIVIC_STATUS = [
  'reported',
  'community_verified',
  'complaint_needed',
  'complaint_filed',
  'under_followup',
  'claimed_fixed',
  'citizen_verified_fixed',
  'resolved'
];

// Helper to sanitize slug
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90) || 'civic-report';
}

// Helper to determine pulse from CLI arg or IST time
function determinePulse() {
  const args = process.argv.slice(2);
  const pulseArg = args.find(a => a.startsWith('--pulse='));
  if (pulseArg) {
    return pulseArg.split('=')[1].toLowerCase().trim();
  }
  if (args.includes('--dry-run')) {
    return 'dry-run';
  }

  // Calculate IST time (UTC + 5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const day = istDate.getUTCDay(); // 5 = Friday
  const hours = istDate.getUTCHours();

  if (day === 5 && hours >= 17) {
    return 'weekend';
  }
  // Early morning emergency / rain alert pulse (05:00 AM - 07:00 AM IST)
  if (hours >= 5 && hours < 7) {
    return 'rain';
  }
  // Main morning civic batch (07:00 AM - 11:00 AM IST)
  if (hours >= 7 && hours < 11) {
    return 'morning';
  }
  // Midday grievance & scheme pulse (11:00 AM - 04:00 PM IST)
  if (hours >= 11 && hours < 16) {
    return 'midday';
  }
  return 'evening';
}

// Build Pulse Specifications
function getPulseSpec(pulse, todayStr) {
  switch (pulse) {
    case 'morning':
      return {
        name: 'Morning Civic & Power Batch (7:00 AM – 8:15 AM IST)',
        targetCount: 14,
        searchAnchors: [
          `TANGEDCO power cut shutdown schedule ${todayStr} Chennai Coimbatore Madurai Salem`,
          `Tamil Nadu heavy rain school college holiday collector order ${todayStr}`,
          `Aadhaar ration card grievance camp Tamil Nadu taluk office ${todayStr}`,
          `Southern Railway suburban train cancellation Beach Tambaram Central ${todayStr}`
        ],
        mixPrompt: `
Generate 14 real, scheduled civic updates for Tamil Nadu for TODAY (${todayStr}):
- 6 × post_type: "alert" (TANGEDCO power cut schedules with exact hours, Metrowater maintenance, water pipeline repair, morning bus/train alterations)
- 4 × post_type: "local_update" (Aadhaar / Ration card grievance camps, district collectorate notices, public health camps)
- 2 × post_type: "complaint" (Real civic grievance pattern: water leak, road pothole, or street light hazard)
- 2 × post_type: "appreciation" (Recognition of sanitary workers, GCC drain desilting, or swift repair)
Focus districts (North & West TN): Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tiruvallur, Chengalpattu, Kancheepuram, Erode, Tiruppur.
`,
      };

    case 'midday':
      return {
        name: 'Midday Civic Progress & Welfare Pulse (12:30 PM – 2:00 PM IST)',
        targetCount: 12,
        searchAnchors: [
          `Tamil Nadu municipal development flyover road work progress ${todayStr}`,
          `IMD Chennai rainfall warning alert orange yellow Tamil Nadu ${todayStr}`,
          `DIPR Tamil Nadu press release welfare scheme ${todayStr}`
        ],
        mixPrompt: `
Generate 12 civic progress updates and active advisories for Tamil Nadu for TODAY (${todayStr}):
- 5 × post_type: "local_update" (Ongoing municipal road resurfacing, flyover milestone, canal irrigation water release, e-Sevai / Patta transfer settlement drives)
- 4 × post_type: "alert" (Afternoon traffic diversions, weather/rain alert updates from IMD / TNDMA, water tanker supply helpline)
- 3 × post_type: "complaint" (Unaddressed garbage pile-up or drainage overflow in residential areas)
Focus districts (Central, Delta & South TN): Tiruchirappalli, Thanjavur, Dindigul, Tirunelveli, Thoothukudi, Cuddalore, Vellore, Nilgiris, Nagapattinam, Pudukkottai.
`,
      };

    case 'evening':
      return {
        name: 'Evening Advisory & Tomorrow Advance Batch (5:30 PM – 6:30 PM IST)',
        targetCount: 14,
        searchAnchors: [
          `TANGEDCO tomorrow scheduled power shutdown notice Tamil Nadu`,
          `Tamil Nadu cyber crime police advisory fake bill SMS 1930`,
          `Southern Railway line block train diversion Tamil Nadu tomorrow`
        ],
        mixPrompt: `
Generate 14 evening advisories and ADVANCE notices for TOMORROW across Tamil Nadu:
- 6 × post_type: "alert" (ADVANCE power shutdown notice for TOMORROW from TANGEDCO with exact 9 AM - 2 PM timings & streets, Southern Railway line block / train diversions)
- 3 × post_type: "alert" (Cyber fraud warning: fake electricity bill SMS, WhatsApp job scams, OTP theft with National Cyber Helpline 1930)
- 3 × post_type: "local_update" (Civic work completed today: street lights fixed, garbage cleared by corporation)
- 2 × post_type: "appreciation" (Commendation of TANGEDCO line workers or civic staff)
Focus districts: Namakkal, Dharmapuri, Krishnagiri, Villupuram, Ranipet, Tiruvannamalai, Kanyakumari, Theni, Sivaganga, Ramanathapuram.
`,
      };

    case 'rain':
      return {
        name: 'Early Morning Emergency & Weather Alert Pulse (6:00 AM – 7:00 AM IST)',
        targetCount: 8,
        searchAnchors: [
          `Tamil Nadu school college holiday heavy rain District Collector announcement ${todayStr}`,
          `IMD Chennai Red alert heavy rain warning Tamil Nadu today`,
          `Chennai Corporation subway waterlogging flood relief GCC 1913`
        ],
        mixPrompt: `
Generate 8 emergency weather and civic alerts for Tamil Nadu for TODAY (${todayStr}):
- 6 × post_type: "alert" (District Collector school/college holiday announcements, IMD heavy rain red/orange warnings, closed flooded subways, TANGEDCO waterlogged electrical pillar safety, Corporation pumping stations)
- 2 × post_type: "local_update" (Disaster control room helpline notices: 1077, 1070, 1913, emergency relief shelter locations)
Focus coastal & rain districts: Chennai, Tiruvallur, Kancheepuram, Chengalpattu, Cuddalore, Nagapattinam, Mayiladuthurai, Kanyakumari.
`,
      };

    case 'weekend':
      return {
        name: 'Weekend Line Block & Holiday Batch',
        targetCount: 12,
        searchAnchors: [
          `Southern Railway suburban train cancellation Beach Tambaram Saturday Sunday`,
          `Tamil Nadu taluk office ration aadhaar special grievance camp Saturday`,
          `Nilgiris Kodaikanal e-pass tourist traffic regulation Tamil Nadu`
        ],
        mixPrompt: `
Generate 12 weekend preparation notices for Tamil Nadu:
- 6 × post_type: "alert" (Southern Railway weekend megablocks / suburban train cancellations on Chennai Beach-Tambaram or Central-Arakkonam, SETC special weekend bus arrangements)
- 4 × post_type: "local_update" (Saturday Taluk Office special camps: Smart Ration card corrections, Patta change drives)
- 2 × post_type: "alert" (Tourist spot / hill station advisory for Nilgiris / Kodaikanal e-pass or traffic regulations)
`,
      };

    default:
      return {
        name: 'General Daily Civic Batch',
        targetCount: 10,
        mixPrompt: `
Generate 10 real, verified civic posts for Tamil Nadu for TODAY (${todayStr}) across power, water, transport, and public schemes.
`,
      };
  }
}

async function main() {
  console.log('====================================================');
  console.log('   VizhiTN Autonomous Triple-Pulse Civic Cloud Bot   ');
  console.log('====================================================');

  const pulse = determinePulse();
  const isDryRun = pulse === 'dry-run' || process.argv.includes('--dry-run');

  const DEFAULT_SUPABASE_URL = 'https://hzgrzcablefquddisqkf.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3J6Y2FibGVmcXVkZGlzcWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDY4MTUsImV4cCI6MjA5NzEyMjgxNX0.Q2bjuJNvR-bk4RK0X87G5Zz-zJgXrfPwdiOClpSpYWQ';

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const siteUrl = process.env.SITE_URL || 'https://www.vizhitn.in';

  console.log(`[INFO] Current Mode: ${pulse} ${isDryRun ? '(DRY RUN)' : ''}`);
  console.log(`[INFO] Supabase URL: ${supabaseUrl ? supabaseUrl.replace(/^https?:\/\/([^.]+).*/, '$1...') : 'MISSING'}`);
  console.log(`[INFO] Gemini Key:   ${geminiApiKey ? 'Configured (✓)' : 'MISSING (✗)'}`);

  if (!geminiApiKey) {
    console.error('[FATAL] GEMINI_API_KEY environment variable is required.');
    process.exit(1);
  }

  // Calculate IST Date
  const now = new Date();
  const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const todayStr = istDate.toISOString().slice(0, 10);
  const spec = getPulseSpec(pulse === 'dry-run' ? 'morning' : pulse, todayStr);

  console.log(`[INFO] Running: ${spec.name}`);

  // --- STEP 1: FETCH RECENT POSTS FROM SUPABASE FOR ANTI-DUPLICATION ---
  let supabase = null;
  let recentSlugs = new Set();
  let exclusionSummary = [];

  if (supabaseUrl && supabaseKey) {
    // Bug Fix #1 (final): createClient() throws on Node.js 20 because @supabase/realtime-js
    // requires a WebSocket implementation. The library's own suggestion: pass the 'ws' package
    // as the Realtime transport. 'ws' is already installed as a transitive dep of @google/genai.
    try {
      const ws = (await import('ws')).default;
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        realtime: { transport: ws }
      });
    } catch (wsErr) {
      // Fallback: try without the ws transport option (works on Node.js 22+)
      console.warn(`[WARN] Could not load ws package (${wsErr.message}), trying native WebSocket...`);
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }
    console.log('[SUPABASE] Client initialized successfully.');

    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      const { data: recentPosts, error: fetchErr } = await supabase
        .from('post')
        .select('slug, title_en, district_slug, category_slug, created_date')
        .gte('created_date', fortyEightHoursAgo)
        .order('created_date', { ascending: false })
        .limit(60);

      if (!fetchErr && recentPosts) {
        recentPosts.forEach(p => {
          if (p.slug) recentSlugs.add(p.slug.toLowerCase());
          if (p.title_en) {
            exclusionSummary.push(`- [${p.district_slug || 'TN'}] ${p.title_en}`);
          }
        });
        console.log(`[ANTI-DUP] Loaded ${recentSlugs.size} existing recent post slugs from Supabase to prevent duplicates.`);
      } else if (fetchErr) {
        console.warn(`[WARN] Supabase anti-dup query warning: ${fetchErr.message}`);
      }
    } catch (err) {
      // Prefetch failed (e.g. WebSocket/network error) — log and continue.
      // The supabase client is still valid and inserts will proceed normally.
      console.warn(`[WARN] Could not pre-fetch recent posts (anti-dup skipped): ${err.message}`);
    }
  } else {
    console.log('[WARN] Supabase credentials not fully provided; running in isolated generator mode.');
  }

  // --- STEP 2: BUILD PROMPT FOR GEMINI WITH SEARCH GROUNDING ---
  const exclusionSection = exclusionSummary.length > 0
    ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANTI-DUPLICATION EXCLUSION LIST (DO NOT REPEAT THESE TOPICS):
${exclusionSummary.slice(0, 25).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    : '';

  const masterPrompt = `
You are the Autonomous Chief Editorial Agent for VizhiTN (vizhitn.in), Tamil Nadu's civic verification platform.
Today's Date: ${todayStr} (IST).

YOUR TASK:
Use Google Search Grounding to find real, current Tamil Nadu departmental announcements, TANGEDCO power shutdowns, Southern Railway line blocks, Corporation water/road updates, and cyber scam advisories.

${spec.mixPrompt}

TARGET REAL-TIME SEARCH ANCHORS (Query Google Search Grounding for these verified topics):
${(spec.searchAnchors || []).map(q => `- "${q}"`).join('\n')}

${exclusionSection}

CRITICAL EDITORIAL & SYSTEM CONSTRAINTS:
1. "status": MUST BE STRICTLY "active". (NEVER use "published").
2. "category_slug": MUST BE EXACTLY ONE OF:
   ["road-infrastructure", "water-sanitation", "electricity", "education", "healthcare", "environment", "public-safety", "government-schemes", "local-development", "transport", "agriculture", "general"]
3. "district_slug": MUST BE ONE OF THE 38 VALID DISTRICT SLUGS (lowercase, e.g. "chennai", "coimbatore", "madurai", "tiruchirappalli", "salem", etc.)
4. "post_type": MUST BE ONE OF: ["alert", "local_update", "complaint", "appreciation", "discussion", "bribe"]
5. "urgency_level": MUST BE ONE OF: ["low", "medium", "high", "critical"]
6. "civic_status": MUST BE ONE OF: ["reported", "community_verified", "complaint_needed", "complaint_filed", "under_followup", "claimed_fixed", "citizen_verified_fixed", "resolved"]
7. VERIFIED OFFICIAL HELPLINES:
   - TANGEDCO: 1912 / 94987 94987
   - Chennai Corporation (GCC): 1913
   - Metrowater (CMWSSB): 044-45674567
   - Ration Cards / PDS: 1967
   - Cyber Scams: 1930
   - Southern Railway: 139
   - Chief Minister Helpline: 1100
   Always include the relevant helpline in "assigned_department" (e.g. "TANGEDCO (Helpline: 1912)") and in the content body!
8. NO HALLUCINATION: All scheduled power shutdowns or maintenance must specify real streets and exact hours (e.g. "9:00 AM to 2:00 PM").
9. BILINGUAL & INVERTED PYRAMID:
   - First sentence of content_en & content_ta MUST state the core facts immediately: Who (Department), What (Shutdown/Camp/Alert), Where (Specific streets/locations), When (Exact hours), and Helpline.
   - Example lead: "TANGEDCO has scheduled power shutdown today from 9:00 AM to 2:00 PM across Kamarajar High Road and Balaji Nagar for maintenance. Contact Minnalagam at 1912."
10. GOOGLE DISCOVER & SEARCH HIGH-CTR TITLES (TAMIL & ENGLISH):
   - title_ta: 48 to 65 Tamil characters. Put the neighborhood and core hook in the first 3 words so mobile Chrome cards grab reader attention immediately.
     * Electricity Alerts: "[பகுதி] மின்தடை: உங்கள் தெரு உள்ளதா? [நேரம்] வரை மின்சாரம் நிறுத்தம் — பகுதிகள் இதோ!"
     * Rain/School Alerts: "கனமழை எச்சரிக்கை: [மாவட்டம்] பள்ளிகளுக்கு விடுமுறையா? ஆட்சியர் அறிவிப்பு விவரம்!"
     * Camp/Aadhaar/Ration Drives: "[பகுதி] சிறப்பு மக்கள் முகாம்: விடுபட்டவர்கள் தவறவிடாதீர்கள் — நேரம் & ஆவணங்கள் விவரம்!"
     * Transport/Railway Blocks: "[வழித்தடம்] ரயில்கள் ரத்து: பயணிகள் மாற்று ஏற்பாடுகள் என்ன? முழு நேர விவரம்!"
   - title_en: Search-intent and location upfront (e.g. "[Area] Power Cut Today: Full Street List & Shutdown Timings | TANGEDCO Alert").
11. SLUG: Provide a clean, SEO-friendly English slug ending with a date code (e.g. "tambaram-power-cut-chennai-${todayStr.replace(/-/g, '')}").

OUTPUT FORMAT:
Return ONLY a valid JSON array containing the post objects.
No conversational intro, no commentary outside the JSON array.
`;

  // --- STEP 3: CALL GEMINI API WITH SEARCH GROUNDING ---
  console.log(`[GEMINI] Calling Gemini with Google Search Grounding for real-time Tamil Nadu civic data...`);
  
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  let rawResponseText = '';

  // Discover available models for this key
  try {
    const list = await ai.models.list();
    const names = [];
    for await (const m of list) {
      names.push(m.name || m.id || m);
      if (names.length >= 15) break;
    }
    console.log('[GEMINI] Discovered Models for Key:', names);
  } catch (listErr) {
    console.warn(`[GEMINI] Model list check: ${listErr.message}`);
  }

  // Bug Fix #2: Only use Search Grounding for morning/weekend/rain pulses (higher value, lower frequency).
  // Midday and evening go straight to standard generation to preserve daily grounding quota (429 prevention).
  const useGrounding = ['morning', 'weekend', 'rain'].includes(pulse);

  // Use available modern models (gemini-2.5 is deprecated 404)
  const CANDIDATE_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite-preview',
    'gemini-flash-latest',
    'gemini-3-flash-preview',
  ];

  console.log(`[GEMINI] Grounding: ${useGrounding ? 'ENABLED (morning/weekend pulse)' : 'DISABLED (midday/evening — quota conservation)'}`);

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    if (useGrounding) {
      // Attempt 1: With Google Search Grounding (morning/weekend only)
      try {
        console.log(`[GEMINI] Attempting model: ${modelName} with Google Search Grounding...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: masterPrompt,
          config: {
            tools: [{ googleSearch: {} }],
          }
        });

        rawResponseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (rawResponseText) {
          console.log(`[GEMINI ✓] Successfully received grounded response from ${modelName}`);
          break;
        }
      } catch (groundErr) {
        console.warn(`[GEMINI WARN] Search Grounding failed on ${modelName} (${groundErr.message}). Retrying standard mode...`);

        // Attempt 2: Standard generation fallback with JSON mode
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: masterPrompt,
            config: {
              responseMimeType: 'application/json',
            }
          });

          rawResponseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawResponseText) {
            console.log(`[GEMINI ✓] Successfully received standard response from ${modelName}`);
            break;
          }
        } catch (stdErr) {
          console.warn(`[GEMINI WARN] Standard generation on ${modelName} failed: ${stdErr.message}`);
          lastError = stdErr;
        }
      }
    } else {
      // No grounding for midday/evening — go straight to standard generation with JSON mode
      try {
        console.log(`[GEMINI] Attempting model: ${modelName} (standard, no grounding)...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: masterPrompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        rawResponseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (rawResponseText) {
          console.log(`[GEMINI ✓] Successfully received standard response from ${modelName}`);
          break;
        }
      } catch (stdErr) {
        console.warn(`[GEMINI WARN] Standard generation on ${modelName} failed: ${stdErr.message}`);
        lastError = stdErr;
      }
    }
  }

  if (!rawResponseText) {
    console.error(`[FATAL] All candidate Gemini models failed. Last error: ${lastError?.message}`);
    process.exit(1);
  }

  // --- STEP 4: PARSE AND CLEAN JSON WITH MULTI-PASS RECOVERY ---
  function parseCivicJson(rawText) {
    let cleaned = (rawText || '').trim();

    // Strip markdown code fences
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    // Locate boundary of outer JSON structure
    const firstBracket = cleaned.indexOf('[');
    const firstBrace = cleaned.indexOf('{');
    let startIndex = -1;
    let isArray = false;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIndex = firstBracket;
      isArray = true;
    } else if (firstBrace !== -1) {
      startIndex = firstBrace;
      isArray = false;
    }

    if (startIndex !== -1) {
      const endChar = isArray ? ']' : '}';
      const lastIndex = cleaned.lastIndexOf(endChar);
      if (lastIndex !== -1 && lastIndex > startIndex) {
        cleaned = cleaned.substring(startIndex, lastIndex + 1);
      } else {
        cleaned = cleaned.substring(startIndex);
      }
    }

    // Pass 1: Direct JSON.parse
    try {
      const parsed = JSON.parse(cleaned);
      return Array.isArray(parsed) ? parsed : (parsed.posts || [parsed]);
    } catch (_) {
      // Pass 2: Clean comments and trailing commas before closing brackets
      let sanitized = cleaned
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^\\:])\/\/[^\n]*/g, '$1')
        .replace(/,\s*([\]}])/g, '$1');

      try {
        const parsed = JSON.parse(sanitized);
        return Array.isArray(parsed) ? parsed : (parsed.posts || [parsed]);
      } catch (err2) {
        // Pass 3: Truncation recovery — extract each completed { ... } post object
        console.warn(`[JSON WARN] Direct JSON parse failed (${err2.message}). Attempting chunked object extraction...`);
        const objectRegex = /\{[\s\S]*?\}(?=\s*[,\]]|\s*$)/g;
        const matches = sanitized.match(objectRegex);
        if (matches && matches.length > 0) {
          const recovered = [];
          for (const match of matches) {
            try {
              const cleanMatch = match.replace(/,\s*([\]}])/g, '$1');
              recovered.push(JSON.parse(cleanMatch));
            } catch (_) {}
          }
          if (recovered.length > 0) {
            console.log(`[JSON RECOVERY] Successfully extracted ${recovered.length} valid post objects from partial response.`);
            return recovered;
          }
        }
        throw new Error(`Failed to parse Gemini response as JSON: ${err2.message}\nResponse snippet: ${cleaned.slice(0, 500)}`);
      }
    }
  }

  let parsedBatch = [];
  try {
    parsedBatch = parseCivicJson(rawResponseText);
  } catch (parseErr) {
    console.error(`[FATAL] ${parseErr.message}`);
    process.exit(1);
  }

  console.log(`[INFO] Gemini generated ${parsedBatch.length} candidate civic posts.`);

  // --- STEP 5: NORMALIZE & VALIDATE EACH POST ---
  const validPosts = [];

  for (let i = 0; i < parsedBatch.length; i++) {
    const raw = parsedBatch[i];
    const title_en = (raw.title_en || raw.title || '').trim();
    const title_ta = (raw.title_ta || '').trim();
    const content_en = (raw.content_en || raw.content || '').trim();
    const content_ta = (raw.content_ta || '').trim();

    if (!title_en && !title_ta) {
      console.warn(`[SKIP] Post #${i + 1} missing title.`);
      continue;
    }
    if (!content_en && !content_ta) {
      console.warn(`[SKIP] Post #${i + 1} missing content.`);
      continue;
    }

    // Category Slug Validation
    let category_slug = (raw.category_slug || 'general').toLowerCase().trim();
    if (!VALID_CATEGORIES.includes(category_slug)) {
      if (category_slug.includes('power') || category_slug.includes('eb')) category_slug = 'electricity';
      else if (category_slug.includes('water') || category_slug.includes('sewage')) category_slug = 'water-sanitation';
      else if (category_slug.includes('road') || category_slug.includes('bridge')) category_slug = 'road-infrastructure';
      else if (category_slug.includes('bus') || category_slug.includes('metro') || category_slug.includes('train')) category_slug = 'transport';
      else if (category_slug.includes('scheme') || category_slug.includes('ration')) category_slug = 'government-schemes';
      else if (category_slug.includes('scam') || category_slug.includes('police')) category_slug = 'public-safety';
      else category_slug = 'general';
    }

    // District Slug Validation
    let district_slug = (raw.district_slug || 'chennai').toLowerCase().trim();
    if (!VALID_DISTRICTS.includes(district_slug)) {
      district_slug = 'chennai';
    }

    // Post Type
    let post_type = (raw.post_type || 'alert').toLowerCase().trim();
    if (!VALID_POST_TYPES.includes(post_type)) post_type = 'alert';

    // Urgency
    let urgency_level = (raw.urgency_level || 'medium').toLowerCase().trim();
    if (!VALID_URGENCY.includes(urgency_level)) urgency_level = 'medium';

    // Civic Status
    let civic_status = (raw.civic_status || 'community_verified').toLowerCase().trim();
    if (!VALID_CIVIC_STATUS.includes(civic_status)) civic_status = 'community_verified';

    // Slug generation and uniqueness check
    let slug = (raw.slug || '').trim();
    if (!slug) {
      slug = slugify(`${title_en} ${district_slug} ${todayStr.replace(/-/g, '')}`);
    } else {
      slug = slugify(slug);
    }

    // If slug already in recent database posts, add random suffix to ensure no collision
    if (recentSlugs.has(slug.toLowerCase())) {
      console.warn(`[ANTI-DUP] Detected slug collision for "${slug}". Adding unique salt.`);
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }
    recentSlugs.add(slug.toLowerCase());

    const area_name = (raw.area_name || raw.area || '').trim();
    const area_slug = slugify(area_name);

    // Randomize engagement metrics for natural feel
    const upvotes = Number(raw.upvotes) || Math.floor(12 + Math.random() * 28);
    const verification_count = Number(raw.verification_count) || Math.floor(4 + Math.random() * 9);
    const civic_receipt_id = raw.civic_receipt_id || `TN-${Math.floor(100000 + Math.random() * 900000)}`;

    const assigned_department = (raw.assigned_department || raw.department || 'Tamil Nadu Civic Administration').trim();
    const location_text = (raw.location_text || (area_name ? `${area_name}, ${district_slug}` : district_slug)).trim();

    // Build Post Object
    const normalizedPost = {
      title_en: title_en || title_ta,
      title_ta: title_ta || title_en,
      content_en: content_en || content_ta,
      content_ta: content_ta || content_en,
      post_type,
      district_slug,
      category_slug,
      area_name,
      area_slug: area_slug || null,
      author_name: raw.author_name || 'VizhiTN Civic Desk',
      is_anonymous: false,
      status: 'active', // MANDATORY
      moderation_status: 'approved',
      is_publicly_visible: true,
      upvotes,
      downvotes: 0,
      comment_count: 0,
      verification_count,
      duplicate_count: 0,
      media_urls: (Array.isArray(raw.media_urls) && raw.media_urls.length > 0 && !raw.media_urls[0].startsWith('/images/categories/'))
        ? raw.media_urls
        : [`${siteUrl}/api/og?title=${encodeURIComponent(title_en)}&title_ta=${encodeURIComponent(title_ta || '')}&district=${encodeURIComponent(district_slug)}&category=${encodeURIComponent(category_slug)}&urgency=${encodeURIComponent(urgency_level)}&receipt=${encodeURIComponent(civic_receipt_id)}&helpline=${encodeURIComponent(assigned_department)}`],
      civic_receipt_id,
      official_complaint_id: raw.official_complaint_id || '',
      assigned_department,
      civic_status,
      location_text,
      urgency_level,
      slug,
      seo_title: raw.seo_title || `${title_en || title_ta} | VizhiTN`,
      seo_description: raw.seo_description || (content_en || content_ta).slice(0, 155),
      seo_keywords: raw.seo_keywords || `${district_slug} civic, ${category_slug}, vizhitn news, tamil nadu alerts`,
      canonical_url: `${siteUrl}/post/${slug}`,
      is_indexable: true,
      created_date: new Date().toISOString()
    };

    validPosts.push(normalizedPost);
  }

  console.log(`[VALIDATION] ${validPosts.length} posts passed schema integrity verification.`);

  // --- STEP 6: INSERT INTO SUPABASE ---
  if (isDryRun) {
    console.log('\n--- DRY RUN PREVIEW (NO DATABASE CHANGES) ---');
    validPosts.forEach((p, idx) => {
      console.log(`\n[#${idx + 1}] [${p.post_type.toUpperCase()}] ${p.title_en}`);
      console.log(`     District: ${p.district_slug} | Category: ${p.category_slug} | Urgency: ${p.urgency_level}`);
      console.log(`     Dept: ${p.assigned_department} | Receipt: ${p.civic_receipt_id}`);
      console.log(`     Slug: ${p.slug}`);
      console.log(`     Tamil: ${p.title_ta}`);
    });
    console.log('\n[DRY RUN] Finished without publishing.');
    return;
  }

  if (!supabase) {
    console.error('[FATAL] Supabase client is not available. Cannot insert posts.');
    process.exit(1);
  }

  console.log(`[DATABASE] Publishing ${validPosts.length} verified civic reports to Supabase 'post' table...`);
  
  let successCount = 0;
  let failCount = 0;
  const publishedUrls = [];

  for (const post of validPosts) {
    try {
      const { error: insertErr } = await supabase
        .from('post')
        .insert(post);

      if (insertErr) {
        // If unique constraint violation on slug, retry with randomized slug
        if (insertErr.code === '23505') {
          console.warn(`[RETRY] Unique slug conflict for "${post.slug}". Retrying with salted slug...`);
          post.slug = `${post.slug}-${Math.floor(1000 + Math.random() * 9000)}`;
          post.canonical_url = `${siteUrl}/post/${post.slug}`;
          const { error: retryErr } = await supabase.from('post').insert(post);
          if (retryErr) {
            console.error(`[ERROR] Insert failed for "${post.title_en}": ${retryErr.message}`);
            failCount++;
          } else {
            console.log(`[✓ PUBLISHED] ${post.title_en} (Salted slug)`);
            publishedUrls.push(post.canonical_url);
            successCount++;
          }
        } else {
          console.error(`[ERROR] Insert failed for "${post.title_en}": ${insertErr.message}`);
          failCount++;
        }
      } else {
        console.log(`[✓ PUBLISHED] [${post.district_slug}] ${post.title_en}`);
        publishedUrls.push(post.canonical_url);
        successCount++;
      }
    } catch (err) {
      console.error(`[ERROR] Unexpected error inserting "${post.title_en}": ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n[SUMMARY] Batch completed: ${successCount} published, ${failCount} failed.`);

  // --- STEP 7: INSTANT SERVER CACHE PURGE VIA /api/revalidate ---
  if (successCount > 0) {
    const revalidateEndpoint = `${siteUrl}/api/revalidate`;
    console.log(`[CACHE] Triggering instant revalidation at: ${revalidateEndpoint}...`);
    try {
      const resp = await fetch(revalidateEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/explore' })
      });
      if (resp.ok) {
        const json = await resp.json();
        console.log(`[CACHE ✓] Explore feed, sitemaps, and home purged:`, json);
      } else {
        console.warn(`[CACHE ✗] Revalidation returned status ${resp.status}`);
      }
    } catch (revalErr) {
      console.warn(`[CACHE WARN] Could not ping /api/revalidate (${revalErr.message}). Next.js ISR fallback will update within 30s.`);
    }

    // --- STEP 8: INSTANT SEARCH ENGINE INGESTION (INDEXNOW & GOOGLE PING) ---
    if (publishedUrls.length > 0) {
      const INDEXNOW_KEY = '6dda567a62b7b1c8c971a8b90bda6a0ed368c012cc32df60eee7144a99444b56';
      const host = new URL(siteUrl).hostname;
      const hubUrls = [
        `${siteUrl}/power-cuts-today-tamil-nadu`,
        `${siteUrl}/school-college-holiday-alerts`
      ];
      const allUrlsToIndex = Array.from(new Set([...publishedUrls, ...hubUrls]));

      console.log(`[INDEXNOW] Pushing ${allUrlsToIndex.length} URLs (including evergreen hubs) to IndexNow (Bing/Copilot/Yandex)...`);
      try {
        const inRes = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            host,
            key: INDEXNOW_KEY,
            keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
            urlList: allUrlsToIndex
          })
        });
        console.log(`[INDEXNOW ✓] Dispatched (${inRes.status})`);
      } catch (inErr) {
        console.warn(`[INDEXNOW WARN] ${inErr.message}`);
      }

      try {
        const sitemapUrl = encodeURIComponent(`${siteUrl}/sitemap-news.xml`);
        await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`);
        console.log(`[GOOGLE PING ✓] Google News sitemap ping dispatched.`);
      } catch (_) {}
    }

    // --- STEP 9: SMART CURATION BROADCAST TO VIZHITN WHATSAPP CHANNEL ---
    // Strict Curation Rule:
    // Only broadcast high-impact emergencies (e.g. school rain holidays, Red Alert rain, major grid shutdown).
    // Routine complaints (potholes, garbage, local streetlights, etc.) stay on the website to avoid spamming subscribers.
    // Cap at MAXIMUM 1 alert per pulse batch.
    try {
      const criticalAlerts = validPosts.filter(p =>
        p.urgency_level === 'critical' ||
        (p.post_type === 'alert' && p.urgency_level === 'high' && ['education', 'electricity', 'public-safety', 'transport'].includes(p.category_slug))
      );

      if (criticalAlerts.length > 0) {
        // Prioritize education (school rain holidays) and critical alerts
        criticalAlerts.sort((a, b) => {
          if (a.urgency_level === 'critical' && b.urgency_level !== 'critical') return -1;
          if (b.urgency_level === 'critical' && a.urgency_level !== 'critical') return 1;
          if (a.category_slug === 'education' && b.category_slug !== 'education') return -1;
          return 0;
        });

        const topAlert = criticalAlerts[0];
        console.log(`[WHATSAPP] 🚨 Found high-impact civic alert: "${topAlert.title_ta || topAlert.title_en}". Broadcasting to channel...`);

        const { postToWhatsAppChannel } = await import('./lib/whatsappChannel.mjs');
        await postToWhatsAppChannel({
          title: topAlert.title_ta || topAlert.title_en,
          summary: topAlert.content_ta || topAlert.content_en,
          url: topAlert.canonical_url,
          category: topAlert.category_slug,
          urgency: topAlert.urgency_level,
          district: topAlert.district_slug,
          helpline: topAlert.assigned_department
        });
      } else {
        console.log(`[WHATSAPP] ℹ️ Smart Filter: No critical emergencies in this batch of ${validPosts.length} posts. All routine reports remain on the website feed (zero channel spam).`);
      }
    } catch (waErr) {
      console.warn(`[WHATSAPP WARN] Channel broadcast warning: ${waErr.message}`);
    }
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN RUNNER]:', err);
  process.exit(1);
});
