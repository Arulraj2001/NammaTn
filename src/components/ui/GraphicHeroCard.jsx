'use client';

import React from 'react';

/**
 * Calibrated Color Matrix & Gradients per Civic / Editorial Category
 * High contrast, deep modern saturation inspired by contemporary tech editorial styling.
 */
const CATEGORY_THEMES = {
  // Editorial Flagship
  'tn-today': {
    gradient: 'from-blue-950 via-indigo-950 to-slate-950',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    tagBg: 'bg-amber-400 text-slate-950',
    tagDefault: 'TN TODAY EDITORIAL',
    watermark: 'VIZHITN · FLAGSHIP REPORT',
  },
  'infrastructure': {
    gradient: 'from-blue-900 via-slate-950 to-indigo-950',
    accentColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.25)',
    tagBg: 'bg-amber-400 text-slate-950',
    tagDefault: 'INFRASTRUCTURE & TRANSIT',
    watermark: 'VIZHITN · STATE DEVELOPMENT',
  },
  'governance': {
    gradient: 'from-emerald-950 via-teal-950 to-slate-950',
    accentColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.25)',
    tagBg: 'bg-amber-400 text-slate-950',
    tagDefault: 'WELFARE & GOVERNANCE',
    watermark: 'VIZHITN · TAMIL NADU GOVERNANCE',
  },

  // Civic Utility Categories
  'electricity': {
    gradient: 'from-amber-950 via-slate-950 to-black',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    tagBg: 'bg-amber-400 text-slate-950',
    tagDefault: 'TANGEDCO · POWER ALERT',
    watermark: 'VIZHITN · MINNALAGAM 1912',
  },
  'water-sanitation': {
    gradient: 'from-cyan-950 via-blue-950 to-slate-950',
    accentColor: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.25)',
    tagBg: 'bg-cyan-300 text-slate-950',
    tagDefault: 'METROWATER & TWAD',
    watermark: 'VIZHITN · WATER UTILITY 1913',
  },
  'road-infrastructure': {
    gradient: 'from-stone-950 via-orange-950 to-slate-950',
    accentColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.25)',
    tagBg: 'bg-orange-400 text-slate-950',
    tagDefault: 'ROADS & FLYOVERS',
    watermark: 'VIZHITN · HIGHWAYS & GCC',
  },
  'transport': {
    gradient: 'from-indigo-950 via-purple-950 to-slate-950',
    accentColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.25)',
    tagBg: 'bg-violet-300 text-slate-950',
    tagDefault: 'TRANSIT & METRO',
    watermark: 'VIZHITN · CMRL & RAILWAY 139',
  },
  'government-schemes': {
    gradient: 'from-emerald-950 via-slate-950 to-teal-950',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    tagBg: 'bg-emerald-300 text-slate-950',
    tagDefault: 'TN GOVT SCHEMES',
    watermark: 'VIZHITN · E-SEVAI & WELFARE',
  },
  'public-safety': {
    gradient: 'from-red-950 via-rose-950 to-slate-950',
    accentColor: '#f87171',
    glowColor: 'rgba(248, 113, 113, 0.25)',
    tagBg: 'bg-red-400 text-slate-950',
    tagDefault: 'PUBLIC SAFETY & POLICE',
    watermark: 'VIZHITN · CYBER HELPLINE 1930',
  },
  'education': {
    gradient: 'from-blue-950 via-slate-950 to-indigo-950',
    accentColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.25)',
    tagBg: 'bg-indigo-300 text-slate-950',
    tagDefault: 'EDUCATION & EXAMS',
    watermark: 'VIZHITN · SCHOOL HELPLINE 14417',
  },
  'healthcare': {
    gradient: 'from-teal-950 via-slate-950 to-emerald-950',
    accentColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.25)',
    tagBg: 'bg-teal-300 text-slate-950',
    tagDefault: 'PUBLIC HEALTH',
    watermark: 'VIZHITN · HEALTHCARE 108',
  },
  'agriculture': {
    gradient: 'from-green-950 via-emerald-950 to-slate-950',
    accentColor: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.25)',
    tagBg: 'bg-green-300 text-slate-950',
    tagDefault: 'AGRICULTURE & DELTA',
    watermark: 'VIZHITN · FARMER ADVISORY',
  },
  'environment': {
    gradient: 'from-emerald-950 via-green-950 to-slate-950',
    accentColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.25)',
    tagBg: 'bg-emerald-300 text-slate-950',
    tagDefault: 'ENVIRONMENT & LAKES',
    watermark: 'VIZHITN · CLIMATE & ECOLOGY',
  },
  'default': {
    gradient: 'from-slate-950 via-blue-950 to-slate-900',
    accentColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.25)',
    tagBg: 'bg-amber-400 text-slate-950',
    tagDefault: 'VIZHITN SPECIAL',
    watermark: 'VIZHITN · CITIZEN JOURNALISM',
  }
};

