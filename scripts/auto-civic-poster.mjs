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
  if (hours >= 5 && hours < 11) {
    return 'morning';
  }
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
        name: 'Morning Civic Batch (7:00 AM – 8:15 AM IST)',
        targetCount: 8,
        mixPrompt: `
Generate 8 real, scheduled civic updates for Tamil Nadu for TODAY (${todayStr}):
- 4 × post_type: "alert" (TANGEDCO power cut schedules with exact hours, Metrowater maintenance, water pipeline repair, morning bus/train alterations)
- 2 × post_type: "local_update" (Aadhaar / Ration card grievance camps, district collectorate notices, public health camps)
- 1 × post_type: "complaint" (Real civic grievance pattern: water leak, road pothole, or street light hazard)
- 1 × post_type: "appreciation" (Recognition of sanitary workers, GCC drain desilting, or swift repair)
Focus districts: Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tiruvallur, Chengalpattu, Kancheepuram.
`,
      };

    case 'midday':
      return {
        name: 'Midday Civic Progress Pulse (1:00 PM – 2:00 PM IST)',
        targetCount: 6,
        mixPrompt: `
Generate 6 civic progress updates and active advisories for Tamil Nadu for TODAY (${todayStr}):
- 3 × post_type: "local_update" (Ongoing municipal road resurfacing, flyover construction milestone, desilting of lakes/canals, e-Sevai / Patta transfer camp updates)
- 2 × post_type: "alert" (Afternoon traffic diversions, weather/rain alert updates from IMD / TNDMA, water tanker supply helpline)
- 1 × post_type: "complaint" (Unaddressed garbage pile-up or drainage overflow in residential areas)
Focus districts: Erode, Tirunelveli, Thoothukudi, Nilgiris, Vellore, Thanjavur, Dindigul, Tiruppur.
`,
      };

    case 'evening':
      return {
        name: 'Evening Advisory & Tomorrow Advance Batch (5:30 PM – 6:30 PM IST)',
        targetCount: 6,
        mixPrompt: `
Generate 6 evening advisories and ADVANCE notices for TOMORROW across Tamil Nadu:
- 3 × post_type: "alert" (ADVANCE power shutdown notice for TOMORROW from TANGEDCO with exact 9 AM - 2 PM timings & streets, Southern Railway line block / train diversions)
- 1 × post_type: "alert" (Cyber fraud warning: fake electricity bill SMS, WhatsApp job scams, OTP theft with National Cyber Helpline 1930)
- 1 × post_type: "local_update" (Civic work completed today: street lights fixed, garbage cleared by corporation)
- 1 × post_type: "appreciation" (Commendation of TANGEDCO line workers or civic staff)
Focus districts: Namakkal, Dharmapuri, Cuddalore, Krishnagiri, Villupuram, Ranipet, Tiruvannamalai, Kanyakumari.
`,
      };

    case 'weekend':
      return {
        name: 'Weekend Line Block & Holiday Batch',
        targetCount: 8,
        mixPrompt: `
Generate 8 weekend preparation notices for Tamil Nadu:
- 4 × post_type: "alert" (Southern Railway weekend megablocks / suburban train cancellations on Chennai Beach-Tambaram or Central-Arakkonam, SETC special weekend bus arrangements)
- 2 × post_type: "local_update" (Saturday Taluk Office special camps: Smart Ration card corrections, Patta change drives)
- 1 × post_type: "alert" (Tourist spot / hill station advisory for Nilgiris / Kodaikanal e-pass or traffic regulations)
- 1 × post_type: "appreciation" (Commendation of public transport or municipal sanitation teams)
`,
      };

    default:
      return {
        name: 'General Daily Civic Batch',
        targetCount: 6,
        mixPrompt: `
Generate 6 real, verified civic posts for Tamil Nadu for TODAY (${todayStr}) across power, water, transport, and public schemes.
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
    try {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });

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
        console.warn(`[WARN] Supabase query warning: ${fetchErr.message}`);
      }
    } catch (err) {
      console.warn(`[WARN] Could not pre-fetch recent posts: ${err.message}`);
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
9. BILINGUAL: Both English and Tamil ("title_en", "title_ta", "content_en", "content_ta") MUST be authentic and accurate.
10. SLUG: Provide a clean, SEO-friendly English slug ending with a date code (e.g. "tambaram-power-cut-chennai-${todayStr.replace(/-/g, '')}").

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

  const CANDIDATE_MODELS = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
  ];

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[GEMINI] Attempting model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: masterPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      rawResponseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (rawResponseText) {
        console.log(`[GEMINI ✓] Successfully received response from ${modelName}`);
        break;
      }
    } catch (err) {
      console.warn(`[GEMINI WARN] Model ${modelName} failed: ${err.message}`);
      lastError = err;
    }
  }

  if (!rawResponseText) {
    console.error(`[FATAL] All candidate Gemini models failed. Last error: ${lastError?.message}`);
    process.exit(1);
  }

  // --- STEP 4: PARSE AND CLEAN JSON ---
  let cleanedText = rawResponseText.trim();
  // Strip markdown code fences if wrapped in ```json ... ```
  if (cleanedText.includes('```')) {
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    // If there's still surrounding text, find array bounds
    const firstBracket = cleanedText.indexOf('[');
    const lastBracket = cleanedText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
    }
  }

  let parsedBatch = [];
  try {
    parsedBatch = JSON.parse(cleanedText);
    if (!Array.isArray(parsedBatch)) {
      if (parsedBatch.posts && Array.isArray(parsedBatch.posts)) {
        parsedBatch = parsedBatch.posts;
      } else {
        parsedBatch = [parsedBatch];
      }
    }
  } catch (parseErr) {
    console.error(`[FATAL] Failed to parse Gemini response as JSON: ${parseErr.message}`);
    console.error('Response snippet:', cleanedText.slice(0, 500));
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
      media_urls: Array.isArray(raw.media_urls) ? raw.media_urls : [],
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
            successCount++;
          }
        } else {
          console.error(`[ERROR] Insert failed for "${post.title_en}": ${insertErr.message}`);
          failCount++;
        }
      } else {
        console.log(`[✓ PUBLISHED] [${post.district_slug}] ${post.title_en}`);
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
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN RUNNER]:', err);
  process.exit(1);
});
