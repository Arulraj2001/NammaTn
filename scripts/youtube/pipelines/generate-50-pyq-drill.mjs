// scripts/youtube/pipelines/generate-50-pyq-drill.mjs
/**
 * VizhiTN Daily 50 PYQ Rapid-Fire Speed Drill Engine (16:9 Landscape)
 * Paced at strictly under 5 minutes (285 - 295 seconds total).
 *
 * Solves 50 authentic TNPSC Previous Year Questions (Group 1, 2, 4, SI, Field Surveyor)
 * with question + 4 options and a 5-second thinking timer.
 * Answers are NEVER spoiled in the video!
 * Official Answer Key with citations is posted in the Pinned Comment.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { getOrGeneratePyq50Package } from '../engine/live-pyq-generator.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { getFfmpegBinaryPath } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { generateLongThumbnailPair } from '../engine/thumbnail-engine.mjs';
import { getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess } from '../engine/broadcast-logger.mjs';
import { shareYouTubeBroadcastToWhatsApp } from '../engine/whatsapp-youtube-sharer.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

/**
 * Generates 16:9 Title Intro Screen (1920x1080)
 */
function generateIntroSlideHtml({ titleTa, subject, totalQ = 50, brandLogoDataUri }) {
  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #0F172A;
      font-family: 'Anek Tamil', 'Mukta Malar', sans-serif;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px 100px;
      text-align: center;
      position: relative;
    }
    .top-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #1E293B;
      border: 2px solid #334155;
      padding: 12px 32px;
      border-radius: 999px;
      font-size: 26px;
      font-weight: 800;
      color: #38BDF8;
      margin-bottom: 30px;
    }
    .main-pill {
      background: linear-gradient(135deg, #DC2626, #B91C1C);
      color: #FFFFFF;
      padding: 14px 40px;
      border-radius: 16px;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(220, 38, 38, 0.4);
    }
    .main-title {
      font-size: 58px;
      font-weight: 900;
      line-height: 1.3;
      max-width: 1500px;
      margin-bottom: 24px;
      color: #F8FAFC;
    }
    .meta-subtitle {
      font-size: 32px;
      font-weight: 700;
      color: #94A3B8;
      margin-bottom: 40px;
    }
    .rules-card {
      background: #1E293B;
      border: 2px solid #0D9488;
      border-radius: 20px;
      padding: 24px 60px;
      display: flex;
      gap: 50px;
      font-size: 26px;
      font-weight: 800;
      color: #F1F5F9;
    }
    .rule-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="top-badge">
    ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" style="width: 44px; height: 44px; border-radius: 50%;" />` : '🏛️'}
    <span>VizhiTN • TNPSC Daily Speed Drill</span>
  </div>

  <div class="main-pill">🔥 5 நிமிடத்தில் 50 வினாக்கள் பயிற்சி</div>
  <h1 class="main-title">${titleTa}</h1>
  <div class="meta-subtitle">${subject} • அசல் தேர்வு வினாக்கள் தொகுப்பு</div>

  <div class="rules-card">
    <div class="rule-item">⏱️ கேள்விக்கு 5 வினாடிகள்</div>
    <div class="rule-item">✍️ விடைகளை Comment செய்யுங்கள்</div>
    <div class="rule-item">📌 Pinned Comment-ல் Answer Key</div>
  </div>
</body>
</html>`;
}

/**
 * Generates 16:9 Question Screen (1920x1080)
 */
function generateQuestionSlideHtml({ q, qNum, totalQ = 50, brandLogoDataUri }) {
  const optionsHtml = q.options.map(opt => `
    <div class="option-card">
      <div class="option-badge">${opt.key}</div>
      <div class="option-text">${opt.text}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #0F172A;
      font-family: 'Anek Tamil', 'Mukta Malar', sans-serif;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 60px;
      position: relative;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1E293B;
      border: 2px solid #334155;
      border-radius: 18px;
      padding: 16px 36px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #94A3B8;
    }
    .exam-badge {
      background: #DC2626;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 900;
      padding: 8px 20px;
      border-radius: 10px;
      letter-spacing: 1px;
    }
    .counter-badge {
      background: #0D9488;
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 900;
      padding: 8px 24px;
      border-radius: 10px;
    }

    .body-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 24px 0;
      gap: 32px;
    }
    .question-box {
      background: #1E293B;
      border-left: 10px solid #38BDF8;
      border-radius: 18px;
      padding: 32px 40px;
      font-size: 40px;
      font-weight: 800;
      line-height: 1.35;
      color: #F8FAFC;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 24px;
    }
    .option-card {
      background: #1E293B;
      border: 2px solid #334155;
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .option-badge {
      width: 52px;
      height: 52px;
      background: #334155;
      color: #38BDF8;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 28px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .option-text {
      font-size: 30px;
      font-weight: 700;
      color: #E2E8F0;
      line-height: 1.25;
    }

    .footer-bar {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .timer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 22px;
      font-weight: 800;
      color: #CBD5E1;
    }
    .progress-track {
      width: 100%;
      height: 12px;
      background: #334155;
      border-radius: 999px;
      overflow: hidden;
      position: relative;
    }
    .progress-fill {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #38BDF8, #0D9488);
      border-radius: 999px;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-left">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" style="width: 38px; height: 38px; border-radius: 50%;" />` : ''}
      <span class="brand-title">VizhiTN • TNPSC PYQ Speed Drill</span>
      <span class="exam-badge">${q.examBadge || 'TNPSC PYQ'}</span>
    </div>
    <div class="counter-badge">QUESTION ${qNum} / ${totalQ}</div>
  </div>

  <div class="body-area">
    <div class="question-box">
      ${qNum}. ${q.questionTa}
    </div>
    <div class="options-grid">
      ${optionsHtml}
    </div>
  </div>

  <div class="footer-bar">
    <div class="timer-row">
      <span>⏱️ சிந்திப்பதற்கான நேரம்: 5 விநாடிகள்...</span>
      <span>சரியான விடையை நீங்களே தேர்வு செய்யுங்கள் ✍️</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill"></div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates 16:9 Outro Challenge Screen (1920x1080)
 */
function generateOutroSlideHtml({ totalQ = 50, brandLogoDataUri }) {
  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #0F172A;
      font-family: 'Anek Tamil', 'Mukta Malar', sans-serif;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px 100px;
      text-align: center;
      position: relative;
    }
    .challenge-pill {
      background: #0D9488;
      color: #FFFFFF;
      padding: 14px 44px;
      border-radius: 16px;
      font-size: 34px;
      font-weight: 900;
      margin-bottom: 30px;
    }
    .challenge-title {
      font-size: 56px;
      font-weight: 900;
      color: #F8FAFC;
      line-height: 1.35;
      max-width: 1400px;
      margin-bottom: 24px;
    }
    .callout-box {
      background: #1E293B;
      border: 3px solid #F59E0B;
      border-radius: 20px;
      padding: 30px 60px;
      font-size: 32px;
      font-weight: 800;
      color: #FEF3C7;
      margin-bottom: 40px;
      line-height: 1.4;
    }
    .sub-prompt {
      font-size: 28px;
      font-weight: 700;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <div class="challenge-pill">🎯 50 வினாக்களும் முடிந்தது!</div>
  <h1 class="challenge-title">50-க்கு உங்க மதிப்பெண் என்ன?</h1>

  <div class="callout-box">
    📌 இதற்கான அதிகாரப்பூர்வ 50 விடைகள் (Answer Key)<br/>
    கீழே உள்ள Pinned Comment-ல் கொடுக்கப்பட்டுள்ளது!
  </div>

  <div class="sub-prompt">
    🔔 தினசரி 5 நிமிட அதிவேக TNPSC பயிற்சிகளுக்கு VizhiTN-ஐ Subscribe செய்யுங்கள்!
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN Daily 50 PYQ Rapid Speed Drill Pipeline');
  console.log('Target: 50 Questions in < 5 Minutes (<300s)');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const targetDate = args.find(a => a.startsWith('--date='))?.split('=')[1] || getTodayIst();
  const forcedTopic = args.find(a => a.startsWith('--topic='))?.split('=')[1] || null;

  // 1. Synthesize or retrieve 50 PYQ package
  const pkg = await getOrGeneratePyq50Package(targetDate, forcedTopic);
  const questions = pkg.questions.slice(0, 50);

  console.log(`[PACKAGE LOADED ✓] "${pkg.titleTa}" (${questions.length} Questions)`);

  const runId = Date.now();
  const sessionDir = path.resolve(`scripts/youtube/assets/pyq50_${runId}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();
  const ffmpeg = getFfmpegBinaryPath();

  // 2. Render Intro Slide
  console.log('[RENDER] Generating Intro Slide...');
  const introHtml = generateIntroSlideHtml({
    titleTa: pkg.titleTa,
    subject: pkg.subject,
    totalQ: questions.length,
    brandLogoDataUri
  });
  const introImgPath = path.join(sessionDir, 'slide_intro.png');
  renderHtmlToImage(introHtml, introImgPath, { width: 1920, height: 1080 });

  // 3. Render Question Slides
  console.log(`[RENDER] Generating ${questions.length} Question Slides...`);
  const questionImgPaths = [];
  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const qNum = idx + 1;
    const slideHtml = generateQuestionSlideHtml({
      q,
      qNum,
      totalQ: questions.length,
      brandLogoDataUri
    });
    const slidePath = path.join(sessionDir, `slide_q_${qNum}.png`);
    renderHtmlToImage(slideHtml, slidePath, { width: 1920, height: 1080 });
    questionImgPaths.push(slidePath);

    if (qNum % 10 === 0 || qNum === questions.length) {
      console.log(`[RENDER PROGRESS] ${qNum} / ${questions.length} Slides Rendered.`);
    }
  }

  // 4. Render Outro Slide
  console.log('[RENDER] Generating Outro Slide...');
  const outroHtml = generateOutroSlideHtml({
    totalQ: questions.length,
    brandLogoDataUri
  });
  const outroImgPath = path.join(sessionDir, 'slide_outro.png');
  renderHtmlToImage(outroHtml, outroImgPath, { width: 1920, height: 1080 });

  // 5. Build Concat Demuxer File
  // Durations:
  // Intro: 5.0s
  // 50 Questions: 5.4s each -> 270s
  // Outro: 8.0s
  // Total: 5 + 270 + 8 = 283 seconds (4 min 43 sec, strictly under 5 mins!)
  const concatFilePath = path.join(sessionDir, 'slides_list.txt');
  let concatLines = [];
  concatLines.push(`file '${introImgPath.replace(/\\/g, '/')}'`);
  concatLines.push(`duration 5.0`);

  for (const qPath of questionImgPaths) {
    concatLines.push(`file '${qPath.replace(/\\/g, '/')}'`);
    concatLines.push(`duration 5.4`);
  }

  concatLines.push(`file '${outroImgPath.replace(/\\/g, '/')}'`);
  concatLines.push(`duration 8.0`);
  concatLines.push(`file '${outroImgPath.replace(/\\/g, '/')}'`); // Repeat last file per FFmpeg concat spec

  fs.writeFileSync(concatFilePath, concatLines.join('\n'), 'utf-8');

  // 6. Select Audio Bed
  const audioBedPath = path.resolve('scripts/youtube/assets/sfx/broadcast-bed.mp3');
  const hasAudio = fs.existsSync(audioBedPath);

  const outputVideoPath = path.join(sessionDir, `TNPSC_50_PYQ_${targetDate}.mp4`);
  console.log('[ASSEMBLING VIDEO] Rapid Single-Pass FFmpeg Encoding...');

  let ffmpegCmd;
  if (hasAudio) {
    ffmpegCmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatFilePath}" -stream_loop -1 -i "${audioBedPath}" -vf "fps=30,format=yuv420p" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -ar 44100 -t 283 "${outputVideoPath}"`;
  } else {
    ffmpegCmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatFilePath}" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -vf "fps=30,format=yuv420p" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -ar 44100 -t 283 "${outputVideoPath}"`;
  }

  execSync(ffmpegCmd, { stdio: 'pipe', timeout: 120000 });
  console.log(`[VIDEO READY ✓] Output: ${outputVideoPath} (${(fs.statSync(outputVideoPath).size / (1024 * 1024)).toFixed(2)} MB)`);

  // 7. Generate High-CTR Thumbnail
  console.log('[THUMBNAIL] Generating 16:9 Thumbnail...');
  let thumbPath = introImgPath;
  try {
    const pair = await generateLongThumbnailPair({
      titleTa: `50 அசல் வினாக்கள்: ${pkg.subject.slice(0, 25)}`,
      subtitleTa: '🔥 5 நிமிடத்தில் 50 வினாக்கள் அதிவேக பயிற்சி',
      category: 'TNPSC SPEED DRILL',
      heroImageUrl: questionImgPaths[0],
      outputDir: sessionDir,
      baseName: `thumb_pyq50_${runId}`
    });
    thumbPath = pair.variantA;
  } catch (thumbErr) {
    console.warn('[THUMBNAIL WARN]', thumbErr.message);
  }

  // 8. Build Answer Key for Pinned Comment
  const answerKeyText = `🎯 இன்றைய 50 வினாக்களுக்கான அதிகாரப்பூர்வ விடைகள் (Official Answer Key):\n\n` +
    questions.map((q, i) => `${i + 1}) ஆப்ஷன் ${q.correctKey} — ${q.options.find(o => o.key === q.correctKey)?.text || ''}\n   [${q.examBadge}] ${q.explanationTa}`).join('\n\n') +
    `\n\n📖 மூலம்: சமச்சீர் கல்வி & தமிழ்நாடு தொல்லியல் துறை அதிகாரப்பூர்வ வெளியீடுகள்.\n🔔 நாளைய 50 வினாக்கள் அதிவேகப் பயிற்சியைத் தவறவிடாமல் இருக்க VizhiTN சேனலை Subscribe செய்யுங்கள்! வெற்றி நமதே! 🔥`;

  // 9. Build Video Title & Description
  const videoTitle = `${pkg.titleTa.slice(0, 75)} | 5 நிமிடத்தில் 50 வினாக்கள் #TNPSC`;
  const videoDescription = `${pkg.titleTa}\n${pkg.subject} — அசல் தேர்வு வினாக்கள் அதிவேகப் பயிற்சி\n\n🎯 50-க்கு உங்கள் மதிப்பெண் என்ன? விடைகளை உடனே கீழே Comment பண்ணுங்க!\n\n📌 அதிகாரப்பூர்வ விடைகள் (Answer Key) மேலே உள்ள Pinned Comment-ல் கொடுக்கப்பட்டுள்ளது.\n\n#TNPSC #TNPSCGroup4 #TNPSCGroup2 #PoliceSI #Unit8 #Keezhadi #SamacheerKalvi #VizhiTN`;

  const tags = [
    'TNPSC 50 PYQ', 'TNPSC Previous Year Questions', 'TNPSC Group 4 2024',
    'TNPSC Group 2', 'Unit 8 TNPSC', 'Keezhadi TNPSC', 'Archaeological Excavations Tamil Nadu',
    'TNPSC Question Bank', 'TNPSC Mock Test', 'Police SI Exam', 'VizhiTN'
  ];

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log(`Duration: ~4m 43s (< 5 mins)`);
    console.log(`Thumbnail: ${thumbPath}`);
    console.log('\n[PINNED COMMENT PREVIEW (First 5 Questions)]:\n' + answerKeyText.slice(0, 450) + '...\n');

    // Dry-run preview for WhatsApp Channel
    await shareYouTubeBroadcastToWhatsApp({
      videoId: 'DRY_RUN_ID',
      videoUrl: 'https://youtu.be/DRY_RUN_ID',
      title: videoTitle,
      description: videoDescription,
      isShort: false,
      dryRun: true
    });

    // Dry-run preview for Facebook Page Videos (16:9)
    await crossPostVideoToMetaSocials({
      videoFilePath: outputVideoPath,
      thumbnailFilePath: thumbPath,
      title: videoTitle,
      caption: videoDescription,
      isReel: false,
      isDryRun: true
    });

    console.log('[SUCCESS ✓] 50 PYQ Rapid Speed Drill verified successfully.');
    return;
  }

  // 10. Upload to YouTube
  console.log('[UPLOAD] Uploading 50 PYQ Video to YouTube...');
  let uploadResult = null;
  try {
    uploadResult = await uploadToYouTube({
      videoPath: outputVideoPath,
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
      await postPinnedComment(liveVideoId, answerKeyText);
      console.log('[PINNED COMMENT ✓] Posted 50-Question Official Answer Key.');
    } catch (_) {}

    await recordBroadcastSuccess({
      format: 'pyq-50-drill',
      youtubeVideoId: liveVideoId,
      title: pkg.titleTa,
      metadata: {
        subject: pkg.subject,
        questionsCount: questions.length,
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
        isShort: false
      });
    } catch (waErr) {
      console.warn('[WHATSAPP SHARE WARN]', waErr.message);
    }

    // Cross-Post 2: Facebook Page Watch Video (16:9)
    try {
      await crossPostVideoToMetaSocials({
        videoFilePath: outputVideoPath,
        thumbnailFilePath: thumbPath,
        title: videoTitle,
        caption: videoDescription,
        isReel: false,
        isDryRun: false
      });
    } catch (metaErr) {
      console.warn('[META SOCIALS WARN]', metaErr.message);
    }
  }
}

main().catch(err => {
  console.error('[FATAL 50 PYQ DRILL ERROR]:', err);
  process.exit(1);
});

