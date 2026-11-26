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
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import {
  isBroadcastCompletedToday,
  getRecentlyUsedTopicIds,
  recordBroadcastSuccess,
} from '../engine/broadcast-logger.mjs';
import { getTodayIst } from '../engine/calendar-reader.mjs';
import { fetchVerifiedJobRadar } from '../../whatsapp/engine/whatsapp-growth-fetcher.mjs';
import { recordDispatch } from '../../lib/dispatch-ledger.mjs';

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
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+10%', '--file', tempTextFile, '--write-media', outputPath];
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
  const isDryRun = process.argv.includes('--dry-run');
  const metaOnly = process.argv.includes('--meta-only');
  const skipUpload = isDryRun || process.argv.includes('--skip-upload');
  const modeArg = process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'scheme';
  const schemeArg = process.argv.find(a => a.startsWith('--scheme='))?.split('=')[1];
  const isLiveJobMode = modeArg === 'live-job';
  const formatKey = isLiveJobMode ? 'live-job-shorts' : 'scheme-shorts';
  const todayIst = getTodayIst();
  const timeIst = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });

  console.log('====================================================');
  console.log(`VizhiTN Pillar D: ${isLiveJobMode ? 'Live Verified TN Govt & Job Alert Reel' : 'Tamil Nadu Govt Welfare Scheme Reel'}`);
  console.log(`Execution Mode: ${isDryRun ? 'DRY RUN' : (metaOnly ? 'META ONLY (IG+FB)' : 'FULL (YT + META)')}`);
  console.log('====================================================');

  if (!isDryRun) {
    const check = await isBroadcastCompletedToday(formatKey, todayIst);
    if (check.published) {
      console.log(`[SKIP ✓] Format "${formatKey}" already published today (${todayIst}).`);
      return;
    }
  }

  let scheme = null;
  if (isLiveJobMode) {
    const liveJob = await fetchVerifiedJobRadar({ dedupeChannel: 'live-job-reels' });
    if (!liveJob) {
      console.log('[JOB REEL SKIP ✓] No currently open, verified TN Govt/Fresher job notification found today. Clean skip.');
      return;
    }
    scheme = {
      id: liveJob.slug,
      category: liveJob.isGovt ? 'govt-job' : 'fresher-job',
      categoryLabel: liveJob.isGovt ? 'அரசு வேலைவாய்ப்பு' : 'Fresher Job Alert',
      categoryColor: liveJob.isGovt ? '#059669' : '#2563eb',
      titleTa: `${liveJob.roleTa} — வேலைவாய்ப்பு அறிவிப்பு!`,
      benefitBadge: `${liveJob.salaryTa} | ${liveJob.vacanciesTa || 'புதிய பணியிடங்கள்'}`,
      officialDepartment: liveJob.orgTa || liveJob.sourceName || 'Verified Recruitment',
      officialPortal: liveJob.applyUrl.replace(/^https?:\/\//, '').slice(0, 60),
      helpline: '1100 / அதிகாரப்பூர்வ தளம்',
      hookTa: `${liveJob.orgTa} நிறுவனத்தில் ${liveJob.roleTa} பணிக்கு விண்ணப்பங்கள் வரவேற்கப்படுகின்றன! கடைசி தேதி: ${liveJob.lastDateTa}.`,
      eligibilityTa: `கல்வித்தகுதி: ${liveJob.qualificationTa}. சம்பளம்: ${liveJob.salaryTa}.`,
      documentsTa: 'ஆதார் அட்டை, கல்விச் சான்றிதழ்கள், பாஸ்போர்ட் அளவு புகைப்படம் மற்றும் சாதி/வருமான சான்றிதழ் (பொருந்தினால்).',
      applicationStepsTa: `${liveJob.officialPortal || liveJob.applyUrl} என்ற அதிகாரப்பூர்வ இணையதளம் வழியாக ${liveJob.lastDateTa}-க்குள் ஆன்லைனில் விண்ணப்பிக்கவும்.`,
      avoidMiddlemenWarning: `நம்பகமான அதிகாரப்பூர்வ இணையதளத்தில் மட்டுமே விண்ணப்பிக்கவும் (${liveJob.sourceName || 'Verified'}). போலி இணைப்புகளை நம்பாதீர்கள்!`,
      rawApplyUrl: liveJob.applyUrl,
      lastDateTa: liveJob.lastDateTa,
    };
  } else if (schemeArg) {
    scheme = getSchemeById(schemeArg);
  } else {
    const recentlyUsedIds = await getRecentlyUsedTopicIds(30);
    const freshSchemes = TN_SCHEMES_CATALOG.filter(s => !recentlyUsedIds.has(s.id));
    if (freshSchemes.length > 0) {
      const idx = Math.floor(Date.now() / (24 * 3600 * 1000)) % freshSchemes.length;
      scheme = freshSchemes[idx];
    } else {
      scheme = getTodayScheme();
    }
  }

  if (!scheme) {
    throw new Error(`Scheme not found for key: ${schemeArg}`);
  }

  console.log(`[SELECTED] "${scheme.titleTa}" (${scheme.id})`);
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

  const videoTitle = isLiveJobMode
    ? `${scheme.titleTa} | கடைசி தேதி: ${scheme.lastDateTa} #Shorts`
    : `${scheme.titleTa} | TN Govt Schemes #Shorts`;
  const videoDescription = isLiveJobMode
    ? `🚨 ${scheme.titleTa}\n\n🏢 நிறுவனம்: ${scheme.officialDepartment}\n🎓 தகுதி & சம்பளம்: ${scheme.benefitBadge}\n⏳ கடைசி தேதி: ${scheme.lastDateTa}\n🔗 விண்ணப்பிக்க: ${scheme.rawApplyUrl}\n\n👉 வேலை தேடும் நண்பர்களுக்கு உடனே Share பண்ணுங்க!\n\n#TNJobs #TamilNaduJobs #TNPSC #JobAlertTamil #VizhiTN #Shorts`
    : `${scheme.titleTa} - தமிழ்நாடு அரசு நலத்திட்ட வழிகாட்டி.\n\nபலன்: ${scheme.benefitBadge}\nஅதிகாரப்பூர்வ தளம்: ${scheme.officialPortal}\nஉதவி எண்: ${scheme.helpline}\n\n📌 நண்பர்கள் மற்றும் குடும்பத்தினருக்கு Share பண்ணுங்க!\n\n#TamilNaduSchemes #TNGovtSchemes #VizhiTN #Shorts #CitizenRights`;

  if (skipUpload) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Scheme / Job pipeline verified successfully.');
    return;
  }

  let ytRes = { videoId: null, videoUrl: null };
  if (!metaOnly) {
    console.log('[YOUTUBE] Uploading Short...');
    ytRes = await uploadToYouTube({
      videoFilePath: outputVideoPath,
      title: videoTitle,
      description: videoDescription,
      tags: isLiveJobMode
        ? ['Tamil Nadu Jobs', 'TN Govt Jobs 2026', 'TNPSC Notification', 'Fresher Jobs Chennai', 'Shorts']
        : ['Tamil Nadu Government Schemes', 'TN Schemes 2026', 'Magalir Urimai', 'TN Citizen Guide', 'Shorts'],
      categoryId: '27',
      privacyStatus: 'public',
      isShort: true,
      autoShareToWhatsApp: false,
    });
    console.log(`[SHORT PUBLISHED ✓] Live: ${ytRes.videoUrl}`);
  } else {
    console.log('[META-ONLY] Skipped YouTube upload to stay strictly inside daily YouTube Shorts quota.');
  }

  const metaRes = await crossPostVideoToMetaSocials({
    videoFilePath: outputVideoPath,
    thumbnailFilePath: s1Path,
    title: videoTitle,
    caption: videoDescription,
    isReel: true,
    isDryRun: false,
  });

  if (isLiveJobMode) {
    await recordDispatch('live-job-reels', scheme.id, { title: scheme.titleTa, category: scheme.category });
  }

  await recordBroadcastSuccess({
    broadcastDate: todayIst,
    format: formatKey,
    timeIst,
    title: videoTitle,
    youtubeVideoId: ytRes.videoId,
    youtubeUrl: ytRes.videoUrl,
    metaVideoId: metaRes?.fbVideoId || null,
    metaReelId: metaRes?.igReelId || null,
    metadata: { topicId: scheme.id, pillar: isLiveJobMode ? 'live-job' : 'welfare-scheme', metaOnly },
  });
}

main().catch(err => {
  console.error('[FATAL SCHEME ERROR]:', err);
  process.exit(1);
});

