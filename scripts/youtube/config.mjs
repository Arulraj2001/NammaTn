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
    },
    podcast: {
      width: 1920,
      height: 1080,
      fps: 30,
      targetDurationMinSec: 360, // 6 mins
      targetDurationMaxSec: 720, // 12 mins
      aspectRatio: '16:9'
    }
  },

  // Neural TTS Voices (Microsoft Edge-TTS)
  voices: {
    tamilFemale: 'ta-IN-PallaviNeural',   // Kavitha: Systems decoder & legal analyst
    tamilMale: 'ta-IN-ValluvarNeural',    // Karthik: Relatable investigative reporter
    defaultRate: '+1%',                  // Calibrated pacing for smooth bilingual Tanglish delivery
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
  },

  // Bi-Daily Podcast Series Schedule (Tue, Thu, Sat at 08:30 PM IST)
  podcastSchedule: {
    2: { day: 'Tuesday', seriesId: 'scam-files', seriesName: 'டிஜிட்டல் வலையும் தப்பிய வழிகளும்', seriesEn: 'Digital Trap & Scam Files' },
    4: { day: 'Thursday', seriesId: 'citizen-playbook', seriesName: 'சாதாரண மனுஷன் ஜெயிக்கிற சட்டம்', seriesEn: 'Citizen vs System Playbook' },
    6: { day: 'Saturday', seriesId: 'hidden-tn', seriesName: 'மறைக்கப்பட்ட தமிழகம்', seriesEn: 'Tamil Nadu Hidden Files' }
  }
};
