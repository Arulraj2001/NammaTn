# VizhiTN 360° Website Audit

**Website:** https://www.vizhitn.in/  
**Audit date:** 21 July 2026  
**Scope:** 195 sitemap URLs, 465 unique internal targets discovered from those pages, representative rendered-page tests, mobile/desktop Lighthouse runs, robots/sitemap/headers/schema/forms/policy review, search-result sampling, and competitor research.

> Important: Search Console, Google Analytics, server logs, AdSense Policy Center, Google Business Profile, and commercial backlink/keyword databases were not supplied. Rankings, backlinks, field Core Web Vitals, and search volume therefore use public evidence and directional opportunity estimates, not private account data. Lighthouse results are controlled lab tests, not real-user field data.

## Executive verdict

VizhiTN has a genuinely useful proposition: a statewide, citizen-powered Tamil Nadu civic platform combining local issue reporting, alerts, scams, jobs, stays, office information, awareness resources, district hubs, and civic news. The interface is modern, mobile-oriented, and accessible. The underlying SEO implementation is more advanced than many young sites: crawlable HTML, self-referencing canonicals on most pages, rich metadata, broad schema coverage, HTTPS, a valid robots file, and strong security headers.

The site is nevertheless **not ready for aggressive scaling or AdSense approval yet**. The main risk is not a missing SEO tag; it is quality and consistency across a large programmatic footprint.

The five highest-impact issues are:

1. **TN Today canonicals and share links point away from the published VizhiTN URLs.** Two articles canonicalize and share to `nammatn.in`; another points to a different non-`www` VizhiTN slug. This can transfer indexing and ranking signals away from the pages in the sitemap.
2. **Nonexistent URLs return HTTP 200.** A made-up path showed “District Not Found,” `noindex`, and HTTP 200. This is a soft-404 pattern. Google recommends returning a real 404/410 for nonexistent pages.
3. **The indexable inventory and sitemap disagree.** The sitemap lists 195 URLs, while the crawl found 134 additional indexable internal pages absent from it. These include area pages, office pages, several city/category pages, category news pages, and important hubs.
4. **Homepage performance is poor and unstable.** Mobile Lighthouse performance was 54; desktop was 12. The live OpenStreetMap tile became LCP, and map rendering plus hydration caused severe layout shifts and main-thread work.
5. **The site looks mass-templated in places.** 163 sitemap pages have descriptions over 160 characters, repeated formulaic district/category copy and FAQ schema is deployed at scale, some pages say “updated every hour” without visible evidence, and several indexable client-rendered hubs expose generic titles/no server H1. This creates people-first-content and AdSense “low-value content” risk.

## Scores

| Area | Score | Assessment |
|---|---:|---|
| UI / visual design | 79/100 | Modern, clean, strong card system; cookie overlay and density reduce focus. |
| UX / user journey | 72/100 | Clear reporting/search entry points; breadth makes the information architecture feel fragmented. |
| SEO | 61/100 | Strong foundations, undermined by canonical leakage, templated copy, and weak external authority. |
| Technical SEO | 64/100 | Good robots, sitemap, metadata, schema, HTTPS; soft 404s and sitemap mismatch are serious. |
| Performance | 38/100 | Mobile 54 and desktop 12 in lab; LCP, CLS, TBT, map work, and JS are the main problems. |
| Mobile | 75/100 | Responsive and touch-oriented; performance and cookie obstruction reduce the score. |
| Accessibility | 93/100 | Lighthouse 98; heading order, redundant alt text, and label/name mismatch remain. |
| Content | 56/100 | Useful live/local intent and some strong news pages, but quality is uneven and templating is visible. |
| E-E-A-T / trust | 57/100 | Independent status and sources are disclosed; ownership, authors, review process, and verification evidence are weak. |
| Local SEO | 54/100 | Excellent Tamil Nadu/district architecture; no evidence of eligible local presence or independent citations. |
| Security | 82/100 | Strong headers and HTTPS; CSP permits unsafe inline/eval and public forms lack visible anti-abuse controls. |
| CRO | 66/100 | Good “Use My Location,” “Search Area,” and “Log Issue” CTAs; focus and proof need improvement. |
| Google readiness | 59/100 | Crawlable and structured, but canonical, soft-404, content-quality, and authority issues limit confidence. |
| AdSense readiness | 38/100 | Core policies exist, but placeholder `ads.txt`, low-value inventory risk, UGC safety, and publisher trust gaps remain. |
| **Overall** | **60/100** | A promising platform with sound fundamentals that needs quality control before scale. |

## 1. Website overview and positioning

### Business and audience

VizhiTN is best positioned as **Tamil Nadu’s independent civic information and community verification network**, not as a generic community portal. Its likely audiences are:

- Residents searching for power, water, road, scam, or emergency updates.
- Citizens documenting a civic issue and seeking community validation.
- New residents looking for jobs, rooms, local offices, or area information.
- RWAs, NGOs, journalists, local advocates, CSR teams, and public officials monitoring issues.
- Search users looking for complaint channels, helplines, and current local status.

### First impression

The homepage communicates the core need quickly: “Know what’s happening in your area right now.” “Use My Location” and “Search Area” are appropriate primary actions. The map visually reinforces local relevance. The main weakness is that the site immediately expands into alerts, emergency help, jobs, stays, office reviews, bribes, community, news, RWA, CSR, awareness, and listings. That can feel like several products sharing one navigation.

### Recommended positioning

Use one promise everywhere:

> **See, report, and verify civic issues in your Tamil Nadu neighbourhood.**

Treat jobs, stays, news, and directories as supporting modules, not equal-level brand promises. The key differentiation against official grievance tools is **public evidence, community verification, cross-department discovery, and local historical context**.

## 2. Crawl and indexability findings

### What was found

- `robots.txt`: HTTP 200, allows public crawling, blocks `/admin/`, `/api/`, and authentication paths, and declares the sitemap.
- `sitemap.xml`: HTTP 200 with **195 URLs**.
- All 195 sitemap URLs returned HTTP 200 during the crawl.
- All sitemap URLs had a title, meta description, and canonical.
- The site-wide link crawl found **465 unique internal targets** and no conventional 4xx/5xx broken links.
- **270 internally discoverable targets were not in the sitemap.**
- **134 of those were indexable** and absent from the sitemap.
- **126 discoverable `/post/` pages are `noindex, follow`.**
- A fake URL returned HTTP 200 and “District Not Found” with `noindex, nofollow`.

### Critical canonical errors

