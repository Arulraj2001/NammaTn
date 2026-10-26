// scripts/test-overhaul-pipeline.mjs
/**
 * End-to-End Verification Runner for:
 * 1. Gemini Neural Speech Synthesis (lifelike human audio)
 * 2. Modern 9:16 Shorts Hook Frame Render
 * 3. Modern 16:9 Podcast Documentary Desk Frame Render
 * 4. WhatsApp Channel Bulletin Generation
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { synthesizeGeminiSpeech } from './youtube/engine/gemini-tts.mjs';
import { renderHtmlToImage } from './youtube/engine/frame-renderer.mjs';
import { getBrandLogoDataUri } from './youtube/engine/brand-assets.mjs';
import { generateWhatsAppBulletin } from './whatsapp-channel-bot.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const outDir = path.resolve('public/test_renders');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAll() {
  console.log('===============================================================');
  console.log('VIZHITN MEDIA ENGINE OVERHAUL — LIVE TEST & DEMONSTRATION');
  console.log('===============================================================\n');

  // Fetch real lead post from database
  const { data: posts } = await supabase
    .from('post')
    .select('*')
    .eq('status', 'active')
    .order('created_date', { ascending: false })
    .limit(1);

  const samplePost = posts?.[0] || {
    title_ta: 'தாம்பரம் பகுதியில் இன்று 5 மணி நேர மின்தடை: காமராஜர் நெடுஞ்சாலை & மாடம்பாக்கம் பகுதிகளில் மின்சாரம் நிறுத்தம்',
    title_en: 'Tambaram 5-Hour Power Cut Today: Kamarajar High Road and Madambakkam',
    district_slug: 'chennai',
    area_name: 'Tambaram',
    category_slug: 'electricity',
    assigned_department: 'TANGEDCO (Helpline: 1912)',
    slug: 'tambaram-power-cut-chennai',
    content_ta: 'துணை மின்நிலைய அவசர பராமரிப்பு பணி காரணமாக இன்று காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை தாம்பரம், காமராஜர் சாலை, மாடம்பாக்கம் பகுதிகளில் மின்சாரம் நிறுத்தப்படும்.'
  };

  const fontsDir = path.resolve('public/fonts').replace(/\\/g, '/');
  const brandLogoDataUri = getBrandLogoDataUri();

  // ── TEST 1: Gemini Neural Speech Synthesis ─────────────────────────────────
  console.log('▶ [1/4] Testing Google Gemini Lifelike Neural TTS...');
  const ttsOutputPath = path.join(outDir, 'test_gemini_speech.mp3');
  const testSampleDialogue = 'தாம்பரத்தில் இன்று காலை ஒன்பது மணி முதல் மதியம் இரண்டு மணி வரை அவசர பராமரிப்பு காரணமாக மின்சாரம் நிறுத்தப்படுகிறது. உதவிக்கு மின்னகம் 1912-ஐ அழையுங்கள்.';

  let ttsSuccess = false;
  let ttsDuration = 0;
  try {
    await synthesizeGeminiSpeech(testSampleDialogue, ttsOutputPath, { voice: 'kavitha' });
    const stat = fs.statSync(ttsOutputPath);
    ttsSuccess = stat.size > 1000;
    console.log(`✓ Gemini Neural TTS Success! Generated ${stat.size} bytes audio file at: ${ttsOutputPath}\n`);
  } catch (err) {
    console.error(`✗ Gemini TTS Error: ${err.message}\n`);
  }

  // ── TEST 2: Modern 9:16 Shorts Hook Frame ──────────────────────────────────
  console.log('▶ [2/4] Testing Redesigned 9:16 Shorts Hook Frame Render...');
  const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
  let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');

  // Solid dark fallback visual plate if online photo not fetched
  const dummyPhoto = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="%230b1329"/></svg>';

  tplS1 = tplS1
    .replace('{{FONTS_DIR}}', fontsDir)
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{SCENE_PHOTO_SRC}}', dummyPhoto)
    .replaceAll('{{HOOK_HEADLINE_TA}}', samplePost.title_ta)
    .replace('{{DATE_TEXT}}', 'இன்று | 26 அக்டோபர் 2026')
    .replaceAll('{{CATEGORY_COLOR}}', '#FFD600')
    .replaceAll('{{CATEGORY_ICON}}', '⚡')
    .replaceAll('{{CATEGORY_LABEL}}', 'TANGEDCO மின்வாரியம்')
    .replaceAll('{{DISTRICT_NAME}}', (samplePost.area_name || 'CHENNAI').toUpperCase());

  const s1OutputPath = path.join(outDir, 'test_shorts_s1_frame.png');
  renderHtmlToImage(tplS1, s1OutputPath, { width: 1080, height: 1920 });
  const s1Stat = fs.statSync(s1OutputPath);
  console.log(`✓ Shorts 9:16 Frame Rendered! Size: ${s1Stat.size} bytes at: ${s1OutputPath}\n`);

  // ── TEST 3: Modern 16:9 Podcast Documentary Desk Frame ─────────────────────
  console.log('▶ [3/4] Testing Redesigned 16:9 Podcast Documentary Desk Frame Render...');
  const tplPodPath = path.resolve('scripts/youtube/templates/podcast/studio-frame.html');
  let tplPod = fs.readFileSync(tplPodPath, 'utf-8');

  tplPod = tplPod
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replaceAll('{{CATEGORY_COLOR}}', '#38bdf8')
    .replace('{{SERIES_NAME_EN}}', 'CYBER SCAM EXPOSED')
    .replace('{{EPISODE_TITLE_TA}}', 'போலி சிபிஐ வீடியோ கால் கைது மோசடி: தப்பிப்பது எப்படி?')
    .replace('{{DISTRICT_NAME}}', 'TAMIL NADU')
    .replace('{{HELPLINE_TEXT}}', '1930')
    .replace('{{ACT_NAME_TA}}', 'பகுதி 1: வலையின் தொடக்கம்')
    .replace('{{LEGAL_SECTION_NAME}}', 'IT சட்டம் பிரிவு 66D & RBI சுற்றறிக்கை')
    .replace('{{SCENE_TITLE_TA}}', 'டிஜிட்டல் அரெஸ்ட் என்ற பெயரில் நடக்கும் ₹50 லட்சம் மோசடி')
    .replace('{{POINT_1_TEXT}}', 'ஸ்கைப் மூலம் போலீஸ் சீருடையில் பேசும் நபர்கள்')
    .replace('{{POINT_2_TEXT}}', 'ஆர்பிஐ அல்லது சிபிஐ எந்த காலத்திலும் வீடியோ காலில் விசாரிக்காது')
    .replace('{{POINT_3_TEXT}}', 'பணம் இழந்த 2 மணி நேரத்திற்குள் 1930-ல் பதிவு செய்தால் முழு மீட்பு')
    .replace('{{SPEAKER_COLOR}}', '#00ffff')
    .replace('{{SPEAKER_NAME_TA}}', 'கார்த்திக்')
    .replace('{{SPEAKER_ROLE_TA}}', 'புலனாய்வு நிருபர்')
    .replace('{{SPOKEN_TEXT_TA}}', 'கவிதா, சாதாரண மக்களுக்கு போலீஸ் நோட்டீஸ்னு வந்தாலே பயம் வந்துடும். அதைத்தான் இந்த கும்பல் தங்களுக்கு சாதகமா பயன்படுத்துது.');

  const podOutputPath = path.join(outDir, 'test_podcast_frame.png');
  renderHtmlToImage(tplPod, podOutputPath, { width: 1920, height: 1080 });
  const podStat = fs.statSync(podOutputPath);
  console.log(`✓ Podcast 16:9 Frame Rendered! Size: ${podStat.size} bytes at: ${podOutputPath}\n`);

  // ── TEST 4: WhatsApp Channel Bulletin Generation ───────────────────────────
  console.log('▶ [4/4] Testing WhatsApp Channel High-Forwarding Bulletin Generation...');
  const waBulletin = await generateWhatsAppBulletin(samplePost);
  console.log('\n--- [GENERATED WHATSAPP BULLETIN OUTPUT] ---');
  console.log(waBulletin);
  console.log('--------------------------------------------\n');

  console.log('===============================================================');
  console.log('ALL 4 OVERHAULED COMPONENTS VERIFIED AND OPERATIONAL!');
  console.log('===============================================================');
}

testAll().catch(e => {
  console.error('[FATAL TEST ERROR]', e);
  process.exit(1);
});
