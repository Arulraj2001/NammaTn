import fs from 'fs';
import path from 'path';
import { renderHtmlToImage } from './frame-renderer.mjs';
import { getBrandLogoDataUri } from './brand-assets.mjs';

/**
 * Generates an ultra-high CTR 1280x720 YouTube Thumbnail PNG
 * @param {Object} params
 * @param {string} params.titleTa - Short 3 to 5-word bold Tamil curiosity hook
 * @param {string} [params.subtitleTa] - Supporting short text
 * @param {string} [params.category='EXPLORER'] - Category pill
 * @param {string} params.heroImageUrl - Background hero image URL or local path
 * @param {string} params.outputPath - Destination PNG file
 * @returns {Promise<string>} output path
 */
export async function generateLongVideoThumbnail({
  titleTa,
  subtitleTa = 'முழு கள ஆய்வு & அரசு ஆவணங்கள்',
  category = 'SPECIAL REPORT',
  heroImageUrl,
  outputPath
}) {
  const logoDataUri = getBrandLogoDataUri();
  const fontPath = path.resolve('public/fonts/NotoSansTamil-Bold.ttf').replace(/\\/g, '/');

  const htmlContent = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@800;900&family=Plus+Jakarta+Sans:wght@800;900&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'Noto Sans Tamil';
      src: url('file:///${fontPath}') format('truetype');
      font-weight: 700;
      font-style: normal;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1280px;
      height: 720px;
      overflow: hidden;
      background: #071224;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      color: #ffffff;
    }

    /* Full Bleed Hero Visual */
    .bg-image {
      position: absolute;
      left: 0;
      top: 0;
      width: 1280px;
      height: 720px;
      object-fit: cover;
    }
    .gradient-overlay {
      position: absolute;
      left: 0;
      top: 0;
      width: 1280px;
      height: 720px;
      background: linear-gradient(
        180deg,
        rgba(7, 18, 36, 0.2) 0%,
        rgba(7, 18, 36, 0.4) 30%,
        rgba(7, 18, 36, 0.9) 60%,
        rgba(7, 18, 36, 0.98) 82%,
        #071224 100%
      );
    }

    /* Top Bar Floating */
    .top-bar {
      position: absolute;
      top: 36px;
      left: 48px;
      right: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 15;
    }
    .brand-logo-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(12px);
      padding: 8px 20px 8px 12px;
      border-radius: 9999px;
      border: 1.5px solid rgba(255, 255, 255, 0.25);
    }
    .live-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 12px #10b981;
    }
    .brand-logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
      border-radius: 8px;
      background: #ffffff;
      padding: 2px;
    }
    .brand-logo-text {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .cat-pill {
      background: #ef4444;
      border: 2px solid #dc2626;
      color: #ffffff;
      font-size: 17px;
      font-weight: 900;
      padding: 8px 22px;
      border-radius: 9999px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);
    }

    /* Bottom Content Box */
    .content-box {
      position: absolute;
      bottom: 74px;
      left: 48px;
      right: 48px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .headline-main {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.25;
      color: #FFE500;
      text-shadow: -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 24px rgba(0, 0, 0, 0.95);
      margin-bottom: 8px;
    }
    .sub-text {
      font-size: 26px;
      font-weight: 800;
      color: #f8fafc;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.9);
    }

    /* Bottom Bar */
    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: rgba(7, 18, 36, 0.96);
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px;
      z-index: 20;
    }
    .verified-tag {
      font-size: 18px;
      font-weight: 800;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cta-badge {
      color: #38bdf8;
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <img class="bg-image" src="${heroImageUrl}" alt="Hero" />
  <div class="gradient-overlay"></div>

  <div class="top-bar">
    <div class="brand-logo-pill">
      <span class="live-dot"></span>
      <img class="brand-logo-img" src="${logoDataUri}" alt="VizhiTN" />
      <span class="brand-logo-text">VizhiTN</span>
    </div>
    <div class="cat-pill">${category}</div>
  </div>

  <div class="content-box">
    <h1 class="headline-main">${titleTa}</h1>
    <p class="sub-text">${subtitleTa}</p>
  </div>

  <div class="bottom-bar">
    <div class="verified-tag">✓ உறுதிசெய்யப்பட்ட தமிழ்நாடு உண்மை சரிபார்ப்பு</div>
    <div class="cta-badge">@vizhi_tn • vizhitn.in</div>
  </div>
</body>
</html>`;

  renderHtmlToImage(htmlContent, outputPath, { width: 1280, height: 720 });
  return outputPath;
}

/**
 * Generates a 1080×1920 9:16 YouTube Shorts / Instagram Reels thumbnail PNG
 * @param {Object} params
 * @param {string} params.titleTa          - Main Tamil headline (2–5 words, bold hook)
 * @param {string} params.heroImageUrl     - Background photo URL or local data URI
 * @param {string} [params.categoryLabel]  - Category name (e.g., "மின்சாரம்")
 * @param {string} [params.categoryColor]  - Hex accent color (e.g., "#f59e0b")
 * @param {string} [params.categoryIcon]   - Emoji icon (e.g., "⚡")
 * @param {string} [params.districtName]   - District badge text
 * @param {string} [params.urgencyClass]   - pill-critical | pill-high | pill-medium | pill-low
 * @param {string} params.outputPath       - Destination PNG file
 * @returns {string} output path
 */
export function generateShortsThumbnail({
  titleTa,
  heroImageUrl,
  categoryLabel = 'அரசு செய்தி',
  categoryColor = '#2563eb',
  categoryIcon = '📢',
  districtName = 'Tamil Nadu',
  urgencyClass = 'pill-medium',
  outputPath
}) {
  const logoDataUri = getBrandLogoDataUri();

  const urgencyLabels = {
    'pill-critical': { text: '🚨 URGENT', bg: '#ef4444', border: '#dc2626' },
    'pill-high':     { text: '⚠️ ALERT',  bg: '#f59e0b', border: '#d97706' },
    'pill-medium':   { text: '📌 UPDATE', bg: '#2563eb', border: '#1d4ed8' },
    'pill-low':      { text: 'ℹ️ INFO',   bg: '#0f172a', border: '#334155' }
  };
  const urgency = urgencyLabels[urgencyClass] || urgencyLabels['pill-medium'];

  const htmlContent = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@800;900&family=Plus+Jakarta+Sans:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1920px; overflow: hidden; background: #071224;
           font-family: 'Noto Sans Tamil','Plus Jakarta Sans',system-ui,sans-serif;
           position: relative; color: #fff; }
    .bg-photo { position: absolute; inset: 0; width: 1080px; height: 1920px; object-fit: cover; z-index: 1; }
    .gradient { position: absolute; inset: 0;
      background: linear-gradient(180deg,
        rgba(7,18,36,0.82) 0%,
        rgba(7,18,36,0.25) 38%,
        rgba(7,18,36,0.25) 55%,
        rgba(7,18,36,0.92) 78%,
        #071224 100%);
      z-index: 2; }
    .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 88px;
               background: rgba(7,18,36,0.96); border-bottom: 1.5px solid rgba(255,255,255,0.1);
               display: flex; align-items: center; justify-content: space-between;
               padding: 0 40px; z-index: 20; }
    .brand-pill { display: flex; align-items: center; gap: 14px; }
    .logo-img { width: 52px; height: 52px; border-radius: 12px; background: #fff; padding: 3px; object-fit: contain; }
    .brand-name { font-size: 28px; font-weight: 900; }
    .cat-badge { display: flex; align-items: center; gap: 8px;
                 background: ${categoryColor}22; border: 1.5px solid ${categoryColor};
                 color: #fff; font-size: 20px; font-weight: 900;
                 padding: 8px 18px; border-radius: 9999px; }
    .bottom-content { position: absolute; bottom: 0; left: 0; right: 0; z-index: 20;
                      padding: 0 44px 56px 44px; }
    .district-row { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    .district-pill { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
                     font-size: 20px; font-weight: 800; color: #cbd5e1;
                     padding: 6px 18px; border-radius: 10px; }
    .urgency-pill { background: ${urgency.bg}; border: 1.5px solid ${urgency.border};
                    font-size: 18px; font-weight: 900;
                    padding: 6px 18px; border-radius: 10px; color: #fff; }
    .main-title { font-size: 68px; font-weight: 900; line-height: 1.2;
                  text-shadow: 0 4px 20px rgba(0,0,0,0.8); margin-bottom: 28px; }
    .bottom-strip { background: rgba(7,18,36,0.9); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px; padding: 18px 24px;
                    display: flex; align-items: center; justify-content: space-between; }
    .site-url { font-size: 26px; font-weight: 900; color: #38bdf8; }
    .cta-btn { background: linear-gradient(135deg,#2563eb,#1d4ed8);
               font-size: 22px; font-weight: 900; color: #fff;
               padding: 10px 24px; border-radius: 12px;
               box-shadow: 0 4px 16px rgba(37,99,235,0.5); }
  </style>
</head>
<body>
  <img class="bg-photo" src="${heroImageUrl}" alt="" />
  <div class="gradient"></div>
  <div class="top-bar">
    <div class="brand-pill">
      <img class="logo-img" src="${logoDataUri}" alt="VizhiTN" />
      <span class="brand-name">VizhiTN</span>
    </div>
    <div class="cat-badge">${categoryIcon} ${categoryLabel}</div>
  </div>
  <div class="bottom-content">
    <div class="district-row">
      <div class="district-pill">📍 ${districtName}</div>
      <div class="urgency-pill">${urgency.text}</div>
    </div>
    <h1 class="main-title">${titleTa}</h1>
    <div class="bottom-strip">
      <div class="site-url">🌐 vizhitn.in</div>
      <div class="cta-btn">WATCH NOW ▶</div>
    </div>
  </div>
</body>
</html>`;

  renderHtmlToImage(htmlContent, outputPath, { width: 1080, height: 1920 });
  return outputPath;
}

/**
 * Generates both Variant A (Curiosity Question Hook) and Variant B (Official Evidence/Shock Proof)
 * for 16:9 Long-Form Feature Documentaries and Podcasts.
 *
 * @param {Object} params
 * @param {string} params.titleTa
 * @param {string} [params.subtitleTa]
 * @param {string} [params.category]
 * @param {string} params.heroImageUrl
 * @param {string} params.outputDir
 * @param {string} [params.baseName]
 * @returns {Promise<{ variantA: string, variantB: string }>}
 */
export async function generateLongThumbnailPair({
  titleTa,
  subtitleTa = 'முழு கள ஆய்வு & அரசு ஆவணங்கள்',
  category = 'SPECIAL REPORT',
  heroImageUrl,
  outputDir,
  baseName = `long_${Date.now()}`
}) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const pathA = path.join(outputDir, `${baseName}_variantA.png`);
  const pathB = path.join(outputDir, `${baseName}_variantB.png`);

  // Variant A: Curiosity Question
  await generateLongVideoThumbnail({
    titleTa,
    subtitleTa,
    category,
    heroImageUrl,
    outputPath: pathA
  });

  // Variant B: Proof / Evidence Shock Hook
  const shockTitle = titleTa.includes('?') ? titleTa.replace('?', '!') : `${titleTa} — உண்மை என்ன?`;
  const shockSub = 'அரசு ஆவணங்கள் & நேரடி ஆதாரம்';

  await generateLongVideoThumbnail({
    titleTa: shockTitle,
    subtitleTa: shockSub,
    category: 'EVIDENCE INVESTIGATION',
    heroImageUrl,
    outputPath: pathB
  });

  console.log(`[16:9 A/B THUMBNAILS READY ✓] Variant A: ${pathA} | Variant B: ${pathB}`);
  return { variantA: pathA, variantB: pathB };
}

