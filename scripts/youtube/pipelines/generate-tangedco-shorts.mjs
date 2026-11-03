// scripts/youtube/pipelines/generate-tangedco-shorts.mjs
/**
 * VizhiTN Daily TANGEDCO Power Cut & School Holiday Shorts Engine (9:16 Portrait)
 * Paced at +10% speed with hyper-local area listings, official departmental helplines (1912),
 * and a high-velocity crowd-sourced comment call-to-action ("Comment below if your area is missed").
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getOrGenerateTangedcoPayload } from '../engine/live-tangedco-generator.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
import { generateShortsThumbnailPair } from '../engine/thumbnail-shorts-engine.mjs';
import { getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';

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

async function synthesizeHighSpeedSpeech(text, outputPath, voice = 'ta-IN-PallaviNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const rawGeminiAudio = path.join(dir, `raw_gemini_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp3`);
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      await synthesizeGeminiSpeech(cleanText, rawGeminiAudio, { voice: 'kavitha' });
      if (fs.existsSync(rawGeminiAudio) && fs.statSync(rawGeminiAudio).size > 1000) {
        // Accelerate audio to +10% speed using FFmpeg
        const speedCmd = `ffmpeg -y -i "${rawGeminiAudio}" -filter:a "atempo=1.10" -vn "${outputPath}"`;
        execSync(speedCmd, { stdio: 'pipe', timeout: 30000 });
        try { fs.unlinkSync(rawGeminiAudio); } catch (_) {}
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
          return outputPath;
        }
      }
    } catch (_) {
      try { if (fs.existsSync(rawGeminiAudio)) fs.unlinkSync(rawGeminiAudio); } catch (_) {}
    }
  }

  // Fallback to Edge-TTS (+10%)
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+10%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 30000, windowsHide: true });
    return outputPath;
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }
}

/**
 * Renders Warm Light Studio 9:16 Slide (1080x1920) for TANGEDCO / Holiday Short
 */
