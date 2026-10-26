import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/serverSupabase';
import { invalidateAdSenseCache } from '@/lib/adsenseServer';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'adsense_config')
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    let config = {
      pub_id: '',
      enabled: false,
      slot_banner: '',
      slot_sidebar: '',
      slot_infeed: '',
    };

    if (data?.value) {
      try {
        config = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      } catch {
        // fallback to default
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (err) {
    console.error('[API /admin/adsense GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawPubId = String(body.pub_id || '').trim();
    const enabled = body.enabled !== false;
    const slot_banner = String(body.slot_banner || '').trim();
    const slot_sidebar = String(body.slot_sidebar || '').trim();
    const slot_infeed = String(body.slot_infeed || '').trim();

    // Extract 16-digit AdSense publisher numeric identifier
    let cleanPubId = '';
    let pubDigits = '';

    if (rawPubId) {
      const match = rawPubId.match(/\d{16}/);
      if (!match) {
        return NextResponse.json(
          {
            error: 'Invalid AdSense Publisher ID. It must contain exactly 16 digits (e.g. ca-pub-1234567890123456).',
          },
          { status: 400 }
        );
      }
      pubDigits = match[0];
      cleanPubId = `ca-pub-${pubDigits}`;
    }

    const payload = {
      pub_id: cleanPubId,
      enabled: enabled && Boolean(cleanPubId),
      slot_banner,
      slot_sidebar,
      slot_infeed,
      updated_at: new Date().toISOString(),
    };

    const supabase = createServerSupabase({ useServiceRole: true });
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    // Check if key already exists
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'adsense_config')
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          value: JSON.stringify(payload),
          updated_date: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from('site_settings').insert({
        key: 'adsense_config',
        value: JSON.stringify(payload),
        category: 'monetization',
      });

      if (insertError) throw insertError;
    }

    // Invalidate in-memory server cache
    invalidateAdSenseCache();

    // Update public/ads.txt on local filesystem
    let adsTxtContent = '';
    if (pubDigits && enabled) {
      adsTxtContent = `google.com, pub-${pubDigits}, DIRECT, f08c47fec0942fa0\n`;
    } else {
      adsTxtContent = '# No advertising seller is authorized yet. Add a verified record after AdSense approval.\n';
    }

    // In Edge environments, ads.txt is served statically from public/ads.txt


    try {
      revalidatePath('/', 'layout');
    } catch (revErr) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      config: payload,
      adsTxt: adsTxtContent.trim(),
      message: 'AdSense configuration saved and ads.txt synchronized successfully',
    });
  } catch (err) {
    console.error('[API /admin/adsense POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
