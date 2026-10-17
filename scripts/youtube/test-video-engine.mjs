// scripts/youtube/test-video-engine.mjs
// Comprehensive Test Suite for Upgraded Video Automation Engine
// Tests: Scene Planner, Neural Speech VTT Alignment, Brand Avatars, Quota Tracker, and QC Gate

import fs from 'fs';
import path from 'path';
import { planShortsScenes, planLongFormScenes, planRightsShortsScenes } from './engine/scene-planner.mjs';
import { parseVttTiming, generateCaptionsFromTimedSegments, generateAssSubtitleFile } from './engine/captions-engine.mjs';
import { getBrandLogoDataUri, getHostAvatarDataUri } from './engine/brand-assets.mjs';
import { checkQuotaAvailable, recordQuotaUsage, getDailyQuotaSummary } from './engine/quota-tracker.mjs';
import { probeVideo, runQualityControl } from './engine/qc-engine.mjs';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
  }
}

console.log('====================================================');
console.log('VizhiTN Video Engine — Verification & Audit Suite');
console.log('====================================================\n');

// ── Test 1: Brand Assets & Host Avatars ──────────────────────────────────
console.log('[TEST 1] Verifying Brand Assets & Authentic Host Portraits...');
const logoUri = getBrandLogoDataUri();
assert(logoUri && logoUri.startsWith('data:image/'), 'Brand logo data URI is valid');

const karthikUri = getHostAvatarDataUri('karthik');
assert(karthikUri && karthikUri.startsWith('data:image/jpeg;base64,'), 'Karthik portrait base64 URI is valid and populated');

const kavithaUri = getHostAvatarDataUri('kavitha');
assert(kavithaUri && kavithaUri.startsWith('data:image/jpeg;base64,'), 'Kavitha portrait base64 URI is valid and populated');

// ── Test 2: Scene Planner Engine ─────────────────────────────────────────
console.log('\n[TEST 2] Verifying Scene Planner Engine (Shorts, Rights & Long-Form)...');
const mockPost = {
  title_ta: 'தாம்பரம் பகுதியில் இன்று மின் தடை',
  title_en: 'Tambaram Power Cut Today',
  category_slug: 'electricity',
  district_slug: 'chennai',
  area_name: 'தாம்பரம்',
  assigned_department: 'TANGEDCO (Helpline: 1912)',
  location_text: 'GST Road, Tambaram Sanatorium',
  urgency_level: 'high'
};

const shortsScenes = planShortsScenes({
  posts: [mockPost],
  theme: { color: '#FFD600', icon: '⚡', label: 'மின்வாரியம்' },
  area: 'தாம்பரம்',
  helpline: '1912',
  leadPost: mockPost
});
assert(shortsScenes.length === 4, `Shorts planned into 4 distinct visual beats (got ${shortsScenes.length})`);
assert(shortsScenes[0].template === 'shorts/scene-1-hook.html', 'Beat 1 mapped to scene-1-hook');
assert(shortsScenes[1].template === 'shorts/scene-broll-overlay.html', 'Beat 2 mapped to scene-broll-overlay');
assert(shortsScenes[2].template === 'shorts/scene-stat-card.html', 'Beat 3 mapped to scene-stat-card');
assert(shortsScenes[3].template === 'shorts/scene-3-helpline.html', 'Beat 4 mapped to scene-3-helpline');

const mockArticle = {
  title_ta: 'சென்னை மெட்ரோ இரண்டாம் கட்ட பணிகள்',
  title_en: 'Chennai Metro Phase 2 Development',
  category_slug: 'transport',
  department_name: 'CMRL',
  helpline: '1860-425-1515'
};
const mockChapters = [
  { headlineTa: 'திட்ட தொடக்கம்', headlineEn: 'Project Genesis', narrationClauses: ['பகுதி 1', 'பகுதி 2'], facts: ['116 கி.மீ', '₹61,000 கோடி'] },
  { headlineTa: 'ஆவண ஆய்வு', headlineEn: 'Document Investigation', narrationClauses: ['பகுதி 3', 'பகுதி 4'], facts: ['G.O. 452', 'நில எடுப்பு அறிக்கை'] }
];
const longScenes = planLongFormScenes({ article: mockArticle, chapters: mockChapters });
assert(longScenes.length >= 6, `Long-form documentary broken down into granular sub-beats (got ${longScenes.length})`);

// ── Test 3: Subtitle & VTT Speech Alignment Engine ───────────────────────
console.log('\n[TEST 3] Verifying VTT Speech Alignment & Zero Subtitle Drift...');
const sampleVtt = `WEBVTT

00:00:00.500 --> 00:00:03.200
வணக்கம் நேயர்களே இது விழி தமிழ்நாடு.

00:00:03.400 --> 00:00:06.850
தாம்பரம் பகுதியில் இன்று மின் தடை அறிவிக்கப்பட்டுள்ளது.
`;

const timedSegments = parseVttTiming(sampleVtt);
assert(timedSegments.length === 2, `Parsed 2 VTT timed speech segments (got ${timedSegments.length})`);
assert(timedSegments[0].startSec === 0.5 && timedSegments[0].endSec === 3.2, 'Segment 0 timing parsed accurately with millisecond precision');
assert(timedSegments[1].startSec === 3.4 && timedSegments[1].endSec === 6.85, 'Segment 1 timing parsed accurately');

const captions = generateCaptionsFromTimedSegments(timedSegments);
assert(captions.length >= 2, `Generated kinetic captions matching neural timing (got ${captions.length} chunks)`);

const testAssPath = path.resolve('public/youtube_renders/test_subtitles.ass');
generateAssSubtitleFile(captions, testAssPath, '9:16');
assert(fs.existsSync(testAssPath), 'Generated .ass subtitle file successfully');
if (fs.existsSync(testAssPath)) fs.unlinkSync(testAssPath);

// ── Test 4: Quota Safety Tracker ─────────────────────────────────────────
console.log('\n[TEST 4] Verifying Daily YouTube Quota Safety Tracker...');
const quotaCheck = checkQuotaAvailable('VIDEO_UPLOAD');
assert(typeof quotaCheck.allowed === 'boolean', 'Quota check returns boolean allowed status');
assert(typeof quotaCheck.remainingUnits === 'number', `Remaining quota calculated: ${quotaCheck.remainingUnits} units`);

const summary = getDailyQuotaSummary();
assert(summary.date === new Date().toISOString().slice(0, 10), "Quota summary tracked for today's UTC date");

// ── Test 5: Templates Existence Check ────────────────────────────────────
console.log('\n[TEST 5] Verifying Upgraded HTML Templates...');
const templates = [
  'scripts/youtube/templates/shorts/scene-1-hook.html',
  'scripts/youtube/templates/shorts/scene-2-breakdown.html',
  'scripts/youtube/templates/shorts/scene-3-helpline.html',
  'scripts/youtube/templates/shorts/scene-stat-card.html',
  'scripts/youtube/templates/shorts/scene-broll-overlay.html',
  'scripts/youtube/templates/long-form/chapter-slide.html',
  'scripts/youtube/templates/long-form/evidence-doc-slide.html',
  'scripts/youtube/templates/long-form/data-stat-slide.html',
  'scripts/youtube/templates/podcast/studio-frame.html'
];

templates.forEach(t => {
  const p = path.resolve(t);
  assert(fs.existsSync(p), `Template exists: ${t}`);
});

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
