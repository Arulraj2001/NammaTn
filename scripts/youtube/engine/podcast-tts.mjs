// scripts/youtube/engine/podcast-tts.mjs
// Dual-Voice Neural Speech & Subtitle Engine for Vizhi Uncut Podcast
// Hosts: Karthik (ta-IN-ValluvarNeural) & Kavitha (ta-IN-PallaviNeural)
// Dynamic emotional prosody, micro-chunking, and dual-color kinetic subtitles

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';
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
 * Splits a turn into sentence clauses to prevent WebSocket packet dropouts on long texts
 */
function splitTurnIntoSentenceClauses(text) {
  if (!text) return [];
  const sentences = text
    .split(/(?<=[.!?;\u0964])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const result = [];
  for (const s of sentences) {
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length > 18) {
      const sub = s.split(/(?<=[,])\s+/).map(x => x.trim()).filter(Boolean);
      result.push(...sub);
    } else {
      result.push(s);
    }
  }
  return result.length > 0 ? result : [text];
}

/**
 * Synthesizes a single clause using Python edge-tts CLI
 */
function synthesizeSingleClause(clause, destPath, voice, rate, pitch, timeout = 35000) {
  const python = getPythonBinary();
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tempTextFile = path.join(dir, `_temp_c_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`);
  fs.writeFileSync(tempTextFile, clause, 'utf-8');

  try {
    const args = [
      '-m', 'edge_tts',
      '--voice', voice,
      '--rate', rate,
      '--pitch', pitch,
      '--file', tempTextFile,
      '--write-media', destPath
    ];
    execFileSync(python, args, { stdio: 'pipe', timeout, windowsHide: true });
    return fs.existsSync(destPath) && fs.statSync(destPath).size > 500;
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }
}

/**
 * Synthesizes a dialogue turn with progressive voice fallbacks, clause chunking, and exponential backoff
 */
function synthesizeTurnAudio(text, outputPath, speaker = 'karthik', emotion = 'default') {
  const ffmpeg = getFfmpegBinaryPath();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const config = VOICE_PROSODY[speaker] || VOICE_PROSODY.karthik;
  const prosody = config.emotions[emotion] || config.emotions.default;
  const primaryVoice = config.voice;
  const fallbackVoice = speaker === 'karthik' ? 'ta-IN-PallaviNeural' : 'ta-IN-ValluvarNeural';

  const clauses = splitTurnIntoSentenceClauses(text);

  // Progressive fallback attempts
  const attempts = [
    { voice: primaryVoice, rate: prosody.rate, pitch: prosody.pitch, delayMs: 0 },
    { voice: primaryVoice, rate: prosody.rate, pitch: '+0Hz', delayMs: 2000 },
    { voice: primaryVoice, rate: '+0%', pitch: '+0Hz', delayMs: 3500 },
    { voice: fallbackVoice, rate: '+0%', pitch: '+0Hz', delayMs: 5000 }
  ];

  for (let attIdx = 0; attIdx < attempts.length; attIdx++) {
    const att = attempts[attIdx];
    if (att.delayMs > 0) {
      console.log(`[PODCAST TTS COOL-DOWN] Pausing ${att.delayMs}ms before attempt ${attIdx + 1}/${attempts.length}...`);
      try { execSync(`node -e "setTimeout(()=>{}, ${att.delayMs})"`, { stdio: 'ignore' }); } catch (_) {}
    }

    const chunkPaths = [];
    let allChunksSuccess = true;

    for (let cIdx = 0; cIdx < clauses.length; cIdx++) {
      const clause = clauses[cIdx];
      const chunkFile = path.join(dir, `_turn_chk_${Date.now()}_${attIdx}_${cIdx}.mp3`);
      chunkPaths.push(chunkFile);

      try {
        const ok = synthesizeSingleClause(clause, chunkFile, att.voice, att.rate, att.pitch);
        if (!ok) {
          allChunksSuccess = false;
          break;
        }
      } catch (err) {
        console.warn(`[PODCAST TTS WARN] Clause ${cIdx + 1}/${clauses.length} failed with ${att.voice}: ${err.message.slice(0, 60)}`);
        allChunksSuccess = false;
        break;
      }
    }

    if (allChunksSuccess && chunkPaths.length > 0) {
      try {
        if (chunkPaths.length === 1) {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          fs.copyFileSync(chunkPaths[0], outputPath);
        } else {
          // Stitch clauses with FFmpeg concat
          const listFile = path.join(dir, `_concat_${Date.now()}_${attIdx}.txt`);
          fs.writeFileSync(listFile, chunkPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n'), 'utf-8');
          execSync(`"${ffmpeg}" -y -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`, {
            stdio: 'pipe',
            timeout: 30000,
            windowsHide: true
          });
          try { fs.unlinkSync(listFile); } catch (_) {}
        }

        // Cleanup temporary clause files
        for (const cp of chunkPaths) {
          try { if (fs.existsSync(cp)) fs.unlinkSync(cp); } catch (_) {}
        }

        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
          return; // Success!
        }
      } catch (concatErr) {
        console.warn(`[PODCAST TTS CONCAT WARN] Failed to stitch chunks: ${concatErr.message}`);
      }
    }

    // Cleanup failed attempt files
    for (const cp of chunkPaths) {
      try { if (fs.existsSync(cp)) fs.unlinkSync(cp); } catch (_) {}
    }
  }

  throw new Error(`[PODCAST TTS] edge-tts produced no output for turn: "${text.slice(0, 50)}" across all ${attempts.length} fallback attempts.`);
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
  try {
    synthesizeTurnAudio(cleanText, rawAudioPath, speaker, emotion);
  } catch (ttsErr) {
    console.warn(`[PODCAST TTS RESILIENCE] Turn ${turnIndex + 1} synthesis failed after all retries (${ttsErr.message.slice(0, 80)}). Generating atmospheric fallback audio...`);
    execSync(`"${ffmpeg}" -y -f lavfi -i anullsrc=r=24000:cl=mono -t 3.0 -c:a libmp3lame -q:a 2 "${rawAudioPath}"`, {
      stdio: 'pipe',
      timeout: 10000,
      windowsHide: true
    });
  }

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

  // High-reliability clause chunking for subtitles
  const chunks = chunkSentenceForCaptions(cleanText, finalDur, 0, 4);

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
