/**
 * POST /api/auto-publish/railway
 *
 * Southern Railway block notice parser.
 * Runs every Friday evening (5 PM IST) via Supabase cron.
 * Generates one post per affected train route for the weekend block.
 *
 * Can also be triggered manually from the admin panel for ad-hoc blocks.
 *
 * Request body:
 * {
 *   source_content?: string,   // paste the SR block notice text here
 *   source_url?: string,       // or provide a URL to fetch
 *   dry_run?: boolean,
 * }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildRailwayBlockPrompt } from '@/lib/autoPublish/geminiPromptBuilder';
import { validateBatch } from '@/lib/autoPublish/postValidator';
import { notifySearchEngines } from '@/lib/seo/instantIndexing';
import { ensureBilingualPost } from '@/services/translate';

const SITE_URL = 'https://www.vizhitn.in';
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Southern Railway block notification page
const SR_DEFAULT_URL = 'https://sr.indianrailways.gov.in/view_detail.jsp?lang=0&dcd=4&id=0,4,268';

function isAuthorized(request) {
  const secret = process.env.AUTO_PUBLISH_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  const authHeader = request.headers.get('authorization') || '';
  return authHeader.replace('Bearer ', '').trim() === secret;
}

async function fetchSourceContent(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VizhiTN-ContentBot/1.0 (+https://vizhitn.in)' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Source fetch failed: ${res.status} ${url}`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);
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
        temperature: 0.3,
        maxOutputTokens: 6144,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
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

  const { source_content, source_url, dry_run = false } = body;

  try {
    // Fetch or use provided content
    let rawContent = source_content || '';
    if (!rawContent) {
      const url = source_url || SR_DEFAULT_URL;
      rawContent = await fetchSourceContent(url);
    }

    const prompt = buildRailwayBlockPrompt({ sourceContent: rawContent });
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
        inserted: 0, skipped: rawPosts.length,
        validation_errors: validationErrors,
        error: 'All posts failed validation',
      }, { status: 422 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
    );

    // Deduplication
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
    console.error('[railway-block]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/auto-publish/railway',
    usage: {
      with_content: { source_content: '<paste SR block notice text>', dry_run: true },
      with_url: { source_url: 'https://sr.indianrailways.gov.in/...' },
    },
  });
}
