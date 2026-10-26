// scripts/lib/carousel-generator.mjs
/**
 * VizhiTN High-Converting Instagram & Facebook Carousel Infographic Generator
 * Renders a 4-Slide 1080x1350 (4:5 Portrait) Swipeable Carousel Deck
 * Carousel format drives maximum Saves & Shares on Meta algorithms.
 */

import fs from 'fs';
import path from 'path';
import { renderHtmlToImage } from '../youtube/engine/frame-renderer.mjs';
import { getBrandLogoDataUri } from '../youtube/engine/brand-assets.mjs';

const CATEGORY_COLORS = {
  electricity: '#F59E0B',
  'water-sanitation': '#06B6D4',
  transport: '#8B5CF6',
  'public-safety': '#EF4444',
  'government-schemes': '#10B981',
  'road-infrastructure': '#F97316',
  general: '#38BDF8'
};

export async function generateSocialCarousel(post, outputDir) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const brandLogo = getBrandLogoDataUri();
  const catColor = CATEGORY_COLORS[post.category_slug] || '#38BDF8';
  const fontsDir = path.resolve('public/fonts').replace(/\\/g, '/');

  const slides = [];

  // ── SLIDE 1: The Hook (Thumb-Stopper) ───────────────────────────────────────
  const slide1Html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Noto Sans Tamil';
      src: url('file:///${fontsDir}/NotoSansTamil-Bold.ttf') format('truetype');
      font-weight: 700 900;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1350px;
      background: radial-gradient(circle at 50% 25%, #0f172a 0%, #030712 100%);
      font-family: 'Noto Sans Tamil', sans-serif;
      color: #ffffff;
      padding: 70px 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      padding: 10px 24px; border-radius: 9999px;
    }
    .brand-name { font-size: 24px; font-weight: 900; }
    .district-pill {
      background: ${catColor}; color: #000;
      padding: 10px 24px; border-radius: 9999px;
      font-size: 22px; font-weight: 900;
    }
    .hero-content {
      display: flex; flex-direction: column; gap: 24px;
    }
    .alert-tag {
      color: #ef4444; font-size: 26px; font-weight: 900; letter-spacing: 1px;
    }
    .title {
      font-size: 52px; font-weight: 900; line-height: 1.25;
      text-shadow: 0 4px 20px rgba(0,0,0,0.8);
    }
    .footer {
      border-top: 1.5px solid rgba(255, 255, 255, 0.15);
      padding-top: 24px;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 22px; color: #94a3b8; font-weight: 700;
    }
    .swipe-pill {
      color: #38bdf8; font-weight: 900; display: flex; align-items: center; gap: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-pill">
      <img src="${brandLogo}" style="width: 36px; height: 36px; border-radius: 8px;" />
      <span class="brand-name">VizhiTN</span>
    </div>
    <div class="district-pill">📍 ${(post.area_name || post.district_slug || 'தமிழ்நாடு').toUpperCase()}</div>
  </div>

  <div class="hero-content">
    <div class="alert-tag">🚨 முக்கிய அவசர எச்சரிக்கை</div>
    <h1 class="title">${post.title_ta || post.title_en}</h1>
  </div>

  <div class="footer">
    <span>1 / 4</span>
    <span class="swipe-pill">முழு விவரம் அறிய வலதுபுறம் ஸ்வைப் செய்க ➔</span>
  </div>
</body>
</html>`;

  // ── SLIDE 2: Affected Areas & Timeline ──────────────────────────────────────
  const slide2Html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Noto Sans Tamil';
      src: url('file:///${fontsDir}/NotoSansTamil-Bold.ttf') format('truetype');
      font-weight: 700 900;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1350px;
      background: #030712;
      font-family: 'Noto Sans Tamil', sans-serif;
      color: #ffffff;
      padding: 70px 60px;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .top-badge {
      display: inline-flex; align-items: center; gap: 10px;
      background: rgba(255, 255, 255, 0.08); border-left: 6px solid ${catColor};
      padding: 14px 24px; border-radius: 12px; font-size: 26px; font-weight: 900;
    }
    .content-box {
      background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px; padding: 36px; display: flex; flex-direction: column; gap: 20px;
    }
    .content-text {
      font-size: 32px; font-weight: 700; line-height: 1.45; color: #f1f5f9;
    }
    .footer {
      border-top: 1.5px solid rgba(255, 255, 255, 0.15); padding-top: 24px;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 22px; color: #94a3b8; font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="top-badge">📍 பாதிக்கப்படும் பகுதிகள் / கள நிலவரம்</div>
  <div class="content-box">
    <p class="content-text">${post.content_ta || post.content_en}</p>
  </div>
  <div class="footer">
    <span>2 / 4</span>
    <span style="color: #38bdf8; font-weight: 900;">உதவி எண் பார்க்க ஸ்வைப் செய்க ➔</span>
  </div>
</body>
</html>`;

  // ── SLIDE 3: Official Helpline (Save-Worthy Slide) ──────────────────────────
  const helplineNum = post.assigned_department?.match(/\d{4,}/)?.[0] || '1100';
  const slide3Html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Noto Sans Tamil';
      src: url('file:///${fontsDir}/NotoSansTamil-Bold.ttf') format('truetype');
      font-weight: 700 900;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1350px;
      background: radial-gradient(circle at 50% 35%, #1e1b4b 0%, #030712 100%);
      font-family: 'Noto Sans Tamil', sans-serif;
      color: #ffffff;
      padding: 70px 60px;
      display: flex; flex-direction: column; justify-content: space-between;
      align-items: center; text-align: center;
    }
    .dept-title { font-size: 38px; font-weight: 900; }
    .dialer-card {
      width: 100%; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      border-radius: 32px; padding: 48px; border: 3px solid rgba(255, 255, 255, 0.4);
      display: flex; flex-direction: column; align-items: center; gap: 18px;
      box-shadow: 0 25px 60px rgba(220, 38, 38, 0.6);
    }
    .dialer-label { font-size: 28px; font-weight: 800; }
    .dialer-number { font-size: 80px; font-weight: 900; letter-spacing: 4px; }
    .save-hint {
      background: rgba(255, 255, 255, 0.08); border-radius: 9999px;
      padding: 12px 28px; font-size: 22px; font-weight: 800; color: #facc15;
    }
    .footer {
      width: 100%; border-top: 1.5px solid rgba(255, 255, 255, 0.15); padding-top: 24px;
      display: flex; align-items: center; justify-content: space-between;
      font-size: 22px; color: #94a3b8; font-weight: 700;
    }
  </style>
</head>
<body>
  <div style="font-size: 24px; font-weight: 900; color: #38bdf8;">🏛️ தமிழ்நாடு அரசு அதிகாரப்பூர்வ தொடர்பு மையம்</div>
  <h2 class="dept-title">${post.assigned_department || 'அரசு சேவை மையம்'}</h2>
  
  <div class="dialer-card">
    <span class="dialer-label">📞 24x7 அவசர உதவி எண்</span>
    <span class="dialer-number">${helplineNum}</span>
    <span style="font-size: 22px; color: #fef08a;">கட்டணமில்லா சேவை எண்</span>
  </div>

  <div class="save-hint">📌 எதிர்கால தேவைக்கு இந்த பதிவை Save செய்து கொள்ளுங்கள்!</div>

  <div class="footer">
    <span>3 / 4</span>
    <span style="color: #38bdf8; font-weight: 900;">கடைசி பக்கம் ➔</span>
  </div>
</body>
</html>`;

  // ── SLIDE 4: Community Discussion & Follow CTA ──────────────────────────────
  const slide4Html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Noto Sans Tamil';
      src: url('file:///${fontsDir}/NotoSansTamil-Bold.ttf') format('truetype');
      font-weight: 700 900;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1350px;
      background: #030712;
      font-family: 'Noto Sans Tamil', sans-serif;
      color: #ffffff;
      padding: 70px 60px;
      display: flex; flex-direction: column; justify-content: space-between;
      align-items: center; text-align: center;
    }
    .discuss-icon { font-size: 80px; }
    .question {
      font-size: 44px; font-weight: 900; line-height: 1.35;
    }
    .follow-box {
      width: 100%; background: rgba(15, 23, 42, 0.9); border: 2px solid #38bdf8;
      border-radius: 28px; padding: 36px; display: flex; flex-direction: column;
      align-items: center; gap: 14px;
    }
    .follow-title { font-size: 32px; font-weight: 900; color: #38bdf8; }
    .website-link { font-size: 24px; color: #94a3b8; font-weight: 700; }
  </style>
</head>
<body>
  <div class="discuss-icon">💬</div>
  <h2 class="question">உங்கள் பகுதியிலும் இந்த பிரச்சனை உள்ளதா?<br><span style="color: #facc15;">கீழே கமெண்ட் செய்யுங்கள்!</span></h2>

  <div class="follow-box">
    <img src="${brandLogo}" style="width: 60px; height: 60px; border-radius: 14px;" />
    <span class="follow-title">தினசரி உண்மை செய்திகளுக்கு Follow செய்க: @VizhiTN</span>
    <span class="website-link">புகார்களைப் பதிவு செய்ய: www.vizhitn.in</span>
  </div>

  <div style="font-size: 22px; color: #94a3b8; font-weight: 700;">
    நண்பர்கள் மற்றும் குடும்பத்தினருடன் பகிருங்கள் (Share) 🚀
  </div>
</body>
</html>`;

  // Render all 4 slides
  const s1Path = path.join(outputDir, `carousel_slide_1_${Date.now()}.png`);
  const s2Path = path.join(outputDir, `carousel_slide_2_${Date.now()}.png`);
  const s3Path = path.join(outputDir, `carousel_slide_3_${Date.now()}.png`);
  const s4Path = path.join(outputDir, `carousel_slide_4_${Date.now()}.png`);

  renderHtmlToImage(slide1Html, s1Path, { width: 1080, height: 1350 });
  renderHtmlToImage(slide2Html, s2Path, { width: 1080, height: 1350 });
  renderHtmlToImage(slide3Html, s3Path, { width: 1080, height: 1350 });
  renderHtmlToImage(slide4Html, s4Path, { width: 1080, height: 1350 });

  return [s1Path, s2Path, s3Path, s4Path];
}
