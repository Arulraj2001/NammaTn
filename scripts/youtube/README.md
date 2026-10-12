# VizhiTN YouTube Automation Engine (`scripts/youtube`)

An autonomous, production-grade video production and publishing engine designed specifically for **VizhiTN** (`vizhitn.in`).

This engine converts live Tamil Nadu civic alerts and in-depth investigative articles into high-engagement **YouTube Shorts** and **Weekly Long-Form Explainers** with **zero recurring software or API costs**.

---

## 📁 Architecture Overview

All YouTube production logic is strictly encapsulated inside `scripts/youtube/`:

```
scripts/youtube/
├── README.md                          # Architecture, credentials, and runbook
├── config.mjs                         # Brand palette, aspect ratios, Edge-TTS voices
├── engine/
│   ├── browser-detector.mjs           # Auto-detects Chrome/Chromium/Edge cross-platform
│   ├── tts-engine.mjs                 # Microsoft Edge-TTS neural Tamil voice synthesis
│   ├── frame-renderer.mjs             # Headless browser HTML card renderer (HarfBuzz Tamil shaping)
│   ├── video-composer.mjs             # FFmpeg stitcher, audio ducking, subtitle burn-in
│   └── youtube-client.mjs             # Resumable YouTube Data API v3 uploader with OAuth2 auto-refresh
├── templates/
│   ├── shorts/
│   │   └── daily-digest-card.html     # 1080x1920 (9:16) high-contrast civic news ticker layout
│   └── long-form/
│       └── chapter-slide.html         # 1920x1080 (16:9) multi-chapter investigative slide layout
└── pipelines/
    ├── generate-shorts.mjs            # Daily Civic Shorts Pipeline (40-55s)
    └── generate-long-video.mjs        # Weekly 3x Long-Form Video Pipeline (3-5 mins)
```

---

## 🎬 Dual Production Formats

### 1. Daily Shorts (9:16 Vertical, 1080x1920, 40–55s)
* **Frequency:** Daily at 7:30 PM IST (following the 7:00 PM evening digest).
* **Source:** Supabase `post` table (latest active high-urgency alerts across 38 districts).
* **Structure:**
  1. **Hook (0:00 - 0:05):** *"இன்றைய முக்கிய தமிழ்நாடு நிர்வாக அப்டேட்ஸ்!"*
  2. **Civic Alert Cards (0:05 - 0:38):** Top 3 alerts (Electricity shutdown, water supply, transport/weather) with exact timings and areas.
  3. **Official Helpline Banner (0:38 - 0:45):** 1912 (Minnalagam), 1913 (Corporation), 1930 (Cyber Crime).
  4. **Call-to-Action (0:45 - 0:50):** `vizhitn.in` citizen portal link.
* **Audio Voice:** `ta-IN-PallaviNeural` (crisp neural newsreader).

### 2. Weekly Thrice Long-Form Explainers (16:9 Landscape, 1920x1080, 3–5 Minutes)
* **Editorial Schedule:**
  * **Monday (7:00 AM IST):** *Mega Infrastructure & Transit* (CMRL Metro Phase 2, Flyovers, Port-Maduravoyal Expressway).
  * **Wednesday (7:00 AM IST):** *Welfare Schemes & Citizen Rights* (Kalaignar Magalir Urimai, Ration Card, Patta Transfers, Minnalagam EB complaints).
  * **Friday (7:00 AM IST):** *State Economy, Agriculture & Green TN* (Canal desilting, Cauvery water, SIPCOT corridors, solar expansion).
* **Source:** Supabase `tn_today` investigative articles (`status = 'published'`).
* **Visuals:** Cloudflare FLUX 16:9 hero photo paired with bilingual chapter breakdown.
* **Structure:**
  * Chapter 1: அறிமுகம் & திட்ட பின்னணி (Overview & Origin)
  * Chapter 2: முக்கிய திட்ட விவரங்கள் & நிதி ஒதுக்கீடு (Key Specifications, Budget & Timeline)
  * Chapter 3: கள நிலவரம் & துறைசார் பொறுப்புக்கூறல் (Ground Impact & Department Accountability)
  * Chapter 4: மக்கள் உரிமை & முடிவுரை (Citizen Rights & Helplines)
* **Audio Voice:** `ta-IN-ValluvarNeural` (authoritative documentary tone).

---

## 🔑 YouTube API Setup (One-Time Setup)

To allow automated publishing to your YouTube channel:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a Project named `VizhiTN Automation`.
3. Enable **YouTube Data API v3** under APIs & Services.
4. Go to **OAuth consent screen** -> Choose External -> Add test user (your channel Gmail).
5. Go to **Credentials** -> Create Credentials -> **OAuth Client ID** (Application type: *Desktop App*).
6. Obtain `Client ID` and `Client Secret`.
7. Authorize your channel to get a `Refresh Token` with scope `https://www.googleapis.com/auth/youtube.upload`.
8. Add the following secrets to GitHub Secrets and `.env.local`:
   * `YOUTUBE_CLIENT_ID`
   * `YOUTUBE_CLIENT_SECRET`
   * `YOUTUBE_REFRESH_TOKEN`

> [!NOTE]
> If credentials are not set, both pipelines automatically fall back to **DRY-RUN mode**: they render the frames, synthesize the Tamil neural audio, assemble the full MP4 video in `public/youtube_renders/`, and print the upload payload without failing!

---

## 🚀 Running Locally

```bash
# Test Daily Shorts (Generates MP4 locally without uploading)
npm run yt:shorts:dry-run

# Run Daily Shorts (Uploads as Public video to YouTube)
npm run yt:shorts

# Test Long-Form Explainer (Generates 3-5 min MP4 locally)
npm run yt:long:dry-run

# Run Long-Form Explainer for a specific TN Today article
npm run yt:long -- --slug=chennai-metro-phase-2-porur-trial
```
