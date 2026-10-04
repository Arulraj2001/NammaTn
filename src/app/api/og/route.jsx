import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Category theme colors matching src/lib/categories.js
const CATEGORY_COLORS = {
  'road-infrastructure': { bg: '#172554', border: '#3b82f6', text: '#60a5fa', icon: '🛣️', label: 'ROAD & INFRA' },
  'water-sanitation': { bg: '#083344', border: '#06b6d4', text: '#22d3ee', icon: '💧', label: 'WATER & SEWAGE' },
  'electricity': { bg: '#422006', border: '#eab308', text: '#fde047', icon: '⚡', label: 'ELECTRICITY' },
  'education': { bg: '#3b0764', border: '#a855f7', text: '#c084fc', icon: '📚', label: 'EDUCATION' },
  'healthcare': { bg: '#022c22', border: '#10b981', text: '#34d399', icon: '🏥', label: 'HEALTHCARE' },
  'environment': { bg: '#042f2e', border: '#14b8a6', text: '#2dd4bf', icon: '🌿', label: 'ENVIRONMENT' },
  'public-safety': { bg: '#450a0a', border: '#ef4444', text: '#f87171', icon: '🛡️', label: 'PUBLIC SAFETY' },
  'government-schemes': { bg: '#1e1b4b', border: '#6366f1', text: '#818cf8', icon: '🏛️', label: 'GOVT SCHEMES' },
  'local-development': { bg: '#431407', border: '#f97316', text: '#fb923c', icon: '🏗️', label: 'LOCAL DEV' },
  'transport': { bg: '#0c4a6e', border: '#0ea5e9', text: '#38bdf8', icon: '🚌', label: 'TRANSPORT' },
  'agriculture': { bg: '#1a2e05', border: '#84cc16', text: '#a3e635', icon: '🌾', label: 'AGRICULTURE' },
  'tn-politics': { bg: '#2e1065', border: '#8b5cf6', text: '#a78bfa', icon: '🗳️', label: 'TN POLITICS' },
  'general': { bg: '#1e293b', border: '#64748b', text: '#94a3b8', icon: '💬', label: 'CIVIC NOTICE' }
};

const URGENCY_STYLES = {
  'critical': { bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444', label: 'CRITICAL ALERT' },
  'high': { bg: '#7c2d12', text: '#fdba74', border: '#f97316', label: 'HIGH PRIORITY' },
  'medium': { bg: '#0c4a6e', text: '#7dd3fc', border: '#0284c7', label: 'COMMUNITY ADVISORY' },
  'low': { bg: '#064e3b', text: '#6ee7b7', border: '#059669', label: 'LOCAL UPDATE' }
};

// Resilient font loader (attempts local bundled font first, falls back to Google CDN)
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

    const title = searchParams.get('title') || 'Tamil Nadu Hyperlocal Civic & Governance Report';
    const title_ta = searchParams.get('title_ta') || '';
    const district = (searchParams.get('district') || '').toUpperCase();
    const categorySlug = (searchParams.get('category') || 'general').toLowerCase();
    const urgencyKey = (searchParams.get('urgency') || 'medium').toLowerCase();
    const receipt = searchParams.get('receipt') || '';
    const helpline = searchParams.get('helpline') || '';

    const catStyle = CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS['general'];
    const urgencyStyle = URGENCY_STYLES[urgencyKey] || URGENCY_STYLES['medium'];

    // Try loading font
    const tamilFontData = await loadTamilFont();
    const fonts = tamilFontData ? [
      {
        name: 'Noto Sans Tamil',
        data: tamilFontData,
        style: 'normal',
        weight: 700,
      }
    ] : [];

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundImage: 'radial-gradient(circle at 90% 10%, #1e1b4b 0%, #090e1a 45%, #030712 100%)',
            fontFamily: '"Noto Sans Tamil", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '50px 65px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Subtle Outer Card Glow Border */}
          <div
            style={{
              position: 'absolute',
              top: '25px',
              left: '25px',
              right: '25px',
              bottom: '25px',
              border: `1.5px solid ${catStyle.border}33`,
              borderRadius: '24px',
              pointerEvents: 'none',
            }}
          />

          {/* TOP BAR: Brand + District + Category + Urgency */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* VizhiTN Brand Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #334155',
                  borderRadius: '999px',
                  padding: '8px 18px',
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>
                  VIZHITN.IN
                </span>
              </div>

              {/* District Pill */}
              {district && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#1e293b',
                    border: '1.5px solid #475569',
                    borderRadius: '999px',
                    padding: '8px 16px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>📍</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
                    {district}
                  </span>
                </div>
              )}

              {/* Category Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: catStyle.bg,
                  border: `1.5px solid ${catStyle.border}`,
                  borderRadius: '999px',
                  padding: '8px 18px',
                }}
              >
                <span style={{ fontSize: '14px' }}>{catStyle.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: catStyle.text, letterSpacing: '0.5px' }}>
                  {catStyle.label}
                </span>
              </div>
            </div>

            {/* Urgency Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: urgencyStyle.bg,
                border: `1.5px solid ${urgencyStyle.border}`,
                borderRadius: '999px',
                padding: '8px 18px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: urgencyStyle.border }} />
              <span style={{ fontSize: '13px', fontWeight: 800, color: urgencyStyle.text, letterSpacing: '0.5px' }}>
                {urgencyStyle.label}
              </span>
            </div>
          </div>

          {/* MAIN HEADLINE AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '25px 0' }}>
            {/* English Title */}
            <div
              style={{
                fontSize: title.length > 90 ? '36px' : title.length > 60 ? '42px' : '46px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                maxHeight: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </div>

            {/* Tamil Subtitle (if available) */}
            {title_ta && (
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: catStyle.text,
                  lineHeight: 1.35,
                  maxHeight: '70px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title_ta}
              </div>
            )}
          </div>

          {/* FOOTER BAR: Helpline + Receipt ID + Verification */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid #1e293b',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Civic Receipt ID */}
              {receipt && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#0f172a',
                    border: '1.5px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 14px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>
                    #{receipt}
                  </span>
                </div>
              )}

              {/* Official Helpline Badge */}
              {helpline && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#0f172a',
                    border: '1.5px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 14px',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>📞</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                    {helpline}
                  </span>
                </div>
              )}
            </div>

            {/* Verified Network Stamp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>
                ✓ Verified Civic Proof Network
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                • Tamil Nadu (38 Districts)
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err) {
    console.error('[OG IMAGE ERROR]:', err);
    return new Response(`Failed to generate OG image: ${err.message}`, { status: 500 });
  }
}
