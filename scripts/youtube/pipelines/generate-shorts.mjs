// scripts/youtube/pipelines/generate-shorts.mjs
// Daily Civic Shorts Generator (1080x1920, 9:16, 45-55s)

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { uploadToYouTube } from '../engine/youtube-client.mjs';

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
  console.log('VizhiTN YouTube Automation — Daily Civic Short');
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

  console.log(`[INFO] Found ${posts.length} alerts for today's short.`);

  // 2. Prepare date and text
  const now = new Date();
  const dateStr = now.toLocaleDateString('ta-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  // 3. Build HTML alert cards
  let alertsCardsHtml = '';
  posts.forEach((p, idx) => {
    const isWarn = p.urgency_level === 'high' || p.urgency_level === 'medium';
    const isDanger = p.urgency_level === 'critical';
    const cardClass = isDanger ? 'alert-card danger' : (isWarn ? 'alert-card warn' : 'alert-card');
    const districtText = p.district_slug ? p.district_slug.toUpperCase() : 'TAMIL NADU';

    alertsCardsHtml += `
      <div class="${cardClass}">
        <div class="card-top">
          <span class="card-category">⚡ ${p.category_slug ? p.category_slug.toUpperCase() : 'ALERT'}</span>
          <span class="card-district">📍 ${districtText}</span>
        </div>
        <div class="card-title">${p.title_ta || p.title_en}</div>
        <div class="card-detail">${(p.content_ta || p.content_en || '').slice(0, 110)}...</div>
      </div>
    `;
  });

  // 4. Fill HTML Template
  const templatePath = path.resolve('scripts/youtube/templates/shorts/daily-digest-card.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  html = html.replace('{{MAIN_HEADLINE_TA}}', `இன்றைய முக்கிய தமிழ்நாடு நிர்வாக அப்டேட்ஸ் (${timeStr})`);
  html = html.replace('{{DATE_TEXT}}', dateStr);
  html = html.replace('{{ALERTS_CARDS_HTML}}', alertsCardsHtml);

  // 5. Render 1080x1920 Frame
  const framePngPath = path.join(outDir, `short_frame_${Date.now()}.png`);
  console.log('[RENDERER] Rendering 1080x1920 9:16 frame...');
  renderHtmlToImage(html, framePngPath, { width: 1080, height: 1920 });
  console.log(`[RENDERER] Frame rendered: ${framePngPath}`);

  // 6. Generate Neural Tamil Voiceover Script & Audio
  let voiceScript = `வணக்கம். விழி தமிழ்நாடு தினசரி மாவட்ட செய்தி சுருக்கம். `;
  posts.forEach((p, idx) => {
    voiceScript += `செய்தி ${idx + 1}: ${p.title_ta || p.title_en}. ${(p.content_ta || p.content_en || '').slice(0, 100)}. `;
  });
  voiceScript += `அவசர மின்தடை புகார்களுக்கு 1912, மாநகராட்சி உதவிக்கு 1913 அழையுங்கள். முழு விவரங்களுக்கு விழி டிஎன் டாட் இன் வலைத்தளத்தைப் பார்வையிடுங்கள்.`;

  const audioPath = path.join(outDir, `short_audio_${Date.now()}.mp3`);
  console.log('[TTS] Synthesizing Tamil neural voiceover (ta-IN-PallaviNeural)...');
  await synthesizeSpeech(voiceScript, audioPath, {
    voice: YOUTUBE_CONFIG.voices.tamilFemale,
    rate: '+3%'
  });
  console.log(`[TTS] Audio synthesized: ${audioPath}`);

  // 7. Calculate Duration
  const duration = getAudioDuration(audioPath);
  console.log(`[AUDIO] Voiceover duration: ${duration.toFixed(1)} seconds`);

  // 8. Assemble 9:16 Shorts Video
  const videoOutputPath = path.join(outDir, `vizhitn_short_${Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling MP4 video with FFmpeg...');
  assembleShortsVideo({
    slideImagePath: framePngPath,
    audioPath,
    outputPath: videoOutputPath
  });
  console.log(`[COMPOSER] Video ready: ${videoOutputPath}`);

  // 9. Upload to YouTube
  const ytTitle = `TN Civic Updates Today | ${timeStr} Tamil Nadu Power, Water & Road Alerts #Shorts`;
  const ytDesc = `Daily Tamil Nadu Civic & Emergency Roundup. Verified TANGEDCO power shutdown, Metrowater, CMRL transit alerts, and official government helplines.\n\n🌐 Read full reports and file complaints at: https://vizhitn.in\n\n#TamilNadu #TANGEDCO #Chennai #Coimbatore #VizhiTN #Shorts`;
  const tags = ['Tamil Nadu', 'TANGEDCO', 'Chennai', 'Civic News', 'Minnalagam', 'Power Cut Today', 'VizhiTN', 'Shorts'];

  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: ytDesc,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: true
  });

  console.log('====================================================');
  console.log('SHORT PIPELINE COMPLETED SUCCESSFULLY!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('====================================================');

  // Cleanup temporary frame & audio files (keep mp4)
  try {
    if (fs.existsSync(framePngPath)) fs.unlinkSync(framePngPath);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
  } catch {}
}

main().catch(err => {
  console.error('[FATAL ERROR IN SHORTS PIPELINE]:', err);
  process.exit(1);
});
