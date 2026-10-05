import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Category theme colors and bilingual labels matching src/lib/categories.js & src/lib/tnTodayCategories.js
const CATEGORY_COLORS = {
  'road-infrastructure': { bg: '#172554', border: '#3b82f6', text: '#60a5fa', icon: '🛣️', label: 'ROAD & INFRA', label_ta: 'சாலை & கட்டமைப்பு' },
  'water-sanitation': { bg: '#083344', border: '#06b6d4', text: '#22d3ee', icon: '💧', label: 'WATER & SEWAGE', label_ta: 'குடிநீர் & கழிவுநீர்' },
  'electricity': { bg: '#422006', border: '#eab308', text: '#fde047', icon: '⚡', label: 'ELECTRICITY', label_ta: 'மின்சாரம் & பராமரிப்பு' },
  'education': { bg: '#3b0764', border: '#a855f7', text: '#c084fc', icon: '📚', label: 'EDUCATION', label_ta: 'பள்ளிக் கல்வி' },
  'healthcare': { bg: '#022c22', border: '#10b981', text: '#34d399', icon: '🏥', label: 'HEALTHCARE', label_ta: 'பொது சுகாதாரம்' },
  'environment': { bg: '#042f2e', border: '#14b8a6', text: '#2dd4bf', icon: '🌿', label: 'ENVIRONMENT', label_ta: 'சுற்றுச்சூழல்' },
  'public-safety': { bg: '#450a0a', border: '#ef4444', text: '#f87171', icon: '🛡️', label: 'PUBLIC SAFETY', label_ta: 'மக்கள் பாதுகாப்பு' },
  'government-schemes': { bg: '#1e1b4b', border: '#6366f1', text: '#818cf8', icon: '🏛️', label: 'GOVT SCHEMES', label_ta: 'அரசு நலத்திட்டங்கள்' },
  'local-development': { bg: '#431407', border: '#f97316', text: '#fb923c', icon: '🏗️', label: 'LOCAL DEV', label_ta: 'உள்ளாட்சி மேம்பாடு' },
  'transport': { bg: '#0c4a6e', border: '#0ea5e9', text: '#38bdf8', icon: '🚌', label: 'TRANSPORT', label_ta: 'போக்குவரத்து' },
  'agriculture': { bg: '#1a2e05', border: '#84cc16', text: '#a3e635', icon: '🌾', label: 'AGRICULTURE', label_ta: 'வேளாண்மை' },
  'tn-politics': { bg: '#2e1065', border: '#8b5cf6', text: '#a78bfa', icon: '🗳️', label: 'TN POLITICS', label_ta: 'தமிழ்நாடு அரசியல்' },
  'economy': { bg: '#2e1065', border: '#f59e0b', text: '#fbbf24', icon: '💰', label: 'ECONOMY', label_ta: 'பொருளாதாரம் & தொழில்' },
  'infrastructure': { bg: '#172554', border: '#3b82f6', text: '#60a5fa', icon: '🏗️', label: 'INFRASTRUCTURE', label_ta: 'உள்கட்டமைப்பு' },
  'general': { bg: '#1e293b', border: '#64748b', text: '#94a3b8', icon: '💬', label: 'CIVIC NOTICE', label_ta: 'மக்கள் தகவல்' }
};

