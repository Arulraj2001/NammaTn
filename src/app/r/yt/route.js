import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Universal Mobile App Deep-Link Route for YouTube Videos & Shorts
 * /r/yt?v=VIDEO_ID (or /r/yt?s=SHORT_ID)
 *
 * Breaks viewers out of the Instagram / Facebook / WhatsApp in-app browser trap
 * and launches the native YouTube mobile app directly with the user logged in.
 * Enables 1-tap Subscribes, Likes, and Comments.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('v');
  const shortId = searchParams.get('s');
  const id = videoId || shortId || 'dogbbJK399c';
  const isShort = Boolean(shortId);

  const targetWebUrl = isShort
    ? `https://www.youtube.com/shorts/${id}`
    : `https://www.youtube.com/watch?v=${id}`;

  const userAgent = request.headers.get('user-agent') || '';
  const isAndroid = /android/i.test(userAgent);
  const isIos = /iphone|ipad|ipod/i.test(userAgent);

  // If mobile Android: Use Android Intent protocol to launch native YouTube app
  if (isAndroid) {
    const intentUrl = isShort
      ? `intent://www.youtube.com/shorts/${id}#Intent;package=com.google.android.youtube;scheme=https;end`
      : `intent://www.youtube.com/watch?v=${id}#Intent;package=com.google.android.youtube;scheme=https;end`;

    const html = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening in YouTube App... | VizhiTN</title>
  <meta http-equiv="refresh" content="0;url=${intentUrl}">
  <style>
    body {
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-align: center;
      padding: 60px 20px;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255,255,255,0.2);
      border-top-color: #ef4444;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn {
      display: inline-block;
      margin-top: 24px;
      background: #ef4444;
      color: #fff;
      padding: 12px 28px;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>VizhiTN — YouTube செயலியில் திறக்கிறது...</h2>
  <p>தானாக திறக்கவில்லை என்றால், கீழே உள்ள பட்டனை அழுத்தவும்:</p>
  <a class="btn" href="${targetWebUrl}">YouTube-ல் பார்க்க ▶</a>
  <script>
    window.location.href = "${intentUrl}";
    setTimeout(function() {
      window.location.href = "${targetWebUrl}";
    }, 1500);
  </script>
</body>
</html>`;
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  // If mobile iOS: Use vnd.youtube deep-link protocol
  if (isIos) {
    const iosAppUrl = isShort
      ? `vnd.youtube://shorts/${id}`
      : `vnd.youtube://watch?v=${id}`;

    const html = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening in YouTube App... | VizhiTN</title>
  <style>
    body {
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-align: center;
      padding: 60px 20px;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255,255,255,0.2);
      border-top-color: #ef4444;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn {
      display: inline-block;
      margin-top: 24px;
      background: #ef4444;
      color: #fff;
      padding: 12px 28px;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>VizhiTN — YouTube செயலியில் திறக்கிறது...</h2>
  <p>தானாக திறக்கவில்லை என்றால், கீழே உள்ள பட்டனை அழுத்தவும்:</p>
  <a class="btn" href="${targetWebUrl}">YouTube-ல் பார்க்க ▶</a>
  <script>
    window.location.href = "${iosAppUrl}";
    setTimeout(function() {
      window.location.href = "${targetWebUrl}";
    }, 1200);
  </script>
</body>
</html>`;
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  // Desktop / standard browser: Clean 307 temporary redirect
  return NextResponse.redirect(targetWebUrl, 307);
}
