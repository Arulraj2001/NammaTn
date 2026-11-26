// scripts/youtube/pipelines/generate-maths-shortcut-shorts.mjs
/**
 * VizhiTN Pillar B: 5-Second TNPSC Maths & Aptitude Shortcut Reels (9:16 Portrait)
 * High-replay split-card format: long method crossed out vs 5-second shortcut PYQ solve.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getMathsShortcutForRun } from '../engine/maths-shortcut-catalog.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import {
  isBroadcastCompletedToday,
  getRecentlyUsedTopicIds,
  recordBroadcastSuccess,
} from '../engine/broadcast-logger.mjs';
import { getTodayIst } from '../engine/calendar-reader.mjs';

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
      console.log(`[MATHS TTS] Gemini voice synthesis: "${cleanText.slice(0, 42)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'karthik' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        return outputPath;
      }
    } catch (err) {
      console.warn(`[MATHS TTS WARN] Gemini unavailable (${err.message}). Falling back to Edge-TTS...`);
    }
  }

  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');
  try {
    execFileSync(python, ['-m', 'edge_tts', '--voice', voice, '--rate=+8%', '--file', tempTextFile, '--write-media', outputPath], {
      stdio: 'pipe',
      timeout: 30000,
    });
  } finally {
    try { fs.unlinkSync(tempTextFile); } catch {}
  }
  return outputPath;
}

function buildMathsSlideHtml({ item, mode, brandLogoDataUri }) {
  const isHook = mode === 'hook';
  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px; height: 1920px;
      background: linear-gradient(170deg, #090d16 0%, #111827 55%, #0f172a 100%);
      color: #f8fafc;
      font-family: 'Noto Sans Tamil', system-ui, sans-serif;
      display: flex; flex-direction: column;
      padding: 68px 54px 120px 54px;
      position: relative; overflow: hidden;
    }
    .grid-bg {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
    }
    .top-bar {
      display: flex; justify-content: space-between; align-items: center; z-index: 2;
      margin-bottom: 34px;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: rgba(15,23,42,0.92); border: 2px solid #334155;
      border-radius: 50px; padding: 10px 24px;
    }
    .brand-logo { height: 40px; border-radius: 50%; }
    .brand-name { font-size: 26px; font-weight: 800; color: #f8fafc; }
    .topic-badge {
      background: #dc2626; color: #fff;
      font-size: 24px; font-weight: 900; padding: 10px 24px; border-radius: 12px;
      letter-spacing: 0.5px;
    }
    .hook-title {
      font-size: 52px; font-weight: 900; line-height: 1.28; color: #facc15;
      z-index: 2; margin-bottom: 24px;
    }
    .pyq-chip {
      display: inline-block; align-self: flex-start; z-index: 2;
      background: rgba(56,189,248,0.16); border: 2px solid #38bdf8;
      color: #bae6fd; font-size: 25px; font-weight: 800;
      padding: 8px 22px; border-radius: 99px; margin-bottom: 32px;
    }
    .question-card {
      background: #1e293b; border: 2px solid #475569; border-left: 10px solid #38bdf8;
      border-radius: 26px; padding: 40px; z-index: 2; margin-bottom: 32px;
      font-size: 40px; font-weight: 800; line-height: 1.48; color: #ffffff;
    }
    .bad-box {
      background: rgba(220, 38, 38, 0.14); border: 2px solid #ef4444;
      border-radius: 24px; padding: 32px 36px; z-index: 2; margin-bottom: 28px;
    }
    .box-label-red { font-size: 26px; font-weight: 900; color: #fca5a5; margin-bottom: 12px; }
    .crossed-text {
      font-size: 34px; font-weight: 700; color: #fecaca; line-height: 1.45;
      text-decoration: line-through; text-decoration-thickness: 4px; text-decoration-color: #ef4444;
    }
    .good-box {
      background: rgba(16, 185, 129, 0.16); border: 3px solid #22c55e;
      border-radius: 28px; padding: 38px; z-index: 2;
      box-shadow: 0 20px 50px rgba(34,197,94,0.18);
    }
    .box-label-green { font-size: 28px; font-weight: 900; color: #86efac; margin-bottom: 14px; }
    .formula-text {
      font-size: 44px; font-weight: 900; color: #fef08a; line-height: 1.38; margin-bottom: 24px;
    }
    .step-text {
      font-size: 38px; font-weight: 800; color: #ffffff; line-height: 1.45; margin-bottom: 26px;
    }
    .answer-pill {
      display: inline-block; background: #22c55e; color: #052e16;
      font-size: 42px; font-weight: 900; padding: 14px 36px; border-radius: 18px;
    }
    .footer-bar {
      position: absolute; bottom: 0; left: 0; right: 0; height: 96px;
      background: rgba(2,6,23,0.96); border-top: 2px solid #1e293b;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 54px; z-index: 5;
    }
    .footer-cta { font-size: 26px; font-weight: 900; color: #fbbf24; }
    .footer-sub { font-size: 24px; font-weight: 700; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="top-bar">
    <div class="brand-pill">
      <img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">
      <span class="brand-name">விழி தமிழ்நாடு | Maths</span>
    </div>
    <div class="topic-badge">⚡ 5-SEC SHORTCUT</div>
  </div>

  <div class="hook-title">${item.topicTa}</div>
  <div class="pyq-chip">📚 ${item.pyqRef}</div>

  <div class="question-card">${item.questionTa}</div>

  ${isHook ? `
    <div class="bad-box">
      <div class="box-label-red">❌ பழைய நீண்ட முறை (தவிர்க்கவும்):</div>
      <div class="crossed-text">${item.longMethodTa}</div>
    </div>
    <div class="good-box">
      <div class="box-label-green">⏱️ 5-விநாடி ஷார்ட்கட் ஃபார்முலா:</div>
      <div class="formula-text">${item.shortcutFormulaTa}</div>
    </div>
  ` : `
    <div class="good-box">
      <div class="box-label-green">✅ 5-விநாடி ஷார்ட்கட் & விடை:</div>
      <div class="formula-text">${item.shortcutFormulaTa}</div>
      <div class="step-text">➡️ ${item.solvedStepTa}</div>
      <div class="answer-pill">விடை: ${item.answerTa}</div>
    </div>
  `}

  <div class="footer-bar">
    <div class="footer-cta">📌 Save செய்து ரிவிஷன் பண்ணுங்க!</div>
    <div class="footer-sub">TNPSC Group 4 &amp; 2 PYQ</div>
  </div>
</body>
</html>`;
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const metaOnly = process.argv.includes('--meta-only');
  const skipUpload = isDryRun || process.argv.includes('--skip-upload');
  const formatKey = 'maths-shortcut';
  const todayIst = getTodayIst();
  const timeIst = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });

  console.log('====================================================');
  console.log('VizhiTN Pillar B: 5-Second Maths Shortcut Reels Engine');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : (metaOnly ? 'META ONLY (IG+FB)' : 'FULL (YT + META)')}`);
  console.log('====================================================');

  if (!isDryRun) {
    const check = await isBroadcastCompletedToday(formatKey, todayIst);
    if (check.published) {
      console.log(`[SKIP ✓] Maths shortcut already published today (${todayIst}).`);
      return;
    }
  }

  const usedTopicIds = await getRecentlyUsedTopicIds(30);
  const item = getMathsShortcutForRun(usedTopicIds);
  console.log(`[SELECTED] ${item.id}: ${item.topicTa}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/maths_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const brandLogoDataUri = getBrandLogoDataUri();

  const a1Path = path.join(sessionDir, 'maths_1.mp3');
  await synthesizeSpeech(item.spokenHookTa, a1Path);
  const s1Path = path.join(sessionDir, 'maths_1.png');
  renderHtmlToImage(buildMathsSlideHtml({ item, mode: 'hook', brandLogoDataUri }), s1Path, { width: 1080, height: 1920 });

  const a2Path = path.join(sessionDir, 'maths_2.mp3');
  await synthesizeSpeech(item.spokenSolveTa, a2Path);
  const s2Path = path.join(sessionDir, 'maths_2.png');
  renderHtmlToImage(buildMathsSlideHtml({ item, mode: 'solve', brandLogoDataUri }), s2Path, { width: 1080, height: 1920 });

  const scenes = [
    { imagePath: s1Path, slidePath: s1Path, audioPath: a1Path, durationSec: Math.ceil(getAudioDuration(a1Path)) + 1 },
    { imagePath: s2Path, slidePath: s2Path, audioPath: a2Path, durationSec: Math.ceil(getAudioDuration(a2Path)) + 1 },
  ];

  const outputVideoPath = path.join(sessionDir, `TNPSC_Maths_${item.id}.mp4`);
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });

  const title = `5-Sec Maths Trick: ${item.topicTa} | TNPSC Group 4 #Shorts`;
  const caption = `⚡ ${item.topicTa} (${item.pyqRef})\n\n❓ ${item.questionTa}\n✅ Shortcut: ${item.shortcutFormulaTa}\n🎯 விடை: ${item.answerTa}\n\n📌 Exam Revision-க்கு உடனே Save பண்ணி வச்சுக்கோங்க!\n\n${item.tags.join(' ')} #VizhiTN`;

  if (skipUpload) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${title}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Maths Shortcut Reel compiled and verified cleanly.');
    return;
  }

  let ytRes = { videoId: null, videoUrl: null };
  if (!metaOnly) {
    ytRes = await uploadToYouTube({
      videoFilePath: outputVideoPath,
      title,
      description: caption,
      tags: ['TNPSC Maths Shortcut', 'Aptitude Tricks Tamil', 'TNPSC Group 4', 'Samacheer Maths', 'Shorts'],
      categoryId: '27',
      privacyStatus: 'public',
      isShort: true,
      autoShareToWhatsApp: false,
    });
    console.log(`[YOUTUBE PUBLISHED ✓] ${ytRes.videoUrl}`);
  } else {
    console.log('[META-ONLY] Skipped YouTube upload to preserve daily YouTube quota & feed cleanliness.');
  }

  const metaRes = await crossPostVideoToMetaSocials({
    videoFilePath: outputVideoPath,
    thumbnailFilePath: s2Path,
    title,
    caption,
    isReel: true,
    isDryRun: false,
  });

  await recordBroadcastSuccess({
    broadcastDate: todayIst,
    format: formatKey,
    timeIst,
    title,
    youtubeVideoId: ytRes.videoId,
    youtubeUrl: ytRes.videoUrl,
    metaVideoId: metaRes?.fbVideoId || null,
    metaReelId: metaRes?.igReelId || null,
    metadata: { topicId: item.id, pillar: 'maths-shortcut', metaOnly },
  });
}

main().catch(err => {
  console.error('[MATHS PIPELINE FAILED ❌]', err.message || err);
  process.exit(1);
});
