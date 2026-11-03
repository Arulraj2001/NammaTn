// scripts/youtube/pipelines/generate-gk-lesson-shorts.mjs
/**
 * VizhiTN Morning High-Speed GK Masterclass Shorts Engine (9:16 Portrait)
 * Paced at +12% speed with emotional aspirant hook & evening quiz cliffhanger.
 * 100% Dynamic Sourcing via Gemini Live Intelligence (zero static hardcoding).
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getOrGenerateDailyPackage } from '../engine/live-exam-generator.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
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

async function synthesizeHighSpeedSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const rawGeminiAudio = path.join(dir, `raw_gemini_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp3`);

  // 1. Google Gemini Neural Speech + FFmpeg atempo=1.12
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[GK LESSON TTS] Synthesizing via Google Gemini Voice: "${cleanText.slice(0, 45)}..."`);
      await synthesizeGeminiSpeech(cleanText, rawGeminiAudio, { voice: 'karthik' });
      if (fs.existsSync(rawGeminiAudio) && fs.statSync(rawGeminiAudio).size > 1000) {
        // Accelerate audio to +12% speed using FFmpeg
        const speedCmd = `ffmpeg -y -i "${rawGeminiAudio}" -filter:a "atempo=1.12" -vn "${outputPath}"`;
        execSync(speedCmd, { stdio: 'pipe', timeout: 30000 });
        try { fs.unlinkSync(rawGeminiAudio); } catch (_) {}
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
          console.log(`[GK LESSON TTS ✓] High-speed Gemini speech generated: ${path.basename(outputPath)}`);
          return outputPath;
        }
      }
    } catch (geminiErr) {
      console.warn(`[GK LESSON TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Falling back to Edge-TTS (+12%)...`);
      try { if (fs.existsSync(rawGeminiAudio)) fs.unlinkSync(rawGeminiAudio); } catch (_) {}
    }
  }

  // 2. Microsoft Edge-TTS with --rate=+12%
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+12%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 30000, windowsHide: true });
    return outputPath;
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }
}

/**
 * Renders Warm Light Studio 9:16 Slide (1080x1920)
 */
