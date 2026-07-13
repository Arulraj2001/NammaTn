import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;

export async function GET() {
  let publisherId = '';

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
      process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY,
    );
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'adsense_publisher_id')
      .maybeSingle();

    publisherId = data?.value?.trim() || '';
  } catch {
    publisherId = '';
  }

  const body = /^ca-pub-\d+$/.test(publisherId)
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