| Sitemap URL | Canonical currently declared | Impact |
|---|---|---|
| `/tn-today/cm-vijay-joins-anti-drug-awareness-run-as-tamil-nadu-pushes-drug-free-campaign` | `https://vizhitn.in/tn-today/cm-vijay-anti-drug-awareness-run-tamil-nadu-drug-free-campaign` | Different host and slug; sitemap/canonical conflict. |
| `/tn-today/chennai-broadway-bus-services-continue-from-temporary-terminals` | `https://nammatn.in/tn-today/chennai-broadway-bus-services-temporary-terminals` | Sends canonical equity to another domain. |
| `/tn-today/tamil-nadu-flags-off-300-new-state-transport-buses` | `https://nammatn.in/tn-today/tamil-nadu-flags-off-300-new-state-transport-buses` | Sends canonical equity to another domain. |

The rendered share buttons also use the `nammatn.in` URLs. Fix the canonical, Open Graph URL, share URL, NewsArticle `mainEntityOfPage`, and sitemap URL together. Google treats redirects, canonical tags, and sitemap inclusion as canonicalization signals; they should all agree ([Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)).

### Soft 404

`https://www.vizhitn.in/this-page-should-not-exist-audit` returned:

- HTTP 200
- H1 “District Not Found”
- `noindex, nofollow`
- No canonical

