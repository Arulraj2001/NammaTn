// scripts/youtube/engine/thumbnail-shorts-engine.mjs
// Generates ultra-high CTR 1080x1920 YouTube Shorts / Reels viral thumbnails
// Modeled directly on high-retention human emotion + 3D contrast typography + legal context props

import fs from 'fs';
import path from 'path';
import { renderHtmlToImage } from './frame-renderer.mjs';
import { getBrandLogoDataUri } from './brand-assets.mjs';

/**
 * Splits a Tamil title or dispute into 3 to 4 punchy, high-impact thumbnail lines
 * Example: "வீட்டு அட்வான்ஸ் பணத்தை ஓனர் தர மறுத்தால் என்ன செய்யணும்?"
 * -> Line 1: "வீட்டு அட்வான்ஸ்"
 * -> Line 2: "பணத்தை ஓனர்"
 * -> Line 3: "தர மறுத்தால்"
 * -> Line 4: "என்ன செய்யணும்?"
 */
export function formatThumbnailTamilLines(titleTa) {
  if (!titleTa) return { line1: '', line2: '', line3: '', line4: 'என்ன செய்யணும்', isQuestion: true };

  let text = titleTa.replace(/[?!|•]/g, '').trim();

  // Common trailing question phrases to extract for line 4
  const questionPatterns = [
    /என்ன செய்யணும்$/i,
    /என்ன பண்ணனும்$/i,
    /தீர்வு என்ன$/i,
    /உண்மை என்ன$/i,
    /என்ன வழி$/i,
    /செய்ய வேண்டியது என்ன$/i
  ];

  let l4 = '';
  let isQuestion = false;

  for (const pat of questionPatterns) {
    if (pat.test(text)) {
      l4 = text.match(pat)[0].trim();
      text = text.replace(pat, '').trim();
      isQuestion = true;
      break;
    }
  }

  if (!l4) {
    if (titleTa.includes('?') || titleTa.includes('என்ன')) {
      l4 = 'என்ன செய்யணும்';
      isQuestion = true;
    } else {
      l4 = 'முழு விவரம்';
      isQuestion = false;
    }
  }

  const words = text.split(/\s+/).filter(Boolean);

  if (words.length <= 2) {
    return {
      line1: words.join(' '),
      line2: '',
      line3: '',
      line4: l4,
      isQuestion
    };
  }

  if (words.length <= 4) {
    return {
      line1: words.slice(0, 2).join(' '),
      line2: words.slice(2).join(' '),
      line3: '',
      line4: l4,
      isQuestion
    };
  }

  // 3-way split: 2 words on Line 1, 2 on Line 2, remainder on Line 3
  const c1 = Math.max(2, Math.floor(words.length / 3));
  const c2 = Math.max(2, Math.floor(words.length / 3));

  return {
    line1: words.slice(0, c1).join(' '),
    line2: words.slice(c1, c1 + c2).join(' '),
    line3: words.slice(c1 + c2).join(' '),
    line4: l4,
    isQuestion
  };
}

/**
 * Generates an ultra-high CTR 1080x1920 vertical thumbnail
 * @param {Object} params
 * @param {string} params.titleTa - Full Tamil title
 * @param {string} [params.line1] - Explicit Line 1
 * @param {string} [params.line2] - Explicit Line 2
 * @param {string} [params.line3] - Explicit Line 3
 * @param {string} [params.line4] - Explicit Line 4
 * @param {string} [params.category='சட்ட உரிமைகள்'] - Category badge
 * @param {string} params.heroImageUrl - Hero image (FLUX photorealistic scene)
 * @param {string} params.outputPath - Destination PNG path
 * @returns {Promise<string>}
 */
