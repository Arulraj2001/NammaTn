// scripts/youtube/pipelines/generate-weekly-mega-mock.mjs
/**
 * VizhiTN Sunday 20-Minute Weekly Mega Mock Test Engine (16:9 Landscape)
 * Compiles 20 high-yield exam questions across Unit 8, Unit 9, Polity, Geography & Schemes.
 * Designed to accumulate YouTube public watch hours (4,000 hrs threshold)
 * and provide immense value to Tamil Nadu competitive exam aspirants every Sunday morning.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getOrGenerateWeeklyMockPackage } from '../engine/live-exam-generator.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { getFfmpegBinaryPath, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
import { generateLongThumbnailPair } from '../engine/thumbnail-engine.mjs';
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

async function synthesizePedagogicalSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const rawGeminiAudio = path.join(dir, `raw_gemini_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.mp3`);
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      await synthesizeGeminiSpeech(cleanText, rawGeminiAudio, { voice: 'karthik' });
      if (fs.existsSync(rawGeminiAudio) && fs.statSync(rawGeminiAudio).size > 1000) {
        // Natural teacher pace (+8%)
        const speedCmd = `ffmpeg -y -i "${rawGeminiAudio}" -filter:a "atempo=1.08" -vn "${outputPath}"`;
        execSync(speedCmd, { stdio: 'pipe', timeout: 45000 });
        try { fs.unlinkSync(rawGeminiAudio); } catch (_) {}
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
          return outputPath;
        }
      }
    } catch (_) {
      try { if (fs.existsSync(rawGeminiAudio)) fs.unlinkSync(rawGeminiAudio); } catch (_) {}
    }
  }

  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+8%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 45000, windowsHide: true });
    return outputPath;
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }
}

/**
 * Generates 16:9 Question Screen HTML (1920x1080)
 */
