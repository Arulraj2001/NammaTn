// scripts/youtube/pipelines/generate-infotainment-shorts.mjs
/**
 * VizhiTN Flagship Infotainment & Investigative Shorts Engine (9:16 Portrait)
 * Powers:
 * 1. TN Mega Projects & Ground Reality
 * 2. Real Scams & Consumer Protections Exposed
 * 3. Tamil Nadu Untold Mysteries & Engineering Marvels
 * 
 * Follows the 4-Beat PSVCC formula to achieve >75% Viewed ratio:
 * Beat 1: Disruptive Hook (0-4s)
 * Beat 2: Conflict & Reality (4-15s)
 * Beat 3: Proof, Data & Map/Blueprints (15-35s)
 * Beat 4: Climax & Discussion CTA (35-45s)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { getInfotainmentTopicForSlot, getInfotainmentTopicById } from '../engine/infotainment-catalog.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, postPinnedComment } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

function getPythonBinary() {
  for (const bin of ['python', 'python3']) {
    try {
      const ver = execSync(`${bin} --version`, { stdio: 'pipe', timeout: 5000 }).toString().trim();
      if (ver.startsWith('Python')) return bin;
    } catch {}
  }
  return 'python';
}

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[INFOTAINMENT TTS] Synthesizing via Google Gemini Voice: "${cleanText.slice(0, 40)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'karthik' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`[INFOTAINMENT TTS ✓] Gemini speech generated: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[INFOTAINMENT TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Falling back to Edge-TTS...`);
    }
  }

  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const edgeCmd = `${python} -m edge_tts --voice "${voice}" --rate=+14% --file "${tempTextFile}" --write-media "${outputPath}"`;
    execSync(edgeCmd, { stdio: 'pipe', timeout: 30000 });
    return outputPath;
  } finally {
    if (fs.existsSync(tempTextFile)) {
      try { fs.unlinkSync(tempTextFile); } catch {}
    }
  }
}

/**
 * Dynamic Multi-Beat Slide Renderer (Vibrant Editorial Style)
 * Renders high-contrast, platform-native visual mockups for Instagram Reels.
 */
