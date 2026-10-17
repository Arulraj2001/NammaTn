// scripts/youtube/engine/podcast-tts.mjs
// Dual-Voice Neural Speech & Subtitle Engine for Vizhi Uncut Podcast
// Hosts: Karthik (ta-IN-ValluvarNeural) & Kavitha (ta-IN-PallaviNeural)
// Dynamic emotional prosody, micro-chunking, and dual-color kinetic subtitles

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { normalizeAcronymsToSpokenTamil, sanitizeClauseText } from './tamil-phonetics.mjs';
import { getFfmpegBinaryPath, getAudioDuration } from './video-composer.mjs';
import { cleanCaptionText, chunkSentenceForCaptions, parseVttTiming, generateCaptionsFromTimedSegments } from './captions-engine.mjs';

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
 * Synthesizes a single dialogue turn using edge-tts with optional VTT subtitle output
 */
function synthesizeTurnAudio(text, outputPath, vttPath = null, speaker = 'karthik', emotion = 'default') {
  const python = getPythonBinary();
  const config = VOICE_PROSODY[speaker] || VOICE_PROSODY.karthik;
  const prosody = config.emotions[emotion] || config.emotions.default;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const safeText = text.replace(/'/g, "\\'");
  const vttArg = vttPath ? ` --write-subtitles "${vttPath.replace(/\\/g, '/')}"` : '';
  const cmd = `${python} -m edge_tts --voice "${config.voice}" --rate="${prosody.rate}" --pitch="${prosody.pitch}" --text '${safeText}' --write-media "${outputPath.replace(/\\/g, '/')}"${vttArg}`;

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 45000, windowsHide: true });
  } catch {
    const safeTextDq = text.replace(/"/g, '\\"');
    const cmdDq = `${python} -m edge_tts --voice "${config.voice}" --rate="${prosody.rate}" --pitch="${prosody.pitch}" --text "${safeTextDq}" --write-media "${outputPath.replace(/\\/g, '/')}"${vttArg}`;
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
 * Synthesizes a single dialogue turn with 30ms micro-fading and locked ASS subtitles
 * @param {Object} params
 * @param {Object} params.turn - { speaker, emotion, text }
 * @param {number} params.actNum
 * @param {number} params.turnIndex
 * @param {string} params.outputDir
 * @returns {Promise<Object>} { speaker, emotion, text, audioPath, durationSec, subPath }
 */
export async function synthesizePodcastTurn({ turn, actNum, turnIndex, outputDir }) {
  const ffmpeg = getFfmpegBinaryPath();
  const speaker = (turn.speaker || 'karthik').toLowerCase();
  const emotion = turn.emotion || 'default';
  const rawText = turn.text || '';
  const cleanText = sanitizeClauseText(normalizeAcronymsToSpokenTamil(rawText));

  const rawAudioPath = path.join(outputDir, `turn_raw_${actNum}_${turnIndex}_${Date.now()}.mp3`);
  const vttPath = path.join(outputDir, `turn_vtt_${actNum}_${turnIndex}_${Date.now()}.vtt`);
  synthesizeTurnAudio(cleanText, rawAudioPath, vttPath, speaker, emotion);

  const rawDur = getAudioDuration(rawAudioPath);

  // Apply 30ms micro-fade-in and micro-fade-out to eliminate any click/pop tail
  const fadedAudioPath = path.join(outputDir, `turn_faded_${actNum}_${turnIndex}_${Date.now()}.mp3`);
  const fadeOutStart = Math.max(0, rawDur - 0.04);
  const fadeFilter = `afade=t=in:ss=0:d=0.03,afade=t=out:st=${fadeOutStart}:d=0.03`;

  try {
    execSync(`"${ffmpeg}" -y -i "${rawAudioPath}" -af "${fadeFilter}" -c:a libmp3lame -q:a 2 "${fadedAudioPath}"`, {
      stdio: 'pipe',
      timeout: 30000,
      windowsHide: true
    });
  } catch {
    // Fallback to raw if afade fails
    fs.copyFileSync(rawAudioPath, fadedAudioPath);
  }

  const finalDur = getAudioDuration(fadedAudioPath);

  // Generate turn-locked ASS subtitle file with neural speech boundaries
  const subPath = path.join(outputDir, `turn_sub_${actNum}_${turnIndex}_${Date.now()}.ass`);
  const isKarthik = speaker === 'karthik';
  const speakerLabel = isKarthik ? 'கார்த்திக்' : 'கவிதா';
  const primaryColorCode = isKarthik ? '\\c&H00FFFF00&' : '\\c&H0015CCFA&';

  // Read real VTT timing if available
  let chunks = [];
  if (fs.existsSync(vttPath)) {
    try {
      const vttContent = fs.readFileSync(vttPath, 'utf-8');
      const vttSegs = parseVttTiming(vttContent);
      if (vttSegs.length > 0) {
        chunks = generateCaptionsFromTimedSegments(vttSegs, '16:9');
      }
    } catch (_) {}
    try { fs.unlinkSync(vttPath); } catch (_) {}
  }

  // Fallback to clause chunking
  if (!chunks || chunks.length === 0) {
    chunks = chunkSentenceForCaptions(cleanText, finalDur, 0, 4);
  }

  let dialogEvents = '';

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

  const assContent = `[Script Info]
Title: Vizhi Uncut Turn Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans Tamil,35,&H00FFFFFF,&H0000FFFF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,1,3.5,2.0,2,35,35,135,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${dialogEvents}
`;

  fs.writeFileSync(subPath, assContent, 'utf-8');

  // Clean raw audio
  try { if (fs.existsSync(rawAudioPath)) fs.unlinkSync(rawAudioPath); } catch {}

  return {
    actNum,
    turnIndex,
    speaker,
    emotion,
    text: cleanText,
    audioPath: fadedAudioPath,
    durationSec: finalDur,
    subPath
  };
}
