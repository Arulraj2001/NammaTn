# VizhiTN Google Indexing Automation

Automatically submits today's newly published TN Today articles and civic posts to Google Indexing API so they get indexed faster.

## What it does

- Runs daily at **7:30 AM IST** (2:00 AM UTC) via GitHub Actions
- Fetches today's **published** TN Today articles from the `tn_today` table
- Fetches today's **publicly visible, approved** civic posts from the `post` table
- Submits each URL to Google Indexing API as `URL_UPDATED`
- Can also be triggered manually from GitHub Actions tab

## Files

| File | Purpose |
|------|---------|
| `index.js` | Main indexing script |
| `package.json` | Node.js dependencies |
| `.github/workflows/google-indexing.yml` | GitHub Actions workflow |
| `.env.example` | Local environment variable template |

## Setup

### 1. Get Google Indexing API credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable the **Indexing API**:
   - APIs & Services → Library → Search "Indexing API" → Enable
4. Create a Service Account:
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Download the JSON key file
5. **Verify your domain** in [Google Search Console](https://search.google.com/search-console):
   - Add the service account email as a **user** (Owner) for your property
   - This is required for the Indexing API to work

### 2. Add GitHub Secrets

In your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|-------|
| `GOOGLE_CREDENTIALS_JSON` | The **entire contents** of your Google service account JSON key file |
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Your Supabase **service role** key (from Project Settings → API) |

> ⚠️ **Security**: The service role key bypasses RLS. Never expose it in client code. It's safe here because it's only stored as a GitHub secret and used server-side.

### 3. Push to GitHub

```bash
git add vizhitn-indexing/
git commit -m "Add Google Indexing automation"
git push
```

The workflow will run automatically at 7:30 AM IST daily, or you can trigger it manually:
**Actions → VizhiTN Google Indexing → Run workflow**

## Local testing

```bash
cd vizhitn-indexing
npm install
cp .env.example .env
# Edit .env with your real values
# Place your google-credentials.json in this folder
npm start
```

## Table references (verified from your migrations)

| Content | Table | Column | URL pattern |
|---------|-------|--------|-------------|
| TN Today articles | `tn_today` | `publish_date`, `status = 'published'` | `https://www.vizhitn.in/tn-today/{slug}` |
| Civic posts | `post` | `created_date`, `is_publicly_visible = true`, `moderation_status = 'approved'` | `https://www.vizhitn.in/post/{id}` |

## Notes

- Google Indexing API has a **200 URLs per day** quota. If you publish more than that, the script will fail on the excess.
- The script adds a 1-second delay between requests to stay within rate limits.
- Only **published** TN Today articles and **approved, publicly visible** posts are indexed.