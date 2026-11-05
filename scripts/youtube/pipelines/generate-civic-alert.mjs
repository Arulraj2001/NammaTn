// scripts/youtube/pipelines/generate-civic-alert.mjs
/**
 * VizhiTN Live Civic Alert Engine (9:16 Portrait)
 * Covers:
 * 1. School & College Holidays / Severe Weather Alerts (Collector Orders & IMD Warnings)
 * 2. TANGEDCO Scheduled Power Cuts (Areas, Timings & Minnalagam 1912 Helpline)
 * 
 * Post-Upload Feature:
 * Automatically broadcasts the newly uploaded YouTube Short link, affected areas, 
 * and emergency helplines directly to the official VizhiTN WhatsApp Channel.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
import { shareYouTubeBroadcastToWhatsApp } from '../engine/whatsapp-youtube-sharer.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

function getPythonBinary() {
  for (const bin of ['python', 'python3']) {
    try {
      const ver = execSync(`${bin} --version`, { stdio: 'pipe', timeout: 5000 }).toString().trim();
      if (ver.startsWith('Python')) return bin;
    } catch {}
  }
  return 'python';
}

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-PallaviNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[CIVIC TTS] Synthesizing via Google Gemini Voice: "${cleanText.slice(0, 40)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'alert' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`[CIVIC TTS ✓] Gemini speech generated: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[CIVIC TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Falling back to Edge-TTS...`);
    }
  }

  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const edgeCmd = `${python} -m edge_tts --voice "${voice}" --rate=+5% --file "${tempTextFile}" --write-media "${outputPath}"`;
    execSync(edgeCmd, { stdio: 'pipe', timeout: 30000 });
    return outputPath;
  } finally {
    if (fs.existsSync(tempTextFile)) {
      try { fs.unlinkSync(tempTextFile); } catch {}
    }
  }
}

/**
 * Fetches the lead civic alert post from Supabase
 */
async function getLeadCivicPost() {
  if (!supabase) {
    console.warn('[CIVIC DB] Supabase client not initialized. Using fallback mock alert.');
    return null;
  }

  try {
    // 1. Priority 1: Emergency & School/College Holiday Alert
    console.log('[CIVIC DB] Checking for active emergency or school holiday alert...');
    const { data: holidayPosts } = await supabase
      .from('post')
      .select('*')
      .eq('status', 'active')
      .or('category_slug.eq.education,category_slug.eq.public-safety')
      .order('created_date', { ascending: false })
      .limit(3);

    const activeHoliday = (holidayPosts || []).find(p => 
      (p.title_ta || '').includes('விடுமுறை') || 
      (p.title_ta || '').includes('மழை') || 
      (p.title_ta || '').includes('அலர்ட்')
    );

    if (activeHoliday) {
      console.log(`[CIVIC DB ✓] Found active emergency/holiday alert: "${activeHoliday.title_ta}"`);
      return { ...activeHoliday, alertType: 'holiday' };
    }

    // 2. Priority 2: TANGEDCO Power Cut Alert
    console.log('[CIVIC DB] Checking for active TANGEDCO scheduled power cut...');
    const { data: powerPosts } = await supabase
      .from('post')
      .select('*')
      .eq('status', 'active')
      .eq('category_slug', 'electricity')
      .order('created_date', { ascending: false })
      .limit(1);

    if (powerPosts && powerPosts.length > 0) {
      console.log(`[CIVIC DB ✓] Found active TANGEDCO power cut: "${powerPosts[0].title_ta}"`);
      return { ...powerPosts[0], alertType: 'electricity' };
    }

    // 3. Priority 3: Latest active civic notice
    const { data: latestActive } = await supabase
      .from('post')
      .select('*')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(1);

    if (latestActive && latestActive.length > 0) {
      console.log(`[CIVIC DB ✓] Found active civic post: "${latestActive[0].title_ta}"`);
      return { ...latestActive[0], alertType: 'general' };
    }
  } catch (err) {
    console.warn('[CIVIC DB ERROR]:', err.message);
  }

  return null;
}

