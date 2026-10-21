# VizhiTN YouTube Automation Engine (`scripts/youtube`)

An autonomous, production-grade video production and publishing engine designed specifically for **VizhiTN** (`vizhitn.in`).

This engine converts live Tamil Nadu civic alerts, practical citizen dispute solutions, and in-depth investigative articles into high-engagement **YouTube Shorts** and **Weekly Long-Form Explainers** with **zero recurring software or API costs**.

---

## 📁 Architecture Overview

All YouTube production logic is strictly encapsulated inside `scripts/youtube/`:

```
scripts/youtube/
├── README.md                          # Architecture, credentials, and runbook
├── config.mjs                         # Brand palette, aspect ratios, Edge-TTS voices
├── engine/
│   ├── browser-detector.mjs           # Auto-detects Chrome/Chromium/Edge cross-platform
│   ├── tts-engine.mjs                 # Micro-chunk neural speech synthesizer with SSML breath pauses
│   ├── tamil-phonetics.mjs            # Spoken Tamil normalizer & Citizen Dispute Knowledge Base
│   ├── cloudflare-visuals.mjs         # Dedicated Cloudflare FLUX 9:16 & 16:9 scene generator
│   ├── frame-renderer.mjs             # Headless browser HTML card renderer (HarfBuzz Tamil shaping)
│   ├── thumbnail-engine.mjs           # High-CTR 16:9 custom thumbnail generator
│   ├── video-composer.mjs             # FFmpeg stitcher, Ken Burns zoompan motion, audio ducking
│   └── youtube-client.mjs             # Resumable YouTube API v3 uploader (2026 AI disclosure compliant)
├── templates/
│   ├── shorts/
│   │   ├── scene-1-hook.html          # Scene 1: Photorealistic FLUX visual + Question Hook + Radar
│   │   ├── scene-2-breakdown.html     # Scene 2: High-contrast data cards with timings & badges
│   │   ├── scene-3-helpline.html      # Scene 3: Emergency helplines (1912, 1913, 1930) + vizhitn.in CTA
│   │   └── daily-digest-card.html     # Single-frame fallback layout
│   └── long-form/
│       └── chapter-slide.html         # 1920x1080 (16:9) multi-chapter investigative slide layout
└── pipelines/
    ├── generate-rights-shorts.mjs     # Daily 1:30 PM IST Citizen Dispute Solution Short (50s)
    ├── generate-shorts.mjs            # Daily 7:30 PM IST Civic Lifeline Alert Short (50s)
    └── generate-long-video.mjs        # Weekly 3x Long-Form Documentary Explainer (6–9 mins)
```

---

## 🎬 The Tri-Slot Broadcast Schedule

### 1. Slot 1: Citizen Rights & Dispute Guide (`yt:rights`)
* **Schedule:** Daily at **01:30 PM IST** (Lunchtime slot).
* **Format:** 1080×1920 (9:16 Vertical Short), 50–65s.
* **Content:** Real-life disputes that ordinary citizens face (House owner advance, parking nuisance, traffic police rules, loan apps, Patta transfer delays).
* **3-Step Structure:**
  1. **Step 1 (How to Behave):** De-escalate, stay calm, written notices.
  2. **Step 2 (Evidence Gathering):** WhatsApp proof, bank transactions, video records.
  3. **Step 3 (Legal Sections & Helplines):** Exact Act (TNRRRL Act, MV Act, Section 133, Consumer 1915, Cyber 1930, CM Cell 1100).

### 2. Slot 2: Daily Lifeline Civic Alert (`yt:shorts`)
* **Schedule:** Daily at **07:30 PM IST** (Evening commute slot).
* **Format:** 1080×1920 (9:16 Vertical Short), 45–55s.
* **Content:** Live TANGEDCO power shutdowns, water supply pipelines, CMRL diversions, heavy rain alerts across all 38 districts.
* **Audio Voice:** Conversational Spoken Tamil (*"ஹலோ மக்களே!"*).

### 3. Slot 3: Weekly In-Depth Documentary (`yt:long`)
* **Schedule:** **Mon, Wed, Fri at 07:00 AM IST**.
* **Format:** 1920×1080 (16:9 Landscape), 6 to 9 minutes.
* **Themes:**
  * **Monday:** Mega Infrastructure & Transit (CMRL Phase 2, Flyovers, Expressways).
  * **Wednesday:** Welfare Schemes & Citizen Rights (Kalaignar Magalir Urimai, Ration Card, Minnalagam).
  * **Friday:** State Economy, Agriculture & Green TN (Mettur water, MSP, SIPCOT, green energy).
* **Includes:** Automatically rendered custom 16:9 thumbnail attached via `youtube.thumbnails.set()`.

---

## 🔑 Required API Keys & Secrets

Add the following secrets to GitHub Secrets and `.env.local`:

```env
# 1. Dedicated Cloudflare Workers AI (10,000 Free Neurons/Day for YouTube Visuals)
YOUTUBE_CLOUDFLARE_ACCOUNT_ID="your_dedicated_account_id"
YOUTUBE_CLOUDFLARE_API_TOKEN="your_dedicated_api_token"

# 2. YouTube Data API v3 OAuth2 Credentials
YOUTUBE_CLIENT_ID="your_google_oauth_client_id"
YOUTUBE_CLIENT_SECRET="your_google_oauth_client_secret"
YOUTUBE_REFRESH_TOKEN="your_persistent_refresh_token"

# 3. Existing Project Credentials (already present)
SUPABASE_URL="https://hzgrzcablefquddisqkf.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_key"
GEMINI_API_KEY="your_gemini_key"
```

> [!NOTE]
> When running without credentials or with `--dry-run`, all pipelines execute locally: they render all frames, synthesize the Tamil neural speech, compose the MP4 videos with Ken Burns motion, and output the final MP4 to `public/youtube_renders/` without failing.

---

## 🚀 Running Locally

```bash
# 1. Test Citizen Rights & Dispute Guide Short (Dry Run)
npm run yt:rights:dry-run

# 2. Publish Citizen Rights Short to YouTube
npm run yt:rights

# 3. Test Daily Civic Lifeline Short (Dry Run)
npm run yt:shorts:dry-run

# 4. Publish Daily Civic Short to YouTube
npm run yt:shorts

# 5. Test Long-Form Documentary (Dry Run)
npm run yt:long:dry-run

# 6. Publish Long-Form Documentary for a specific article
npm run yt:long -- --slug=chennai-metro-phase-2-corridor-4-poonamallee-porur-stretch-trial-runs-november-s
```
