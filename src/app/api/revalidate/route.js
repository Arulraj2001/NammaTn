import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
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

    // Default: revalidate the active feeds and explore pages
    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath('/sitemap-news.xml');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ revalidated: true, paths: ['/explore', '/', '/sitemap-news.xml', '/sitemap.xml'], now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err?.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/explore';
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err?.message }, { status: 500 });
  }
}
