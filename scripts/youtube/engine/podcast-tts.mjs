// scripts/youtube/engine/podcast-tts.mjs
// Dual-Voice Neural Speech & Subtitle Engine for Vizhi Uncut Podcast
// Hosts: Karthik (ta-IN-ValluvarNeural) & Kavitha (ta-IN-PallaviNeural)
// Dynamic emotional prosody, micro-chunking, and dual-color kinetic subtitles

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { normalizeAcronymsToSpokenTamil, sanitizeClauseText } from './tamil-phonetics.mjs';
import { getFfmpegBinaryPath, getAudioDuration } from './video-composer.mjs';
import { cleanCaptionText, chunkSentenceForCaptions } from './captions-engine.mjs';

function getPythonBinary() {
  for (const bin of ['python', 'python3']) {
    try {
      const ver = execSync(`${bin} --version`, { stdio: 'pipe', timeout: 5000 }).toString().trim();
      if (ver.startsWith('Python')) return bin;
    } catch {}
  }
  throw new Error('Python not found — required for edge-tts TTS synthesis.');
}

const VOICE_PROSODY = {
  karthik: {
    voice: 'ta-IN-ValluvarNeural',
    emotions: {
      shock: { rate: '+5%', pitch: '+1Hz' },
      curious: { rate: '+3%', pitch: '+0Hz' },
      skeptical: { rate: '+2%', pitch: '-1Hz' },
      empowering: { rate: '+1%', pitch: '-1Hz' },
      default: { rate: '+2%', pitch: '+0Hz' }
    }
  },
  kavitha: {
    voice: 'ta-IN-PallaviNeural',
    emotions: {
      revealing: { rate: '+3%', pitch: '+0Hz' },
      explaining: { rate: '+1%', pitch: '+0Hz' },
      serious: { rate: '-3%', pitch: '-2Hz' },
      empowering: { rate: '+2%', pitch: '-1Hz' },
      default: { rate: '+1%', pitch: '+0Hz' }
    }
  }
};

/**
 * Synthesizes a single dialogue turn using edge-tts
 */
function synthesizeTurnAudio(text, outputPath, speaker = 'karthik', emotion = 'default') {
  const python = getPythonBinary();
  const config = VOICE_PROSODY[speaker] || VOICE_PROSODY.karthik;
  const prosody = config.emotions[emotion] || config.emotions.default;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const safeText = text.replace(/'/g, "\\'");
  const cmd = `${python} -m edge_tts --voice "${config.voice}" --rate="${prosody.rate}" --pitch="${prosody.pitch}" --text '${safeText}' --write-media "${outputPath.replace(/\\/g, '/')}"`;

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 45000, windowsHide: true });
  } catch {
    const safeTextDq = text.replace(/"/g, '\\"');
    const cmdDq = `${python} -m edge_tts --voice "${config.voice}" --rate="${prosody.rate}" --pitch="${prosody.pitch}" --text "${safeTextDq}" --write-media "${outputPath.replace(/\\/g, '/')}"`;
    execSync(cmdDq, { stdio: 'pipe', timeout: 45000, windowsHide: true });
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error(`[PODCAST TTS] edge-tts produced no output for turn: ${text.slice(0, 40)}`);
  }
}

/**
 * Formats seconds into ASS timestamp: H:MM:SS.cc
 */
function formatAssTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

/**
 * Synthesizes all dialogue turns for a single Act and stitches them together
 * Returns Act audio path, total duration, ASS subtitle path, and turn timings
 *
 * @param {Array} turns - Dialogue turns for this act
 * @param {string} actOutputDir - Output directory for temporary files
 * @param {number} actNum - Act number (1 to 5)
 * @returns {Promise<Object>}
 */
