/**
 * POST /api/rain-alert
 *
 * IMD rain / school holiday emergency alert publisher.
 * Called every 30 minutes (5 AM–8 PM IST) by the Supabase Edge Function cron.
 *
 * Checks:
 *  1. IMD RSS feed for Red/Orange/Yellow alerts for Tamil Nadu
 *  2. Tamil Nadu Government press release page for school/college holiday announcements
 *
 * If a new alert is found (not already published today), generates and
 * publishes emergency posts immediately.
 *
 * Can also be triggered manually with custom content during live events.
 *
 * Request body:
 * {
 *   source_content?: string,      // manual paste of alert text (bypasses auto-fetch)
 *   district_slugs?: string[],    // override detected districts
 *   dry_run?: boolean,
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildRainAlertPrompt } from '@/lib/autoPublish/geminiPromptBuilder';
import { validateBatch } from '@/lib/autoPublish/postValidator';
import { notifySearchEngines } from '@/lib/seo/instantIndexing';
import { ensureBilingualPost } from '@/services/translate';
import { getISTDateSlug } from '@/lib/autoPublish/districtRotation';

const SITE_URL = 'https://www.vizhitn.in';
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// IMD Chennai RSS (public, no auth)
const IMD_RSS_URL = 'https://mausam.imd.gov.in/imd_latest/contents/warning.rss';
// TN Government news (press releases)
const TN_GOVT_NEWS_URL = 'https://www.tn.gov.in/pressrelease/pressrelease_view';

// All 38 TN districts — used when a state-wide alert is issued
const ALL_DISTRICTS = [
  'chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem',
  'tirunelveli', 'vellore', 'erode', 'thoothukudi', 'dindigul',
  'thanjavur', 'ranipet', 'chengalpattu', 'tiruppur', 'nagapattinam',
  'kallakurichi', 'cuddalore', 'villupuram', 'krishnagiri', 'dharmapuri',
  'namakkal', 'karur', 'nilgiris', 'perambalur', 'ariyalur',
  'pudukkottai', 'mayiladuthurai', 'tiruvarur', 'kancheepuram',
  'tiruvallur', 'ramanathapuram', 'theni', 'sivaganga', 'virudhunagar',
  'tenkasi', 'tirupattur', 'tiruvannamalai', 'kanyakumari',
];

function isAuthorized(request) {
  const secret = process.env.AUTO_PUBLISH_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  const authHeader = request.headers.get('authorization') || '';
  return authHeader.replace('Bearer ', '').trim() === secret;
}

/**
 * Fetch and combine IMD RSS + TN Govt press releases.
 * Returns a plain text summary of today's alerts.
 */
