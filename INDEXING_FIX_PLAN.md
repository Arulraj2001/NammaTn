# Google Indexing Fix Plan for vizhitn.in — v2 (Code-Level Analysis)

Based on deep code review of the Next.js App Router, sitemap, layout metadata, routing, and audit reports (July 21, 2026), this v2 plan identifies **exact root causes** and **specific file changes** for all 325 non-indexed pages.

---

## Issue Summary

| Issue | Pages | Severity | Priority |
|-------|------:|----------|----------|
| Page with redirect | 167 | High | P0 |
| Excluded by 'noindex' tag | 96 | High | P0 |
| Discovered - currently not indexed | 45 | Medium | P1 |
| Crawled - currently not indexed | 13 | Medium | P1 |
| Soft 404 | 2 | Low | P2 |
| Duplicate without canonical | 2 | Low | P2 |
| **TOTAL** | **325** | | |

---

## P0: Page with Redirect (167 pages)

### Root Cause (confirmed from code + live verification)

**Live verification results (Aug 17, 2026):**

| URL | Status | Redirect |
|-----|--------|----------|
| `https://www.vizhitn.in/thoothukudi/` | **308** | → `/thoothukudi` |
| `https://www.vizhitn.in/thoothukudi` | 200 | — |
| `https://www.vizhitn.in/district/chennai` | **308** | → `/chennai` |
| `https://www.vizhitn.in/coimbatore/road-infrastructure` | **200** | — (alias, no redirect!) |
| `https://www.vizhitn.in/coimbatore/road-infrastructure/` | **308** | → no-slash |
| `https://vizhitn.in/thoothukudi` | **308** | → www |
| `https://www.vizhitn.in/explore/` | **308** | → `/explore` |
| `https://www.vizhitn.in/this-page-should-not-exist` | **200** | — (soft 404!) |
| `https://www.vizhitn.in/coimbatore/electricity` | **200** | — (alias, no redirect!) |
| `https://www.vizhitn.in/coimbatore/water-sanitation` | **200** | — (alias, no redirect!) |

**Root cause 1 — Trailing-slash URLs return 308 (the main "Page with redirect" source):**
- `next.config.js` sets `trailingSlash: false`, so `/thoothukudi/` → 308 → `/thoothukudi`
- Google discovered the **slash versions** first (from before this config was set)
- GSC classifies these 308s as "Page with redirect" until Google re-crawls and updates
- **Fix:** Ensure Google only discovers no-slash URLs via sitemap + internal links, then request re-crawl via Indexing API

**Root cause 2 — Alias slug URLs return 200 with no redirect (duplicate content):**
- `src/app/(user)/[city]/[issue]/page.jsx` lines 45–50 maps aliases:
```javascript
if (issueSlug === 'electricity')         targetSlugs.push('power-cut');
if (issueSlug === 'power-cut')           targetSlugs.push('electricity');
if (issueSlug === 'water-sanitation')    targetSlugs.push('water-issue');
if (issueSlug === 'water-issue')         targetSlugs.push('water-sanitation');
if (issueSlug === 'road-infrastructure') targetSlugs.push('road-problem');
if (issueSlug === 'road-problem')        targetSlugs.push('road-infrastructure');
```
- This makes 3 pairs of URLs serve **identical content** with **no redirect**:
  - `/coimbatore/power-cut` ↔ `/coimbatore/electricity`
  - `/coimbatore/water-issue` ↔ `/coimbatore/water-sanitation`
  - `/coimbatore/road-problem` ↔ `/coimbatore/road-infrastructure`
- Google sees these as duplicates and may classify them under "Page with redirect" (canonical consolidation) or "Duplicate without user-selected canonical"

**Root cause 3 — Legacy `/district/:slug` URLs return 308:**
- `next.config.js` line 106: `{ source: '/district/:slug', destination: '/:slug', permanent: true }`
- Google still has old `/district/chennai` URLs indexed → these 308 to `/chennai`
- GSC classifies them as "Page with redirect"

### Fixes

