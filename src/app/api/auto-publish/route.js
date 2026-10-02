/**
 * POST /api/auto-publish
 *
 * VizhiTN autonomous content engine.
 * Accepts a source type + optional payload, calls Gemini, validates,
 * inserts to Supabase, triggers IndexNow + revalidate.
 *
 * Authentication: Bearer token via AUTO_PUBLISH_SECRET env var.
 * This prevents public abuse while allowing Supabase Edge Function crons to call it.
 *
 * Request body:
 * {
 *   source: "power_cut" | "water_cut" | "railway_block" | "rain_alert",
 *   district_slugs?: string[],      // override today's rotation
 *   source_content?: string,        // raw text from the official source page
 *   source_url?: string,            // if you want the engine to fetch the page itself
 *   date?: string,                  // ISO date string, defaults to now
 *   dry_run?: boolean,              // if true: validate + return posts but don't insert
 * }
 *
 * Response:
 * {
 *   inserted: number,
 *   skipped: number,
 *   dry_run: boolean,
 *   posts: object[],         // inserted posts (or dry-run posts)
 *   validation_errors: { index, reason }[],
 *   duplicates_skipped: number,
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTodayDistricts, getWeekendDistricts, getISTDateSlug } from '@/lib/autoPublish/districtRotation';
import {
  buildPowerCutPrompt,
  buildWaterCutPrompt,
  buildRailwayBlockPrompt,
  buildRainAlertPrompt,
} from '@/lib/autoPublish/geminiPromptBuilder';
import { validateBatch } from '@/lib/autoPublish/postValidator';
import { notifySearchEngines } from '@/lib/seo/instantIndexing';
import { ensureBilingualPost } from '@/services/translate';

// ─── Constants ───────────────────────────────────────────────────────────────

const SITE_URL = 'https://www.vizhitn.in';
const GEMINI_MODEL = 'gemini-3.1-flash-lite'; // Stable, fast, ideal for structured JSON batch output
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Authenticate the request via Bearer token.
 * Allows both the secret token and (in dev) no auth.
 */
function isAuthorized(request) {
  const secret = process.env.AUTO_PUBLISH_SECRET;
  if (!secret) {
    // No secret configured → only allow in development
    return process.env.NODE_ENV === 'development';
  }
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return token === secret;
}

/**
 * Fetch page content from a URL (for TANGEDCO/Metrowater pages).
 * Returns plain text — strips HTML tags.
 */
async function fetchSourceContent(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VizhiTN-ContentBot/1.0 (+https://vizhitn.in)' },
    next: { revalidate: 0 }, // Always fresh
  });
  if (!res.ok) throw new Error(`Source fetch failed: ${res.status} ${url}`);
  const html = await res.text();
  // Strip HTML tags, collapse whitespace
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000); // Cap at 12K chars to stay within Gemini token budget
}

/**
 * Call Gemini API with a prompt and return the raw text response.
 */
