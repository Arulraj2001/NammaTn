// scripts/youtube/config.mjs
// Centralized configuration for VizhiTN YouTube Video Automation Engine

export const YOUTUBE_CONFIG = {
  channel: {
    name: 'VizhiTN | விழி தமிழ்நாடு',
    handle: '@vizhitn',
    siteUrl: 'https://vizhitn.in',
    tagline: 'Community Verified. People Powered. Tamil Nadu Civic Intelligence.'
  },

  // Dimensions & Video Specs
  formats: {
    shorts: {
      width: 1080,
      height: 1920,
      fps: 30,
      targetDurationMinSec: 35,
      targetDurationMaxSec: 58,
      aspectRatio: '9:16'
    },
    longForm: {
      width: 1920,
      height: 1080,
      fps: 30,
      targetDurationMinSec: 180, // 3 mins
      targetDurationMaxSec: 360, // 6 mins
      aspectRatio: '16:9'
    }
  },

  // Neural TTS Voices (Microsoft Edge-TTS)
  voices: {
    tamilFemale: 'ta-IN-PallaviNeural',   // Standard crisp newsreader female voice
    tamilMale: 'ta-IN-ValluvarNeural',    // Authoritative documentary male voice
    defaultRate: '+2%',                  // Subtle pacing boost for engaging delivery
    defaultPitch: '+0Hz'
  },

  // Visual Theme Tokens
  theme: {
    background: '#071224',
    surface: '#0f172a',
    primary: '#2563eb',
    accent: '#38bdf8',
    warning: '#f59e0b',
    danger: '#ef4444',
    textMain: '#ffffff',
    textMuted: '#94a3b8'
  },

  // Weekly Long-Form Editorial Schedule
  editorialSchedule: {
    1: { day: 'Monday', theme: 'infrastructure', label: 'Mega Infrastructure & Transit', focusSlug: 'road-infrastructure' },
    3: { day: 'Wednesday', theme: 'governance', label: 'Welfare Schemes & Citizen Rights', focusSlug: 'government-schemes' },
    5: { day: 'Friday', theme: 'economy-agri', label: 'State Economy, Agriculture & Green TN', focusSlug: 'agriculture' }
  }
};