**Fix A — Add 301 redirects for alias URLs** in `next.config.js`:
```javascript
// next.config.js redirects()
{ source: '/:city/electricity', destination: '/:city/power-cut', permanent: true },
{ source: '/:city/water-sanitation', destination: '/:city/water-issue', permanent: true },
{ source: '/:city/road-infrastructure', destination: '/:city/road-problem', permanent: true },
```
Then remove the alias mapping from `[issue]/page.jsx` (lines 45–50) so only canonical slugs are served.

**Fix B — Ensure Google only discovers no-slash URLs:**
- Sitemap already uses no-slash URLs ✓
- Audit all internal links for trailing slashes:
```bash
grep -rn "to=\"/[a-z-]*/\"" src/components src/views src/pages --include="*.jsx" | head -50
grep -rn 'href="/[a-z-]*/"' src/components src/views src/pages --include="*.jsx" | head -50
```
- Replace any trailing-slash internal links with no-slash versions
- After deploy, submit sitemap in GSC and use Indexing API to request re-crawl of affected URLs

**Fix C — Handle `/district/` legacy URLs:**
- The 308 redirect already exists ✓
- After sitemap resubmission, Google will re-crawl and see the redirects
- Optionally use Indexing API `URL_REMOVED` for `/district/*` URLs

### Verification (after fixes)
```bash
# All should return 301 (not 308) to canonical no-slash URL
curl -sI https://www.vizhitn.in/thoothukudi/ | grep -i location
curl -sI https://www.vizhitn.in/coimbatore/electricity | grep -i location
curl -sI https://www.vizhitn.in/coimbatore/water-sanitation | grep -i location
curl -sI https://www.vizhitn.in/coimbatore/road-infrastructure | grep -i location
curl -sI https://www.vizhitn.in/district/coimbatore | grep -i location
```
All should show `301` to the canonical no-slash URL.

---

## P0: Excluded by 'noindex' (96 pages)

### Root Cause (confirmed from code)

**Intentional noindex** (keep these — 5 pages):
- `src/app/(user)/search/page.jsx` — `robots: { index: false, follow: true }`
- `src/app/(user)/bookmarks/layout.jsx` — `index: false, follow: false`
- `src/app/(user)/create/layout.jsx` — `index: false, follow: false, nocache: true`
- `src/app/(user)/dashboard/layout.jsx` — `index: false, follow: false, nocache: true`
- `src/app/(user)/me/layout.jsx` — `index: false, follow: false, nocache: true`
- `src/app/admin/layout.jsx` — `index: false, follow: false`

**Unintentional noindex — seed/test posts (~50 pages):**
- All `/post/post-dist-seed-*` and `/post/sit-seed-*` URLs are `noindex, follow`
- These are UGC moderation defaults from `src/lib/programmaticIndexing.js` / post-detail metadata
- **Action:** Delete or repurpose these from the database. If they must exist, keep them noindexed but ensure they are NOT linked to from crawlable pages (internal links to noindex pages waste crawl budget)

**Unintentional noindex — city/issue pages (~30 pages, e.g., `/coimbatore/road-infrastructure`, `/madurai/water-sanitation`):**
- `getCityIssueRobots()` in `src/lib/programmaticIndexing.js` sets `index: false` when `reportCount === 0`
- These city/issue pages get `reportCount: 0` from `fetchCityIssueData()` in `[issue]/page.jsx`
- The query against `unified_explore_feed` may return 0 rows because either:
  a) The view/table `unified_explore_feed` has different column names (query uses `title:title_en,description:content_en` — if columns don't exist, query fails → `dataAvailable: false` → should return indexable... but the catch block may not be hit since Supabase `.select()` with invalid columns doesn't throw)
  b) The status field is not `'active'`
  c) The report data genuinely doesn't exist yet

Either way, these pages **should be indexable** — they have editorial value with descriptions, FAQs, and official complaint channels.

**Unintentional noindex — duplicate slash/no-slash URLs:**
- `/coimbatore/road-infrastructure` and `/coimbatore/road-infrastructure/` — both return noindex because they resolve to the same page with 0 reports

### Fixes

