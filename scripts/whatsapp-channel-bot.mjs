// scripts/whatsapp-channel-bot.mjs
/**
 * VizhiTN Autonomous WhatsApp Channel Dispatch Bot
 * Transforms active civic alerts into verified, high-forwarding WhatsApp Bulletins.
 * Connects to WhatsApp Channel (Newsletter) via Baileys auth credentials.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export async function generateWhatsAppBulletin(post) {
  if (!geminiApiKey) {
    return formatFallbackWhatsApp(post);
  }

  const prompt = `நீ VizhiTN செய்தி ஊடகத்தின் வாட்ஸ்அப் சேனல் தலைமை ஆசிரியர்.
தமிழ்நாடு மக்கள் தங்கள் குடும்ப வாட்ஸ்அப் குழுக்களில் உடனடியாக பகிர்ந்து எச்சரிக்கக்கூடிய ஒரு நம்பகமான செய்தி புல்லட்டின் (WhatsApp Bulletin) உருவாக்கு.

தகவல்கள்:
தலைப்பு: ${post.title_ta || post.title_en}
மாவட்டம்: ${post.district_slug || 'தமிழ்நாடு'}
பகுதி: ${post.area_name || post.district_slug}
வகை: ${post.category_slug}
விவரம்: ${post.content_ta || post.content_en}
துறை/ஹெல்ப்லைன்: ${post.assigned_department || '1100'}
இணைய இணைப்பு: https://www.vizhitn.in/post/${post.slug}

விதிகள்:
1. முதல் வரி: கவனத்தை ஈர்க்கும் எமோஜி + அழுத்தமான தலைப்பு (*Bold*).
2. முக்கிய தகவல்: எங்கு, என்ன நேரம், என்ன காரணம் என்பதை 2-3 சிறிய புல்லட் பாயிண்டுகளில் (*•*) கொடு.
3. உதவி எண்: அதிகாரப்பூர்வ உதவி எண்ணை 📞 அடையாளத்தோடு தெளிவாகக் கொடு.
4. இணைப்பு: முழு விவரம் படிக்க 👉 *முழு விவரம்:* https://www.vizhitn.in/post/${post.slug}
5. ஃபார்வர்டு கொக்கி (Forward Hook):
──────────────────────────────
📲 *இந்த செய்தியை பார்வர்டு வழியாக படிக்கிறீர்களா?*
உங்கள் மாவட்டத்தின் உடனடி மின்தடை, குடிநீர், பேருந்து, அவசர அறிவிப்புகளை உடனுக்குடன் பெற *VizhiTN* சேனலை உடனே Follow செய்யுங்கள்!
👉 *இலவசமாக இணைய:* https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228
──────────────────────────────
6. ரியாக்ஷன் தூண்டுதல் (Directory Ranking Trigger):
👇 *உங்கள் பகுதியிலும் இதே நிலை உள்ளதா? ஆம் என்றால் 👍 / இல்லை என்றால் ❌ ரியாக்ட் செய்யவும்!*

வெறும் வாட்ஸ்அப் மெசேஜ் உரையை மட்டும் (No markdown code blocks, plain text) அனுப்பு.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
      })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text.trim();
  } catch (err) {
    console.warn('[WhatsApp Bot] Gemini generation failed, using fallback template:', err.message);
  }

  return formatFallbackWhatsApp(post);
}

function formatFallbackWhatsApp(post) {
  const categoryEmoji = {
    electricity: '⚡',
    'water-sanitation': '💧',
    transport: '🚇',
    'public-safety': '🚨',
    'government-schemes': '📋',
    'road-infrastructure': '🚧'
  }[post.category_slug] || '📢';

  return `${categoryEmoji} *${post.title_ta || post.title_en}*

📍 *பகுதி:* ${post.area_name || post.district_slug}
🏛️ *துறை:* ${post.assigned_department || 'தமிழ்நாடு அரசு'}

${post.content_ta ? post.content_ta.slice(0, 200) + '...' : ''}

📞 *அவசர உதவி எண்:* ${post.assigned_department?.match(/\d{4,}/)?.[0] || '1100'}
👉 *முழு விவரம்:* https://www.vizhitn.in/post/${post.slug}

──────────────────────────────
📲 *இந்த செய்தியை பார்வர்டு (Forward) வழியாக படிக்கிறீர்களா?*
உங்கள் மாவட்டத்தின் உடனடி மின்தடை, குடிநீர், பேருந்து, அவசர அறிவிப்புகளை உடனுக்குடன் பெற *VizhiTN* சேனலை உடனே Follow செய்யுங்கள்!
👉 *இலவசமாக இணைய:* https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228
──────────────────────────────

👇 *உங்கள் பகுதியில் இதே நிலை உள்ளதா? ஆம் என்றால் 👍 / இல்லை என்றால் ❌ ரியாக்ட் செய்யவும்!*`;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN — Autonomous WhatsApp Channel Dispatch Engine');
  console.log('====================================================');

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: posts, error } = await supabase
    .from('post')
    .select('*')
    .eq('status', 'active')
    .order('created_date', { ascending: false })
    .limit(3);

  if (error || !posts || posts.length === 0) {
    console.log('[WhatsApp Bot] No active posts found.');
    return;
  }

  console.log(`[WhatsApp Bot] Fetched ${posts.length} latest active civic posts.\n`);

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`------------------ BULLETIN #${i + 1} ------------------`);
    const message = await generateWhatsAppBulletin(post);
    console.log(message);
    console.log('----------------------------------------------------\n');
  }
}

if (process.argv[1]?.endsWith('whatsapp-channel-bot.mjs')) {
  main();
}
