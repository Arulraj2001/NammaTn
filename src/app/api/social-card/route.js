// src/app/api/social-card/route.jsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Category color mappings matching VizhiTN brand palette
const CATEGORY_COLORS = {
  education: { bg: '#6b21a8', border: '#a855f7', text: '#ffffff', label: 'EDUCATION' },
  electricity: { bg: '#b45309', border: '#f59e0b', text: '#ffffff', label: 'ELECTRICITY' },
  'water-sanitation': { bg: '#0e7490', border: '#06b6d4', text: '#ffffff', label: 'WATER & SEWAGE' },
  'road-infrastructure': { bg: '#1d4ed8', border: '#3b82f6', text: '#ffffff', label: 'ROAD & INFRA' },
  'government-schemes': { bg: '#4338ca', border: '#6366f1', text: '#ffffff', label: 'GOVT SCHEMES' },
  'public-safety': { bg: '#b91c1c', border: '#ef4444', text: '#ffffff', label: 'PUBLIC SAFETY' },
  transport: { bg: '#0369a1', border: '#0ea5e9', text: '#ffffff', label: 'TRANSPORT' },
  general: { bg: '#334155', border: '#64748b', text: '#ffffff', label: 'CIVIC UPDATE' }
};

let fontPromise = null;
async function loadTamilFont() {
  if (fontPromise) return fontPromise;
  fontPromise = (async () => {
    try {
      const localFontUrl = new URL('../../../../public/fonts/NotoSansTamil-Bold.ttf', import.meta.url);
      const res = await fetch(localFontUrl);
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}

    try {
      const res = await fetch('https://www.vizhitn.in/fonts/NotoSansTamil-Bold.ttf');
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}

    try {
      const remoteRes = await fetch('https://fonts.gstatic.com/s/notosanstamil/v31/ieVc2YdFI3GCY6SyQy1KfStzYKZgzN1z4LKDbeZce-0429tBManUktuex7shpL0RqKDt_XPQ.ttf');
      if (remoteRes.ok) return await remoteRes.arrayBuffer();
    } catch (_) {}
    return null;
  })();
  return fontPromise;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const title_ta = searchParams.get('title_ta') || 'அரசு கல்லூரி மாணவர்களுக்கு FREE LAPTOP!';
    const subtitle = searchParams.get('subtitle') || '₹300 Cr School Upgrade + 10,000 Schools-க்கு Clean Campus';
    const categoryKey = (searchParams.get('category') || 'education').toLowerCase();
    const bullet1 = searchParams.get('bullet1') || 'வழங்கும் திட்டம் ➔ Vetri Laptop Scheme';
    const bullet2 = searchParams.get('bullet2') || 'பள்ளி நவீனமயமாக்கல் ➔ ₹300 Crore / 3,734 Schools';
    const bullet3 = searchParams.get('bullet3') || 'சுத்தமான வளாகம் ➔ ₹139 Crore / 10,000 Schools';
    const location = searchParams.get('location') || 'தமிழ்நாடு | Statewide';
    const ribbon = searchParams.get('ribbon') || '★ FEATURED';
    const bgImage = searchParams.get('imageUrl') || 'https://vizhitn.in/images/categories/general.webp';

    const categoryTheme = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.education;

    const tamilFontData = await loadTamilFont();
    const fonts = tamilFontData ? [
      {
        name: 'Noto Sans Tamil',
        data: tamilFontData,
        weight: 700,
        style: 'normal'
      }
    ] : [];

    return new ImageResponse(
      (
        <div
          style={{
            width: '1080px',
            height: '1080px',
            display: 'flex',
            position: 'relative',
            backgroundColor: '#071224',
            fontFamily: tamilFontData ? '"Noto Sans Tamil", sans-serif' : 'system-ui, sans-serif',
            overflow: 'hidden'
          }}
        >
          {/* Background Right Image */}
          <img
            src={bgImage}
            alt="Context"
            style={{
              position: 'absolute',
              right: '0',
              top: '0',
              width: '650px',
              height: '1080px',
              objectFit: 'cover'
            }}
          />

          {/* Left Dark Gradient Overlay for Maximum Contrast & Readability */}
          <div
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: '1080px',
              height: '1080px',
              background: 'linear-gradient(90deg, #071224 0%, #071224 54%, rgba(7, 18, 36, 0.92) 65%, rgba(7, 18, 36, 0.3) 85%, transparent 100%)',
              display: 'flex'
            }}
          />

          {/* Top Right "★ FEATURED" Ribbon */}
          {ribbon && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '-50px',
                transform: 'rotate(45deg)',
                backgroundColor: '#eab308',
                color: '#0f172a',
                padding: '10px 70px',
                fontSize: '22px',
                fontWeight: '900',
                letterSpacing: '2px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {ribbon}
            </div>
          )}

          {/* Main Left Content Panel */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              width: '680px',
              height: '980px',
              padding: '60px 40px 40px 60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Header: Logo & Category Badge */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* VizhiTN Logo Block */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    color: '#ffffff',
                    fontSize: '30px',
                    fontWeight: '900'
                  }}
                >
                  ✓
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '36px',
                      fontWeight: '900',
                      color: '#ffffff',
                      letterSpacing: '-0.5px',
                      lineHeight: '1.1'
                    }}
                  >
                    VizhiTN
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#94a3b8',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Community Verified. People Powered.
                  </span>
                </div>
              </div>

              {/* Category Pill */}
              <div
                style={{
                  display: 'flex',
                  alignSelf: 'flex-start',
                  backgroundColor: categoryTheme.bg,
                  border: `2px solid ${categoryTheme.border}`,
                  padding: '8px 24px',
                  borderRadius: '9999px',
                  color: categoryTheme.text,
                  fontSize: '18px',
                  fontWeight: '900',
                  letterSpacing: '1.5px',
                  marginBottom: '28px'
                }}
              >
                {categoryTheme.label}
              </div>

              {/* Big Bold Headline */}
              <div
                style={{
                  fontSize: '46px',
                  fontWeight: '900',
                  color: '#ffffff',
                  lineHeight: '1.25',
                  marginBottom: '18px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {title_ta}
              </div>

              {/* Sub-headline */}
              {subtitle && (
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    color: '#cbd5e1',
                    lineHeight: '1.35',
                    marginBottom: '36px'
                  }}
                >
                  {subtitle}
                </div>
              )}

              {/* 3 Arrow Bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[bullet1, bullet2, bullet3].filter(Boolean).map((bullet, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '21px',
                      fontWeight: '700',
                      color: '#f8fafc',
                      lineHeight: '1.3'
                    }}
                  >
                    <span style={{ marginRight: '12px', color: '#60a5fa', fontSize: '24px' }}>•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read More Website CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '20px',
                fontWeight: '700',
                color: '#fbbf24',
                marginTop: '20px'
              }}
            >
              <span>மேலும் படிக்க: </span>
              <span style={{ color: '#ffffff', marginLeft: '6px' }}>vizhitn.in</span>
            </div>
          </div>

          {/* Bottom Full-Width Location & Handle Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '1080px',
              height: '76px',
              backgroundColor: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 50px',
              zIndex: 20
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', color: '#ffffff', fontSize: '24px', fontWeight: '800' }}>
              <span style={{ marginRight: '10px' }}>📍</span>
              <span>{location}</span>
            </div>
            <div style={{ color: '#ffffff', fontSize: '26px', fontWeight: '900', letterSpacing: '0.5px' }}>
              @vizhi_tn
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        fonts: fonts.length > 0 ? fonts : undefined
      }
    );
  } catch (err) {
    console.error('[social-card] Generation error:', err);
    return new Response(`Failed to generate social card: ${err.message}`, { status: 500 });
  }
}
