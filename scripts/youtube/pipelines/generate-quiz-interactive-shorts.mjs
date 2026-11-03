// scripts/youtube/pipelines/generate-quiz-interactive-shorts.mjs
/**
 * VizhiTN Evening 5-Question Rapid Timer Quiz Shorts Engine (9:16 Portrait)
 * Paced with 4-second countdown timers and ticking sound effects.
 * CRUCIAL RULE: Answers are NEVER revealed in the video!
 * Viewers are challenged to comment their 5 answers below to drive massive comment velocity.
 * Answer key is automatically posted in the Pinned Comment.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getOrGenerateDailyPackage } from '../engine/live-exam-generator.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, postPinnedComment } from '../engine/youtube-client.mjs';
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

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'karthik' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        return outputPath;
      }
    } catch (_) {}
  }

  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+14%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 30000, windowsHide: true });
    return outputPath;
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }
}

/**
 * Generates Warm Light Studio HTML for Quiz Question Slide (1080x1920)
 */
function generateQuestionSlideHtml({
  qNum,
  totalQ,
  question,
  brandLogoDataUri
}) {
  const targetCrayon = getStickmanAssetDataUri('target-crayon.png');
  const clockCrayon = getStickmanAssetDataUri('clock-crayon.png');

  const optionsHtml = question.options.map(opt => `
    <div class="opt-box">
      <div class="opt-badge">${opt.key}</div>
      <div class="opt-text">${opt.text}</div>
    </div>
  `).join('');

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
      padding: 16px 28px;
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
    .q-counter-badge {
      background: #0D9488;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 900;
      padding: 8px 20px;
      border-radius: 12px;
    }

    .main-area {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 32px;
      z-index: 10;
      flex: 1;
    }

    .question-card {
      background: #FFFFFF;
      border: 3px solid #0D9488;
      border-radius: 24px;
      padding: 40px 36px;
      box-shadow: 0 10px 30px rgba(13,148,136,0.08);
      position: relative;
    }
    .q-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #0D9488;
      font-size: 20px;
      font-weight: 900;
      margin-bottom: 12px;
    }
    .q-indicator-icon {
      width: 24px;
      height: 24px;
    }
    .question-text {
      font-size: 40px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.35;
    }

    .timer-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #FEF3C7;
      border: 2px solid #FDE68A;
      padding: 12px 24px;
      border-radius: 9999px;
      align-self: center;
      font-size: 22px;
      font-weight: 900;
      color: #B45309;
    }
    .timer-icon {
      width: 28px;
      height: 28px;
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .opt-box {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #FFFFFF;
      border: 2.5px solid #E2E8F0;
      border-radius: 18px;
      padding: 22px 28px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .opt-badge {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      background: #0F172A;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .opt-text {
      font-size: 32px;
      font-weight: 800;
      color: #1E293B;
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
    .footer-highlight {
      color: #DC2626;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <div class="grid-pattern"></div>

  <div class="top-bar">
    <div class="brand-wrap">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo-img" alt="Logo">` : ''}
      <span class="brand-title-text">VizhiTN மாலை வினாடி-வினா</span>
    </div>
    <div class="q-counter-badge">வினா ${qNum} / ${totalQ}</div>
  </div>

  <div class="main-area">
    <div class="question-card">
      <div class="q-indicator">
        ${targetCrayon ? `<img src="${targetCrayon}" class="q-indicator-icon" alt="Target">` : ''}
        <span>அசல் TNPSC மாதிரி வினா</span>
      </div>
      <div class="question-text">${question.questionTa}</div>
    </div>

    <div class="timer-wrap">
      ${clockCrayon ? `<img src="${clockCrayon}" class="timer-icon" alt="Timer">` : ''}
      <span>4 வினாடிகள் யோசியுங்கள்...</span>
    </div>

    <div class="options-grid">
      ${optionsHtml}
    </div>
  </div>

  <div class="footer-bar">
    <div>💬 உங்கள் பதிலை கமெண்ட்டில் பதிவிடுங்கள்</div>
    <div class="footer-highlight">விடை வீடியோவில் வராது!</div>
  </div>
</body>
</html>`;
}

/**
 * Generates HTML for Closing Screen (Challenges score & drives comment velocity)
 */
function generateClosingSlideHtml({
  challengeText,
  brandLogoDataUri
}) {
  const checkCrayon = getStickmanAssetDataUri('check-crayon.png');

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

    .main-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex: 1;
      gap: 32px;
      z-index: 10;
    }
    .trophy-badge {
      background: #FEF3C7;
      border: 3px solid #D97706;
      color: #B45309;
      font-size: 28px;
      font-weight: 900;
      padding: 14px 36px;
      border-radius: 9999px;
      box-shadow: 0 8px 20px rgba(217,119,6,0.12);
    }
    .giant-score-q {
      font-size: 56px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.25;
    }
    .comment-prompt-card {
      background: #FFFFFF;
      border: 3px solid #0D9488;
      border-radius: 28px;
      padding: 40px 36px;
      box-shadow: 0 12px 36px rgba(13,148,136,0.1);
      width: 100%;
    }
    .prompt-label {
      font-size: 24px;
      font-weight: 800;
      color: #0D9488;
      margin-bottom: 12px;
    }
    .prompt-text {
      font-size: 34px;
      font-weight: 900;
      color: #1E293B;
      line-height: 1.4;
    }
    .pinned-notice {
      background: #EFF6FF;
      border: 2px solid #BFDBFE;
      border-radius: 20px;
      padding: 24px 30px;
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      text-align: left;
    }
    .notice-icon {
      font-size: 36px;
    }
    .notice-text {
      font-size: 22px;
      font-weight: 800;
      color: #1E40AF;
      line-height: 1.4;
    }

    .cta-bar {
      z-index: 10;
      background: #DC2626;
      color: #FFFFFF;
      border-radius: 20px;
      padding: 22px 28px;
      text-align: center;
      font-size: 26px;
      font-weight: 900;
      box-shadow: 0 8px 24px rgba(220,38,38,0.25);
    }
  </style>
</head>
<body>
  <div class="grid-pattern"></div>

  <div class="main-box">
    <div class="trophy-badge">🏆 மாலை நேர அறிவுச் சவால்</div>

    <h1 class="giant-score-q">5-க்கு உங்க ஸ்கோர் என்ன?</h1>

    <div class="comment-prompt-card">
      <div class="prompt-label">👇 கமெண்ட் சவால்:</div>
      <div class="prompt-text">உங்க 5 விடைகளையும் (எ.கா: 1-B, 2-A) உடனே கமெண்ட் பண்ணுங்க!</div>
    </div>

    <div class="pinned-notice">
      <div class="notice-icon">📌</div>
      <div class="notice-text">சரியான விடைகள் & சமச்சீர் கல்வி பக்கக் குறிப்புகள் கீழே உள்ள <b>Pinned Comment</b>-ல் 2 மணி நேரத்தில் வெளியிடப்படும்!</div>
    </div>
  </div>

  <div class="cta-bar">
    🔔 நாளைய காலைப் பாடத்தைத் தவறவிடாமல் இருக்க Subscribe செய்யுங்கள்!
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN Evening 5-Question Rapid Timer Quiz Shorts');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const targetDate = args.find(a => a.startsWith('--date='))?.split('=')[1] || null;

  const pkg = await getOrGenerateDailyPackage(targetDate);
  const quiz = pkg.eveningQuiz;
  const questions = quiz.questions.slice(0, 5);

  console.log(`[QUIZ PACKAGE] Found ${questions.length} questions for: "${pkg.morningLesson.topicTitleTa}"`);

  const sessionDir = path.resolve(`scripts/youtube/assets/quiz_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();
  const scenes = [];

  // Generate 5 Question Scenes
  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const qNum = idx + 1;
    console.log(`\n--- [QUESTION ${qNum}/5] ${q.questionTa} ---`);

    const slideHtml = generateQuestionSlideHtml({
      qNum,
      totalQ: questions.length,
      question: q,
      brandLogoDataUri
    });
    const slidePath = path.join(sessionDir, `q_slide_${qNum}.png`);
    await renderHtmlToImage(slideHtml, slidePath, { width: 1080, height: 1920 });

    const spokenText = `கேள்வி ${qNum}: ${q.spokenQuestionTa || q.questionTa}. ஆப்ஷன் A: ${q.options[0].text}. ஆப்ஷன் B: ${q.options[1].text}. ஆப்ஷன் C: ${q.options[2].text}. ஆப்ஷன் D: ${q.options[3].text}. உங்கள் நேரம் தொடங்குகிறது!`;
    const audioPath = path.join(sessionDir, `q_audio_${qNum}.mp3`);
    await synthesizeSpeech(spokenText, audioPath);
    const durSec = getAudioDuration(audioPath);

    // Audio duration + 4-second thinking countdown
    scenes.push({
      imagePath: slidePath,
      slidePath,
      audioPath,
      durationSec: Math.ceil(durSec) + 4
    });
  }

  // Generate Scene 6: Closing Challenge Screen
  console.log('\n--- [SCENE 6/6] Closing Challenge & Comment CTA ---');
  const closingHtml = generateClosingSlideHtml({
    challengeText: quiz.closingChallengeTa,
    brandLogoDataUri
  });
  const closingSlidePath = path.join(sessionDir, 'closing_slide.png');
  await renderHtmlToImage(closingHtml, closingSlidePath, { width: 1080, height: 1920 });

  const closingSpoken = `ஐந்து கேள்விகளும் முடிந்தது! ஐந்துக்கு உங்கள் ஸ்கோர் என்ன? 1-A, 2-B என்று உங்கள் ஐந்து விடைகளையும் உடனே கீழே கமெண்ட் பண்ணுங்க! இதற்கான சரியான அதிகாரப்பூர்வ விடைகள் கீழே உள்ள பின் செய்யப்பட்ட கமெண்ட்டில் இன்னும் 2 மணி நேரத்தில் வெளியிடப்படும்!`;
  const closingAudioPath = path.join(sessionDir, 'closing_audio.mp3');
  await synthesizeSpeech(closingSpoken, closingAudioPath);
  const closingDur = getAudioDuration(closingAudioPath);

  scenes.push({
    imagePath: closingSlidePath,
    slidePath: closingSlidePath,
    audioPath: closingAudioPath,
    durationSec: Math.ceil(closingDur) + 1
  });

  const outputVideoPath = path.join(sessionDir, `TNPSC_Quiz_${pkg.date}.mp4`);
  console.log('\n[COMPOSING SHORTS] Assembling 5-Question Quiz Video with Timers...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[QUIZ VIDEO ASSEMBLED ✓] Output: ${outputVideoPath}`);

  // Build the Answer Key for Pinned Comment
  const answerKeyText = `🎯 இன்றைய 5 வினாக்களுக்கான அதிகாரப்பூர்வ விடைகள் (Official Answer Key):\n\n` +
    questions.map((q, i) => `${i + 1}) ஆப்ஷன் ${q.correctKey} — ${q.options.find(o => o.key === q.correctKey)?.text}\n   விளக்கம்: ${q.explanationTa}`).join('\n\n') +
    `\n\n📖 மூலம்: சமச்சீர் கல்வி பாடப்புத்தகம்.\n🔔 நாளைய காலை 7:30 மணி விரைவுப் பாடத்தைத் தவறவிடாமல் இருக்க VizhiTN சேனலை Subscribe செய்யுங்கள்!`;

  const videoTitle = `TNPSC 5 வினாடிகள் சவால்: ${pkg.morningLesson.topicTitleTa.slice(0, 40)}... | உங்களால் 5/5 எடுக்க முடியுமா? #Shorts`;
  const videoDescription = `TNPSC 5-Question Daily Rapid Timer Quiz\nதலைப்பு: ${pkg.morningLesson.topicTitleTa}\n\nகேள்விகள்:\n` +
    questions.map((q, i) => `${i + 1}. ${q.questionTa}`).join('\n') +
    `\n\n💬 உங்க 5 விடைகளை கமெண்ட்டில் பதிவிடுங்கள்!\n📌 சரியான விடைகள் மேலே உள்ள Pinned Comment-ல் கொடுக்கப்பட்டுள்ளது.\n\n#TNPSC #TNPSCQuiz #TNPSCGroup4 #PoliceSI #SamacheerKalvi #Shorts #TamilNaduGK #VizhiTN`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('\n[PINNED COMMENT PREVIEW]:\n' + answerKeyText);
    console.log('[SUCCESS ✓] Evening Quiz pipeline verified successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Evening Quiz Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: ['TNPSC Quiz', 'Tamil Nadu GK', 'One Mark Sure Shot', 'TNPSC Group 4', 'Shorts'],
    categoryId: '27',
    privacyStatus: 'public',
    isShort: true
  });

  if (res?.id) {
    console.log(`[YOUTUBE PUBLISHED ✓] Live Video ID: ${res.id}`);
    try {
      await postPinnedComment(res.id, answerKeyText);
      console.log('[PINNED COMMENT ✓] Official Answer Key pinned successfully.');
    } catch (commentErr) {
      console.warn('[PINNED COMMENT WARN] Could not pin comment automatically:', commentErr.message);
    }
  }
}

main().catch(err => {
  console.error('[FATAL QUIZ ERROR]:', err);
  process.exit(1);
});

