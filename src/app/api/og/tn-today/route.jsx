import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Category theme styling matching src/lib/tnTodayCategories.js
const THEMES = {
  infrastructure: { bg: '#0b132b', border: '#3b82f6', text: '#60a5fa', icon: '🏗️', label: 'INFRASTRUCTURE', label_ta: 'உள்கட்டமைப்பு' },
  transport: { bg: '#082f49', border: '#0ea5e9', text: '#38bdf8', icon: '🚌', label: 'TRANSIT & METRO', label_ta: 'போக்குவரத்து' },
  environment: { bg: '#022c22', border: '#10b981', text: '#34d399', icon: '🌿', label: 'ENVIRONMENT', label_ta: 'சுற்றுச்சூழல்' },
  governance: { bg: '#2e1065', border: '#a855f7', text: '#c084fc', icon: '🏛️', label: 'GOVERNANCE', label_ta: 'அரசு நிர்வாகம்' },
  economy: { bg: '#451a03', border: '#f59e0b', text: '#fbbf24', icon: '💰', label: 'ECONOMY', label_ta: 'பொருளாதாரம்' },
  education: { bg: '#042f2e', border: '#14b8a6', text: '#2dd4bf', icon: '🎓', label: 'EDUCATION', label_ta: 'பள்ளிக் கல்வி' },
  healthcare: { bg: '#4c0519', border: '#f43f5e', text: '#fb7185', icon: '🏥', label: 'HEALTHCARE', label_ta: 'பொது சுகாதாரம்' },
  agriculture: { bg: '#1a2e05', border: '#84cc16', text: '#a3e635', icon: '🌾', label: 'AGRICULTURE', label_ta: 'விவசாயம்' },
  technology: { bg: '#083344', border: '#06b6d4', text: '#22d3ee', icon: '💻', label: 'TECHNOLOGY', label_ta: 'தொழில்நுட்பம்' },
  social: { bg: '#500724', border: '#ec4899', text: '#f472b6', icon: '👥', label: 'SOCIAL WELFARE', label_ta: 'சமூக நலம்' },
  india: { bg: '#1e1b4b', border: '#6366f1', text: '#818cf8', icon: '🇮🇳', label: 'NATIONAL', label_ta: 'தேசிய விவகாரங்கள்' },
  world: { bg: '#042f2e', border: '#0d9488', text: '#2dd4bf', icon: '🌐', label: 'GLOBAL', label_ta: 'உலக நடப்புகள்' },
  general: { bg: '#0f172a', border: '#64748b', text: '#94a3b8', icon: '📰', label: 'EDITORIAL', label_ta: 'சிறப்புக் கட்டுரை' },
};

let fontPromise = null;
async function loadTamilFont() {
  if (fontPromise) return fontPromise;
  fontPromise = (async () => {
    // 1. Local filesystem relative to route
    try {
      const localFontUrl = new URL('../../../../../public/fonts/NotoSansTamil-Bold.ttf', import.meta.url);
      const res = await fetch(localFontUrl);
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}

    // 2. Production origin
    try {
      const res = await fetch('https://www.vizhitn.in/fonts/NotoSansTamil-Bold.ttf');
      if (res.ok) return await res.arrayBuffer();
    } catch (_) {}

    // 3. Google Fonts CDN fallback
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

    const titleEn = searchParams.get('title') || 'Tamil Nadu Special Investigation & In-Depth Report';
    const titleTa = searchParams.get('title_ta') || '';
    const categoryKey = (searchParams.get('category') || 'general').toLowerCase();
    const lang = searchParams.get('lang') || (titleTa ? 'ta' : 'en');
    const district = (searchParams.get('district') || '').trim();
    const readTime = searchParams.get('read_time') || '5 min read';

    const isTamil = lang === 'ta' && Boolean(titleTa);
    const theme = THEMES[categoryKey] || THEMES.general;

    const tamilFontData = await loadTamilFont();
    const fonts = tamilFontData
      ? [
          {
            name: 'Noto Sans Tamil',
            data: tamilFontData,
            style: 'normal',
            weight: 700,
          },
        ]
      : [];

    const displayTitle = isTamil ? titleTa : titleEn;
    const categoryLabel = isTamil ? theme.label_ta : theme.label;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundImage: `radial-gradient(circle at 90% 15%, ${theme.border}22 0%, #050814 55%, #020408 100%)`,
            fontFamily: isTamil
              ? 'Noto Sans Tamil, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
              : '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            padding: '50px 60px',
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
              border: `1.5px solid ${theme.border}44`,
              borderRadius: '24px',
              pointerEvents: 'none',
            }}
          />

          {/* Accent Left Bar */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              bottom: '20px',
              width: '8px',
              backgroundColor: theme.border,
              borderTopLeftRadius: '24px',
              borderBottomLeftRadius: '24px',
            }}
          />

          {/* TOP BAR: Brand Pill + Category Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* VizhiTN TN TODAY Brand Pill */}
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
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', letterSpacing: '1.5px' }}>
                  TN TODAY
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                  EDITION
                </span>
              </div>

              {/* Category Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.bg,
                  border: `1.5px solid ${theme.border}`,
                  borderRadius: '999px',
                  padding: '8px 18px',
                }}
              >
                <span style={{ fontSize: '14px' }}>{theme.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: theme.text, letterSpacing: '0.8px' }}>
                  {categoryLabel}
                </span>
              </div>

              {/* Optional District Pill */}
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
                  <span style={{ fontSize: '12px' }}>📍</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', textTransform: 'capitalize' }}>
                    {district}
                  </span>
                </div>
              )}
            </div>

            {/* Read Time / Depth Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '6px 14px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                ⏱ {isTamil ? `${readTime.replace(' min read', '')} நிமிட வாசிப்பு` : readTime}
              </span>
            </div>
          </div>

          {/* MAIN HEADLINE HERO AREA (Clean Multi-line News Display) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '25px 0' }}>
            <div
              style={{
                fontSize: isTamil
                  ? displayTitle.length > 90
                    ? '32px'
                    : displayTitle.length > 55
                    ? '38px'
                    : '44px'
                  : displayTitle.length > 80
                  ? '36px'
                  : '44px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: isTamil ? 1.4 : 1.25,
                maxHeight: '210px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: isTamil ? '0px' : '-0.02em',
              }}
            >
              {displayTitle}
            </div>

            {/* Secondary Bilingual Line (Subtle Context Deck) */}
            {isTamil && titleEn ? (
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  lineHeight: 1.3,
                  maxHeight: '52px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {titleEn}
              </div>
            ) : null}
          </div>

          {/* FOOTER BAR: Clean Editorial Signature (Zero Helplines, Zero Ticket IDs) */}
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
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px' }}>
                VIZHITN.IN
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>•</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                {isTamil ? 'தமிழ்நாடு கள ஆய்வு & உண்மை சரிபார்ப்பு' : 'Tamil Nadu In-Depth Civic & Governance Journal'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', letterSpacing: '0.5px' }}>
                {isTamil ? 'சரிபார்க்கப்பட்ட செய்தி அறிக்கை' : 'VERIFIED EDITORIAL REPORT'}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 675,
        fonts,
      }
    );
  } catch (err) {
    console.error('[OG TN TODAY ERROR]:', err);
    return new Response(`Failed to generate TN Today OpenGraph Image: ${err.message}`, { status: 500 });
  }
}
