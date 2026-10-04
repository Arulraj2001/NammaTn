import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CATEGORIES = [
  {
    slug: 'electricity',
    name_en: 'Electricity & Power Infrastructure',
    name_ta: 'மின்சாரம் & மின்கட்டமைப்பு',
    dept: 'TANGEDCO • Minnalagam',
    helpline: '1912 / 94987 94987',
    icon: '⚡',
    color: '#EAB308',
    colorDark: '#78350F',
    bgGrad: '#161304'
  },
  {
    slug: 'water-sanitation',
    name_en: 'Water Supply & Drainage',
    name_ta: 'தண்ணீர் & கழிவுநீர் வடிகால்',
    dept: 'CMWSSB • Metrowater • TWAD',
    helpline: '044-45674567 / 1913',
    icon: '💧',
    color: '#06B6D4',
    colorDark: '#083344',
    bgGrad: '#04171E'
  },
  {
    slug: 'road-infrastructure',
    name_en: 'Roads, Bridges & Footpaths',
    name_ta: 'சாலை, மேம்பாலம் & உள்கட்டமைப்பு',
    dept: 'Highways Dept • GCC Works • NHAI',
    helpline: '1913 / 1100',
    icon: '🛣️',
    color: '#3B82F6',
    colorDark: '#172554',
    bgGrad: '#071126'
  },
  {
    slug: 'transport',
    name_en: 'Public Transit & Traffic',
    name_ta: 'போக்குவரத்து & மெட்ரோ சேவை',
    dept: 'CMRL Metro • MTC / SETC • Southern Railway',
    helpline: '139 (Rail) / 103 (Traffic)',
    icon: '🚌',
    color: '#0EA5E9',
    colorDark: '#0C4A6E',
    bgGrad: '#051924'
  },
  {
    slug: 'government-schemes',
    name_en: 'Government Schemes & Welfare',
    name_ta: 'அரசு நலத்திட்டங்கள் & இ-சேவை',
    dept: 'Civil Supplies • e-Sevai • TNSCS',
    helpline: '1967 (Ration) / 1100',
    icon: '🏛️',
    color: '#6366F1',
    colorDark: '#1E1B4B',
    bgGrad: '#0B0A26'
  },
  {
    slug: 'public-safety',
    name_en: 'Public Safety & Cyber Security',
    name_ta: 'பொது பாதுகாப்பு & அவசர சேவை',
    dept: 'Tamil Nadu Police • Cyber Crime Cell',
    helpline: '1930 (Cyber) / 112 (Emergency)',
    icon: '🛡️',
    color: '#EF4444',
    colorDark: '#450A0A',
    bgGrad: '#210505'
  },
  {
    slug: 'healthcare',
    name_en: 'Healthcare & Public Hospitals',
    name_ta: 'மருத்துவம் & அரசு மருத்துவமனை',
    dept: 'Directorate of Public Health • PHC',
    helpline: '108 (Ambulance) / 104 (Health)',
    icon: '🏥',
    color: '#10B981',
    colorDark: '#022C22',
    bgGrad: '#021812'
  },
  {
    slug: 'education',
    name_en: 'Education & Examinations',
    name_ta: 'பள்ளி & உயர்கல்வி துறை',
    dept: 'School Education Dept • DGE',
    helpline: '14417 (Education Helpline)',
    icon: '📚',
    color: '#A855F7',
    colorDark: '#3B0764',
    bgGrad: '#1A042C'
  },
  {
    slug: 'agriculture',
    name_en: 'Agriculture & Irrigation',
    name_ta: 'விவசாயம் & பாசன வசதி',
    dept: 'TN Agriculture Dept • DPC',
    helpline: '1800-180-1551 (Kisan)',
    icon: '🌾',
    color: '#84CC16',
    colorDark: '#1A2E05',
    bgGrad: '#0D1702'
  },
  {
    slug: 'environment',
    name_en: 'Environment & Lake Ecology',
    name_ta: 'சுற்றுச்சூழல் & ஏரி பாதுகாப்பு',
    dept: 'TN Pollution Control Board • WRD',
    helpline: '1077 (Disaster Control)',
    icon: '🌿',
    color: '#14B8A6',
    colorDark: '#042F2E',
    bgGrad: '#021A1A'
  },
  {
    slug: 'local-development',
    name_en: 'Local Development & Ward Works',
    name_ta: 'உள்ளாட்சி & வார்டு வளர்ச்சி பணிகள்',
    dept: 'Municipal Administration • Ward Council',
    helpline: '1913 / 1100',
    icon: '🏗️',
    color: '#F97316',
    colorDark: '#431407',
    bgGrad: '#230B04'
  },
  {
    slug: 'general',
    name_en: 'Civic Notice & Community Dispatch',
    name_ta: 'பொது அறிவிப்பு & மக்கள் குறைதீர்ப்பு',
    dept: 'District Collectorate • Public Grievance',
    helpline: '1100 (CM Helpline)',
    icon: '💬',
    color: '#94A3B8',
    colorDark: '#0F172A',
    bgGrad: '#080D1A'
  },
  {
    slug: 'tn-politics',
    name_en: 'Tamil Nadu Governance & Politics',
    name_ta: 'தமிழ்நாடு அரசியல் & சட்டமன்றம்',
    dept: 'Tamil Nadu Legislative Assembly',
    helpline: 'assembly.tn.gov.in',
    icon: '🗳️',
    color: '#8B5CF6',
    colorDark: '#2E1065',
    bgGrad: '#13072B'
  }
];

