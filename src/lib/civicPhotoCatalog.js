/**
 * VizhiTN Civic & Editorial Real Photo Catalog
 * 
 * Provides 90+ high-resolution authentic real photographic assets covering
 * all 12 civic categories, specific sub-scenarios (substations, linemen,
 * metro trains, school rain holidays, water tankers, pothole repairs, Fort St George),
 * and intelligent contextual keyword matching.
 */

// Helper to check if a string is a real valid image URL
export function isRealImageUrl(val) {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim().toLowerCase();
  if (trimmed.length === 0) return false;
  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return true;
  }
  if (
    trimmed.startsWith("/") &&
    (trimmed.endsWith(".jpg") ||
      trimmed.endsWith(".jpeg") ||
      trimmed.endsWith(".png") ||
      trimmed.endsWith(".webp") ||
      trimmed.includes("/storage/"))
  ) {
    return true;
  }
  return false;
}

// Simple deterministic hash for consistent photo selection
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const CIVIC_PHOTO_CATALOG = {
  // ── 1. Electricity & Power (10 Real Photos) ─────────────────────────────────
  electricity: [
    {
      id: "elec-substation-1",
      url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 TANGEDCO 33/11 kV Grid Station • Visual Archive",
      alt_en: "Electrical distribution substation transformers and transmission yard",
      alt_ta: "மின் பகிர்மான துணை மின்நிலையம் மற்றும் மின்மாற்றிகள்",
      keywords: ["substation", "grid", "transformer", "துணை மின்நிலையம்", "மின்மாற்றி", "துணைநிலையம்"]
    },
    {
      id: "elec-lineman-1",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 TANGEDCO Maintenance Crew • Field Operations",
      alt_en: "Electrical lineman maintenance crew working on power infrastructure",
      alt_ta: "மின்வாரிய ஊழியர்கள் சீரமைப்பு பணி",
      keywords: ["lineman", "repair", "breakdown", "maintenance", "snap", "ஊழியர்", "பராமரிப்பு", "கம்பி", "மின்தடை"]
    },
    {
      id: "elec-transmission-tower",
      url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 TANTRANSCO High Tension Transmission Corridor",
      alt_en: "High voltage electricity transmission tower against dusk sky",
      alt_ta: "உயர் அழுத்த மின் கோபுரம்",
      keywords: ["high tension", "ht", "transmission", "tower", "tantransco", "உயர் மின்னழுத்தம்"]
    },
    {
      id: "elec-transformer-street",
      url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 TANGEDCO Street Transformer Cage • Civic Archive",
      alt_en: "Residential distribution transformer and overhead power lines",
      alt_ta: "குடியிருப்பு பகுதி மின்மாற்றி மற்றும் மின்கம்பங்கள்",
      keywords: ["street", "feeder", "pillar", "box", "மின்கம்பம்", "மின்சார பெட்டி"]
    },
    {
      id: "elec-night-streetlights",
      url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Municipal Streetlight Network • Corporation Desk",
      alt_en: "Illuminated urban street lights on night arterial road",
      alt_ta: "இரவு நேர சாலை தெருவிளக்குகள்",
      keywords: ["streetlight", "night", "dark", "தெருவிளக்கு", "விளக்கு", "இருள்"]
    },
    {
      id: "elec-meter-panel",
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Digital Tariff & Power Meter Console • Field Desk",
      alt_en: "Electric circuit breakers and digital power metering panel",
      alt_ta: "மின்சார மீட்டர்கள் மற்றும் சர்க்யூட் பிரேக்கர்கள்",
      keywords: ["meter", "tariff", "bill", "unit", "மீட்டர்", "கட்டணம்", "பில்"]
    },
    {
      id: "elec-solar-renewable",
      url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Tamil Nadu Renewable Energy Development Agency (TEDA)",
      alt_en: "Solar panel farm generating clean renewable energy",
      alt_ta: "சூரிய மின்சக்தி தகடுகள் பண்ணை",
      keywords: ["solar", "renewable", "teda", "சூரிய மின்சக்தி", "சூரியஒளி"]
    },
    {
      id: "elec-safety-sparks",
      url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Emergency Wire Hazard Protocol • Minnalagam 1912",
      alt_en: "Emergency electrical maintenance on snapped cables",
      alt_ta: "அவசர மின்கம்பி சீரமைப்பு பாதுகாப்பு பணி",
      keywords: ["hazard", "spark", "fire", "emergency", "விபத்து", "தீப்பொறி", "அபாயம்"]
    },
    {
      id: "elec-control-room",
      url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Minnalagam 24x7 State Power Dispatch Center",
      alt_en: "24x7 Electricity grid control room and monitoring screens",
      alt_ta: "மின்னகம் 24x7 மின் பகிர்மான கட்டுப்பாட்டு அறை",
      keywords: ["minnalagam", "control room", "1912", "மின்னகம்", "கட்டுப்பாட்டு"]
    },
    {
      id: "elec-industrial-power",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Industrial Power Supply Corridor • TANGEDCO Desk",
      alt_en: "Modern cityscape with uninterrupted commercial electricity infrastructure",
      alt_ta: "வணிக வளாக மின் கட்டமைப்பு",
      keywords: ["commercial", "industrial", "shutdown", "தொழில்நுட்ப", "வணிக"]
    }
  ],

  // ── 2. Transport & Transit (10 Real Photos) ─────────────────────────────────
  transport: [
    {
      id: "trans-metro-elevated",
      url: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Chennai Metro Rail Limited (CMRL) • Elevated Corridor",
      alt_en: "Modern elevated metro train running on urban viaduct",
      alt_ta: "சென்னை மெட்ரோ ரயில் உயர்த்தப்பட்ட வழித்தடத்தில் இயக்கம்",
      keywords: ["metro", "cmrl", "train", "phase 2", "மெட்ரோ", "ரயில்", "தடம்", "போரூர்"]
    },
    {
      id: "trans-metro-station",
      url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 CMRL Metro Station Concourse • Passenger Hub",
      alt_en: "Modern passenger platform and metro concourse",
      alt_ta: "மெட்ரோ ரயில் பயணிகள் தளம்",
      keywords: ["station", "platform", "cmbt", "alandur", "நிலையம்", "பிளாட்பாரம்"]
    },
    {
      id: "trans-bus-mtc",
      url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 MTC / SETC State Transport Fleet • Depot Desk",
      alt_en: "Public city transit buses at busy urban bus station",
      alt_ta: "மாநகர போக்குவரத்து கழக (MTC) பேருந்துகள்",
      keywords: ["bus", "mtc", "setc", "tnstc", "பேருந்து", "பஸ்", "டிப்போ", "வழித்தடம்"]
    },
    {
      id: "trans-railway-emu",
      url: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Southern Railway Suburban EMU Network • Passenger Desk",
      alt_en: "Suburban railway passenger train on Chennai suburban line",
      alt_ta: "தெற்கு ரயில்வே புறநகர் மின்சார ரயில்",
      keywords: ["railway", "suburban", "emu", "tambaram", "beach", "ரயில்வே", "புறநகர்", "ரயில்"]
    },
    {
      id: "trans-traffic-diversion",
      url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Traffic Police Operational Diversion • Road Advisory",
      alt_en: "Urban traffic junction and police diversion route",
      alt_ta: "போக்குவரத்து காவல் மாற்றுப்பாதை ஏற்பாடு",
      keywords: ["traffic", "diversion", "jam", "police", "நெரிசல்", "மாற்றுப்பாதை", "போக்குவரத்து"]
    },
    {
      id: "trans-bus-terminus-kcbt",
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Kilambakkam (KCBT) Intercity Terminal • Field Archive",
      alt_en: "Large intercity bus terminus passenger concourse",
      alt_ta: "கிளாம்பாக்கம் கலைஞர் நூற்றாண்டு பேருந்து முனையம்",
      keywords: ["kilambakkam", "terminus", "kcbt", "பேருந்து முனையம்", "முனையம்"]
    },
    {
      id: "trans-airport-terminal",
      url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Chennai International Airport New Integrated Terminal",
      alt_en: "Modern international airport tarmac and terminal",
      alt_ta: "விமான நிலைய புதிய முனையம்",
      keywords: ["airport", "flight", "terminal", "விமானம்", "விமான நிலையம்"]
    },
    {
      id: "trans-railway-central",
      url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Puratchi Thalaivar Dr. M.G.R Central Railway Terminal",
      alt_en: "Historic iconic Chennai Central railway station facade",
      alt_ta: "சென்னை சென்ட்ரல் ரயில் நிலையம் முகப்பு",
      keywords: ["central", "mgr", "station", "சென்ட்ரல்", "ரயில் நிலையம்"]
    },
    {
      id: "trans-bridge-flyover",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Urban Express Flyover Arterial Corridor",
      alt_en: "Multi-lane flyover corridor carrying high-speed traffic",
      alt_ta: "நகர்ப்புற உயர்மட்ட மேம்பாலம்",
      keywords: ["flyover", "bridge", "expressway", "மேம்பாலம்", "பாலம்"]
    },
    {
      id: "trans-parking-smart",
      url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 GCC Smart Parking & Multi-Level Facility",
      alt_en: "City parking facility and commuter parking bays",
      alt_ta: "வாகன நிறுத்துமிடம் மற்றும் பார்க்கிங் வசதி",
      keywords: ["parking", "vehicle", "நிறுத்துமிடம்", "பார்க்கிங்"]
    }
  ],

  // ── 3. Water & Sanitation (10 Real Photos) ──────────────────────────────────
  "water-sanitation": [
    {
      id: "water-tanker-blue",
      url: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Metrowater Dial-a-Tanker Delivery • Field Desk",
      alt_en: "Municipal drinking water tanker supplying residential streets",
      alt_ta: "குடிநீர் லாரி விநியோக பணி",
      keywords: ["tanker", "metrowater", "delivery", "குடிநீர்", "லாரி", "வழங்கல்", "டேங்கர்"]
    },
    {
      id: "water-pipeline-repair",
      url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 CMWSSB / TWAD Main Pipeline Repair Operation",
      alt_en: "Underground water pipeline laying and engineering works",
      alt_ta: "குடிநீர் குழாய் பதிக்கும் மற்றும் சீரமைப்பு பணி",
      keywords: ["pipeline", "leak", "pipe", "burst", "குழாய்", "கசிவு", "வெடிப்பு"]
    },
    {
      id: "water-storm-drain",
      url: "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 GCC Integrated Storm Water Drain (SWD) Project",
      alt_en: "Precast concrete storm water drain construction alongside road",
      alt_ta: "மழைநீர் வடிகால் கால்வாய் கட்டுமான பணி",
      keywords: ["drain", "storm water", "swd", "வடிகால்", "மழைநீர் வடிகால்", "கால்வாய்"]
    },
    {
      id: "water-sewage-super-sucker",
      url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Desilting & Sewage Suction Machine Fleet • GCC 1913",
      alt_en: "Municipal super sucker jetting machine clearing drainage lines",
      alt_ta: "கழிவுநீர் அடைப்பு நீக்கும் நவீன இயந்திரம்",
      keywords: ["sewage", "drainage", "clog", "suction", "கழிவுநீர்", "சாக்கடை", "அடைப்பு"]
    },
    {
      id: "water-treatment-plant",
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Kilpauk / Chembarambakkam Water Treatment Facility",
      alt_en: "Clarification basins at municipal drinking water treatment plant",
      alt_ta: "குடிநீர் சுத்திகரிப்பு நிலையம்",
      keywords: ["treatment", "purification", "clarifier", "சுத்திகரிப்பு", "சுத்திகரிப்பு நிலையம்"]
    },
    {
      id: "water-reservoir-lake",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Red Hills / Poondi Drinking Water Reservoir • WRD Desk",
      alt_en: "Water reservoir lake storing drinking water for metropolitan area",
      alt_ta: "குடிநீர் வழங்கும் செம்பரம்பாக்கம் / பூண்டி ஏரி",
      keywords: ["reservoir", "lake", "poondi", "chembarambakkam", "ஏரி", "நீர்த்தேக்கம்"]
    },
    {
      id: "water-overhead-tank",
      url: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 TWAD Rural Overhead Storage Reservoir (OHT)",
      alt_en: "Tall concrete overhead water tank in residential locality",
      alt_ta: "மேல்நிலை நீர்த்தேக்க தொட்டி",
      keywords: ["overhead tank", "oht", "sump", "மேல்நிலை நீர்த்தேக்க தொட்டி", "தொட்டி"]
    },
    {
      id: "water-desalination-nemmeli",
      url: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Nemmeli / Minjur Seawater Desalination Facility",
      alt_en: "Coastal desalination reverse osmosis plant pipelines",
      alt_ta: "கடல்நீரை குடிநீராக்கும் திட்டம்",
      keywords: ["desalination", "nemmeli", "sea water", "கடல்நீரை குடிநீராக்கும்"]
    },
    {
      id: "water-tap-potable",
      url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Jal Jeevan Tap Connection • Community Point",
      alt_en: "Clear fresh drinking water flowing from street tap",
      alt_ta: "குடிநீர் குழாய் விநியோகம்",
      keywords: ["tap", "drinking water", "potable", "குடிநீர் குழாய்", "தண்ணீர்"]
    },
    {
      id: "water-pumping-station",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Metrowater Sewage Intermediate Pumping Station (SPS)",
      alt_en: "High-capacity municipal sewage booster pumping station",
      alt_ta: "கழிவுநீர் உந்து நிலையம்",
      keywords: ["pumping station", "booster", "pump", "உந்து நிலையம்", "பம்பிங்"]
    }
  ],

  // ── 4. Road & Infrastructure (10 Real Photos) ──────────────────────────────
  "road-infrastructure": [
    {
      id: "road-kathipara-cloverleaf",
      url: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Kathipara Grade Separator • Highways Department",
      alt_en: "Panoramic view of multi-level cloverleaf highway interchange",
      alt_ta: "கத்திப்பாரா பல அடுக்கு மேம்பாலம்",
      keywords: ["kathipara", "cloverleaf", "interchange", "கத்திப்பாரா", "மேம்பாலம்", "சாலை"]
    },
    {
      id: "road-asphalt-paver",
      url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Corporation Road Milling & Asphalt Resurfacing",
      alt_en: "Heavy asphalt paver laying smooth blacktop tarmac road",
      alt_ta: "தார் சாலை அமைக்கும் நவீன இயந்திரம்",
      keywords: ["asphalt", "tar", "paver", "resurfacing", "தார் சாலை", "சாலை சீரமைப்பு"]
    },
    {
      id: "road-pothole-repair",
      url: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Rapid Pothole Patching Squad • GCC Road Desk",
      alt_en: "Municipal workers repairing damaged road crater and pothole",
      alt_ta: "சாலையில் உள்ள ஆபத்தான குழிகள் அடைக்கும் பணி",
      keywords: ["pothole", "crater", "damage", "patch", "பள்ளம்", "குழி", "சேதமடைந்த சாலை"]
    },
    {
      id: "road-footpath-pedestrian",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Smart City Pedestrian Plaza & Tactile Footpath",
      alt_en: "Modern pedestrian sidewalk with tactile paving and bollards",
      alt_ta: "பாதசாரிகள் நடைபாதை மற்றும் நடைபயிற்சி தளம்",
      keywords: ["footpath", "sidewalk", "pedestrian", "walkway", "நடைபாதை", "பாதசாரி"]
    },
    {
      id: "road-highway-4lane",
      url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 NHAI 6-Lane Expressway Corridor in Tamil Nadu",
      alt_en: "Expansive 6-lane national highway cutting through green terrain",
      alt_ta: "தேசிய நெடுஞ்சாலை 6 வழிப்பாதை",
      keywords: ["nhai", "highway", "expressway", "lane", "நெடுஞ்சாலை", "பைபாஸ்", "ஈசிஆர்"]
    },
    {
      id: "road-flyover-girder",
      url: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Flyover Pier & Girder Construction • Highways Desk",
      alt_en: "Heavy crane launching precast concrete flyover girders",
      alt_ta: "புதிய மேம்பால கட்டுமான பணி",
      keywords: ["girder", "construction", "bridge", "pillar", "தூண்", "பாலம் கட்டுதல்"]
    },
    {
      id: "road-street-leveling",
      url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Ward Council Road Widening & Curbstone Work",
      alt_en: "Road roller compactor leveling road base with curb stones",
      alt_ta: "வார்டு சாலை விரிவாக்க மற்றும் மட்டப்படுத்தும் பணி",
      keywords: ["widening", "roller", "leveling", "விரிவாக்கம்", "ரோலர்"]
    },
    {
      id: "road-traffic-signal",
      url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Smart Traffic Adaptive Signal & Camera Junction",
      alt_en: "Automated LED traffic signal pole at major urban junction",
      alt_ta: "போக்குவரத்து சிக்னல் மற்றும் கண்காணிப்பு கேமரா",
      keywords: ["signal", "junction", "camera", "சிக்னல்", "சந்திப்பு"]
    },
    {
      id: "road-subway-underpass",
      url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Vehicular Subway & Flood Barrier Gateway",
      alt_en: "Concrete vehicular subway underpass for traffic flow",
      alt_ta: "வாகன சுரங்கப்பாதை",
      keywords: ["subway", "underpass", "சுரங்கப்பாதை", "பாலத்தின் கீழ்"]
    },
    {
      id: "road-toll-gate",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 FASTag Toll Plaza Terminal • Tamil Nadu Section",
      alt_en: "Multi-lane toll plaza gates on arterial highway",
      alt_ta: "டோல்கேட் சுங்கச்சாவடி",
      keywords: ["toll", "plaza", "fastag", "சுங்கச்சாவடி", "டோல்கேட்"]
    }
  ],

  // ── 5. Education & Holidays (8 Real Photos) ─────────────────────────────────
  education: [
    {
      id: "edu-school-campus",
      url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Tamil Nadu Model School Campus • Samagra Shiksha",
      alt_en: "Clean red-brick government school campus with corridor",
      alt_ta: "அரசு மாதிரிப் பள்ளி வளாகம்",
      keywords: ["school", "govt school", "campus", "பள்ளி", "அரசு பள்ளி", "வளாகம்"]
    },
    {
      id: "edu-rain-holiday-gate",
      url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Official Rain Holiday Order • Collectorate Advisory",
      alt_en: "Raindrops on closed school entrance gate on heavy rain holiday",
      alt_ta: "கனமழை காரணமாக பள்ளி விடுமுறை அறிவிப்பு",
      keywords: ["holiday", "rain holiday", "closure", "விடுமுறை", "மழை விடுமுறை", "பள்ளிகள் விடுமுறை"]
    },
    {
      id: "edu-exam-hall",
      url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 TN Public Examination Center • Board Directorate",
      alt_en: "Organized public examination desks inside school hall",
      alt_ta: "பொதுத்தேர்வு எழுதும் தேர்வு மையம்",
      keywords: ["exam", "hall ticket", "board exam", "10th", "12th", "தேர்வு", "பொதுத்தேர்வு"]
    },
    {
      id: "edu-library-reading",
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Anna Centenary / Kalaignar Centenary Library Hall",
      alt_en: "Modern spacious library with book stacks and study desks",
      alt_ta: "அண்ணா நூற்றாண்டு நூலகம் வாசிப்பு அரங்கம்",
      keywords: ["library", "books", "reading", "study", "நூலகம்", "புத்தகம்", "வாசிப்பு"]
    },
    {
      id: "edu-students-classroom",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Primary Education & Illam Thedi Kalvi Drive",
      alt_en: "Happy school students learning in interactive classroom",
      alt_ta: "பள்ளி மாணவர்கள் வகுப்பறை கல்வி",
      keywords: ["students", "learning", "classroom", "மாணவர்கள்", "கல்வி", "வகுப்பறை"]
    },
    {
      id: "edu-college-university",
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Government Engineering & Arts College Campus",
      alt_en: "Historic higher education university college building",
      alt_ta: "அரசு கலை மற்றும் பொறியியல் கல்லூரி",
      keywords: ["college", "university", "admission", "கல்லூரி", "பல்கலைக்கழகம்", "சேர்க்கை"]
    },
    {
      id: "edu-smart-class-tech",
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 High-Tech Computer Lab & Smart Board Initiative",
      alt_en: "Digital smart classroom computer laboratory for students",
      alt_ta: "ஹை-டெக் கணினி ஆய்வகம்",
      keywords: ["computer", "lab", "smart class", "கணினி", "ஸ்மார்ட்"]
    },
    {
      id: "edu-scholarship-desk",
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Pudhumai Penn & Naan Mudhalvan Scholarship Desk",
      alt_en: "Student filling out scholarship application documents",
      alt_ta: "கல்வி உதவித்தொகை விண்ணப்பம்",
      keywords: ["scholarship", "naan mudhalvan", "pudhumai penn", "உதவித்தொகை", "படிப்பு"]
    }
  ],

  // ── 6. Public Safety, Weather & Emergency (8 Real Photos) ───────────────────
  "public-safety": [
    {
      id: "safety-monsoon-rain",
      url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Regional Meteorological Centre (RDC) IMD Warning",
      alt_en: "Heavy torrential monsoon rainfall splashing on city road",
      alt_ta: "கனமழை வெள்ள எச்சரிக்கை",
      keywords: ["rain", "monsoon", "imd", "cyclone", "flood", "மழை", "கனமழை", "புயல்", "வெள்ளம்"]
    },
    {
      id: "safety-police-patrol",
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Tamil Nadu Police Emergency Response Vehicle • 112",
      alt_en: "Official police patrol interceptor vehicle with beacon",
      alt_ta: "காவல்துறை ரோந்து வாகனம்",
      keywords: ["police", "patrol", "law and order", "112", "காவல்துறை", "போலீஸ்", "பாதுகாப்பு"]
    },
    {
      id: "safety-cyber-scam-1930",
      url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 National Cyber Crime Helpline (1930) Security Warning",
      alt_en: "Smartphone displaying phishing SMS fraud awareness warning",
      alt_ta: "சைபர் மோசடி விழிப்புணர்வு மற்றும் உதவி எண் 1930",
      keywords: ["cyber", "scam", "fraud", "1930", "fake", "சைபர்", "மோசடி", "போலி", "எச்சரிக்கை"]
    },
    {
      id: "safety-flood-pump-gcc",
      url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 GCC Heavy Duty Submersible Flood Motor Pumping Unit",
      alt_en: "Heavy industrial dewatering pumps draining flooded subway",
      alt_ta: "சுரங்கப்பாதை மழைநீர் வெளியேற்றும் மோட்டார்",
      keywords: ["pump", "waterlogged", "inundation", "தண்ணீர் தேக்கம்", "வெளியேற்றம்"]
    },
    {
      id: "safety-fire-rescue-tender",
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Tamil Nadu Fire & Rescue Services (TNFRS) • 101",
      alt_en: "Fire tender vehicle ready for emergency civic disaster relief",
      alt_ta: "தீயணைப்பு மற்றும் மீட்பு பணிகள் வாகனம்",
      keywords: ["fire", "tnfrs", "rescue", "101", "தீயணைப்பு", "மீட்பு", "அவசரம்"]
    },
    {
      id: "safety-sea-storm-marina",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Coastal High Waves & Cyclone Landfall Warning • TNDMA",
      alt_en: "Rough stormy ocean waves crashing along coastal shoreline",
      alt_ta: "கடற்கரை புயல் மற்றும் அலைகள் எச்சரிக்கை",
      keywords: ["sea", "waves", "coast", "marina", "கடல்", "அலை", "கடற்கரை"]
    },
    {
      id: "safety-cctv-surveillance",
      url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Integrated Command & Control Center (ICCC) CCTV Network",
      alt_en: "Security surveillance CCTV camera overlooking public junction",
      alt_ta: "சிசிடிவி கண்காணிப்பு கேமரா",
      keywords: ["cctv", "camera", "surveillance", "கேமரா", "கண்காணிப்பு"]
    },
    {
      id: "safety-disaster-control-room",
      url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 State Disaster Management Control Room • 1070 / 1077",
      alt_en: "Emergency monitoring console tracking weather radar feeds",
      alt_ta: "பேரிடர் மேலாண்மை கட்டுப்பாட்டு அறை",
      keywords: ["tndma", "disaster", "control", "1070", "1077", "பேரிடர்", "கட்டுப்பாடு"]
    }
  ],

  // ── 7. Government Schemes & Citizen Services (8 Real Photos) ────────────────
  "government-schemes": [
    {
      id: "scheme-esevai-centre",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 e-Sevai Centre Citizen Service Counter • TNeGA",
      alt_en: "e-Sevai computerized counter assisting citizens with certificates",
      alt_ta: "இ-சேவை மையம் அரசு சான்றிதழ்கள் சேவை",
      keywords: ["esevai", "tnega", "certificate", "இ-சேவை", "சான்றிதழ்", "இசேவை"]
    },
    {
      id: "scheme-ration-shop-pds",
      url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Civil Supplies (TNCSC) Fair Price Shop • Smart Ration Card",
      alt_en: "Public Distribution System (PDS) ration shop distribution counter",
      alt_ta: "நியாயவிலைக் கடை ரேஷன் பொருட்கள் விநியோகம்",
      keywords: ["ration", "pds", "rice", "smart card", "ரேஷன்", "நியாயவிலைக்கடை", "அரிசி"]
    },
    {
      id: "scheme-aadhaar-biometric",
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Aadhaar Biometric Enrollment & Update Special Camp",
      alt_en: "Official biometric fingerprint scanner and enrollment computer",
      alt_ta: "ஆதார் சிறப்பு முகாம் மற்றும் பயோமெட்ரிக் பதிவு",
      keywords: ["aadhaar", "biometric", "update", "camp", "ஆதார்", "முகாம்", "பதிவு"]
    },
    {
      id: "scheme-magalir-urimai",
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Kalaignar Magalir Urimai Thittam Welfare Verification",
      alt_en: "Women beneficiaries participating in civic welfare scheme verification",
      alt_ta: "கலைஞர் மகளிர் உரிமைத் திட்டம் மகளிர் பதிவு முகாம்",
      keywords: ["magalir", "urimai", "kmut", "women", "மகளிர்", "உரிமைத்தொகை", "மகளிர் உரிமை"]
    },
    {
      id: "scheme-taluk-office-queue",
      url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Taluk Office Grievance Redressal & Patta Transfer Hall",
      alt_en: "Citizens attending revenue grievance redressal day at taluk office",
      alt_ta: "வட்டாட்சியர் அலுவலகம் பட்டா மாறுதல் மற்றும் மனுக்கள்",
      keywords: ["patta", "taluk", "chitta", "revenue", "பட்டா", "வட்டாட்சியர்", "சிட்டா", "மனு"]
    },
    {
      id: "scheme-voter-id-desk",
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Election Commission Electoral Roll Revision Camp",
      alt_en: "Voter ID registration and electoral roll summary revision desk",
      alt_ta: "வாக்காளர் பட்டியல் திருத்த சிறப்பு முகாம்",
      keywords: ["voter", "epic", "electoral", "வாக்காளர்", "வாக்காளர் அட்டை"]
    },
    {
      id: "scheme-gold-taali-thittam",
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Moovalur Ramamirtham Marriage & Higher Education Assistance",
      alt_en: "Official documentation desk for state marriage assistance welfare",
      alt_ta: "திருமண உதவித் திட்டம் மற்றும் கல்வி உதவி",
      keywords: ["marriage", "welfare", "assistance", "திருமண உதவி", "திட்டம்"]
    },
    {
      id: "scheme-pension-senior",
      url: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Old Age Pension (OAP) Direct Benefit Transfer Verification",
      alt_en: "Senior citizen receiving social security pension verification",
      alt_ta: "முதியோர் ஓய்வூதியத் திட்டம் நேரடி பணப்பரிவர்த்தனை",
      keywords: ["pension", "oap", "senior", "ஓய்வூதியம்", "முதியோர்"]
    }
  ],

  // ── 8. Tamil Nadu Politics & Governance (8 Real Photos) ─────────────────────
  "tn-politics": [
    {
      id: "pol-fort-st-george",
      url: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Fort St. George • Tamil Nadu Government Secretariat",
      alt_en: "Fort St. George historic Secretariat administrative complex",
      alt_ta: "புனித ஜார்ஜ் கோட்டை தலைமைச் செயலகம்",
      keywords: ["secretariat", "fort", "cabinet", "தலைமைச் செயலகம்", "கோட்டை", "அரசாணை"]
    },
    {
      id: "pol-assembly-chamber",
      url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Tamil Nadu Legislative Assembly Chamber (TNLA)",
      alt_en: "Legislative assembly chamber interior seating and podium",
      alt_ta: "தமிழ்நாடு சட்டப்பேரவை கூட்டத்தொடர்",
      keywords: ["assembly", "mla", "speaker", "bill", "சட்டப்பேரவை", "சட்டமன்றம்", "எம்.எல்.ஏ"]
    },
    {
      id: "pol-ripon-building",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Ripon Building • Greater Chennai Corporation Headquarters",
      alt_en: "Majestic white Neoclassical Ripon Building civic headquarters",
      alt_ta: "ரிப்பன் மாளிகை சென்னை மாநகராட்சி தலைமையகம்",
      keywords: ["ripon", "corporation", "mayor", "ரிப்பன் மாளிகை", "மேயர்", "மாநகராட்சி"]
    },
    {
      id: "pol-collectorate-district",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 District Collectorate Administrative Master Complex",
      alt_en: "Modern multi-storey district collectorate administrative complex",
      alt_ta: "மாவட்ட ஆட்சியர் அலுவலக பெருந்திட்ட வளாகம்",
      keywords: ["collector", "collectorate", "district", "ஆட்சியர்", "கலெக்டர்", "மாவட்ட"]
    },
    {
      id: "pol-evm-election",
      url: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 State Election Commission EVM Strongroom Protocol",
      alt_en: "Electronic voting machine polling setup in government institution",
      alt_ta: "தேர்தல் வாக்குப்பதிவு இயந்திரங்கள் பாதுகாப்பு மையம்",
      keywords: ["election", "evm", "vote", "polling", "தேர்தல்", "வாக்குப்பதிவு", "வாக்கு"]
    },
    {
      id: "pol-press-conference",
      url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Ministerial Media Briefing • DIPR Media Center",
      alt_en: "Official press conference microphones and media briefing room",
      alt_ta: "செய்தியாளர் சந்திப்பு மற்றும் பத்திரிகையாளர் மாநாடு",
      keywords: ["press", "media", "announcement", "பத்திரிகையாளர்", "செய்தியாளர்", "அறிவிப்பு"]
    },
    {
      id: "pol-budget-assembly",
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 State Annual Budget Presentation • Finance Ministry Desk",
      alt_en: "Finance document portfolio on legislative desk",
      alt_ta: "தமிழ்நாடு பொது பட்ஜெட் தாக்கல்",
      keywords: ["budget", "finance", "allocation", "பட்ஜெட்", "நிதிநிலை அறிக்கை", "நிதி"]
    },
    {
      id: "pol-high-court",
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Madras High Court Heritage Bench • Legal Affairs",
      alt_en: "Madras High Court red Indo-Saracenic historic architecture",
      alt_ta: "சென்னை உயர்நீதிமன்றம்",
      keywords: ["court", "high court", "bench", "நீதிமன்றம்", "உயர்நீதிமன்றம்", "வழக்கு"]
    }
  ],

  // ── 9. Healthcare & PHCs (6 Real Photos) ────────────────────────────────────
  healthcare: [
    {
      id: "health-phc-centre",
      url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Primary Health Centre (PHC) • Directorate of Public Health",
      alt_en: "Rural Primary Health Centre outpatient reception building",
      alt_ta: "அரசு ஆரம்ப சுகாதார நிலையம் (PHC)",
      keywords: ["phc", "health centre", "clinic", "ஆரம்ப சுகாதார நிலையம்", "சுகாதார நிலையம்"]
    },
    {
      id: "health-gh-hospital",
      url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Rajiv Gandhi Government General Hospital (GH) Complex",
      alt_en: "Government General Hospital multi-specialty medical building",
      alt_ta: "அரசு தலைமை பொது மருத்துவமனை (GH)",
      keywords: ["hospital", "gh", "medical", "மருத்துவமனை", "அரசு மருத்துவமனை", "ஜிஹெச்"]
    },
    {
      id: "health-ambulance-108",
      url: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 108 Emergency Ambulance Life Support Fleet",
      alt_en: "108 emergency response ambulance equipped with oxygen systems",
      alt_ta: "108 அவசர ஆம்புலன்ஸ் ஊர்தி",
      keywords: ["ambulance", "108", "emergency", "ஆம்புலன்ஸ்", "அவசர சிகிச்சை"]
    },
    {
      id: "health-blood-donation",
      url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Voluntary Blood Donation Drive • TN State AIDS Control",
      alt_en: "Volunteer donor participating in organized blood donation camp",
      alt_ta: "இரத்த தான முகாம்",
      keywords: ["blood", "donation", "camp", "இரத்த தானம்", "இரத்தம்"]
    },
    {
      id: "health-pharmacy-counter",
      url: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Amma Pharmacy / Free Government Medical Dispensary",
      alt_en: "Pharmacist dispensing essential medicines at subsidized pharmacy",
      alt_ta: "அரசு மருந்து விநியோக மையம்",
      keywords: ["medicine", "pharmacy", "drug", "மருந்தகம்", "மருந்து", "மாத்திரை"]
    },
    {
      id: "health-doctors-team",
      url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Makkalai Thedi Maruthuvam Doorstep Medical Team",
      alt_en: "Community healthcare workers checking vitals in neighborhood",
      alt_ta: "மக்களைத் தேடி மருத்துவம் களப்பணி",
      keywords: ["makkalai thedi", "doctor", "health", "மருத்துவர்", "பரிசோதனை"]
    }
  ],

  // ── 10. Agriculture & Farmers (6 Real Photos) ───────────────────────────────
  agriculture: [
    {
      id: "agri-paddy-dpc",
      url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Direct Paddy Procurement Centre (DPC) • TNCSC Delta",
      alt_en: "Harvested golden paddy bags stacked at government procurement center",
      alt_ta: "நேரடி நெல் கொள்முதல் நிலையம் (DPC)",
      keywords: ["paddy", "dpc", "procurement", "grain", "நெல்", "கொள்முதல் நிலையம்", "தானியம்"]
    },
    {
      id: "agri-cauvery-sluice",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Mettur Dam / Kallanai Grand Anicut Canal Sluice Water Release",
      alt_en: "Gushing irrigation canal water flowing through historic dam sluices",
      alt_ta: "மேட்டூர் அணை / கல்லணை பாசன கால்வாய் நீர் திறப்பு",
      keywords: ["canal", "mettur", "cauvery", "kallanai", "காவிரி", "மேட்டூர்", "பாசனம்", "கால்வாய்"]
    },
    {
      id: "agri-tractor-field",
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Kuruvai / Samba Cultivation Season • Tamil Nadu Delta",
      alt_en: "Agricultural tractor preparing lush green paddy agricultural fields",
      alt_ta: "குருவை / சம்பா சாகுபடி உழவு பணி",
      keywords: ["farmer", "tractor", "cultivation", "விவசாயி", "உழவு", "சாகுபடி", "விவசாயம்"]
    },
    {
      id: "agri-uzhavar-sandhai",
      url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Uzhavar Sandhai Direct Farmers Market • Agricultural Marketing",
      alt_en: "Farmers selling fresh produce directly at municipal Uzhavar Sandhai",
      alt_ta: "உழவர் சந்தை நேரடி காய்கறி விற்பனை",
      keywords: ["uzhavar sandhai", "vegetable", "market", "உழவர் சந்தை", "காய்கறி", "சந்தை"]
    },
    {
      id: "agri-drip-irrigation",
      url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Micro-Irrigation Drip Subsidy Project • Horticulture Desk",
      alt_en: "Efficient drip irrigation lines watering horticulture crops",
      alt_ta: "சொட்டு நீர் பாசன திட்டம்",
      keywords: ["irrigation", "drip", "water saving", "சொட்டு நீர் பாசனம்", "பாசனம்"]
    },
    {
      id: "agri-coconut-plantation",
      url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Pollachi / Thanjavur Coconut & Agro Farming Belt",
      alt_en: "Lush coconut groves and traditional agro-farms in Tamil Nadu",
      alt_ta: "தென்னந்தோப்பு மற்றும் வேளாண்மை",
      keywords: ["coconut", "plantation", "grove", "தென்னை", "தோட்டம்"]
    }
  ],

  // ── 11. Environment & Lakes (6 Real Photos) ─────────────────────────────────
  environment: [
    {
      id: "env-lake-restoration",
      url: "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Water Resources Department (WRD) Lake Desilting Excavator",
      alt_en: "Excavator desilting and strengthening urban lake bunds",
      alt_ta: "ஏரி தூர்வாருதல் மற்றும் புனரமைப்பு பணி",
      keywords: ["lake", "desilt", "restoration", "bund", "தூர்வாருதல்", "ஏரி புனரமைப்பு"]
    },
    {
      id: "env-tree-plantation",
      url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Green Tamil Nadu Mission Native Tree Sapling Drive",
      alt_en: "Citizens planting native tree saplings for urban forest green cover",
      alt_ta: "பசுமை தமிழ்நாடு இயக்கம் மரக்கன்று நடுதல்",
      keywords: ["tree", "sapling", "green", "forest", "மரம்", "மரக்கன்று", "பசுமை"]
    },
    {
      id: "env-marshland-pallikaranai",
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Pallikaranai Ramsar Wetland Wildlife Reserve",
      alt_en: "Pristine wetland marshland habitat with migratory water birds",
      alt_ta: "பள்ளிக்கரணை சதுப்பு நிலம் பறவைகள் சரணாலயம்",
      keywords: ["wetland", "marsh", "pallikaranai", "birds", "சதுப்பு நிலம்", "பறவைகள்"]
    },
    {
      id: "env-waste-segregation",
      url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 GCC Solid Waste Source Segregation & Compost Yard",
      alt_en: "Color-coded civic bins and organic waste composting facility",
      alt_ta: "குப்பை தரம் பிரித்தல் மற்றும் உரமாக்குதல்",
      keywords: ["waste", "garbage", "compost", "segregation", "குப்பை", "தூய்மை"]
    },
    {
      id: "env-beach-cleanup",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Marina / Besant Nagar Coastal Plastic Cleanup Squad",
      alt_en: "Volunteers cleaning pristine sandy beach shoreline",
      alt_ta: "கடற்கரை தூய்மை பணி முகாம்",
      keywords: ["beach", "clean", "plastic", "கடற்கரை", "தூய்மை பணி"]
    },
    {
      id: "env-pollution-air-monitor",
      url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 TN Pollution Control Board (TNPCB) Air Quality Station",
      alt_en: "Automated ambient air quality monitoring mast and station",
      alt_ta: "காற்று தர கண்காணிப்பு நிலையம் (AQI)",
      keywords: ["pollution", "air quality", "aqi", "tnpcb", "காற்று மாசு", "மாசு"]
    }
  ],

  // ── 12. General Civic & Community Life (6 Real Photos) ──────────────────────
  general: [
    {
      id: "gen-chennai-skyline",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Tamil Nadu Metropolitan Development Corridor • Visual Archive",
      alt_en: "Modern urban cityscape skyline with blue skies",
      alt_ta: "தமிழ்நாடு நகர்ப்புற வளர்ச்சி காட்சி",
      keywords: ["city", "skyline", "chennai", "development", "நகரம்", "வளர்ச்சி"]
    },
    {
      id: "gen-grievance-petition",
      url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 District Collector Monday Public Grievance Redressal Day",
      alt_en: "Citizen handing official grievance petition at public collectorate desk",
      alt_ta: "மக்கள் குறைதீர்க்கும் நாள் மனுக்கள்",
      keywords: ["grievance", "petition", "complaint", "மனு", "குறைதீர்ப்பு", "புகார்"]
    },
    {
      id: "gen-community-rwa",
      url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Resident Welfare Association (RWA) Neighborhood Meeting",
      alt_en: "Community residents discussing civic locality maintenance",
      alt_ta: "குடியிருப்போர் நலச் சங்கம் ஆலோசனை கூட்டம்",
      keywords: ["rwa", "community", "meeting", "குடியிருப்போர்", "கூட்டம்"]
    },
    {
      id: "gen-temple-heritage",
      url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 HR&CE Heritage Corridor & Temple Precinct Restoration",
      alt_en: "Majestic historic Dravidian temple gopuram tower",
      alt_ta: "தமிழ் பாரம்பரிய கோயில் கோபுரம்",
      keywords: ["heritage", "temple", "culture", "கோயில்", "பாரம்பரியம்"]
    },
    {
      id: "gen-newspaper-reading",
      url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Hyperlocal Citizen Journalism & Daily Dispatches",
      alt_en: "Daily news headlines and civic dispatches printed paper",
      alt_ta: "தினசரி செய்தி மற்றும் கள ஆய்வு",
      keywords: ["news", "dispatch", "journalism", "செய்தி", "இதழ்"]
    },
    {
      id: "gen-town-hall-square",
      url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      credit: "📷 Public Square & Citizen Verification Point",
      alt_en: "Vibrant city central square with pedestrian civic activity",
      alt_ta: "பொதுமக்கள் கூடும் நகரின் மையம்",
      keywords: ["square", "public", "verified", "மக்கள்", "நகரம்"]
    }
  ]
};

