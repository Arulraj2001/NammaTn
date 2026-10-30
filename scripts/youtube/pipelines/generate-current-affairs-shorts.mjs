// scripts/youtube/pipelines/generate-current-affairs-shorts.mjs
/**
 * VizhiTN Daily Current Affairs Exam Shorts Pipeline (9:16 Portrait)
 * Extracts today's top 3 exam facts and compiles a rapid 45-55 second Short.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { getDailyCurrentAffairsPackage, getNowIst } from '../engine/live-current-affairs-fetcher.mjs';
import { buildShortsScript } from '../engine/bulletin-script-builder.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { uploadToYouTube } from '../engine/youtube-client.mjs';

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

function synthesizeSpeech(text, outputPath, voice = 'ta-IN-PallaviNeural') {
  const python = getPythonBinary();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const cmd = `"${python}" -m edge_tts --voice "${voice}" --rate="+6%" --text "${cleanText.replace(/"/g, '\\"')}" --write-media "${outputPath}"`;
  execSync(cmd, { stdio: 'pipe', timeout: 30000 });

  if (!fs.existsSync(outputPath)) {
    throw new Error(`TTS synthesis failed to write file: ${outputPath}`);
  }
  return outputPath;
}

function buildShortSlideHtml(event, index, total, tamilDate) {
  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #09090b 80%);
      font-family: 'Noto Sans Tamil', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 100px 70px;
      color: #fff;
      position: relative;
    }
    .top-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pill {
      background: #ef4444;
      color: #fff;
      font-weight: 900;
      font-size: 30px;
      padding: 12px 32px;
      border-radius: 9999px;
    }
    .date {
      background: #eab308;
      color: #000;
      font-weight: 900;
      font-size: 32px;
      padding: 12px 32px;
      border-radius: 16px;
    }
    .content-box {
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .item-num {
      color: #38bdf8;
      font-size: 40px;
      font-weight: 900;
      letter-spacing: 2px;
    }
    .headline {
      font-size: 68px;
      font-weight: 900;
      line-height: 1.25;
      color: #fef08a;
      border-left: 10px solid #eab308;
      padding-left: 30px;
    }
    .pointer-box {
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid #6366f1;
      border-radius: 24px;
      padding: 40px;
    }
    .pointer-label {
      font-size: 32px;
      font-weight: 900;
      color: #a5b4fc;
      margin-bottom: 16px;
    }
    .pointer-text {
      font-size: 42px;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1.45;
    }
    .footer {
      background: rgba(2, 6, 23, 0.9);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      font-size: 34px;
      font-weight: 900;
      color: #fde047;
    }
  </style>
</head>
<body>
  <div class="top-badge">
    <div class="pill">TNPSC 1-MIN RECAP</div>
    <div class="date">📅 ${tamilDate}</div>
  </div>

  <div class="content-box">
    <div class="item-num">முக்கிய நடப்பு நிகழ்வு ${index} / ${total}</div>
    <h1 class="headline">${event.headline_ta}</h1>
    <div class="pointer-box">
      <div class="pointer-label">⭐ தேர்வு குறிப்பு (EXAM POINTER)</div>
      <p class="pointer-text">${event.exam_pointer_ta}</p>
    </div>
  </div>

  <div class="footer">
    ${index === total ? '❓ கேள்விக்கு கமெண்ட்டில் விடையளிக்கவும்!' : '📲 அடுத்த செய்திக்கு Swipe செய்யவும்!'}
  </div>
</body>
</html>`;
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const skipUpload = isDryRun || process.argv.includes('--skip-upload');

  console.log('====================================================');
  console.log('VizhiTN Daily TNPSC Current Affairs Shorts Engine');
  console.log(`Execution Mode: ${isDryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log('====================================================');

  const pkg = await getDailyCurrentAffairsPackage();
  const shortsData = buildShortsScript(pkg);

  console.log(`[SHORTS SCRIPT OK] Title: ${shortsData.title}`);
  const sessionDir = path.resolve(`scripts/youtube/assets/shorts_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const scenes = [];
  const topEvents = shortsData.topEvents;

  for (let i = 0; i < topEvents.length; i++) {
    const event = topEvents[i];
    const isLast = i === topEvents.length - 1;

    const spokenText = isLast
      ? `செய்தி ${i + 1}: ${event.headline_ta}. ${event.exam_pointer_ta}. இன்றைய கேள்வி: ${event.recall_question_ta}. கமெண்ட் பண்ணுங்க!`
      : `செய்தி ${i + 1}: ${event.headline_ta}. ${event.exam_pointer_ta}.`;

    const slideHtml = buildShortSlideHtml(event, i + 1, topEvents.length, shortsData.tamilDate);
    const slidePath = path.join(sessionDir, `short_slide_${i + 1}.png`);
    renderHtmlToImage(slideHtml, slidePath, { width: 1080, height: 1920 });

    const audioPath = path.join(sessionDir, `short_audio_${i + 1}.mp3`);
    synthesizeSpeech(spokenText, audioPath);
    const duration = getAudioDuration(audioPath);

    scenes.push({
      imagePath: slidePath,
      slidePath,
      audioPath,
      durationSec: Math.ceil(duration) + 1
    });
  }

  const outputVideoPath = path.join(sessionDir, `TNPSC_Shorts_${pkg.date}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling 9:16 portrait video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[SHORTS VIDEO OK] Rendered: ${outputVideoPath}`);

  if (skipUpload) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${shortsData.title}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Daily Shorts pipeline verified successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: shortsData.title,
    description: `இன்றைய டாப் 3 நடப்பு நிகழ்வுகள் (${shortsData.tamilDate}). TNPSC Group 1, 2, 4, Police SI தேர்வுகளுக்கான குறிப்புகள்.\n\n#Shorts #TNPSC #TNPSCCurrentAffairs #TamilNaduNews #VizhiTN`,
    tags: ['TNPSC Current Affairs', 'Tamil Nadu Shorts', 'TNPSC Exam Shorts', 'Daily Current Affairs Tamil', 'Shorts'],
    categoryId: '27',
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[SHORTS PUBLISHED ✓] Live: ${res.videoUrl}`);
}

main().catch(err => {
  console.error('[FATAL SHORTS ERROR]:', err);
  process.exit(1);
});