function generateQuestionSlide16x9({
  qNum,
  totalQ,
  q,
  brandLogoDataUri
}) {
  const clockCrayon = getStickmanAssetDataUri('clock-crayon.png');
  const targetCrayon = getStickmanAssetDataUri('target-crayon.png');

  const optionsHtml = q.options.map(opt => `
    <div class="opt-card">
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
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #FAF8F5;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 80px;
    }
    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #E2DED7;
      padding-bottom: 20px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 52px;
      height: 52px;
      border-radius: 12px;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 900;
      color: #1E293B;
      letter-spacing: -0.5px;
    }
    .badge-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .unit-pill {
      background: #FEF3C7;
      color: #B45309;
      font-size: 22px;
      font-weight: 800;
      padding: 8px 24px;
      border-radius: 9999px;
      border: 1.5px solid #FCD34D;
    }
    .q-counter {
      background: #1E293B;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 900;
      padding: 8px 26px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
    }
    .main-body {
      display: flex;
      flex-direction: column;
      gap: 32px;
      margin: auto 0;
    }
    .question-box {
      background: #FFFFFF;
      border: 2px solid #E2DED7;
      border-radius: 24px;
      padding: 32px 48px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.04);
    }
    .question-text {
      font-size: 38px;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.45;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .opt-card {
      background: #FFFFFF;
      border: 2px solid #E2DED7;
      border-radius: 18px;
      padding: 22px 28px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .opt-badge {
      width: 52px;
      height: 52px;
      background: #F1F5F9;
      color: #334155;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 900;
      border: 2px solid #CBD5E1;
      flex-shrink: 0;
    }
    .opt-text {
      font-size: 30px;
      font-weight: 700;
      color: #1E293B;
      line-height: 1.35;
    }
    .bottom-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 2px solid #E2DED7;
      padding-top: 20px;
    }
    .timer-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .timer-icon {
      width: 44px;
      height: 44px;
    }
    .timer-label {
      font-size: 24px;
      font-weight: 800;
      color: #D97706;
    }
    .footer-prompt {
      font-size: 22px;
      font-weight: 700;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="top-header">
    <div class="brand-section">
      ${brandLogoDataUri ? `<img class="brand-logo" src="${brandLogoDataUri}" alt="Logo" />` : ''}
      <div class="brand-title">VizhiTN • TNPSC Weekly Mega Mock</div>
    </div>
    <div class="badge-row">
      <div class="unit-pill">${q.unitTag || 'TNPSC General Studies'}</div>
      <div class="q-counter">QUESTION ${qNum} / ${totalQ}</div>
    </div>
  </div>

  <div class="main-body">
    <div class="question-box">
      <div class="question-text">${qNum}. ${q.questionTa}</div>
    </div>
    <div class="options-grid">
      ${optionsHtml}
    </div>
  </div>

  <div class="bottom-footer">
    <div class="timer-wrap">
      ${clockCrayon ? `<img class="timer-icon" src="${clockCrayon}" alt="Timer" />` : ''}
      <div class="timer-label">⏱️ சிந்திப்பதற்கான நேரம்: 5 விநாடிகள்...</div>
    </div>
    <div class="footer-prompt">சரியான விடையை நீங்களே தேர்வு செய்யுங்கள்</div>
  </div>
</body>
</html>`;
}

/**
 * Generates 16:9 Answer & Explanation Screen HTML (1920x1080)
 */
function generateAnswerSlide16x9({
  qNum,
  totalQ,
  q,
  brandLogoDataUri
}) {
  const checkCrayon = getStickmanAssetDataUri('check-crayon.png');
  const bookCrayon = getStickmanAssetDataUri('book-study-crayon.png');

  const optionsHtml = q.options.map(opt => {
    const isCorrect = (opt.key === q.correctKey);
    return `
      <div class="opt-card ${isCorrect ? 'correct' : 'faded'}">
        <div class="opt-badge ${isCorrect ? 'correct-badge' : ''}">${opt.key}</div>
        <div class="opt-text">${opt.text}</div>
        ${isCorrect && checkCrayon ? `<img class="check-icon" src="${checkCrayon}" alt="Correct" />` : ''}
      </div>
    `;
  }).join('');

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
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #FAF8F5;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px 80px;
    }
    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #E2DED7;
      padding-bottom: 18px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #1E293B;
    }
    .badge-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .answer-tag {
      background: #D1FAE5;
      color: #065F46;
      font-size: 22px;
      font-weight: 900;
      padding: 6px 22px;
      border-radius: 9999px;
      border: 1.5px solid #10B981;
    }
    .q-counter {
      background: #1E293B;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 900;
      padding: 6px 22px;
      border-radius: 9999px;
    }
    .main-body {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin: auto 0;
    }
    .question-compact {
      font-size: 30px;
      font-weight: 800;
      color: #1E293B;
      line-height: 1.35;
      background: #FFFFFF;
      padding: 20px 36px;
      border-radius: 18px;
      border: 1.5px solid #E2DED7;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .opt-card {
      background: #FFFFFF;
      border: 2px solid #E2DED7;
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 18px;
      position: relative;
    }
    .opt-card.correct {
      border: 2.5px solid #059669;
      background: #ECFDF5;
      box-shadow: 0 4px 16px rgba(5, 150, 105, 0.15);
    }
    .opt-card.faded {
      opacity: 0.55;
    }
    .opt-badge {
      width: 44px;
      height: 44px;
      background: #F1F5F9;
      color: #334155;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .opt-badge.correct-badge {
      background: #059669;
      color: #FFFFFF;
    }
    .opt-text {
      font-size: 26px;
      font-weight: 800;
      color: #1E293B;
    }
    .check-icon {
      width: 38px;
      height: 38px;
      position: absolute;
      right: 20px;
    }
    .explanation-card {
      background: #F8FAFC;
      border: 2px dashed #CBD5E1;
      border-radius: 20px;
      padding: 24px 36px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .exp-title {
      font-size: 22px;
      font-weight: 900;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .book-icon {
      width: 32px;
      height: 32px;
    }
    .exp-text {
      font-size: 26px;
      font-weight: 700;
      color: #334155;
      line-height: 1.45;
    }
    .citation-tag {
      font-size: 20px;
      font-weight: 800;
      color: #2563EB;
      background: #EFF6FF;
      padding: 4px 16px;
      border-radius: 8px;
      width: fit-content;
    }
    .bottom-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 2px solid #E2DED7;
      padding-top: 18px;
    }
    .footer-note {
      font-size: 22px;
      font-weight: 800;
      color: #059669;
    }
    .footer-sub {
      font-size: 20px;
      font-weight: 700;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="top-header">
    <div class="brand-section">
      ${brandLogoDataUri ? `<img class="brand-logo" src="${brandLogoDataUri}" alt="Logo" />` : ''}
      <div class="brand-title">VizhiTN • விடைக்குறிப்பு & விளக்கம்</div>
    </div>
    <div class="badge-row">
      <div class="answer-tag">சரியான விடை: [ ${q.correctKey} ]</div>
      <div class="q-counter">QUESTION ${qNum} / ${totalQ}</div>
    </div>
  </div>

  <div class="main-body">
    <div class="question-compact">${qNum}. ${q.questionTa}</div>
    <div class="options-grid">
      ${optionsHtml}
    </div>
    <div class="explanation-card">
      <div class="exp-title">
        ${bookCrayon ? `<img class="book-icon" src="${bookCrayon}" alt="Book" />` : ''}
        பாடநூல் விளக்கம் & நினைவுக்குறிப்பு (Mnemonic):
      </div>
      <div class="exp-text">${q.explanationTa}</div>
      ${q.samacheerCitation ? `<div class="citation-tag">📖 சமச்சீர் ஆதாரம்: ${q.samacheerCitation}</div>` : ''}
    </div>
  </div>

  <div class="bottom-footer">
    <div class="footer-note">✓ சமச்சீர் கல்வி பாடநூல் அடிப்படையில் சரிபார்க்கப்பட்டது</div>
    <div class="footer-sub">அடுத்த கேள்விக்கு தயாராகுங்கள்...</div>
  </div>
</body>
</html>`;
}

/**
 * Generates 16:9 Intro / Outro Slide
 */
function generateIntroSlide16x9({
  titleTa,
  brandLogoDataUri,
  isIntro = true
}) {
  const teacherCrayon = getStickmanAssetDataUri('book-study-crayon.png');
  const targetCrayon = getStickmanAssetDataUri('target-crayon.png');

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
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #FAF8F5;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 100px;
      position: relative;
    }
    .logo-img {
      width: 110px;
      height: 110px;
      border-radius: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .badge {
      background: #FEF3C7;
      color: #B45309;
      font-size: 26px;
      font-weight: 900;
      padding: 10px 36px;
      border-radius: 9999px;
      border: 2px solid #FCD34D;
      margin-bottom: 28px;
    }
    .main-title {
      font-size: 58px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.3;
      max-width: 1500px;
      margin-bottom: 24px;
    }
    .sub-title {
      font-size: 32px;
      font-weight: 700;
      color: #475569;
      max-width: 1200px;
      line-height: 1.45;
      margin-bottom: 40px;
    }
    .highlight-strip {
      background: #FFFFFF;
      border: 2px solid #E2DED7;
      border-radius: 24px;
      padding: 24px 60px;
      display: flex;
      gap: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .strip-item {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 26px;
      font-weight: 800;
      color: #1E293B;
    }
    .strip-icon {
      width: 48px;
      height: 48px;
    }
  </style>
</head>
<body>
  ${brandLogoDataUri ? `<img class="logo-img" src="${brandLogoDataUri}" alt="Logo" />` : ''}
  <div class="badge">${isIntro ? '🔥 வாராந்திர மெகா மாதிரித் தேர்வு' : '🎯 தேர்வு நிறைவடைந்தது!'}</div>
  <div class="main-title">${titleTa}</div>
  <div class="sub-title">${isIntro ? 'சமச்சீர் கல்வி 6 முதல் 12-ஆம் வகுப்பு வரை அதிமுக்கிய 20 வினாக்கள் & முழு விளக்கம்!' : '20-க்கு உங்கள் மதிப்பெண் என்ன? உங்கள் விடைகளை உடனே கமெண்ட் செய்யுங்கள்!'}</div>
  <div class="highlight-strip">
    <div class="strip-item">
      ${targetCrayon ? `<img class="strip-icon" src="${targetCrayon}" alt="Target" />` : ''}
      <span>Unit 8 & 9 சிறப்பு கவனம்</span>
    </div>
    <div class="strip-item">
      ${teacherCrayon ? `<img class="strip-icon" src="${teacherCrayon}" alt="Teacher" />` : ''}
      <span>100% சமச்சீர் ஆதாரம்</span>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN Sunday 20-Minute Weekly Mega Mock Test Engine');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const ffmpeg = getFfmpegBinaryPath();
  const brandLogoDataUri = getBrandLogoDataUri();
  const todayIst = getTodayIst();

  // Deduplication check: only one weekly mock per Sunday unless forced or dry-run
  if (!process.argv.includes('--force') && !isDryRun) {
    const status = await isBroadcastCompletedToday('weekly-mock', todayIst);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] Weekly Mega Mock already uploaded today (${status.existingRecord?.youtube_video_id || 'logged'}). Exiting safely.`);
      process.exit(0);
    }
  }

  // 1. Fetch or generate 20-question package
  const packageData = await getOrGenerateWeeklyMockPackage(todayIst);
  const questions = packageData.questions.slice(0, 20); // exactly 20 questions

  console.log(`[WEEKLY MOCK] Loaded ${questions.length} questions for broadcast: "${packageData.titleTa}"`);

  // 2. Build Video Segments
  const segmentFiles = [];
  const chapters = [];
  let currentCumulativeSec = 0;

  // Segment 0: Intro
  console.log('[STAGE 1/4] Generating Intro Segment...');
  chapters.push(`00:00 - அறிமுகம் & தேர்வு வழிகாட்டுதல்`);
  const introAudioPath = path.join(outDir, `mock_intro_audio_${Date.now()}.mp3`);
  await synthesizePedagogicalSpeech(packageData.introHookTa, introAudioPath);
  const introDur = getAudioDuration(introAudioPath);

  const introSlideHtml = generateIntroSlide16x9({
    titleTa: packageData.titleTa,
    brandLogoDataUri,
    isIntro: true
  });
  const introSlideImg = path.join(outDir, `mock_intro_frame_${Date.now()}.png`);
  renderHtmlToImage(introSlideHtml, introSlideImg, { width: 1920, height: 1080 });

  const introMp4 = path.join(outDir, `mock_seg_intro_${Date.now()}.mp4`);
  const introCmd = `"${ffmpeg}" -y -loop 1 -framerate 30 -i "${introSlideImg}" -i "${introAudioPath}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${introMp4}"`;
  execSync(introCmd, { stdio: 'pipe', timeout: 60000 });
  segmentFiles.push(introMp4);
  currentCumulativeSec += introDur;

  // Segments 1 to N: Questions & Answers
  console.log(`[STAGE 2/4] Rendering ${questions.length} Question & Explanation Segments...`);
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qNum = i + 1;
    console.log(`\n--- Rendering Question ${qNum}/${questions.length}: [${q.unitTag}] "${q.questionTa.slice(0, 40)}..." ---`);

    // Chapter timestamp calculation
    const mins = Math.floor(currentCumulativeSec / 60).toString().padStart(2, '0');
    const secs = Math.floor(currentCumulativeSec % 60).toString().padStart(2, '0');
    chapters.push(`${mins}:${secs} - வினா ${qNum}: ${q.topic || q.unitTag}`);

    // Part A: Question Slide
    const qAudioPath = path.join(outDir, `mock_q${qNum}_audio_${Date.now()}.mp3`);
    const qSpeechText = `வினா எண் ${qNum}. ${q.spokenQuestionTa || q.questionTa}. ஆப்ஷன் ஏ: ${q.options[0]?.text}. ஆப்ஷன் பி: ${q.options[1]?.text}. ஆப்ஷன் சி: ${q.options[2]?.text}. ஆப்ஷன் டி: ${q.options[3]?.text}. உங்கள் நேரம் துவங்குகிறது!`;
    await synthesizePedagogicalSpeech(qSpeechText, qAudioPath);
    const qDur = getAudioDuration(qAudioPath);

    const qSlideHtml = generateQuestionSlide16x9({
      qNum,
      totalQ: questions.length,
      q,
      brandLogoDataUri
    });
    const qSlideImg = path.join(outDir, `mock_q${qNum}_frame_${Date.now()}.png`);
    renderHtmlToImage(qSlideHtml, qSlideImg, { width: 1920, height: 1080 });

    const qMp4 = path.join(outDir, `mock_seg_q${qNum}_${Date.now()}.mp4`);
    const qCmd = `"${ffmpeg}" -y -loop 1 -framerate 30 -i "${qSlideImg}" -i "${qAudioPath}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${qMp4}"`;
    execSync(qCmd, { stdio: 'pipe', timeout: 60000 });
    segmentFiles.push(qMp4);
    currentCumulativeSec += qDur;

    // Part B: Answer Slide
    const aAudioPath = path.join(outDir, `mock_a${qNum}_audio_${Date.now()}.mp3`);
    const aSpeechText = `சரியான விடை ஆப்ஷன் ${q.correctKey}! ${q.spokenExplanationTa || q.explanationTa}`;
    await synthesizePedagogicalSpeech(aSpeechText, aAudioPath);
    const aDur = getAudioDuration(aAudioPath);

    const aSlideHtml = generateAnswerSlide16x9({
      qNum,
      totalQ: questions.length,
      q,
      brandLogoDataUri
    });
    const aSlideImg = path.join(outDir, `mock_a${qNum}_frame_${Date.now()}.png`);
    renderHtmlToImage(aSlideHtml, aSlideImg, { width: 1920, height: 1080 });

    const aMp4 = path.join(outDir, `mock_seg_a${qNum}_${Date.now()}.mp4`);
    const aCmd = `"${ffmpeg}" -y -loop 1 -framerate 30 -i "${aSlideImg}" -i "${aAudioPath}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${aMp4}"`;
    execSync(aCmd, { stdio: 'pipe', timeout: 60000 });
    segmentFiles.push(aMp4);
    currentCumulativeSec += aDur;
  }

  // Segment Outro
  console.log('\n[STAGE 3/4] Generating Outro Segment...');
  const outroAudioPath = path.join(outDir, `mock_outro_audio_${Date.now()}.mp3`);
  await synthesizePedagogicalSpeech(packageData.outroTa, outroAudioPath);
  const outroDur = getAudioDuration(outroAudioPath);

  const outroSlideHtml = generateIntroSlide16x9({
    titleTa: '20-க்கு உங்கள் மதிப்பெண் என்ன?',
    brandLogoDataUri,
    isIntro: false
  });
  const outroSlideImg = path.join(outDir, `mock_outro_frame_${Date.now()}.png`);
  renderHtmlToImage(outroSlideHtml, outroSlideImg, { width: 1920, height: 1080 });

  const outroMp4 = path.join(outDir, `mock_seg_outro_${Date.now()}.mp4`);
  const outroCmd = `"${ffmpeg}" -y -loop 1 -framerate 30 -i "${outroSlideImg}" -i "${outroAudioPath}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p "${outroMp4}"`;
  execSync(outroCmd, { stdio: 'pipe', timeout: 60000 });
  segmentFiles.push(outroMp4);
  currentCumulativeSec += outroDur;

  // 3. Assemble full master 16:9 video via Concat Demuxer
  console.log(`\n[STAGE 4/4] Concatenating ${segmentFiles.length} segments into Master 16:9 Video...`);
  const concatListFile = path.join(outDir, `mock_concat_list_${Date.now()}.txt`);
  const concatContent = segmentFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatListFile, concatContent, 'utf-8');

  const masterVideoPath = path.join(outDir, `TNPSC_Mega_Mock_${todayIst}_${Date.now()}.mp4`);
  const concatCmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatListFile}" -c copy "${masterVideoPath}"`;
  execSync(concatCmd, { stdio: 'pipe', timeout: 180000 });

  const totalMin = Math.floor(currentCumulativeSec / 60);
  const totalSec = Math.floor(currentCumulativeSec % 60);
  console.log(`[MASTER VIDEO ✓] Generated 16:9 Master Video: ${masterVideoPath}`);
  console.log(`[DURATION STATS] Total Duration: ${totalMin}m ${totalSec}s (${currentCumulativeSec.toFixed(1)}s)`);

  // Cleanup sub-segments to preserve disk space
  try {
    for (const f of segmentFiles) fs.unlinkSync(f);
    fs.unlinkSync(concatListFile);
  } catch (_) {}

  // 4. Generate 16:9 A/B Thumbnails
  const thumbBase = `thumb_mega_mock_${Date.now()}`;
  let thumbPath = path.join(outDir, `${thumbBase}_variantA.png`);
  try {
    const pair = await generateLongThumbnailPair({
      titleTa: 'TNPSC மெகா மாதிரித் தேர்வு 20 வினாக்கள்',
      subtitleTa: 'சமச்சீர் கல்வி பாடநூல் ஆதாரம் & நினைவுக்குறிப்பு',
      category: 'TNPSC MOCK TEST',
      heroImageUrl: introSlideImg,
      outputDir: outDir,
      baseName: thumbBase
    });
    thumbPath = pair.variantA;
  } catch (err) {
    console.warn('[THUMBNAIL WARN] Could not generate thumbnail pair:', err.message);
  }

  // 5. Build Comprehensive Description with Chapters
  const description = `${packageData.titleTa}

தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம் (TNPSC) குரூப் 4, குரூப் 2/2A தேர்வுகளுக்கான முழு வாராந்திர மெகா மாதிரித் தேர்வு.

📚 பாடத்திட்டப் பகுதிகள்:
• அலகு 8: தமிழ்நாட்டின் வரலாறு, பண்பாடு மற்றும் விடுதலைப் போராட்டம்
• அலகு 9: தமிழகத்தில் வளர்ச்சி நிர்வாகம் & சமூக நீதி
• இந்திய ஆட்சியியல் (Indian Polity & Constitution)
• தமிழ்நாடு புவியியல் & முக்கிய அரசு நலத்திட்டங்கள்

⏱️ காலக்குறிப்புகள் (Timestamps / Chapters):
${chapters.join('\n')}

🎯 உங்கள் மதிப்பெண் என்ன என்பதை கமெண்ட்டில் பதிவிடுங்கள்!
🔔 அடுத்த வார மாதிரித் தேர்வுகளுக்கு உடனே Subscribe செய்யுங்கள்: @VizhiTn

Official Portal: https://vizhitn.in
#TNPSC #TNPSCGroup4 #SamacheerKalvi #TNPSCGroup2 #Unit8 #Unit9 #TamilNaduGK #MockTest #VizhiTN`;

  const tags = [
    'TNPSC', 'TNPSC Group 4 2026', 'TNPSC Group 2', 'Samacheer Kalvi',
    'Unit 8 TNPSC', 'Unit 9 TNPSC', 'TNPSC Mock Test', 'Tamil Nadu Current Affairs',
    'TNPSC History', 'TNPSC Polity', 'Keezhadi', 'Velu Nachiyar', 'VizhiTN'
  ];

  if (isDryRun) {
    console.log('\n[DRY RUN COMPLETE ✓] Video rendered successfully without uploading.');
    console.log(`Video File: ${masterVideoPath}`);
    console.log(`Duration: ${totalMin}m ${totalSec}s`);
    console.log(`Thumbnail: ${thumbPath}`);
    return;
  }

  // 6. Upload to YouTube
  console.log('[UPLOAD] Uploading 20-minute Mega Mock Test to YouTube...');
  const uploadResult = await uploadToYouTube({
    videoPath: masterVideoPath,
    title: `${packageData.titleTa.slice(0, 85)} | VizhiTN`,
    description,
    tags,
    categoryId: '27' // Education category
  });

  if (uploadResult?.videoId) {
    console.log(`[UPLOAD SUCCESS ✓] Video published: https://youtu.be/${uploadResult.videoId}`);

    if (fs.existsSync(thumbPath)) {
      try {
        await setYouTubeThumbnail(uploadResult.videoId, thumbPath);
      } catch (tErr) {
        console.warn('[THUMBNAIL UPLOAD WARN]', tErr.message);
      }
    }

    // Pinned comment with answer guide & encouragement
    const pinnedCommentText = `🎯 20-க்கு உங்க மதிப்பெண் என்ன?
1-A, 2-C ன்னு உங்க மொத்த மதிப்பெண்ணை கீழே கமெண்ட் பண்ணுங்க!

📖 சமச்சீர் கல்வி பாடநூல் அடிப்படையில் தொடர்ந்து பயிற்சி செய்ய VizhiTN-ஐ சப்ஸ்கிரைப் செய்து வச்சுக்கோங்க! வெற்றி நமதே! 🔥`;

    try {
      await postPinnedComment(uploadResult.videoId, pinnedCommentText);
      console.log('[PINNED COMMENT ✓] Posted and pinned encouragement comment.');
    } catch (_) {}

    await recordBroadcastSuccess({
      format: 'weekly-mock',
      youtubeVideoId: uploadResult.videoId,
      title: packageData.titleTa,
      metadata: {
        durationSec: currentCumulativeSec,
        questionsCount: questions.length
      }
    });
  }
}

main().catch(err => {
  console.error('[FATAL WEEKLY MOCK ERROR]:', err);
  process.exit(1);
});

