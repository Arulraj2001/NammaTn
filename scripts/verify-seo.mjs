import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import nextConfig from '../next.config.js';
import { getTnTodayCanonical } from '../src/lib/tnTodayUrl.js';
import { getClarityInitScript } from '../src/lib/clarityScript.js';
import { getPageTitle, getSocialTitle } from '../src/lib/metadataTitle.js';
import { getDistrictMetaDescription, getCityIssueMetaDescription, toMetaDescription } from '../src/lib/metaDescription.js';
import { DISTRICTS, CATEGORIES as SEO_CATEGORIES } from '../src/lib/seo-data.js';
import { formatReportDate, getLatestReportDate } from '../src/lib/reportFreshness.js';
import { getCityIssueRobots, shouldIndexCityIssuePage } from '../src/lib/programmaticIndexing.js';
import { ORGANIZATION_ID, WEBSITE_ID, getArticleAuthor, getPublisherSchema } from '../src/lib/schemaIdentity.js';
import { TN_TODAY_CATEGORY_MAP } from '../src/lib/tnTodayCategories.js';

const root = process.cwd();
const read = relativePath => readFile(path.join(root, relativePath), 'utf8');

assert.equal(
  getTnTodayCanonical('sample-story'),
  'https://www.vizhitn.in/tn-today/sample-story',
  'TN Today canonicals must use the current www VizhiTN article route',
);
assert.equal(getPageTitle('Local Update | VizhiTN | VizhiTN'), 'Local Update', 'Repeated site-name suffixes must be removed');
assert.equal(getSocialTitle('Local Update | VizhiTN'), 'Local Update | VizhiTN', 'Social titles must contain one site-name suffix');
assert.equal(getSocialTitle('VizhiTN - Ask Local'), 'VizhiTN - Ask Local', 'Already branded legacy titles must not gain another suffix');
assert.ok(toMetaDescription('word '.repeat(100)).length <= 160, 'Database-authored descriptions must be capped at 160 characters');
for (const district of DISTRICTS) {
  assert.ok(getDistrictMetaDescription(district.name).length <= 160, `${district.name} description must fit a search snippet`);
  for (const category of SEO_CATEGORIES) {
    assert.ok(
      getCityIssueMetaDescription(district.name, category.name).length <= 160,
      `${district.name}/${category.slug} description must fit a search snippet`,
    );
  }
}
assert.equal(
  getLatestReportDate([
    { created_date: '2026-01-01T00:00:00.000Z' },
    { created_date: '2026-02-01T00:00:00.000Z' },
  ]),
  '2026-02-01T00:00:00.000Z',
  'Visible freshness must use the latest real report timestamp',
);
assert.equal(formatReportDate('2026-02-01T00:00:00.000Z'), '1 Feb 2026', 'Report dates must render deterministically');
assert.equal(
  shouldIndexCityIssuePage({ dataAvailable: true, reportCount: 0 }),
  true,
  'Editorial city/issue pages must be indexable even with zero live reports',
);
assert.equal(
  shouldIndexCityIssuePage({ dataAvailable: true, reportCount: 1 }),
  true,
  'City/issue pages with report evidence must remain indexable',
);
assert.equal(
  shouldIndexCityIssuePage({ dataAvailable: false, reportCount: 0 }),
  true,
  'Editorial city/issue pages have standalone value and remain indexable during temporary data glitches',
);
assert.deepEqual(
  getCityIssueRobots({ dataAvailable: true, reportCount: 0 }),
  {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  'Editorial city/issue pages must be indexable regardless of live report count',
);
assert.equal(ORGANIZATION_ID, 'https://www.vizhitn.in/#organization', 'Organization schema needs one stable ID');
assert.equal(WEBSITE_ID, 'https://www.vizhitn.in/#website', 'WebSite schema needs one stable ID');
assert.equal(getPublisherSchema()['@id'], ORGANIZATION_ID, 'Article publishers must reference the site Organization');
assert.equal(getArticleAuthor().url, 'https://www.vizhitn.in', 'Editorial-team authorship must resolve to the publisher');
assert.equal(getArticleAuthor('Named Contributor').url, 'https://www.vizhitn.in/about', 'Named authors must include a public URL');
assert.ok(TN_TODAY_CATEGORY_MAP.infrastructure, 'TN Today routes and navigation must share one category inventory');

process.env.NODE_ENV = 'production';
const headerRules = await nextConfig.headers();
const allHeaders = headerRules.flatMap(r => r.headers || []);
const csp = allHeaders.find(header => header.key === 'Content-Security-Policy')?.value || '';
assert.match(csp, /https:\/\/\*\.clarity\.ms/, 'CSP must allow Clarity resources');
assert.match(csp, /https:\/\/c\.bing\.com/, 'CSP must allow Clarity collection fallback');

const redirects = await nextConfig.redirects();
assert.equal(nextConfig.trailingSlash, false, 'All non-homepage routes must use the no-trailing-slash policy');
// Note: Domain apex/www canonicalization is handled at Netlify CDN edge level to prevent infinite redirect loops.

const rootLayout = await read('src/app/layout.jsx');
assert.match(rootLayout, /getClarityInitScript\(CLARITY_PROJECT_ID\)/, 'The layout must use the verified Clarity script generator');
assert.doesNotMatch(rootLayout, /alternates:\s*\{\s*canonical:\s*SITE_URL/, 'Root layout must not set a homepage canonical for every route');
assert.match(rootLayout, /export const viewport/, 'The root layout must use the Next.js viewport export');
assert.doesNotMatch(rootLayout, /<meta\s+name=["']viewport["']/, 'The root layout must not manually emit a duplicate viewport tag');
assert.match(rootLayout, /'@id': ORGANIZATION_ID/, 'The root Organization must expose its stable ID');
assert.match(rootLayout, /'@id': WEBSITE_ID/, 'The root WebSite must expose its stable ID');
assert.match(rootLayout, /publisher: \{ '@id': ORGANIZATION_ID \}/, 'The WebSite must reference the root Organization');
assert.doesNotMatch(rootLayout, /\bkeywords\s*:/, 'The unused meta keywords tag must not be emitted');
assert.doesNotMatch(rootLayout, /sameAs:/, 'Organization schema must not claim unverified social profiles');

for (const file of [
  'src/app/(user)/[city]/page.jsx',
  'src/app/(user)/[city]/[issue]/page.jsx',
  'src/lib/seo/contentEntropy.js',
]) {
  const source = await read(file);
  assert.doesNotMatch(source, /updated (?:every hour|hourly)|reports today|live tracking/i, `${file} must not promise unsupported freshness`);
}

const clarityScript = getClarityInitScript('xp7k5wqipw');
assert.doesNotThrow(
  () => new Function(clarityScript),
  'The exact Clarity inline script emitted by the layout must be valid JavaScript',
);
assert.match(clarityScript, /consent!=='accepted'/, 'Clarity must remain consent gated');
assert.match(clarityScript, /path===prefix/, 'Clarity must remain disabled on private route prefixes');

const cookieConsent = await read('src/components/common/CookieConsent.jsx');
const footer = await read('src/components/layout/Footer.jsx');
assert.match(cookieConsent, /COOKIE_PREFERENCES_EVENT/, 'Cookie preferences must be reopenable after an initial choice');
assert.match(cookieConsent, /grid grid-cols-2/, 'Mobile consent choices must remain compact and equally positioned');
assert.match(cookieConsent, /max-h-\[50dvh\]/, 'The cookie card must not cover most of a mobile viewport');
assert.match(footer, /openCookiePreferences/, 'The footer must expose persistent cookie preferences');

const robots = await read('public/robots.txt');
for (const route of ['/dashboard/', '/me/', '/bookmarks/']) {
  assert.ok(!robots.includes(`Disallow: ${route}`), `${route} must remain crawlable so noindex can be read`);
}

const adsTxt = await read('public/ads.txt');
assert.doesNotMatch(adsTxt, /PLACEHOLDER|X{8,}/i, 'ads.txt must never publish a placeholder seller ID');
const adsTxtRecords = adsTxt
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));
for (const record of adsTxtRecords) {
  assert.match(
    record,
    /^[^,\s]+,\s*pub-\d{16},\s*(?:DIRECT|RESELLER),\s*[a-f0-9]+$/i,
    `Invalid ads.txt seller record: ${record}`,
  );
}

const sitemap = await read('src/app/sitemap.js');
assert.doesNotMatch(sitemap, /\bTODAY\b/, 'Sitemap must not manufacture daily lastModified dates');
assert.match(sitemap, /updated_date/, 'Dynamic sitemap entries must use real update timestamps');
assert.match(sitemap, /\/category\/\$\{category\.slug\}/, 'Category hubs must be present in the sitemap');
assert.match(sitemap, /PUBLIC_CATEGORIES\.forEach/, 'Category hubs must use the public category taxonomy');
assert.doesNotMatch(sitemap, /SEO_CATEGORIES|Tier 1 static pairs/, 'Sitemap outages must not add unverified city/issue URLs');
assert.match(sitemap, /\/tn-today\/\$\{a\.slug\}`/, 'TN Today article URLs must match the no-trailing-slash policy');
assert.match(sitemap, /\/tn-today\/category\/\$\{category\}`/, 'Published TN Today categories must be present in the sitemap');
assert.match(sitemap, /publishedCategories/, 'TN Today category archives need published-article evidence before sitemap inclusion');
assert.match(sitemap, /getActiveAreas\(500\)/, 'Active area detail pages must be present in the sitemap');
for (const route of ['/explore', '/help', '/support', '/about', '/contact', '/privacy-policy', '/terms', '/cookie-policy']) {
  assert.ok(sitemap.includes(`'${route}'`), `${route} must be present in the sitemap`);
}
for (const routeTemplate of [
  '${city.slug}/`',
  '${districtSlug}/${categorySlug}/`',
  '${city}/${issue.slug}/`',
  '/tn-today/${a.slug}/`',
  '/category/${category.slug}/`',
  '/office/${office.slug}/`',
  '/area/${area.slug}/`',
]) {
  assert.ok(!sitemap.includes(routeTemplate), `Sitemap template must omit trailing slash: ${routeTemplate}`);
}

const privateLayouts = [
  'src/app/admin/layout.jsx',
  'src/app/(user)/bookmarks/layout.jsx',
  'src/app/(user)/dashboard/layout.jsx',
  'src/app/(user)/me/layout.jsx',
  'src/app/(user)/create/layout.jsx',
];
for (const file of privateLayouts) {
  assert.match(await read(file), /index:\s*false/, `${file} must emit noindex`);
}

const publicMetadataRoutes = [
  'src/app/(user)/about/page.jsx',
  'src/app/(user)/contact/page.jsx',
  'src/app/(user)/districts/page.jsx',
  'src/app/(user)/awareness/page.jsx',
  'src/app/(user)/how-to-use/page.jsx',
  'src/app/(user)/privacy-policy/page.jsx',
  'src/app/(user)/terms/page.jsx',
];
for (const file of publicMetadataRoutes) {
  const source = await read(file);
  assert.match(source, /export const metadata/, `${file} must export server metadata`);
  assert.match(source, /canonical:/, `${file} must define a canonical URL`);
}

const tnTodayPage = await read('src/app/(user)/tn-today/page.jsx');
const tnTodayCategoryPage = await read('src/app/(user)/tn-today/category/[category]/page.jsx');
const tnTodayView = await read('src/views/TnToday.jsx');
assert.doesNotMatch(tnTodayPage, /ssr:\s*false/, 'TN Today archive must be server rendered');
assert.doesNotMatch(tnTodayCategoryPage, /ssr:\s*false/, 'TN Today category archives must be server rendered');
assert.match(tnTodayPage, /getTnTodayArchive/, 'TN Today archive must fetch server data');
assert.match(tnTodayView, /initialData:/, 'TN Today client queries must hydrate with server data');
assert.match(tnTodayCategoryPage, /TN_TODAY_CATEGORY_MAP/, 'TN Today category routes must validate a shared category inventory');
assert.match(tnTodayCategoryPage, /notFound\(\)/, 'Unknown TN Today categories must return a real 404');
assert.match(tnTodayCategoryPage, /generateMetadata/, 'TN Today category archives must emit canonical server metadata');
assert.match(tnTodayCategoryPage, /<Breadcrumbs/, 'TN Today category archives must expose visible breadcrumbs');

const breadcrumbs = await read('src/components/seo/Breadcrumbs.jsx');
assert.match(breadcrumbs, /aria-label="Breadcrumb"/, 'Shared breadcrumbs must expose navigation semantics');
assert.match(breadcrumbs, /BreadcrumbList/, 'Shared visible breadcrumbs must include matching structured data');
assert.match(breadcrumbs, /aria-current="page"/, 'Shared breadcrumbs must identify the current page');
for (const file of [
  'src/app/(user)/about/page.jsx',
  'src/app/(user)/areas/page.jsx',
  'src/app/(user)/awareness/guides/page.jsx',
  'src/app/(user)/contact/page.jsx',
  'src/app/(user)/privacy-policy/page.jsx',
  'src/app/(user)/terms/page.jsx',
  'src/app/(user)/support/page.jsx',
]) {
  assert.match(await read(file), /<Breadcrumbs/, `${file} must render the shared breadcrumb trail`);
}

const cityPage = await read('src/app/(user)/[city]/page.jsx');
const cityIssuePage = await read('src/app/(user)/[city]/[issue]/page.jsx');
const pageSchema = await read('src/components/seo/PageSchema.jsx');
const legacySeoHelpers = await read('src/lib/seo.js');
const indexBoost = await read('src/lib/seo/indexBoost.js');
const serverSupabase = await read('src/lib/serverSupabase.js');
assert.match(cityPage, /BUILD_TIME_DISTRICT_SLUGS/, 'District pre-rendering must use a bounded priority list');
assert.match(cityIssuePage, /BUILD_TIME_DISTRICT_SLUGS/, 'City issue static params must use the bounded district list');
assert.match(cityIssuePage, /createServerSupabase/, 'City issue data must use bounded server requests');
assert.match(cityIssuePage, /getCityIssueRobots/, 'City issue metadata must use the editorial indexing policy');
assert.match(cityIssuePage, /dataAvailable/, 'City issue pages must distinguish empty results from data outages');
assert.doesNotMatch(cityPage, /FAQPage/, 'District templates must not emit non-visible FAQ schema');
assert.doesNotMatch(cityIssuePage, /FAQPage/, 'City/issue templates must not emit scaled FAQ schema');
assert.match(cityIssuePage, /dateModified=\{latestDate \|\| undefined\}/, 'Programmatic modification dates must come from real reports');
assert.doesNotMatch(pageSchema, /new Date\(/, 'Generic WebPage schema must not fabricate a current modification date');
assert.match(pageSchema, /dateModified \? \{ dateModified \} : \{\}/, 'WebPage schema must omit unknown modification dates');
assert.match(pageSchema, /'@id': WEBSITE_ID/, 'WebPage schema must reference the shared WebSite entity');
assert.doesNotMatch(legacySeoHelpers, /FAQPage/, 'Unused global helpers must not reintroduce generic FAQ schema');
assert.doesNotMatch(indexBoost, /lastModified/, 'Ranking heuristics must not manufacture schema modification dates');
assert.match(serverSupabase, /createServerSupabase/, 'Server Supabase requests need a valid server client');

const scamsPage = await read('src/app/(user)/scams/page.jsx');
const scamsView = await read('src/views/Scams.jsx');
assert.doesNotMatch(scamsPage, /ssr:\s*false/, 'Scam alerts must be server rendered');
assert.match(scamsPage, /getActiveScamAlerts/, 'Scam alerts must fetch initial server data');
assert.match(scamsView, /initialData:\s*filterDistrict/, 'Scam filters must hydrate from server data only for the unfiltered list');

const areasPage = await read('src/app/(user)/areas/page.jsx');
const areasView = await read('src/views/Areas.jsx');
assert.match(areasPage, /getActiveAreas/, 'Areas must fetch initial server data');
assert.match(areasView, /initialData:\s*initialAreas/, 'Areas must hydrate from server data');

const trendingPage = await read('src/app/(user)/trending/page.jsx');
const trendingView = await read('src/views/Trending.jsx');
assert.match(trendingPage, /getTrendingHubData/, 'Trending must fetch initial rankings on the server');
assert.match(trendingView, /initialPosts=/, 'Trending posts must hydrate from server data');

for (const section of ['emergency', 'faqs', 'guides', 'portals', 'schemes']) {
  const source = await read(`src/app/(user)/awareness/${section}/page.jsx`);
  assert.doesNotMatch(source, /ssr:\s*false/, `Awareness ${section} content must be server rendered`);
  assert.doesNotMatch(source, /nextDynamic/, `Awareness ${section} must not be a client-only shell`);
}

const areaDetailPage = await read('src/app/(user)/area/[slug]/page.jsx');
const areaDetailView = await read('src/views/AreaDetail.jsx');
assert.match(areaDetailPage, /generateMetadata/, 'Area detail routes must emit server metadata');
assert.match(areaDetailPage, /getAreaDetailData/, 'Area detail routes must fetch initial public data on the server');
assert.match(areaDetailPage, /canonical/, 'Area detail routes must define canonical URLs');
assert.match(areaDetailView, /initialData:\s*initialData\?\.area/, 'Area detail queries must hydrate from server data');

const categoryDetailPage = await read('src/app/(user)/category/[slug]/page.jsx');
const categoryDetailView = await read('src/views/CategoryDetail.jsx');
assert.doesNotMatch(categoryDetailPage, /ssr:\s*false/, 'Category hubs must render report content on the server');
assert.match(categoryDetailPage, /getCategoryHubData/, 'Category hubs must fetch initial public data on the server');
assert.match(categoryDetailView, /initialData:\s*initialData\?\.posts/, 'Category report queries must hydrate from server data');

const explorePage = await read('src/app/(user)/explore/page.jsx');
const exploreView = await read('src/views/Explore.jsx');
assert.match(explorePage, /getExplorePosts/, 'Explore must fetch its initial public feed on the server');
assert.match(explorePage, /export const metadata/, 'Explore must emit server metadata');
assert.match(exploreView, /initialData:\s*initialPosts/, 'Explore feed must hydrate from server data');

const helpPage = await read('src/app/(user)/help/page.jsx');
const helpView = await read('src/views/Help.jsx');
assert.match(helpPage, /getActiveEmergencyPosts/, 'Help must fetch emergency requests on the server');
assert.match(helpPage, /export const metadata/, 'Help must emit server metadata');
assert.doesNotMatch(helpPage, /ssr:\s*false/, 'Help must not be a client-only shell');
assert.match(helpView, /initialData:\s*!filterDistrict\s*&&\s*!filterType\s*\?\s*initialEmergencies/, 'Help filters must hydrate only from the unfiltered server list');

const supportPage = await read('src/app/(user)/support/page.jsx');
const supportView = await read('src/views/Support.jsx');
assert.match(supportPage, /export const metadata/, 'support must emit unique server metadata');
assert.match(supportPage, /canonical:\s*['"]\/support['"]/, 'support must define its canonical URL');
assert.doesNotMatch(supportPage, /ssr:\s*false/, 'support must not be a client-only shell');
assert.match(supportView, /<h1\b/, 'support must render a crawlable H1');

const tnTodayArticlePage = await read('src/app/(user)/tn-today/[slug]/page.jsx');
const tnTodayArticleView = await read('src/views/TnTodayArticle.jsx');
const tnTodayServerDetail = await read('src/lib/tnTodayServer.js');
const tnTodayAdmin = await read('src/views/admin/AdminTnToday.jsx');
const tnTodayService = await read('src/services/tnToday.js');
const tnTodayCanonicalMigration = await read('supabase/migrations/20260722_tn_today_canonical_cleanup.sql');
assert.doesNotMatch(tnTodayArticlePage, /TnTodayArticleClient/, 'TN Today article bodies must not use a client-only wrapper');
assert.match(tnTodayArticlePage, /getTnTodayArticle/, 'TN Today articles must use the bounded server fetcher');
assert.match(tnTodayArticleView, /initialData:\s*initialArticle/, 'TN Today article queries must hydrate from server data');
assert.match(tnTodayServerDetail, /article,/, 'Editorial content must be returned for server rendering');
assert.doesNotMatch(tnTodayArticlePage, /article\??\.canonical_url/, 'TN Today server metadata must not trust editorial canonical overrides');
assert.doesNotMatch(tnTodayArticleView, /article\??\.canonical_url/, 'TN Today sharing must not trust editorial canonical overrides');
assert.match(tnTodayArticlePage, /getArticleAuthor\(article\.author_name\)/, 'Article schema authors must include a public identity URL');
assert.match(tnTodayArticlePage, /getPublisherSchema\(\)/, 'Article schema must reference the shared publisher identity');
assert.doesNotMatch(tnTodayArticleView, /tn-ld-tn-today|"@type": "NewsArticle"/, 'TN Today must not inject a duplicate client-side article schema');
assert.doesNotMatch(tnTodayAdmin, /Canonical URL/, 'TN Today admin must not expose arbitrary canonical overrides');
assert.match(tnTodayService, /canonical_url:\s*null/, 'TN Today writes must clear legacy canonical overrides');
assert.match(tnTodayCanonicalMigration, /SET canonical_url = NULL/, 'Legacy TN Today canonical overrides must be cleared');

const postDetailPage = await read('src/app/(user)/post/[id]/page.jsx');
const postDetailView = await read('src/views/PostDetail.jsx');
const shareBar = await read('src/components/sharing/ShareBar.jsx');
assert.doesNotMatch(postDetailPage, /PostDetailClient/, 'Post detail content must not use a client-only wrapper');
assert.match(postDetailPage, /getPublicPostDetail/, 'Post details must use the bounded server fetcher');
assert.match(postDetailView, /initialData:\s*initialPost/, 'Post detail queries must hydrate from server data');
assert.doesNotMatch(shareBar, /window\.location/, 'Post sharing must be safe during server rendering');
assert.match(postDetailPage, /<Breadcrumbs/, 'Civic reports must expose server-rendered visible breadcrumbs');
assert.match(postDetailPage, /CATEGORY_MAP/, 'Civic reports must link contextually to their district/category guide');
assert.doesNotMatch(postDetailView, /injectPostStructuredData|injectBreadcrumbStructuredData/, 'Post schema must not be duplicated client-side');

const canonicalDistrictLinkFiles = [
  'src/components/dashboard/TrendingDistrictRow.jsx',
  'src/components/home/TrendingDistricts.jsx',
  'src/views/Search.jsx',
  'src/views/PostDetail.jsx',
  'src/lib/seo.js',
];
for (const file of canonicalDistrictLinkFiles) {
  assert.doesNotMatch(await read(file), /\/district\/\$\{/, `${file} must link directly to canonical district routes`);
}

const real404Routes = [
  'src/app/(user)/[city]/page.jsx',
  'src/app/(user)/[city]/[issue]/page.jsx',
  'src/app/(user)/category/[slug]/page.jsx',
  'src/app/(user)/tn-today/[slug]/page.jsx',
  'src/app/(user)/area/[slug]/page.jsx',
  'src/app/(user)/post/[id]/page.jsx',
  'src/app/(user)/district/[slug]/page.jsx',
];
for (const file of real404Routes) {
  const source = await read(file);
  assert.match(source, /import \{[^}]*notFound[^}]*\} from 'next\/navigation'/, `${file} must use Next.js notFound`);
  assert.match(source, /notFound\(\)/, `${file} must return a real HTTP 404 for missing content`);
}

const postServer = await read('src/lib/postServer.js');
assert.match(postServer, /catch \(error\)[\s\S]*?return empty;/, 'Post lookup failures must return empty object safely on edge runtime');
assert.match(tnTodayServerDetail, /catch \(error\)[\s\S]*?return \{ article: null/, 'TN Today lookup failures must return empty article object for notFound handling');

console.log('SEO and Clarity audit checks passed.');