function generateDynamicBeatSlideHtml({ beat, topic, brandLogoDataUri, index, total }) {
  // Render segmented progress bar
  const progressBars = Array.from({ length: total }, (_, i) => {
    const isCompleted = i <= index;
    const bg = isCompleted ? (beat.badgeColor || '#2563EB') : 'rgba(148, 163, 184, 0.35)';
    return `<div style="flex: 1; height: 8px; border-radius: 4px; background: ${bg};"></div>`;
  }).join('');

  let centerVisualHtml = '';

  if (beat.type === 'phone-mockup') {
    centerVisualHtml = `
      <div class="phone-card">
        <div class="phone-notch"></div>
        <div class="phone-status">
          <span>9:41</span>
          <span>5G 📶 100% 🔋</span>
        </div>
        <div class="sms-bubble-container">
          <div class="sms-sender-row">
            <div class="sms-avatar">🚨</div>
            <div class="sms-sender-info">
              <div class="sms-sender-name">${beat.sender || 'Traffic Police Alert'}</div>
              <div class="sms-sender-sub">SMS / Text Message</div>
            </div>
            <div class="sms-time">Now</div>
          </div>
          <div class="sms-bubble">
            ${beat.smsText}
          </div>
          <div class="sms-warning-banner">
            <span class="warn-icon">⚠️</span>
            <span>${beat.warningBadge || 'போலி மெசேஜ் — லிங்கை தொடாதீர்கள்!'}</span>
          </div>
        </div>
        <div class="phone-caution-footer">
          <span>👆 இந்த லிங்கை தொட்டால் அடுத்த நொடி என்ன நடக்கும்?</span>
        </div>
      </div>
    `;
  } else if (beat.type === 'apk-alert') {
    centerVisualHtml = `
      <div class="apk-card">
        <div class="apk-icon-box">📦</div>
        <div class="apk-title">${beat.fileName || 'Traffic_Police_Pay.apk'}</div>
        <div class="apk-file-type">Android Application Package (APK)</div>
        <div class="apk-alert-badge">${beat.alertNotice}</div>
        <div class="apk-danger-box">
          <div class="apk-danger-title">⚠️ மால்வேர் எப்படி செயல்படுகிறது?</div>
          <div class="apk-danger-text">
            இது அதிகாரப்பூர்வ ஆப் அல்ல! இதை இன்ஸ்டால் செய்தால், உங்கள் மொபைல் போனின் OTP, வாட்ஸ்அப் மற்றும் வங்கி தகவல்கள் ஹேக்கர் கைக்கு சென்றுவிடும்!
          </div>
        </div>
      </div>
    `;
  } else if (beat.type === 'threat-flow') {
    const stepsHtml = (beat.steps || []).map(s => `
      <div class="flow-step-card">
        <div class="flow-step-num">${s.num}</div>
        <div class="flow-step-body">
          <div class="flow-step-title">${s.title}</div>
          <div class="flow-step-desc">${s.desc}</div>
        </div>
      </div>
    `).join('');

    centerVisualHtml = `
      <div class="flow-container">
        ${stepsHtml}
      </div>
    `;
  } else if (beat.type === 'url-compare') {
    centerVisualHtml = `
      <div class="compare-container">
        <div class="compare-card fake">
          <div class="compare-tag fake">❌ போலி இணையதளம் (Scam Link)</div>
          <div class="compare-url fake">${beat.fakeUrl}</div>
          <div class="compare-note">bit.ly, .apk, .xyz போன்ற மர்மமான லிங்க்களை ஒருபோதும் தொடாதீர்கள்!</div>
        </div>
        <div class="compare-vs-badge">VS</div>
        <div class="compare-card real">
          <div class="compare-tag real">✅ அதிகாரப்பூர்வ அரசு தளம்</div>
          <div class="compare-url real">${beat.realUrl}</div>
          <div class="compare-note">மத்திய / மாநில அரசின் உண்மையான அபராதங்களை இங்கு மட்டுமே சரிபார்க்கவும்.</div>
        </div>
      </div>
    `;
  } else if (beat.type === 'golden-hour') {
    centerVisualHtml = `
      <div class="golden-card">
        <div class="golden-timer-pill">${beat.goldenHourNote || '⏱️ முதல் 2 மணி நேரத்திற்குள் அழைக்கவும்!'}</div>
        <div class="helpline-hero">
          <div class="helpline-phone-icon">📞</div>
          <div class="helpline-number">${beat.helpline || '1930'}</div>
          <div class="helpline-title">${beat.helplineLabel || 'தேசிய சைபர் கிரைம் அவசர உதவி எண்'}</div>
        </div>
        <div class="golden-info-box">
          பணம் திருடப்பட்ட உடனே 1930 எண்ணை அழைத்தால், ஹேக்கர் பணம் எடுப்பதற்கு முன் வங்கி கணக்கு உடனடியாக முடக்கப்படும்!
        </div>
        <div class="golden-portal">portal: cybercrime.gov.in</div>
      </div>
    `;
  } else if (beat.type === 'share-cta') {
    centerVisualHtml = `
      <div class="cta-card">
        <div class="cta-shield-icon">🛡️</div>
        <div class="cta-heading">${beat.title}</div>
        <div class="cta-subheading">${beat.subtitle}</div>
        <div class="cta-share-box">
          <div class="cta-share-btn">${beat.sharePrompt || '📲 குடும்ப WhatsApp குழுவில் உடனே பகிருங்கள் ↗️'}</div>
        </div>
        <div class="cta-follow-badge">
          ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="cta-follow-logo" alt="VizhiTN">` : ''}
          <span>${beat.followPrompt || '👉 @vizhi_tn பக்கத்தை Follow செய்யுங்கள்!'}</span>
        </div>
      </div>
    `;
  } else {
    centerVisualHtml = `
      <div class="generic-beat-card">
        <div class="generic-title">${beat.title}</div>
        <div class="generic-desc">${beat.subtitle || ''}</div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 45%, #E2E8F0 100%);
      font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      position: relative;
    }

    /* Progress bar */
    .progress-container {
      position: absolute; top: 45px; left: 60px; right: 60px;
      display: flex; gap: 10px; z-index: 20;
    }

    /* Top Brand Bar */
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF; border: 3px solid #CBD5E1;
      padding: 12px 28px; border-radius: 999px;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .pillar-chip {
      background: ${beat.badgeColor || '#2563EB'};
      color: #FFFFFF; font-size: 24px; font-weight: 900;
      padding: 12px 30px; border-radius: 999px;
      box-shadow: 0 6px 20px ${beat.badgeColor || '#2563EB'}44;
    }

    /* Header Box */
    .header-box {
      position: absolute; top: 180px; left: 60px; right: 60px;
      z-index: 10;
    }
    .beat-headline {
      font-size: 52px; font-weight: 900; line-height: 1.25; color: #0F172A;
      margin-bottom: 12px;
    }
    .beat-subheadline {
      font-size: 28px; font-weight: 700; color: #475569;
    }

    /* Center Visual Area */
    .center-visual-area {
      position: absolute; top: 380px; left: 60px; right: 60px; bottom: 150px;
      display: flex; justify-content: center; align-items: center;
      z-index: 10;
    }

    /* Phone Mockup Styles */
    .phone-card {
      width: 100%; max-width: 960px;
      background: #FFFFFF; border: 4px solid #CBD5E1;
      border-radius: 44px; padding: 40px;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.12);
      display: flex; flex-direction: column; gap: 28px;
    }
    .phone-notch {
      width: 160px; height: 8px; background: #94A3B8;
      border-radius: 4px; margin: 0 auto;
    }
    .phone-status {
      display: flex; justify-content: space-between;
      font-size: 22px; font-weight: 800; color: #64748B;
    }
    .sms-bubble-container {
      background: #F8FAFC; border: 3px solid #E2E8F0;
      border-radius: 32px; padding: 36px;
      display: flex; flex-direction: column; gap: 20px;
    }
    .sms-sender-row {
      display: flex; align-items: center; gap: 16px;
    }
    .sms-avatar {
      width: 56px; height: 56px; border-radius: 18px;
      background: #FEE2E2; border: 2px solid #FCA5A5;
      display: flex; justify-content: center; align-items: center;
      font-size: 30px;
    }
    .sms-sender-name { font-size: 28px; font-weight: 900; color: #0F172A; }
    .sms-sender-sub { font-size: 20px; font-weight: 700; color: #64748B; }
    .sms-time { margin-left: auto; font-size: 22px; font-weight: 700; color: #94A3B8; }
    .sms-bubble {
      background: #FFFFFF; border: 3px solid #CBD5E1;
      border-radius: 24px; padding: 26px 30px;
      font-size: 32px; font-weight: 800; line-height: 1.4; color: #0F172A;
    }
    .sms-warning-banner {
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      color: #FFFFFF; border-radius: 20px; padding: 20px 28px;
      font-size: 28px; font-weight: 900; display: flex; align-items: center; gap: 14px;
      box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
    }
    .phone-caution-footer {
      font-size: 28px; font-weight: 800; color: #DC2626; text-align: center;
    }

    /* APK Alert Card Styles */
    .apk-card {
      width: 100%; max-width: 960px;
      background: #FFFFFF; border: 4px solid #F97316;
      border-radius: 44px; padding: 48px;
      box-shadow: 0 25px 60px rgba(249, 115, 22, 0.15);
      text-align: center;
    }
    .apk-icon-box {
      font-size: 96px; margin-bottom: 20px;
    }
    .apk-title {
      font-size: 44px; font-weight: 900; color: #0F172A; margin-bottom: 8px;
    }
    .apk-file-type {
      font-size: 24px; font-weight: 800; color: #64748B; margin-bottom: 28px;
    }
    .apk-alert-badge {
      display: inline-block; background: #FEF2F2; border: 3px solid #EF4444;
      color: #DC2626; font-size: 30px; font-weight: 900;
      padding: 18px 36px; border-radius: 999px; margin-bottom: 32px;
    }
    .apk-danger-box {
      background: #FFF7ED; border: 3px solid #FDBA74;
      border-radius: 28px; padding: 32px; text-align: left;
    }
    .apk-danger-title { font-size: 30px; font-weight: 900; color: #C2410C; margin-bottom: 12px; }
    .apk-danger-text { font-size: 28px; font-weight: 700; color: #7C2D12; line-height: 1.45; }

    /* Threat Flow Styles */
    .flow-container {
      width: 100%; display: flex; flex-direction: column; gap: 24px;
    }
    .flow-step-card {
      background: #FFFFFF; border: 4px solid #E2E8F0;
      border-radius: 32px; padding: 32px 36px;
      display: flex; align-items: center; gap: 28px;
      box-shadow: 0 15px 35px rgba(15, 23, 42, 0.06);
    }
    .flow-step-num {
      width: 76px; height: 76px; border-radius: 24px;
      background: #FEE2E2; border: 3px solid #FCA5A5;
      color: #DC2626; font-size: 40px; font-weight: 900;
      display: flex; justify-content: center; align-items: center; flex-shrink: 0;
    }
    .flow-step-title { font-size: 34px; font-weight: 900; color: #0F172A; margin-bottom: 6px; }
    .flow-step-desc { font-size: 24px; font-weight: 700; color: #64748B; }

    /* URL Compare Styles */
    .compare-container {
      width: 100%; display: flex; flex-direction: column; gap: 28px;
    }
    .compare-card {
      background: #FFFFFF; border-radius: 36px; padding: 40px;
      box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
    }
    .compare-card.fake { border: 4px solid #EF4444; background: #FEF2F2; }
    .compare-card.real { border: 4px solid #10B981; background: #ECFDF5; }
    .compare-tag {
      font-size: 26px; font-weight: 900; margin-bottom: 14px;
    }
    .compare-tag.fake { color: #DC2626; }
    .compare-tag.real { color: #059669; }
    .compare-url {
      font-size: 38px; font-weight: 900; line-height: 1.3; margin-bottom: 12px;
    }
    .compare-url.fake { color: #991B1B; text-decoration: line-through; }
    .compare-url.real { color: #065F46; }
    .compare-note { font-size: 24px; font-weight: 700; color: #475569; }
    .compare-vs-badge {
      width: 70px; height: 70px; border-radius: 50%;
      background: #0F172A; color: #FFFFFF; font-size: 26px; font-weight: 900;
      display: flex; justify-content: center; align-items: center;
      margin: -10px auto; z-index: 5; border: 4px solid #FFFFFF;
    }

    /* Golden Hour Helpline Styles */
    .golden-card {
      width: 100%; background: #FFFFFF; border: 4px solid #10B981;
      border-radius: 44px; padding: 48px; text-align: center;
      box-shadow: 0 25px 60px rgba(16, 185, 129, 0.15);
    }
    .golden-timer-pill {
      display: inline-block; background: #FEF3C7; border: 3px solid #F59E0B;
      color: #B45309; font-size: 28px; font-weight: 900;
      padding: 14px 32px; border-radius: 999px; margin-bottom: 30px;
    }
    .helpline-hero {
      background: #F0FDF4; border: 4px solid #86EFAC;
      border-radius: 36px; padding: 36px; margin-bottom: 28px;
    }
    .helpline-phone-icon { font-size: 80px; margin-bottom: 10px; }
    .helpline-number { font-size: 96px; font-weight: 900; color: #15803D; letter-spacing: 4px; }
    .helpline-title { font-size: 30px; font-weight: 800; color: #166534; }
    .golden-info-box {
      font-size: 28px; font-weight: 700; color: #1E293B; line-height: 1.45; margin-bottom: 18px;
    }
    .golden-portal { font-size: 26px; font-weight: 800; color: #0284C7; }

    /* Share CTA Styles */
    .cta-card {
      width: 100%; background: #FFFFFF; border: 4px solid #8B5CF6;
      border-radius: 44px; padding: 50px; text-align: center;
      box-shadow: 0 25px 60px rgba(139, 92, 246, 0.15);
    }
    .cta-shield-icon { font-size: 110px; margin-bottom: 20px; }
    .cta-heading { font-size: 48px; font-weight: 900; color: #0F172A; margin-bottom: 12px; }
    .cta-subheading { font-size: 28px; font-weight: 700; color: #64748B; margin-bottom: 36px; }
    .cta-share-box {
      background: #F5F3FF; border: 3px solid #DDD6FE;
      border-radius: 30px; padding: 26px; margin-bottom: 28px;
    }
    .cta-share-btn { font-size: 34px; font-weight: 900; color: #6D28D9; }
    .cta-follow-badge {
      display: inline-flex; align-items: center; gap: 16px;
      background: #0F172A; color: #FFFFFF; font-size: 30px; font-weight: 900;
      padding: 18px 40px; border-radius: 999px;
    }
    .cta-follow-logo { width: 44px; height: 44px; border-radius: 50%; }

    /* Bottom Instagram-Native Footer */
    .insta-footer-bar {
      position: absolute; bottom: 50px; left: 60px; right: 60px;
      background: #0F172A; border-radius: 26px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
    }
    .footer-brand { font-size: 26px; font-weight: 800; color: #F8FAFC; }
    .footer-follow-btn {
      font-size: 26px; font-weight: 900; color: #FFFFFF;
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      padding: 10px 28px; border-radius: 14px;
    }
  </style>
</head>
<body>
  <div class="progress-container">
    ${progressBars}
  </div>

  <div class="top-bar">
    <div class="brand-pill">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">` : ''}
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="pillar-chip">${beat.tag || topic.pillarLabel}</div>
  </div>

  <div class="header-box">
    <div class="beat-headline">${beat.title}</div>
    <div class="beat-subheadline">${beat.subtitle}</div>
  </div>

  <div class="center-visual-area">
    ${centerVisualHtml}
  </div>

  <div class="insta-footer-bar">
    <div class="footer-brand">📢 விழி தமிழ்நாடு • கள ஆய்வு & உண்மை விவரங்கள்</div>
    <div class="footer-follow-btn">Follow @vizhi_tn</div>
  </div>
</body>
</html>`;
}

/**
 * Slide 1: The Hook & Topic Card (0-15s)
 */
function generateHookSlideHtml({ topic, brandLogoDataUri }) {
  const targetCrayonUri = getStickmanAssetDataUri('target-crayon.png');
  const ideaBulbUri = getStickmanAssetDataUri('idea-bulb-crayon.png');

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: #FAF8F5;
      background-image: radial-gradient(#CBD5E1 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      position: relative;
    }
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF; border: 3px solid #E2E8F0;
      padding: 12px 26px; border-radius: 999px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .pillar-chip {
      background: ${topic.pillarColor || '#2563EB'};
      color: #FFFFFF; font-size: 24px; font-weight: 900;
      padding: 12px 28px; border-radius: 999px;
      box-shadow: 0 4px 16px ${topic.pillarColor || '#2563EB'}44;
    }

    .hook-badge {
      position: absolute; top: 200px; left: 60px;
      display: inline-flex; align-items: center; gap: 14px;
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      color: #FFFFFF; font-size: 28px; font-weight: 900;
      padding: 14px 32px; border-radius: 18px;
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.25);
    }
    .hook-badge-icon { font-size: 32px; }

    .main-card {
      position: absolute; top: 310px; left: 60px; right: 60px;
      background: #FFFFFF; border: 4px solid #E2E8F0;
      border-radius: 36px; padding: 50px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      z-index: 10;
    }
    .main-title {
      font-size: 50px; font-weight: 900; line-height: 1.35; color: #0F172A;
      margin-bottom: 20px;
    }
    .main-sub {
      font-size: 32px; font-weight: 700; color: #64748B; line-height: 1.45;
    }

    .visual-spotlight {
      position: absolute; top: 760px; left: 60px; right: 60px;
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      border-radius: 32px; padding: 48px;
      color: #FFFFFF; text-align: center;
      box-shadow: 0 15px 40px rgba(15, 23, 42, 0.2);
    }
    .spotlight-icon { font-size: 90px; margin-bottom: 20px; }
    .spotlight-tag { font-size: 26px; font-weight: 800; color: #FBBF24; text-transform: uppercase; margin-bottom: 12px; }
    .spotlight-text { font-size: 38px; font-weight: 900; line-height: 1.4; color: #FFFFFF; }

    .bottom-prompt {
      position: absolute; bottom: 180px; left: 60px; right: 60px;
      background: #EFF6FF; border: 3px solid #93C5FD;
      border-radius: 24px; padding: 24px 32px;
      display: flex; align-items: center; gap: 20px;
    }
    .prompt-icon { font-size: 40px; }
    .prompt-text { font-size: 28px; font-weight: 800; color: #1D4ED8; }

    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A; border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left { font-size: 26px; font-weight: 800; color: #FBBF24; }
    .footer-right {
      font-size: 26px; font-weight: 900; color: #FFFFFF;
      background: #2563EB; padding: 8px 24px; border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">` : ''}
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="pillar-chip">${topic.pillarLabel}</div>
  </div>

  <div class="hook-badge">
    <span class="hook-badge-icon">${topic.slide1.icon || '🔍'}</span>
    <span>${topic.slide1.tag || 'உண்மை என்ன?'}</span>
  </div>

  <div class="main-card">
    <div class="main-title">${topic.slide1.title}</div>
    <div class="main-sub">${topic.slide1.subTitle}</div>
  </div>

  <div class="visual-spotlight">
    <div class="spotlight-icon">${topic.slide1.icon || '🚀'}</div>
    <div class="spotlight-tag">கள ஆய்வு தகவல்</div>
    <div class="spotlight-text">${topic.slide1.highlightText}</div>
  </div>

  <div class="bottom-prompt">
    <span class="prompt-icon">⚡</span>
    <span class="prompt-text">முழுமையான உண்மை விவரங்கள் அடுத்த பகுதியில்...</span>
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 தமிழ்நாடு மெகா உண்மைகளுக்கு Subscribe பண்ணுங்க!</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

/**
 * Slide 2: The Deep Data, Key Stats & Technical Blueprints (15-35s)
 */
function generateDataSlideHtml({ topic, brandLogoDataUri }) {
  const statsHtml = (topic.slide2.stats || []).map((s, idx) => `
    <div class="stat-card">
      <div class="stat-num-box">${idx + 1}</div>
      <div class="stat-content">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-note">${s.note}</div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: #FAF8F5;
      background-image: radial-gradient(#CBD5E1 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      position: relative;
    }
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF; border: 3px solid #E2E8F0;
      padding: 12px 26px; border-radius: 999px;
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .pillar-chip {
      background: ${topic.pillarColor || '#2563EB'};
      color: #FFFFFF; font-size: 24px; font-weight: 900;
      padding: 12px 28px; border-radius: 999px;
    }

    .header-box {
      position: absolute; top: 190px; left: 60px; right: 60px;
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      color: #FFFFFF; border-radius: 28px; padding: 28px 36px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
    }
    .header-title { font-size: 36px; font-weight: 900; }
    .header-tag { font-size: 22px; font-weight: 700; color: #FBBF24; }

    .stats-grid {
      position: absolute; top: 320px; left: 60px; right: 60px;
      display: flex; flex-direction: column; gap: 24px;
    }
    .stat-card {
      background: #FFFFFF; border: 4px solid #E2E8F0;
      border-radius: 28px; padding: 32px 36px;
      display: flex; align-items: center; gap: 28px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
    }
    .stat-num-box {
      width: 72px; height: 72px; border-radius: 22px;
      background: #EFF6FF; border: 3px solid #BFDBFE;
      display: flex; justify-content: center; align-items: center;
      font-size: 38px; font-weight: 900; color: #2563EB; flex-shrink: 0;
    }
    .stat-content { flex: 1; }
    .stat-label { font-size: 22px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 6px; }
    .stat-value { font-size: 40px; font-weight: 900; color: #0F172A; line-height: 1.25; margin-bottom: 6px; }
    .stat-note { font-size: 24px; font-weight: 700; color: #059669; }

    .verified-banner {
      position: absolute; bottom: 180px; left: 60px; right: 60px;
      background: #ECFDF5; border: 3px solid #10B981;
      border-radius: 24px; padding: 22px 32px;
      display: flex; align-items: center; gap: 20px;
    }
    .v-icon { font-size: 38px; }
    .v-text { font-size: 26px; font-weight: 800; color: #065F46; }

    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A; border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left { font-size: 26px; font-weight: 800; color: #FBBF24; }
    .footer-right {
      font-size: 26px; font-weight: 900; color: #FFFFFF;
      background: #2563EB; padding: 8px 24px; border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">` : ''}
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="pillar-chip">${topic.slide2.tag || 'முக்கிய புள்ளிவிவரங்கள்'}</div>
  </div>

  <div class="header-box">
    <div class="header-title">${topic.slide2.title}</div>
    <div class="header-tag">ஆய்வுத் தரவுகள்</div>
  </div>

  <div class="stats-grid">
    ${statsHtml}
  </div>

  <div class="verified-banner">
    <span class="v-icon">📊</span>
    <span class="v-text">100% அதிகாரப்பூர்வ தகவல்கள் & புள்ளிவிவரங்கள்</span>
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 உங்கள் கருத்து என்ன? கீழே கமெண்ட் பண்ணுங்க!</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

/**
 * Slide 3: The Climax, Reality Impact & Discussion Call-To-Action (35-45s)
 */
function generateClimaxSlideHtml({ topic, brandLogoDataUri }) {
  const pointsHtml = (topic.slide3.points || []).map(p => `
    <div class="point-row">
      <span class="p-bullet">⚡</span>
      <span class="p-text">${p}</span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: #FAF8F5;
      background-image: radial-gradient(#CBD5E1 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      position: relative;
    }
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF; border: 3px solid #E2E8F0;
      padding: 12px 26px; border-radius: 999px;
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .pillar-chip {
      background: ${topic.pillarColor || '#2563EB'};
      color: #FFFFFF; font-size: 24px; font-weight: 900;
      padding: 12px 28px; border-radius: 999px;
    }

    .conclusion-box {
      position: absolute; top: 200px; left: 60px; right: 60px;
      background: #FFFFFF; border: 4px solid #E2E8F0;
      border-radius: 36px; padding: 44px;
      box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
    }
    .conc-head { font-size: 44px; font-weight: 900; color: #0F172A; margin-bottom: 30px; }
    .point-row {
      display: flex; gap: 20px; margin-bottom: 26px; line-height: 1.45;
    }
    .p-bullet { font-size: 32px; color: ${topic.pillarColor || '#2563EB'}; flex-shrink: 0; }
    .p-text { font-size: 32px; font-weight: 800; color: #1E293B; }

    .comment-card {
      position: absolute; top: 860px; left: 60px; right: 60px;
      background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%);
      color: #FFFFFF; border-radius: 32px; padding: 44px;
      text-align: center;
      box-shadow: 0 15px 40px rgba(30, 58, 138, 0.25);
    }
    .c-icon { font-size: 64px; margin-bottom: 16px; }
    .c-title { font-size: 40px; font-weight: 900; margin-bottom: 14px; }
    .c-sub { font-size: 28px; font-weight: 700; color: #93C5FD; line-height: 1.4; }
    .c-arrow { font-size: 60px; margin-top: 14px; }

    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A; border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left { font-size: 26px; font-weight: 800; color: #FBBF24; }
    .footer-right {
      font-size: 26px; font-weight: 900; color: #FFFFFF;
      background: #2563EB; padding: 8px 24px; border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">` : ''}
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="pillar-chip">${topic.slide3.tag || 'முடிவுரை'}</div>
  </div>

  <div class="conclusion-box">
    <div class="conc-head">${topic.slide3.title}</div>
    ${pointsHtml}
  </div>

  <div class="comment-card">
    <div class="c-icon">💬</div>
    <div class="c-title">உங்கள் கருத்து என்ன?</div>
    <div class="c-sub">கீழே உள்ள Comment பகுதியில் உங்கள் கருத்தை தெரிவியுங்கள்!</div>
    <div class="c-arrow">👇</div>
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 அடுத்த மெகா வீடியோவுக்கு Subscribe செய்யுங்கள்!</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

// --- MAIN RUNNER ---
async function main() {
  console.log('====================================================');
  console.log('VizhiTN Flagship Infotainment & Investigative Shorts Engine');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1] || 'infotainment-afternoon';
  const topicIdArg = process.argv.find(a => a.startsWith('--topic='))?.split('=')[1];

  const topic = topicIdArg ? getInfotainmentTopicById(topicIdArg) : getInfotainmentTopicForSlot(slotArg);
  if (!topic) {
    throw new Error(`Topic not found for slot "${slotArg}"`);
  }

  console.log(`[INFOTAINMENT TARGET] "${topic.titleTa}" (${topic.id})`);
  console.log(`[PILLAR] ${topic.pillar} (${topic.pillarLabel})`);

  const sessionDir = path.resolve(`scripts/youtube/assets/info_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  const scenes = [];

  if (topic.beats && topic.beats.length > 0) {
    console.log(`[DYNAMIC BEATS] Rendering ${topic.beats.length} fast-paced visual beats...`);
    for (let bIdx = 0; bIdx < topic.beats.length; bIdx++) {
      const beat = topic.beats[bIdx];
      console.log(`[BEAT ${bIdx + 1}/${topic.beats.length}] Synthesizing "${beat.title}"...`);
      const bAudioPath = path.join(sessionDir, `beat_audio_${bIdx + 1}.mp3`);
      await synthesizeSpeech(beat.spoken, bAudioPath);
      const bDur = getAudioDuration(bAudioPath);

      const bHtml = generateDynamicBeatSlideHtml({
        beat,
        topic,
        brandLogoDataUri,
        index: bIdx,
        total: topic.beats.length
      });
      const bSlidePath = path.join(sessionDir, `beat_slide_${bIdx + 1}.png`);
      renderHtmlToImage(bHtml, bSlidePath, { width: 1080, height: 1920 });

      // Snappy duration with zero silent gaps: exact audio duration + 0.05s
      const cleanDuration = Math.max(2.0, parseFloat((bDur + 0.05).toFixed(2)));
      scenes.push({
        imagePath: bSlidePath,
        slidePath: bSlidePath,
        audioPath: bAudioPath,
        durationSec: cleanDuration
      });
    }
  } else {
    // 3-scene legacy fallback with clean duration
    console.log('[LEGACY 3-SCENE FALLBACK] Rendering 3 scenes...');
    const s1Spoken = `${topic.hookSpoken} ${topic.realitySpoken}`;
    const s1AudioPath = path.join(sessionDir, 'info_audio_1.mp3');
    await synthesizeSpeech(s1Spoken, s1AudioPath);
    const s1Dur = getAudioDuration(s1AudioPath);
    const s1Html = generateHookSlideHtml({ topic, brandLogoDataUri });
    const s1Path = path.join(sessionDir, 'info_slide_1.png');
    renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

    const s2Spoken = topic.dataSpoken;
    const s2AudioPath = path.join(sessionDir, 'info_audio_2.mp3');
    await synthesizeSpeech(s2Spoken, s2AudioPath);
    const s2Dur = getAudioDuration(s2AudioPath);
    const s2Html = generateDataSlideHtml({ topic, brandLogoDataUri });
    const s2Path = path.join(sessionDir, 'info_slide_2.png');
    renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

    const s3Spoken = topic.climaxSpoken;
    const s3AudioPath = path.join(sessionDir, 'info_audio_3.mp3');
    await synthesizeSpeech(s3Spoken, s3AudioPath);
    const s3Dur = getAudioDuration(s3AudioPath);
    const s3Html = generateClimaxSlideHtml({ topic, brandLogoDataUri });
    const s3Path = path.join(sessionDir, 'info_slide_3.png');
    renderHtmlToImage(s3Html, s3Path, { width: 1080, height: 1920 });

    scenes.push(
      { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: parseFloat((s1Dur + 0.05).toFixed(2)) },
      { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: parseFloat((s2Dur + 0.05).toFixed(2)) },
      { imagePath: s3Path, slidePath: s3Path, audioPath: s3AudioPath, durationSec: parseFloat((s3Dur + 0.05).toFixed(2)) }
    );
  }

  const outputVideoPath = path.join(sessionDir, `VizhiTN_${topic.id}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Infotainment Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[VIDEO OK] Rendered: ${outputVideoPath}`);

  const coverImagePath = scenes[0]?.imagePath || null;

  const videoTitle = topic.titleTa;
  const videoDescription = `${topic.titleTa}\n\nவிழி தமிழ்நாடு — கள ஆய்வு & புலனாய்வு ஆவணப் பதிவு.\n\n📌 முக்கியத் தகவல்கள்:\n${topic.hookSpoken}\n\n${topic.realitySpoken}\n\n${topic.dataSpoken}\n\n💬 உங்கள் கருத்து என்ன? கீழே கமெண்ட் செய்யுங்கள்!\n\n${(topic.hashtags || []).join(' ')}`;
  const videoTags = topic.hashtags?.map(h => h.replace('#', '')) || ['Tamil Nadu', 'Mega Projects', 'Shorts', 'VizhiTN'];
  const pinnedCommentText = topic.discussionPrompt || '💬 இந்த வீடியோ குறித்த உங்கள் கருத்து என்ன? கீழே கமெண்ட் செய்யுங்கள்! 👇';

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Pinned Comment Preview: ${pinnedCommentText}`);
    console.log(`Video File: ${outputVideoPath}`);
    try {
      await crossPostVideoToMetaSocials({
        videoFilePath: outputVideoPath,
        thumbnailFilePath: coverImagePath,
        title: videoTitle,
        caption: videoDescription,
        isReel: true,
        isDryRun: true
      });
    } catch (_) {}
    console.log('[SUCCESS ✓] Infotainment pipeline dry-run completed successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Infotainment Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: videoTags,
    categoryId: '28', // Science & Technology / Infotainment
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[SHORT PUBLISHED ✓] Live: ${res.videoUrl}`);

  if (res.videoId && pinnedCommentText) {
    try {
      console.log('[PINNED COMMENT] Posting discussion prompt...');
      await postPinnedComment(res.videoId, pinnedCommentText);
      console.log('[PINNED COMMENT ✓] Discussion prompt pinned!');
    } catch (commentErr) {
      console.warn('[PINNED COMMENT WARN] Could not post pinned comment:', commentErr.message);
    }
  }

  // Auto-crosspost to Facebook & Instagram Reels for both afternoon & evening slots
  try {
    console.log('\n[SOCIAL SYNC] Crossposting Infotainment video to Facebook & Instagram Reels...');
    await crossPostVideoToMetaSocials({
      videoFilePath: outputVideoPath,
      thumbnailFilePath: coverImagePath,
      title: videoTitle,
      caption: videoDescription,
      isReel: true,
      isDryRun: false
    });
    console.log('[SOCIAL SYNC ✓] Meta Reels crosspost complete!');
  } catch (metaErr) {
    console.warn('[SOCIAL SYNC WARN] Meta Reels crosspost failed:', metaErr.message);
  }
}

main().catch(err => {
  console.error('[FATAL INFOTAINMENT ERROR]:', err);
  process.exit(1);
});

