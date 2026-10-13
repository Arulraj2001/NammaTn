#!/usr/bin/env node
// scripts/youtube/test-pipeline.mjs
// Local dry-run validator for all 3 VizhiTN video pipelines.
// Tests: TTS synthesis, template rendering, FFmpeg availability, and Supabase connection.
// Does NOT upload to YouTube or post to social media.
//
// Usage:
//   node scripts/youtube/test-pipeline.mjs [--pipeline=civic|rights|long|all] [--verbose]

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

try {
  if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env.local');
} catch (_) {}

const args = process.argv.slice(2);
const pipeline = (args.find(a => a.startsWith('--pipeline=')) || '--pipeline=all').split('=')[1];
const verbose = args.includes('--verbose');

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const INFO = '\x1b[36mℹ\x1b[0m';

let failures = 0;

function ok(label, detail = '') {
  console.log(`  ${PASS} ${label}${detail ? `  \x1b[90m${detail}\x1b[0m` : ''}`);
}
function fail(label, reason = '') {
  console.log(`  ${FAIL} ${label}  \x1b[31m${reason}\x1b[0m`);
  failures++;
}
function info(label) {
  console.log(`  ${INFO} ${label}`);
}
function section(title) {
  console.log(`\n\x1b[1m── ${title} ──\x1b[0m`);
}

// ─── 1. Environment Variables ──────────────────────────────────────────────
section('Environment Variables');

const REQUIRED_VARS = [
  ['SUPABASE_URL',              'Supabase database URL'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase service role key'],
  ['YOUTUBE_GEMINI_API_KEY',    'Gemini AI (for documentary scripts)']
];
const OPTIONAL_VARS = [
  ['YOUTUBE_CLIENT_ID',          'YouTube OAuth2 (upload)'],
  ['YOUTUBE_CLIENT_SECRET',      'YouTube OAuth2 (upload)'],
  ['YOUTUBE_REFRESH_TOKEN',      'YouTube OAuth2 (upload)'],
  ['CLOUDFLARE_ACCOUNT_ID',      'Cloudflare Workers AI (FLUX images)'],
  ['CLOUDFLARE_API_TOKEN',       'Cloudflare Workers AI (FLUX images)'],
  ['META_PAGE_ID',               'Facebook/Instagram cross-post'],
  ['META_PAGE_ACCESS_TOKEN',     'Facebook/Instagram cross-post']
];

for (const [varName, desc] of REQUIRED_VARS) {
  const val = process.env[varName] || process.env[`NEXT_PUBLIC_VITE_${varName}`] || process.env[`NEXT_PUBLIC_${varName}`];
  if (val && val.length > 8) {
    ok(varName, `${desc} — set (${val.slice(0, 6)}…)`);
  } else {
    fail(varName, `REQUIRED: ${desc}`);
  }
}
for (const [varName, desc] of OPTIONAL_VARS) {
  const val = process.env[varName];
  if (val && val.length > 4) {
    ok(varName, `${desc} — set`);
  } else {
    info(`${varName} — not set (${desc}) — will use dry-run mode`);
  }
}

// ─── 2. Node.js & npm Dependencies ────────────────────────────────────────
section('Dependencies');

const REQUIRED_PACKAGES = [
  '@supabase/supabase-js',
  '@google/genai',
  '@ffmpeg-installer/ffmpeg',
  'msedge-tts'
];

const OPTIONAL_PACKAGES = [
  'puppeteer-core'  // optional — frame-renderer uses system Chrome via browser-detector.mjs
];

for (const pkg of REQUIRED_PACKAGES) {
  try {
    const pkgJsonPath = path.resolve('node_modules', pkg, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    ok(pkg, `v${pkgJson.version}`);
  } catch {
    fail(pkg, 'Not installed — run: npm install');
  }
}
for (const pkg of OPTIONAL_PACKAGES) {
  try {
    const pkgJsonPath = path.resolve('node_modules', pkg, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    ok(pkg, `v${pkgJson.version} (optional)`);
  } catch {
    info(`${pkg} — not installed (optional, uses system Chrome fallback)`);
  }
}

// ─── 3. FFmpeg Binary ─────────────────────────────────────────────────────
section('FFmpeg Binary');

let ffmpegPath = 'ffmpeg';
try {
  const installer = await import('@ffmpeg-installer/ffmpeg');
  if (installer.default?.path && fs.existsSync(installer.default.path)) {
    ffmpegPath = installer.default.path;
    ok('@ffmpeg-installer/ffmpeg', ffmpegPath);
  }
} catch {}

try {
  const output = execSync(`"${ffmpegPath}" -version 2>&1`, { timeout: 10000 }).toString();
  const match = output.match(/ffmpeg version ([^\s]+)/);
  ok('FFmpeg version', match?.[1] || 'found');
} catch (e) {
  fail('FFmpeg', `Not found at "${ffmpegPath}" — install ffmpeg or npm install @ffmpeg-installer/ffmpeg`);
}

// ─── 4. Template Files ────────────────────────────────────────────────────
section('HTML Templates');

const TEMPLATES = [
  ['scripts/youtube/templates/shorts/scene-1-hook.html',      ['broadcast-bar', 'CATEGORY_COLOR', 'DISTRICT_NAME']],
  ['scripts/youtube/templates/shorts/scene-2-breakdown.html', ['broadcast-bar', 'ALERTS_CARDS_HTML']],
  ['scripts/youtube/templates/shorts/scene-3-helpline.html',  ['vizhitn.in', '1912']],
  ['scripts/youtube/templates/shorts/daily-digest-card.html', ['MAIN_HEADLINE_TA', 'ALERTS_CARDS_HTML']],
  ['scripts/youtube/templates/long-form/chapter-slide.html',  ['broadcast-top', 'chapter-dots', 'DOT_1_CLASS']]
];

for (const [tplPath, markers] of TEMPLATES) {
  if (!fs.existsSync(tplPath)) {
    fail(path.basename(tplPath), 'File missing');
    continue;
  }
  const content = fs.readFileSync(tplPath, 'utf-8');
  const missingMarkers = markers.filter(m => !content.includes(m));
  if (missingMarkers.length) {
    fail(path.basename(tplPath), `Missing placeholders: ${missingMarkers.join(', ')}`);
  } else {
    ok(path.basename(tplPath), `${(content.length / 1024).toFixed(1)} KB — all placeholders present`);
  }
}

// ─── 5. Engine Files ──────────────────────────────────────────────────────
section('Engine Files');

const ENGINE_FILES = [
  ['scripts/youtube/engine/video-composer.mjs',    ['assembleMultiSceneShortsVideo', 'mixAudioWithSoundDesign', 'zoompan']],
  ['scripts/youtube/engine/youtube-client.mjs',    ['postPinnedComment', 'setYouTubeThumbnail', 'containsSyntheticMedia: false']],
  ['scripts/youtube/engine/script-writer.mjs',     ['generateVideoMetadata', 'getCategoryFluxPrompt', 'generateDocumentaryScript']],
  ['scripts/youtube/engine/tamil-phonetics.mjs',   ['normalizeAcronymsToSpokenTamil', 'CITIZEN_DISPUTE_TOPICS']],
  ['scripts/youtube/engine/tts-engine.mjs',        ['synthesizeSpeech']],
  ['scripts/youtube/engine/frame-renderer.mjs',    ['renderHtmlToImage']],
  ['scripts/youtube/engine/cloudflare-visuals.mjs',['generateYouTubeSceneVisual']],
  ['scripts/youtube/engine/captions-engine.mjs',   ['chunkSentenceForCaptions', 'generateAssSubtitleFile']],
  ['scripts/youtube/engine/sfx-generator.mjs',      ['ensureProceduralSfxStems']],
  ['scripts/youtube/engine/brand-assets.mjs',      ['getBrandLogoDataUri']],
  ['scripts/youtube/engine/thumbnail-engine.mjs',  ['generateLongVideoThumbnail', 'generateShortsThumbnail']],
  ['scripts/youtube/engine/meta-video-poster.mjs', ['crossPostVideoToMetaSocials']]
];

for (const [filePath, markers] of ENGINE_FILES) {
  if (!fs.existsSync(filePath)) {
    fail(path.basename(filePath), 'File missing');
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const missing = markers.filter(m => !content.includes(m));
  if (missing.length) {
    fail(path.basename(filePath), `Missing exports: ${missing.join(', ')}`);
  } else {
    ok(path.basename(filePath), `${(content.length / 1024).toFixed(1)} KB`);
  }
}

// ─── 6. SFX Assets ────────────────────────────────────────────────────────
section('Sound Design Assets (optional)');

const SFX_FILES = [
  'scripts/youtube/assets/sfx/newsroom-hum.mp3',
  'scripts/youtube/assets/sfx/scene-whoosh.mp3',
  'scripts/youtube/assets/sfx/civic-outro-beat.mp3'
];
let sfxCount = 0;
for (const sfxPath of SFX_FILES) {
  if (fs.existsSync(sfxPath) && fs.statSync(sfxPath).size > 0) {
    ok(path.basename(sfxPath), `${(fs.statSync(sfxPath).size / 1024).toFixed(0)} KB`);
    sfxCount++;
  } else {
    info(`${path.basename(sfxPath)} — not yet added (see scripts/youtube/assets/sfx/README.md)`);
  }
}
if (sfxCount === 0) {
  info('No SFX files present — videos will render with voiceover only (fallback mode)');
}

// ─── 7. Supabase Connection Test ──────────────────────────────────────────
section('Supabase Connection');

try {
  const supabaseUrl = process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials');

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('post')
    .select('id, title_ta, category_slug, status')
    .eq('status', 'active')
    .order('created_date', { ascending: false })
    .limit(3);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    fail('post table', 'No active posts found — import some posts first');
  } else {
    ok('post table', `${data.length} active posts found`);
    if (verbose) {
      data.forEach((p, i) => console.log(`    ${i + 1}. [${p.category_slug}] ${(p.title_ta || '').slice(0, 60)}…`));
    }
  }

  const { data: tnData, error: tnError } = await supabase
    .from('tn_today')
    .select('id, title_ta, slug, status')
    .eq('status', 'published')
    .order('id', { ascending: false })
    .limit(1);

  if (tnError) {
    info(`tn_today table — ${tnError.message}`);
  } else if (!tnData || tnData.length === 0) {
    info('tn_today table — no published articles (long-form pipeline will wait)');
  } else {
    ok('tn_today table', `Latest: "${(tnData[0].title_ta || '').slice(0, 50)}"`);
  }
} catch (err) {
  fail('Supabase', err.message);
}

// ─── 8. Dry Run - TTS Synthesis ───────────────────────────────────────────
section('TTS Synthesis (dry run)');

try {
  const { synthesizeSpeech } = await import('./engine/tts-engine.mjs');
  const testOut = path.resolve('public/youtube_renders/_test_tts_dry.mp3');
  fs.mkdirSync(path.dirname(testOut), { recursive: true });

  await synthesizeSpeech(
    ['சென்னை பகுதியில் டான்ஜெட்கோ மின்வாரியம் பராமரிப்பு பணிகளுக்காக மின்சாரம் நிறுத்தம் செய்யப்படுது.'],
    testOut,
    { voice: 'ta-IN-PallaviNeural', rate: '+4%' }
  );

  if (fs.existsSync(testOut) && fs.statSync(testOut).size > 0) {
    const size = (fs.statSync(testOut).size / 1024).toFixed(0);
    ok('TTS synthesis', `Tamil speech generated (${size} KB)`);
    fs.unlinkSync(testOut);
  } else {
    fail('TTS synthesis', 'Output file empty or missing');
  }
} catch (err) {
  fail('TTS synthesis', err.message);
}

// ─── Summary ──────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(55));
if (failures === 0) {
  console.log(`\x1b[32m✅ ALL CHECKS PASSED — Pipeline ready for production\x1b[0m`);
  console.log(`\nRun a full dry-run with:`);
  console.log(`  node scripts/youtube/pipelines/generate-shorts.mjs --dry-run`);
  console.log(`  node scripts/youtube/pipelines/generate-rights-shorts.mjs --dry-run`);
  console.log(`  node scripts/youtube/pipelines/generate-long-video.mjs --dry-run`);
} else {
  console.log(`\x1b[31m❌ ${failures} CHECK(S) FAILED — Fix above before running pipeline\x1b[0m`);
}
console.log('═'.repeat(55));
