// scripts/youtube/pipelines/generate-emergency-alert.mjs
/**
 * VizhiTN Heavy Rain & Emergency Civic Alert Engine (9:16 Portrait)
 * Fast-track pipeline deployed during cyclones, severe monsoons, and school holiday breaking news.
 * Integrates Google Gemini Lifelike Voice with Edge-TTS fallback.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

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

  // 1. Google Gemini Lifelike Neural Voice (Crisp alert announcer)
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[EMERGENCY TTS] Synthesizing via Google Gemini Voice: "${cleanText.slice(0, 40)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'alert' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`[EMERGENCY TTS ✓] Gemini speech generated: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[EMERGENCY TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Falling back to Edge-TTS...`);
    }
  }

  // 2. Microsoft Edge-TTS Fallback
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+8%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 45000, windowsHide: true });
    console.log(`[EMERGENCY TTS ✓] Edge-TTS speech generated: ${path.basename(outputPath)}`);
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`TTS synthesis failed to write file: ${outputPath}`);
  }
  return outputPath;
}

function generateEmergencySlideHtml({
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
      background: radial-gradient(circle at 50% 15%, #450a0a 0%, #030712 100%);
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

    .alert-chip {
      background: #dc2626; color: #fff; font-size: 24px; font-weight: 900;
      padding: 10px 28px; border-radius: 999px;
      box-shadow: 0 0 25px rgba(220, 38, 38, 0.8);
      animation: flash 1s infinite alternate;
    }

    .header-block {
      position: absolute; top: 210px; left: 60px; right: 60px;
      z-index: 10;
    }
    .urgency-badge {
      display: inline-block;
      background: #ef4444; color: #ffffff; font-weight: 900; font-size: 28px;
      padding: 8px 24px; border-radius: 8px; margin-bottom: 18px;
    }
    .main-title {
      font-size: 54px; font-weight: 900; line-height: 1.25;
      color: #ffffff; text-shadow: 0 4px 24px rgba(0,0,0,0.8);
      margin-bottom: 14px;
    }
    .sub-title {
      font-size: 30px; font-weight: 600; color: #fca5a5; line-height: 1.4;
    }

    .content-area {
      position: absolute; top: 620px; left: 60px; right: 60px;
      bottom: 220px; display: flex; flex-direction: column; justify-content: center;
      z-index: 10;
    }

    .card {
      background: rgba(15, 23, 42, 0.95);
      border: 3px solid rgba(239, 68, 68, 0.4);
      border-radius: 28px; padding: 48px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    }
    .card-heading {
      font-size: 36px; font-weight: 900; color: #f87171;
      display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
      border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 16px;
    }
    .info-item {
      font-size: 32px; font-weight: 600; line-height: 1.6;
      color: #f1f5f9; margin-bottom: 22px;
      display: flex; align-items: flex-start; gap: 18px;
    }
    .info-item:last-child { margin-bottom: 0; }
    .bullet { font-size: 34px; line-height: 1.2; flex-shrink: 0; }

    .footer-bar {
      position: absolute; bottom: 80px; left: 60px; right: 60px;
      background: rgba(10, 15, 30, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px; padding: 22px 32px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .helpline-box { display: flex; align-items: center; gap: 14px; }
    .helpline-tag {
      background: #ef4444; color: #fff; font-size: 24px; font-weight: 900;
      padding: 6px 14px; border-radius: 6px;
    }
    .helpline-num { font-size: 26px; font-weight: 800; color: #fff; }
    .follow-text { font-size: 26px; font-weight: 800; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      <img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="alert-chip">🚨 அவசர எச்சரிக்கை</div>
  </div>

  <div class="header-block">
    <div class="urgency-badge">IMD RED ALERT</div>
    <div class="main-title">${title}</div>
    <div class="sub-title">${subTitle}</div>
  </div>

  <div class="content-area">
    ${cardHtml}
  </div>

  <div class="footer-bar">
    <div class="helpline-box">
      <span class="helpline-tag">பேரிடர் கட்டுப்பாடு</span>
      <span class="helpline-num">1070 / 1077 | GCC 1913</span>
    </div>
    <div class="follow-text">VizhiTN அவசர உதவி</div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN Heavy Rain & Emergency Civic Alert Engine');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');

  const districtsArg = process.argv.find(a => a.startsWith('--districts='))?.split('=')[1] || 'சென்னை, திருவள்ளூர், காஞ்சிபுரம், செங்கல்பட்டு';
  const alertArg = process.argv.find(a => a.startsWith('--alert='))?.split('=')[1] || 'அதிதீவிர கனமழை (Red Alert)';
  const holidayArg = process.argv.find(a => a.startsWith('--holiday='))?.split('=')[1] || 'பள்ளி கல்லூரிகளுக்கு விடுமுறை அறிவிப்பு';
  const subwaysArg = process.argv.find(a => a.startsWith('--subways='))?.split('=')[1] || 'கணேசபுரம், ரங்கராஜபுரம் சுரங்கப்பாதைகள் தற்காலிக மூடல்';

  console.log(`[ALERT CONFIG] Districts: ${districtsArg}`);
  console.log(`[ALERT CONFIG] Weather: ${alertArg} | Holiday: ${holidayArg}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/emergency_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  // Scene 1: Weather Warning & District Impact
  const s1Spoken = `அவசர எச்சரிக்கை! வானிலை ஆய்வு மையம் ${districtsArg} உள்ளிட்ட மாவட்டங்களுக்கு ${alertArg} எச்சரிக்கை விடுத்துள்ளது. பொதுமக்கள் தேவையற்ற பயணங்களை தவிர்க்குமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்.`;
  const s1AudioPath = path.join(sessionDir, 'emergency_audio_1.mp3');
  await synthesizeSpeech(s1Spoken, s1AudioPath);
  const s1Dur = getAudioDuration(s1AudioPath);

  const s1Card = `
    <div class="card">
      <div class="card-heading">🌧️ வானிலை எச்சரிக்கை விவரம்</div>
      <div class="info-item"><span class="bullet">🔴</span> பாதிப்பு மாவட்டங்கள்: ${districtsArg}</div>
      <div class="info-item"><span class="bullet">⚠️</span> எச்சரிக்கை வகை: ${alertArg}</div>
      <div class="info-item"><span class="bullet">📢</span> பொதுமக்கள் பாதுகாப்பான இடங்களில் இருக்குமாறு அறிவுறுத்தல்.</div>
    </div>
  `;
  const s1Html = generateEmergencySlideHtml({
    title: 'கனமழை அவசர எச்சரிக்கை!',
    subTitle: `${districtsArg} ஆகிய மாவட்டங்களுக்கு வானிலை மையம் ரெட் அலர்ட்`,
    cardHtml: s1Card,
    brandLogoDataUri
  });
  const s1Path = path.join(sessionDir, 'emergency_slide_1.png');
  renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

  // Scene 2: School Holiday & Subway Diversions
  const s2Spoken = `மாவட்ட ஆட்சியரின் முக்கிய அறிவிப்பு: கனமழை காரணமாக ${districtsArg} பகுதிகளில் ${holidayArg}. மேலும் ${subwaysArg}. வாகன ஓட்டிகள் மாற்றுப் பாதையைப் பயன்படுத்தவும்.`;
  const s2AudioPath = path.join(sessionDir, 'emergency_audio_2.mp3');
  await synthesizeSpeech(s2Spoken, s2AudioPath);
  const s2Dur = getAudioDuration(s2AudioPath);

  const s2Card = `
    <div class="card">
      <div class="card-heading">🏫 பள்ளி விடுமுறை & போக்குவரத்து</div>
      <div class="info-item"><span class="bullet">🏛️</span> ${holidayArg}</div>
      <div class="info-item"><span class="bullet">🚧</span> சுரங்கப்பாதைகள்: ${subwaysArg}</div>
      <div class="info-item"><span class="bullet">🚗</span> போக்குவரத்து காவல்துறை அறிவுறுத்தியுள்ள மாற்றுப்பாதையை பயன்படுத்தவும்.</div>
    </div>
  `;
  const s2Html = generateEmergencySlideHtml({
    title: 'பள்ளி கல்லூரிகளுக்கு விடுமுறை!',
    subTitle: 'மாவட்ட ஆட்சியர் உத்தரவு & போக்குவரத்து மாற்றுப்பாதை',
    cardHtml: s2Card,
    brandLogoDataUri
  });
  const s2Path = path.join(sessionDir, 'emergency_slide_2.png');
  renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

  // Scene 3: Official Helplines & Safety
  const s3Spoken = `அவசர உதவி தேவைப்படுவோர்: மாநில பேரிடர் கட்டுப்பாட்டு எண் 1070, மாவட்ட கட்டுப்பாட்டு எண் 1077, சென்னை மாநகராட்சி 1913, மற்றும் மின்தடை புகார்களுக்கு 1912-ஐ அழைக்கலாம். இந்த எச்சரிக்கையை உடனடியாக பகிருங்கள்.`;
  const s3AudioPath = path.join(sessionDir, 'emergency_audio_3.mp3');
  await synthesizeSpeech(s3Spoken, s3AudioPath);
  const s3Dur = getAudioDuration(s3AudioPath);

  const s3Card = `
    <div class="card">
      <div class="card-heading">📞 அவசர உதவி எண்கள் (24x7)</div>
      <div class="info-item"><span class="bullet">🚨</span> மாநில பேரிடர் மேலாண்மை: 1070</div>
      <div class="info-item"><span class="bullet">🏢</span> மாவட்ட ஆட்சியர் கட்டுப்பாடு: 1077</div>
      <div class="info-item"><span class="bullet">🌊</span> சென்னை மாநகராட்சி வெள்ளக் கட்டுப்பாடு: 1913</div>
      <div class="info-item"><span class="bullet">⚡</span> மின்வாரியம் (கம்பிகள் அறுந்து விழுந்தால்): 1912</div>
    </div>
  `;
  const s3Html = generateEmergencySlideHtml({
    title: 'அவசர கால கட்டுப்பாட்டு எண்கள்',
    subTitle: '24 மணி நேர உதவி மையங்கள் | உதவிக்கு உடனே அழைக்கவும்',
    cardHtml: s3Card,
    brandLogoDataUri
  });
  const s3Path = path.join(sessionDir, 'emergency_slide_3.png');
  renderHtmlToImage(s3Html, s3Path, { width: 1080, height: 1920 });

  // Assemble Video
  const scenes = [
    { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: Math.ceil(s1Dur) + 1 },
    { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: Math.ceil(s2Dur) + 1 },
    { imagePath: s3Path, slidePath: s3Path, audioPath: s3AudioPath, durationSec: Math.ceil(s3Dur) + 1 }
  ];

  const outputVideoPath = path.join(sessionDir, `Rain_Alert_${Date.now()}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Emergency Alert Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[EMERGENCY VIDEO OK] Rendered: ${outputVideoPath}`);

  const videoTitle = `🚨 கனமழை எச்சரிக்கை: ${districtsArg} பள்ளி கல்லூரிகளுக்கு விடுமுறை! #Shorts`;
  const videoDescription = `தமிழ்நாடு கனமழை அவசர அறிவிப்பு (${districtsArg}).\n\nவானிலை எச்சரிக்கை: ${alertArg}\n${holidayArg}\n\nஅவசர உதவி எண்கள்:\nமாநில பேரிடர்: 1070\nமாவட்ட கட்டுப்பாடு: 1077\nGCC: 1913\nமின்வாரியம்: 1912\n\n#TamilNaduRain #ChennaiRains #SchoolHoliday #RedAlert #VizhiTN #Shorts`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Emergency Alert pipeline verified successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Emergency Alert Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: ['Chennai Rains', 'Tamil Nadu Rain Alert', 'School Holiday Tamil Nadu', 'Red Alert Chennai', 'Shorts'],
    categoryId: '27',
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[EMERGENCY SHORT PUBLISHED ✓] Live: ${res.videoUrl}`);
}

main().catch(err => {
  console.error('[FATAL EMERGENCY ERROR]:', err);
  process.exit(1);
});

