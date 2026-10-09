import { NextResponse } from 'next/server';
import { notifySearchEngines } from '@/lib/seo/instantIndexing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls = body.urls || [
      'https://www.vizhitn.in/',
      'https://www.vizhitn.in/tn-today',
      'https://www.vizhitn.in/tn-politics',
      'https://www.vizhitn.in/school-college-holiday-alerts',
      'https://www.vizhitn.in/power-cuts-today-tamil-nadu',
      'https://www.vizhitn.in/esevai',
      'https://www.vizhitn.in/rti',
      'https://www.vizhitn.in/helplines',
    ];

    console.log(`[API /admin/ping-indexnow] Dispatching ${urls.length} URLs to IndexNow...`);
    await notifySearchEngines(urls);

    return NextResponse.json({
      success: true,
      urlsDispatched: urls.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[API /admin/ping-indexnow] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
