// scripts/youtube/templates/mindset/mindset-slides.mjs
/**
 * HTML Canvas Templates for VizhiTN Psychological Student Discipline Shorts (1080x1920)
 * Modern Dark-Cinematic Editorial Aesthetic:
 * - High-contrast typography with yellow keyword highlights
 * - Pixabay atmospheric study photo background with subtle dark overlay
 * - Strict Safe-Zone Compliance (clears top 120px and bottom 240px for IG/YT UI)
 */

import { toSafeDataUri } from '../../engine/free-media-fetcher.mjs';

/**
 * Slide 1: The Confrontational Hook Slide (0s - 8s)
 */
export function generateMindsetHookSlideHtml({
  topic,
  bgImagePath,
  brandLogoDataUri
}) {
  const bgDataUri = toSafeDataUri(bgImagePath);

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: #0B0F19;
      font-family: 'Noto Sans Tamil', 'Mukta Malar', 'Latha', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #FFFFFF;
      position: relative;
    }

    /* Background with dark cinematic treatment */
    .bg-layer {
      position: absolute;
      inset: 0;
      background: ${bgDataUri ? `url('${bgDataUri}') center/cover no-repeat` : 'linear-gradient(135deg, #09122C 0%, #102147 100%)'};
      filter: brightness(0.38) contrast(1.15) blur(1px);
      transform: scale(1.05);
    }

    .vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(11,15,25,0.4) 0%, rgba(11,15,25,0.92) 80%);
    }

    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 80px 80px;
      pointer-events: none;
    }

    .container {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      padding: 140px 70px 220px 70px; /* Safe zone padding */
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Top Badging */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #FACC15;
      color: #000000;
      font-weight: 900;
      font-size: 26px;
      padding: 14px 28px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 20px rgba(250, 204, 21, 0.35);
      text-transform: uppercase;
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
    }

    /* Center Hook Stack */
    .center-card {
      background: rgba(15, 23, 42, 0.85);
      border: 3px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border-radius: 40px;
      padding: 60px 50px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      position: relative;
    }
    .card-glow {
      position: absolute;
      top: -2px; left: -2px; right: -2px; bottom: -2px;
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.4), transparent, rgba(59, 130, 246, 0.4));
      border-radius: 42px;
      z-index: -1;
      opacity: 0.7;
    }

    .topic-tag {
      display: inline-block;
      color: #93C5FD;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .headline {
      font-size: 58px;
      font-weight: 900;
      line-height: 1.35;
      color: #FFFFFF;
      margin-bottom: 30px;
      text-shadow: 0 4px 16px rgba(0,0,0,0.8);
    }
    .headline .highlight {
      color: #FACC15;
      text-decoration: underline;
      text-decoration-color: rgba(250, 204, 21, 0.5);
    }

    .sub-hook {
      font-size: 34px;
      font-weight: 600;
      line-height: 1.5;
      color: #E2E8F0;
      border-left: 6px solid #FACC15;
      padding-left: 24px;
      background: rgba(250, 204, 21, 0.08);
      border-radius: 0 16px 16px 0;
      padding-top: 16px;
      padding-bottom: 16px;
    }

    /* Bottom Info Card */
    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 2px solid rgba(255, 255, 255, 0.12);
      padding-top: 28px;
    }
    .exam-target {
      font-size: 24px;
      font-weight: 800;
      color: #FACC15;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .headphone-notice {
      font-size: 22px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.7);
    }
  </style>
</head>
<body>
  <div class="bg-layer"></div>
  <div class="vignette"></div>
  <div class="grid-lines"></div>

  <div class="container">
    <div class="header-bar">
      <div class="badge">🧠 TNPSC சுய ஒழுக்கம்</div>
      <div class="brand">VIZHITN.IN</div>
    </div>

    <div class="center-card">
      <div class="card-glow"></div>
      <div class="topic-tag">📌 நேரடி உளவியல் உத்தி</div>
      <div class="headline">${topic.titleTa}</div>
      <div class="sub-hook">${topic.hookTa}</div>
    </div>

    <div class="footer-bar">
      <div class="exam-target">🎯 ${topic.targetExam || 'TNPSC Group 4 & SI'}</div>
      <div class="headphone-notice">🎧 இயர்போன் போட்டு கேளுங்கள்</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Slide 2: The Actionable Breakdown Slide (8s - 35s)
 */