**Fix A — Clean up seed/test posts (SQL or admin panel):**
```sql
-- Delete all seed/test posts
DELETE FROM post WHERE id LIKE 'post-dist-seed-%' OR id LIKE 'sit-seed-%' OR id LIKE 'post-explore-%' OR id LIKE 'scam-seed-%' OR id LIKE 'emerg-seed-%';
-- Or mark them non-public & non-approved
UPDATE post SET is_publicly_visible = false, moderation_status = 'rejected'
WHERE id LIKE 'post-dist-seed-%' OR id LIKE 'sit-seed-%' OR id LIKE 'post-explore-%' OR id LIKE 'scam-seed-%' OR id LIKE 'emerg-seed-%';
```
Remove all internal links to these posts after cleanup.

**Fix B — Make city/issue pages indexable even with 0 reports:**
In `src/lib/programmaticIndexing.js`, change the policy:
```javascript
export function shouldIndexCityIssuePage({ dataAvailable, reportCount }) {
  // EDITORIAL DECISION: These pages have editorial content (FAQ, complaint
  // channels, official contacts, nearby districts). Index them regardless
  // of live report count. Use noindex ONLY for confirmed data outages.
  return !!dataAvailable;
}
```
OR — better — keep the current logic but fix `fetchCityIssueData()` in `[issue]/page.jsx`:
1. Remove the `.select('id,title:title_en,...')` alias syntax which breaks if `title_en`/`content_en` columns don't exist in `unified_explore_feed`
2. Use `select('*')` or verify actual column names against the view
3. Verify the view/table exists in Supabase and the status filter matches

**Fix C — Ensure only canonical (no-slash) URLs are reachable:**
- After implementing P0 Fix B (301 slash → no-slash), Google will only see one URL per page
- Validate with `curl -sI https://www.vizhitn.in/coimbatore/road-infrastructure/` → should 301

**Fix D — Verify canonical and robots on touchpoints:**
- After fixes, run:
```bash
curl -s https://www.vizhitn.in/coimbatore/road-infrastructure | grep -o '<link rel="canonical"[^>]*>'
curl -s https://www.vizhitn.in/coimbatore/road-infrastructure | grep -o '<meta name="robots"[^>]*>'
```
The first should show the no-slash canonical; the second should show `index, follow`.

---

## P1: Discovered — Currently Not Indexed (45 pages)

### Root Cause (confirmed from code)

These pages are **new** and Google discovered them but hasn't crawled/indexed yet. They include:

| Category | URLs | In sitemap? |
|----------|------|-------------|
| Policy pages (new) | `/advertising-policy`, `/editorial-policy`, `/verification-methodology`, `/corrections`, `/sources` | ❌ **NOT in sitemap** |
| Area pages | `/area/*` (12 pages) | ✅ via `getActiveAreas(500)` |
| Category hubs | `/category/agriculture`, `/category/education`, etc. | ✅ in sitemap |
| Office pages | `/office/*` (11 pages) | ✅ via `OFFICES.forEach` |
| TN Today category/articles | `/tn-today/*` | ✅ (but limited to 500) |
| Other | `/authors`, `/authors/vizhitn-editorial-team`, `/community` | ❌ `/authors` NOT in sitemap |

**New pages not in `/sitemap.js`:**
- `/advertising-policy`, `/editorial-policy`, `/verification-methodology`, `/corrections`, `/sources`, `/authors`, `/authors/vizhitn-editorial-team`

### Fixes

**Fix A — Add all missing policy/author pages to sitemap.js:**
In `src/app/sitemap.js`, add these to the utility pages array:
```javascript
'/advertising-policy', '/editorial-policy', '/verification-methodology',
'/corrections', '/sources', '/authors', '/authors/vizhitn-editorial-team',
```

**Fix B — Raise TN Today article limit (optional):**
`.limit(500)` → `.limit(1000)` if more than 500 articles exist.

**Fix C — Internal linking:**
Add links to these policy pages from the footer (probably already linked there, but verify). Every indexable page should have at least one internal link from a crawlable page.

**Fix D — Push indexing via Google Indexing API:**
Enhance `vizhitn-indexing/index.js` to also submit these new page types:
```javascript
// Add static page submission
const STATIC_PAGES = [
  '/advertising-policy', '/editorial-policy', '/verification-methodology',
  '/corrections', '/sources', '/authors', '/authors/vizhitn-editorial-team',
  // ... all category, office, area URLs
];
```
Or use the existing `vizhitn-indexing` script and extend it to fetch from sitemap.xml and submit all URLs once.

