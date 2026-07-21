import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import nextConfig from '../next.config.js';

const root = process.cwd();
const read = relativePath => readFile(path.join(root, relativePath), 'utf8');

const headerRules = await nextConfig.headers();
const csp = headerRules[0].headers.find(header => header.key === 'Content-Security-Policy')?.value || '';
assert.match(csp, /https:\/\/\*\.clarity\.ms/, 'CSP must allow Clarity resources');
assert.match(csp, /https:\/\/c\.bing\.com/, 'CSP must allow Clarity collection fallback');

const redirects = await nextConfig.redirects();
assert.ok(
  redirects.some(rule => rule.has?.some(condition => condition.type === 'host' && condition.value === 'vizhitn.in')),
  'A non-www to www redirect is required',
);

const rootLayout = await read('src/app/layout.jsx');
assert.match(rootLayout, /VizhiTN_cookie_consent/, 'Clarity must be consent gated');
assert.doesNotMatch(rootLayout, /alternates:\s*\{\s*canonical:\s*SITE_URL/, 'Root layout must not set a homepage canonical for every route');

const robots = await read('public/robots.txt');
for (const route of ['/dashboard/', '/me/', '/bookmarks/']) {
  assert.ok(!robots.includes(`Disallow: ${route}`), `${route} must remain crawlable so noindex can be read`);
}

const sitemap = await read('src/app/sitemap.js');
assert.doesNotMatch(sitemap, /\bTODAY\b/, 'Sitemap must not manufacture daily lastModified dates');
assert.match(sitemap, /updated_date/, 'Dynamic sitemap entries must use real update timestamps');
assert.match(sitemap, /\/category\/\$\{category\.slug\}/, 'Category hubs must be present in the sitemap');

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

const cityPage = await read('src/app/(user)/[city]/page.jsx');
const cityIssuePage = await read('src/app/(user)/[city]/[issue]/page.jsx');
const serverSupabase = await read('src/lib/serverSupabase.js');
assert.match(cityPage, /BUILD_TIME_DISTRICT_SLUGS/, 'District pre-rendering must use a bounded priority list');
assert.match(cityIssuePage, /params\?\.city/, 'Nested static params must build only the current parent district');
assert.match(cityIssuePage, /createServerSupabase/, 'City issue data must use bounded server requests');
assert.match(serverSupabase, /DEFAULT_TIMEOUT_MS\s*=\s*3000/, 'Server Supabase requests need a deployment-safe timeout');

const scamsPage = await read('src/app/(user)/scams/page.jsx');
const scamsView = await read('src/views/Scams.jsx');
assert.doesNotMatch(scamsPage, /ssr:\s*false/, 'Scam alerts must be server rendered');
assert.match(scamsPage, /getActiveScamAlerts/, 'Scam alerts must fetch initial server data');
assert.match(scamsView, /initialData:\s*filterDistrict/, 'Scam filters must hydrate from server data only for the unfiltered list');

const jobsPage = await read('src/app/(user)/jobs/page.jsx');
const jobsView = await read('src/views/Jobs.jsx');
assert.doesNotMatch(jobsPage, /ssr:\s*false/, 'Job alerts must be server rendered');
assert.match(jobsPage, /getActiveJobAlerts/, 'Job alerts must fetch initial server data');
assert.match(jobsView, /initialData:\s*!filterDistrict/, 'Job filters must hydrate from the unfiltered server list');

const stayPage = await read('src/app/(user)/stay/page.jsx');
const stayView = await read('src/views/Stay.jsx');
assert.doesNotMatch(stayPage, /ssr:\s*false/, 'Stay listings must be server rendered');
assert.match(stayPage, /getActiveStayListings/, 'Stay listings must fetch initial server data');
assert.match(stayView, /initialData:\s*initialListings/, 'Stay listings must hydrate from server data');

const areasPage = await read('src/app/(user)/areas/page.jsx');
const areasView = await read('src/views/Areas.jsx');
const officesPage = await read('src/app/(user)/offices/page.jsx');
assert.match(areasPage, /getActiveAreas/, 'Areas must fetch initial server data');
assert.match(areasView, /initialData:\s*initialAreas/, 'Areas must hydrate from server data');
assert.doesNotMatch(officesPage, /ssr:\s*false/, 'The static offices directory must be server rendered');

const communityPage = await read('src/app/(user)/community/page.jsx');
const communityView = await read('src/views/Community.jsx');
const trendingPage = await read('src/app/(user)/trending/page.jsx');
const trendingView = await read('src/views/Trending.jsx');
const bribesPage = await read('src/app/(user)/bribes/page.jsx');
const bribesView = await read('src/views/BribeDashboard.jsx');
assert.match(communityPage, /getCommunityHubData/, 'Community must fetch its public pulse on the server');
assert.match(communityView, /initialData:\s*initialData\?\.settings/, 'Community settings must hydrate from server data');
assert.match(trendingPage, /getTrendingHubData/, 'Trending must fetch initial rankings on the server');
assert.match(trendingView, /initialPosts=/, 'Trending posts must hydrate from server data');
assert.match(bribesPage, /getActiveBribePosts/, 'Bribe transparency reports must fetch on the server');
assert.match(bribesView, /initialData:\s*initialBribePosts/, 'Bribe reports must hydrate from server data');

for (const section of ['emergency', 'faqs', 'guides', 'portals', 'schemes']) {
  const source = await read(`src/app/(user)/awareness/${section}/page.jsx`);
  assert.doesNotMatch(source, /ssr:\s*false/, `Awareness ${section} content must be server rendered`);
  assert.doesNotMatch(source, /nextDynamic/, `Awareness ${section} must not be a client-only shell`);
}

const officeDetailPage = await read('src/app/(user)/office/[slug]/page.jsx');
const officeDetailView = await read('src/views/OfficeDetail.jsx');
assert.match(officeDetailPage, /generateStaticParams/, 'Office detail routes must be statically discoverable');
assert.match(officeDetailPage, /generateMetadata/, 'Office detail routes must emit server metadata');
assert.match(officeDetailPage, /canonical/, 'Office detail routes must define canonical URLs');
assert.doesNotMatch(officeDetailView, /window\.location/, 'Office detail rendering must not depend on browser globals');

const areaDetailPage = await read('src/app/(user)/area/[slug]/page.jsx');
const areaDetailView = await read('src/views/AreaDetail.jsx');
assert.match(areaDetailPage, /generateMetadata/, 'Area detail routes must emit server metadata');
assert.match(areaDetailPage, /getAreaDetailData/, 'Area detail routes must fetch initial public data on the server');
assert.match(areaDetailPage, /canonical/, 'Area detail routes must define canonical URLs');
assert.match(areaDetailView, /initialData:\s*initialData\?\.area/, 'Area detail queries must hydrate from server data');

const questionDetailPage = await read('src/app/(user)/question/[id]/page.jsx');
const questionDetailView = await read('src/views/QuestionDetail.jsx');
assert.match(questionDetailPage, /generateMetadata/, 'Question detail routes must emit server metadata');
assert.match(questionDetailPage, /index:\s*false,\s*follow:\s*true/, 'Thin user questions must remain noindex, follow');
assert.match(questionDetailPage, /getQuestionDetailData/, 'Question detail routes must fetch initial data on the server');
assert.match(questionDetailView, /initialData:\s*initialData\?\.question/, 'Question details must hydrate from server data');

const categoryDetailPage = await read('src/app/(user)/category/[slug]/page.jsx');
const categoryDetailView = await read('src/views/CategoryDetail.jsx');
assert.doesNotMatch(categoryDetailPage, /ssr:\s*false/, 'Category hubs must render report content on the server');
assert.match(categoryDetailPage, /getCategoryHubData/, 'Category hubs must fetch initial public data on the server');
assert.match(categoryDetailView, /initialData:\s*initialData\?\.posts/, 'Category report queries must hydrate from server data');

const explorePage = await read('src/app/(user)/explore/page.jsx');
const exploreView = await read('src/views/Explore.jsx');
assert.match(explorePage, /getExplorePosts/, 'Explore must fetch its initial public feed on the server');
assert.match(explorePage, /export const metadata/, 'Explore must emit server metadata');
assert.doesNotMatch(explorePage, /ssr:\s*false/, 'Explore must not be a client-only shell');
assert.match(exploreView, /initialData:\s*\{\s*pages:\s*\[initialPosts\]/, 'Explore infinite feed must hydrate from server data');

const situationsPage = await read('src/app/(user)/situations/page.jsx');
const situationsView = await read('src/views/Situations.jsx');
assert.match(situationsPage, /getActiveSituationUpdates/, 'Situations must fetch active updates on the server');
assert.match(situationsPage, /export const metadata/, 'Situations must emit server metadata');
assert.doesNotMatch(situationsPage, /ssr:\s*false/, 'Situations must not be a client-only shell');
assert.match(situationsView, /initialData:\s*!filterDistrict\s*\?\s*initialSituations/, 'Situation filters must hydrate only from the unfiltered server list');

const helpPage = await read('src/app/(user)/help/page.jsx');
const helpView = await read('src/views/Help.jsx');
assert.match(helpPage, /getActiveEmergencyPosts/, 'Help must fetch emergency requests on the server');
assert.match(helpPage, /export const metadata/, 'Help must emit server metadata');
assert.doesNotMatch(helpPage, /ssr:\s*false/, 'Help must not be a client-only shell');
assert.match(helpView, /initialData:\s*!filterDistrict\s*&&\s*!filterType\s*\?\s*initialEmergencies/, 'Help filters must hydrate only from the unfiltered server list');

const askPage = await read('src/app/(user)/ask/page.jsx');
const askView = await read('src/views/AskLocal.jsx');
assert.match(askPage, /getLatestQuestions/, 'Ask must fetch recent questions on the server');
assert.match(askPage, /export const metadata/, 'Ask must emit server metadata');
assert.doesNotMatch(askPage, /ssr:\s*false/, 'Ask must not be a client-only shell');
assert.match(askView, /initialData:\s*!filterDistrict\s*\?\s*initialQuestions/, 'Ask filters must hydrate only from the unfiltered server list');

console.log('SEO and Clarity audit checks passed.');