const URGENCY_STYLES = {
  'critical': { bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444', label: 'CRITICAL ALERT', label_ta: 'அவசர எச்சரிக்கை' },
  'high': { bg: '#7c2d12', text: '#fdba74', border: '#f97316', label: 'HIGH PRIORITY', label_ta: 'முக்கிய அறிவிப்பு' },
  'medium': { bg: '#0c4a6e', text: '#7dd3fc', border: '#0284c7', label: 'COMMUNITY ADVISORY', label_ta: 'கள நிலவரம்' },
  'low': { bg: '#064e3b', text: '#6ee7b7', border: '#059669', label: 'LOCAL UPDATE', label_ta: 'உள்ளூர் தகவல்' }
};

// Resilient font loader (tries local file, production URL, then Google CDN)
let fontPromise = null;
async function loadTamilFont() {
  if (fontPromise) return fontPromise;
  fontPromise = (async () => {
    // 1. Try local filesystem via import.meta.url
    try {
      const localFontUrl = new URL('../../../../public/fonts/NotoSansTamil-Bold.ttf', import.meta.url);
      const res = await fetch(localFontUrl);
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}

    // 2. Try fetching from production site origin
    try {
      const res = await fetch('https://www.vizhitn.in/fonts/NotoSansTamil-Bold.ttf');
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}

    // 3. Fallback to Google Fonts CDN
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
    const lang = searchParams.get('lang') || (title_ta && !title ? 'ta' : 'en');
    const isTamilPrimary = lang === 'ta' && Boolean(title_ta);

    const catStyle = CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS['general'];
    const urgencyStyle = URGENCY_STYLES[urgencyKey] || URGENCY_STYLES['medium'];

    // Load Tamil font and register across multiple weights to guarantee strict matching in Satori
    const tamilFontData = await loadTamilFont();
    const fonts = tamilFontData ? [
      {
        name: 'Noto Sans Tamil',
        data: tamilFontData,
        style: 'normal',
        weight: 700,
      },
      {
        name: 'Noto Sans Tamil',
        data: tamilFontData,
        style: 'normal',
        weight: 600,
      },
      {
        name: 'Noto Sans Tamil',
        data: tamilFontData,
        style: 'normal',
        weight: 400,
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
            fontFamily: 'Noto Sans Tamil, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            padding: '45px 55px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Subtle Outer Card Glow Border */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: `1.5px solid ${catStyle.border}44`,
              borderRadius: '24px',
              pointerEvents: 'none',
            }}
          />

          {/* TOP BAR: Brand + District + Category + Urgency */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* VizhiTN Brand Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #334155',
                  borderRadius: '999px',
                  padding: '7px 16px',
                }}
              >
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', letterSpacing: '1px' }}>
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
                    padding: '7px 14px',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>📍</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
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
                  padding: '7px 16px',
                }}
              >
                <span style={{ fontSize: '13px' }}>{catStyle.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: catStyle.text, letterSpacing: '0.5px' }}>
                  {isTamilPrimary ? catStyle.label_ta : catStyle.label}
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
                padding: '7px 16px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: urgencyStyle.border }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: urgencyStyle.text, letterSpacing: '0.5px' }}>
                {isTamilPrimary ? urgencyStyle.label_ta : urgencyStyle.label}
              </span>
            </div>
          </div>

          {/* MAIN HEADLINE AREA */}
          {isTamilPrimary ? (
            /* Mode 1: Tamil-First Hero Card */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
              <div
                style={{
                  fontSize: title_ta.length > 70 ? '36px' : '42px',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.35,
                  maxHeight: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title_ta}
              </div>
              {title && (
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: catStyle.text,
                    lineHeight: 1.3,
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {title}
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Balanced Bilingual Split Card */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '15px 0' }}>
              {/* Primary English Title */}
              <div
                style={{
                  fontSize: title.length > 80 ? '32px' : title.length > 50 ? '36px' : '40px',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  maxHeight: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </div>

              {/* High-Contrast Highlighted Tamil Box */}
              {title_ta && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderLeft: `4px solid ${catStyle.border}`,
                    borderRadius: '8px',
                    padding: '10px 18px',
                    maxWidth: '100%',
                  }}
                >
                  <span
                    style={{
                      fontSize: title_ta.length > 65 ? '24px' : '27px',
                      fontWeight: 700,
                      color: catStyle.text,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title_ta}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* FOOTER BAR: Helpline + Receipt ID + Verification */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '18px',
              borderTop: '1px solid #1e293b',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    padding: '6px 12px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>
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
                    padding: '6px 12px',
                  }}
                >
                  <span style={{ fontSize: '12px' }}>📞</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>
                    {helpline}
                  </span>
                </div>
              )}
            </div>

            {/* Verified Network Stamp with Inline SVG Checkmark (No Missing Glyph Box) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                {isTamilPrimary ? 'உறுதிசெய்யப்பட்ட மக்கள் தளம்' : 'Verified Civic Proof Network'}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {isTamilPrimary ? '• தமிழ்நாடு (38 மாவட்டங்கள்)' : '• Tamil Nadu (38 Districts)'}
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
