// scripts/youtube/pipelines/generate-shorts.mjs
// Autonomous Conversational Spoken Tamil Daily Shorts Engine (3 Scenes, Ken Burns motion, Micro-TTS)

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil } from '../engine/tamil-phonetics.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateYouTubeSceneVisual } from '../engine/cloudflare-visuals.mjs';
import { uploadToYouTube } from '../engine/youtube-client.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';

// Load .env.local if running in local environment
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[FATAL] Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('====================================================');
  console.log('VizhiTN YouTube Automation — Conversational Spoken Tamil Short');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Fetch top 3 active alerts from Supabase
  console.log('[DATABASE] Fetching latest active civic alerts...');
  const { data: posts, error } = await supabase
    .from('post')
    .select('*')
    .eq('status', 'active')
    .order('created_date', { ascending: false })
    .limit(3);

  if (error || !posts || posts.length === 0) {
    console.error('[ERROR] Could not fetch active posts from Supabase:', error);
    process.exit(1);
  }

  console.log(`[INFO] Sourced ${posts.length} alerts for today's conversational short.`);

  const now = new Date();
  const dateStr = now.toLocaleDateString('ta-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  // 2. Draft Spoken Conversational Tamil Scripts for 3 Scenes
  const firstPost = posts[0];
  const firstArea = firstPost.area_name || firstPost.district_slug || 'தமிழ்நாடு';

  const scene1Script = [
    `ஹலோ மக்களே! இன்னைக்கு உங்க ஏரியால கரண்ட் கட் மற்றும் முக்கிய நிர்வாக அப்டேட்ஸ் இருக்கான்னு நோட் பண்ணிக்கோங்க!`
  ];

  const scene2Script = [];
  posts.forEach((p, idx) => {
    const area = p.area_name || p.district_slug || 'பகுதி';
    const cleanTitle = normalizeAcronymsToSpokenTamil(p.title_ta || p.title_en);
    if (p.category_slug === 'electricity') {
      scene2Script.push(`${area} ஏரியால பராமரிப்பு பணிகளுக்காக மின்சாரம் நிறுத்தம் செய்யப்படுது. போனை இப்போவே சார்ஜ் பண்ணி வெச்சுக்கோங்க மக்களே!`);
    } else if (p.category_slug === 'water-sanitation') {
      scene2Script.push(`${area} பகுதியில குடிநீர் குழாய் பராமரிப்பு வேலை நடக்குது. தண்ணிய முன்கூட்டியே பிடிச்சு வெச்சுக்கோங்க.`);
    } else {
      scene2Script.push(`அடுத்த முக்கிய தகவல்: ${cleanTitle}.`);
    }
  });

  const scene3Script = [
    normalizeAcronymsToSpokenTamil(`கரண்ட் கட் புகார்களுக்கு 1912 உதவி எண்ணையும், மாநகராட்சி புகார்களுக்கு 1913 எண்ணையும் உடனே அழைக்கலாம்.`),
    `உங்க ஏரியாவில நடக்கிற மக்கள் பிரச்சனைகளை vizhitn.in இணையதளத்தில் நீங்களே நேரடியாக பதிவு பண்ணுங்க. உங்க பக்கத்துல என்ன நடக்குதுன்னு எல்லாரும் தெரிஞ்சுக்கட்டும்! விழி தமிழ்நாடு சேனலை மறக்காம சப்ஸ்கிரைப் பண்ணிக்கோங்க!`
  ];

  // 3. Synthesize Audio for each scene with micro-chunk engine
  console.log('[TTS] Synthesizing Scene 1 audio (Spoken Hook)...');
  const s1AudioPath = path.join(outDir, `short_s1_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene1Script, s1AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s1Dur = getAudioDuration(s1AudioPath);

  console.log('[TTS] Synthesizing Scene 2 audio (Conversational Breakdown)...');
  const s2AudioPath = path.join(outDir, `short_s2_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene2Script, s2AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s2Dur = getAudioDuration(s2AudioPath);

  console.log('[TTS] Synthesizing Scene 3 audio (Helplines & CTA)...');
  const s3AudioPath = path.join(outDir, `short_s3_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene3Script, s3AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s3Dur = getAudioDuration(s3AudioPath);

  console.log(`[AUDIO STATS] S1: ${s1Dur.toFixed(1)}s, S2: ${s2Dur.toFixed(1)}s, S3: ${s3Dur.toFixed(1)}s | Total: ${(s1Dur + s2Dur + s3Dur).toFixed(1)}s`);

  // 4. Generate Visuals: Scene 1 FLUX Photo
  const fluxPrompt = `Indian electric linesman technician in safety helmet working on power lines transformer post in Tamil Nadu Chennai city street, daytime documentary shot`;
  const heroPhotoPath = path.join(outDir, `short_flux_hero_${Date.now()}.webp`);
  let heroPhotoUrl = await generateYouTubeSceneVisual(fluxPrompt, heroPhotoPath, '9:16');
  if (!heroPhotoUrl) {
    heroPhotoUrl = 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1080&q=80';
  }

  const brandLogoDataUri = getBrandLogoDataUri();

  // 5. Render Scene 1 Hook Frame (with Official Brand Logo)
  const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
  let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
  tplS1 = tplS1.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);
  tplS1 = tplS1.replace('{{SCENE_PHOTO_SRC}}', heroPhotoUrl);
  tplS1 = tplS1.replace('{{HOOK_HEADLINE_TA}}', `உங்க ஏரியால இன்னைக்கு கரண்ட் கட் இருக்கா?`);
  tplS1 = tplS1.replace('{{DATE_TEXT}}', dateStr);

  const s1FramePath = path.join(outDir, `short_s1_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS1, s1FramePath, { width: 1080, height: 1920 });

  // 6. Render Scene 2 Breakdown Frame (with Official Brand Logo)
  let cardsHtml = '';
  posts.forEach((p) => {
    const isWarn = p.urgency_level === 'high' || p.urgency_level === 'medium';
    const isDanger = p.urgency_level === 'critical';
    const cardClass = isDanger ? 'alert-card danger' : (isWarn ? 'alert-card warn' : 'alert-card');
    cardsHtml += `
      <div class="${cardClass}">
        <div class="card-top">
          <span class="cat-name">⚡ ${(p.category_slug || 'ALERT').toUpperCase()}</span>
          <span class="dist-name">📍 ${(p.district_slug || 'TN').toUpperCase()}</span>
        </div>
        <div class="card-title">${p.title_ta || p.title_en}</div>
        <div class="card-timing">நேரம்: காலை 9:00 முதல் மதியம் 2:00 வரை</div>
      </div>
    `;
  });

  const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-2-breakdown.html');
  let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
  tplS2 = tplS2.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);
  tplS2 = tplS2.replace('{{DIGEST_TITLE_TA}}', `இன்றைய முக்கிய நிர்வாக அறிவிப்புகள் (${timeStr})`);
  tplS2 = tplS2.replace('{{ALERTS_CARDS_HTML}}', cardsHtml);

  const s2FramePath = path.join(outDir, `short_s2_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS2, s2FramePath, { width: 1080, height: 1920 });

  // 7. Render Scene 3 Helpline Frame (with Official Brand Logo)
  const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-3-helpline.html');
  let tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
  tplS3 = tplS3.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);
  const s3FramePath = path.join(outDir, `short_s3_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

  // 8. Assemble Multi-Scene Video with Ken Burns Motion
  const videoOutputPath = path.join(outDir, `vizhitn_short_${Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling 3-Scene Video with Ken Burns Motion...');

  const scenes = [
    { imagePath: s1FramePath, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true },
    { imagePath: s2FramePath, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: false },
    { imagePath: s3FramePath, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: false }
  ];

  assembleMultiSceneShortsVideo({
    scenes,
    outputPath: videoOutputPath
  });

  console.log(`[COMPOSER] Video generated successfully: ${videoOutputPath}`);

  // 9. High-Ranking 2026 SEO Metadata (Bilingual Search Hook + First 125-Char Retention Formula)
  const leadAlert = posts[0] || {};
  const districtName = (leadAlert.district_slug || 'தமிழ்நாடு').toUpperCase();
  const ytTitle = `TN Power Cut & Civic Alerts Today | ${districtName} முக்கிய அறிவிப்புகள் #Shorts #VizhiTN`;

  const socialCaption = `⚡ ${districtName} நேரடி நிலவரம்: இன்றைய முக்கிய மின் தடை & குடிநீர் அறிவிப்புகள்! 👇\n\n` +
    `📌 உங்கள் பகுதி உள்ளதா என்பதைச் சரிபார்க்க சேமித்து (Save) வைத்துக் கொள்ளுங்கள்! நண்பர்களுக்கும் பகிருங்கள் ↗️\n\n` +
    `📞 TANGEDCO மின்னகம் மின் தடை புகார்: 1912 (24x7)\n` +
    `🏛️ மாநகராட்சி கட்டுப்பாட்டு அறை: 1913\n` +
    `🚨 தேசிய சைபர் கிரைம் உதவி எண்: 1930\n\n` +
    `💬 உங்கள் பகுதியில் தற்போதைய நிலவரம் என்ன? மின்சாரம் இருக்கிறதா? கமெண்டில் சொல்லுங்கள் 👇\n\n` +
    `🌐 மாவட்ட வாரியான முழு அறிவிப்புகளுக்கு: https://vizhitn.in\n\n` +
    `#TamilShorts #TNAlerts #TANGEDCO #PowerCut #Chennai #Coimbatore #VizhiTN #Shorts #SpokenTamil #CivicNews`;

  const tags = [
    'Tamil Nadu',
    'TANGEDCO',
    'Power Cut Today',
    'Minnalagam 1912',
    'Chennai Power Cut',
    'Coimbatore Alerts',
    'Civic News Tamil',
    'VizhiTN',
    'Shorts'
  ];

  // 10. Upload to YouTube
  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: socialCaption,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: true
  });

  console.log('====================================================');
  console.log('CONVERSATIONAL SHORT GENERATED & PUBLISHED TO YOUTUBE!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('====================================================');

  // 11. Cross-Post to Meta Socials (Instagram Reels & Facebook Videos)
  await crossPostVideoToMetaSocials({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    caption: socialCaption,
    isReel: true,
    isDryRun
  });

  // Cleanup temporary frame & audio files (keep final mp4)
  const temps = [s1FramePath, s2FramePath, s3FramePath, s1AudioPath, s2AudioPath, s3AudioPath, heroPhotoPath];
  for (const t of temps) {
    try { if (fs.existsSync(t)) fs.unlinkSync(t); } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN SHORTS PIPELINE]:', err);
  process.exit(1);
});
