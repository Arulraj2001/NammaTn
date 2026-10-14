// src/lib/powerCutAreas.js
// Programmatic SEO data store for Power Cuts & Utility Shutdown Landing Pages.
// Maps all 38 districts to high-intent neighborhoods and substations.

import { DISTRICTS, DISTRICT_MAP } from '@/lib/seo-data';

// Custom Tamil translations for prominent localities across major Tamil Nadu hubs
const TAMIL_AREA_NAMES = {
  // Chennai
  'anna-nagar': 'அண்ணா நகர்',
  'velachery': 'வேளச்சேரி',
  'adyar': 'அடையாறு',
  'perambur': 'பெரம்பூர்',
  'ambattur': 'அம்பத்தூர்',
  'avadi': 'ஆவடி',
  'tambaram': 'தாம்பரம்',
  't-nagar': 'தி. நகர்',
  'porur': 'பொரூர்',
  'kk-nagar': 'கே.கே. நகர்',
  'chromepet': 'குரோம்பேட்டை',
  'sholinganallur': 'சோழிங்கநல்லூர்',
  'medavakkam': 'மேடவாக்கம்',
  'pallavaram': 'பல்லாவரம்',
  'alandur': 'ஆலந்தூர்',
  'guindy': 'கிண்டி',
  'mylapore': 'மயிலாப்பூர்',

  // Coimbatore
  'rs-puram': 'ஆர்.எஸ். புரம்',
  'gandhipuram': 'காந்திபுரம்',
  'peelamedu': 'பீளமேடு',
  'singanallur': 'சிங்காநல்லூர்',
  'saibaba-colony': 'சாய்பாபா காலனி',
  'ukkadam': 'உக்கடம்',
  'vadavalli': 'வடவள்ளி',
  'saravanampatti': 'சரவணம்பட்டி',
  'thudiyalur': 'துடியலூர்',
  'ganapathy': 'கணபதி',

  // Madurai
  'thirunagar': 'திருநகர்',
  'palanganatham': 'பழங்காநத்தம்',
  'arappalayam': 'ஆரப்பாளையம்',
  'goripalayam': 'கோரிப்பாளையம்',
  'tallakulam': 'தல்லாகுளம்',
  'simmakkal': 'சிம்மக்கல்',
  'villapuram': 'வில்லாபுரம்',

  // Tiruchirappalli
  'srirangam': 'ஸ்ரீரங்கம்',
  'ariyamangalam': 'அரியமங்கலம்',
  'thiruverumbur': 'திருவெறும்பூர்',
  'woraiyur': 'உறையூர்',
  'palakkarai': 'பாலக்கரை',
  'thillai-nagar': 'தில்லை நகர்',
  'cantonment': 'கண்டோன்மென்ட்',

  // Salem
  'shevapet': 'செவ்வாய்பேட்டை',
  'suramangalam': 'சூரமங்கலம்',
  'fairlands': 'ஃபேர்லேண்ட்ஸ்',
  'alagapuram': 'அழகாகபுரம்',
  'hasthampatti': 'அஸ்தம்பட்டி',
  'ammapet': 'அம்மாபேட்டை',
  'kondalampatti': 'கொண்டலாம்பட்டி',

  // Tirunelveli
  'palayamkottai': 'பாளையங்கோட்டை',
  'melapalayam': 'மேலப்பாளையம்',
  'nanguneri': 'நாங்குநேரி',
  'ambasamudram': 'அம்பாசமுத்திரம்',
  'cheranmahadevi': 'சேரன்மகாதேவி',
  'valliyur': 'வள்ளியூர்',
  'radhapuram': 'ராதாபுரம்',

  // Erode
  'perundurai': 'பெருந்துறை',
  'gobichettipalayam': 'கோபிசெட்டிபாளையம்',
  'bhavani': 'பவானி',
  'sathyamangalam': 'சத்தியமங்கலம்',
  'thindal': 'திண்டல்',
  'chithode': 'சித்தோடு',
  'kavindapadi': 'கவுந்தப்பாடி',

  // Vellore
  'katpadi': 'காட்பாடி',
  'sathuvachari': 'சத்துவாச்சாரி',
  'kosapet': 'கொசப்பேட்டை',
  'gandhinagar': 'காந்திநகர்',
  'vit-area': 'விஐடி பகுதி',
  'ariyur': 'அரியூர்',
  'virupatchipuram': 'விருபாட்சிபுரம்',

  // Krishnagiri
  'hosur': 'ஓசூர்',
  'denkanikottai': 'தேன்கனிக்கோட்டை',
  'bargur': 'பர்கூர்',
  'pochampalli': 'போச்சம்பள்ளி',
  'shoolagiri': 'சூளகிரி',
  'kelamangalam': 'கெலமங்கலம்',
  'mathur': 'மத்தூர்',

  // Chengalpattu
  'mahabalipuram': 'மாமல்லபுரம்',
  'cheyyur': 'செய்யூர்',
  'maduranthakam': 'மதுராந்தகம்',
  'vandalur': 'வண்டலூர்',
  'thiruporur': 'திருப்போரூர்',
  'chengalpattu-town': 'செங்கல்பட்டு நகரம்',
  'siruseri': 'சிறுசேரி',
  'kelambakkam': 'கேளம்பாக்கம்',
  'guduvanchery': 'கூடுவாஞ்சேரி',
  'maraimalai-nagar': 'மறைமலை நகர்',

  // Tiruvallur
  'ponneri': 'பொன்னேரி',
  'gummidipoondi': 'கும்மிடிப்பூண்டி',
  'tiruttani': 'திருத்தணி',
  'uthukottai': 'ஊத்துக்கோட்டை',
  'pallipat': 'பள்ளிப்பட்டு',
  'poonamallee': 'பூந்தமல்லி',
  'tiruvallur-town': 'திருவள்ளூர் நகரம்',

  // Nilgiris
  'ooty': 'ஊட்டி',
  'coonoor': 'குன்னூர்',
  'gudalur': 'கூடலூர்',
  'kotagiri': 'கோத்தகிரி',
  'udhagamandalam': 'உதகமண்டலம்',
  'kundah': 'குந்தா',

  // Kanyakumari
  'nagercoil': 'நாகர்கோவில்',
  'kanyakumari-town': 'கன்னியாகுமரி',
  'thuckalay': 'தக்கலை',
  'marthandam': 'மார்த்தாண்டம்',
  'padmanabhapuram': 'பத்மநாபபுரம்',
  'colachel': 'குளச்சல்',
  'killiyoor': 'கிள்ளியூர்',
};

export const slugifyArea = (text = '') => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Returns all mapped programmatic areas for a district.
 */
export const getPowerCutAreas = (districtSlug) => {
  const d = DISTRICT_MAP[districtSlug];
  if (!d || !d.neighborhoods) return [];

  return d.neighborhoods.map((name_en) => {
    const slug = slugifyArea(name_en);
    return {
      slug,
      name_en,
      name_ta: TAMIL_AREA_NAMES[slug] || name_en,
      district_slug: d.slug,
      district_name_en: d.name,
    };
  });
};

/**
 * Finds a specific area within a district by slug.
 */
export const getPowerCutArea = (districtSlug, areaSlug) => {
  const areas = getPowerCutAreas(districtSlug);
  return areas.find((a) => a.slug === areaSlug) || null;
};

/**
 * Generates all valid static params for Next.js generateStaticParams
 * Covers all 38 districts and their mapped localities.
 */
export const getAllPowerCutAreaStaticParams = () => {
  const params = [];
  DISTRICTS.forEach((d) => {
    if (Array.isArray(d.neighborhoods)) {
      d.neighborhoods.forEach((name_en) => {
        params.push({
          district: d.slug,
          area: slugifyArea(name_en),
        });
      });
    }
  });
  return params;
};