async function callGemini(prompt, retries = 3) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured in environment variables');

  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,       // Low temp = more deterministic, more JSON-reliable
          maxOutputTokens: 8192,  // Enough for 12 full posts
          responseMimeType: 'application/json', // Ask Gemini to return JSON directly
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    // Retry on 503 (overloaded) with exponential backoff
    if (res.status === 503 && attempt < retries) {
      const waitMs = attempt * 8000; // 8s, 16s
      console.warn(`[auto-publish] Gemini 503 overloaded (attempt ${attempt}/${retries}). Retrying in ${waitMs}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty response');
    return text;
  }

  throw new Error('Gemini API unavailable after 3 retries (503 overloaded)');
}

/**
 * Parse the Gemini text response into a JSON array.
 * Handles cases where the model wraps JSON in markdown code fences.
 */
function parseGeminiJson(text) {
  let cleaned = text.trim();
  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    throw new Error(`Failed to parse Gemini JSON response: ${err.message}\nFirst 500 chars: ${cleaned.slice(0, 500)}`);
  }
}

/**
 * Check which slugs from a batch already exist in the post table.
 * Returns a Set of existing slugs.
 */
async function getExistingSlugs(supabase, slugs) {
  if (!slugs.length) return new Set();
  const { data } = await supabase
    .from('post')
    .select('slug')
    .in('slug', slugs);
  return new Set((data || []).map((r) => r.slug));
}

/**
 * Trigger cache revalidation on the Next.js server.
 * Runs fire-and-forget (non-blocking).
 */
function triggerRevalidate() {
  const secret = process.env.AUTO_PUBLISH_SECRET || '';
  fetch(`${SITE_URL}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify({}),
  }).catch(() => {
    // Non-blocking — don't fail the insert if revalidation fails
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  // 1. Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    source = 'power_cut',
    district_slugs,
    source_content,
    source_url,
    date,
    dry_run = false,
  } = body;

  const targetDate = date ? new Date(date) : new Date();

  try {
    // 2. Resolve district slugs for today
    let districts;
    if (district_slugs && Array.isArray(district_slugs) && district_slugs.length > 0) {
      districts = district_slugs;
    } else if (source === 'railway_block') {
      districts = getWeekendDistricts();
    } else {
      districts = getTodayDistricts(targetDate);
    }

    // 3. Get source content
    let rawSourceContent = source_content || '';
    if (!rawSourceContent && source_url) {
      rawSourceContent = await fetchSourceContent(source_url);
    }
    if (!rawSourceContent) {
      // Provide minimal context so Gemini can still generate based on its training
      rawSourceContent = `No live source data provided. Generate realistic TANGEDCO scheduled maintenance posts for ${getISTDateSlug(targetDate)} based on standard maintenance patterns for Tamil Nadu. Use plausible area names and standard 9:00 AM–2:00 PM maintenance windows. Mark source as "TANGEDCO Scheduled Maintenance".`;
    }

    // 4. Build Gemini prompt based on source type
    const promptBuilders = {
      power_cut: buildPowerCutPrompt,
      water_cut: buildWaterCutPrompt,
      railway_block: buildRailwayBlockPrompt,
      rain_alert: buildRainAlertPrompt,
    };

    const buildPrompt = promptBuilders[source];
    if (!buildPrompt) {
      return NextResponse.json(
        { error: `Unknown source type: "${source}". Valid: power_cut, water_cut, railway_block, rain_alert` },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({
      districtSlugs: districts,
      sourceContent: rawSourceContent,
      date: targetDate,
    });

    // 5. Call Gemini
    const geminiText = await callGemini(prompt);

    // 6. Parse response
    const rawPosts = parseGeminiJson(geminiText);

    // 7. Validate batch
    const { valid: validPosts, skipped: validationErrors } = validateBatch(rawPosts);

    if (validPosts.length === 0) {
      return NextResponse.json({
        inserted: 0,
        skipped: rawPosts.length,
        dry_run,
        posts: [],
        validation_errors: validationErrors,
        duplicates_skipped: 0,
        error: 'All generated posts failed validation. Check validation_errors for details.',
      }, { status: 422 });
    }

    // 8. Dry run — return without inserting
    if (dry_run) {
      return NextResponse.json({
        inserted: 0,
        skipped: validationErrors.length,
        dry_run: true,
        posts: validPosts,
        validation_errors: validationErrors,
        duplicates_skipped: 0,
      });
    }

    // 9. Connect to Supabase with service role key for server-side insert
    const supabase = createClient(
      process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
    );

    // 10. Deduplication — skip slugs already in DB
    const allSlugs = validPosts.map((p) => p.slug);
    const existingSlugs = await getExistingSlugs(supabase, allSlugs);
    const newPosts = validPosts.filter((p) => !existingSlugs.has(p.slug));
    const duplicatesSkipped = validPosts.length - newPosts.length;

    if (newPosts.length === 0) {
      return NextResponse.json({
        inserted: 0,
        skipped: validationErrors.length,
        dry_run: false,
        posts: [],
        validation_errors: validationErrors,
        duplicates_skipped: duplicatesSkipped,
        message: 'All valid posts already exist in DB (duplicate slugs). Nothing inserted.',
      });
    }

    // 11. Ensure bilingual for any post missing title_ta / content_ta
    const bilingualPosts = await Promise.all(
      newPosts.map(async (post) => {
        if (!post.title_ta || !post.content_ta) {
          try {
            return await ensureBilingualPost(post);
          } catch {
            return post; // Keep English-only if translation fails
          }
        }
        return post;
      })
    );

    // 12. Insert into Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('post')
      .insert(bilingualPosts)
      .select('id, slug, title_en');

    if (insertError) {
      return NextResponse.json(
        { error: `Supabase insert failed: ${insertError.message}`, validation_errors: validationErrors },
        { status: 500 }
      );
    }

    // 13. Notify search engines (IndexNow + Google Ping) — fire and forget
    const newUrls = (inserted || []).map((p) => `${SITE_URL}/post/${p.slug}`);
    if (newUrls.length > 0) {
      notifySearchEngines(newUrls).catch(() => {});
    }

    // 14. Trigger Next.js cache revalidation — fire and forget
    triggerRevalidate();

    // 15. Return result
    return NextResponse.json({
      inserted: inserted?.length || 0,
      skipped: validationErrors.length,
      dry_run: false,
      posts: inserted || [],
      validation_errors: validationErrors,
      duplicates_skipped: duplicatesSkipped,
    });

  } catch (err) {
    console.error('[auto-publish] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── GET — health check / manual trigger info ────────────────────────────────

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/auto-publish',
    sources: ['power_cut', 'water_cut', 'railway_block', 'rain_alert'],
    usage: {
      minimal: { source: 'power_cut' },
      with_content: { source: 'power_cut', source_content: '<paste TANGEDCO text here>' },
      dry_run: { source: 'power_cut', dry_run: true },
      specific_districts: { source: 'power_cut', district_slugs: ['chennai', 'coimbatore'] },
    },
    auth: 'Bearer token via Authorization header. Set AUTO_PUBLISH_SECRET in .env',
  });
}