**Fix E — Fix crawl-budget leech first:**
The 167 redirects + 96 noindexed pages consume crawl budget. Fixing P0 first frees Google's crawl budget for these new pages.

---

## P1: Crawled — Currently Not Indexed (13 pages)

### Root Cause (confirmed from code)

| URL | Problem |
|-----|---------|
| `/favicon.ico` | **Non-HTML asset** — should never be indexed |
| `/manifest.json` | **Non-HTML asset** — should never be indexed |
| `/category/power-cut`, `/scam`, `/road-problem`, `/stay`, `/jobs`, `/water-issue` | **Thin content** — audit found 135–157 words, NO server-rendered H1 |
| `/post/post-dist-seed-theni-rp` | **Seed post** — should be deleted |
| `/listings`, `/trending` | **Generic metadata** — audit found default title "VizhiTN – Tamil Nadu Civic Complaint & Community Platform" (no unique server metadata) |

### Fixes

**Fix A — Block non-HTML files in `public/robots.txt`:**
```
Disallow: /favicon.ico
Disallow: /manifest.json
Disallow: /site.webmanifest
```

**Fix B — Add server-rendered H1 and content to category pages:**
`src/app/(user)/category/[slug]/page.jsx` needs:
- A unique H1: `Power Cut Reports in Tamil Nadu`
- A server-rendered intro paragraph (200+ words) with unique description per category
- Breadcrumbs `<Breadcrumbs />`
- Confirm the H1 exists in initial server HTML (audit found empty `h1s: []`)

**Fix C — Give `/listings` and `/trending` unique metadata:**
- `src/app/(user)/listings/page.jsx`: verify it exports unique `metadata` (audit v1 says it used generic homepage title — check if this was fixed)
- `src/app/(user)/trending/layout.jsx`: verify `canonical: '/trending'` + unique title
- Add server-rendered H1 if missing

**Fix D — Delete seed post:**
Add `/post/post-dist-seed-theni-rp` to the same SQL cleanup as P0 noindex fix.

---

## P2: Soft 404 (2 pages)

### Root Cause

- `/explore/` and `/terms/` with trailing slash — these are being served from a URL that returns 200 but content may be a soft-404 fallback
- The audit found `/this-page-should-not-exist-audit` returns HTTP 200 with "District Not Found" + `noindex, nofollow` — this is the real soft-404 bug
- The next.config.js `trailingSlash: false` should redirect `/explore/` → `/explore`, but Google may be seeing 200 before the redirect

### Fixes

**Fix A — Enforce real 404s for unknown routes:**
- In `src/app/(user)/[city]/[issue]/page.jsx`, the code calls `notFound()` for invalid city/issue — this is correct
- Verify `src/app/(user)/[city]/page.jsx` also calls `notFound()` for invalid cities
- Ensure the catch-all `(user)/[...not-found]/page.jsx` (or equivalent) returns a real 404
- After P0 Fix B (301 redirect), `/explore/` and `/terms/` will properly redirect, and GSC will stop classifying them as soft 404s

