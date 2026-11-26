// scripts/youtube/pipelines/generate-tamil-shortcut-shorts.mjs
/**
 * VizhiTN Pillar C: Podhu Tamil Literature & Grammar Mnemonic Reels (9:16 Portrait)
 * Fast 20-28s Samacheer Kalvi memory codes for 100-mark General Tamil section.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getTamilShortcutForRun } from '../engine/tamil-shortcut-catalog.mjs';
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

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-PallaviNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[TAMIL TTS] Gemini voice synthesis: "${cleanText.slice(0, 42)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'kavitha' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        return outputPath;
      }
    } catch (err) {
      console.warn(`[TAMIL TTS WARN] Gemini unavailable (${err.message}). Falling back to Edge-TTS...`);
    }
  }

  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');
  try {
    execFileSync(python, ['-m', 'edge_tts', '--voice', voice, '--rate=+6%', '--file', tempTextFile, '--write-media', outputPath], {
      stdio: 'pipe',
      timeout: 30000,
    });
  } finally {
    try { fs.unlinkSync(tempTextFile); } catch {}
  }
  return outputPath;
}

function buildTamilSlideHtml({ item, mode, brandLogoDataUri }) {
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
      background: linear-gradient(165deg, #1b0b1a 0%, #1e1b4b 55%, #0f172a 100%);
      color: #f8fafc;
      font-family: 'Noto Sans Tamil', system-ui, sans-serif;
      display: flex; flex-direction: column;
      padding: 68px 54px 120px 54px;
      position: relative; overflow: hidden;
    }
    .top-bar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 34px;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: rgba(30,27,75,0.92); border: 2px solid #4338ca;
      border-radius: 50px; padding: 10px 24px;
    }
    .brand-logo { height: 40px; border-radius: 50%; }
    .brand-name { font-size: 26px; font-weight: 800; color: #f8fafc; }
    .topic-badge {
      background: #e11d48; color: #fff;
      font-size: 24px; font-weight: 900; padding: 10px 24px; border-radius: 12px;
    }
    .hook-title {
      font-size: 50px; font-weight: 900; line-height: 1.3; color: #fde047;
      margin-bottom: 24px;
    }
    .book-chip {
      display: inline-block; align-self: flex-start;
      background: rgba(244,63,94,0.18); border: 2px solid #fb7185;
      color: #fecdd3; font-size: 25px; font-weight: 800;
      padding: 8px 22px; border-radius: 99px; margin-bottom: 32px;
    }
    .question-card {
      background: rgba(15,23,42,0.88); border: 2px solid #6366f1; border-left: 10px solid #f43f5e;
      border-radius: 26px; padding: 38px; margin-bottom: 32px;
      font-size: 38px; font-weight: 800; line-height: 1.48; color: #ffffff;
    }
    .trap-box {
      background: rgba(245, 158, 11, 0.14); border: 2px solid #f59e0b;
      border-radius: 24px; padding: 32px 36px; margin-bottom: 28px;
    }
    .trap-label { font-size: 26px; font-weight: 900; color: #fcd34d; margin-bottom: 10px; }
    .trap-text { font-size: 34px; font-weight: 700; color: #fef3c7; line-height: 1.45; }
    .mnemonic-box {
      background: rgba(16, 185, 129, 0.16); border: 3px solid #34d399;
      border-radius: 28px; padding: 38px;
      box-shadow: 0 20px 50px rgba(16,185,129,0.16);
    }
    .mnemonic-label { font-size: 28px; font-weight: 900; color: #6ee7b7; margin-bottom: 14px; }
    .mnemonic-code {
      font-size: 42px; font-weight: 900; color: #fef08a; line-height: 1.4; margin-bottom: 24px;
    }
    .breakdown-text {
      font-size: 33px; font-weight: 700; color: #f8fafc; line-height: 1.5;
    }
    .footer-bar {
      position: absolute; bottom: 0; left: 0; right: 0; height: 96px;
      background: rgba(2,6,23,0.96); border-top: 2px solid #312e81;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 54px;
    }
    .footer-cta { font-size: 26px; font-weight: 900; color: #fde047; }
    .footer-sub { font-size: 24px; font-weight: 700; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      <img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">
      <span class="brand-name">விழி தமிழ்நாடு | பொதுத்தமிழ்</span>
    </div>
    <div class="topic-badge">🔥 2-MARK CODE</div>
  </div>

  <div class="hook-title">${item.topicTa}</div>
  <div class="book-chip">📖 ${item.bookCitation}</div>

  <div class="question-card">${item.questionTa}</div>

  ${isHook ? `
    <div class="trap-box">
      <div class="trap-label">⚠️ தேர்வில் மாணவர்கள் சிக்கும் இடம்:</div>
      <div class="trap-text">${item.trapTa}</div>
    </div>
    <div class="mnemonic-box">
      <div class="mnemonic-label">💡 மறக்காத தமிழ் கோட்:</div>
      <div class="mnemonic-code">${item.mnemonicTa}</div>
    </div>
  ` : `
    <div class="mnemonic-box">
      <div class="mnemonic-label">✅ ஷார்ட்கட் கோட் & முழு விளக்கம்:</div>
      <div class="mnemonic-code">${item.mnemonicTa}</div>
      <div class="breakdown-text">${item.breakdownTa}</div>
    </div>
  `}

  <div class="footer-bar">
    <div class="footer-cta">🔖 Group 4 ரிவிஷனுக்கு Save பண்ணுங்க!</div>
    <div class="footer-sub">சமச்சீர் பொதுத்தமிழ்</div>
  </div>
</body>
</html>`;
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const metaOnly = process.argv.includes('--meta-only');
  const skipUpload = isDryRun || process.argv.includes('--skip-upload');
  const formatKey = 'tamil-shortcut';
  const todayIst = getTodayIst();
  const timeIst = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });

  console.log('====================================================');
  console.log('VizhiTN Pillar C: Samacheer Podhu Tamil Memory Reels');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : (metaOnly ? 'META ONLY (IG+FB)' : 'FULL (YT + META)')}`);
  console.log('====================================================');

  if (!isDryRun) {
    const check = await isBroadcastCompletedToday(formatKey, todayIst);
    if (check.published) {
      console.log(`[SKIP ✓] Tamil shortcut already published today (${todayIst}).`);
      return;
    }
  }

  const usedTopicIds = await getRecentlyUsedTopicIds(30);
  const item = getTamilShortcutForRun(usedTopicIds);
  console.log(`[SELECTED] ${item.id}: ${item.topicTa}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/tamil_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const brandLogoDataUri = getBrandLogoDataUri();

  const a1Path = path.join(sessionDir, 'tamil_1.mp3');
  await synthesizeSpeech(item.spokenHookTa, a1Path);
  const s1Path = path.join(sessionDir, 'tamil_1.png');
  renderHtmlToImage(buildTamilSlideHtml({ item, mode: 'hook', brandLogoDataUri }), s1Path, { width: 1080, height: 1920 });

  const a2Path = path.join(sessionDir, 'tamil_2.mp3');
  await synthesizeSpeech(item.spokenSolveTa, a2Path);
  const s2Path = path.join(sessionDir, 'tamil_2.png');
  renderHtmlToImage(buildTamilSlideHtml({ item, mode: 'solve', brandLogoDataUri }), s2Path, { width: 1080, height: 1920 });

  const scenes = [
    { imagePath: s1Path, slidePath: s1Path, audioPath: a1Path, durationSec: Math.ceil(getAudioDuration(a1Path)) + 1 },
    { imagePath: s2Path, slidePath: s2Path, audioPath: a2Path, durationSec: Math.ceil(getAudioDuration(a2Path)) + 1 },
  ];

  const outputVideoPath = path.join(sessionDir, `TNPSC_Tamil_${item.id}.mp4`);
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });

  const title = `Podhu Tamil Trick: ${item.topicTa} | TNPSC Group 4 #Shorts`;
  const caption = `📖 ${item.topicTa} (${item.bookCitation})\n\n💡 கோட்: ${item.mnemonicTa}\n📌 ${item.breakdownTa}\n\n🔖 பொதுத்தமிழ் 100/100 ரிவிஷனுக்கு Save பண்ணுங்க!\n\n${item.tags.join(' ')} #VizhiTN`;

  if (skipUpload) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${title}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Tamil Memory Shortcut Reel compiled and verified cleanly.');
    return;
  }

  let ytRes = { videoId: null, videoUrl: null };
  if (!metaOnly) {
    ytRes = await uploadToYouTube({
      videoFilePath: outputVideoPath,
      title,
      description: caption,
      tags: ['Podhu Tamil Shortcut', 'TNPSC Group 4 Tamil', 'Samacheer Kalvi', 'Tamil Ilakkanam', 'Shorts'],
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
    metadata: { topicId: item.id, pillar: 'tamil-shortcut', metaOnly },
  });
}

main().catch(err => {
  console.error('[TAMIL PIPELINE FAILED ❌]', err.message || err);
  process.exit(1);
});