export function generateMindsetActionSlideHtml({
  topic,
  bgImagePath,
  brandLogoDataUri
}) {
  const bgDataUri = toSafeDataUri(bgImagePath);

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: #0B0F19;
      font-family: 'Noto Sans Tamil', 'Mukta Malar', 'Latha', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #FFFFFF;
      position: relative;
    }

    .bg-layer {
      position: absolute;
      inset: 0;
      background: ${bgDataUri ? `url('${bgDataUri}') center/cover no-repeat` : 'linear-gradient(135deg, #0E1726 0%, #1E293B 100%)'};
      filter: brightness(0.32) contrast(1.15) blur(1px);
      transform: scale(1.05);
    }

    .vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(11,15,25,0.45) 0%, rgba(11,15,25,0.95) 85%);
    }

    .container {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      padding: 140px 70px 220px 70px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #3B82F6;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 24px;
      padding: 12px 26px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, 0.6);
    }

    .main-stack {
      display: flex;
      flex-direction: column;
      gap: 32px;
      margin: auto 0;
    }

    /* Step Card 1: Trap */
    .step-card {
      background: rgba(15, 23, 42, 0.88);
      border: 2px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 36px 40px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
    }
    .step-card.gold-border {
      border: 3px solid #FACC15;
      background: rgba(250, 204, 21, 0.08);
      box-shadow: 0 15px 40px rgba(250, 204, 21, 0.2);
    }

    .step-title {
      font-size: 26px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .step-title.red { color: #F87171; }
    .step-title.blue { color: #60A5FA; }
    .step-title.yellow { color: #FACC15; }

    .step-body {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.45;
      color: #F1F5F9;
    }

    /* Outro Box */
    .outro-card {
      border-top: 2px solid rgba(255, 255, 255, 0.15);
      padding-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .outro-text {
      font-size: 26px;
      font-weight: 900;
      color: #FACC15;
    }
    .outro-sub {
      font-size: 22px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
    }
  </style>
</head>
<body>
  <div class="bg-layer"></div>
  <div class="vignette"></div>

  <div class="container">
    <div class="header-bar">
      <div class="badge">💡 அறிவியல் உத்தி (Brain Science)</div>
      <div class="brand">VIZHITN.IN</div>
    </div>

    <div class="main-stack">
      <!-- Trap -->
      <div class="step-card">
        <div class="step-title red">❌ தவிர்க்க வேண்டிய தவறு</div>
        <div class="step-body">வெறும் புத்தகத்தை வாசிப்பது அல்லது கலர் அடிப்பது மூளையை ஏமாற்றும் போலி படிப்பு.</div>
      </div>

      <!-- Cognitive Insight -->
      <div class="step-card">
        <div class="step-title blue">🧠 வெற்றி தரும் அறிவியல் உத்தி</div>
        <div class="step-body">20 நிமிடம் படியுங்கள். புத்தகத்தை மூடிவிட்டு 3 முக்கிய குறிப்புகளை எழுதிப் பாருங்கள்.</div>
      </div>

      <!-- Action -->
      <div class="step-card gold-border">
        <div class="step-title yellow">⚡ இன்றே நீங்கள் செய்ய வேண்டியது</div>
        <div class="step-body">${topic.actionStepTa}</div>
      </div>
    </div>

    <div class="outro-card">
      <div class="outro-text">🔥 ஒழுக்கம் தான் உங்கள் அரசு வேலை!</div>
      <div class="outro-sub">Save & Share with TNPSC Aspirants ↗️</div>
    </div>
  </div>
</body>
</html>`;
}