**Fix B — Verify with curl:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://www.vizhitn.in/this-page-should-not-exist
curl -s -o /dev/null -w "%{http_code}" https://www.vizhitn.in/this-page-should-not-exist-audit
```
Both should return 404. If 200, fix the 404 route.

---

## P2: Duplicate Without User-Selected Canonical (2 pages)

### Root Cause

- `/cuddalore/water-issue` (no trailing slash) and `/erode/road-problem` (no trailing slash)
- These are the **canonical no-slash versions** but Google sees them as duplicates of the slash versions that may still be linked internally
- The canonical generated is `${SITE_URL}/${city}/${issue}` (no slash) — but `next.config.js` allows **both** URL variants to return 200

### Fix

After implementing **P0 Fix B** (301 slash → no-slash redirect), Google will see only one URL per page. Additionally, audit all internal links:

```bash
# Find internal links with trailing slashes
grep -rn "to=\"/[a-z-]*/" src/components src/views src/pages --include="*.jsx" | head -50
grep -rn 'href="/[a-z-]*/"' src/components src/views src/pages --include="*.jsx" | head -50
```
Replace any trailing-slash internal links with no-slash versions.

---

## Implementation Order

### Phase 1 — Critical (Week 1)

| Step | File(s) | Change |
|------|---------|--------|
| 1.1 | `src/app/(user)/[city]/[issue]/page.jsx` | Remove alias slug mapping (lines 45–50) |
| 1.2 | `next.config.js` | Add alias redirects (electricity→power-cut, etc.) + trailing-slash 301 |
| 1.3 | `src/lib/programmaticIndexing.js` | `shouldIndexCityIssuePage()` — index all city/issue pages with editorial content |
| 1.4 | `src/app/(user)/[city]/[issue]/page.jsx` | Fix `fetchCityIssueData()` — use `select('*')` or verified columns |
| 1.5 | `public/robots.txt` | Disallow favicon.ico, manifest.json, site.webmanifest |
| 1.6 | SQL / Admin | Delete or deprecate all seed/test posts |

### Phase 2 — Content (Week 1–2)

| Step | File(s) | Change |
|------|---------|--------|
| 2.1 | `src/app/(user)/category/[slug]/page.jsx` | Add server-rendered H1 + 200-word intro + `<Breadcrumbs />` |
| 2.2 | `src/app/sitemap.js` | Add policy pages, `/authors`, etc. |
| 2.3 | `src/app/(user)/listings/page.jsx`, `trending`, `leaderboard`, `support`, `rwa`, `csr` | Verify unique server metadata + H1 |

### Phase 3 — Indexing Push (Week 2–3)

| Step | File(s) | Change |
|------|---------|--------|
| 3.1 | `vizhitn-indexing/index.js` | Extend to submit all sitemap URLs once (not just daily new ones) |
| 3.2 | GSC | Submit updated sitemap after deploy |
| 3.3 | Audit — curl | Verify all 325 affected URLs return 200, no redirects, correct robots |

### Phase 4 — Monitoring (Week 3–4)

| Step | Action |
|------|--------|
| 4.1 | Monitor GSC "Page with redirect" — should drop from 167 → 0 within 2 weeks |
| 4.2 | Monitor GSC "Excluded by noindex" — legitimate pages should disappear |
| 4.3 | Monitor "Crawled - currently not indexed" — category/listing/trending pages should index |
| 4.4 | Request indexing for remaining pages via `vizhitn-indexing` |

---

## Success Metrics

- [ ] Page with redirect: 167 → 0
- [ ] Excluded by noindex: 96 → ~5 (search/create/bookmarks/dashboard only)
- [ ] Discovered not indexed: 45 → 0
- [ ] Crawled not indexed: 13 → 0
- [ ] Soft 404: 2 → 0
- [ ] Duplicate canonical: 2 → 0
- [ ] All 167 current redirect URLs return 200 with no redirects
- [ ] All 96 noindexed URLs return `index, follow` (except intentional private pages)
- [ ] Sitemap contains all 45 discovered pages
- [ ] robots.txt blocks favicon.ico + manifest.json
- [ ] Category pages have server-rendered H1 + ≥200 words
- [ ] listings/trending/leaderboard/support/rwa/csr have unique metadata + H1

---

## Files to Modify (Summary)

| File | Changes |
|------|---------|
| `src/app/(user)/[city]/[issue]/page.jsx` | Remove alias mapping; fix DB select; verify notFound |
| `next.config.js` | Add alias 301s; add trailing-slash 301 |
| `src/lib/programmaticIndexing.js` | Index all editorial city/issue pages |
| `public/robots.txt` | Block non-HTML files |
| `src/app/sitemap.js` | Add policy/author pages; raise article limit |
| `src/app/(user)/category/[slug]/page.jsx` | Add H1, intro, breadcrumbs |
| `src/app/(user)/listings/page.jsx` | Unique metadata + H1 |
| `src/app/(user)/trending/layout.jsx` | Unique metadata + H1 |
| Database | Remove seed/test posts |
| `vizhitn-indexing/index.js` | Extend to submit all sitemap pages |