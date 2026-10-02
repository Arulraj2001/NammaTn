/**
 * VizhiTN Rain Alert Monitor
 * Supabase Edge Function — runs every 30 minutes from 5 AM to 8 PM IST
 * (equivalent to 11:30 PM UTC to 2:30 PM UTC the next day)
 *
 * Deploy:
 *   supabase functions deploy rain-monitor
 *
 * Enable cron (run in Supabase SQL editor):
 *   SELECT cron.schedule(
 *     'vizhitn-rain-monitor',
 *     '*/30 23,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14 * * *',  -- 11:30PM–2:30PM UTC = 5AM–8PM IST
 *     $$
 *       SELECT net.http_post(
 *         url := 'https://<project-ref>.supabase.co/functions/v1/rain-monitor',
 *         headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SUPABASE_ANON_KEY>"}'::jsonb,
 *         body := '{}'::jsonb
 *       ) AS request_id;
 *     $$
 *   );
 *
 * Required env vars:
 *   SITE_URL            = https://www.vizhitn.in
 *   AUTO_PUBLISH_SECRET = (same value as Next.js .env)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (_req: Request): Promise<Response> => {
  const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.vizhitn.in';
  const SECRET = Deno.env.get('AUTO_PUBLISH_SECRET') || '';

  try {
    const res = await fetch(`${SITE_URL}/api/rain-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SECRET ? { Authorization: `Bearer ${SECRET}` } : {}),
      },
      body: JSON.stringify({}), // Empty body = auto-fetch mode
    });

    const result = await res.json();
    console.log('[rain-monitor]', JSON.stringify({
      timestamp: new Date().toISOString(),
      status: result.status || 'ok',
      inserted: result.inserted ?? 0,
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[rain-monitor] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
