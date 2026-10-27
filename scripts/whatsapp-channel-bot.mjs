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

import { generateVerifiedWhatsAppPost } from './whatsapp/engine/whatsapp-formatter.mjs';

export async function generateWhatsAppBulletin(post, options = {}) {
  const result = await generateVerifiedWhatsAppPost({ post, isForwardVariant: options.isForwardVariant });
  return result.message;
}

export { formatFallbackWhatsApp };

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
  console.log('VizhiTN — Autonomous WhatsApp Channel Dispatch Engine (Section 8 Verified)');
  console.log('====================================================');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch the 3 representative posts (Big numbers / Hosur EV or Srirangam Power, Cyber Scam, Poonamallee Metro)
  const { data: scamPost } = await supabase
    .from('post')
    .select('*')
    .eq('category_slug', 'public-safety')
    .ilike('title_ta', '%மோசடி%')
    .limit(1);

  const { data: metroArticle } = await supabase
    .from('tn_today')
    .select('*')
    .ilike('slug', '%poonamallee%')
    .limit(1);

  const { data: powerPost } = await supabase
    .from('post')
    .select('*')
    .eq('category_slug', 'electricity')
    .order('created_date', { ascending: false })
    .limit(1);

  const samplePosts = [
    {
      label: 'POST 1 (Big Numbers / Infrastructure & Power)',
      post: powerPost?.[0] || {
        title_ta: 'ஸ்ரீரங்கம் மின்தடை இன்று: முழு தெரு பட்டியல் & 9 மணி நேரம் மின் நிறுத்தம் விவரம்!',
        district_slug: 'tiruchirappalli',
        category_slug: 'electricity',
        content_ta: 'ஸ்ரீரங்கம் அம்மா மண்டபம் மற்றும் நான்கு சித்திரை வீதிகள் பகுதிகளில் காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை மின்சாரம் நிறுத்தப்படுகிறது. உதவிக்கு 1912.',
        slug: 'tiruchirappalli-power-cut-srirangam-20261027'
      }
    },
    {
      label: 'POST 2 (Cyber Scam / Fake EB Bill SMS)',
      post: scamPost?.[0] || {
        title_ta: 'போலி மின் கட்டண குறுஞ்செய்தி மோசடி எச்சரிக்கை: உங்கள் வங்கி கணக்குகளை பாதுகாக்கவும் — சைபர் கிராமுக்கு 1930',
        district_slug: 'chennai',
        category_slug: 'public-safety',
        content_ta: 'மின் கட்டணம் செலுத்தாததால் மின் இணைப்பு துண்டிக்கப்படும் என வரும் போலி குறுஞ்செய்திகளை நம்ப வேண்டாம். சைபர் கிரைம் உதவி எண் 1930.',
        slug: 'fake-electricity-bill-sms-cyber-scam-warning-20261026'
      }
    },
    {
      label: 'POST 3 (Metro News / Trial Run Status)',
      post: metroArticle?.[0] ? {
        title_ta: metroArticle[0].title_ta,
        district_slug: 'chennai',
        category_slug: 'transport',
        content_ta: metroArticle[0].summary_ta || metroArticle[0].subtitle_ta,
        slug: metroArticle[0].slug
      } : {
        title_ta: 'சென்னை மெட்ரோ இரண்டாம் கட்டம்: பூந்தமல்லி-போரூர் சோதனை ஓட்டம் தீவிரம்! திறப்பு எப்போது?',
        district_slug: 'chennai',
        category_slug: 'transport',
        content_ta: 'பூந்தமல்லி முதல் போரூர் வரையிலான 11.89 கி.மீ. உயர்மட்ட வழித்தடத்தில் ஓட்டுநர் இல்லா ரயில் சோதனை ஓட்டம் தீவிரப்படுத்தப்பட்டுள்ளது. மவுண்ட்-பூந்தமல்லி சாலை நெரிசலுக்கு இது பெரிய தீர்வாக அமையும். அதிகாரப்பூர்வ திறப்பு தேதி இன்னும் அறிவிக்கப்படவில்லை.',
        slug: 'chennai-metro-phase-2-poonamallee-to-porur-trial-runs-advance-towards-2027-public'
      }
    }
  ];

  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < samplePosts.length; i++) {
    const item = samplePosts[i];
    console.log(`\n====================================================`);
    console.log(`DEMO: ${item.label}`);
    console.log(`====================================================`);

    const oldVersion = formatFallbackWhatsApp(item.post);
    console.log('\n--- [OLD FORMAT WITH BILINGUAL LABELS & FOLLOW-LINK] ---');
    console.log(oldVersion);

    const result = await generateVerifiedWhatsAppPost({ post: item.post, isForwardVariant: false });
    console.log('\n--- [NEW SECTION 8 FORMAT (VERIFIED & CLEAN)] ---');
    console.log(result.message);

    console.log('\n--- [7-GATE VALIDATION AUDIT RESULT] ---');
    console.log('Passed:', result.validation.passed);
    console.log('Gates:', JSON.stringify(result.validation.gates, null, 2));

    const auditSlug = (item.post.slug || `wa-sample-${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const auditPath = path.join(outDir, `audit_wa_${auditSlug}.json`);
    fs.writeFileSync(auditPath, JSON.stringify({
      title: item.post.title_ta,
      slug: item.post.slug,
      old_version: oldVersion,
      new_version: result.message,
      validation: result.validation
    }, null, 2), 'utf-8');
    console.log(`[AUDIT SAVED] ${auditPath}`);
  }
}

if (process.argv[1]?.endsWith('whatsapp-channel-bot.mjs')) {
  main();
}
