// scripts/youtube/engine/captions-engine.mjs
// Kinetic Subtitles Engine for High-Retention Shorts & Feature Videos
// Generates stylized ASS (Advanced SubStation Alpha) subtitles
// Styled for modern mobile & broadcast viewing (Hormozi/Vox punchy typography)

import fs from 'fs';
import path from 'path';

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
 * Strips leading numbers, bullets, list markers, and trailing punctuation from caption words
 */
export function cleanCaptionText(text) {
  if (!text) return '';
  let cleaned = String(text).trim();

  // Strip leading list numbers: "1. ", "2. ", "2 ", "1) ", "2) ", "- ", "* "
  cleaned = cleaned.replace(/^[\s\d\.\)\:\-\*\•\–\—]+(?=[^\d\s\.\)\:\-\*\•\–\—])/g, '').trim();
  cleaned = cleaned.replace(/^\d+\s+/g, '').trim();

  // Strip trailing punctuation: commas, semicolons, dashes
  cleaned = cleaned.replace(/[,;:\s]+$/g, '').trim();

  // Correct common grammatical corruption
  cleaned = cleaned.replace(/எதிர்காலத்தக்கு/g, 'எதிர்காலத்துக்கு');
  cleaned = cleaned.replace(/திட்டத்தக்கு/g, 'திட்டத்துக்கு');

  return cleaned;
}

/**
 * Breaks long sentences into 3 to 5-word punchy kinetic chunks
 */
/**
 * Breaks long sentences into punchy kinetic chunks
 * Shorts: 2 to 3 words (CapCut / Hormozi pop-up)
 * Long-form: 4 to 6 words (Vox broadcast style)
 */
export function chunkSentenceForCaptions(sentence, totalDurationSec, startTimeOffset = 0, wordsPerChunk = 3) {
  const cleanedSentence = cleanCaptionText(sentence);
  const words = cleanedSentence.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunkCount = Math.ceil(words.length / wordsPerChunk);
  const durationPerChunk = totalDurationSec / chunkCount;

  const chunks = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunkWords = words.slice(i * wordsPerChunk, (i + 1) * wordsPerChunk);
    const start = startTimeOffset + (i * durationPerChunk);
    const end = startTimeOffset + ((i + 1) * durationPerChunk);

    const chunkText = cleanCaptionText(chunkWords.join(' '));
    if (chunkText) {
      chunks.push({
        text: chunkText,
        start: Math.max(0, start),
        end: Math.max(start + 0.35, end)
      });
    }
  }

  return chunks;
}

/**
 * Generates timed caption chunks from an array of clauses,
 * ensuring each clause's captions are tightly locked to when that clause is spoken.
 *
 * @param {string[]} clauses - Array of narration sentences
 * @param {number} totalDurationSec - Total audio duration
 * @param {'9:16'|'16:9'} [aspectRatio='9:16']
 * @returns {Array<{ text: string, start: number, end: number }>}
 */
export function generateCaptionsFromClauses(clauses, totalDurationSec, aspectRatio = '9:16') {
  const validClauses = (clauses || []).map(c => cleanCaptionText(c)).filter(Boolean);
  if (validClauses.length === 0) return [];

  const totalWords = validClauses.reduce((sum, c) => sum + c.split(/\s+/).length, 0);
  if (totalWords === 0) return [];

  const wordsPerChunk = aspectRatio === '9:16' ? 3 : 5;
  const allChunks = [];
  let currentTimeOffset = 0;

  for (const clause of validClauses) {
    const wordCount = clause.split(/\s+/).length;
    const clauseDuration = totalDurationSec * (wordCount / totalWords);
    const chunks = chunkSentenceForCaptions(clause, clauseDuration, currentTimeOffset, wordsPerChunk);
    allChunks.push(...chunks);
    currentTimeOffset += clauseDuration;
  }

  return allChunks;
}

/**
 * Generates an ASS subtitle file with Hybrid Pro viral styling
 * - Shorts (9:16): CapCut / Hormozi 2–3 Word Pop-Up centered at 58% height with Neon Yellow Pop
 * - 16:9 Landscape: Vox / Netflix Frosted Glass Broadcast Pill at lower-third
 *
 * @param {Array<{ text: string, start: number, end: number }>} segments
 * @param {string} outputPath
 * @param {'9:16'|'16:9'} [aspectRatio='9:16']
 * @returns {string} outputPath
 */
export function generateAssSubtitleFile(segments, outputPath, aspectRatio = '9:16') {
  const isShort = aspectRatio === '9:16';
  const playResX = isShort ? 1080 : 1920;
  const playResY = isShort ? 1920 : 1080;

  // Shorts: Large display font (48px) centered at Y=58% (MarginV: 760)
  // Long-Form: 35px at lower-third (MarginV: 135)
  const fontSize = isShort ? 48 : 35;
  const marginV  = isShort ? 760 : 135;
  const outlineWidth = isShort ? 5.0 : 3.5;
  const shadowDepth = isShort ? 3.0 : 2.0;

  let dialogEvents = '';
  segments.forEach(seg => {
    const startStr = formatAssTime(seg.start);
    const endStr = formatAssTime(seg.end);

    const cleanText = cleanCaptionText(seg.text);
    if (!cleanText) return;

    const words = cleanText.split(/\s+/).filter(Boolean);
    let styledText = '';

    // Active word in Vibrant Golden Yellow (&H0015CCFA& BGR), remaining words in crisp Pure White (&H00FFFFFF&)
    if (words.length > 1) {
      const firstWord = words[0];
      const rest = words.slice(1).join(' ');
      styledText = `{\\c&H0015CCFA&}${firstWord} {\\c&H00FFFFFF&}${rest}`;
    } else {
      styledText = `{\\c&H0015CCFA&}${cleanText}`;
    }

    dialogEvents += `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${styledText}\n`;
  });

  const assContent = `[Script Info]
Title: VizhiTN Hybrid Pro Kinetic Captions
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: ${playResX}
PlayResY: ${playResY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans Tamil,${fontSize},&H00FFFFFF,&H0000FFFF,&H00000000,&H95000000,-1,0,0,0,100,100,0,0,1,${outlineWidth},${shadowDepth},2,35,35,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${dialogEvents}
`;

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outputPath, assContent, 'utf-8');
  return outputPath;
}
