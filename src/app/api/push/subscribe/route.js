import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabase } from '@/lib/serverSupabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BOWJBajbZAmrHn-BWGcMUfj_BanHnC34wRU9k8IRfkITg-E399GVaQNqjuLqnZ1zqtqnhCXQRqahgM44MfXdQAU';
  return NextResponse.json({ publicKey });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { subscription, district = 'all' } = body || {};

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: 'Invalid push subscription payload' }, { status: 400 });
    }

    const supabase = createServerSupabase({ useServiceRole: true });
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    // Unique deterministic key from endpoint hash
    const endpointHash = crypto.createHash('sha256').update(subscription.endpoint).digest('hex').slice(0, 32);
    const subKey = `webpush_${endpointHash}`;

    const { error: upsertErr } = await supabase.from('site_settings').upsert(
      {
        key: subKey,
        value: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          district: String(district).toLowerCase().trim(),
          updated_at: new Date().toISOString(),
        }),
        category: 'web_push',
        updated_date: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (upsertErr) {
      console.error('[WebPush] Upsert error:', upsertErr.message);
      return NextResponse.json({ error: 'Failed to record subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscribed to VizhiTN alerts' });
  } catch (err) {
    console.error('[WebPush] Subscription error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

