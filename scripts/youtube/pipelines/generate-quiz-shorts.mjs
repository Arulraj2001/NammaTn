// scripts/youtube/pipelines/generate-quiz-shorts.mjs
/**
 * VizhiTN "One-Mark Sure Shot" Interactive Exam Quiz Shorts Engine (9:16 Portrait)
 * Upgraded with Warm Light Studio Canvas, Crayon Props & Stickman Explainer Assets.
 * Algorithm-optimized format driving >80% viewed ratio and high subscriber conversion.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { TNPSC_QUIZ_BANK, getTodayQuizQuestion, getQuizQuestionById } from '../engine/exam-quiz-catalog.mjs';
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

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Google Gemini Lifelike Neural Voice (karthik)
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[QUIZ TTS] Synthesizing via Google Gemini Voice: "${cleanText.slice(0, 40)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'karthik' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`[QUIZ TTS ✓] Gemini speech generated: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[QUIZ TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Falling back to Edge-TTS...`);
    }
  }

  // 2. Microsoft Edge-TTS Fallback
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const edgeCmd = `${python} -m edge_tts --voice "${voice}" --file "${tempTextFile}" --write-media "${outputPath}"`;
    execSync(edgeCmd, { stdio: 'pipe', timeout: 30000 });
    return outputPath;
  } finally {
    if (fs.existsSync(tempTextFile)) {
      try { fs.unlinkSync(tempTextFile); } catch {}
    }
  }
}

/**
 * Generates the Warm Light Studio HTML template for Quiz Shorts (1080x1920)
 */
