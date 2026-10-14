import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

function isAuthorized(request) {
  // Reuse the automation secret when a dedicated revalidation secret has not
  // been configured. Never expose cache invalidation to anonymous requests.
  const secret = process.env.REVALIDATE_SECRET || process.env.AUTO_PUBLISH_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get('authorization') || '';
  const suppliedSecret = authorization.replace(/^Bearer\s+/i, '').trim()
    || request.headers.get('x-revalidate-secret')?.trim();
  return suppliedSecret === secret;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const path = body.path;
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    // Default: revalidate the active feeds, evergreen hubs, and sitemaps
    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath('/power-cuts-today-tamil-nadu');
    revalidatePath('/school-college-holiday-alerts');
    revalidatePath('/sitemap-news.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      revalidated: true,
      paths: ['/explore', '/', '/power-cuts-today-tamil-nadu', '/school-college-holiday-alerts', '/sitemap-news.xml', '/sitemap.xml'],
      now: Date.now()
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST.' }, { status: 405 });
}
