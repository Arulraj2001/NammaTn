# VizhiTN Clarity and SEO audit

Date: 2026-07-21

## Fixed now

- Allowed `https://*.clarity.ms` and `https://c.bing.com` in the enforced CSP so the loader and collection requests are not blocked.
- Load Clarity project `xp7k5wqipw` only after `VizhiTN_cookie_consent=accepted`.
- Exclude admin, authentication, dashboard, profile, and bookmark routes from session recording.
- Added `NEXT_PUBLIC_CLARITY_PROJECT_ID` support while retaining the current project ID as the fallback.
- Removed the root-level homepage canonical that was inherited by child routes without server metadata.
- Standardized generated canonical and structured-data URLs on `https://www.vizhitn.in`.
- Added a permanent non-www to www redirect at the application layer.

## Audit findings

### Priority 0: deployment verification

1. Deploy the current changes.
2. Open a public page in a private window, accept analytics cookies, and reload.
3. In DevTools Network, confirm:
   - `https://www.clarity.ms/tag/xp7k5wqipw` returns 200.
   - a Clarity `collect` request succeeds and has no CSP error.
4. Confirm no Clarity request is made after rejecting cookies or while visiting `/admin/`.
5. Check Clarity real-time recordings, then allow up to a few hours for normal dashboard aggregation.

### Priority 1: indexability and metadata (week 1)

- Convert every indexable route from client-only `ssr: false` output to a server-rendered page shell with crawlable headings and primary copy.
- Add Next.js `metadata` or `generateMetadata` to each indexable route. Client `useEffect` metadata must be a UI fallback, not the only search metadata.
- Give every indexable URL a unique title, description, self-canonical, Open Graph URL, and useful social image.
- Add explicit `noindex, follow` metadata to private, account, form, thin-search, and dashboard routes. Do not rely only on `robots.txt` disallow rules.
- Remove duplicated brand text such as `VizhiTN - Help | VizhiTN` by passing unbranded page titles into the root title template.
- Decide one trailing-slash convention and make redirects, canonicals, internal links, and sitemap URLs match it.

### Priority 2: crawl and sitemap quality (week 1-2)

- Add valuable category hubs, TN Today hub/category pages, districts directory, awareness hubs, scams, jobs, offices, and other editorial landing pages to the sitemap.
- Exclude thin, empty, duplicated, private, and parameterized URLs.
- Use real content update timestamps. Do not change every district page's `lastModified` every day when its content did not change.
- Keep only canonical 200-status URLs in the sitemap and submit it in Google Search Console.
- Replace hidden SEO-only link blocks with visible, useful district/category navigation for users.

### Priority 3: content and local authority (weeks 2-6)

- Build district + issue pages only where there is enough unique evidence: current reports, affected areas, official contact path, update history, FAQs, and resolution outcomes.
- Publish original Tamil Nadu civic explainers and timely TN Today articles with named authors, editorial dates, sources, corrections, and clear ownership.
- Add visible breadcrumbs and matching `BreadcrumbList` schema. Use `Article`/`NewsArticle` schema only for genuine editorial articles.
- Create internal-link modules based on real relationships: district to issue, issue to official guide, report to relevant hub, and article to evergreen explainer.
- Earn citations through useful public datasets, ward/district resources, community organizations, and locally relevant reporting; avoid automated or paid link schemes.

### Measurement cadence

- Record a baseline before release: indexed pages, excluded-page reasons, clicks, impressions, CTR, average position, Core Web Vitals, crawl errors, and top queries/pages.
- Review Search Console weekly for the first month and annotate deployments.
- Prioritize pages with impressions in positions 4-20: improve intent match, title/description, supporting sections, and internal links.
- Remove or consolidate pages that remain thin or duplicate rather than generating more low-value URLs.
- Use Clarity for UX evidence (dead clicks, rage clicks, scroll depth, form abandonment), not as a ranking measurement tool.

## Definition of done

- Clarity loader and collection requests succeed after consent, and never run on excluded routes or after rejection.
- Every indexable page returns useful HTML without client JavaScript and has one self-canonical.
- Every sitemap URL returns 200, is canonical, indexable, and contains unique user-facing value.
- Search Console shows no systemic canonical, blocked-resource, soft-404, or duplicate-page pattern after recrawl.