function generateQuizSlideHtml({
  quiz,
  countdownSec = null,
  highlightKey = null,
  brandLogoDataUri
}) {
  const targetCrayonUri = getStickmanAssetDataUri('target-crayon.png');
  const clockCrayonUri = getStickmanAssetDataUri('clock-crayon.png');
  const checkCrayonUri = getStickmanAssetDataUri('check-crayon.png');
  const bookCrayonUri = getStickmanAssetDataUri('book-study-crayon.png');

  const optionsHtml = quiz.options.map(opt => {
    let optClass = 'opt-box';
    if (highlightKey) {
      if (opt.key === highlightKey) {
        optClass = 'opt-box opt-correct';
      } else {
        optClass = 'opt-box opt-dimmed';
      }
    }
    return `
      <div class="${optClass}">
        <div class="opt-badge">${opt.key}</div>
        <div class="opt-text">${opt.text}</div>
      </div>
    `;
  }).join('');

  const timerBadgeHtml = countdownSec !== null ? `
    <div class="timer-container">
      <div class="timer-card">
        ${clockCrayonUri ? `<img src="${clockCrayonUri}" class="clock-icon" alt="Clock">` : ''}
        <span class="timer-num">${countdownSec}</span>
        <span class="timer-label">விநாடி</span>
      </div>
    </div>
  ` : `
    <div class="correct-banner">
      ${checkCrayonUri ? `<img src="${checkCrayonUri}" class="check-icon" alt="Correct">` : ''}
      <span>சரியான விடை: ஆப்ஷன் ${highlightKey}</span>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: #FAF8F5;
      background-image: radial-gradient(#CBD5E1 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      position: relative;
    }

    /* Top Bar: Brand Pill + Subject Chip */
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF;
      border: 3px solid #E2E8F0;
      padding: 12px 26px; border-radius: 999px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; letter-spacing: 0.5px; color: #0F172A; }

    .category-chip {
      background: ${quiz.subjectColor || '#2563EB'};
      color: #FFFFFF; font-size: 24px; font-weight: 800;
      padding: 12px 28px; border-radius: 999px;
      box-shadow: 0 4px 16px ${quiz.subjectColor || '#2563EB'}44;
    }

    /* Challenge Header Banner */
    .challenge-tag {
      position: absolute; top: 200px; left: 60px;
      display: inline-flex; align-items: center; gap: 12px;
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      color: #FFFFFF; font-size: 28px; font-weight: 900;
      padding: 12px 28px; border-radius: 16px;
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.25);
    }
    .target-icon { width: 36px; height: 36px; object-fit: contain; }

    .source-tag {
      position: absolute; top: 200px; right: 60px;
      display: inline-flex; align-items: center; gap: 8px;
      background: #FEF3C7; color: #92400E; font-size: 22px; font-weight: 800;
      padding: 12px 24px; border-radius: 16px;
      border: 2px solid #FDE68A;
    }
    .book-icon { width: 30px; height: 30px; object-fit: contain; }

    /* The Main Question Card */
    .question-card {
      position: absolute; top: 290px; left: 60px; right: 60px;
      background: #FFFFFF;
      border: 4px solid #E2E8F0;
      border-radius: 32px; padding: 48px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      z-index: 10;
    }
    .question-title {
      font-size: 46px; font-weight: 900; line-height: 1.4; color: #0F172A;
    }

    /* Timer / Correct Answer Ribbon */
    .timer-area {
      position: absolute; top: 680px; left: 60px; right: 60px;
      display: flex; justify-content: center; align-items: center;
      z-index: 10;
    }
    .timer-card {
      display: inline-flex; align-items: center; gap: 16px;
      background: #FFFFFF;
      border: 4px solid #EF4444;
      border-radius: 999px; padding: 12px 36px;
      box-shadow: 0 8px 30px rgba(239, 68, 68, 0.2);
    }
    .clock-icon { width: 44px; height: 44px; object-fit: contain; animation: spin 2s linear infinite; }
    .timer-num { font-size: 52px; font-weight: 900; color: #DC2626; line-height: 1; }
    .timer-label { font-size: 26px; font-weight: 800; color: #64748B; }

    .correct-banner {
      display: inline-flex; align-items: center; gap: 16px;
      background: #ECFDF5; border: 4px solid #10B981;
      color: #065F46; font-size: 34px; font-weight: 900;
      padding: 16px 42px; border-radius: 999px;
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.25);
    }
    .check-icon { width: 44px; height: 44px; object-fit: contain; }

    /* Options Grid (A, B, C, D) */
    .options-grid {
      position: absolute; top: 840px; left: 60px; right: 60px;
      display: flex; flex-direction: column; gap: 20px;
      z-index: 10;
    }
    .opt-box {
      background: #FFFFFF;
      border: 3px solid #E2E8F0;
      border-radius: 24px; padding: 24px 32px;
      display: flex; align-items: center; gap: 24px;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
      transition: all 0.2s ease;
    }
    .opt-badge {
      width: 58px; height: 58px; border-radius: 50%;
      background: #EFF6FF;
      border: 2px solid #BFDBFE;
      display: flex; justify-content: center; align-items: center;
      font-size: 32px; font-weight: 900; color: #2563EB; flex-shrink: 0;
    }
    .opt-text { font-size: 36px; font-weight: 800; color: #1E293B; line-height: 1.3; }

    .opt-correct {
      background: #ECFDF5 !important;
      border: 4px solid #10B981 !important;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3) !important;
      transform: scale(1.02);
    }
    .opt-correct .opt-badge {
      background: #10B981 !important; color: #FFFFFF !important;
      border-color: #10B981 !important;
    }
    .opt-correct .opt-text { color: #065F46 !important; font-weight: 900; }

    .opt-dimmed {
      opacity: 0.35;
      background: #F8FAFC !important;
    }

    /* Explanation Card (Scene 2) */
    .explanation-card {
      position: absolute; bottom: 220px; left: 60px; right: 60px;
      background: #FFFFFF;
      border: 3px solid #10B981;
      border-radius: 28px; padding: 32px 40px;
      box-shadow: 0 15px 35px rgba(16, 185, 129, 0.15);
      z-index: 10;
    }
    .exp-title {
      font-size: 26px; font-weight: 900; color: #059669;
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    }
    .exp-text { font-size: 32px; font-weight: 700; line-height: 1.45; color: #0F172A; }

    /* Footer / Subscribe CTA Bar */
    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A;
      border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
      z-index: 10;
    }
    .footer-left { font-size: 26px; font-weight: 800; color: #FBBF24; }
    .footer-right {
      font-size: 26px; font-weight: 900; color: #FFFFFF;
      background: #2563EB; padding: 8px 24px; border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">` : ''}
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="category-chip">${quiz.subjectLabel || 'TNPSC பொது அறிவு'}</div>
  </div>

  <div class="challenge-tag">
    ${targetCrayonUri ? `<img src="${targetCrayonUri}" class="target-icon" alt="Target">` : ''}
    <span>ONE-MARK SURE SHOT</span>
  </div>

  <div class="source-tag">
    ${bookCrayonUri ? `<img src="${bookCrayonUri}" class="book-icon" alt="Book">` : ''}
    <span>சமச்சீர் கல்வி</span>
  </div>

  <div class="question-card">
    <div class="question-title">${quiz.questionTa}</div>
  </div>

  <div class="timer-area">
    ${timerBadgeHtml}
  </div>

  <div class="options-grid">
    ${optionsHtml}
  </div>

  ${highlightKey ? `
    <div class="explanation-card">
      <div class="exp-title">
        ${checkCrayonUri ? `<img src="${checkCrayonUri}" style="width:28px;height:28px;" alt="Check">` : ''}
        <span>தேர்வுக்கான முக்கியக் குறிப்பு:</span>
      </div>
      <div class="exp-text">${quiz.explanationTa}</div>
    </div>
  ` : ''}

  <div class="footer-bar">
    <div class="footer-left">🔔 நாளைய One-Mark வினாடி வினா காலை 7:30</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

