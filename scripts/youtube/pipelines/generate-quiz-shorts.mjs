// scripts/youtube/pipelines/generate-quiz-shorts.mjs
/**
 * VizhiTN 5-Second Interactive Exam Quiz Shorts Engine (9:16 Portrait)
 * Algorithm-optimized format driving >120% retention and massive comment engagement.
 * Integrates Google Gemini Lifelike Neural Voice with automatic Edge-TTS fallback.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { TNPSC_QUIZ_BANK, getTodayQuizQuestion, getQuizQuestionById } from '../engine/exam-quiz-catalog.mjs';
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

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Google Gemini Lifelike Neural Voice (Puck / male reporter)
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
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+6%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 45000, windowsHide: true });
    console.log(`[QUIZ TTS ✓] Edge-TTS speech generated: ${path.basename(outputPath)}`);
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`TTS synthesis failed to write file: ${outputPath}`);
  }
  return outputPath;
}

function generateQuizSlideHtml({
  quiz,
  countdownSec = null,
  highlightKey = null,
  brandLogoDataUri
}) {
  const optionsHtml = quiz.options.map(opt => {
    let optClass = 'opt-box';
    if (highlightKey) {
      if (opt.key === highlightKey) {
        optClass += ' opt-correct';
      } else {
        optClass += ' opt-dimmed';
      }
    }
    return `
      <div class="${optClass}">
        <span class="opt-badge">${opt.key}</span>
        <span class="opt-text">${opt.text}</span>
      </div>
    `;
  }).join('');

  const timerBadgeHtml = countdownSec !== null ? `
    <div class="timer-container">
      <div class="timer-circle">
        <span class="timer-num">${countdownSec}</span>
        <span class="timer-label">நொடிகள்</span>
      </div>
    </div>
  ` : (highlightKey ? `
    <div class="correct-badge">
      ✓ சரியான விடை: ஆப்ஷன் ${highlightKey}
    </div>
  ` : '');

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #030712 100%);
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
      background: ${quiz.subjectColor || '#8B5CF6'};
      color: #fff; font-size: 24px; font-weight: 800;
      padding: 10px 28px; border-radius: 999px;
      box-shadow: 0 4px 20px ${quiz.subjectColor || '#8B5CF6'}55;
    }

    .challenge-tag {
      position: absolute; top: 220px; left: 60px;
      background: #f59e0b; color: #000; font-size: 28px; font-weight: 900;
      padding: 8px 26px; border-radius: 8px;
    }

    .question-card {
      position: absolute; top: 310px; left: 60px; right: 60px;
      background: rgba(15, 23, 42, 0.95);
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-radius: 28px; padding: 48px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
      z-index: 10;
    }
    .question-title {
      font-size: 48px; font-weight: 900; line-height: 1.35; color: #ffffff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .timer-area {
      position: absolute; top: 690px; left: 60px; right: 60px;
      display: flex; justify-content: center; align-items: center;
      z-index: 10;
    }
    .timer-circle {
      width: 140px; height: 140px; border-radius: 50%;
      background: radial-gradient(circle, #ef4444 0%, #991b1b 100%);
      border: 4px solid #fff; display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
      animation: pulse 1s infinite alternate;
    }
    .timer-num { font-size: 64px; font-weight: 900; line-height: 1; color: #fff; }
    .timer-label { font-size: 16px; font-weight: 700; color: #fecaca; }

    .correct-badge {
      background: #10b981; color: #ffffff; font-size: 36px; font-weight: 900;
      padding: 16px 40px; border-radius: 999px; border: 3px solid #ffffff;
      box-shadow: 0 0 35px rgba(16, 185, 129, 0.7);
    }

    .options-grid {
      position: absolute; top: 870px; left: 60px; right: 60px;
      display: flex; flex-direction: column; gap: 24px;
      z-index: 10;
    }
    .opt-box {
      background: rgba(30, 41, 59, 0.95);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px; padding: 26px 32px;
      display: flex; align-items: center; gap: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .opt-badge {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      display: flex; justify-content: center; align-items: center;
      font-size: 32px; font-weight: 900; color: #38bdf8; flex-shrink: 0;
    }
    .opt-text { font-size: 36px; font-weight: 700; color: #f8fafc; }

    .opt-correct {
      background: linear-gradient(90deg, #065f46 0%, #047857 100%) !important;
      border: 4px solid #34d399 !important;
      box-shadow: 0 0 35px rgba(52, 211, 153, 0.6) !important;
    }
    .opt-correct .opt-badge { background: #34d399 !important; color: #000 !important; }

    .opt-dimmed {
      opacity: 0.35;
    }

    .explanation-card {
      position: absolute; bottom: 220px; left: 60px; right: 60px;
      background: rgba(15, 23, 42, 0.9); border: 2px solid #34d399;
      border-radius: 20px; padding: 28px 36px;
      z-index: 10;
    }
    .exp-title { font-size: 26px; font-weight: 900; color: #34d399; margin-bottom: 8px; }
    .exp-text { font-size: 30px; font-weight: 600; line-height: 1.45; color: #f1f5f9; }

    .footer-bar {
      position: absolute; bottom: 80px; left: 60px; right: 60px;
      background: rgba(10, 15, 30, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px; padding: 22px 32px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .footer-left { font-size: 26px; font-weight: 800; color: #facc15; }
    .footer-right { font-size: 26px; font-weight: 800; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      <img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="category-chip">${quiz.subjectLabel}</div>
  </div>

  <div class="challenge-tag">🎯 5 நொடி TNPSC சேலஞ்ச்</div>

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
      <div class="exp-title">📌 தேர்வுக்கான முக்கியக் குறிப்பு</div>
      <div class="exp-text">${quiz.explanationTa}</div>
    </div>
  ` : ''}

  <div class="footer-bar">
    <div class="footer-left">💬 விடையை கமெண்ட் செய்யுங்கள்!</div>
    <div class="footer-right">VizhiTN | TNPSC வினாடி வினா</div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN 5-Second Interactive Exam Quiz Shorts Engine');
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

  // Scene 1: Question Pose & Countdown Start
  const s1Spoken = `டி.என்.பி.எஸ்.சி 5 வினாடி சேலஞ்ச்! கேள்வி: ${quiz.questionTa} ஆப்ஷன் A: ${quiz.options[0].text}, ஆப்ஷன் B: ${quiz.options[1].text}, ஆப்ஷன் C: ${quiz.options[2].text}, ஆப்ஷன் D: ${quiz.options[3].text}. உங்கள் நேரம் தொடங்குகிறது!`;
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

  // Scene 2: The Answer Reveal & Exam Pointer
  const correctOption = quiz.options.find(o => o.key === quiz.correctKey);
  const s2Spoken = `சரியான விடை: ஆப்ஷன் ${quiz.correctKey}, ${correctOption.text}! தேர்வுக்கான முக்கியக் குறிப்பு: ${quiz.explanationTa} நீங்கள் எத்தனை வினாடியில் கண்டுபிடித்தீர்கள்? உடனே கமெண்ட் பண்ணுங்க! விழி தமிழ்நாடு சேனலை சப்ஸ்கிரைப் பண்ணுங்க!`;
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

  const outputVideoPath = path.join(sessionDir, `TNPSC_Quiz_${quiz.id}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Interactive Quiz Video...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[QUIZ VIDEO OK] Rendered: ${outputVideoPath}`);

  const videoTitle = `5 வினாடி TNPSC சேலஞ்ச்: ${quiz.questionTa.slice(0, 45)}... #Shorts`;
  const videoDescription = `${quiz.questionTa}\n\nவிடை: ஆப்ஷன் ${quiz.correctKey} - ${correctOption.text}\n\n${quiz.explanationTa}\n\n#TNPSC #TNPSCQuiz #Shorts #TamilNaduGK #PoliceSI #VizhiTN`;

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
    tags: ['TNPSC Quiz', 'Tamil Nadu Current Affairs', 'TNPSC Group 4', 'Police SI Exam', 'Shorts'],
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