/**
 * High-Performance, Zero-Storage Graphic Hero Card
 * Inspired by modern editorial technology cards (B Tecky).
 * Uses pure CSS gradients + SVG vector patterns.
 * 
 * @param {string} title - Main headline in Tamil or English
 * @param {string} subtitle - Optional secondary line
 * @param {string} category - Category slug
 * @param {string} tag - Custom pill tag (optional)
 * @param {string} district - District name (optional)
 * @param {string} variant - 'hero' (large 16:9 banner) | 'card' (compact thumbnail) | 'feed' (medium card)
 * @param {string} className - Additional CSS classes
 */
export default function GraphicHeroCard({
  title,
  subtitle,
  category = 'default',
  tag,
  district,
  variant = 'card',
  className = '',
}) {
  const normalizedCat = (category || 'default').toLowerCase().replace(/\s+/g, '-');
  const theme = CATEGORY_THEMES[normalizedCat] || CATEGORY_THEMES['default'];
  const displayTag = tag || (district ? `${district.toUpperCase()} · ${theme.tagDefault}` : theme.tagDefault);

  // Layout sizing based on variant
  const isHero = variant === 'hero';
  const isFeed = variant === 'feed';

  return (
    <div
      className={`relative w-full overflow-hidden select-none border-2 border-white/10 transition-all duration-300 ${
        isHero
          ? 'h-[250px] sm:h-[300px] md:h-[340px] max-h-[360px] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8'
          : isFeed
          ? 'h-[180px] sm:h-[200px] rounded-2xl p-4 sm:p-5'
          : 'aspect-[16/9] min-h-[140px] max-h-[180px] rounded-xl p-3 sm:p-3.5'
      } bg-gradient-to-br ${theme.gradient} ${className}`}
    >
      {/* 1. Subtle Vector Grid Pattern (Pure SVG, 0 KB external) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="btecky-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#ffffff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#btecky-grid)" />
      </svg>

      {/* 2. Geometric Ambient Glow & Crosshair Motif (Inspired by B Tecky) */}
      <div
        className="absolute -right-12 -top-12 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-60"
        style={{ backgroundColor: theme.glowColor }}
      />
      <div
        className="absolute right-12 bottom-6 w-48 h-48 rounded-full pointer-events-none blur-2xl opacity-40"
        style={{ backgroundColor: theme.glowColor }}
      />

      {/* Crosshair Graphic Motif (B Tecky Geometric Art) */}
      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-25 hidden sm:block">
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="55" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="95" cy="70" r="45" fill="#ffffff" fillOpacity="0.04" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="70" y1="25" x2="70" y2="115" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="25" y1="70" x2="115" y2="70" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" />
        </svg>
      </div>

      {/* 3. Card Content Stack */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header: Tag Pill */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-xs ${
              isHero ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
            } ${theme.tagBg}`}
          >
            {displayTag}
          </span>

          {/* Micro Brand Monogram */}
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-white/50 uppercase">
            VIZHITN.IN
          </span>
        </div>

        {/* Center: Main Bold Headline & Subtitle (Generous line spacing) */}
        <div className="my-auto py-1 sm:py-2">
          <h2
            className={`font-black text-white tracking-tight leading-[1.25] sm:leading-[1.3] drop-shadow-md line-clamp-2 sm:line-clamp-3 ${
              isHero
                ? 'text-lg sm:text-2xl md:text-3xl max-w-4xl'
                : isFeed
                ? 'text-base sm:text-lg md:text-xl'
                : 'text-xs sm:text-sm font-extrabold line-clamp-2'
            }`}
          >
            {title}
          </h2>

          {subtitle && isHero && (
            <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-200/90 font-normal leading-relaxed line-clamp-2 max-w-3xl drop-shadow-xs">
              {subtitle}
            </p>
          )}
        </div>

        {/* Bottom Footer: Watermark Branding */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-white/70">
          <span className="text-[9px] sm:text-[11px] font-black tracking-widest uppercase">
            {theme.watermark}
          </span>
          <span className="text-[9px] sm:text-[11px] font-bold text-white/50">
            {district ? `DISTRICT: ${district.toUpperCase()}` : 'CITIZEN VERIFIED'}
          </span>
        </div>
      </div>
    </div>
  );
}