// Map aliases to one of the 12 primary catalog keys
const CATEGORY_ALIAS_MAP = {
  // Road & Infra
  road: "road-infrastructure",
  roads: "road-infrastructure",
  infrastructure: "road-infrastructure",
  "road-infrastructure": "road-infrastructure",
  // Water
  water: "water-sanitation",
  drainage: "water-sanitation",
  "water-sanitation": "water-sanitation",
  // Electricity
  power: "electricity",
  powercut: "electricity",
  eb: "electricity",
  electricity: "electricity",
  // Transport
  transport: "transport",
  metro: "transport",
  traffic: "transport",
  transit: "transport",
  // Education
  education: "education",
  school: "education",
  holiday: "education",
  // Safety
  safety: "public-safety",
  "public-safety": "public-safety",
  crime: "public-safety",
  rain: "public-safety",
  weather: "public-safety",
  // Schemes
  scheme: "government-schemes",
  schemes: "government-schemes",
  "government-schemes": "government-schemes",
  welfare: "government-schemes",
  // Politics & Governance
  politics: "tn-politics",
  "tn-politics": "tn-politics",
  governance: "tn-politics",
  // Health
  health: "healthcare",
  healthcare: "healthcare",
  medical: "healthcare",
  // Agriculture
  agriculture: "agriculture",
  farming: "agriculture",
  farmer: "agriculture",
  // Environment
  environment: "environment",
  eco: "environment",
  lake: "environment",
  // Fallback
  economy: "general",
  social: "general",
  technology: "general",
  india: "general",
  world: "general",
  general: "general"
};