export async function synthesizeActAudioAndSubtitles(turns, actOutputDir, actNum) {
  if (!fs.existsSync(actOutputDir)) fs.mkdirSync(actOutputDir, { recursive: true });

  const ffmpeg = getFfmpegBinaryPath();
  const turnFiles = [];
  const turnTimings = [];
  let currentTime = 0;

  console.log(`[PODCAST TTS] Synthesizing Act ${actNum} (${turns.length} turns)...`);

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const speaker = (turn.speaker || 'karthik').toLowerCase();
    const emotion = turn.emotion || 'default';
    const rawText = turn.text || '';
    const cleanText = sanitizeClauseText(normalizeAcronymsToSpokenTamil(rawText));

    const turnAudioPath = path.join(actOutputDir, `act_${actNum}_turn_${i}_${Date.now()}.mp3`);
    synthesizeTurnAudio(cleanText, turnAudioPath, speaker, emotion);

    const dur = getAudioDuration(turnAudioPath);
    turnFiles.push(turnAudioPath);

    turnTimings.push({
      turnIndex: i,
      speaker,
      emotion,
      text: cleanText,
      startSec: currentTime,
      endSec: currentTime + dur,
      durationSec: dur,
      audioPath: turnAudioPath
    });

    currentTime += dur;
  }

  // 1. Stitch turn audios together using FFmpeg concat
  const actAudioPath = path.join(actOutputDir, `podcast_act_${actNum}_audio_${Date.now()}.mp3`);
  const concatListPath = path.join(actOutputDir, `concat_act_${actNum}_${Date.now()}.txt`);

  const concatContent = turnFiles
    .map(f => `file '${f.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`)
    .join('\n');
  fs.writeFileSync(concatListPath, concatContent, 'utf-8');

  try {
    execSync(`"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${actAudioPath}"`, {
      stdio: 'pipe',
      timeout: 60000,
      windowsHide: true
    });
  } catch (err) {
    // Re-encode fallback if stream copy fails
    execSync(`"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c:a libmp3lame -q:a 2 "${actAudioPath}"`, {
      stdio: 'pipe',
      timeout: 60000,
      windowsHide: true
    });
  }

  const actTotalDuration = getAudioDuration(actAudioPath);

  // 2. Generate Dual-Color ASS Subtitles for this Act
  const actSubPath = path.join(actOutputDir, `podcast_act_${actNum}_sub_${Date.now()}.ass`);
  let dialogEvents = '';

  for (const t of turnTimings) {
    const isKarthik = t.speaker === 'karthik';
    const speakerLabel = isKarthik ? 'கார்த்திக்' : 'கவிதா';
    // Style: Karthik = Electric Cyan (&H00FFFF00&), Kavitha = Golden Yellow (&H0015CCFA&)
    const primaryColorCode = isKarthik ? '\\c&H00FFFF00&' : '\\c&H0015CCFA&';

    // Break turn into punchy kinetic sub-chunks
    const chunks = chunkSentenceForCaptions(t.text, t.durationSec, t.startSec);

    for (const chunk of chunks) {
      const startStr = formatAssTime(chunk.start);
      const endStr = formatAssTime(chunk.end);
      const words = chunk.text.split(/\s+/).filter(Boolean);

      let styledChunkText = '';
      if (words.length > 1) {
        const firstWord = words[0];
        const rest = words.slice(1).join(' ');
        styledChunkText = `{\\b1}${speakerLabel}: {\\b0}{${primaryColorCode}}${firstWord} {\\c&H00FFFFFF&}${rest}`;
      } else {
        styledChunkText = `{\\b1}${speakerLabel}: {\\b0}{${primaryColorCode}}${chunk.text}`;
      }

      dialogEvents += `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${styledChunkText}\n`;
    }
  }

  const assContent = `[Script Info]
Title: Vizhi Uncut Podcast Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Nirmala UI,36,&H00FFFFFF,&H0000FFFF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,1,4.0,2.0,2,40,40,140,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${dialogEvents}
`;

  fs.writeFileSync(actSubPath, assContent, 'utf-8');

  // Cleanup turn files and concat list
  try {
    fs.unlinkSync(concatListPath);
    for (const tf of turnFiles) {
      if (fs.existsSync(tf)) fs.unlinkSync(tf);
    }
  } catch {}

  return {
    actNum,
    audioPath: actAudioPath,
    durationSec: actTotalDuration,
    subPath: actSubPath,
    turnTimings
  };
}
