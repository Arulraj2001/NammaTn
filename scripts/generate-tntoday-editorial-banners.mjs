#!/usr/bin/env node
/**
 * scripts/generate-tntoday-editorial-banners.mjs
 *
 * Generates 16:9 (1200x675) high-resolution, Google Discover-optimized editorial
 * news banners for all TN Today categories into public/images/tntoday/.
 *
 * Design standards:
 * 1. 16:9 aspect ratio (1200x675) — standard for Google Discover large image previews
 * 2. Clean editorial photography aesthetic with cinematic lighting
 * 3. NO clutter or burned text paragraphs that Google downranks
 * 4. High-contrast category pill with authentic Tamil & English branding
 * 5. WebP format with high quality (88%) for blazing-fast mobile delivery
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'tntoday');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CATEGORIES = [
  {
    slug: 'infrastructure',
    name_en: 'INFRASTRUCTURE',
    name_ta: 'உள்கட்டமைப்பு',
    emoji: '🏗️',
    color: '#3B82F6',
    colorDark: '#1E3A8A',
    bgGrad1: '#0B132B',
    bgGrad2: '#1C2541',
    symbol: 'M 100 500 L 300 200 L 500 500 Z M 200 500 L 200 350 M 400 500 L 400 350'
  },
  {
    slug: 'transport',
    name_en: 'TRANSIT & METRO',
    name_ta: 'போக்குவரத்து & மெட்ரோ',
    emoji: '🚌',
    color: '#0EA5E9',
    colorDark: '#0369A1',
    bgGrad1: '#082F49',
    bgGrad2: '#0C4A6E',
    symbol: 'M 200 450 L 1000 450 M 300 450 L 250 550 M 900 450 L 950 550 M 200 300 L 1000 300'
  },
  {
    slug: 'environment',
    name_en: 'ENVIRONMENT & WATER',
    name_ta: 'சுற்றுச்சூழல் & நீர்நிலைகள்',
    emoji: '🌿',
    color: '#10B981',
    colorDark: '#047857',
    bgGrad1: '#022C22',
    bgGrad2: '#064E3B',
    symbol: 'M 600 200 C 500 350 400 450 400 550 C 400 650 500 700 600 700 C 700 700 800 650 800 550 C 800 450 700 350 600 200 Z'
  },
  {
    slug: 'governance',
    name_en: 'GOVERNANCE & POLICY',
    name_ta: 'அரசு நிர்வாகம் & திட்டங்கள்',
    emoji: '🏛️',
    color: '#A855F7',
    colorDark: '#6B21A8',
    bgGrad1: '#2E1065',
    bgGrad2: '#3B0764',
    symbol: 'M 200 300 L 600 150 L 1000 300 Z M 250 300 L 250 550 M 450 300 L 450 550 M 750 300 L 750 550 M 950 300 L 950 550'
  },
  {
    slug: 'economy',
    name_en: 'ECONOMY & INDUSTRY',
    name_ta: 'பொருளாதாரம் & முதலீடுகள்',
    emoji: '💰',
    color: '#F59E0B',
    colorDark: '#B45309',
    bgGrad1: '#451A03',
    bgGrad2: '#78350F',
    symbol: 'M 200 550 L 450 400 L 700 480 L 1000 250 M 850 250 L 1000 250 L 1000 400'
  },
  {
    slug: 'education',
    name_en: 'EDUCATION & ACADEMICS',
    name_ta: 'பள்ளிக் கல்வி & உயர்கல்வி',
    emoji: '🎓',
    color: '#14B8A6',
    colorDark: '#0F766E',
    bgGrad1: '#042F2E',
    bgGrad2: '#134E4A',
    symbol: 'M 600 200 L 200 350 L 600 500 L 1000 350 Z M 600 500 L 600 650'
  },
  {
    slug: 'healthcare',
    name_en: 'PUBLIC HEALTH',
    name_ta: 'பொது சுகாதாரம் & மருத்துவம்',
    emoji: '🏥',
    color: '#F43F5E',
    colorDark: '#BE123C',
    bgGrad1: '#4C0519',
    bgGrad2: '#881337',
    symbol: 'M 500 250 L 700 250 L 700 400 L 850 400 L 850 600 L 700 600 L 700 750 L 500 750 L 500 600 L 350 600 L 350 400 L 500 400 Z'
  },
  {
    slug: 'agriculture',
    name_en: 'AGRICULTURE & FARMING',
    name_ta: 'விவசாயம் & பாசனம்',
    emoji: '🌾',
    color: '#84CC16',
    colorDark: '#4D7C0F',
    bgGrad1: '#1A2E05',
    bgGrad2: '#365314',
    symbol: 'M 600 650 C 600 450 750 350 750 350 C 750 350 600 400 600 650 M 600 550 C 600 400 450 300 450 300 C 450 300 600 350 600 550'
  },
  {
    slug: 'technology',
    name_en: 'TECHNOLOGY & INNOVATION',
    name_ta: 'தொழில்நுட்பம் & புத்தாக்கம்',
    emoji: '💻',
    color: '#06B6D4',
    colorDark: '#0E7490',
    bgGrad1: '#083344',
    bgGrad2: '#164E63',
    symbol: 'M 300 250 L 900 250 L 900 550 L 300 550 Z M 200 550 L 1000 550 L 950 620 L 250 620 Z'
  },
  {
    slug: 'social',
    name_en: 'SOCIAL & CITIZEN WELFARE',
    name_ta: 'சமூக நலம் & உரிமைகள்',
    emoji: '👥',
    color: '#EC4899',
    colorDark: '#BE185D',
    bgGrad1: '#500724',
    bgGrad2: '#831843',
    symbol: 'M 600 350 A 100 100 0 1 0 600 150 A 100 100 0 1 0 600 350 Z M 400 600 C 400 480 500 420 600 420 C 700 420 800 480 800 600'
  },
  {
    slug: 'india',
    name_en: 'NATIONAL & UNION',
    name_ta: 'தேசிய விவகாரங்கள்',
    emoji: '🇮🇳',
    color: '#6366F1',
    colorDark: '#4338CA',
    bgGrad1: '#1E1B4B',
    bgGrad2: '#312E81',
    symbol: 'M 600 200 L 950 400 L 800 600 L 400 600 L 250 400 Z'
  },
  {
    slug: 'world',
    name_en: 'GLOBAL & DIPLOMACY',
    name_ta: 'உலக நடப்புகள்',
    emoji: '🌐',
    color: '#14B8A6',
    colorDark: '#0D9488',
    bgGrad1: '#042F2E',
    bgGrad2: '#115E59',
    symbol: 'M 600 200 A 200 200 0 1 0 600 600 A 200 200 0 1 0 600 200 Z M 400 400 L 800 400 M 600 200 C 680 300 680 500 600 600'
  },
  {
    slug: 'general',
    name_en: 'STATEWIDE DISPATCH',
    name_ta: 'பொதுச் செய்திகள்',
    emoji: '📰',
    color: '#94A3B8',
    colorDark: '#475569',
    bgGrad1: '#0F172A',
    bgGrad2: '#1E293B',
    symbol: 'M 250 200 L 950 200 L 950 600 L 250 600 Z M 350 300 L 850 300 M 350 400 L 850 400 M 350 500 L 700 500'
  }
];

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generate() {
  console.log(`[TN TODAY BANNERS] Generating 16:9 (1200x675) Discover-ready editorial banners in ${OUTPUT_DIR}...`);

  for (const cat of CATEGORIES) {
    const svg = `
    <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Deep Cinematic Newsroom Gradient -->
        <linearGradient id="bg-${cat.slug}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${cat.bgGrad1}" />
          <stop offset="50%" stop-color="${cat.bgGrad2}" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>

        <!-- Ambient Volumetric Lighting -->
        <radialGradient id="light-${cat.slug}" cx="85%" cy="15%" r="70%">
          <stop offset="0%" stop-color="${cat.color}" stop-opacity="0.32" />
          <stop offset="60%" stop-color="${cat.color}" stop-opacity="0.06" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>

        <!-- Dynamic Diagonal Sheen -->
        <linearGradient id="sheen-${cat.slug}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${cat.color}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${cat.colorDark}" stop-opacity="0.2" />
        </linearGradient>

        <!-- Vignette Mask -->
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.65" />
        </radialGradient>
      </defs>

      <!-- 1. Background Layers -->
      <rect width="1200" height="675" fill="url(#bg-${cat.slug})" />
      <rect width="1200" height="675" fill="url(#light-${cat.slug})" />

      <!-- 2. Elegant Tech / Editorial Matrix Grid -->
      <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1.2">
        <line x1="0" y1="135" x2="1200" y2="135" />
        <line x1="0" y1="270" x2="1200" y2="270" />
        <line x1="0" y1="405" x2="1200" y2="405" />
        <line x1="0" y1="540" x2="1200" y2="540" />
        <line x1="240" y1="0" x2="240" y2="675" />
        <line x1="480" y1="0" x2="480" y2="675" />
        <line x1="720" y1="0" x2="720" y2="675" />
        <line x1="960" y1="0" x2="960" y2="675" />
      </g>

      <!-- 3. Dynamic Curved Architectural Accent Wave -->
      <path d="M 0 520 Q 350 480 650 560 T 1200 490 L 1200 675 L 0 675 Z" fill="${cat.colorDark}" fill-opacity="0.25" />
      <path d="M 0 570 Q 400 510 750 600 T 1200 550 L 1200 675 L 0 675 Z" fill="${cat.color}" fill-opacity="0.12" />

      <!-- 4. Subtle Architectural Geometric Emblem Watermark (Right Half) -->
      <g stroke="${cat.color}" stroke-opacity="0.12" stroke-width="3" fill="none" transform="translate(680, 80) scale(0.65)">
        <path d="${cat.symbol}" />
      </g>

      <!-- 5. Left Accent Stripe Bar -->
      <rect x="0" y="0" width="8" height="675" fill="${cat.color}" />
      <rect x="8" y="0" width="4" height="675" fill="#F59E0B" />

      <!-- 6. Vignette Outer Shade -->
      <rect width="1200" height="675" fill="url(#vignette)" />

      <!-- 7. TOP BRAND BAR: VizhiTN Editorial Header -->
      <g transform="translate(60, 55)">
        <!-- Brand Pill -->
        <rect x="0" y="0" width="220" height="42" rx="21" fill="#0F172A" stroke="#334155" stroke-width="1.5" />
        <circle cx="22" cy="21" r="5" fill="#10B981" />
        <text x="38" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="1.5">TN TODAY</text>
        <text x="135" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#94A3B8">EDITION</text>

        <!-- Right Side Verification Marker -->
        <text x="1080" y="27" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="${cat.color}" letter-spacing="1">
          ● TAMIL NADU IN-DEPTH DISPATCH
        </text>
      </g>

      <!-- 8. CENTERPIECE: Editorial Category Identification -->
      <g transform="translate(60, 310)">
        <!-- Category Badge -->
        <rect x="0" y="0" width="380" height="56" rx="28" fill="${cat.colorDark}" fill-opacity="0.8" stroke="${cat.color}" stroke-width="2" />
        <text x="26" y="36" font-size="24">${cat.emoji}</text>
        <text x="64" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" letter-spacing="1.5">${escapeXml(cat.name_en)}</text>
        <text x="245" y="35" font-family="'Noto Sans Tamil', system-ui, sans-serif" font-size="16" font-weight="700" fill="${cat.color}">${escapeXml(cat.name_ta)}</text>

        <!-- Section Lead Label -->
        <text x="5" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">
          Special Governance &amp; Ground Investigation
        </text>
        <text x="5" y="132" font-family="'Noto Sans Tamil', system-ui, sans-serif" font-size="22" font-weight="700" fill="#CBD5E1">
          கள ஆய்வு • உண்மை சரிபார்ப்பு • விரிவான அறிக்கை
        </text>
      </g>

      <!-- 9. FOOTER BAR: Clean Publication Stamp (No clutter, No helplines, Discover-friendly) -->
      <g transform="translate(60, 580)">
        <line x1="0" y1="0" x2="1080" y2="0" stroke="#334155" stroke-width="1.2" />
        <text x="0" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#F8FAFC" letter-spacing="1">
          VIZHITN.IN
        </text>
        <text x="120" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#64748B">
          Tamil Nadu Civic Journalism &amp; Citizen Accountability
        </text>
        <text x="1080" y="35" text-anchor="end" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#10B981">
          ✓ INDEPENDENT EDITORIAL DESK
        </text>
      </g>
    </svg>
    `;

    const outPath = path.join(OUTPUT_DIR, `${cat.slug}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90, effort: 4 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    console.log(`  ✓ Generated 16:9 ${cat.slug}.webp (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  console.log('[TN TODAY BANNERS] All 13 Discover-compliant editorial banners successfully generated.');
}

generate().catch(err => {
  console.error('[TN TODAY ERROR]:', err);
  process.exit(1);
});
