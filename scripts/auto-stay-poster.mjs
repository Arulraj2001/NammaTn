#!/usr/bin/env node
/**
 * VizhiTN Autonomous Stay & Room Directory Poster
 *
 * Uses Google Gemini (GOOGLE_API_KEY) + Cloudflare FLUX AI to publish
 * realistic, authentic student and IT professional PG/room accommodations
 * across Tamil Nadu tech and college corridors daily.
 *
 * Privacy Standards:
 * - contact_preference: "inquiry_form"
 * - Zero personal phone numbers exposed (protects admin privacy)
 * - Users submit direct on-page inquiry ("Check Vacancy")
 * - status: "active", safety_status: "verified", is_trusted: true
 */

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Load .env.local if present locally
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL || 'https://www.vizhitn.in';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'vizhitn-revalidate-secret-2026';

// Top Student & Tech Corridors in Tamil Nadu
const STAY_CORRIDORS = [
  {
    hub: 'Chennai OMR IT Corridor',
    district_slug: 'chengalpattu',
    district_name: 'Chengalpattu',
    areas: ['Navalur', 'Siruseri', 'Padur', 'Kelambakkam'],
    colleges: ['SSN College of Engineering', 'Hindustan University', 'Chettinad Medical'],
    offices: ['SIPCOT IT Park', 'TCS Siruseri', 'Cognizant Navalur'],
    rent_min: 5500,
    rent_max: 9500,
  },
  {
    hub: 'Chennai South & Central IT',
    district_slug: 'chennai',
    district_name: 'Chennai',
    areas: ['Velachery', 'Guindy', 'Sholinganallur', 'Thoraipakkam', 'Porur'],
    colleges: ['Anna University', 'IIT Madras', 'SRM Ramapuram'],
    offices: ['Olympia Tech Park', 'DLF Cybercity', 'Elcot SEZ Sholinganallur'],
    rent_min: 6500,
    rent_max: 11000,
  },
  {
    hub: 'Coimbatore Tech & Colleges',
    district_slug: 'coimbatore',
    district_name: 'Coimbatore',
    areas: ['Saravanampatti', 'Peelamedu', 'Gandhipuram', 'Kalapatti'],
    colleges: ['PSG Tech', 'CIT Coimbatore', 'KCT Saravanampatti'],
    offices: ['CHIL SEZ IT Park', 'TIDEL Park Coimbatore', 'Hanudev Info Park'],
    rent_min: 4500,
    rent_max: 7500,
  },
  {
    hub: 'Trichy & Madurai Student Hubs',
    district_slug: 'tiruchirappalli',
    district_name: 'Tiruchirappalli',
    areas: ['Thillai Nagar', 'KK Nagar', 'TVS Tollgate', 'NIT Corridor'],
    colleges: ['NIT Trichy', 'St. Joseph College', 'Bharathidasan University'],
    offices: ['ELCOT IT Park Navalpattu', 'BHEL Complex'],
    rent_min: 3500,
    rent_max: 6000,
  },
];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90) || `stay-${Date.now()}`;
}

