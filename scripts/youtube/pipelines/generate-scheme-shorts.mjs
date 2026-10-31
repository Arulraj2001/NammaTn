// scripts/youtube/pipelines/generate-scheme-shorts.mjs
/**
 * VizhiTN Autonomous Government Welfare Scheme Guide Pipeline (9:16 Shorts)
 * Produces high-retention, practical step-by-step explainer Shorts for Tamil Nadu citizens.
 * Integrates Google Gemini Lifelike Voice with automatic Edge-TTS fallback.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { TN_SCHEMES_CATALOG, getTodayScheme, getSchemeById } from '../engine/scheme-catalog.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';

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

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-PallaviNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Google Gemini Lifelike Neural Voice
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[SCHEME TTS] Synthesizing via Google Gemini Lifelike Voice: "${cleanText.slice(0, 40)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'kavitha' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`[SCHEME TTS ✓] Gemini speech generated successfully: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[SCHEME TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Seamlessly falling back to Edge-TTS...`);
    }
  }

  // 2. Microsoft Edge-TTS Fallback
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+5%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 45000, windowsHide: true });
    console.log(`[SCHEME TTS ✓] Edge-TTS speech generated: ${path.basename(outputPath)}`);
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`TTS synthesis failed to write file: ${outputPath}`);
  }
  return outputPath;
}

function generateSchemeSlideHtml({
  scheme,
  sceneNumber,
  title,
  subTitle,
  cardHtml,
  brandLogoDataUri
}) {
  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #090a16 100%);
      font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #ffffff;
      position: relative;
    }

    .top-bar {
      position: absolute; top: 90px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: rgba(15, 23, 42, 0.85);
      border: 2px solid rgba(255, 255, 255, 0.3);
      padding: 10px 24px; border-radius: 999px;
      backdrop-filter: blur(12px);
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; letter-spacing: 0.5px; color: #fff; }

    .category-chip {
      background: ${scheme.categoryColor || '#E11D48'};
      color: #fff; font-size: 24px; font-weight: 800;
      padding: 10px 28px; border-radius: 999px;
      text-transform: uppercase;
      box-shadow: 0 4px 20px ${scheme.categoryColor || '#E11D48'}55;
    }

    .header-block {
      position: absolute; top: 220px; left: 60px; right: 60px;
      z-index: 10;
    }
    .benefit-tag {
      display: inline-block;
      background: linear-gradient(90deg, #F59E0B, #D97706);
      color: #000; font-weight: 900; font-size: 28px;
      padding: 8px 24px; border-radius: 8px; margin-bottom: 18px;
      letter-spacing: 0.5px;
    }
    .main-title {
      font-size: 52px; font-weight: 900; line-height: 1.25;
      color: #ffffff; text-shadow: 0 4px 24px rgba(0,0,0,0.8);
      margin-bottom: 14px;
    }
    .sub-title {
      font-size: 30px; font-weight: 600; color: #cbd5e1;
      line-height: 1.4;
    }

    .content-area {
      position: absolute; top: 620px; left: 60px; right: 60px;
      bottom: 220px; display: flex; flex-direction: column; justify-content: center;
      z-index: 10;
    }

    .card {
      background: rgba(15, 23, 42, 0.92);
      border: 3px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px; padding: 48px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
    }
    .card-heading {
      font-size: 36px; font-weight: 900; color: #38bdf8;
      display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
      border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 16px;
    }
    .info-item {
      font-size: 32px; font-weight: 600; line-height: 1.6;
      color: #f1f5f9; margin-bottom: 22px;
      display: flex; align-items: flex-start; gap: 18px;
    }
    .info-item:last-child { margin-bottom: 0; }
    .bullet {
      color: #38bdf8; font-size: 34px; line-height: 1.2; flex-shrink: 0;
    }

    .footer-bar {
      position: absolute; bottom: 80px; left: 60px; right: 60px;
      background: rgba(10, 15, 30, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px; padding: 22px 32px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .footer-left { display: flex; align-items: center; gap: 16px; }
    .helpline-badge {
      background: #ef4444; color: #fff; font-size: 26px; font-weight: 900;
      padding: 6px 18px; border-radius: 8px;
    }
    .portal-text { font-size: 26px; font-weight: 700; color: #94a3b8; }
    .follow-text { font-size: 26px; font-weight: 800; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      <img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="category-chip">${scheme.categoryLabel}</div>
  </div>

  <div class="header-block">
    <div class="benefit-tag">${scheme.benefitBadge}</div>
    <div class="main-title">${title}</div>
    <div class="sub-title">${subTitle}</div>
  </div>

  <div class="content-area">
    ${cardHtml}
  </div>

  <div class="footer-bar">
    <div class="footer-left">
      <span class="helpline-badge">உதவி எண்</span>
      <span class="portal-text">${scheme.helpline}</span>
    </div>
    <div class="follow-text">VizhiTN | அரசு நலத்திட்டங்கள்</div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN Tamil Nadu Government Welfare Scheme Guide');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const schemeArg = process.argv.find(a => a.startsWith('--scheme='))?.split('=')[1];

  const scheme = schemeArg ? getSchemeById(schemeArg) : getTodayScheme();
  if (!scheme) {
    throw new Error(`Scheme not found for key: ${schemeArg}`);
  }

  console.log(`[SCHEME] Selected: "${scheme.titleTa}" (${scheme.id})`);
  console.log(`[BENEFIT] ${scheme.benefitBadge} | Dept: ${scheme.officialDepartment}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/scheme_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  // Scene 1: The High-Stakes Hook & Problem
  const s1Spoken = `${scheme.titleTa}. ${scheme.hookTa}`;
  const s1AudioPath = path.join(sessionDir, 'scheme_audio_1.mp3');
  await synthesizeSpeech(s1Spoken, s1AudioPath);
  const s1Dur = getAudioDuration(s1AudioPath);

  const s1Card = `
    <div class="card">
      <div class="card-heading">🎯 முக்கிய நோக்கம் & பலன்கள்</div>
      <div class="info-item"><span class="bullet">✓</span> ${scheme.benefitBadge}</div>
      <div class="info-item"><span class="bullet">✓</span> துறை: ${scheme.officialDepartment}</div>
      <div class="info-item"><span class="bullet">✓</span> அதிகாரப்பூர்வ தளம்: ${scheme.officialPortal}</div>
    </div>
  `;
  const s1Html = generateSchemeSlideHtml({
    scheme,
    sceneNumber: 1,
    title: scheme.titleTa,
    subTitle: 'தமிழ்நாடு அரசு அதிகாரப்பூர்வ வழிகாட்டி',
    cardHtml: s1Card,
    brandLogoDataUri
  });
  const s1Path = path.join(sessionDir, 'scheme_slide_1.png');
  renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

  // Scene 2: Eligibility & Required Documents
  const s2Spoken = `தகுதி வரம்புகள்: ${scheme.eligibilityTa} தேவைப்படும் முக்கிய ஆவணங்கள்: ${scheme.documentsTa}`;
  const s2AudioPath = path.join(sessionDir, 'scheme_audio_2.mp3');
  await synthesizeSpeech(s2Spoken, s2AudioPath);
  const s2Dur = getAudioDuration(s2AudioPath);

  const s2Card = `
    <div class="card">
      <div class="card-heading">📋 யார் தகுதியானவர்கள்?</div>
      <div class="info-item"><span class="bullet">🔍</span> ${scheme.eligibilityTa}</div>
      <div class="card-heading" style="margin-top: 32px;">📄 தேவையான ஆவணங்கள்</div>
      <div class="info-item"><span class="bullet">📌</span> ${scheme.documentsTa}</div>
    </div>
  `;
  const s2Html = generateSchemeSlideHtml({
    scheme,
    sceneNumber: 2,
    title: 'யாரெல்லாம் விண்ணப்பிக்கலாம்?',
    subTitle: 'தகுதி வரம்புகள் & ஆவணங்கள் பட்டியல்',
    cardHtml: s2Card,
    brandLogoDataUri
  });
  const s2Path = path.join(sessionDir, 'scheme_slide_2.png');
  renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

  // Scene 3: How to Apply & Verified Helpline
  const s3Spoken = `விண்ணப்பிக்கும் முறை: ${scheme.applicationStepsTa} ${scheme.avoidMiddlemenWarning} கூடுதல் விவரங்களுக்கு உதவி எண் ${scheme.helpline}-ஐ அழைக்கலாம். விழி தமிழ்நாடு சேனலை சப்ஸ்கிரைப் செய்து கொள்ளுங்கள்!`;
  const s3AudioPath = path.join(sessionDir, 'scheme_audio_3.mp3');
  await synthesizeSpeech(s3Spoken, s3AudioPath);
  const s3Dur = getAudioDuration(s3AudioPath);

  const s3Card = `
    <div class="card">
      <div class="card-heading">💻 விண்ணப்பிக்கும் எளிய முறை</div>
      <div class="info-item"><span class="bullet">🚀</span> ${scheme.applicationStepsTa}</div>
      <div class="info-item" style="color: #facc15;"><span class="bullet">⚠️</span> ${scheme.avoidMiddlemenWarning}</div>
      <div class="info-item" style="color: #4ade80;"><span class="bullet">📞</span> அரசு உதவி எண்: ${scheme.helpline}</div>
    </div>
  `;
  const s3Html = generateSchemeSlideHtml({
    scheme,
    sceneNumber: 3,
    title: 'விண்ணப்பிப்பது எப்படி?',
    subTitle: 'இணையவழி முறை & உதவி எண்கள்',
    cardHtml: s3Card,
    brandLogoDataUri
  });
  const s3Path = path.join(sessionDir, 'scheme_slide_3.png');
  renderHtmlToImage(s3Html, s3Path, { width: 1080, height: 1920 });

  // Assemble Video
  const scenes = [
    { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: Math.ceil(s1Dur) + 1 },
    { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: Math.ceil(s2Dur) + 1 },
    { imagePath: s3Path, slidePath: s3Path, audioPath: s3AudioPath, durationSec: Math.ceil(s3Dur) + 1 }
  ];

  const outputVideoPath = path.join(sessionDir, `TN_Scheme_${scheme.id}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Scheme Explainer Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[SCHEME VIDEO OK] Rendered: ${outputVideoPath}`);

  const videoTitle = `${scheme.titleTa} | TN Govt Schemes #Shorts`;
  const videoDescription = `${scheme.titleTa} - தமிழ்நாடு அரசு நலத்திட்ட வழிகாட்டி.\n\nபலன்: ${scheme.benefitBadge}\nஅதிகாரப்பூர்வ தளம்: ${scheme.officialPortal}\nஉதவி எண்: ${scheme.helpline}\n\n#TamilNaduSchemes #TNGovtSchemes #VizhiTN #Shorts #CitizenRights`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Scheme Explainer pipeline verified successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Scheme Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: ['Tamil Nadu Government Schemes', 'TN Schemes 2026', 'Magalir Urimai', 'TN Citizen Guide', 'Shorts'],
    categoryId: '27',
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[SCHEME SHORT PUBLISHED ✓] Live: ${res.videoUrl}`);
}

main().catch(err => {
  console.error('[FATAL SCHEME ERROR]:', err);
  process.exit(1);
});

