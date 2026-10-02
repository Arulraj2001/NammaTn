/**
 * VizhiTN Daily Content Trigger
 * Supabase Edge Function — called by pg_cron at 6:30 AM IST Mon–Fri
 *
 * This function calls the Next.js /api/auto-publish endpoint to generate
 * and publish today's civic content batch autonomously.
 *
 * Deploy command:
 *   supabase functions deploy daily-content-trigger
 *
 * Enable cron (run once in Supabase SQL editor):
 *   SELECT cron.schedule(
 *     'vizhitn-daily-content',
 *     '0 1 * * 1-5',            -- 1:00 AM UTC = 6:30 AM IST, Mon-Fri
 *     $$
 *       SELECT net.http_post(
 *         url := 'https://vizhitn-daily-content-trigger.<project-ref>.supabase.co/functions/v1/daily-content-trigger',
 *         headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SUPABASE_ANON_KEY>"}'::jsonb,
 *         body := '{}'::jsonb
 *       ) AS request_id;
 *     $$
 *   );
 *
 * Required env vars in Supabase Edge Function settings:
 *   SITE_URL           = https://www.vizhitn.in
 *   AUTO_PUBLISH_SECRET = (same value as in Next.js .env)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// TANGEDCO shutdown page (publicly accessible, no auth required)
const TANGEDCO_SOURCE_URL = 'https://www.tnebltd.gov.in/outages/viewshutdown.xhtml';

// Metrowater advisory page
const METROWATER_SOURCE_URL = 'https://www.chennaimetrowater.tn.gov.in/watersupply.html';

serve(async (_req: Request): Promise<Response> => {
  const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.vizhitn.in';
  const SECRET = Deno.env.get('AUTO_PUBLISH_SECRET') || '';

  const headers = {
    'Content-Type': 'application/json',
    ...(SECRET ? { Authorization: `Bearer ${SECRET}` } : {}),
  };

  const results: Record<string, unknown> = {};

  // ── Batch 1: Power cuts ──────────────────────────────────────────────────
  try {
    // Fetch TANGEDCO source
    let tangedcoContent = '';
    try {
      const sourceRes = await fetch(TANGEDCO_SOURCE_URL, {
        headers: { 'User-Agent': 'VizhiTN-ContentBot/1.0 (+https://vizhitn.in)' },
      });
      if (sourceRes.ok) {
        const html = await sourceRes.text();
        tangedcoContent = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 12000);
      }
    } catch {
      // Proceed with empty content — prompt builder handles this gracefully
    }

    const powerRes = await fetch(`${SITE_URL}/api/auto-publish`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: 'power_cut',
        source_content: tangedcoContent || undefined,
      }),
    });
    results.power_cut = await powerRes.json();
  } catch (err) {
    results.power_cut = { error: String(err) };
  }

  // ── Batch 2: Water supply ────────────────────────────────────────────────
  try {
    let waterContent = '';
    try {
      const sourceRes = await fetch(METROWATER_SOURCE_URL, {
        headers: { 'User-Agent': 'VizhiTN-ContentBot/1.0 (+https://vizhitn.in)' },
      });
      if (sourceRes.ok) {
        const html = await sourceRes.text();
        waterContent = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 8000);
      }
    } catch {
      // Proceed with empty content
    }

    const waterRes = await fetch(`${SITE_URL}/api/auto-publish`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: 'water_cut',
        source_content: waterContent || undefined,
      }),
    });
    results.water_cut = await waterRes.json();
  } catch (err) {
    results.water_cut = { error: String(err) };
  }

  // ── Summary log ──────────────────────────────────────────────────────────
  const summary = {
    timestamp: new Date().toISOString(),
    power_cut_inserted: (results.power_cut as any)?.inserted ?? 'error',
    water_cut_inserted: (results.water_cut as any)?.inserted ?? 'error',
    results,
  };

  console.log('[vizhitn-daily-trigger] Complete:', JSON.stringify(summary, null, 2));

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
