// scripts/youtube/engine/tts-engine.mjs
// Production Tamil Neural Speech Engine
// Backend: Python edge-tts CLI (stable on Windows + Linux/GitHub Actions)
// Micro-chunk tokeniser + SSML prosody + FFmpeg audio stitching

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil, splitIntoSpokenClauses } from './tamil-phonetics.mjs';
import { getFfmpegBinaryPath } from './video-composer.mjs';

// ── Detect Python edge-tts CLI ────────────────────────────────────────────────

function getPythonBinary() {
  for (const bin of ['python', 'python3']) {
    try {
      const ver = execSync(`${bin} --version`, { stdio: 'pipe', timeout: 5000 }).toString().trim();
      if (ver.startsWith('Python')) return bin;
    } catch {}
  }
  throw new Error('Python not found — required for edge-tts TTS synthesis.');
}

function checkEdgeTtsCli(python) {
  try {
    execSync(`${python} -m edge_tts --version`, { stdio: 'pipe', timeout: 8000 });
    return true;
  } catch {
    return false;
  }
}

// ── Single-clause synthesis via Python edge-tts ───────────────────────────────

/**
 * Synthesises a single text clause to an MP3 file using the Python edge-tts CLI.
 * Each call spawns a fresh subprocess — no WebSocket state shared between clauses.
 *
 * @param {string} text        - Tamil text to synthesise
 * @param {string} outputPath  - Destination MP3 file path
 * @param {Object} opts        - { voice, rate, pitch }
 */
function synthesiseClauseToPython(text, outputPath, opts = {}) {
  const python  = getPythonBinary();
  const voice   = opts.voice  || YOUTUBE_CONFIG.voices.tamilFemale;
  const rate    = opts.rate   || YOUTUBE_CONFIG.voices.defaultRate   || '+5%';
  const pitch   = opts.pitch  || YOUTUBE_CONFIG.voices.defaultPitch  || '+0Hz';

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Escape text safely: wrap in single quotes, escaping any internal single quotes
  const safeText = text.replace(/'/g, "\\'");

  const cmd = `${python} -m edge_tts --voice "${voice}" --rate="${rate}" --pitch="${pitch}" --text '${safeText}' --write-media "${outputPath.replace(/\\/g, '/')}"`;

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 45000, windowsHide: true });
  } catch (err) {
    // On Windows, PowerShell single-quote handling differs — try double-quote fallback
    const safeTextDq = text.replace(/"/g, '\\"');
    const cmdDq = `${python} -m edge_tts --voice "${voice}" --rate="${rate}" --pitch="${pitch}" --text "${safeTextDq}" --write-media "${outputPath.replace(/\\/g, '/')}"`;
    execSync(cmdDq, { stdio: 'pipe', timeout: 45000, windowsHide: true });
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error(`[TTS] edge-tts produced no output for: ${text.slice(0, 50)}`);
  }
}

// ── Main export: synthesizeSpeech ─────────────────────────────────────────────

/**
 * Synthesises long Tamil narration into studio-quality MP3.
 * Splits input into micro-clauses, synthesises each in isolation,
 * then stitches them together with FFmpeg.
 *
 * @param {string|string[]} input  - Text string OR pre-split clause array
 * @param {string} outputFilePath  - Destination MP3
 * @param {Object} options         - { voice, rate, pitch }
 * @returns {Promise<{ filePath: string, voice: string, durationSec: number }>}
 */
export async function synthesizeSpeech(input, outputFilePath, options = {}) {
  const voice  = options.voice || YOUTUBE_CONFIG.voices.tamilFemale;
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

  if (clauses.length === 0) throw new Error('[TTS] No valid clauses provided for synthesis');

  console.log(`[TTS ENGINE] Sliced narration into ${clauses.length} micro-chunks for glitch-free delivery.`);

  // Verify Python + edge-tts CLI is available
  const python = getPythonBinary();
  if (!checkEdgeTtsCli(python)) {
    throw new Error('[TTS] edge-tts Python CLI not found. Run: pip install edge-tts');
  }

  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const tempClips = [];

  try {
    // 2. Synthesise each clause independently
    for (let i = 0; i < clauses.length; i++) {
      const chunkPath = path.join(outDir, `_tts_chunk_${sessionId}_${i}.mp3`);

      let synthesised = false;
      for (let attempt = 1; attempt <= 3 && !synthesised; attempt++) {
        try {
          synthesiseClauseToPython(clauses[i], chunkPath, options);
          synthesised = true;
        } catch (err) {
          const waitMs = attempt * 1000;
          console.warn(`[TTS] Chunk ${i} attempt ${attempt}/3 failed — retrying in ${waitMs}ms… (${err.message.slice(0, 60)})`);
          await new Promise(r => setTimeout(r, waitMs));
        }
      }

      if (!synthesised) throw new Error(`[TTS] Failed to synthesise chunk ${i} after 3 attempts: "${clauses[i].slice(0, 60)}"`);

      tempClips.push(chunkPath);

      // 150ms pause between calls — prevents edge-tts server rate-limiting
      if (i < clauses.length - 1) await new Promise(r => setTimeout(r, 150));
    }

    // 3. Stitch clips with FFmpeg concat
    if (tempClips.length === 1) {
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      fs.copyFileSync(tempClips[0], outputFilePath);
    } else {
      const concatListPath = path.join(outDir, `_tts_concat_${sessionId}.txt`);
      const lines = tempClips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n');
      fs.writeFileSync(concatListPath, lines, 'utf-8');

      execSync(
        `"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${outputFilePath}"`,
        { stdio: 'pipe', timeout: 60000 }
      );

      try { fs.unlinkSync(concatListPath); } catch {}
    }

    // 4. Probe duration
    let durationSec = 45;
    try {
      const probe = execSync(`"${ffmpeg}" -i "${outputFilePath}" 2>&1`, { timeout: 10000 }).toString();
      const m = probe.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (m) durationSec = +m[1] * 3600 + +m[2] * 60 + +m[3];
    } catch (err) {
      const txt = (err.stdout || '').toString() + (err.stderr || '').toString();
      const m = txt.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (m) durationSec = +m[1] * 3600 + +m[2] * 60 + +m[3];
    }

    return { filePath: outputFilePath, voice, durationSec };

  } finally {
    for (const c of tempClips) {
      if (fs.existsSync(c)) try { fs.unlinkSync(c); } catch {}
    }
  }
}

// ── SRT subtitle generator ────────────────────────────────────────────────────

/**
 * Generates an SRT subtitle file from timed narration segments
 * @param {{ startSec: number, endSec: number, text: string }[]} segments
 * @param {string} srtOutputPath
 */
export function generateSrtFile(segments, srtOutputPath) {
  function fmt(s) {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    const ms  = String(Math.floor((s % 1) * 1000)).padStart(3, '0');
    return `${h}:${m}:${sec},${ms}`;
  }

  const srt = segments.map((seg, i) =>
    `${i + 1}\n${fmt(seg.startSec)} --> ${fmt(seg.endSec)}\n${seg.text.trim()}\n`
  ).join('\n');

  fs.writeFileSync(srtOutputPath, srt, 'utf-8');
  return srtOutputPath;
}