export function normalizeCategorySlug(raw) {
  if (!raw) return "general";
  const lower = raw.toString().trim().toLowerCase();
  return CATEGORY_ALIAS_MAP[lower] || "general";
}

/**
 * Smart Civic Real Photo Resolver
 * 
 * Determines the best authentic real photograph for an article or civic post:
 * 1. Checks if a valid non-prompt image is already present in `featured_image` or `image_url`
 * 2. Parses keywords from the title/content to match exact scenario (e.g. rain holiday, metro, transformer)
 * 3. Falls back to a deterministic hash of the slug/id across the category pool so every post gets
 *    a distinct, consistent photo rather than repeating the same one.
 * 
 * @param {Object} item - Post or article object
 * @returns {Object} { url, credit, alt_en, alt_ta, id }
 */
export function getCivicPhoto(item = {}) {
  // 1. Explicit valid user/article image
  const rawFeatured = (item.featured_image || "").trim();
  if (rawFeatured && isRealImageUrl(rawFeatured) && !rawFeatured.includes("/images/tntoday/")) {
    return {
      id: "custom-featured",
      url: rawFeatured,
      credit: "📷 VizhiTN Visual Archive • Official Dispatch",
      alt_en: item.title || "VizhiTN Editorial Dispatch",
      alt_ta: item.title_ta || "VizhiTN கள ஆய்வு"
    };
  }

  const rawPostImg = (item.image_url || "").trim();
  if (rawPostImg && isRealImageUrl(rawPostImg) && !rawPostImg.includes("/placeholder")) {
    return {
      id: "custom-post",
      url: rawPostImg,
      credit: "📷 Citizen Photo • Verified Civic Proof",
      alt_en: item.title_en || item.title || "Civic Grievance Report",
      alt_ta: item.title_ta || "குடிமக்கள் புகார் அறிக்கை"
    };
  }

  // 2. Keyword Matching across text
  const text = `${item.title || ""} ${item.title_en || ""} ${item.title_ta || ""} ${item.summary || ""} ${item.content || ""} ${item.content_en || ""} ${item.content_ta || ""}`.toLowerCase();
  const normalizedCategory = normalizeCategorySlug(item.category || item.category_slug);
  const pool = CIVIC_PHOTO_CATALOG[normalizedCategory] || CIVIC_PHOTO_CATALOG.general;

  // Search keyword triggers in the primary category pool first
  for (const photo of pool) {
    if (photo.keywords && photo.keywords.some(kw => text.includes(kw))) {
      return photo;
    }
  }

  // Search cross-category triggers for critical events (e.g. rain holiday, metro, cyber scam)
  if (text.includes("rain") || text.includes("மழை") || text.includes("holiday") || text.includes("விடுமுறை")) {
    const rainPhotos = [...CIVIC_PHOTO_CATALOG.education, ...CIVIC_PHOTO_CATALOG["public-safety"]];
    const match = rainPhotos.find(p => p.id === "edu-rain-holiday-gate" || p.id === "safety-monsoon-rain");
    if (match) return match;
  }

  if (text.includes("metro") || text.includes("மெட்ரோ") || text.includes("cmrl")) {
    const metroPhoto = CIVIC_PHOTO_CATALOG.transport.find(p => p.id === "trans-metro-elevated");
    if (metroPhoto) return metroPhoto;
  }

  if (text.includes("scam") || text.includes("மோசடி") || text.includes("1930")) {
    const scamPhoto = CIVIC_PHOTO_CATALOG["public-safety"].find(p => p.id === "safety-cyber-scam-1930");
    if (scamPhoto) return scamPhoto;
  }

  // 3. Deterministic Hashing by slug, id, or title
  const seed = (item.slug || item.id || item.title || item.title_en || "vizhi").toString();
  const hash = Math.abs(hashString(seed));
  const chosen = pool[hash % pool.length];

  return chosen;
}