export async function generateShortsThumbnail({
  titleTa,
  line1,
  line2,
  line3,
  line4,
  category = 'சட்ட உரிமைகள்',
  heroImageUrl,
  outputPath
}) {
  const logoDataUri = getBrandLogoDataUri();
  const fontPath = path.resolve('public/fonts/NotoSansTamil-Bold.ttf').replace(/\\/g, '/');

  const lines = formatThumbnailTamilLines(titleTa);
  const l1 = line1 || lines.line1;
  const l2 = line2 || lines.line2;
  const l3 = line3 || lines.line3;
  const l4 = line4 || lines.line4;
  const mark = lines.isQuestion ? '?' : '!';

  const resolvedHero = heroImageUrl && fs.existsSync(heroImageUrl)
    ? `file:///${heroImageUrl.replace(/\\/g, '/')}`
    : (heroImageUrl || '');

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
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #030712;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* ── FULL-BLEED CINEMATIC VISUAL BACKGROUND ─────────── */
    .visual-stage {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      width: 1080px; height: 1920px;
      overflow: hidden;
      z-index: 1;
    }
    .hero-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      /* Photoshop Camera Raw Emulation: High-contrast punch & vibrance */
      filter: contrast(1.26) saturate(1.4) brightness(0.72);
      transform: scale(1.06);
    }
    .visual-gradient {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      /* Ambient Occlusion Vignette & Split Toning */
      background:
        radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 25%, rgba(3,7,18,0.72) 65%, #030712 100%),
        linear-gradient(180deg, rgba(3,7,18,0.3) 0%, rgba(3,7,18,0.1) 40%, rgba(3,7,18,0.95) 90%, #030712 100%);
    }

    /* Top Floating Branding */
    .top-header {
      position: absolute;
      top: 50px; left: 40px; right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 20;
    }
    .brand-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(16px);
      padding: 8px 20px 8px 12px;
      border-radius: 9999px;
    }
    .brand-logo-img {
      width: 44px; height: 44px;
      object-fit: contain;
      border-radius: 10px;
      background: #fff;
      padding: 2px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #fff;
    }
    .alert-pill {
      background: #dc2626;
      color: #ffffff;
      font-size: 22px;
      font-weight: 900;
      padding: 10px 24px;
      border-radius: 9999px;
      letter-spacing: 1px;
      box-shadow: 0 4px 20px rgba(220, 38, 38, 0.6);
      border: 2px solid #ef4444;
    }

    /* ── CENTER SECTION: Instagram 1:1 Profile Grid Safe Zone (Y: 440px to 1480px) ─── */
    .text-stage {
      position: absolute;
      top: 460px;
      left: 30px; right: 30px;
      height: 980px;
      z-index: 25;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
      align-items: center;
    }

    /* Line 1: White on Red Banner */
    .line-banner-red {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      font-size: 58px;
      font-weight: 900;
      padding: 10px 32px;
      border-radius: 18px;
      letter-spacing: -0.5px;
      box-shadow: 0 8px 30px rgba(220, 38, 38, 0.5);
      border: 3px solid #fecaca;
      text-shadow: 3px 3px 0 #000;
    }

    /* Line 2: Giant Neon Yellow with Heavy Black Stroke */
    .line-yellow-pop {
      font-size: 80px;
      font-weight: 900;
      color: #ffe600;
      line-height: 1.15;
      letter-spacing: -1px;
      text-shadow:
        4px 4px 0 #000,
        -4px -4px 0 #000,
        4px -4px 0 #000,
        -4px 4px 0 #000,
        0 6px 16px rgba(0,0,0,0.9);
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));
    }

    /* Line 3: Crisp Pure White */
    .line-white-crisp {
      font-size: 68px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.15;
      text-shadow:
        4px 4px 0 #000,
        -4px -4px 0 #000,
        4px -4px 0 #000,
        -4px 4px 0 #000,
        0 6px 16px rgba(0,0,0,0.9);
    }

    /* Line 4: Question / Action Callout */
    .line-question-box {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 23, 42, 0.95);
      border: 3.5px solid #ffe600;
      padding: 10px 32px;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    .question-text {
      font-size: 60px;
      font-weight: 900;
      color: #ffe600;
      text-shadow: 2px 2px 0 #000;
    }
    .question-mark {
      color: #ef4444;
      font-size: 72px;
      font-weight: 900;
    }

    /* ── BOTTOM SECTION: Follower Growth Callout Footer ──── */
    .footer-props {
      position: absolute;
      bottom: 50px;
      left: 40px; right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 18px 30px;
      backdrop-filter: blur(20px);
      z-index: 20;
    }
    .prop-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 800;
      color: #e2e8f0;
    }
    .prop-icon {
      font-size: 32px;
      line-height: 1;
    }
    .prop-action {
      background: #dc2626;
      color: #ffffff;
      font-size: 24px;
      font-weight: 900;
      padding: 10px 24px;
      border-radius: 14px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.5);
    }
  </style>
