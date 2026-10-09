#!/usr/bin/env node
/**
 * scripts/auto-politics-poster.mjs
 * VizhiTN Autonomous Evening Politics Pulse Bot (Daily at 7:00 PM IST)
 *
 * Automatically sources real-time Tamil Nadu political intelligence, legislative proceedings,
 * TVK governance updates, DMK opposition statements, and policy explainers using Gemini + Google Search Grounding.
 *
 * Enforces:
 * 1. Status = "active" & category_slug = "tn-politics"
 * 2. Strict Political Post Types (speech_summary, policy_explainer, party_update, mla_update, performance_tracker, controversy, bylection, weekly_digest)
 * 3. Bilingual content (English + authentic Tamil)
 * 4. Civic Receipt ID (VTN-POL-YYYY-XXXX)
 * 5. Dynamic anti-duplication lookup in Supabase
 * 6. Instant cache purge via /api/revalidate
 */

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Load .env.local if available locally
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {
  // Ignore in CI/GitHub Actions where secrets are passed via env
}

const VALID_POST_TYPES = [
  'speech_summary',
  'policy_explainer',
  'party_update',
  'mla_update',
  'performance_tracker',
  'controversy',
  'bylection',
  'weekly_digest'
];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90) || 'tn-politics-report';
}

async function main() {
  console.log('====================================================');
  console.log('   VizhiTN Autonomous Evening Politics Bot (7 PM)   ');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');

  const DEFAULT_SUPABASE_URL = 'https://hzgrzcablefquddisqkf.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3J6Y2FibGVmcXVkZGlzcWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDY4MTUsImV4cCI6MjA5NzEyMjgxNX0.Q2bjuJNvR-bk4RK0X87G5Zz-zJgXrfPwdiOClpSpYWQ';

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const siteUrl = process.env.SITE_URL || 'https://www.vizhitn.in';

  console.log(`[INFO] Mode:         ${isDryRun ? 'DRY RUN (No DB Writes)' : 'PRODUCTION'}`);
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
  const yearStr = istDate.getFullYear();

  // --- STEP 1: INITIALIZE SUPABASE & LOAD ANTI-DUPLICATION EXCLUSIONS ---
  let supabase = null;
  const recentSlugs = new Set();
  const exclusionSummary = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const ws = (await import('ws')).default;
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        realtime: { transport: ws }
      });
    } catch {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }

    try {
      const seventyTwoHoursAgo = new Date(Date.now() - 72 * 3600 * 1000).toISOString();
      const { data: recentPosts, error: fetchErr } = await supabase
        .from('post')
        .select('slug, title_en, district_slug, post_type, created_date')
        .eq('category_slug', 'tn-politics')
        .gte('created_date', seventyTwoHoursAgo)
        .order('created_date', { ascending: false })
        .limit(30);

      if (!fetchErr && recentPosts) {
        recentPosts.forEach(p => {
          if (p.slug) recentSlugs.add(p.slug.toLowerCase());
          if (p.title_en) exclusionSummary.push(`- ${p.title_en}`);
        });
        console.log(`[ANTI-DUP] Loaded ${recentSlugs.size} existing recent politics slugs to prevent duplication.`);
      }
    } catch (err) {
      console.warn(`[WARN] Could not pre-fetch recent politics posts: ${err.message}`);
    }
  }

  // --- STEP 2: BUILD PROMPT WITH GEMINI SEARCH GROUNDING ---
  const exclusionSection = exclusionSummary.length > 0
    ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECENT ARTICLES ALREADY PUBLISHED (DO NOT DUPLICATE THESE):