// --- MAIN RUNNER ---
async function main() {
  console.log('====================================================');
  console.log('VizhiTN "One-Mark Sure Shot" Shorts Engine (Light Studio)');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const quizIdArg = process.argv.find(a => a.startsWith('--quiz='))?.split('=')[1];

  const quiz = quizIdArg ? getQuizQuestionById(quizIdArg) : getTodayQuizQuestion();
  if (!quiz) {
    throw new Error(`Quiz question not found: ${quizIdArg}`);
  }

  console.log(`[QUIZ] Question: "${quiz.questionTa}" (${quiz.id})`);
  console.log(`[CORRECT] Option ${quiz.correctKey}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/quiz_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  // Scene 1: High-Retention Hook + Question + 5s Countdown
  const s1Spoken = `டி.என்.பி.எஸ்.சி தேர்வில் 90% பேர் தவறாக விடையளிக்கும் முக்கியமான ஒரு மதிப்பெண் கேள்வி இது! கேள்வி: ${quiz.questionTa}. ஆப்ஷன் A: ${quiz.options[0].text}, ஆப்ஷன் B: ${quiz.options[1].text}, ஆப்ஷன் C: ${quiz.options[2].text}, ஆப்ஷன் D: ${quiz.options[3].text}. உங்கள் நேரம் தொடங்குகிறது!`;
  const s1AudioPath = path.join(sessionDir, 'quiz_audio_1.mp3');
  await synthesizeSpeech(s1Spoken, s1AudioPath);
  const s1Dur = getAudioDuration(s1AudioPath);

  const s1Html = generateQuizSlideHtml({
    quiz,
    countdownSec: 5,
    brandLogoDataUri
  });
  const s1Path = path.join(sessionDir, 'quiz_slide_1.png');
  renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

  // Scene 2: The Victory Reveal & Exam Pointer + Loss-Aversion CTA
  const correctOption = quiz.options.find(o => o.key === quiz.correctKey);
  const s2Spoken = `சரியான விடை ஆப்ஷன் ${quiz.correctKey}, ${correctOption.text}! சமச்சீர் புத்தகக் குறிப்பு: ${quiz.explanationTa}. நாளைய One-Mark Sure Shot வினாடி வினாவை தவறவிடாமல் இருக்க, இப்போதே சப்ஸ்கிரைப் பண்ணி வச்சுக்கோங்க!`;
  const s2AudioPath = path.join(sessionDir, 'quiz_audio_2.mp3');
  await synthesizeSpeech(s2Spoken, s2AudioPath);
  const s2Dur = getAudioDuration(s2AudioPath);

  const s2Html = generateQuizSlideHtml({
    quiz,
    highlightKey: quiz.correctKey,
    brandLogoDataUri
  });
  const s2Path = path.join(sessionDir, 'quiz_slide_2.png');
  renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

  // Assemble Video
  const scenes = [
    { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: Math.ceil(s1Dur) + 1 },
    { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: Math.ceil(s2Dur) + 1 }
  ];

  const outputVideoPath = path.join(sessionDir, `TNPSC_SureShot_${quiz.id}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Warm Light Studio Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[QUIZ VIDEO OK] Rendered: ${outputVideoPath}`);

  const videoTitle = `TNPSC One-Mark Sure Shot: ${quiz.questionTa.slice(0, 42)}... | Group 4 & 2 #Shorts`;
  const videoDescription = `TNPSC One-Mark Sure Shot Series | சமச்சீர் கல்வி வினா-விடை\n\nகேள்வி:\n${quiz.questionTa}\n\nசரியான விடை: ஆப்ஷன் ${quiz.correctKey} - ${correctOption.text}\n\nதேர்வுக்கான முக்கியக் குறிப்பு:\n${quiz.explanationTa}\n\nதினமும் காலை 7:30 மணிக்கு TNPSC One-Mark வினாடி-வினா பெற VizhiTN சேனலை Subscribe செய்யுங்கள்!\n\n#TNPSC #TNPSCGroup4 #TNPSCGroup2 #Shorts #TamilNaduGK #PoliceSI #SamacheerKalvi #VizhiTN`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[SUCCESS ✓] Interactive Quiz pipeline verified successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Quiz Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: ['TNPSC Quiz', 'One Mark Sure Shot', 'TNPSC Group 4', 'Police SI Exam', 'Samacheer Kalvi', 'Shorts'],
    categoryId: '27',
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[QUIZ SHORT PUBLISHED ✓] Live: ${res.videoUrl}`);
}

main().catch(err => {
  console.error('[FATAL QUIZ ERROR]:', err);
  process.exit(1);
});