</head>
<body>
  <!-- Top Visual Stage -->
  <div class="visual-stage">
    ${resolvedHero ? `<img class="hero-photo" src="${resolvedHero}" alt="Scene Hero" />` : ''}
    <div class="visual-gradient"></div>
  </div>

  <!-- Top Floating Header -->
  <div class="top-header">
    <div class="brand-pill">
      <img class="brand-logo-img" src="${logoDataUri}" alt="VizhiTN" />
      <span class="brand-title">VizhiTN</span>
    </div>
    <div class="alert-pill">🚨 ${category || 'நேரடி நிலவரம்'}</div>
  </div>

  <!-- Giant High-CTR Typography in 1:1 Safe Zone -->
  <div class="text-stage">
    ${l1 ? `<div class="line-banner-red">${l1}</div>` : ''}
    ${l2 ? `<div class="line-yellow-pop">${l2}</div>` : ''}
    ${l3 ? `<div class="line-white-crisp">${l3}</div>` : ''}
    <div class="line-question-box">
      <span class="question-text">${l4}</span>
      <span class="question-mark">${mark}</span>
    </div>
  </div>

  <!-- Bottom Follower Growth Footer -->
  <div class="footer-props">
    <div class="prop-item">
      <span class="prop-icon">🔔</span>
      <span>தமிழ்நாடு அரசு & மக்கள் தகவல்</span>
    </div>
    <div class="prop-action">
      + FOLLOW
    </div>
  </div>
</body>
</html>`;

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const renderedPath = renderHtmlToImage(htmlContent, outputPath, { width: 1080, height: 1920 });
  console.log(`[SHORTS THUMBNAIL ✓] Rendered high-CTR 9:16 viral card: ${renderedPath}`);
  return renderedPath;
}

/**
 * Generates both Variant A (Curiosity Question) and Variant B (Shock / Urgency Proof)
 * for autonomous A/B click-through-rate optimization.
 *
 * @param {Object} params
 * @param {string} params.titleTa
 * @param {string} [params.category]
 * @param {string} params.heroImageUrl
 * @param {string} params.outputDir
 * @param {string} [params.baseName]
 * @returns {Promise<{ variantA: string, variantB: string }>}
 */
export async function generateShortsThumbnailPair({
  titleTa,
  category = 'சட்ட உரிமைகள்',
  heroImageUrl,
  outputDir,
  baseName = `short_${Date.now()}`
}) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const pathA = path.join(outputDir, `${baseName}_variantA.png`);
  const pathB = path.join(outputDir, `${baseName}_variantB.png`);

  // Variant A: High-Stakes Curiosity Question
  await generateShortsThumbnail({
    titleTa,
    category,
    heroImageUrl,
    outputPath: pathA
  });

  // Variant B: Urgency & Data Shock Formula
  const lines = formatThumbnailTamilLines(titleTa);
  const shockL1 = 'அவசர எச்சரிக்கை!';
  const shockL2 = lines.line1 || lines.line2 || 'முக்கிய அறிவிப்பு';
  const shockL3 = lines.line3 || 'உடனே சரிபார்க்கவும்';
  const shockL4 = 'முழு விவரம்';

  await generateShortsThumbnail({
    titleTa,
    line1: shockL1,
    line2: shockL2,
    line3: shockL3,
    line4: shockL4,
    category: 'உடனடி எச்சரிக்கை',
    heroImageUrl,
    outputPath: pathB
  });

  console.log(`[A/B THUMBNAILS READY ✓] Variant A (Curiosity): ${pathA} | Variant B (Shock): ${pathB}`);
  return { variantA: pathA, variantB: pathB };
}