async function fetchAlertSources() {
  const today = getISTDateSlug();
  const parts = [];

  // 1. IMD RSS feed
  try {
    const res = await fetch(IMD_RSS_URL, {
      headers: { 'User-Agent': 'VizhiTN-ContentBot/1.0' },
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const xml = await res.text();
      // Extract item titles and descriptions from RSS (simple regex, no XML parser needed)
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
      const imdAlerts = items
        .map((m) => {
          const title = (m[1].match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
          const desc = (m[1].match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '';
          return `${title}: ${desc}`.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        })
        .filter((s) => s.toLowerCase().includes('tamil') || s.toLowerCase().includes('tn'))
        .slice(0, 10)
        .join('\n');
      if (imdAlerts) parts.push(`=== IMD ALERTS ===\n${imdAlerts}`);
    }
  } catch { /* non-blocking */ }

  // 2. TN Government press releases (check for school holiday keywords)
  try {
    const res = await fetch(TN_GOVT_NEWS_URL, {
      headers: { 'User-Agent': 'VizhiTN-ContentBot/1.0' },
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000);
      if (
        text.toLowerCase().includes('school') ||
        text.toLowerCase().includes('holiday') ||
        text.toLowerCase().includes('rain') ||
        text.toLowerCase().includes('flood')
      ) {
        parts.push(`=== TN GOVERNMENT PRESS RELEASE (${today}) ===\n${text.slice(0, 3000)}`);
      }
    }
  } catch { /* non-blocking */ }

  return parts.join('\n\n');
}

/**
 * Check if we've already published a rain alert for today.
 * Prevents duplicate runs of the cron from re-publishing.
 */
async function hasPublishedTodayRainAlert(supabase) {
  const today = getISTDateSlug();
  const { data } = await supabase
    .from('post')
    .select('id')
    .eq('category_slug', 'environment')
    .eq('post_type', 'alert')
    .gte('created_date', `${today}T00:00:00.000Z`)
    .limit(1);
  return (data || []).length > 0;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2, // Very low — emergency content must be precise
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini empty response');
  return text;
}

function parseGeminiJson(text) {
  let cleaned = text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed : [parsed];
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body = {};
  try { body = await request.json(); } catch { /* empty body ok */ }

  const { source_content, district_slugs, dry_run = false } = body;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
    );

    // Auto-fetch mode: check sources and skip if nothing new
    let rawContent = source_content || '';
    if (!rawContent) {
      rawContent = await fetchAlertSources();
      if (!rawContent || rawContent.trim().length < 50) {
        return NextResponse.json({
          status: 'no_alert',
          message: 'No active rain or holiday alerts found in IMD RSS or TN Govt press releases.',
          checked_at: new Date().toISOString(),
        });
      }

      // Dedup: don't re-publish if we already covered this today (auto-mode only)
      if (!dry_run) {
        const alreadyPublished = await hasPublishedTodayRainAlert(supabase);
        if (alreadyPublished) {
          return NextResponse.json({
            status: 'already_published',
            message: 'Rain alerts already published today. Skipping to prevent duplicates.',
          });
        }
      }
    }

    // Resolve districts — default to all 38 if not specified
    const districts = (district_slugs && district_slugs.length > 0)
      ? district_slugs
      : ALL_DISTRICTS.slice(0, 10); // Cap at 10 districts per run to keep posts manageable

    const prompt = buildRainAlertPrompt({
      sourceContent: rawContent,
      districtSlugs: districts,
    });

    const geminiText = await callGemini(prompt);
    const rawPosts = parseGeminiJson(geminiText);
    const { valid: validPosts, skipped: validationErrors } = validateBatch(rawPosts);

    if (dry_run) {
      return NextResponse.json({
        inserted: 0, skipped: validationErrors.length,
        dry_run: true, posts: validPosts, validation_errors: validationErrors,
      });
    }

    if (validPosts.length === 0) {
      return NextResponse.json({
        inserted: 0, validation_errors: validationErrors,
        error: 'All posts failed validation',
      }, { status: 422 });
    }

    // Dedup by slug
    const { data: existing } = await supabase
      .from('post').select('slug').in('slug', validPosts.map((p) => p.slug));
    const existingSlugs = new Set((existing || []).map((r) => r.slug));
    const newPosts = validPosts.filter((p) => !existingSlugs.has(p.slug));

    // Bilingual
    const bilingualPosts = await Promise.all(
      newPosts.map(async (p) => {
        if (!p.title_ta || !p.content_ta) {
          try { return await ensureBilingualPost(p); } catch { return p; }
        }
        return p;
      })
    );

    const { data: inserted, error: insertError } = await supabase
      .from('post').insert(bilingualPosts).select('id, slug, title_en');

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const newUrls = (inserted || []).map((p) => `${SITE_URL}/post/${p.slug}`);
    if (newUrls.length > 0) notifySearchEngines(newUrls).catch(() => {});
    fetch(`${SITE_URL}/api/revalidate`, { method: 'POST' }).catch(() => {});

    return NextResponse.json({
      inserted: inserted?.length || 0,
      skipped: validationErrors.length,
      duplicates_skipped: validPosts.length - newPosts.length,
      posts: inserted || [],
      validation_errors: validationErrors,
    });

  } catch (err) {
    console.error('[rain-alert]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/rain-alert',
    usage: {
      auto: '{}  — fetches IMD RSS + TN Govt, publishes if alerts found',
      manual: { source_content: '<paste IMD alert text>', district_slugs: ['chennai', 'tiruvallur'] },
      dry_run: { dry_run: true },
    },
  });
}