function generateTangedcoSlideHtml({
  payload,
  sceneIndex,
  brandLogoDataUri
}) {
  const clockCrayon = getStickmanAssetDataUri('clock-crayon.png');
  const targetCrayon = getStickmanAssetDataUri('target-crayon.png');
  const checkCrayon = getStickmanAssetDataUri('check-crayon.png');

  const isHoliday = (payload.type === 'school_holiday');
  const isRailway = (payload.type === 'railway_block');

  const themePrimary = isHoliday ? '#DC2626' : isRailway ? '#2563EB' : '#D97706';
  const themeBgBadge = isHoliday ? '#FEE2E2' : isRailway ? '#DBEAFE' : '#FEF3C7';
  const themeTextBadge = isHoliday ? '#991B1B' : isRailway ? '#1E40AF' : '#B45309';
  const badgeIcon = isHoliday ? '🌧️' : isRailway ? '🚆' : '⚡';
  const badgeLabel = isHoliday ? 'கனமழை & விடுமுறை எச்சரிக்கை' : isRailway ? 'ரயில்வே சேவை மாற்றம்' : 'TANGEDCO மின்வாரிய அறிவிப்பு';

  let bodyContent = '';

  if (sceneIndex === 1) {
    // Scene 1: Hook & Timing
    bodyContent = `
      <div class="hero-block">
        <div class="cat-pill">${badgeIcon} ${badgeLabel}</div>
        <div class="main-headline">${payload.titleTa}</div>
        <div class="timing-badge">
          ${clockCrayon ? `<img class="icon-inline" src="${clockCrayon}" alt="Clock" />` : ''}
          <span>நேரம்: ${payload.timing || 'காலை 9:00 AM முதல் மதியம் 2:00 PM'}</span>
        </div>
      </div>
      <div class="info-card">
        <div class="info-tag">அறிவிப்பு விபரம்</div>
        <div class="info-text">${payload.spokenHookTa}</div>
      </div>
    `;
  } else if (sceneIndex === 2) {
    // Scene 2: Districts & Key Areas Grid
    const cardsHtml = payload.areasList.map((item, idx) => `
      <div class="area-item">
        <div class="item-header">
          <div class="dist-badge">${item.district || item.circle || 'பகுதி'}</div>
          <div class="timing-sub">${item.timing || payload.timing || '9 AM - 2 PM'}</div>
        </div>
        <div class="area-streets">${item.areas || item.status || item.circle || ''}</div>
        <div class="item-footer">✓ ${item.authority || 'அதிகாரப்பூர்வ மின்வாரிய பட்டியல்'}</div>
      </div>
    `).join('');

    bodyContent = `
      <div class="sub-header-block">
        <div class="sub-pill">${badgeIcon} பாதிக்கப்பட்ட பகுதிகள் பட்டியல்</div>
        <div class="sub-title-text">இன்று மின்தடை செய்யப்படும் முக்கிய இடங்கள்:</div>
      </div>
      <div class="areas-grid">
        ${cardsHtml}
      </div>
    `;
  } else {
    // Scene 3: Viral Comment Challenge & Official Helplines
    bodyContent = `
      <div class="comment-callout">
        <div class="callout-badge">👇 விடுபட்ட பகுதிகள்</div>
        <div class="callout-title">இதில் உங்கள் பகுதி வரவில்லையா?</div>
        <div class="callout-prompt">உடனே உங்கள் மாவட்டம் மற்றும் பகுதியை கீழே <b>Comment</b> பண்ணுங்க!</div>
        <div class="callout-sub">உங்கள் ஊரில் மின்தடை உள்ளதா என மற்ற பொதுமக்களும் உடனே பார்த்து தெரிந்து கொள்ளட்டும்!</div>
      </div>

      <div class="helpline-box">
        <div class="help-header">அவசர உதவி & புகார்களுக்கு:</div>
        <div class="help-number">${payload.helpline || 'TANGEDCO மின்னகம்: 1912'}</div>
        <div class="help-desc">24 மணி நேரமும் செயல்படும் அரசு கட்டுப்பாட்டு அறை</div>
      </div>

      <div class="portal-cta">
        <div class="portal-link">முழு பட்டியல்: <b>vizhitn.in</b></div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #FAF8F5;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 60px 100px 60px;
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #E2DED7;
      padding-bottom: 24px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 60px;
      height: 60px;
      border-radius: 14px;
    }
    .brand-name {
      font-size: 32px;
      font-weight: 900;
      color: #1E293B;
    }
    .date-pill {
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      padding: 8px 24px;
      border-radius: 9999px;
      font-size: 22px;
      font-weight: 800;
      color: #475569;
    }
    .content-area {
      display: flex;
      flex-direction: column;
      gap: 36px;
      margin: auto 0;
    }
    .cat-pill {
      background: ${themeBgBadge};
      color: ${themeTextBadge};
      font-size: 24px;
      font-weight: 900;
      padding: 10px 28px;
      border-radius: 9999px;
      border: 2px solid ${themePrimary};
      width: fit-content;
      margin-bottom: 20px;
    }
    .main-headline {
      font-size: 54px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.25;
      margin-bottom: 24px;
    }
    .timing-badge {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #FFFFFF;
      border: 2px solid ${themePrimary};
      padding: 16px 28px;
      border-radius: 18px;
      font-size: 28px;
      font-weight: 800;
      color: ${themePrimary};
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      width: fit-content;
    }
    .icon-inline {
      width: 40px;
      height: 40px;
    }
    .info-card {
      background: #FFFFFF;
      border: 2px solid #E2DED7;
      border-radius: 24px;
      padding: 36px 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    }
    .info-tag {
      font-size: 22px;
      font-weight: 800;
      color: #64748B;
      margin-bottom: 12px;
    }
    .info-text {
      font-size: 34px;
      font-weight: 800;
      color: #1E293B;
      line-height: 1.45;
    }
    .sub-header-block {
      margin-bottom: 8px;
    }
    .sub-pill {
      background: ${themeBgBadge};
      color: ${themeTextBadge};
      font-size: 22px;
      font-weight: 800;
      padding: 8px 24px;
      border-radius: 9999px;
      width: fit-content;
      margin-bottom: 12px;
    }
    .sub-title-text {
      font-size: 38px;
      font-weight: 900;
      color: #0F172A;
    }
    .areas-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .area-item {
      background: #FFFFFF;
      border: 2px solid #E2DED7;
      border-radius: 20px;
      padding: 24px 32px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.03);
    }
    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .dist-badge {
      background: #F1F5F9;
      color: #0F172A;
      font-size: 26px;
      font-weight: 900;
      padding: 4px 18px;
      border-radius: 10px;
      border: 1.5px solid #CBD5E1;
    }
    .timing-sub {
      font-size: 22px;
      font-weight: 800;
      color: ${themePrimary};
    }
    .area-streets {
      font-size: 28px;
      font-weight: 800;
      color: #334155;
      line-height: 1.35;
      margin-bottom: 8px;
    }
    .item-footer {
      font-size: 20px;
      font-weight: 700;
      color: #10B981;
    }
    .comment-callout {
      background: #FFFBEB;
      border: 3px solid #F59E0B;
      border-radius: 28px;
      padding: 40px 36px;
      text-align: center;
      box-shadow: 0 12px 36px rgba(245, 158, 11, 0.15);
    }
    .callout-badge {
      background: #F59E0B;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 900;
      padding: 6px 24px;
      border-radius: 9999px;
      margin: 0 auto 16px auto;
      width: fit-content;
    }
    .callout-title {
      font-size: 42px;
      font-weight: 900;
      color: #92400E;
      margin-bottom: 16px;
    }
    .callout-prompt {
      font-size: 32px;
      font-weight: 800;
      color: #1E293B;
      line-height: 1.4;
      margin-bottom: 12px;
    }
    .callout-sub {
      font-size: 24px;
      font-weight: 700;
      color: #64748B;
    }
    .helpline-box {
      background: #FFFFFF;
      border: 2px solid #E2DED7;
      border-radius: 24px;
      padding: 30px 36px;
      text-align: center;
    }
    .help-header {
      font-size: 22px;
      font-weight: 800;
      color: #64748B;
      margin-bottom: 8px;
    }
    .help-number {
      font-size: 38px;
      font-weight: 900;
      color: ${themePrimary};
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .help-desc {
      font-size: 20px;
      font-weight: 700;
      color: #10B981;
    }
    .portal-cta {
      text-align: center;
    }
    .portal-link {
      font-size: 26px;
      font-weight: 800;
      color: #64748B;
    }
    .footer-bar {
      border-top: 2px solid #E2DED7;
      padding-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 22px;
      font-weight: 700;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-wrap">
      ${brandLogoDataUri ? `<img class="brand-logo" src="${brandLogoDataUri}" alt="Logo" />` : ''}
      <div class="brand-name">VizhiTN • விழி செய்திகள்</div>
    </div>
    <div class="date-pill">${payload.date || 'இன்றைய நிலவரம்'}</div>
  </div>

  <div class="content-area">
    ${bodyContent}
  </div>

  <div class="footer-bar">
    <div>உடனடி செய்திகளுக்கு VizhiTN-ஐ Follow பண்ணிக்கோங்க</div>
    <div>🔔 Subscribe</div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN TANGEDCO & Emergency Utility Shorts Engine');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();
  const todayIst = getTodayIst();

  // Deduplication Guard: Never upload duplicate utility short for today
  if (!process.argv.includes('--force') && !isDryRun) {
    const status = await isBroadcastCompletedToday('tangedco-shorts', todayIst);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] TANGEDCO / Holiday Short already published today (${status.existingRecord?.youtube_video_id || 'logged'}). Exiting safely.`);
      process.exit(0);
    }
  }

  // 1. Get or generate live utility payload
  const payload = await getOrGenerateTangedcoPayload(todayIst);
  console.log(`[PAYLOAD] Ready to broadcast: "${payload.titleTa}" (${payload.type})`);

  const runId = Date.now();
  const renderDir = path.join(path.resolve('scripts/youtube/assets'), `tangedco_${runId}`);
  fs.mkdirSync(renderDir, { recursive: true });

  // 2. Synthesize Audio for the 3 scenes (+10% pacing)
  console.log('[TTS] Synthesizing Scene 1 (Hook & Timing)...');
  const s1AudioPath = path.join(renderDir, `s1_audio_${runId}.mp3`);
  await synthesizeHighSpeedSpeech(payload.spokenHookTa, s1AudioPath);
  const s1Dur = getAudioDuration(s1AudioPath);

  console.log('[TTS] Synthesizing Scene 2 (Areas Breakdown)...');
  const s2AudioPath = path.join(renderDir, `s2_audio_${runId}.mp3`);
  await synthesizeHighSpeedSpeech(payload.spokenListTa, s2AudioPath);
  const s2Dur = getAudioDuration(s2AudioPath);

  console.log('[TTS] Synthesizing Scene 3 (Comment Challenge & Helplines)...');
  const s3AudioPath = path.join(renderDir, `s3_audio_${runId}.mp3`);
  await synthesizeHighSpeedSpeech(payload.spokenCommentCtaTa, s3AudioPath);
  const s3Dur = getAudioDuration(s3AudioPath);

  console.log(`[AUDIO STATS] S1: ${s1Dur.toFixed(1)}s, S2: ${s2Dur.toFixed(1)}s, S3: ${s3Dur.toFixed(1)}s | Total: ${(s1Dur + s2Dur + s3Dur).toFixed(1)}s`);

  // 3. Render HTML frames for each scene
  console.log('[RENDER] Rendering Scene 1 Frame...');
  const s1Html = generateTangedcoSlideHtml({ payload, sceneIndex: 1, brandLogoDataUri });
  const s1ImgPath = path.join(renderDir, `s1_frame_${runId}.png`);
  renderHtmlToImage(s1Html, s1ImgPath, { width: 1080, height: 1920 });

  console.log('[RENDER] Rendering Scene 2 Frame...');
  const s2Html = generateTangedcoSlideHtml({ payload, sceneIndex: 2, brandLogoDataUri });
  const s2ImgPath = path.join(renderDir, `s2_frame_${runId}.png`);
  renderHtmlToImage(s2Html, s2ImgPath, { width: 1080, height: 1920 });

  console.log('[RENDER] Rendering Scene 3 Frame...');
  const s3Html = generateTangedcoSlideHtml({ payload, sceneIndex: 3, brandLogoDataUri });
  const s3ImgPath = path.join(renderDir, `s3_frame_${runId}.png`);
  renderHtmlToImage(s3Html, s3ImgPath, { width: 1080, height: 1920 });

  // 4. Assemble Multi-Scene Video with Ken Burns Motion
  console.log('[COMPOSER] Assembling Multi-Scene 9:16 Short Video...');
  const scenes = [
    { slidePath: s1ImgPath, audioPath: s1AudioPath, durationSec: s1Dur },
    { slidePath: s2ImgPath, audioPath: s2AudioPath, durationSec: s2Dur },
    { slidePath: s3ImgPath, audioPath: s3AudioPath, durationSec: s3Dur }
  ];

  const finalVideoPath = path.join(renderDir, `TANGEDCO_Alert_${todayIst}.mp4`);
  assembleMultiSceneShortsVideo({
    scenes,
    outputPath: finalVideoPath,
    categorySlug: payload.type === 'school_holiday' ? 'education' : 'electricity'
  });

  console.log(`[VIDEO ASSEMBLED ✓] Output: ${finalVideoPath}`);

  // 5. Generate 9:16 Thumbnails
  const thumbBase = `thumb_tangedco_${runId}`;
  let thumbPath = path.join(renderDir, `${thumbBase}_variantA.png`);
  try {
    const pair = await generateShortsThumbnailPair({
      titleTa: payload.titleTa.slice(0, 35),
      category: payload.type === 'school_holiday' ? 'விடுமுறை' : 'மின்தடை',
      heroImageUrl: s1ImgPath,
      outputDir: renderDir,
      baseName: thumbBase
    });
    thumbPath = pair.variantA;
  } catch (tErr) {
    console.warn('[THUMBNAIL WARN]', tErr.message);
  }

  // 6. Build Title & Description
  const videoTitle = `${payload.titleTa.slice(0, 75)} | VizhiTN #Shorts`;
  const description = `${payload.titleTa}

📍 இன்று பராமரிப்பு பணி காரணமாக மின்தடை மற்றும் பொது அறிவிப்பு விபரங்கள்.

⚡ பாதிக்கப்பட்ட முக்கிய பகுதிகள் மற்றும் நேர விபரங்கள் வீடியோவில் விரிவாக பகிரப்பட்டுள்ளன.

👇 இதில் உங்கள் பகுதி வரவில்லையா?
உங்கள் மாவட்டம் மற்றும் பகுதியை உடனே கீழே Comment பண்ணுங்க! உங்கள் ஊரில் மின்தடை உள்ளதா என மற்ற பொதுமக்களும் உடனே பார்த்து தெரிந்து கொள்ளட்டும்!

📞 அதிகாரப்பூர்வ உதவி எண்கள்:
${payload.helpline}

🔗 தமிழ்நாடு முழுவதற்குமான முழு மின்தடை அட்டவணை:
https://vizhitn.in/power-cuts-today-tamil-nadu

#TANGEDCO #PowerCut #ChennaiPowerCut #TamilNaduNews #SchoolHoliday #Coimbatore #Madurai #Minnalagam #VizhiTN #Shorts`;

  const tags = [
    'TANGEDCO', 'TNEB', 'Power Cut Today', 'Chennai Power Cut Today',
    'TANGEDCO Shutdown Timings', 'Tamil Nadu Power Cut', 'School Holiday Today',
    'Minnalagam 1912', 'Coimbatore EB', 'Madurai EB', 'Trichy Power Cut', 'VizhiTN'
  ];

  const pinnedComment = `📍 இதில் உங்கள் பகுதி விடுபட்டுள்ளதா?
உங்கள் மாவட்டம் மற்றும் பகுதியை உடனே கீழே Comment பண்ணுங்க! மற்ற பொதுமக்களும் தெரிந்து கொள்ளட்டும்!

🔗 தமிழ்நாடு முழுவதற்குமான 38 மாவட்ட முழு பட்டியல்:
https://vizhitn.in/power-cuts-today-tamil-nadu

📞 மின்சார அவசர புகார்களுக்கு மின்னகம் 24x7 உதவி எண்: 1912 | வாட்ஸ்அப்: 94987 94987`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${finalVideoPath}`);
    console.log('\n[PINNED COMMENT PREVIEW]:\n' + pinnedComment);
    console.log('[SUCCESS ✓] TANGEDCO / Holiday Short pipeline verified successfully.');
    return;
  }

  // 7. Upload to YouTube
  console.log('[UPLOAD] Uploading Short to YouTube...');
  const uploadResult = await uploadToYouTube({
    videoPath: finalVideoPath,
    title: videoTitle,
    description,
    tags,
    categoryId: '25' // News & Politics
  });

  if (uploadResult?.videoId) {
    console.log(`[UPLOAD SUCCESS ✓] Published: https://youtu.be/${uploadResult.videoId}`);

    if (fs.existsSync(thumbPath)) {
      try {
        await setYouTubeThumbnail(uploadResult.videoId, thumbPath);
      } catch (_) {}
    }

    try {
      await postPinnedComment(uploadResult.videoId, pinnedComment);
      console.log('[PINNED COMMENT ✓] Posted crowd-source invitation comment.');
    } catch (_) {}

    await recordBroadcastSuccess({
      format: 'tangedco-shorts',
      youtubeVideoId: uploadResult.videoId,
      title: payload.titleTa,
      metadata: {
        type: payload.type,
        date: todayIst
      }
    });
  }
}

main().catch(err => {
  console.error('[FATAL TANGEDCO SHORTS ERROR]:', err);
  process.exit(1);
});
