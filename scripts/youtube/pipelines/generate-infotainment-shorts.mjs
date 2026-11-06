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
    const edgeCmd = `${python} -m edge_tts --voice "${voice}" --rate=+6% --file "${tempTextFile}" --write-media "${outputPath}"`;
    execSync(edgeCmd, { stdio: 'pipe', timeout: 30000 });
    return outputPath;
  } finally {
    if (fs.existsSync(tempTextFile)) {
      try { fs.unlinkSync(tempTextFile); } catch {}
    }
  }
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

  // Scene 1: Disruptive Hook (0-15s)
  console.log('[SCENE 1] Synthesizing Hook...');
  const s1Spoken = `${topic.hookSpoken} ${topic.realitySpoken}`;
  const s1AudioPath = path.join(sessionDir, 'info_audio_1.mp3');
  await synthesizeSpeech(s1Spoken, s1AudioPath);
  const s1Dur = getAudioDuration(s1AudioPath);

  const s1Html = generateHookSlideHtml({ topic, brandLogoDataUri });
  const s1Path = path.join(sessionDir, 'info_slide_1.png');
  renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

  // Scene 2: The Deep Data, Key Stats & Technical Blueprints (15-35s)
  console.log('[SCENE 2] Synthesizing Data & Proof...');
  const s2Spoken = topic.dataSpoken;
  const s2AudioPath = path.join(sessionDir, 'info_audio_2.mp3');
  await synthesizeSpeech(s2Spoken, s2AudioPath);
  const s2Dur = getAudioDuration(s2AudioPath);

  const s2Html = generateDataSlideHtml({ topic, brandLogoDataUri });
  const s2Path = path.join(sessionDir, 'info_slide_2.png');
  renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

  // Scene 3: The Climax, Reality Impact & Discussion CTA (35-45s)
  console.log('[SCENE 3] Synthesizing Climax & CTA...');
  const s3Spoken = topic.climaxSpoken;
  const s3AudioPath = path.join(sessionDir, 'info_audio_3.mp3');
  await synthesizeSpeech(s3Spoken, s3AudioPath);
  const s3Dur = getAudioDuration(s3AudioPath);

  const s3Html = generateClimaxSlideHtml({ topic, brandLogoDataUri });
  const s3Path = path.join(sessionDir, 'info_slide_3.png');
  renderHtmlToImage(s3Html, s3Path, { width: 1080, height: 1920 });

  // Assemble Video
  const scenes = [
    { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: Math.ceil(s1Dur) + 1 },
    { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: Math.ceil(s2Dur) + 1 },
    { imagePath: s3Path, slidePath: s3Path, audioPath: s3AudioPath, durationSec: Math.ceil(s3Dur) + 1 }
  ];

  const outputVideoPath = path.join(sessionDir, `VizhiTN_${topic.id}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Infotainment Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[VIDEO OK] Rendered: ${outputVideoPath}`);

  const videoTitle = topic.titleTa;
  const videoDescription = `${topic.titleTa}\n\nவிழி தமிழ்நாடு — கள ஆய்வு & புலனாய்வு ஆவணப் பதிவு.\n\n📌 முக்கியத் தகவல்கள்:\n${topic.hookSpoken}\n\n${topic.realitySpoken}\n\n${topic.dataSpoken}\n\n💬 உங்கள் கருத்து என்ன? கீழே கமெண்ட் செய்யுங்கள்!\n\n${(topic.hashtags || []).join(' ')}`;
  const videoTags = topic.hashtags?.map(h => h.replace('#', '')) || ['Tamil Nadu', 'Mega Projects', 'Shorts', 'VizhiTN'];
  const pinnedCommentText = topic.discussionPrompt || '💬 இந்த வீடியோ குறித்த உங்கள் கருத்து என்ன? கீழே கமெண்ட் செய்யுங்கள்! 👇';

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Pinned Comment Preview: ${pinnedCommentText}`);
    console.log(`Video File: ${outputVideoPath}`);
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

  // Auto-crosspost to Facebook & Instagram Reels for afternoon slot
  if (slotArg.includes('afternoon') && res.videoId) {
    try {
      console.log('[SOCIAL SYNC] Crossposting to Facebook & Instagram Reels...');
      await crossPostVideoToMetaSocials({
        videoFilePath: outputVideoPath,
        title: videoTitle,
        description: videoDescription
      });
      console.log('[SOCIAL SYNC ✓] Meta crosspost complete!');
    } catch (metaErr) {
      console.warn('[SOCIAL SYNC WARN] Meta crosspost failed:', metaErr.message);
    }
  }
}

main().catch(err => {
  console.error('[FATAL INFOTAINMENT ERROR]:', err);
  process.exit(1);
});