const outDir = path.resolve('public', 'images', 'categories');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generate() {
  console.log(`[CATEGORIES] Generating 13 category banners in ${outDir}...`);

  for (const cat of CATEGORIES) {
    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Gradient -->
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${cat.bgGrad}" />
          <stop offset="60%" stop-color="#050811" />
          <stop offset="100%" stop-color="#020408" />
        </linearGradient>

        <!-- Accent Glow -->
        <radialGradient id="glow" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stop-color="${cat.color}" stop-opacity="0.22" />
          <stop offset="100%" stop-color="${cat.color}" stop-opacity="0" />
        </radialGradient>

        <!-- Card Glow -->
        <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${cat.color}" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
        </linearGradient>
      </defs>

      <!-- Base Canvas -->
      <rect width="1200" height="630" fill="url(#bg)" />
      <rect width="1200" height="630" fill="url(#glow)" />

      <!-- Subtle Circuit / Tech Grid Pattern -->
      <g stroke="#ffffff" stroke-opacity="0.03" stroke-width="1">
        <line x1="0" y1="105" x2="1200" y2="105" />
        <line x1="0" y1="210" x2="1200" y2="210" />
        <line x1="0" y1="315" x2="1200" y2="315" />
        <line x1="0" y1="420" x2="1200" y2="420" />
        <line x1="0" y1="525" x2="1200" y2="525" />
        <line x1="200" y1="0" x2="200" y2="630" />
        <line x1="400" y1="0" x2="400" y2="630" />
        <line x1="600" y1="0" x2="600" y2="630" />
        <line x1="800" y1="0" x2="800" y2="630" />
        <line x1="1000" y1="0" x2="1000" y2="630" />
      </g>

      <!-- Outer Frame Border -->
      <rect x="30" y="30" width="1140" height="570" rx="24" fill="none" stroke="url(#cardBorder)" stroke-width="2" />

      <!-- Top Header Navigation -->
      <g transform="translate(70, 75)">
        <!-- VizhiTN Brand Pill -->
        <rect x="0" y="0" width="190" height="42" rx="21" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
        <circle cx="24" cy="21" r="7" fill="#10B981" />
        <text x="42" y="27" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF" letter-spacing="1.5">VIZHITN.IN</text>

        <!-- Category Tag Pill -->
        <rect x="210" y="0" width="260" height="42" rx="21" fill="${cat.colorDark}" stroke="${cat.color}" stroke-opacity="0.6" stroke-width="1.5" />
        <text x="232" y="27" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="${cat.color}" letter-spacing="0.5">${escapeXml(cat.icon)}  ${escapeXml(cat.slug.toUpperCase())}</text>

        <!-- Verification Pill -->
        <rect x="880" y="0" width="180" height="42" rx="21" fill="#0F172A" stroke="#10B981" stroke-width="1.5" />
        <text x="912" y="26" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#10B981">✓ VERIFIED CIVIC</text>
      </g>

      <!-- Center Feature Icon & Titles -->
      <g transform="translate(70, 200)">
        <!-- Giant Category Icon Accent -->
        <text x="0" y="85" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="90">${escapeXml(cat.icon)}</text>

        <!-- English Category Title -->
        <text x="130" y="45" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(cat.name_en)}</text>

        <!-- Tamil Category Title -->
        <text x="130" y="100" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="700" fill="${cat.color}">${escapeXml(cat.name_ta)}</text>
        
        <!-- Department Subtext -->
        <text x="130" y="150" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#94A3B8">Governing Department: <tspan fill="#F1F5F9" font-weight="700">${escapeXml(cat.dept)}</tspan></text>
      </g>

      <!-- Bottom Verified Action Bar -->
      <g transform="translate(70, 485)">
        <!-- Helpline Box -->
        <rect x="0" y="0" width="480" height="60" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
        <text x="24" y="38" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#94A3B8">Official Helpline: <tspan fill="${cat.color}" font-weight="800">${escapeXml(cat.helpline)}</tspan></text>

        <!-- Citizen Duty / Hyperlocal Stamp -->
        <text x="1050" y="38" text-anchor="end" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B">Tamil Nadu Hyperlocal Civic Network • 38 Districts</text>
      </g>
    </svg>
    `;

    const outPath = path.join(outDir, `${cat.slug}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 88, effort: 4 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    console.log(`  ✓ Created ${cat.slug}.webp (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  console.log('[CATEGORIES] All 13 category banners successfully generated in WebP format.');
}

generate().catch(err => {
  console.error('[CATEGORIES ERROR]:', err);
  process.exit(1);
});