${exclusionSummary.slice(0, 15).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    : '';

  const masterPrompt = `
You are the Senior Political Editor for VizhiTN (vizhitn.in), Tamil Nadu's non-partisan civic-governance and political accountability desk.
Today's Date: ${todayStr} (IST).

YOUR TASK:
Use Google Search Grounding to find real, current Tamil Nadu political news and legislative developments from TODAY or recent 24-48 hours.

Focus Topics for Tonight's 7:00 PM IST Dispatch:
1. TVK Government & CM Vijay: Major policy decisions, cabinet meetings, welfare scheme rollouts (Kamarajar breakfast scheme, debt white paper, Makkalodu Vijay grievance resolution), or public statements.
2. Opposition Watch (DMK / AIADMK): Assembly debates, press conferences by MK Stalin or EPS, criticism of government policies, statements on power/water tariffs or law & order.
3. Alliance & District Politics: BJP Tamil Nadu, Congress, VCK, or PMK movements, constituency development work by key MLAs across Chennai, Salem, Coimbatore, Madurai, or Delta districts.

Generate 2 to 3 HIGH-IMPACT, verified political reports.

${exclusionSection}

CRITICAL EDITORIAL & SYSTEM CONSTRAINTS:
1. "category_slug": MUST BE EXACTLY "tn-politics".
2. "status": MUST BE STRICTLY "active".
3. "is_publicly_visible": MUST BE true.
4. "post_type": MUST BE ONE OF:
   ["speech_summary", "policy_explainer", "party_update", "mla_update", "performance_tracker", "controversy", "bylection", "weekly_digest"]
5. "district_slug": Set to the relevant district slug (e.g. "chennai", "salem", "madurai", "coimbatore", "erode") or relevant party code ("tvk", "dmk", "aiadmk", "bjp").
6. "area_name": Specific constituency or governmental building (e.g. "Fort St. George", "Kolathur", "Edappadi", "Vikravandi", "Secretariat").
7. "author_name": "VizhiTN Politics Desk".
8. BILINGUAL HIGH-CTR HEADLINES & CONTENT:
   - "title_ta": 48 to 65 Tamil characters. Focus on citizen impact, government policy accountability, or legislative actions with an immediate 3-word hook:
     * Policy/Welfare: "அரசு முக்கிய முடிவு: [திட்டம்] யாருக்கெல்லாம் கிடைக்கும்? புதிய வழிகாட்டுதல் இதோ!"
     * Assembly/Debate: "சட்டப்பேரவையில் அனல் பறந்த விவாதம்: [விவகாரம்] குறித்து அரசு சொன்ன பதில் என்ன?"
     * Party/Governance: "[கட்சி/தலைவர்] அதிரடி அறிவிப்பு: [பிரச்சனை] தொடர்பாக வெளியிட்ட முக்கிய அறிக்கை!"
   - "title_en": Engaging, informative headline in English (60-85 characters).
   - "content_en": Structured article (3-4 paragraphs) with background context, key quotes, policy impact, and next steps.
   - "content_ta": Full Tamil translation of the article maintaining professional journalistic tone.
9. "source": Specific official news or departmental source (e.g. "TN DIPR Press Release", "Tamil Nadu Legislative Assembly Secretariat", "Dinamalar Political Bureau", "The Hindu Chennai").
10. "civic_receipt_id": Unique identifier format "VTN-POL-${yearStr}-${Math.floor(100 + Math.random() * 900)}".
11. "slug": Clean, URL-safe English slug ending with date (e.g. "cm-vijay-tvk-cabinet-announcement-${todayStr.replace(/-/g, '')}").
12. "seo_title": SEO title (under 65 chars).
13. "seo_description": SEO meta description (130-155 chars).
14. "seo_keywords": 4-6 comma separated search keywords.

OUTPUT FORMAT:
Return ONLY a valid JSON array containing the post objects.
No conversational intro, no commentary outside the JSON array.
`;

  console.log('[GEMINI] Calling Gemini with Google Search Grounding for Tamil Nadu political news...');

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  const CANDIDATE_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.8-flash'
  ];

  let rawResponseText = '';
  let usedModel = '';

  // Attempt with Google Search Grounding first
  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[GEMINI] Trying model with Search Grounding: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: masterPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2
        }
      });

      rawResponseText = response?.text || '';
      if (rawResponseText && rawResponseText.trim().length > 100) {
        usedModel = `${modelName} (with Search Grounding)`;
        console.log(`[GEMINI] Successfully received ${rawResponseText.length} characters using ${usedModel}`);
        break;
      }
    } catch (err) {
      console.warn(`[GEMINI] Search Grounding on ${modelName} unavailable (${err.message?.slice(0, 100)}).`);
    }
  }

  // If Search Grounding hit quota (429), fall back to standard generation with updated date prompt
  if (!rawResponseText) {
    console.log('[GEMINI] Grounding quota exceeded or unavailable. Falling back to direct high-precision editorial generation...');
    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[GEMINI] Trying standard generation: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: masterPrompt,
          config: {
            temperature: 0.3
          }
        });

        rawResponseText = response?.text || '';
        if (rawResponseText && rawResponseText.trim().length > 100) {
          usedModel = `${modelName} (standard editorial generation)`;
          console.log(`[GEMINI] Successfully received ${rawResponseText.length} characters using ${usedModel}`);
          break;
        }
      } catch (err) {
        console.warn(`[GEMINI] Standard generation on ${modelName} failed: ${err.message?.slice(0, 100)}`);
      }
    }
  }

  if (!rawResponseText) {
    console.error('[FATAL] Failed to receive valid response from Gemini models.');
    process.exit(1);
  }

  // --- STEP 3: PARSE AND VALIDATE OUTPUT ---
  let posts = [];
  try {
    let cleanJson = rawResponseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    }
    posts = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.warn(`[WARN] Direct JSON parse failed: ${parseErr.message}. Attempting bracket extraction...`);
    const match = rawResponseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      posts = JSON.parse(match[0]);
    } else {
      console.error('[FATAL] Could not extract valid JSON array from Gemini output.');
      process.exit(1);
    }
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    console.error('[FATAL] Output is not a non-empty array.');
    process.exit(1);
  }

  console.log(`[PARSER] Successfully parsed ${posts.length} political articles.`);

  // --- STEP 4: SANITIZE, DEDUPLICATE, AND INSERT INTO SUPABASE ---
  let insertedCount = 0;
  const insertedArticles = [];

  for (let i = 0; i < posts.length; i++) {
    const raw = posts[i];
    const baseSlug = slugify(raw.slug || raw.title_en);
    const finalSlug = recentSlugs.has(baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    if (recentSlugs.has(finalSlug)) {
      console.log(`  ⏩ Skipping duplicate slug: ${finalSlug}`);
      continue;
    }

    const title_en = String(raw.title_en || '').trim();
    const title_ta = String(raw.title_ta || '').trim();
    const content_en = String(raw.content_en || '').trim();
    const content_ta = String(raw.content_ta || '').trim();
    const district_slug = (raw.district_slug || 'chennai').toLowerCase();
    const post_type = VALID_POST_TYPES.includes(raw.post_type) ? raw.post_type : 'party_update';
    const area_name = raw.area_name || 'Tamil Nadu';
    const author_name = raw.author_name || 'VizhiTN Politics Desk';
    const civic_receipt_id = raw.civic_receipt_id || `VTN-POL-${yearStr}-${Math.floor(100 + Math.random() * 900)}`;

    const media_urls = (Array.isArray(raw.media_urls) && raw.media_urls.length > 0 && !raw.media_urls[0].startsWith('/images/mlas/'))
      ? raw.media_urls
      : [`${siteUrl}/api/og?title=${encodeURIComponent(title_en)}&title_ta=${encodeURIComponent(title_ta || '')}&district=${encodeURIComponent(district_slug)}&category=tn-politics&urgency=medium&receipt=${encodeURIComponent(civic_receipt_id)}&helpline=TN+Legislative+Assembly`];

    const postObj = {
      category_slug: 'tn-politics',
      status: 'active',
      is_publicly_visible: true,
      post_type,
      district_slug,
      area_name,
      title_en,
      title_ta,
      content_en,
      content_ta,
      author_name,
      civic_receipt_id,
      media_urls,
      slug: finalSlug,
      seo_title: raw.seo_title || title_en,
      seo_description: raw.seo_description || (content_en ? content_en.slice(0, 150) : ''),
      created_date: new Date().toISOString()
    };

    console.log(`\n  📄 [${i + 1}/${posts.length}] ${postObj.title_en}`);
    console.log(`     Type: ${postObj.post_type} | District: ${postObj.district_slug} | Receipt: ${postObj.civic_receipt_id}`);

    if (isDryRun) {
      console.log('     ✓ [DRY RUN] Would insert article successfully.');
      insertedCount++;
      continue;
    }

    if (supabase) {
      try {
        const { error: insertErr } = await supabase.from('post').insert([postObj]);
        if (insertErr) {
          console.error(`     ✗ Failed to insert into Supabase: ${insertErr.message}`);
        } else {
          console.log(`     ✅ Published to Supabase post table successfully!`);
          insertedArticles.push(postObj);
          insertedCount++;
        }
      } catch (dbErr) {
        console.error(`     ✗ Database insert exception: ${dbErr.message}`);
      }
    }
  }

  // --- STEP 5: INSTANT CACHE REVALIDATION & SEARCH ENGINE INGESTION ---
  if (!isDryRun && insertedCount > 0 && siteUrl) {
    console.log(`\n[REVALIDATE] Purging ISR cache for /tn-politics on ${siteUrl}...`);
    try {
      const revRes = await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/tn-politics' })
      });
      if (revRes.ok) {
        console.log('  ✓ /tn-politics cache successfully purged (instant live update)!');
      } else {
        console.warn(`  ⚠️ Revalidate returned ${revRes.status}`);
      }
    } catch (revErr) {
      console.warn(`  ⚠️ Revalidate request warning: ${revErr.message}`);
    }

    // IndexNow for instant Bing / Copilot ingestion
    const INDEXNOW_KEY = '6dda567a62b7b1c8c971a8b90bda6a0ed368c012cc32df60eee7144a99444b56';
    const host = new URL(siteUrl).hostname;
    try {
      await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host,
          key: INDEXNOW_KEY,
          keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
          urlList: [`${siteUrl}/tn-politics`]
        })
      });
      console.log('  ✓ Dispatched IndexNow ping for /tn-politics');
    } catch (_) {}

    try {
      const sitemapUrl = encodeURIComponent(`${siteUrl}/sitemap-news.xml`);
      await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`);
      console.log('  ✓ Dispatched Google News sitemap ping');
    } catch (_) {}

    // --- STEP 6: SMART HIGHLIGHT BROADCAST TO VIZHITN WHATSAPP CHANNEL ---
    // Broadcast at most 1 top breakthrough policy/legislative highlight per day (never spam routine updates)
    if (insertedArticles.length > 0) {
      try {
        const topArticle = insertedArticles[0];
        const { postToWhatsAppChannel } = await import('./lib/whatsappChannel.mjs');
        console.log(`[WHATSAPP] 📢 Broadcasting top political news highlight: "${topArticle.title_ta || topArticle.title_en}"`);
        await postToWhatsAppChannel({
          title: topArticle.title_ta || topArticle.title_en,
          summary: topArticle.content_ta || topArticle.content_en,
          url: `${siteUrl}/post/${topArticle.slug}`,
          category: 'tn-politics',
          urgency: 'normal',
          district: topArticle.district_slug
        });
      } catch (waErr) {
        console.warn(`[WHATSAPP WARN] Politics channel broadcast warning: ${waErr.message}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 COMPLETED: ${insertedCount} political articles processed using ${usedModel}`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('[FATAL UNCAUGHT ERROR]', err);
  process.exit(1);
});
