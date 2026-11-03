// scripts/youtube/pipelines/generate-motivation-shorts.mjs
/**
 * VizhiTN Daily 09:45 PM IST Night Reflection & Motivation Shorts Engine (9:16 Portrait)
 * Runtime: 40 - 50 seconds.
 * Paced with calm, emotionally grounded Tamil voiceover, warm typography, and reflective audio.
 * Cross-posts to YouTube Shorts, Instagram Reels, Facebook Reels, and WhatsApp Channel.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { getOrGenerateMotivationPackage } from '../engine/live-motivation-generator.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { generateShortsThumbnailPair } from '../engine/thumbnail-shorts-engine.mjs';
import { getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';
import { shareYouTubeBroadcastToWhatsApp } from '../engine/whatsapp-youtube-sharer.mjs';
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

/**
 * Paced Edge-TTS speech synthesizer for reflective night content (measured -5% rate)
 */
async function synthesizeReflectiveSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const pyBin = getPythonBinary();
  const scriptContent = `
import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate(
        '''${cleanText.replace(/'/g, "\\'")}''',
        voice="${voice}",
        rate="-4%",
        pitch="+0Hz"
    )
    await communicate.save(r"${outputPath}")

asyncio.run(main())
`;

  const tmpPy = path.join(dir, `_temp_tts_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);
  fs.writeFileSync(tmpPy, scriptContent, 'utf-8');

  try {
    execSync(`"${pyBin}" "${tmpPy}"`, { stdio: 'pipe', timeout: 45000 });
    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
      throw new Error('TTS output file missing or empty');
    }
    return outputPath;
  } finally {
    if (fs.existsSync(tmpPy)) {
      try { fs.unlinkSync(tmpPy); } catch {}
    }
  }
}

/**
 * Generates 9:16 Portrait Slide HTML for Motivation Short
 */
function generateMotivationSlideHtml({
  sceneIndex,
  packageData,
  brandLogoDataUri
}) {
  const { titleTa, heroQuoteTa, scene1SpokenTa, scene2SpokenTa, scene3SpokenTa, themeTa } = packageData;

  let bodyContentHtml = '';

  if (sceneIndex === 1) {
    // Scene 1: Night Opening Hook
    bodyContentHtml = `
      <div class="scene-badge">🌙 இரவு நேர சிந்தனை • NIGHT REFLECTION</div>
      <h1 class="main-hook">${titleTa}</h1>
      <div class="content-card">
        <p class="body-text">${scene1SpokenTa}</p>
      </div>
      <div class="theme-tag">📌 ${themeTa}</div>
    `;
  } else if (sceneIndex === 2) {
    // Scene 2: Core Wisdom & Hero Quote
    bodyContentHtml = `
      <div class="scene-badge">💡 மனதிற்கான வலிமை • CORE LESSON</div>
      <div class="quote-card">
        <div class="quote-mark">“</div>
        <div class="hero-quote">${heroQuoteTa}</div>
        <div class="quote-mark end">”</div>
      </div>
      <div class="content-card secondary">
        <p class="body-text">${scene2SpokenTa}</p>
      </div>
    `;
  } else {
    // Scene 3: Calming Bedtime Hope & Share Hook
    bodyContentHtml = `
      <div class="scene-badge success">✨ நாளைய விடியல் உங்களுக்கானது</div>
      <div class="content-card highlight">
        <p class="body-text large">${scene3SpokenTa}</p>
      </div>
      <div class="share-box">
        <div class="share-icon">↗️</div>
        <div class="share-text">
          இதை யாருக்காவது பகிருங்கள் (Share)...<br/>
          <strong>ஒருவேளை இந்த வார்த்தைகள் இன்று அவர்களுக்குத் தேவைப்படலாம்!</strong>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      background: radial-gradient(circle at 50% 30%, #1E293B 0%, #0F172A 60%, #020617 100%);
      font-family: 'Anek Tamil', 'Mukta Malar', sans-serif;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 100px 70px;
      position: relative;
      overflow: hidden;
    }

    /* Ambient stars/glow */
    body::before {
      content: '';
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 18px 32px;
      z-index: 10;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid #F59E0B;
    }
    .brand-name {
      font-size: 26px;
      font-weight: 900;
      color: #F8FAFC;
    }
    .time-pill {
      background: #F59E0B;
      color: #0F172A;
      font-size: 22px;
      font-weight: 900;
      padding: 8px 20px;
      border-radius: 12px;
    }

    .middle-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 36px;
      z-index: 10;
      padding: 30px 0;
    }

    .scene-badge {
      align-self: flex-start;
      background: rgba(245, 158, 11, 0.15);
      border: 2px solid #F59E0B;
      color: #F59E0B;
      font-size: 24px;
      font-weight: 900;
      padding: 10px 24px;
      border-radius: 999px;
      letter-spacing: 1px;
    }
    .scene-badge.success {
      background: rgba(13, 148, 136, 0.2);
      border-color: #0D9488;
      color: #2DD4BF;
    }

    .main-hook {
      font-size: 52px;
      font-weight: 900;
      line-height: 1.35;
      color: #F8FAFC;
      text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }

    .content-card {
      background: rgba(30, 41, 59, 0.75);
      backdrop-filter: blur(16px);
      border: 2px solid rgba(255, 255, 255, 0.12);
      border-left: 10px solid #F59E0B;
      border-radius: 24px;
      padding: 40px 44px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    }
    .content-card.secondary {
      border-left-color: #38BDF8;
    }
    .content-card.highlight {
      border-left-color: #10B981;
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .body-text {
      font-size: 38px;
      font-weight: 800;
      line-height: 1.5;
      color: #F1F5F9;
    }
    .body-text.large {
      font-size: 42px;
      line-height: 1.45;
      color: #FFFFFF;
    }

    .quote-card {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05));
      border: 3px solid #F59E0B;
      border-radius: 28px;
      padding: 36px 40px;
      position: relative;
    }
    .quote-mark {
      font-size: 70px;
      font-weight: 900;
      color: #F59E0B;
      line-height: 1;
      opacity: 0.8;
    }
    .quote-mark.end {
      text-align: right;
    }
    .hero-quote {
      font-size: 48px;
      font-weight: 900;
      color: #FEF3C7;
      line-height: 1.35;
      text-align: center;
      padding: 10px 0;
    }

    .theme-tag {
      font-size: 26px;
      font-weight: 800;
      color: #94A3B8;
    }

    .share-box {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #1E293B;
      border: 2px solid #334155;
      border-radius: 20px;
      padding: 24px 32px;
    }
    .share-icon {
      font-size: 48px;
      background: #334155;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .share-text {
      font-size: 26px;
      line-height: 1.4;
      color: #CBD5E1;
    }
    .share-text strong {
      color: #38BDF8;
    }

    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.85);
      border-radius: 16px;
      padding: 16px 28px;
      z-index: 10;
      font-size: 22px;
      font-weight: 800;
      color: #94A3B8;
    }
    .footer-highlight {
      color: #F59E0B;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-group">
      ${brandLogoDataUri ? `<img class="brand-logo" src="${brandLogoDataUri}" alt="Logo" />` : ''}
      <span class="brand-name">VizhiTN • நிஜத்தின் குரல்</span>
    </div>
    <div class="time-pill">9:45 PM NIGHT FUEL</div>
  </div>

  <div class="middle-body">
    ${bodyContentHtml}
  </div>

  <div class="footer-bar">
    <span>📌 தூங்கும் முன் ஒரு நேர்மறை சிந்தனை</span>
    <span class="footer-highlight">#VizhiTN #Motivation</span>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN 09:45 PM Night Reflection Motivation Shorts');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const targetDate = args.find(a => a.startsWith('--date='))?.split('=')[1] || getTodayIst();

  // Deduplication Guard
  if (!args.includes('--force') && !isDryRun) {
    const status = await isBroadcastCompletedToday('motivation-shorts', targetDate);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] Motivation Short already published today (${status.existingRecord?.youtube_video_id || 'logged'}). Exiting safely.`);
      process.exit(0);
    }
  }

  // 1. Get or generate daily motivation package
  const pkg = await getOrGenerateMotivationPackage(targetDate);
  console.log(`[PACKAGE LOADED ✓] "${pkg.titleTa}" (${pkg.themeTa})`);

  const runId = Date.now();
  const sessionDir = path.resolve(`scripts/youtube/assets/motivation_${runId}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  // 2. Synthesize Audio for the 3 scenes
  console.log('[TTS] Synthesizing Scene 1 audio...');
  const s1AudioPath = path.join(sessionDir, 's1_audio.mp3');
  await synthesizeReflectiveSpeech(pkg.scene1SpokenTa, s1AudioPath);
  const s1Dur = getAudioDuration(s1AudioPath);

  console.log('[TTS] Synthesizing Scene 2 audio...');
  const s2AudioPath = path.join(sessionDir, 's2_audio.mp3');
  await synthesizeReflectiveSpeech(pkg.scene2SpokenTa, s2AudioPath);
  const s2Dur = getAudioDuration(s2AudioPath);

  console.log('[TTS] Synthesizing Scene 3 audio...');
  const s3AudioPath = path.join(sessionDir, 's3_audio.mp3');
  await synthesizeReflectiveSpeech(pkg.scene3SpokenTa, s3AudioPath);
  const s3Dur = getAudioDuration(s3AudioPath);

  console.log(`[AUDIO STATS] S1: ${s1Dur.toFixed(1)}s, S2: ${s2Dur.toFixed(1)}s, S3: ${s3Dur.toFixed(1)}s | Total: ${(s1Dur + s2Dur + s3Dur).toFixed(1)}s`);

  // 3. Render HTML frames
  console.log('[RENDER] Rendering Scene 1 Frame...');
  const s1Html = generateMotivationSlideHtml({ sceneIndex: 1, packageData: pkg, brandLogoDataUri });
  const s1ImgPath = path.join(sessionDir, 's1_frame.png');
  renderHtmlToImage(s1Html, s1ImgPath, { width: 1080, height: 1920 });

  console.log('[RENDER] Rendering Scene 2 Frame...');
  const s2Html = generateMotivationSlideHtml({ sceneIndex: 2, packageData: pkg, brandLogoDataUri });
  const s2ImgPath = path.join(sessionDir, 's2_frame.png');
  renderHtmlToImage(s2Html, s2ImgPath, { width: 1080, height: 1920 });

  console.log('[RENDER] Rendering Scene 3 Frame...');
  const s3Html = generateMotivationSlideHtml({ sceneIndex: 3, packageData: pkg, brandLogoDataUri });
  const s3ImgPath = path.join(sessionDir, 's3_frame.png');
  renderHtmlToImage(s3Html, s3ImgPath, { width: 1080, height: 1920 });

  // 4. Assemble Multi-Scene 9:16 Video with Ken Burns Motion
  console.log('[COMPOSER] Assembling 9:16 Motivation Short Video...');
  const scenes = [
    { slidePath: s1ImgPath, audioPath: s1AudioPath, durationSec: s1Dur },
    { slidePath: s2ImgPath, audioPath: s2AudioPath, durationSec: s2Dur },
    { slidePath: s3ImgPath, audioPath: s3AudioPath, durationSec: s3Dur }
  ];

  const finalVideoPath = path.join(sessionDir, `Motivation_${targetDate}.mp4`);
  assembleMultiSceneShortsVideo({
    scenes,
    outputPath: finalVideoPath,
    categorySlug: 'general'
  });

  console.log(`[VIDEO ASSEMBLED ✓] Output: ${finalVideoPath}`);

  // 5. Generate 9:16 Thumbnail
  const thumbBase = `thumb_motivation_${runId}`;
  let thumbPath = s1ImgPath;
  try {
    const pair = await generateShortsThumbnailPair({
      titleTa: pkg.titleTa.slice(0, 35),
      category: 'நம்பிக்கை',
      heroImageUrl: s1ImgPath,
      outputDir: sessionDir,
      baseName: thumbBase
    });
    thumbPath = pair.variantA;
  } catch (tErr) {
    console.warn('[THUMBNAIL WARN]', tErr.message);
  }

  // 6. Build Title & Description
  const videoTitle = `${pkg.titleTa.slice(0, 75)} | Night Reflection #Shorts`;
  const videoDescription = `${pkg.titleTa}
${pkg.themeTa} — இரவில் உங்கள் மனதிற்கான ஒரு நேர்மறை சிந்தனை.

“${pkg.heroQuoteTa}”

🌙 இன்றைய சோர்வு நாளைக்கான வெற்றியாக மாறட்டும்.
நம்பிக்கையோடு உறங்குங்கள். நாளைய விடியல் உங்களுக்கானது!

📌 இந்த வார்த்தைகள் யாருக்காவது தேவைப்படலாம் என்று நினைத்தால், மறக்காமல் அவர்களுக்குப் பகிருங்கள் (Share ↗️)

#TamilMotivation #MotivationTamil #TNPSC #NightThoughts #LifeLessons #SelfDiscipline #PositiveVibes #VizhiTN #Shorts`;

  const tags = [
    'Tamil Motivation', 'Night Reflection Tamil', 'TNPSC Motivation',
    'Life Lessons Tamil', 'Self Discipline', 'Positive Thinking Tamil',
    'Student Motivation Tamil', 'Parents Sacrifice', 'VizhiTN Shorts', 'VizhiTN'
  ];

  const pinnedComment = `🌙 இன்றைக்கு நீங்கள் உங்கள் லட்சியத்தை நோக்கி ஒரு சிறிய அடி எடுத்து வைத்தீர்களா?
உங்கள் எண்ணத்தை கீழே கமெண்டில் சொல்லுங்கள்! 👇

📌 தூங்கும் முன் இந்த நேர்மறை சிந்தனையை உங்கள் நண்பர்களுக்கும் பகிருங்கள் ↗️
நாளைய விடியல் உங்களுக்கானது! வெற்றி நமதே! 🔥`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${finalVideoPath}`);
    console.log('\n[PINNED COMMENT PREVIEW]:\n' + pinnedComment);

    // Dry-run preview for WhatsApp Channel
    await shareYouTubeBroadcastToWhatsApp({
      videoId: 'DRY_RUN_ID',
      videoUrl: 'https://youtube.com/shorts/DRY_RUN_ID',
      title: videoTitle,
      description: videoDescription,
      isShort: true,
      dryRun: true
    });

    // Dry-run preview for Instagram Reels & Facebook
    await crossPostVideoToMetaSocials({
      videoFilePath: finalVideoPath,
      thumbnailFilePath: thumbPath,
      title: videoTitle,
      caption: videoDescription,
      isReel: true,
      isDryRun: true
    });

    console.log('[SUCCESS ✓] Motivation Short pipeline verified successfully.');
    return;
  }

  // 7. Upload to YouTube
  console.log('[UPLOAD] Uploading Motivation Short to YouTube...');
  let uploadResult = null;
  try {
    uploadResult = await uploadToYouTube({
      videoPath: finalVideoPath,
      title: videoTitle,
      description: videoDescription,
      tags,
      categoryId: '27' // Education
    });
  } catch (ytErr) {
    console.warn('[YOUTUBE UPLOAD WARN]', ytErr.message);
  }

  const liveVideoId = uploadResult?.videoId || uploadResult?.id;
  const liveVideoUrl = uploadResult?.videoUrl || (liveVideoId ? `https://youtu.be/${liveVideoId}` : 'https://youtube.com/@VizhiTn');

  if (liveVideoId) {
    console.log(`[UPLOAD SUCCESS ✓] Published: ${liveVideoUrl}`);

    if (fs.existsSync(thumbPath)) {
      try {
        await setYouTubeThumbnail(liveVideoId, thumbPath);
      } catch (_) {}
    }

    try {
      await postPinnedComment(liveVideoId, pinnedComment);
      console.log('[PINNED COMMENT ✓] Posted reflection encouragement comment.');
    } catch (_) {}

    await recordBroadcastSuccess({
      format: 'motivation-shorts',
      youtubeVideoId: liveVideoId,
      title: pkg.titleTa,
      metadata: {
        pillarId: pkg.pillarId,
        date: targetDate
      }
    });

    // Cross-Post 1: WhatsApp Channel
    try {
      await shareYouTubeBroadcastToWhatsApp({
        videoId: liveVideoId,
        videoUrl: liveVideoUrl,
        title: videoTitle,
        description: videoDescription,
        isShort: true
      });
    } catch (waErr) {
      console.warn('[WHATSAPP SHARE WARN]', waErr.message);
    }

    // Cross-Post 2: Meta Socials (Instagram Reels & Facebook Video)
    try {
      await crossPostVideoToMetaSocials({
        videoFilePath: finalVideoPath,
        thumbnailFilePath: thumbPath,
        title: videoTitle,
        caption: videoDescription,
        isReel: true,
        isDryRun: false
      });
    } catch (metaErr) {
      console.warn('[META SOCIALS WARN]', metaErr.message);
    }
  }
}

main().catch(err => {
  console.error('[FATAL MOTIVATION SHORTS ERROR]:', err);
  process.exit(1);
});

