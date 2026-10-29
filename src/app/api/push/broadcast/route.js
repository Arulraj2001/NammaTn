import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServerSupabase } from '@/lib/serverSupabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request) {
  const secret = process.env.AUTO_PUBLISH_SECRET;
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (secret && token === secret) return true;
  // Also allow in dev environment
  return process.env.NODE_ENV === 'development';
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized broadcast request' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title = 'VizhiTN Civic Alert | தமிழ்நாடு அவசர அறிவிப்பு',
      body: alertBody = 'New Tamil Nadu civic alert reported.',
      url = '/',
      district = 'all',
      tag = 'civic-alert',
      requireInteraction = false,
    } = body || {};

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BOWJBajbZAmrHn-BWGcMUfj_BanHnC34wRU9k8IRfkITg-E399GVaQNqjuLqnZ1zqtqnhCXQRqahgM44MfXdQAU';
    const privateKey = process.env.VAPID_PRIVATE_KEY || 'TIYR61x8WLRVVkIdyEl70bUV7t55JarB2g8JfQLmri8';
    const subject = process.env.VAPID_SUBJECT || 'mailto:vizhitnin@gmail.com';

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const supabase = createServerSupabase({ useServiceRole: true });
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    // Query active web push subscriptions from site_settings
    const { data: rows, error: fetchErr } = await supabase
      .from('site_settings')
      .select('id, key, value')
      .eq('category', 'web_push');

    if (fetchErr) {
      console.error('[WebPush] Fetch subscriptions error:', fetchErr.message);
      return NextResponse.json({ error: 'Failed to retrieve subscribers' }, { status: 500 });
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true, message: 'No active subscribers found', sent: 0 });
    }

    const payload = JSON.stringify({
      title,
      body: alertBody,
      url,
      tag,
      requireInteraction,
      icon: '/android-chrome-192x192.png',
    });

    const targetDistrict = String(district).toLowerCase().trim();
    const deadSubKeys = [];
    let sentCount = 0;
    let failedCount = 0;

    const pushPromises = rows.map(async (row) => {
      let subData = null;
      try {
        subData = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      } catch {
        deadSubKeys.push(row.key);
        return;
      }

      if (!subData?.endpoint || !subData?.keys) {
        deadSubKeys.push(row.key);
        return;
      }

      // Check district targeting
      if (targetDistrict !== 'all' && subData.district && subData.district !== 'all' && subData.district !== targetDistrict) {
        return; // Skip subscriber from different district
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: subData.endpoint,
            keys: subData.keys,
          },
          payload,
          { TTL: 86400 }
        );
        sentCount++;
      } catch (err) {
        failedCount++;
        // 410 Gone or 404 Not Found indicates expired or unsubscribed endpoint
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadSubKeys.push(row.key);
        }
      }
    });

    await Promise.allSettled(pushPromises);

    // Prune dead subscriptions asynchronously
    if (deadSubKeys.length > 0) {
      supabase
        .from('site_settings')
        .delete()
        .in('key', deadSubKeys)
        .then(() => {
          console.log(`[WebPush] Pruned ${deadSubKeys.length} dead push subscriptions.`);
        })
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      totalSubscribers: rows.length,
      sent: sentCount,
      failed: failedCount,
      pruned: deadSubKeys.length,
    });
  } catch (err) {
    console.error('[WebPush] Broadcast error:', err);
    return NextResponse.json({ error: err.message || 'Broadcast failed' }, { status: 500 });
  }
}

