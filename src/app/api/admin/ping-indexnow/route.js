import { NextResponse } from 'next/server';
import { notifySearchEngines } from '@/lib/seo/instantIndexing';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls = body.urls || [
      'https://vizhitn.in/',
      'https://vizhitn.in/tn-today',
      'https://vizhitn.in/school-college-holiday-alerts',
      'https://vizhitn.in/power-cuts-today-tamil-nadu',
      'https://vizhitn.in/esevai',
      'https://vizhitn.in/rti',
      'https://vizhitn.in/helplines',
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
