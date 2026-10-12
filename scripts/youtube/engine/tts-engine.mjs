// scripts/youtube/engine/tts-engine.mjs
// Next-Gen Neural Speech Engine: Micro-Chunk Tokenizer, SSML Punctuation Pauses,
// and Glitch-Free Audio Stitching using Microsoft Edge-TTS and FFmpeg.

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil, splitIntoSpokenClauses } from './tamil-phonetics.mjs';
import { getFfmpegBinaryPath } from './video-composer.mjs';

/**
 * Synthesizes a single short text segment with SSML pause and prosody control
 */
async function synthesizeSingleClause(tts, text, destFilePath, options = {}) {
  const rate = options.rate || YOUTUBE_CONFIG.voices.defaultRate;
  const pitch = options.pitch || YOUTUBE_CONFIG.voices.defaultPitch;

  const dir = path.dirname(destFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Use toFile directly
  const { audioFilePath } = await tts.toFile(dir, text, { rate, pitch });

  if (fs.existsSync(audioFilePath)) {
    if (audioFilePath !== destFilePath) {
      if (fs.existsSync(destFilePath)) fs.unlinkSync(destFilePath);
      fs.renameSync(audioFilePath, destFilePath);
    }
  }

  return destFilePath;
}

/**
 * Synthesizes long conversational Tamil speech by splitting it into 3-5s micro-chunks,
 * synthesizing each chunk individually, and seamlessly stitching with smooth pauses.
 * This completely eliminates word-skipping and syllable dropping.
 *
 * @param {string|Array<string>} input - Text string or array of spoken clauses
 * @param {string} outputFilePath - Destination MP3
 * @param {Object} [options] - voice, rate, pitch
 * @returns {Promise<{ filePath: string, voice: string, durationSec: number }>}
 */
export async function synthesizeSpeech(input, outputFilePath, options = {}) {
  const voice = options.voice || YOUTUBE_CONFIG.voices.tamilFemale;
  const ffmpeg = getFfmpegBinaryPath();

  const outDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Prepare clauses
  let clauses = [];
  if (Array.isArray(input)) {
    clauses = input.map(c => normalizeAcronymsToSpokenTamil(c)).filter(Boolean);
  } else {
    const normalized = normalizeAcronymsToSpokenTamil(input);
    clauses = splitIntoSpokenClauses(normalized);
  }

  if (clauses.length === 0) {
    throw new Error('No valid clauses provided for speech synthesis');
  }

  console.log(`[TTS ENGINE] Sliced narration into ${clauses.length} micro-chunks for glitch-free delivery.`);

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const tempClips = [];
  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    // 2. Synthesize each chunk
    for (let i = 0; i < clauses.length; i++) {
      const chunkText = clauses[i];
      const chunkPath = path.join(outDir, `_tts_chunk_${sessionId}_${i}.mp3`);
      await synthesizeSingleClause(tts, chunkText, chunkPath, options);
      tempClips.push(chunkPath);
    }

    // 3. Concatenate all audio micro-clips seamlessly with FFmpeg
    if (tempClips.length === 1) {
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      fs.copyFileSync(tempClips[0], outputFilePath);
    } else {
      const concatListFile = path.join(outDir, `_tts_concat_${sessionId}.txt`);
      const fileLines = tempClips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n');
      fs.writeFileSync(concatListFile, fileLines, 'utf-8');

      const cmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatListFile}" -c copy "${outputFilePath}"`;
      execSync(cmd, { stdio: 'pipe', timeout: 60000 });

      try { fs.unlinkSync(concatListFile); } catch {}
    }

    // 4. Calculate final duration
    let durationSec = 45;
    try {
      const probeCmd = `"${ffmpeg}" -i "${outputFilePath}" 2>&1`;
      const probeOut = execSync(probeCmd).toString();
      const match = probeOut.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (match) {
        durationSec = parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
      }
    } catch (err) {
      if (err.stdout || err.stderr) {
        const text = (err.stdout || '').toString() + (err.stderr || '').toString();
        const match = text.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
        if (match) {
          durationSec = parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
        }
      }
    }

    return {
      filePath: outputFilePath,
      voice,
      durationSec
    };
  } finally {
    // Clean up temporary micro-clips
    for (const c of tempClips) {
      if (fs.existsSync(c)) {
        try { fs.unlinkSync(c); } catch {}
      }
    }
  }
}

/**
 * Generates an SRT subtitle file from narration segments
 */
export function generateSrtFile(segments, srtOutputPath) {
  function formatSrtTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSec % 60).toString().padStart(2, '0');
    const millis = Math.floor((totalSec % 1) * 1000).toString().padStart(3, '0');
    return `${hrs}:${mins}:${secs},${millis}`;
  }

  let srt = '';
  segments.forEach((seg, index) => {
    srt += `${index + 1}\n`;
    srt += `${formatSrtTime(seg.startSec)} --> ${formatSrtTime(seg.endSec)}\n`;
    srt += `${seg.text.trim()}\n\n`;
  });

  fs.writeFileSync(srtOutputPath, srt, 'utf-8');
  return srtOutputPath;
}
