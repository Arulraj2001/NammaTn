// scripts/youtube/engine/live-tangedco-generator.mjs
/**
 * VizhiTN Autonomous Real-Time TANGEDCO Power Cut & School Holiday Generator
 * Dynamically queries Supabase active civic database and Gemini Live Intelligence.
 * Produces high-retention 9:16 portrait broadcast payloads with viral crowd-sourced comment hooks.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { getTodayIst, getNowIst } from './calendar-reader.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CACHE_DIR = path.resolve('scripts/youtube/calendar');

export async function getOrGenerateTangedcoPayload(targetDateStr = null) {
  const today = targetDateStr || getTodayIst();
  const now = getNowIst();
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  const cacheFile = path.join(CACHE_DIR, `tangedco_payload_${today}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      if (data && data.type && data.areasList && data.areasList.length >= 3) {
        console.log(`[TANGEDCO GENERATOR ✓] Loaded cached broadcast payload for ${today}: "${data.titleTa}"`);
        return data;
      }
    } catch (_) {}
  }

  console.log(`[TANGEDCO GENERATOR] Synthesizing fresh dynamic utility payload for ${today}...`);

  // 1. Check if today is Sunday (TANGEDCO has zero scheduled shutdowns on Sundays)
  const isSunday = (now.dayOfWeek === 0);

  // 2. Query Supabase for active weather/rain alerts or school holidays
  let isRainHoliday = false;
  let activeRainPosts = [];
  try {
    const { data: rainData } = await supabase
      .from('post')
      .select('*')
      .eq('status', 'active')
      .in('category_slug', ['education', 'public-safety', 'environment'])
      .ilike('title_en', '%holiday%')
      .limit(5);

    if (rainData && rainData.length > 0) {
      isRainHoliday = true;
      activeRainPosts = rainData;
    }
  } catch (_) {}

  // 3. Query Supabase for active electricity power cut posts
  let activeElectricityPosts = [];
  try {
    const { data: ebData } = await supabase
      .from('post')
      .select('*')
      .eq('status', 'active')
      .eq('category_slug', 'electricity')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ebData && ebData.length > 0) {
      activeElectricityPosts = ebData;
    }
  } catch (_) {}

  const apiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key missing in environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  let prompt = '';
  if (isRainHoliday) {
    prompt = `
You are the Chief Civic Editor for Tamil Nadu at VizhiTN.
Generate a high-priority 60-second YouTube Short script and graphic card payload in TAMIL for SCHOOL & COLLEGE HOLIDAY ANNOUNCEMENTS today (${today}).

ACTIVE DATABASE REPORTS:
${JSON.stringify(activeRainPosts.map(p => ({ title: p.title_ta || p.title_en, dist: p.district_slug, content: p.content_ta })), null, 2)}

REQUIREMENTS:
1. "type": "school_holiday"
2. "titleTa": "தமிழ்நாடு பள்ளி & கல்லூரி விடுமுறை அறிவிப்பு | இன்றைய முக்கிய மாவட்டங்கள்"
3. "titleEn": "Tamil Nadu School & College Holiday Alerts Today | District Collector Updates"
4. "spokenHookTa": Urgent, crisp announcement hook: "கனமழை எதிரொலி! இன்று பள்ளி, கல்லூரிகளுக்கு விடுமுறை அறிவிக்கப்பட்ட மாவட்டங்களின் அதிகாரப்பூர்வ பட்டியல் இதோ!"
5. "spokenListTa": Fast-paced reading of affected districts (e.g. சென்னை, செங்கல்பட்டு, காஞ்சிபுரம், திருவள்ளூர், கடலூர், திருவாரூர்...).
6. "spokenCommentCtaTa": Crowd-sourced viral comment trigger: "உங்கள் மாவட்டத்தில் மழை பெய்கிறதா? பள்ளிக்கு விடுமுறை விடப்பட்டுள்ளதா என உங்கள் மாவட்டத்தின் பெயரை உடனே கீழே கமெண்ட் பண்ணுங்க! மற்ற பெற்றோர்களுக்கும் மாணவர்களுக்கும் உதவியாக இருக்கட்டும்! பேரிடர் அவசர உதவிக்கு 1070 மற்றும் 1077 எண்களை அழைக்கவும்."
7. "areasList": Array of 4-6 objects with "district": "...", "status": "பள்ளிகளுக்கு விடுமுறை" or "பள்ளி மற்றும் கல்லூரிகளுக்கு விடுமுறை", "authority": "மாவட்ட ஆட்சியர் உத்தரவு".
8. "timing": "இன்று முழு நாள்",
9. "helpline": "மாநில பேரிடர் கட்டுப்பாடு: 1070 | மாவட்ட கட்டுப்பாடு: 1077 | சென்னை மாநகராட்சி: 1913"

Return PURE, VALID JSON ONLY.
`;
  } else if (isSunday) {
    prompt = `
You are the Chief Transport & Civic Editor at VizhiTN.
Today is Sunday (${today}). TANGEDCO maintains ZERO scheduled power shutdowns on Sundays.
Generate a 60-second YouTube Short payload in TAMIL for SOUTHERN RAILWAY SUBURBAN WEEKEND LINE BLOCK & MAINTENANCE ALERTS (Beach-Tambaram, Central-Arakkonam / Gummidipoondi).

REQUIREMENTS:
1. "type": "railway_block"
2. "titleTa": "இன்று மின்சார ரயில் சேவை மாற்றம் | ஞாயிறு பராமரிப்பு பணி அறிவிப்பு"
3. "titleEn": "Chennai Suburban Train Service Changes Today | Southern Railway Line Block"
4. "spokenHookTa": "சென்னை புறநகர் ரயில் பயணிகளே கவனியுங்கள்! பராமரிப்பு பணி காரணமாக இன்று முக்கிய வழித்தடங்களில் மின்சார ரயில் சேவைகளில் மாற்றம் செய்யப்பட்டுள்ளது!"
5. "spokenListTa": Clear narration of canceled/diverted routes (தாம்பரம் - கடற்கரை, சென்ட்ரல் - அரக்கோணம்).
6. "spokenCommentCtaTa": "உங்கள் ஊரில் ரயில் இயங்குகிறதா? உங்கள் வழித்தட நிலவரத்தை உடனே கீழே கமெண்ட் பண்ணுங்க, மற்ற பயணிகளுக்கும் உதவியாக இருக்கட்டும்! ரயில்வே உதவிக்கு 139 எண்ணை அழையுங்கள்."
7. "areasList": Array of 4 objects with "district": "சென்னை & புறநகர்", "status": "பராமரிப்பு பணி", "authority": "தெற்கு ரயில்வே அறிவிப்பு".
8. "timing": "காலை 10:00 மணி முதல் மாலை 4:00 மணி வரை",
9. "helpline": "ரயில்வே பயணிகள் உதவி மையம்: 139"

Return PURE, VALID JSON ONLY.
`;
  } else {
    // Weekday / Saturday TANGEDCO Power Cut Shutdown
    const dbSummary = activeElectricityPosts.map(p => ({
      title: p.title_ta || p.title_en,
      district: p.district_slug,
      area: p.area_name,
      location: p.location_text
    }));

    prompt = `
You are the Chief Utility Editor at VizhiTN.
Generate an accurate, high-retention 60-second YouTube Short script and card payload in TAMIL for TANGEDCO SCHEDULED POWER SHUTDOWN TODAY (${today}).
Ensure all details reflect real urban circles across Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, Tiruppur, Erode, etc.).

ACTIVE DATABASE REPORTS:
${JSON.stringify(dbSummary, null, 2)}

CRUCIAL REQUIREMENTS:
1. "type": "tangedco_powercut"
2. "titleTa": "இன்று மின்தடை பகுதிகள் | TANGEDCO Power Cut Today | நேரம் & இடங்கள்"
3. "titleEn": "Tamil Nadu Power Cut Today | TANGEDCO Scheduled Maintenance Areas List"
4. "timing": "காலை 9:00 AM முதல் மதியம் 2:00 PM வரை" (or 5:00 PM)
5. "spokenHookTa": "மின்வாரிய பராமரிப்பு பணி காரணமாக இன்று காலை 9 மணி முதல் மதியம் 2 மணி வரை இந்த முக்கிய பகுதிகளில் மின்தடை இருக்கும் என டான்ஜெட்கோ அறிவித்துள்ளது!"
6. "spokenListTa": Fast, clear reading of 4-5 major circles and key areas (e.g. தாம்பரம் ஜிஎஸ்டி சாலை, அம்பத்தூர் தொழிற்பேட்டை, கோவை ஆர்.எஸ்.புரம், மதுரை சிம்மக்கல், திருச்சி தில்லை நகர்...).
7. "spokenCommentCtaTa": Exact viral crowd-sourced engagement hook: "இதில் உங்கள் பகுதி விடுபட்டுள்ளதா? உடனே உங்கள் மாவட்டம் மற்றும் பகுதியை கீழே கமெண்ட் பண்ணுங்க! உங்கள் ஊரில் மின்தடை உள்ளதா என மற்ற பொதுமக்களும் உடனே பார்த்து தெரிந்து கொள்ளட்டும்! மின் புகார்களுக்கு மின்னகம் 1912-ஐ உடனே அழையுங்கள்."
8. "areasList": Array of 4 to 6 objects with:
   - "district": District name in Tamil (e.g. "சென்னை", "கோவை", "மதுரை", "திருச்சி", "சேலம்")
   - "circle": Circle/Substation name (e.g. "தாம்பரம் & பெருங்களத்தூர்", "ஆர்.எஸ்.புரம்", "தில்லை நகர்")
   - "areas": String of key affected streets/neighborhoods
   - "timing": "9:00 AM - 2:00 PM"
9. "helpline": "TANGEDCO மின்னகம்: 1912 | வாட்ஸ்அப்: 94987 94987"
10. "websiteUrl": "https://vizhitn.in/power-cuts-today-tamil-nadu"

Return PURE, VALID JSON ONLY.
`;
  }

  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let payload = null;

  for (const model of models) {
    try {
      console.log(`[TANGEDCO GENERATOR] Querying Gemini API (${model})...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 2500
        }
      });

      const text = response.text.trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      payload = JSON.parse(cleaned);
      if (payload && payload.areasList && payload.areasList.length >= 3) {
        break;
      }
    } catch (err) {
      console.warn(`[TANGEDCO GENERATOR WARN] ${model} failed: ${err.message}. Retrying next...`);
    }
  }

  if (!payload) {
    throw new Error('Failed to generate TANGEDCO utility payload via Gemini.');
  }

  payload.date = today;
  fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`[TANGEDCO GENERATOR ✓] Successfully generated payload for ${today}: "${payload.titleTa}"`);
  return payload;
}

