// scripts/youtube/pipelines/generate-quiz-shorts.mjs
/**
 * VizhiTN "One-Mark Sure Shot" Interactive Exam Quiz Shorts Engine (9:16 Portrait)
 * Upgraded with Warm Light Studio Canvas, Crayon Props & Stickman Explainer Assets.
 * 
 * Supports 2 Dedicated Modes:
 * 1. --mode=question    : Challenge Card (Unanswered, 5s countdown, drives comments & loop retention)
 * 2. --mode=explanation : Samacheer Masterclass (Reveals answer + Who, When, Which Book, PYQ Reference)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { getQuizQuestionForSlot, getQuizQuestionById, TNPSC_QUIZ_BANK } from '../engine/exam-quiz-catalog.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, postPinnedComment } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
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
 * Slide 1 (Question Mode): Question + Options + 5s Countdown Timer
 */
function generateQuestionSlideHtml({ quiz, brandLogoDataUri }) {
  const targetCrayonUri = getStickmanAssetDataUri('target-crayon.png');
  const clockCrayonUri = getStickmanAssetDataUri('clock-crayon.png');
  const bookCrayonUri = getStickmanAssetDataUri('book-study-crayon.png');

  const optionsHtml = quiz.options.map(opt => `
    <div class="opt-box">
      <div class="opt-badge">${opt.key}</div>
      <div class="opt-text">${opt.text}</div>
    </div>
  `).join('');

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
    .clock-icon { width: 44px; height: 44px; object-fit: contain; }
    .timer-num { font-size: 52px; font-weight: 900; color: #DC2626; line-height: 1; }
    .timer-label { font-size: 26px; font-weight: 800; color: #64748B; }
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
    }
    .opt-badge {
      width: 58px; height: 58px; border-radius: 50%;
      background: #EFF6FF; border: 2px solid #BFDBFE;
      display: flex; justify-content: center; align-items: center;
      font-size: 32px; font-weight: 900; color: #2563EB; flex-shrink: 0;
    }
    .opt-text { font-size: 36px; font-weight: 800; color: #1E293B; line-height: 1.3; }
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
    <div class="timer-card">
      ${clockCrayonUri ? `<img src="${clockCrayonUri}" class="clock-icon" alt="Clock">` : ''}
      <span class="timer-num">5</span>
      <span class="timer-label">விநாடி</span>
    </div>
  </div>

  <div class="options-grid">
    ${optionsHtml}
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 உங்கள் விடை என்ன? உடனே கமெண்ட் பண்ணுங்க!</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

/**
 * Slide 2 (Question Mode): High-Impact Challenge Card (NO ANSWER REVEALED!)
 */
function generateChallengeSlideHtml({ quiz, brandLogoDataUri, explanationTimeText }) {
  const targetCrayonUri = getStickmanAssetDataUri('target-crayon.png');
  const ideaNoteUri = getStickmanAssetDataUri('idea-note-crayon.png');

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
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .category-chip {
      background: ${quiz.subjectColor || '#2563EB'};
      color: #FFFFFF; font-size: 24px; font-weight: 800;
      padding: 12px 28px; border-radius: 999px;
    }

    .center-card {
      position: absolute; top: 260px; left: 60px; right: 60px;
      background: #FFFFFF;
      border: 4px solid #E2E8F0;
      border-radius: 36px; padding: 50px;
      text-align: center;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      z-index: 10;
    }
    .cta-header {
      font-size: 56px; font-weight: 900; color: #DC2626; line-height: 1.3;
      margin-bottom: 24px;
    }
    .sub-prompt {
      font-size: 38px; font-weight: 800; color: #1E293B; line-height: 1.4;
      margin-bottom: 36px;
    }
    .options-row {
      display: flex; justify-content: center; gap: 24px; margin-bottom: 40px;
    }
    .choice-box {
      width: 120px; height: 120px; border-radius: 28px;
      background: #EFF6FF; border: 4px solid #3B82F6;
      display: flex; justify-content: center; align-items: center;
      font-size: 54px; font-weight: 900; color: #1D4ED8;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
    }
    .arrow-down { font-size: 80px; margin: 10px 0; }

    .schedule-box {
      position: absolute; top: 1100px; left: 60px; right: 60px;
      background: #FEF3C7; border: 4px solid #F59E0B;
      border-radius: 28px; padding: 40px;
      display: flex; align-items: center; gap: 28px;
      box-shadow: 0 12px 35px rgba(245, 158, 11, 0.2);
    }
    .schedule-icon { width: 80px; height: 80px; object-fit: contain; }
    .schedule-title { font-size: 34px; font-weight: 900; color: #92400E; margin-bottom: 8px; }
    .schedule-desc { font-size: 30px; font-weight: 700; color: #78350F; line-height: 1.35; }

    .stickman-container {
      position: absolute; bottom: 220px; left: 0; right: 0;
      display: flex; justify-content: center;
    }
    .stickman-img { height: 320px; object-fit: contain; }

    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A;
      border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
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
    <div class="category-chip">TNPSC நேரலை சவால்</div>
  </div>

  <div class="center-card">
    <div class="cta-header">உங்கள் விடை என்ன?</div>
    <div class="sub-prompt">சரியான விடையை கீழே கமெண்ட் செய்யுங்கள்!</div>
    <div class="options-row">
      <div class="choice-box">A</div>
      <div class="choice-box">B</div>
      <div class="choice-box">C</div>
      <div class="choice-box">D</div>
    </div>
    <div class="arrow-down">👇</div>
  </div>

  <div class="schedule-box">
    ${ideaNoteUri ? `<img src="${ideaNoteUri}" class="schedule-icon" alt="Notes">` : ''}
    <div>
      <div class="schedule-title">📌 சமச்சீர் பாடப்புத்தக குறிப்புகள்</div>
      <div class="schedule-desc">சரியான விடை மற்றும் 4 முக்கியமான தேர்வு குறிப்புகள் ${explanationTimeText} நமது அடுத்த Shorts-ல் வெளியாகும்!</div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 தினமும் 2 வினாடி-வினா பெற Subscribe செய்யுங்கள்!</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

/**
 * Slide 1 (Explanation Mode): The Answer Reveal
 */
function generateAnswerRevealSlideHtml({ quiz, brandLogoDataUri }) {
  const checkCrayonUri = getStickmanAssetDataUri('check-crayon.png');

  const optionsHtml = quiz.options.map(opt => {
    const isCorrect = opt.key === quiz.correctKey;
    const optClass = isCorrect ? 'opt-box opt-correct' : 'opt-box opt-dimmed';
    return `
      <div class="${optClass}">
        <div class="opt-badge">${opt.key}</div>
        <div class="opt-text">${opt.text}</div>
        ${isCorrect && checkCrayonUri ? `<img src="${checkCrayonUri}" class="check-inline" alt="Correct">` : ''}
      </div>
    `;
  }).join('');

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
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF; border: 3px solid #E2E8F0;
      padding: 12px 26px; border-radius: 999px;
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .category-chip {
      background: #059669; color: #FFFFFF;
      font-size: 24px; font-weight: 800; padding: 12px 28px; border-radius: 999px;
    }

    .reveal-badge {
      position: absolute; top: 200px; left: 60px;
      display: inline-flex; align-items: center; gap: 14px;
      background: #ECFDF5; border: 4px solid #10B981;
      color: #065F46; font-size: 34px; font-weight: 900;
      padding: 16px 42px; border-radius: 999px;
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.25);
    }
    .check-icon { width: 44px; height: 44px; object-fit: contain; }

    .question-card {
      position: absolute; top: 310px; left: 60px; right: 60px;
      background: #FFFFFF; border: 4px solid #E2E8F0;
      border-radius: 32px; padding: 48px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
    }
    .question-title { font-size: 44px; font-weight: 900; line-height: 1.4; color: #0F172A; }

    .options-grid {
      position: absolute; top: 760px; left: 60px; right: 60px;
      display: flex; flex-direction: column; gap: 20px;
    }
    .opt-box {
      background: #FFFFFF; border: 3px solid #E2E8F0;
      border-radius: 24px; padding: 24px 32px;
      display: flex; align-items: center; gap: 24px;
    }
    .opt-badge {
      width: 58px; height: 58px; border-radius: 50%;
      background: #EFF6FF; border: 2px solid #BFDBFE;
      display: flex; justify-content: center; align-items: center;
      font-size: 32px; font-weight: 900; color: #2563EB; flex-shrink: 0;
    }
    .opt-text { font-size: 36px; font-weight: 800; color: #1E293B; flex: 1; }
    .check-inline { width: 44px; height: 44px; object-fit: contain; }

    .opt-correct {
      background: #ECFDF5 !important; border: 4px solid #10B981 !important;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3) !important;
      transform: scale(1.02);
    }
    .opt-correct .opt-badge { background: #10B981 !important; color: #FFFFFF !important; border-color: #10B981 !important; }
    .opt-correct .opt-text { color: #065F46 !important; font-weight: 900; }
    .opt-dimmed { opacity: 0.35; background: #F8FAFC !important; }

    .next-box {
      position: absolute; bottom: 180px; left: 60px; right: 60px;
      background: #EFF6FF; border: 3px solid #93C5FD;
      border-radius: 24px; padding: 28px 36px;
      font-size: 30px; font-weight: 800; color: #1E40AF; text-align: center;
    }

    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A; border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
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
    <div class="category-chip">சமச்சீர் விடைக்குறிப்பு</div>
  </div>

  <div class="reveal-badge">
    ${checkCrayonUri ? `<img src="${checkCrayonUri}" class="check-icon" alt="Correct">` : ''}
    <span>சரியான விடை: ஆப்ஷன் ${quiz.correctKey}</span>
  </div>

  <div class="question-card">
    <div class="question-title">${quiz.questionTa}</div>
  </div>

  <div class="options-grid">
    ${optionsHtml}
  </div>

  <div class="next-box">
    👉 விரிவான சமச்சீர் குறிப்புகள் அடுத்த பகுதியில்...
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 அடுத்த கேள்விக்கு இப்போதே சப்ஸ்கிரைப் செய்யுங்கள்!</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

/**
 * Slide 2 (Explanation Mode): Deep Samacheer Masterclass (Who, When, Which Book, PYQ Reference)
 */
function generateMasterclassNotesSlideHtml({ quiz, brandLogoDataUri }) {
  const targetCrayonUri = getStickmanAssetDataUri('target-crayon.png');
  const bookCrayonUri = getStickmanAssetDataUri('book-study-crayon.png');
  const ideaBulbUri = getStickmanAssetDataUri('idea-bulb-crayon.png');

  const vData = quiz.verifiedData || {
    who: 'வரலாற்றுத் தலைவர் & சமச்சீர் கல்வி',
    when: 'தேர்வுக்கான முக்கியக் காலம்',
    whichBook: 'சமச்சீர் பாடப்புத்தகம்',
    pyqReference: 'டி.என்.பி.எஸ்.சி முக்கிய வினா',
    examPointersTa: [quiz.explanationTa]
  };

  const pointersHtml = (vData.examPointersTa || []).map(p => `
    <div class="pointer-item">
      <span class="pointer-bullet">⚡</span>
      <span class="pointer-text">${p}</span>
    </div>
  `).join('');

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
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF; border: 3px solid #E2E8F0;
      padding: 12px 26px; border-radius: 999px;
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .subject-pill {
      background: ${quiz.subjectColor || '#2563EB'};
      color: #FFFFFF; font-size: 24px; font-weight: 800;
      padding: 12px 28px; border-radius: 999px;
    }

    .header-box {
      position: absolute; top: 190px; left: 60px; right: 60px;
      background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
      color: #FFFFFF; border-radius: 28px; padding: 28px 36px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 10px 25px rgba(30, 58, 138, 0.25);
    }
    .header-title { font-size: 36px; font-weight: 900; display: flex; align-items: center; gap: 16px; }
    .header-icon { width: 48px; height: 48px; object-fit: contain; }
    .header-sub { font-size: 22px; font-weight: 700; color: #93C5FD; }

    /* 4-Pillar Grid: Who, When, Book, PYQ */
    .pillar-grid {
      position: absolute; top: 320px; left: 60px; right: 60px;
      display: flex; flex-direction: column; gap: 18px;
    }
    .pillar-card {
      background: #FFFFFF; border: 3px solid #E2E8F0;
      border-radius: 24px; padding: 22px 30px;
      display: flex; align-items: center; gap: 24px;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
    }
    .pillar-icon-box {
      width: 68px; height: 68px; border-radius: 20px;
      display: flex; justify-content: center; align-items: center;
      font-size: 34px; flex-shrink: 0;
    }
    .icon-who { background: #EEF2FF; color: #4338CA; border: 2px solid #C7D2FE; }
    .icon-when { background: #FEF3C7; color: #B45309; border: 2px solid #FDE68A; }
    .icon-book { background: #ECFDF5; color: #047857; border: 2px solid #A7F3D0; }
    .icon-pyq { background: #FEE2E2; color: #B91C1C; border: 2px solid #FECACA; }

    .pillar-content { flex: 1; }
    .pillar-label { font-size: 22px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 4px; }
    .pillar-value { font-size: 30px; font-weight: 900; color: #0F172A; line-height: 1.35; }

    /* Exam Pointers Box */
    .pointers-card {
      position: absolute; top: 920px; left: 60px; right: 60px;
      background: #FFFFFF; border: 4px solid #F59E0B;
      border-radius: 28px; padding: 36px 40px;
      box-shadow: 0 15px 35px rgba(245, 158, 11, 0.15);
    }
    .pointers-head {
      font-size: 30px; font-weight: 900; color: #B45309;
      display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
    }
    .bulb-icon { width: 38px; height: 38px; object-fit: contain; }
    .pointer-item {
      display: flex; gap: 16px; margin-bottom: 18px; line-height: 1.45;
    }
    .pointer-bullet { font-size: 26px; color: #D97706; }
    .pointer-text { font-size: 28px; font-weight: 800; color: #1E293B; }

    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A; border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
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
    <div class="subject-pill">${quiz.subjectLabel}</div>
  </div>

  <div class="header-box">
    <div class="header-title">
      ${bookCrayonUri ? `<img src="${bookCrayonUri}" class="header-icon" alt="Book">` : ''}
      <span>தேர்வுக்கான சமச்சீர் குறிப்புகள்</span>
    </div>
    <div class="header-sub">100% Verified Notes</div>
  </div>

  <div class="pillar-grid">
    <div class="pillar-card">
      <div class="pillar-icon-box icon-who">👤</div>
      <div class="pillar-content">
        <div class="pillar-label">யார் (Authority / Figure)</div>
        <div class="pillar-value">${vData.who}</div>
      </div>
    </div>

    <div class="pillar-card">
      <div class="pillar-icon-box icon-when">📅</div>
      <div class="pillar-content">
        <div class="pillar-label">எப்போது (Year / Date)</div>
        <div class="pillar-value">${vData.when}</div>
      </div>
    </div>

    <div class="pillar-card">
      <div class="pillar-icon-box icon-book">📚</div>
      <div class="pillar-content">
        <div class="pillar-label">எந்த சமச்சீர் புத்தகம் (Book Reference)</div>
        <div class="pillar-value">${vData.whichBook}</div>
      </div>
    </div>

    <div class="pillar-card">
      <div class="pillar-icon-box icon-pyq">🎯</div>
      <div class="pillar-content">
        <div class="pillar-label">முந்தைய தேர்வு (PYQ Exam)</div>
        <div class="pillar-value">${vData.pyqReference}</div>
      </div>
    </div>
  </div>

  <div class="pointers-card">
    <div class="pointers-head">
      ${ideaBulbUri ? `<img src="${ideaBulbUri}" class="bulb-icon" alt="Bulb">` : ''}
      <span>நினைவில் கொள்ள வேண்டிய முக்கிய தகவல்கள்:</span>
    </div>
    ${pointersHtml}
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 அடுத்த One-Mark கேள்விக்கு சப்ஸ்கிரைப் பண்ணுங்க!</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

// --- MAIN RUNNER ---
async function main() {
  console.log('====================================================');
  console.log('VizhiTN "One-Mark Sure Shot" Dual-Pipeline Shorts Engine');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const modeArg = process.argv.find(a => a.startsWith('--mode='))?.split('=')[1] || 'question';
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1] || 'quiz-morning-q';
  const quizIdArg = process.argv.find(a => a.startsWith('--quiz='))?.split('=')[1];

  const quiz = quizIdArg ? getQuizQuestionById(quizIdArg) : getQuizQuestionForSlot(slotArg);
  if (!quiz) {
    throw new Error(`Quiz question not found for slot "${slotArg}"`);
  }

  console.log(`[QUIZ MODE] Running in "${modeArg.toUpperCase()}" mode for slot "${slotArg}"`);
  console.log(`[QUIZ TARGET] "${quiz.questionTa}" (${quiz.id})`);
  console.log(`[CORRECT KEY] Option ${quiz.correctKey}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/quiz_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();
  const vData = quiz.verifiedData || {
    who: 'வரலாற்றுத் தலைவர் & சமச்சீர் கல்வி',
    when: 'தேர்வுக்கான முக்கியக் காலம்',
    whichBook: 'சமச்சீர் பாடப்புத்தகம்',
    pyqReference: 'டி.என்.பி.எஸ்.சி முக்கிய வினா',
    examPointersTa: [quiz.explanationTa]
  };

  const isMorning = slotArg.includes('morning');
  const explanationTimeText = isMorning ? 'காலை 10:30 மணிக்கு' : 'இரவு 9:00 மணிக்கு';

  let scenes = [];
  let videoTitle = '';
  let videoDescription = '';
  let videoTags = [];
  let pinnedCommentText = '';

  if (modeArg === 'question') {
    // ══════════════════════════════════════════════════════════
    // MODE 1: THE HIGH-ENGAGEMENT QUESTION SHORT (NO REVEAL!)
    // ══════════════════════════════════════════════════════════
    console.log('[MODE: QUESTION] Building interactive question challenge...');

    // Scene 1: Hook + Question + 5s Timer
    const s1Spoken = `டி.என்.பி.எஸ்.சி தேர்வில் 90% பேர் தவறாக விடையளிக்கும் முக்கியமான ஒரு மதிப்பெண் கேள்வி இது! கேள்வி: ${quiz.questionTa}. ஆப்ஷன் A: ${quiz.options[0].text}, ஆப்ஷன் B: ${quiz.options[1].text}, ஆப்ஷன் C: ${quiz.options[2].text}, ஆப்ஷன் D: ${quiz.options[3].text}. உங்கள் நேரம் தொடங்குகிறது!`;
    const s1AudioPath = path.join(sessionDir, 'q_audio_1.mp3');
    await synthesizeSpeech(s1Spoken, s1AudioPath);
    const s1Dur = getAudioDuration(s1AudioPath);

    const s1Html = generateQuestionSlideHtml({ quiz, brandLogoDataUri });
    const s1Path = path.join(sessionDir, 'q_slide_1.png');
    renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

    // Scene 2: Challenge Card & Call-To-Action (NO ANSWER REVEALED!)
    const s2Spoken = `உங்க விடை என்ன? ஆப்ஷன் A, B, C அல்லது D-யா? உடனே கீழே கமெண்ட் பண்ணுங்க! இதற்கான சரியான விடை மற்றும் சமச்சீர் பாடப்புத்தக ஆதாரக் குறிப்புகள் ${explanationTimeText} நமது அடுத்த Shorts-ல் வெளியாகும்! அடுத்த கேள்வியை தவறவிடாமல் இருக்க VizhiTN-ஐ இப்போதே சப்ஸ்கிரைப் பண்ணுங்க!`;
    const s2AudioPath = path.join(sessionDir, 'q_audio_2.mp3');
    await synthesizeSpeech(s2Spoken, s2AudioPath);
    const s2Dur = getAudioDuration(s2AudioPath);

    const s2Html = generateChallengeSlideHtml({ quiz, brandLogoDataUri, explanationTimeText });
    const s2Path = path.join(sessionDir, 'q_slide_2.png');
    renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

    scenes = [
      { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: Math.ceil(s1Dur) + 1 },
      { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: Math.ceil(s2Dur) + 1 }
    ];

    videoTitle = `TNPSC One-Mark Sure Shot: ${quiz.questionTa.slice(0, 42)}... | Group 4 & 2 #Shorts`;
    videoDescription = `TNPSC One-Mark Sure Shot Series | சமச்சீர் கல்வி வினா-விடை\n\n🎯 கேள்வி:\n${quiz.questionTa}\n\n💡 உங்கள் விடை என்ன? ஆப்ஷன் A, B, C அல்லது D? உடனே கமெண்ட் செய்யுங்கள்! 👇\n\n📌 இந்த கேள்விக்கான சரியான விடை மற்றும் சமச்சீர் குறிப்புகள் ${explanationTimeText} நமது அடுத்த Shorts-ல் வெளியாகும்!\n\n#TNPSC #TNPSCGroup4 #TNPSCGroup2 #PoliceSI #SamacheerKalvi #TamilNaduGK #Shorts #ShortsFeed #VizhiTN`;
    videoTags = ['TNPSC Quiz', 'One Mark Sure Shot', 'TNPSC Group 4', 'Police SI Exam', 'Samacheer Kalvi', 'Shorts', 'Tamil Nadu GK'];
    pinnedCommentText = `💡 உங்கள் விடை என்ன? ஆப்ஷன் A, B, C அல்லது D? உடனே கீழே கமெண்ட் செய்யுங்கள்! 👇\n\n📌 சரியான விடை மற்றும் விரிவான சமச்சீர் புத்தகக் குறிப்புகள் ${explanationTimeText} நமது அடுத்த Shorts-ல் வெளியாகும்!\n🔔 தொடர்ந்து பயிற்சி பெற VizhiTN சேனலை Subscribe செய்யுங்கள்!`;

  } else {
    // ══════════════════════════════════════════════════════════
    // MODE 2: THE DEEP SAMACHEER MASTERCLASS EXPLANATION SHORT
    // ══════════════════════════════════════════════════════════
    console.log('[MODE: EXPLANATION] Building verified deep Samacheer explanation masterclass...');

    const correctOption = quiz.options.find(o => o.key === quiz.correctKey);

    // Scene 1: The Answer Reveal
    const s1Spoken = `நமது முந்தைய கேள்விக்கான சரியான விடை: ஆப்ஷன் ${quiz.correctKey}, ${correctOption.text}! இப்போது தேர்வுக்கு அவசியமான சமச்சீர் பாடக்குறிப்புகளைப் பார்ப்போம்.`;
    const s1AudioPath = path.join(sessionDir, 'exp_audio_1.mp3');
    await synthesizeSpeech(s1Spoken, s1AudioPath);
    const s1Dur = getAudioDuration(s1AudioPath);

    const s1Html = generateAnswerRevealSlideHtml({ quiz, brandLogoDataUri });
    const s1Path = path.join(sessionDir, 'exp_slide_1.png');
    renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

    // Scene 2: Deep 4-Pillar Masterclass Notes
    const s2Spoken = `தேர்வுக்கான முக்கியக் குறிப்புகள்: யார்: ${vData.who}. காலம்: ${vData.when}. சமச்சீர் புத்தக ஆதாரம்: ${vData.whichBook}. முந்தைய தேர்வு: ${vData.pyqReference}. ${vData.examPointersTa[0]}. இந்தத் தகவல்களை உங்கள் குறிப்பேட்டில் குறித்து வைத்துக்கொள்ளுங்கள். அடுத்த One-Mark கேள்விக்கு இப்போதே VizhiTN-ஐ சப்ஸ்கிரைப் பண்ணுங்க!`;
    const s2AudioPath = path.join(sessionDir, 'exp_audio_2.mp3');
    await synthesizeSpeech(s2Spoken, s2AudioPath);
    const s2Dur = getAudioDuration(s2AudioPath);

    const s2Html = generateMasterclassNotesSlideHtml({ quiz, brandLogoDataUri });
    const s2Path = path.join(sessionDir, 'exp_slide_2.png');
    renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

    scenes = [
      { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: Math.ceil(s1Dur) + 1 },
      { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: Math.ceil(s2Dur) + 1 }
    ];

    videoTitle = `TNPSC சமச்சீர் குறிப்புகள்: ${quiz.questionTa.slice(0, 40)}... | விடை & புத்தகம் #Shorts`;
    videoDescription = `TNPSC Samacheer Kalvi Masterclass Notes | 100% Verified Notes\n\n🎯 கேள்வி: ${quiz.questionTa}\n\n✅ சரியான விடை: ஆப்ஷன் ${quiz.correctKey} - ${correctOption.text}\n\n📚 தேர்வுக்கான முக்கியக் குறிப்புகள்:\n• யார்: ${vData.who}\n• காலம்: ${vData.when}\n• புத்தகம்: ${vData.whichBook}\n• முந்தைய தேர்வு (PYQ): ${vData.pyqReference}\n• முக்கிய குறிப்பு: ${vData.examPointersTa.join(' ')}\n\n🔔 அடுத்த One-Mark வினாடி-வினா பெற உடனே Subscribe செய்யுங்கள்!\n\n${(quiz.topTrendingTags || []).join(' ')}`;
    videoTags = quiz.topTrendingTags || ['TNPSC Notes', 'Samacheer Kalvi', 'TNPSC Group 4', 'Police SI', 'Tamil Nadu GK', 'Shorts'];
    pinnedCommentText = `📌 *TNPSC தேர்வுக்கான சமச்சீர் குறிப்புகள்:*\n\n✅ சரியான விடை: ஆப்ஷன் ${quiz.correctKey} - ${correctOption.text}\n• யார்: ${vData.who}\n• காலம்: ${vData.when}\n• புத்தகம்: ${vData.whichBook}\n• முந்தைய தேர்வு (PYQ): ${vData.pyqReference}\n\n👉 இதை உங்கள் நண்பர்களுடன் பகிர்ந்துகொள்ளுங்கள்! அடுத்த கேள்விக்கு Subscribe செய்யுங்கள்! 🔔`;
  }

  const outputVideoPath = path.join(sessionDir, `TNPSC_${modeArg}_${quiz.id}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Warm Light Studio Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[VIDEO OK] Rendered: ${outputVideoPath}`);

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Mode: ${modeArg}`);
    console.log(`Title: ${videoTitle}`);
    console.log(`Pinned Comment Preview:\n${pinnedCommentText}`);
    console.log(`Video File: ${outputVideoPath}`);
    try {
      await crossPostVideoToMetaSocials({
        videoFilePath: outputVideoPath,
        thumbnailFilePath: scenes[0]?.slidePath,
        title: videoTitle,
        caption: videoDescription,
        isReel: true,
        isDryRun: true
      });
    } catch (_) {}
    console.log('[SUCCESS ✓] Pipeline dry-run completed successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: videoTags,
    categoryId: '27',
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[SHORT PUBLISHED ✓] Live: ${res.videoUrl}`);

  if (res.videoId && pinnedCommentText) {
    try {
      console.log('[PINNED COMMENT] Posting pinned comment to YouTube...');
      await postPinnedComment(res.videoId, pinnedCommentText);
      console.log('[PINNED COMMENT ✓] Pinned comment successfully created!');
    } catch (commentErr) {
      console.warn('[PINNED COMMENT WARN] Could not post pinned comment:', commentErr.message);
    }
  }

  // Auto-crosspost to Facebook & Instagram Reels
  try {
    console.log('\n[SOCIAL SYNC] Crossposting Quiz Short to Facebook & Instagram Reels...');
    await crossPostVideoToMetaSocials({
      videoFilePath: outputVideoPath,
      thumbnailFilePath: scenes[0]?.slidePath,
      title: videoTitle,
      caption: videoDescription,
      isReel: true,
      isDryRun: false
    });
    console.log('[SOCIAL SYNC ✓] Meta Reels crosspost complete!');
  } catch (metaErr) {
    console.warn('[SOCIAL SYNC WARN] Meta Reels crosspost failed:', metaErr.message);
  }
}

main().catch(err => {
  console.error('[FATAL QUIZ ERROR]:', err);
  process.exit(1);
});