function generateLessonSlideHtml({
  lesson,
  unitTag,
  sceneIndex,
  brandLogoDataUri
}) {
  const teacherCrayon = getStickmanAssetDataUri('book-study-crayon.png');
  const targetCrayon = getStickmanAssetDataUri('target-crayon.png');
  const checkCrayon = getStickmanAssetDataUri('check-crayon.png');
  const clockCrayon = getStickmanAssetDataUri('clock-crayon.png');

  let bodyContent = '';

  if (sceneIndex === 1) {
    // Scene 1: Emotional Hook + Main Topic Banner
    bodyContent = `
      <div class="emotion-card">
        <div class="emotion-badge">🔥 விடாமுயற்சி</div>
        <div class="emotion-text">"${lesson.emotionalHookTa}"</div>
      </div>

      <div class="main-topic-card">
        <div class="topic-tag">${unitTag} • அத்தியாவசிய பாடம்</div>
        <h1 class="main-title">${lesson.topicTitleTa}</h1>
      </div>

      <div class="citation-pill">
        ${checkCrayon ? `<img src="${checkCrayon}" class="icon-small" alt="Book">` : '📖'}
        <span>அங்கீகரிக்கப்பட்ட மூலம்: ${lesson.samacheerCitation}</span>
      </div>
    `;
  } else if (sceneIndex === 2) {
    // Scene 2: Core Facts 1 & 2
    bodyContent = `
      <div class="facts-container">
        <div class="fact-box">
          <div class="fact-num-badge">பாயிண்ட் 1</div>
          <div class="fact-body">${lesson.coreFactsTa[0]}</div>
        </div>

        <div class="fact-box">
          <div class="fact-num-badge">பாயிண்ட் 2</div>
          <div class="fact-body">${lesson.coreFactsTa[1]}</div>
        </div>
      </div>
    `;
  } else if (sceneIndex === 3) {
    // Scene 3: Core Facts 3 & 4
    bodyContent = `
      <div class="facts-container">
        <div class="fact-box">
          <div class="fact-num-badge">பாயிண்ட் 3</div>
          <div class="fact-body">${lesson.coreFactsTa[2] || lesson.coreFactsTa[0]}</div>
        </div>

        <div class="fact-box">
          <div class="fact-num-badge">பாயிண்ட் 4</div>
          <div class="fact-body">${lesson.coreFactsTa[3] || lesson.coreFactsTa[1]}</div>
        </div>
      </div>
    `;
  } else {
    // Scene 4: Evening Challenge Cliffhanger
    bodyContent = `
      <div class="challenge-card">
        ${clockCrayon ? `<img src="${clockCrayon}" class="challenge-clock-img" alt="Clock">` : ''}
        <div class="challenge-pill">இன்று மாலை 7:00 மணி சவால்!</div>
        <h2 class="challenge-heading">உங்களால் 5/5 எடுக்க முடியுமா?</h2>
        <p class="challenge-desc">இன்று காலை நாம் பார்த்த இந்த பாடத்திலிருந்து 5 அசல் தேர்வு வினாக்கள் இன்று மாலை 7 மணிக்கு வெளியாகும்!</p>
      </div>

      <div class="cta-subscribe-box">
        <div class="cta-bell">🔔</div>
        <div class="cta-text">இப்போதே சப்ஸ்கிரைப் செய்து பெல் பட்டனை கிளிக் செய்யவும்!</div>
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
      padding: 60px 48px;
      color: #1E293B;
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#CBD5E1 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      opacity: 0.5;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      background: #FFFFFF;
      padding: 18px 28px;
      border-radius: 20px;
      border: 2px solid #E2E8F0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo-img {
      width: 44px;
      height: 44px;
      border-radius: 10px;
    }
    .brand-title-text {
      font-size: 24px;
      font-weight: 900;
      color: #0F172A;
    }
    .unit-badge {
      background: #0D9488;
      color: #FFFFFF;
      font-size: 20px;
      font-weight: 900;
      padding: 8px 18px;
      border-radius: 10px;
    }

    .middle-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 32px;
      z-index: 10;
      flex: 1;
      padding: 20px 0;
    }

    /* Scene 1 styles */
    .emotion-card {
      background: #FEF2F2;
      border-left: 8px solid #DC2626;
      border-radius: 16px;
      padding: 24px 30px;
    }
    .emotion-badge {
      font-size: 20px;
      font-weight: 900;
      color: #DC2626;
      margin-bottom: 8px;
    }
    .emotion-text {
      font-size: 26px;
      font-weight: 800;
      color: #991B1B;
      line-height: 1.4;
    }
    .main-topic-card {
      background: #FFFFFF;
      border: 3px solid #0D9488;
      border-radius: 24px;
      padding: 36px 32px;
      box-shadow: 0 10px 30px rgba(13,148,136,0.08);
    }
    .topic-tag {
      font-size: 22px;
      font-weight: 800;
      color: #0D9488;
      margin-bottom: 12px;
    }
    .main-title {
      font-size: 44px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.3;
    }
    .citation-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FEF3C7;
      border: 2px solid #FDE68A;
      padding: 16px 24px;
      border-radius: 16px;
      font-size: 22px;
      font-weight: 800;
      color: #92400E;
    }
    .icon-small {
      width: 28px;
      height: 28px;
    }

    /* Scene 2 & 3 styles */
    .facts-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .fact-box {
      background: #FFFFFF;
      border: 2px solid #E2E8F0;
      border-radius: 20px;
      padding: 28px 32px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.03);
    }
    .fact-num-badge {
      display: inline-block;
      background: #0D9488;
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 900;
      padding: 6px 14px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .fact-body {
      font-size: 32px;
      font-weight: 800;
      color: #1E293B;
      line-height: 1.45;
    }

    /* Scene 4 Challenge styles */
    .challenge-card {
      background: #FFFFFF;
      border: 3px solid #D97706;
      border-radius: 28px;
      padding: 40px 36px;
      text-align: center;
      box-shadow: 0 12px 32px rgba(217,119,6,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .challenge-clock-img {
      width: 100px;
      height: 100px;
      margin-bottom: 16px;
    }
    .challenge-pill {
      background: #FEF3C7;
      color: #B45309;
      font-size: 24px;
      font-weight: 900;
      padding: 10px 24px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .challenge-heading {
      font-size: 46px;
      font-weight: 900;
      color: #0F172A;
      margin-bottom: 14px;
    }
    .challenge-desc {
      font-size: 26px;
      font-weight: 700;
      color: #475569;
      line-height: 1.4;
    }
    .cta-subscribe-box {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #DC2626;
      color: #FFFFFF;
      padding: 22px 28px;
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(220,38,38,0.25);
    }
    .cta-bell {
      font-size: 36px;
    }
    .cta-text {
      font-size: 24px;
      font-weight: 900;
      line-height: 1.3;
    }

    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      border-top: 2px solid #E2E8F0;
      padding-top: 18px;
      font-size: 20px;
      font-weight: 800;
      color: #64748B;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-right {
      color: #0D9488;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <div class="grid-pattern"></div>

  <div class="top-bar">
    <div class="brand-wrap">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo-img" alt="Logo">` : ''}
      <span class="brand-title-text">VizhiTN பொது அறிவு</span>
    </div>
    <div class="unit-badge">${unitTag}</div>
  </div>

  <div class="middle-body">
    ${bodyContent}
  </div>

  <div class="footer-bar">
    <div class="footer-left">
      <span>📖 100% சமச்சீர் கல்வி</span>
    </div>
    <div class="footer-right">காலை 7:30 விரைவு பாடம்</div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN Morning Fast-Paced GK Masterclass Engine (+12% Speed)');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const targetDate = args.find(a => a.startsWith('--date='))?.split('=')[1] || null;

  const pkg = await getOrGenerateDailyPackage(targetDate);
  const lesson = pkg.morningLesson;

  console.log(`[TODAY LESSON] ${pkg.unit} — "${lesson.topicTitleTa}"`);
  console.log(`[CITATION] ${lesson.samacheerCitation}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/lesson_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  // 4 Fast-Paced Synchronized Scenes
  const scenesMeta = [
    {
      idx: 1,
      spokenText: `${lesson.emotionalHookTa} தலைப்பு: ${lesson.topicTitleTa}. பாடநூல் மூலம்: ${lesson.samacheerCitation}. முக்கியமான குறிப்புகளை இப்போது பார்க்கலாம்!`
    },
    {
      idx: 2,
      spokenText: `முதல் பாயிண்ட்: ${lesson.coreFactsTa[0]}. இரண்டாவது பாயிண்ட்: ${lesson.coreFactsTa[1]}.`
    },
    {
      idx: 3,
      spokenText: `மூன்றாவது பாயிண்ட்: ${lesson.coreFactsTa[2] || lesson.coreFactsTa[0]}. நான்காவது பாயிண்ட்: ${lesson.coreFactsTa[3] || lesson.coreFactsTa[1]}.`
    },
    {
      idx: 4,
      spokenText: lesson.eveningCliffhangerTa
    }
  ];

  const scenes = [];

  for (const s of scenesMeta) {
    const slideHtml = generateLessonSlideHtml({
      lesson,
      unitTag: pkg.unit,
      sceneIndex: s.idx,
      brandLogoDataUri
    });

    const slidePath = path.join(sessionDir, `slide_${s.idx}.png`);
    await renderHtmlToImage(slideHtml, slidePath, { width: 1080, height: 1920 });

    const audioPath = path.join(sessionDir, `audio_${s.idx}.mp3`);
    await synthesizeHighSpeedSpeech(s.spokenText, audioPath);
    const durSec = getAudioDuration(audioPath);
    console.log(`[SCENE ${s.idx} OK] Audio: ${durSec.toFixed(1)}s`);

    scenes.push({
      imagePath: slidePath,
      slidePath,
      audioPath,
      durationSec: Math.ceil(durSec) + 1
    });
  }

  const outputVideoPath = path.join(sessionDir, `TNPSC_Lesson_${pkg.date}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Warm Light Studio Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[VIDEO ASSEMBLED ✓] Output: ${outputVideoPath}`);

  const videoTitle = `${lesson.topicTitleTa} | ${pkg.unit} 1-Minute Revision #Shorts`;
  const videoDescription = `${lesson.topicTitleTa}\n${pkg.unit} — சமச்சீர் கல்வி விரைவுப் பாடம்\n\nபாடக் குறிப்புகள்:\n1. ${lesson.coreFactsTa[0]}\n2. ${lesson.coreFactsTa[1]}\n3. ${lesson.coreFactsTa[2] || ''}\n4. ${lesson.coreFactsTa[3] || ''}\n\nஅங்கீகரிக்கப்பட்ட மூலம்: ${lesson.samacheerCitation}\n\n🎯 மாலை 7:00 மணிக்கு இந்த பாடத்திலிருந்து 5 அசல் தேர்வு வினாக்கள் வினாடி-வினா வெளியாகும்!\nஉடனே VizhiTN சேனலை Subscribe செய்து தயாருங்கள்!\n\n#TNPSC #TNPSCGroup4 #TNPSCGroup2 #PoliceSI #SamacheerKalvi #Shorts #TamilNaduGK #VizhiTN`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Morning GK Lesson pipeline verified successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Morning Lesson Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: ['TNPSC', pkg.unit, 'Samacheer Kalvi', 'TNPSC Group 4', 'Tamil Nadu GK', 'Shorts'],
    categoryId: '27',
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[YOUTUBE PUBLISHED ✓] Live: ${res?.videoUrl || res?.id}`);
}

main().catch(err => {
  console.error('[FATAL GK LESSON ERROR]:', err);
  process.exit(1);
});