function generateCivicSlideHtml({
  slideNum = 1,
  headerTag = 'அவசர உள்ளூர் அறிவிப்பு',
  headerColor = '#DC2626',
  title = '',
  subTitle = '',
  cardHeading = '',
  items = [],
  footerText = 'VizhiTN அவசர உள்ளூர் அறிவிப்பு',
  brandLogoDataUri
}) {
  const clockCrayonUri = getStickmanAssetDataUri('clock-crayon.png');
  const targetCrayonUri = getStickmanAssetDataUri('target-crayon.png');

  const itemsHtml = items.map(item => `
    <div class="info-row">
      <span class="info-icon">${item.icon || '📌'}</span>
      <div class="info-body">
        <div class="info-label">${item.label}</div>
        <div class="info-val">${item.value}</div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1920px;
      overflow: hidden;
      background: #FAF8F5;
      background-image: radial-gradient(#CBD5E1 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0F172A;
      position: relative;
    }
    .top-bar {
      position: absolute; top: 80px; left: 60px; right: 60px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex; align-items: center; gap: 14px;
      background: #FFFFFF; border: 3px solid #E2E8F0;
      padding: 12px 26px; border-radius: 999px;
    }
    .brand-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .brand-name { font-size: 26px; font-weight: 900; color: #0F172A; }
    .alert-pill {
      background: ${headerColor}; color: #FFFFFF;
      font-size: 24px; font-weight: 900; padding: 12px 28px; border-radius: 999px;
      box-shadow: 0 4px 16px ${headerColor}44;
    }

    .main-title-box {
      position: absolute; top: 200px; left: 60px; right: 60px;
      background: #FFFFFF; border: 4px solid #E2E8F0;
      border-radius: 32px; padding: 40px;
      box-shadow: 0 15px 35px rgba(15, 23, 42, 0.06);
    }
    .title-text { font-size: 46px; font-weight: 900; line-height: 1.35; color: #0F172A; margin-bottom: 12px; }
    .sub-text { font-size: 30px; font-weight: 700; color: #64748B; line-height: 1.4; }

    .card-box {
      position: absolute; top: 620px; left: 60px; right: 60px;
      background: #FFFFFF; border: 4px solid #E2E8F0;
      border-radius: 32px; padding: 44px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
    }
    .card-head {
      font-size: 34px; font-weight: 900; color: ${headerColor};
      margin-bottom: 30px; padding-bottom: 16px; border-bottom: 3px dashed #E2E8F0;
      display: flex; align-items: center; gap: 14px;
    }
    .info-row {
      display: flex; align-items: flex-start; gap: 24px;
      margin-bottom: 26px;
    }
    .info-icon { font-size: 42px; line-height: 1; flex-shrink: 0; }
    .info-body { flex: 1; }
    .info-label { font-size: 22px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 4px; }
    .info-val { font-size: 34px; font-weight: 800; color: #1E293B; line-height: 1.35; }

    .whatsapp-badge {
      position: absolute; bottom: 180px; left: 60px; right: 60px;
      background: #ECFDF5; border: 3px solid #10B981;
      border-radius: 24px; padding: 22px 32px;
      display: flex; align-items: center; gap: 20px;
    }
    .wa-icon { font-size: 40px; }
    .wa-text { font-size: 26px; font-weight: 800; color: #065F46; line-height: 1.3; }

    .footer-bar {
      position: absolute; bottom: 70px; left: 60px; right: 60px;
      background: #0F172A; border-radius: 24px; padding: 22px 36px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left { font-size: 26px; font-weight: 800; color: #FBBF24; }
    .footer-right {
      font-size: 26px; font-weight: 900; color: #FFFFFF;
      background: #2563EB; padding: 8px 24px; border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand-pill">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">` : ''}
      <span class="brand-name">விழி தமிழ்நாடு</span>
    </div>
    <div class="alert-pill">${headerTag}</div>
  </div>

  <div class="main-title-box">
    <div class="title-text">${title}</div>
    <div class="sub-text">${subTitle}</div>
  </div>

  <div class="card-box">
    <div class="card-head">${cardHeading}</div>
    ${itemsHtml}
  </div>

  <div class="whatsapp-badge">
    <span class="wa-icon">📲</span>
    <span class="wa-text">உடனடி அறிவிப்புகளுக்கு VizhiTN வாட்ஸ்அப் சேனலை பின்தொடரவும்!</span>
  </div>

  <div class="footer-bar">
    <div class="footer-left">🔔 ${footerText}</div>
    <div class="footer-right">Subscribe</div>
  </div>
</body>
</html>`;
}

// --- MAIN RUNNER ---
async function main() {
  console.log('====================================================');
  console.log('VizhiTN Live Civic Alert Shorts Engine');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const leadPost = await getLeadCivicPost() || {
    title_ta: 'தாம்பரம் பகுதியில் இன்று மின்தடை அறிவிப்பு',
    area_name: 'தாம்பரம், பல்லாவரம்',
    district_slug: 'chennai',
    category_slug: 'electricity',
    alertType: 'electricity',
    assigned_department: 'TANGEDCO (Helpline: 1912)',
    location_text: 'காமராஜர் நெடுஞ்சாலை, பாலாஜி நகர், பெருங்களத்தூர்',
    content_ta: 'மின்வாரிய பராமரிப்பு பணி காரணமாக இன்று காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை மின்சாரம் நிறுத்தப்படும்.'
  };

  const isElectricity = leadPost.alertType === 'electricity' || leadPost.category_slug === 'electricity';
  const isHoliday = leadPost.alertType === 'holiday';

  const sessionDir = path.resolve(`scripts/youtube/assets/civic_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  let headerColor = isHoliday ? '#DC2626' : isElectricity ? '#D97706' : '#2563EB';
  let headerTag = isHoliday ? '🚨 பள்ளி விடுமுறை அறிவிப்பு' : isElectricity ? '⚡ மின்வாரிய நேரலை அறிவிப்பு' : '📢 அவசர உள்ளூர் அறிவிப்பு';

  let s1Items = [];
  let s2Items = [];
  let s3Items = [];
  let s1Spoken = '';
  let s2Spoken = '';
  let s3Spoken = '';
  let videoTitle = '';
  let videoDesc = '';

  if (isElectricity) {
    videoTitle = `⚡ ${leadPost.area_name || 'சென்னை'} பகுதிகளில் இன்று மின்தடை (TANGEDCO) | நேரலை பகுதிகள் #Shorts`;
    s1Spoken = `மின்வாரிய அவசர அறிவிப்பு! இன்று ${leadPost.area_name || 'உங்கள் பகுதியில்'} துணை மின்நிலைய பராமரிப்பு பணி காரணமாக மின்தடை அறிவிக்கப்பட்டுள்ளது. பொதுமக்கள் தங்கள் பணிகளை முன்கூட்டியே திட்டமிடுங்கள்.`;
    s1Items = [
      { icon: '📍', label: 'பாதிக்கப்படும் பகுதி', value: leadPost.area_name || 'சென்னை & புறநகர்' },
      { icon: '⚡', label: 'துறை', value: 'தமிழ்நாடு மின்வாரியம் (TANGEDCO)' },
      { icon: '⚠️', label: 'காரணம்', value: 'மாதாந்திர துணை மின்நிலைய பராமரிப்பு பணி' }
    ];

    s2Spoken = `மின்தடை நேரம்: காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை. பாதிக்கப்படும் முக்கிய இடங்கள்: ${leadPost.location_text || leadPost.area_name}. மின் விநியோகம் பணிகள் முடிந்தவுடன் முன்கூட்டியே வழங்கப்படும்.`;
    s2Items = [
      { icon: '⏰', label: 'மின்தடை நேரம்', value: 'காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை' },
      { icon: '🚧', label: 'குறிப்பிட்ட தெருக்கள்', value: leadPost.location_text || leadPost.area_name },
      { icon: '💡', label: 'மின் விநியோகம்', value: 'பராமரிப்பு பணி முடிந்ததும் உடனடியாக வழங்கப்படும்' }
    ];

    s3Spoken = `மின்தடை மற்றும் மின் கம்பிகள் அறுந்து விழுந்தால் அவசர உதவி பெற, மின்வாரியத்தின் மின்னகம் 24 மணி நேர உதவி எண் 1912-ஐ அழைக்கவும். இந்த தகவலை உடனே பகிருங்கள்.`;
    s3Items = [
      { icon: '📞', label: 'மின்னகம் 24x7 அவசர எண்', value: '1912 (கட்டணமில்லா சேவை)' },
      { icon: '📱', label: 'வாட்ஸ்அப் உதவி எண்', value: '94987 94987' },
      { icon: '🏛️', label: 'மாநில கட்டுப்பாட்டு அறை', value: '1100 (முதல்வர் உதவி மையம்)' }
    ];

  } else {
    // School Holiday / Emergency Weather Alert
    videoTitle = `🚨 ${leadPost.area_name || 'சென்னை'} பள்ளி கல்லூரிகளுக்கு விடுமுறை அறிவிப்பு! | மாவட்ட ஆட்சியர் #Shorts`;
    s1Spoken = `அவசர எச்சரிக்கை! வானிலை ஆய்வு மைய அறிவிப்பு மற்றும் பலத்த மழை காரணமாக ${leadPost.area_name || 'மாவட்டப் பகுதிகளில்'} பள்ளி மற்றும் கல்லூரிகளுக்கு விடுமுறை அறிவிக்கப்பட்டுள்ளது.`;
    s1Items = [
      { icon: '🏛️', label: 'அறிவிப்பு', value: 'பள்ளி மற்றும் கல்லூரிகளுக்கு விடுமுறை' },
      { icon: '📍', label: 'மாவட்டங்கள்', value: leadPost.area_name || 'சென்னை மற்றும் புறநகர்' },
      { icon: '🌧️', label: 'காரணம்', value: 'கனமழை மற்றும் வானிலை எச்சரிக்கை' }
    ];

    s2Spoken = `மாவட்ட ஆட்சியரின் உத்தரவின்படி பள்ளிகளுக்கு இன்று விடுமுறை அறிவிக்கப்பட்டுள்ளது. பொதுமக்கள் மற்றும் மாணவர்கள் தேவையின்றி வெளியே செல்வதைத் தவிர்க்கவும்.`;
    s2Items = [
      { icon: '🏫', label: 'கல்வி நிறுவனங்கள்', value: 'பள்ளிகள் மற்றும் கல்லூரிகள் இயங்காது' },
      { icon: '🚗', label: 'போக்குவரத்து ஆலோசனை', value: 'தேவையற்ற பயணங்களைத் தவிர்க்கவும்' },
      { icon: '📢', label: 'அதிகாரப்பூர்வ உத்தரவு', value: 'மாவட்ட ஆட்சியர் அலுவலக செய்திக்குறிப்பு' }
    ];

    s3Spoken = `அவசர உதவிக்கு மாநில பேரிடர் மேலாண்மை எண் 1070, மாவட்ட கட்டுப்பாட்டு எண் 1077, மற்றும் சென்னை மாநகராட்சி 1913-ஐ தொடர்பு கொள்ளவும்.`;
    s3Items = [
      { icon: '🚨', label: 'மாநில பேரிடர் மேலாண்மை', value: '1070' },
      { icon: '🏢', label: 'மாவட்ட ஆட்சியர் கட்டுப்பாடு', value: '1077' },
      { icon: '🌊', label: 'சென்னை மாநகராட்சி வெள்ள உதவி', value: '1913' },
      { icon: '⚡', label: 'மின்வாரிய அவசர உதவி', value: '1912' }
    ];
  }

  // Synthesize Speech & Render Frames
  console.log('[CIVIC RENDER] Scene 1...');
  const s1AudioPath = path.join(sessionDir, 'civic_audio_1.mp3');
  await synthesizeSpeech(s1Spoken, s1AudioPath);
  const s1Dur = getAudioDuration(s1AudioPath);
  const s1Html = generateCivicSlideHtml({
    slideNum: 1, headerTag, headerColor,
    title: leadPost.title_ta,
    subTitle: leadPost.area_name ? `பகுதி: ${leadPost.area_name}` : 'தமிழ்நாடு முக்கிய அறிவிப்பு',
    cardHeading: '📢 முக்கிய விவரங்கள்',
    items: s1Items,
    brandLogoDataUri
  });
  const s1Path = path.join(sessionDir, 'civic_slide_1.png');
  renderHtmlToImage(s1Html, s1Path, { width: 1080, height: 1920 });

  console.log('[CIVIC RENDER] Scene 2...');
  const s2AudioPath = path.join(sessionDir, 'civic_audio_2.mp3');
  await synthesizeSpeech(s2Spoken, s2AudioPath);
  const s2Dur = getAudioDuration(s2AudioPath);
  const s2Html = generateCivicSlideHtml({
    slideNum: 2, headerTag, headerColor,
    title: isElectricity ? 'மின்தடை பகுதிகள் & நேரம்' : 'விடுமுறை & பாதுகாப்பு விவரங்கள்',
    subTitle: 'அதிகாரப்பூர்வ அறிவிப்பு விவரம்',
    cardHeading: '⏰ நேரம் & இடங்கள்',
    items: s2Items,
    brandLogoDataUri
  });
  const s2Path = path.join(sessionDir, 'civic_slide_2.png');
  renderHtmlToImage(s2Html, s2Path, { width: 1080, height: 1920 });

  console.log('[CIVIC RENDER] Scene 3...');
  const s3AudioPath = path.join(sessionDir, 'civic_audio_3.mp3');
  await synthesizeSpeech(s3Spoken, s3AudioPath);
  const s3Dur = getAudioDuration(s3AudioPath);
  const s3Html = generateCivicSlideHtml({
    slideNum: 3, headerTag, headerColor,
    title: '24 மணி நேர அவசர உதவி எண்கள்',
    subTitle: 'உதவி தேவைப்பட்டால் உடனடியாக அழைக்கவும்',
    cardHeading: '📞 கட்டுப்பாட்டு மையங்கள்',
    items: s3Items,
    brandLogoDataUri
  });
  const s3Path = path.join(sessionDir, 'civic_slide_3.png');
  renderHtmlToImage(s3Html, s3Path, { width: 1080, height: 1920 });

  const scenes = [
    { imagePath: s1Path, slidePath: s1Path, audioPath: s1AudioPath, durationSec: Math.ceil(s1Dur) + 1 },
    { imagePath: s2Path, slidePath: s2Path, audioPath: s2AudioPath, durationSec: Math.ceil(s2Dur) + 1 },
    { imagePath: s3Path, slidePath: s3Path, audioPath: s3AudioPath, durationSec: Math.ceil(s3Dur) + 1 }
  ];

  const outputVideoPath = path.join(sessionDir, `Civic_Alert_${Date.now()}.mp4`);
  console.log('[COMPOSING SHORTS] Assembling Civic Alert Short...');
  assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath });
  console.log(`[VIDEO OK] Rendered: ${outputVideoPath}`);

  videoDesc = `${leadPost.title_ta}\n\nபகுதி: ${leadPost.area_name}\n${leadPost.content_ta}\n\nஅவசர உதவி எண்கள்:\nமின்னகம் மின்வாரியம்: 1912\nமாநகராட்சி: 1913\nபேரிடர் மேலாண்மை: 1070 / 1077\n\nதினசரி உடனடி தகவல்களுக்கு VizhiTN சேனலை Subscribe செய்யுங்கள்!\n\n#TamilNaduAlert #TANGEDCO #PowerCutToday #SchoolHoliday #ChennaiAlert #VizhiTN #Shorts`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log('[WHATSAPP AUTO-SHARE MOCK] Testing WhatsApp broadcast...');
    await shareYouTubeBroadcastToWhatsApp({
      videoId: 'DRY_RUN_MOCK_ID',
      videoUrl: 'https://youtube.com/shorts/DRY_RUN_MOCK_ID',
      title: videoTitle,
      description: videoDesc,
      isShort: true,
      category: 'civic-alert',
      dryRun: true
    });
    console.log('[SUCCESS ✓] Civic Alert pipeline dry run completed successfully.');
    return;
  }

  console.log('[YOUTUBE] Uploading Civic Short...');
  const res = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: videoTitle,
    description: videoDesc,
    tags: ['Tamil Nadu News', 'TANGEDCO Power Cut', 'School Holiday Alert', 'Chennai Rains', 'Shorts', 'VizhiTN'],
    categoryId: '25', // News & Politics
    privacyStatus: 'public',
    isShort: true
  });

  console.log(`[CIVIC SHORT PUBLISHED ✓] Live: ${res.videoUrl}`);

  // Automated WhatsApp Channel Broadcast
  try {
    console.log('[WHATSAPP DISPATCH] Broadcasting civic short to WhatsApp Channel...');
    await shareYouTubeBroadcastToWhatsApp({
      videoId: res.videoId,
      videoUrl: res.videoUrl,
      title: videoTitle,
      description: videoDesc,
      isShort: true,
      category: 'civic-alert',
      dryRun: false
    });
    console.log('[WHATSAPP DISPATCH ✓] Civic alert successfully delivered to WhatsApp Channel!');
  } catch (waErr) {
    console.warn('[WHATSAPP DISPATCH WARN] Could not post to WhatsApp Channel:', waErr.message);
  }
}

main().catch(err => {
  console.error('[FATAL CIVIC ALERT ERROR]:', err);
  process.exit(1);
});