async function runStayBot() {
  console.log('====================================================');
  console.log('🏠 VizhiTN Autonomous Stay Poster');
  console.log('   Timestamp:', new Date().toISOString());
  console.log('====================================================\n');

  if (!GOOGLE_API_KEY) {
    console.error('[FATAL] GOOGLE_API_KEY is not defined.');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[FATAL] Supabase credentials not found.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Pick corridor based on day of month to rotate evenly
  const dayIndex = new Date().getDate() % STAY_CORRIDORS.length;
  const targetCorridor = STAY_CORRIDORS[dayIndex];

  console.log(`[CORRIDOR] Selected Target Corridor: ${targetCorridor.hub} (${targetCorridor.district_name})`);

  // Prompt Gemini to generate authentic localized listings
  const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
  const prompt = `You are the authentic Tamil Nadu Stay & Rental Directory Curator for VizhiTN (vizhitn.in).
Generate exactly 3 realistic, authentic PG, hostel, or shared apartment listings for students and working professionals in:
Corridor: ${targetCorridor.hub}
District: ${targetCorridor.district_name} (Slug: ${targetCorridor.district_slug})
Possible Areas: ${targetCorridor.areas.join(', ')}
Key Landmark References: ${targetCorridor.offices.join(', ')} and ${targetCorridor.colleges.join(', ')}
Rent Budget Range: ₹${targetCorridor.rent_min} to ₹${targetCorridor.rent_max} per month.

Strict Rules:
1. Titles must be realistic (e.g., "Executive Single AC Room near SIPCOT Gate 1", "Ladies Luxury PG with 3-Time Food near PSG Tech").
2. Descriptions must sound authentic (mention walk distance to bus/metro, food menu, WiFi speed, power backup, study desk, washing machine).
3. Set "listing_type" to one of: "pg_available", "shared_room", "roommate_needed", "hostel".
4. Set "gender_preference" to one of: "boys", "girls", "co_living", "any".
5. Set "contact_preference" strictly to "inquiry_form".
6. Do NOT invent fake phone numbers or personal WhatsApp numbers. Leave phone and whatsapp as empty strings "".
7. Choose realistic amenities from: ["wifi", "ac", "food", "parking", "laundry", "power_backup", "security", "water"].

Return ONLY a valid JSON array of 3 objects with this exact structure:
[
  {
    "title": "Title here",
    "description": "Detailed description here",
    "listing_type": "pg_available",
    "district_slug": "${targetCorridor.district_slug}",
    "district_name": "${targetCorridor.district_name}",
    "area_name": "Specific Area Name",
    "landmark": "Near landmark name",
    "rent_amount": 6500,
    "rent_period": "monthly",
    "gender_preference": "boys",
    "occupancy_type": "single",
    "amenities": ["wifi", "ac", "food", "power_backup"],
    "nearby_college": "College Name",
    "nearby_office": "Office/IT Park Name",
    "nearby_metro": "Nearest Station or Bus Stop"
  }
]`;

  console.log('[AI] Querying Gemini 2.5 Flash for authentic localized listings...');
  let listings = [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '[]';
    listings = JSON.parse(text);
    console.log(`[AI ✓] Received ${listings.length} listings from Gemini.`);
  } catch (err) {
    console.error('[AI ERROR] Gemini generation failed:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(listings) || listings.length === 0) {
    console.warn('[AI WARN] No valid listings returned.');
    return;
  }

  // Generate Cloudflare FLUX images and insert into Supabase
  let successCount = 0;
  const { generateStayHeroImage } = await import('./lib/cloudflare-image.mjs');

  for (const item of listings) {
    try {
      const areaSlug = slugify(item.area_name);
      const slug = slugify(`${item.listing_type} ${item.title} in ${item.area_name}`);

      console.log(`\n[PROCESSING] "${item.title}" in ${item.area_name}, ${item.district_name}...`);

      // Try generating Cloudflare FLUX interior bedroom image
      let imageUrls = [];
      try {
        const fluxUrl = await generateStayHeroImage({
          title: item.title,
          location: `${item.area_name}, ${item.district_name}`,
          type: item.listing_type,
          slug,
        });
        if (fluxUrl) imageUrls.push(fluxUrl);
      } catch (imgErr) {
        console.warn(`[IMAGE WARN] FLUX image skipped: ${imgErr.message}`);
      }

      // If no FLUX generated, attach clean default fallback
      if (imageUrls.length === 0) {
        imageUrls.push('/images/hero/default-stay.webp');
      }

      const listingRecord = {
        title: item.title,
        description: item.description,
        listing_type: item.listing_type || 'pg_available',
        district_slug: item.district_slug || targetCorridor.district_slug,
        district_name: item.district_name || targetCorridor.district_name,
        area_slug: areaSlug,
        area_name: item.area_name || '',
        landmark: item.landmark || '',
        rent_amount: Number(item.rent_amount) || targetCorridor.rent_min,
        rent_period: 'monthly',
        gender_preference: item.gender_preference || 'any',
        occupancy_type: item.occupancy_type || 'single',
        amenities: Array.isArray(item.amenities) ? item.amenities : ['wifi', 'power_backup'],
        contact_preference: 'inquiry_form',
        phone: '',
        whatsapp: '',
        nearby_college: item.nearby_college || '',
        nearby_office: item.nearby_office || '',
        nearby_metro: item.nearby_metro || '',
        image_urls: imageUrls,
        slug,
        seo_title: `${item.title} in ${item.area_name}, ${item.district_name} - ₹${item.rent_amount}/mo | VizhiTN`,
        seo_description: `${item.title} available in ${item.area_name}, ${item.district_name}. Zero brokerage, direct concierge inquiry on VizhiTN.`,
        status: 'active',
        safety_status: 'verified',
        is_trusted: true,
        is_publicly_visible: true,
        is_indexable: true,
        view_count: Math.floor(Math.random() * 15) + 5,
        created_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('stay_listing')
        .insert(listingRecord)
        .select('id, title, slug')
        .single();

      if (error) {
        console.error(`[INSERT ERROR] Failed to save listing "${item.title}":`, error.message);
      } else {
        successCount++;
        console.log(`[PUBLISHED ✓] ID: ${data.id} | Slug: ${data.slug}`);
      }
    } catch (postErr) {
      console.error(`[POST ERROR] Error processing listing:`, postErr.message);
    }
  }

  console.log(`\n[COMPLETED] Successfully published ${successCount} stay listings to VizhiTN.`);

  // Purge Next.js Cache via /api/revalidate
  try {
    const revalRes = await fetch(`${SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': REVALIDATE_SECRET,
      },
      body: JSON.stringify({
        paths: ['/stay', `/${targetCorridor.district_slug}/stay`],
      }),
    });
    console.log(`[CACHE PURGE] Revalidated /stay: Status ${revalRes.status}`);
  } catch (revalErr) {
    console.warn(`[CACHE WARN] Revalidate ping skipped: ${revalErr.message}`);
  }
}

runStayBot();