Return a real HTTP 404 from `notFound()` for unknown districts, posts, questions, articles, areas, and office types. A 200 error page can be classified as a soft 404 ([Google status-code guidance](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes), [Search Console 404 guidance](https://support.google.com/webmasters/answer/2445990?hl=en)).

### Sitemap action

Add all durable, canonical, indexable pages that add standalone value:

- `/explore`, `/help`, `/situations`, `/ask`
- area pages (`/area/...`)
- office pages (`/office/...`)
- all indexable city/category combinations
- TN Today category pages
- other finished, indexable hubs

Do not add login, search, create, bookmarks, account pages, thin filters, or temporary user-generated items. Decide whether `/post/` pages should be a searchable content asset or remain noindex. The current middle ground—prominent internal links to 126 noindex pages—spends crawl and link equity on content that cannot rank.

## 3. Technical SEO

### Metadata

Strengths:

- Titles and descriptions exist on every sitemap URL.
- Homepage has canonical, robots, Open Graph, Twitter Card, author, geo, and language metadata.
- HTTPS/non-`www` variants redirect to the preferred `https://www.vizhitn.in/` host.
- Search is correctly `noindex, follow`; create is `noindex, nofollow, nocache`.

Issues:

- **163/195 sitemap descriptions exceed 160 characters**, often 240–266 characters on district pages. Rewrite to roughly 140–160 characters and lead with the unique local value.
- **16 titles exceed 60 characters; seven are under 30.**
- Many dynamic titles contain duplicated branding: `| VizhiTN | VizhiTN`.
- Client-side title changes can replace a specific server title with generic text such as `District | VizhiTN`.
- Five indexable hubs (`leaderboard`, `listings`, `support`, `rwa`, `csr`) expose the generic homepage title in fetched HTML.
- Six indexable hubs lacked a server-rendered H1 in the link crawl; category pages and three news pages also lacked H1s in the initial server HTML.

Fix title templating once at the layout level. A child title should supply the page-specific portion; the root layout should append `| VizhiTN` exactly once.

### Heading structure

- Homepage has one H1 and logical H2s, but footer headings jump to H4.
- Lighthouse flags non-sequential heading order.
- Several client-heavy pages do not expose their H1 in initial HTML.

Use H2 for footer group labels or visually styled non-heading text. Server-render the core H1 and meaningful content for every indexable page.

### Structured data

Observed across the sitemap:

| Type | Approximate coverage |
|---|---:|
| Organization | 195 |
| WebSite | 195 |
| WebPage | 169 |
| BreadcrumbList | 172 |
| FAQPage | 163 |
| AdministrativeArea | 37 |
| GovernmentOrganization | 121 |
| NewsArticle | 3 |

Strengths include consistent Organization/WebSite markup, district breadcrumbs, FAQ content, AdministrativeArea entities, and relevant GovernmentOrganization nodes.

Corrections:

- Keep one stable Organization `@id` and reference it from WebSite, WebPage, and NewsArticle.
- Ensure `logo.png` exists and is a crawlable, representative logo; the live UI uses `apple-touch-icon.png`.
- Add contact email/telephone only if they are public and monitored; add `legalName` and registry identifiers if applicable.
- Give every author an `author.url` or use the publisher Organization URL. Google recommends a unique author URL in Article markup ([Article structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/article)).
- Match `dateModified` to real editorial or data changes. A current-day modification date across most programmatic pages looks artificial.
- Do not expect FAQ rich results. Google normally shows FAQ rich results only for well-known authoritative government and health sites ([FAQ update](https://developers.google.com/search/blog/2023/08/howto-faq-changes)). Retain FAQ markup only where the visible FAQ is genuinely page-specific.
- Validate a sample from every template in Rich Results Test and Schema.org Validator.

### URL and internal-link consistency

- Sitemap URLs often end in `/`; internal links often omit it. Next/Vercel serves both without redirects. Canonicals consolidate them, but this creates duplicate crawl paths.
- Standardize generated links and sitemap URLs to one trailing-slash policy.
- Remove `href="#"` from article action bullets; use buttons or real destinations.
- Add breadcrumbs to major hubs, articles, areas, offices, policy pages, and awareness guides.
- Create contextual links from live reports to the relevant district/category guide and official complaint resource.

## 4. On-page SEO and content quality

### Content depth

The server crawl found:

- Median page length: approximately **366 words**.
- **19 pages below 250 words**.
- Three TN Today article URLs exposed only about 96 words in initial HTML before hydration.
- Six category index pages exposed roughly 135–157 words and no server H1.
- Other thin pages included districts, areas, awareness guides, community, offices, trending, contact, and terms.

The rendered TN Today article is substantially longer and includes a visible date, editorial-team byline, key highlights, timeline, official sources, and related content. That is good editorial structure. The technical delivery and canonical errors, not the visible article itself, are the problem.

### Programmatic-quality risk

District/category pages contain repeated modules such as:

- Active reporting zones
- Activity summary
- Incident classification
- Related searches
- How to report
- Complaint channels
- Status
- FAQ

This is useful when populated with verified local facts and current incident data. It becomes search-engine-first when only the city/category names change. Google’s people-first guidance asks whether content offers original information, substantial value, first-hand expertise, and a satisfying answer; mass automation without added value can violate scaled-content rules ([people-first guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [generative-AI guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content?hl=en), [spam policies](https://developers.google.com/search/docs/essentials/spam-policies)).

### Page-level disposition

| Page family | Action |
|---|---|
| District hubs with live reports and unique local intro | Keep; improve metadata and add local proof. |
| District/category pages with current reports, verified contacts, and unique zones | Keep; quality-review facts and timestamps. |
| Zero-report city/category pages with templated copy | Noindex until they have unique evidence, or consolidate into the district hub. |
| `/category/*` index pages | Expand with editorial guide, trend data, and internal navigation; server-render H1/content. |
| TN Today articles | Keep; fix canonical/share host, SSR, author pages, corrections, and image attribution. |
| `/post/*` UGC | Decide intentionally: index only moderated, substantial, unique reports; keep thin/personal/expired items noindex. |
| Generic hubs with default metadata | Rewrite before sitemap/index inclusion. |
| Awareness guides | Expand into expert-reviewed evergreen resources with last-reviewed dates. |
| Search/create/account pages | Keep noindex. |

### Keyword use

Remove the meta keywords tag; Google does not use it. Avoid awkward phrases such as “How to Water Issue Complaint Channels in [city]” and repeated “People also search for” blocks. Write naturally for the task:

- What is happening?
- Where exactly?
- When was it last verified?
- Who is responsible?
- What is the official complaint route?
- What evidence supports the claim?
- What should the resident do next?

## 5. Core Web Vitals and performance

### Lighthouse results

| Metric | Mobile | Desktop | Good target |
|---|---:|---:|---:|
| Performance score | 54 | 12 | 90+ lab aspiration |
| FCP | 2.2 s | 1.2 s | ≤1.8 s |
| LCP | 5.9 s | 9.1 s | ≤2.5 s |
| TBT (lab proxy, not INP) | 410 ms | 1,420 ms | ≤200 ms |
| CLS | 0.208 | 0.742 | ≤0.1 |
| Speed Index | 4.2 s | 3.1 s | ≤3.4 s |
| TTI | 6.0 s | 9.1 s | Lower is better |
| Document response | ~70 ms reported | ~70 ms reported | Strong |

Google’s field thresholds are LCP ≤2.5 s, INP <200 ms, and CLS <0.1 at the 75th percentile ([Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals)). INP cannot be concluded from Lighthouse without real interaction data; use CrUX/Search Console/RUM.

### Root causes

- The LCP element was an **OpenStreetMap Leaflet tile**.
- LCP load delay represented roughly 65% of mobile LCP time.
- The map request is not discoverable in the initial HTML and receives no high-priority hint.
- Desktop main-thread work was about 5.7 seconds: ~2.1 seconds script evaluation and ~1.5 seconds style/layout.
- Desktop DOM size reached 861 elements.
- Lighthouse estimated about **100 KiB unused JavaScript** and **25 KiB unused CSS**.
- The 180×180 PNG icon is served as a 32×32 header image, wasting roughly 35–38 KiB.
- OpenStreetMap transferred about 202 KiB of third-party tiles during the run.
- Multiple Supabase requests fire on homepage load.
- The cookie dialog and late map/content hydration contribute to large shifts.
- A footer image was identified as a layout-shift trigger despite width/height attributes, suggesting parent/layout timing also changes.

### Priority fixes

1. **Do not make the live map the LCP.** Render a lightweight static map preview or a fixed-height skeleton first; load Leaflet after interaction, idle time, or near-viewport.
2. Reserve the exact map, TN Today card, cookie banner, and feed dimensions before client data arrives.
3. Server-render the first meaningful local status and use cached data; hydrate progressively.
4. Combine/deduplicate homepage Supabase reads behind one cached endpoint or server component.
5. Code-split Leaflet, upload/media tools, and dashboard modules away from the homepage.
6. Purge unused Tailwind/CSS and remove unused client components.
7. Create a 32×32/64×64 optimized WebP/AVIF or properly sized PNG for header use.
8. Self-host Leaflet CSS or include it in the build rather than loading from unpkg.
9. Fix the invalid Clarity initialization regex that currently logs `Invalid regular expression ... Unmatched ')'`.
10. Add real-user monitoring for LCP, INP, and CLS by template and device.

## 6. Mobile and accessibility

### Mobile

Strengths:

- Responsive viewport exists.
- Primary buttons are large and readable.
- Bottom mobile navigation is familiar.
- Homepage content reflows without obvious horizontal overflow in the captured viewport.
- Location and search are appropriately prominent.

Issues:

- Two viewport meta tags are emitted.
- The cookie dialog covers the map and much of the first screen, delaying exploration.
- The banner, header, hero, location controls, map, and cookie dialog compete above the fold.
- Mobile performance is below acceptable CWV targets.

Recommendation: keep “Accept All” and “Reject Non-Essential” at equal visual weight, reduce dialog height, add a persistent privacy-preferences link, and avoid loading personalized-ad/analytics code before consent where required.

### Accessibility

Lighthouse scored 98, which is strong. Remaining failures:

- Heading order is not sequential.
- Some image alt text repeats adjacent text.
- Visible text and accessible name mismatch on at least one control.
- Icon-only search, bookmark, theme, and language controls should have stable, localized labels.
- Map interactions require a non-map alternative with equivalent information.
- Verify focus states, keyboard order, modal focus trap, error announcements, and Tamil-language labels manually.

## 7. UI/UX audit

### Header and navigation

The header is visually credible, but “Map,” “Live Feed,” “TN Today,” “Directory,” search, language, theme, bookmarks, log issue, and sign-in create high cognitive load. On some pages the footer’s Organizations links differ, suggesting component inconsistency.

Recommended primary navigation:

- Near Me
- Report an Issue
- Alerts
- Guides & Helplines
- Community
- More (Jobs, Stays, Offices, News, RWA/CSR)

### Homepage

Keep the hero, but make the evidence layer clearer:

- “30 active updates nearby” should link to a filtered result.
- Show “Last refreshed,” source type, and verification status.
- Explain “Verified by citizens” in a tooltip/link to the methodology.
- Place one primary CTA (“See updates near me”) and one secondary CTA (“Report an issue”).
- Defer secondary modules below one short proof section.

### Cards and status language

Internal labels such as `LOW`, `SUPPRESS`, `STABILIZE`, “HOLD,” “stability lock,” and “consensus 37%” look like administrative/debug vocabulary. Users will not know whether these describe urgency, confidence, moderation, or ranking. Replace them with plain-language states:

- Verification: Unverified / Community-confirmed / Officially acknowledged
- Status: Reported / In progress / Resolved / Disputed
- Confidence: X confirmations, Y disputes
- Updated: exact timestamp

### Forms

The report form supports complaint, bribe log, appreciation, local update, alert, and discussion; district/category selectors; media uploads; anonymity; and optional name. It is powerful but asks unauthenticated users to sign in while still showing the entire form.

Improvements:

- Explain sign-in before the user fills fields, or permit a deliberate guest workflow.
- Show privacy and public-visibility guidance next to media and anonymity.
- Warn users not to upload phone numbers, IDs, medical documents, faces, vehicle plates, or exact home addresses unless necessary and lawful.
- Add visible rate limiting, bot protection, upload scanning, file-type verification, EXIF stripping, and moderation status.
- Provide a save-draft flow and clear success state with a shareable receipt.

The contact form is clear and includes topic routing and a 24–48 hour response expectation. Add spam protection, a support email, data-use notice, and submission confirmation/reference ID.

## 8. Local SEO

VizhiTN is an online statewide platform, not obviously a storefront or service-area business. Google states that online-only brands and organizations are not eligible for a Business Profile unless they make in-person contact with customers during stated hours ([Business Profile eligibility](https://support.google.com/business/answer/13763036?hl=en)). Do **not** create fake district listings or virtual-office profiles.

Instead:

- Use Organization, WebSite, AdministrativeArea, Place, GovernmentOrganization, and relevant Article schema.
- Publish a real ownership/contact identity and registered address on the site if legally appropriate; this is trust information, not a reason to create a GBP.
- Build district-level citations through RWAs, civic NGOs, colleges, local media, government-resource pages, and partner organizations.
- Create verified district editors/contributors and list their coverage areas.
- Add Tamil versions with proper `hreflang="ta-IN"` and English `en-IN`; ensure translations are editorially reviewed.
- Earn local links to specific city resources, not only the homepage.
- Maintain a source directory for official departments and helplines with reviewed-on dates.

## 9. E-E-A-T and trust

### Positive signals

- About page clearly says VizhiTN is independent and non-governmental.
- Privacy and terms pages are substantial and dated.
- Contact form, support/advertising emails, and social links exist.
- TN Today shows publication date, editorial-team byline, official sources, highlights, and timeline.
- District pages name responsible authorities and helplines.

### Trust gaps

- No named founders, editors, legal entity, registered office, or leadership biographies were found.
- No author index or author profile pages.
- No editorial policy, corrections policy, sourcing policy, fact-checking policy, community verification methodology, moderation policy, or funding/advertising disclosure.
- “Community Verified” is a strong claim without visible criteria.
- News articles share/canonicalize to another brand/domain (`nammatn.in`).
- Search did not surface meaningful independent brand mentions beyond VizhiTN’s own pages and a domain-registration list.
- Some content appears seeded or programmatic, but this is not clearly disclosed.
- Dynamic claims (“updated hourly,” report counts, authority priority) need timestamps, source lineage, and confidence labels.

### E-E-A-T fixes

Create:

1. `/editorial-policy`
2. `/verification-methodology`
3. `/corrections`
4. `/community-guidelines`
5. `/moderation-policy`
6. `/authors` and individual author/editor pages
7. `/ownership-and-funding`
8. `/sources` or a source methodology within every guide
9. A visible “Last reviewed by / date” block on helpline and government-resource pages
10. A transparent distinction between citizen reports, official notices, editorial summaries, and automated summaries

## 10. AdSense readiness

### Existing positives

- About, Contact, Privacy Policy, Terms, and navigation exist.
- Privacy policy discusses cookies, analytics, Google AdSense, storage, retention, and rights.
- Cookie dialog has accept and reject options.
- The site does not currently appear overloaded with ads.
- Public content and utilities are substantial in aggregate.

### Likely rejection or policy-risk reasons

No one can state the reviewer’s exact reason before a review, but these are the probable blockers:

1. **Placeholder monetization configuration:** `/ads.txt` contains `google.com, ca-pub-PLACEHOLDER...`. Replace it only after a real publisher ID is assigned; do not apply with placeholder inventory.
2. **Low-value or under-construction screens:** client-heavy hubs can initially render blank/generic HTML; several category pages are thin; generic hubs have default metadata. Google does not allow ads on screens without publisher content or with low-value content ([Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en-15)).
3. **Cookie-cutter/programmatic footprint:** numerous district/category pages use near-identical structures and long template descriptions. Google’s AdSense guidance warns against doorway/cookie-cutter pages with little original value ([AdSense beginner guidance](https://support.google.com/adsense/answer/23921?hl=en)).
4. **Canonical ownership confusion:** articles tell Google that `nammatn.in` is canonical and use that domain in share links.
5. **UGC moderation exposure:** civic reports, bribes, scams, emergencies, photos, comments, and anonymous submissions can contain allegations, personal data, copyrighted images, violence, harassment, or misinformation. Publishers are responsible for UGC on ad-bearing pages.
6. **Publisher identity weakness:** no named authors or ownership/funding/editorial policy.
7. **Navigation to unfinished/generic modules:** leaderboard, listings, support, RWA, and CSR need complete standalone value.
8. **Consent implementation error:** the Clarity initialization regex throws a syntax error. If serving personalized ads in regulated regions, use a Google-certified CMP where required.

### Ad placement plan after approval

- Never place ads on create, login, search, account, private communication, emergency request, or upload screens.
- Avoid ads next to “Report Issue,” official helplines, map controls, file buttons, and navigation.
- Keep at least one full block of publisher content before the first ad.
- Limit to one in-content unit per meaningful content section initially.
- Disable ads on thin/zero-report pages and sensitive UGC until reviewed.
- Separate sponsored content with explicit labels.
- Monitor Policy Center and exclude unsafe pages automatically.

Google recommends unique relevant content, clear navigation, and a good user experience ([site-readiness guidance](https://support.google.com/adsense/answer/7299563?hl=en)); it also warns against more ads than content ([compliance guidance](https://support.google.com/adsense/answer/1261929?hl=en)).

## 11. Security and privacy

### Strong controls observed

- HTTPS with HSTS: `max-age=63072000; includeSubDomains; preload`
- CSP present
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- CSP `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`

### Risks and fixes

- CSP includes `'unsafe-inline'` and `'unsafe-eval'`; remove them through nonces/hashes and production builds where feasible.
- Fix the invalid inline Clarity regex.
- Public forms show no visible CAPTCHA/Turnstile or rate-limit feedback. Add server-side rate limiting and risk-based bot defense.
- Scan uploads for malware; validate MIME and extension; cap dimensions/duration; strip EXIF/GPS by default; generate safe derived images; store outside executable/public paths.
- Add moderation queues, allegation review, abuse reporting, takedown workflow, audit logs, and escalation for emergencies.
- Never imply emergency monitoring unless staffed; prominently direct immediate danger to official emergency services.
- Add a separate Cookie Policy or expand the privacy page with a cookie table, retention durations, vendors, and preference-revocation mechanism.
- Publish a vulnerability/contact process such as `/.well-known/security.txt`.

This is a black-box review, not penetration testing. Authentication, database row-level security, API authorization, dependency vulnerabilities, secrets, backups, and incident response require code/config access.

## 12. Conversion optimization

### Primary conversion model

Define one measurable funnel:

`Landing page → select location → view relevant updates → confirm/follow/report → create account → return for status`

### Improvements

- Use a single primary CTA: **See updates near me**.
- Secondary CTA: **Report a civic issue**.
- Add proof near the hero: active verified reports, resolutions in 30 days, covered areas, average verification time.
- Replace abstract counts with outcome proof: “12 reports resolved this week,” linked to evidence.
- Add case studies with before/after evidence, authority acknowledgement, dates, and resident quotes.
- Add “What happens after I report?” beside the CTA.
- Offer WhatsApp sharing after report creation, but do not collect phone numbers unnecessarily.
- Add email/push alerts by district/category with clear frequency controls.
- Create landing pages for RWAs, NGOs, local media, and CSR separately.
- If monetizing sponsorships, publish transparent packages and a sponsorship policy; do not let sponsors influence civic status.

### Suggested CTA copy

- See updates near me
- Check my area
- Report with evidence
- Follow this issue
- Confirm this happened
- See official complaint options
- Get district alerts
- View resolved cases

## 13. Competitor analysis

The competitive set includes direct civic-reporting startups, official grievance apps, community networks, and government engagement platforms. “Top 10” here means the most strategically relevant public alternatives found, not a paid-tool traffic ranking.

| Competitor | Strength | VizhiTN opportunity |
|---|---|---|
| [Namma Chennai](https://cscl.co.in/namma-chennai-app) | Official GCC workflow, complaint routing, official status. | Cover all Tamil Nadu; link to official systems; add public evidence and cross-city context. |
| [Swachhata MoHUA](https://www.ux4g.gov.in/aboutus/case-studies/ux4g-swachhata.php) | Official sanitation grievance routing at national scale. | Broader issue categories and local community validation. |
| [I Change My City / Janaagraha](https://www.ichangemycity.com/terms) | Established civic brand, complaint/community model, institutional credibility. | Tamil-first depth, current district pages, faster local publishing. |
| [LocalCircles](https://www.localcircles.com/a/index) | Large community network, polls, consultations, media visibility. | More actionable issue evidence, maps, resolution receipts, and locality specificity. |
| [MyNeta](https://myneta.com/how-it-works) | Elected-representative accountability and public performance scores. | Connect issues to responsible department/representative using transparent methodology. |
| [CivicIssue](https://civicissue.com/) | Clear report-upvote-authority-action journey and visual education. | Stronger Tamil Nadu local authority mapping and official escalation. |
| [TRIONCAM](https://www.trioncam.in/) | App-like reporting, smart routing, SLA narrative, resolution proof. | Web/PWA accessibility, no APK friction, editorial local resources. |
| [CitizenLens](https://apps.apple.com/us/app/citizenlens/id6766147616) | Multilingual, complaint drafting, escalation reminders, public portal directory. | Tamil Nadu-only authority depth and verified current incident layer. |
| [CivicFlow](https://www.civicflow.org/) | Audit trail and community-leader verification. | Formalize RWA verification and make the evidence trail visible. |
| [MyGov](https://www.mygov.in/) | Government authority, national reach, campaigns and participation. | Hyperlocal operational information and resident-to-resident discovery. |

### How to outperform

1. Be the best source for **Tamil Nadu-specific “what is happening now + what do I do next?”** queries.
2. Maintain a verified authority/helpline knowledge graph with review dates.
3. Publish outcome evidence and resolution receipts, not just report counts.
4. Make Tamil content first-class, not a UI toggle over English-only content.
5. Partner with RWAs, colleges, local media, and civic NGOs for verified contributors.
6. Build a transparent verification score based on evidence and independent confirmations.
7. Provide official escalation links while clearly stating that VizhiTN is independent.
8. Create data stories and downloadable district insights journalists can cite.

## 14. Keyword strategy

Without Search Console or a paid keyword database, “volume” and “competition” are directional. Validate impressions, click-through rate, and actual queries in Search Console before final prioritization.

### Priority clusters

| Cluster | Example primary keyword | Intent | Best page |
|---|---|---|---|
| Live local status | Chennai power cut today | Current/informational | City/category live page |
| Complaint action | how to complain about water supply Chennai | Task/informational | Reviewed guide + official links |
| Official contact | TANGEDCO complaint number Chennai | Navigational/task | Authority guide |
| Civic reporting | report pothole Chennai online | Transactional | Reporting landing page |
| Scam safety | TNEB disconnection SMS scam | Urgent informational | Scam alert/editorial guide |
| Government offices | RTO office complaint Tamil Nadu | Task/local | Office detail page |
| Area intelligence | Velachery civic issues | Local/current | Area page |
| Emergency help | blood donor request Coimbatore | Urgent/community | Moderated help page |
| Citizen rights | RTI application Tamil Nadu online | Informational/task | Expert-reviewed guide |
| Jobs/stays | part time jobs in Coimbatore verified | Commercial/local | Moderated listings page |

### Primary keywords

- Tamil Nadu civic issues
- civic complaints Tamil Nadu
- report civic issue Tamil Nadu
- Tamil Nadu local alerts
- Chennai civic complaints
- power cut today Tamil Nadu
- water supply complaint Tamil Nadu
- road complaint Tamil Nadu
- scam alerts Tamil Nadu
- Tamil Nadu government helplines

### Secondary and semantic terms

- citizen grievance, public grievance portal, municipal complaint, ward complaint
- TANGEDCO/1912, TWAD Board, municipal corporation, GCC/1913
- pothole, streetlight, drainage, garbage, sewage, waterlogging, transformer
- community verification, civic receipt, status tracking, escalation, authority acknowledgement
- district, locality, ward, neighbourhood, Tamil, helpline, official portal

### Long-tail and question keywords

- Is there a power cut in Chennai today?
- Where can I report a pothole in Chennai?
- What is the TANGEDCO power complaint number?
- How do I complain about no water supply in Coimbatore?
- How to report an online scam in Tamil Nadu?
- Which office handles streetlight complaints in Madurai?
- How to escalate an unresolved corporation complaint?
- Is this TNEB bill disconnection SMS fake?
- How do I file an RTI online in Tamil Nadu?
- How can an RWA track neighbourhood complaints?

### Transactional/commercial keywords

- report civic issue near me
- submit civic complaint online
- verified jobs in [city]
- PG rooms in [city]
- advertise on Tamil Nadu local platform
- RWA civic issue dashboard
- CSR civic projects Tamil Nadu

### Low-competition opportunity model

Prioritize combinations with real data and few strong results:

- `[locality] + [issue] + today`
- `[district] + [authority] + complaint number`
- `[city] + [issue] + official complaint link`
- `[locality] + civic issues`
- `[specific scam message] + Tamil`
- `[office type] + complaint + [district]`

Do not publish a page merely because a combination exists. Require a unique data point, verified contact, local explanation, or active report.

## 15. Backlink and digital PR plan (six months)

Public search showed almost no independent brand coverage. Treat authority building as a primary workstream.

### Month 1: Linkable foundation

- Publish verification, editorial, correction, moderation, ownership, and source policies.
- Produce one “Tamil Nadu Civic Helpline Directory” with a reviewed date and downloadable CSV.
- Create a media kit, logo assets, founder/editor bios, and data methodology.
- Set up branded profiles consistently and verify social URLs.

### Month 2: Local partnerships

- Onboard 10 RWAs/college civic clubs in Chennai, Coimbatore, Madurai, Trichy, and Salem.
- Give each partner a transparent profile and co-publish one local data summary.
- Seek links from partner websites, newsletters, and event pages.

### Month 3: Data PR

- Publish a quarterly “Tamil Nadu Civic Pulse” report: issue categories, response patterns, locality trends, and methodology.
- Pitch local newspapers, city reporters, Tamil digital outlets, and civic newsletters.
- Provide embeddable charts with canonical attribution.

### Month 4: Resource links

- Identify colleges, NGOs, legal-aid organizations, resident associations, and government-awareness pages that maintain citizen-resource lists.
- Request inclusion only where VizhiTN adds a verified resource.
- Replace outdated/broken helpline resources with your reviewed directory.

### Month 5: Expert contributions

- Commission guest explainers from RTI practitioners, urban planners, cyber-safety experts, disability advocates, and RWA leaders.
- Contribute non-promotional articles to reputable Tamil Nadu civic and technology publications.
- Use Connectively/Qwoted/Featured or direct journalist outreach instead of relying on the discontinued HARO brand.

### Month 6: Outcome stories

- Publish 10 independently documented resolution case studies.
- Invite the involved RWA/NGO/resident to verify the timeline.
- Pitch “before/after” stories and a six-month transparency report.

Quality rules: no paid link schemes, spam directories, forum drops, private blog networks, automated guest posts, or keyword-rich exact-match anchors. Aim for branded URLs, report citations, and deep links to useful resources.

## 16. Google Search Console plan

### Immediately

- Inspect the three TN Today URLs and their declared canonicals.
- Check Page Indexing for “Duplicate, Google chose different canonical,” “Crawled—currently not indexed,” soft 404, and discovered-not-indexed patterns.
- Submit the corrected sitemap after canonical and inventory cleanup.
- Review Enhancements for Article, Breadcrumb, FAQ, and organization issues.
- Check Manual Actions and Security Issues.

### Weekly

- Export page/query data by template: district, city/category, area, office, article, guide.
- Track impressions but zero clicks, title rewrites, CTR, and average position.
- Inspect zero-report programmatic pages before deciding index/noindex.
- Review crawl stats and response-code distribution.

### Monthly

- Compare indexed count with the intentional indexable inventory.
- Use CWV groups to identify the worst shared templates.
- Track Tamil versus English queries separately.
- Annotate releases and content changes.
- Review links and top linking sites for genuine authority growth.

## 17. AI search / answer-engine optimization

AI visibility follows the same trust and source quality fundamentals as search; there is no reliable shortcut for ChatGPT, Gemini, Perplexity, Claude, or Copilot.

### Make pages extractable and citeable

- Start each guide with a 2–4 sentence direct answer.
- Add a compact fact box: issue, location, status, last verified, responsible authority, official link.
- Use descriptive H2s that mirror user questions.
- Cite primary sources beside claims, not only at the bottom.
- Provide visible publication and review dates.
- Identify the author/reviewer and their qualifications.
- Distinguish firsthand resident evidence from editorial verification and official confirmation.
- Offer clean HTML tables and bullet steps; avoid hiding core facts behind client-only interactions.
- Keep entity names consistent: VizhiTN, TANGEDCO/TNPDCL, TWAD Board, Greater Chennai Corporation, district/locality.
- Publish datasets or transparent summaries that other sites can cite.

### Knowledge Graph improvements

- Use one Organization entity with stable `@id`.
- Add `sameAs` only for verified profiles.
- Add author ProfilePage entities.
- Connect district pages to AdministrativeArea; issue pages to responsible GovernmentOrganization.
- Add `about`, `mentions`, `mainEntity`, and `isPartOf` where they reflect visible content.
- Do not mark the platform itself as a government body.

## 18. 90-day SEO content calendar

Publishing cadence: three substantial items per week. Each item must include a named reviewer, primary sources, last-reviewed date, and internal links. “Data report” items should use real VizhiTN data and explain methodology.

| Week | Publish | Title / asset | Target keyword | Intent | Internal links |
|---:|---|---|---|---|---|
| 1 | Jul 22 | How to Report a Civic Issue in Tamil Nadu: Official Channels by Issue | report civic issue Tamil Nadu | Task | Create, awareness, districts |
| 1 | Jul 24 | TANGEDCO Power Complaint Guide: 1912, Online Portal and Escalation | TANGEDCO complaint number | Task | Power category, district power pages |
| 1 | Jul 27 | VizhiTN Verification Methodology | community verified civic reports | Trust | About, create, every report |
| 2 | Jul 29 | Chennai Pothole Complaints: GCC App, 1913 and Follow-up Steps | report pothole Chennai | Task/local | Chennai, road pages, office |
| 2 | Jul 31 | How to Spot a Fake TNEB Disconnection SMS | TNEB SMS scam | Urgent info | Scams, cybercrime guide |
| 2 | Aug 3 | July Tamil Nadu Civic Pulse | Tamil Nadu civic issues | Data/info | Districts, categories, methodology |
| 3 | Aug 5 | Coimbatore Water Complaint Guide | Coimbatore water complaint | Task/local | Coimbatore water, awareness |
| 3 | Aug 7 | What Evidence Makes a Civic Complaint Actionable? | civic complaint evidence | Task | Create, methodology |
| 3 | Aug 10 | How to Escalate an Unresolved Municipal Complaint | escalate civic complaint | Task | Offices, help, districts |
| 4 | Aug 12 | Tamil Nadu Cybercrime Reporting: 1930 and Official Portal | report cybercrime Tamil Nadu | Task | Scams, emergency resources |
| 4 | Aug 14 | Madurai Road and Drainage Complaint Guide | Madurai civic complaint | Local/task | Madurai, road, water |
| 4 | Aug 17 | RWA Playbook for Tracking Neighbourhood Issues | RWA civic issue tracking | Commercial/info | RWA, create, dashboard |
| 5 | Aug 19 | Chennai Power Cut: What to Check Before You Report | Chennai power cut today | Current/task | Chennai power, TANGEDCO guide |
| 5 | Aug 21 | Citizen Privacy When Posting Photos of Public Issues | civic report privacy | Safety | Privacy, create, moderation |
| 5 | Aug 24 | How VizhiTN Distinguishes Reports, Alerts and Official Notices | civic alert verification | Trust | Methodology, explore |
| 6 | Aug 26 | Trichy Water Complaint and Escalation Guide | Trichy water complaint | Task/local | Trichy water, TWAD guide |
| 6 | Aug 28 | Government Office Complaint Directory: Who Handles What? | Tamil Nadu complaint department | Info/task | Offices, awareness |
| 6 | Aug 31 | August Tamil Nadu Civic Pulse | Tamil Nadu local alerts | Data/info | Districts, categories |
| 7 | Sep 2 | How to File an RTI Application Online in Tamil Nadu | RTI online Tamil Nadu | Task | Awareness guides, offices |
| 7 | Sep 4 | Rental Scam Checklist for Students in Tamil Nadu | PG rental scam Tamil Nadu | Safety | Stay, scams |
| 7 | Sep 7 | Salem Civic Complaint Guide | Salem civic complaint | Local/task | Salem, categories |
| 8 | Sep 9 | Water Contamination: Who to Call and What Evidence to Keep | dirty tap water complaint | Urgent/task | Water category, districts |
| 8 | Sep 11 | How to Verify a Viral Local Alert Before Sharing | verify local alert | Info | Alerts, methodology |
| 8 | Sep 14 | A Resident’s Guide to Corporation, Municipality and Panchayat Roles | municipality vs panchayat Tamil Nadu | Info | Offices, districts |
| 9 | Sep 16 | Coimbatore Power Cut Guide | Coimbatore power cut complaint | Local/task | Coimbatore power, TANGEDCO |
| 9 | Sep 18 | How Community Confirmation Should Work | community verification | Trust/info | Methodology, create |
| 9 | Sep 21 | Accessible Civic Reporting for Disabled Residents | accessible civic complaint | Info/task | Create, contact, accessibility |
| 10 | Sep 23 | Tamil Nadu Emergency Helplines: Verified Directory | Tamil Nadu emergency numbers | Navigational | Help, awareness |
| 10 | Sep 25 | How to Report Bribe Demands Safely and Lawfully | report bribe Tamil Nadu | Sensitive/task | Bribes, privacy, official portals |
| 10 | Sep 28 | September Tamil Nadu Civic Pulse | civic issues Tamil Nadu report | Data/PR | Districts, media kit |
| 11 | Sep 30 | Vellore Water Complaint Guide | Vellore water complaint | Local/task | Vellore water, offices |
| 11 | Oct 2 | Before-and-After Civic Resolution Case Study #1 | civic issue resolved Tamil Nadu | Proof | Community wins, report page |
| 11 | Oct 5 | How Journalists Can Use VizhiTN Data Responsibly | Tamil Nadu civic data | PR/info | Methodology, data reports |
| 12 | Oct 7 | Chennai Ward-Level Complaint Checklist | Chennai ward complaint | Local/task | Chennai, areas, office |
| 12 | Oct 9 | Fake Job Offers on Telegram and WhatsApp: Red Flags | job scam Tamil Nadu | Safety | Jobs, scams |
| 12 | Oct 12 | How RWAs Can Coordinate Without Exposing Resident Data | RWA data privacy | Commercial/safety | RWA, privacy |
| 13 | Oct 14 | Tamil Nadu Monsoon Civic Preparedness Checklist | Tamil Nadu monsoon complaints | Seasonal | Emergency, roads, water |
| 13 | Oct 16 | Before-and-After Civic Resolution Case Study #2 | community civic success | Proof | Community wins, districts |
| 13 | Oct 19 | 90-Day Transparency Report: What Changed on VizhiTN | VizhiTN transparency report | Branded/trust | About, policies, data |

## 19. Sixty additional blog and resource ideas

### Power and utilities

1. Why voltage fluctuation happens and how to document it safely
2. Transformer blast: immediate safety steps and complaint channels
3. Planned versus unplanned power outage: how to verify the difference
4. How to find your TANGEDCO section office
5. Power complaint escalation template for residents
6. Apartment power issues: common-area versus utility responsibility
7. How to read a TANGEDCO outage notice
8. Power safety checklist for monsoon season

### Water and sanitation

9. Low water pressure complaint checklist
10. Sewage mixed with drinking water: urgent steps
11. Water tanker complaint and verification guide
12. How to document a pipeline leak without exposing private property
13. Municipal water versus TWAD Board: who handles what?
14. Stagnant water and mosquito risk reporting guide
15. Drain blockage complaint evidence checklist
16. Water quality testing resources in Tamil Nadu

### Roads and transport

17. Pothole reporting photo checklist
18. Streetlight outage complaint guide
19. Open manhole: urgent escalation steps
20. Road excavation left unfinished: who is responsible?
21. Illegal parking versus encroachment complaint routes
22. Bus route change verification checklist
23. Broken traffic signal reporting guide
24. Footpath obstruction and accessibility complaints

### Scam and safety

25. Fake police/courier parcel scam explained
26. Digital arrest scam: what to do immediately
27. UPI collect-request scam checklist
28. Aadhaar biometric-locking scam calls
29. Fake government job appointment letters
30. OLX and rental-advance scam prevention
31. Electricity bill phishing links: visual examples
32. How to preserve scam evidence for police
33. When to call 1930 versus file at cybercrime.gov.in
34. How to report a scam without publishing a victim’s data

### Government services and rights

35. Taluk office services explained
36. Registrar office complaint guide
37. Ration shop complaint and escalation steps
38. Passport police verification complaint guide
39. Government hospital grievance channels
40. Municipality versus corporation versus town panchayat
41. Tamil Nadu grievance portal walkthrough
42. Consumer complaint versus civic complaint
43. How to request a public-service status update
44. RTI questions that get clearer answers

### Community and local leadership

45. Starting a neighbourhood issue register
46. RWA verification checklist for civic reports
47. How to run a monthly civic walk audit
48. Community meeting agenda for unresolved issues
49. How to celebrate a verified civic resolution
50. Responsible use of resident photos and quotes
51. How colleges can run civic-data projects
52. Working with local journalists on public-interest issues
53. CSR project due-diligence checklist for neighbourhood work
54. How to prevent duplicate reports while preserving evidence

### Platform trust and transparency

55. What “community verified” means on VizhiTN
56. How disputes and corrections are handled
57. How report status changes are logged
58. How automated summaries are reviewed
59. How VizhiTN protects anonymous contributors
60. Quarterly transparency report methodology

## 20. Prioritized 90-day roadmap

### Today (highest ROI)

- Correct all three TN Today canonical, OG, share, and schema URLs to `https://www.vizhitn.in/...`.
- Return real 404/410 status codes for nonexistent dynamic routes.
- Remove the `ca-pub-PLACEHOLDER` line from `ads.txt` until a real publisher ID exists.
- Fix the invalid Clarity regex and verify consent behavior.
- Stop emitting `| VizhiTN | VizhiTN`.
- Choose one trailing-slash convention.

### This week

- Rebuild the sitemap from the intentional canonical indexable inventory.
- Add 134 missing indexable pages or noindex/consolidate them intentionally.
- Server-render H1 and core content for articles, category pages, and major hubs.
- Give leaderboard, listings, support, RWA, and CSR unique metadata and useful content—or noindex them.
- Rewrite district descriptions to 140–160 characters.
- Change unknown city/district handling to Next.js `notFound()`.
- Add a visible privacy-preferences link and fix duplicate viewport tags.

### Days 8–30

- Replace/defer the live homepage map and reserve layout space.
- Consolidate homepage data requests and code-split heavy modules.
- Publish editorial, verification, corrections, moderation, ownership/funding, and author pages.
- Audit all official helplines/URLs and add “last reviewed” dates.
- Decide an indexation rule for UGC posts.
- Remove or noindex zero-value programmatic pages.
- Validate schema by template and remove non-unique FAQ markup.
- Create the emergency/helpline cornerstone resource and first data report.

### Days 31–60

- Launch the content calendar and district contributor program.
- Add Tamil editorial pages with correct hreflang.
- Publish 3–5 resolution case studies.
- Add report verification history and plain-language statuses.
- Begin RWA/college/NGO outreach and local resource-link acquisition.
- Implement real-user CWV measurement.
- Improve email/push alert onboarding and consent.

### Days 61–90

- Publish the Tamil Nadu Civic Pulse report and pitch local media.
- Earn at least 15 relevant independent citations/links.
- Complete top-10 district guide coverage with human review.
- Re-run full crawl, Lighthouse, Rich Results Test, and accessibility checks.
- Review Search Console indexation and query performance by template.
- Apply to AdSense only after placeholder/low-value/UGC/publisher-identity issues are resolved.

### Next six months

- Expand unique district coverage based on actual report volume, not keyword permutations.
- Build a verified contributor/editor network.
- Publish quarterly transparency and civic-data reports.
- Create APIs/downloads only after privacy and data-quality review.
- Develop authority-routing partnerships without implying government affiliation.
- Test monetization with strict page-level exclusions and policy monitoring.

## 21. Checklists

### Technical SEO

- [ ] Fix cross-domain and alternate-slug canonicals
- [ ] Align canonical, sitemap, internal link, OG URL, and share URL
- [ ] Return real 404/410 for nonexistent routes
- [ ] Rebuild sitemap from canonical indexable URLs
- [ ] Resolve 134 indexable pages missing from sitemap
- [ ] Standardize trailing slashes
- [ ] Server-render H1 and core content
- [ ] Remove duplicated brand suffixes
- [ ] Rewrite overlong descriptions
- [ ] Add missing hub/article breadcrumbs
- [ ] Validate schema per template
- [ ] Use genuine modification dates
- [ ] Remove meta keywords
- [ ] Monitor GSC coverage and crawl stats

### Content and ranking

- [ ] Noindex/consolidate zero-report template pages
- [ ] Require unique data or expert guidance for each local page
- [ ] Add named author/reviewer and source citations
- [ ] Publish verification/editorial/corrections policies
- [ ] Add resolution case studies
- [ ] Create Tamil-first content with human review
- [ ] Add direct answers and official action steps
- [ ] Keep live timestamps and data provenance visible
- [ ] Link reports to guides, authorities, districts, and related issues
- [ ] Track CTR and query intent in Search Console

### AdSense

- [ ] Remove placeholder `ads.txt`; add real publisher line only when issued
- [ ] Complete publisher ownership and author identity
- [ ] Finish or noindex generic/under-construction hubs
- [ ] Exclude search/create/account/private/emergency screens from ads
- [ ] Moderate UGC and sensitive allegations before monetization
- [ ] Implement upload safety and abuse reporting
- [ ] Verify cookie consent and certified CMP requirements
- [ ] Keep ads distinct from CTAs, map controls, and official links
- [ ] Maintain more publisher content than ads
- [ ] Monitor AdSense Policy Center

### UI/UX and CRO

- [ ] Simplify primary navigation
- [ ] Use one primary and one secondary hero CTA
- [ ] Explain community verification
- [ ] Replace internal status jargon
- [ ] Show exact last-updated timestamps
- [ ] Add reporting-process preview
- [ ] Add outcome proof and case studies
- [ ] Improve form privacy guidance
- [ ] Add submission receipt and follow-up status
- [ ] Reduce cookie-dialog obstruction

### Performance and accessibility

- [ ] Defer/replace live homepage map
- [ ] Reserve map/card/banner/cookie dimensions
- [ ] Consolidate Supabase calls
- [ ] Code-split Leaflet and dashboard modules
- [ ] Remove unused JS/CSS
- [ ] Optimize logo/icon sizes
- [ ] Fix heading order
- [ ] Fix redundant alt and accessible-name mismatch
- [ ] Provide non-map alternative
- [ ] Add RUM for LCP/INP/CLS

## Evidence screenshots

### Mobile homepage lab capture

![VizhiTN mobile homepage showing hero, location controls, map and cookie dialog](audit-evidence/homepage-mobile-lighthouse.jpg)

### Desktop homepage lab capture

![VizhiTN desktop homepage showing two-column hero and map with cookie dialog](audit-evidence/homepage-desktop-lighthouse.jpg)

## Evidence files

- `audit-evidence/crawl-results.json` — 195 sitemap-page metadata/content/schema crawl
- `audit-evidence/link-audit.json` — 465 internal-target link/indexability crawl
- `audit-evidence/lighthouse-mobile-full.json` — mobile Lighthouse evidence
- `audit-evidence/lighthouse-desktop.json` — desktop Lighthouse evidence
- `audit-evidence/homepage-desktop.png` — full-page browser capture

## Final recommendation

Do not add more programmatic district/category pages during the next 30 days. First make the existing inventory internally consistent, genuinely local, evidence-led, fast, and attributable. VizhiTN’s winning asset is not the number of URLs; it is the potential to become the most trusted public record of what Tamil Nadu residents are experiencing and what they can do next.
