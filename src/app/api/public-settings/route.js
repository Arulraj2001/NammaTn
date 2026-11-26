import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/serverSupabase';

export const revalidate = 3600;

const EXCLUDED_CATEGORIES = '("dispatch_ledger","tnpsc_questions","tnpsc_automation")';

export async function GET() {
  try {
    const supabase = createServerSupabase();
    if (!supabase) {
      return NextResponse.json({}, { status: 200 });
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .not('category', 'in', EXCLUDED_CATEGORIES)
      .order('key', { ascending: true })
      .limit(100);

    if (error) {
      console.warn('[public-settings] Supabase query failed:', error.message);
      return NextResponse.json({}, { status: 200 });
    }

    const map = (data || []).reduce((acc, row) => {
      if (row?.key) acc[row.key] = row.value;
      return acc;
    }, {});

    return NextResponse.json(map, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.warn('[public-settings] Error:', err?.message);
    return NextResponse.json({}, { status: 200 });
  }
}
