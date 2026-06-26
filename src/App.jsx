import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSettingsMap } from '@/services/admin/settings';
import { useLanguage } from '@/context/LanguageContext';
import { Wrench, AlertTriangle } from 'lucide-react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import AuthModal from '@/components/auth/AuthModal';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/lib/errorBoundary';
import OfflineBanner from '@/components/common/OfflineBanner';

// Pages
const Home = lazy(() => import('@/pages/Home'));
const Explore = lazy(() => import('@/pages/Explore'));
const Districts = lazy(() => import('@/pages/Districts'));
const DistrictDetail = lazy(() => import('@/pages/DistrictDetail'));
const CategoryDetail = lazy(() => import('@/pages/CategoryDetail'));
const CreatePost = lazy(() => import('@/pages/CreatePost'));
const PostDetail = lazy(() => import('@/pages/PostDetail'));

// Admin Pages
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
import AdminLayout from '@/components/admin/AdminLayout';
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminPosts = lazy(() => import('@/pages/admin/AdminPosts'));
const AdminComments = lazy(() => import('@/pages/admin/AdminComments'));
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'));
const AdminAds = lazy(() => import('@/pages/admin/AdminAds'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminDistricts = lazy(() => import('@/pages/admin/AdminDistricts'));
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminModeration = lazy(() => import('@/pages/admin/AdminModeration'));
const AdminModerationSettings = lazy(() => import('@/pages/admin/AdminModerationSettings'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Search = lazy(() => import('@/pages/Search'));
const Bookmarks = lazy(() => import('@/pages/Bookmarks'));
const Trending = lazy(() => import('@/pages/Trending'));
const Contact = lazy(() => import('@/pages/Contact'));
const Awareness = lazy(() => import('@/pages/Awareness'));
const AwarenessEmergency = lazy(() => import('@/views/AwarenessEmergency'));
const AwarenessGuides = lazy(() => import('@/views/AwarenessGuides'));
const AwarenessSchemes = lazy(() => import('@/views/AwarenessSchemes'));
const AwarenessPortals = lazy(() => import('@/views/AwarenessPortals'));
const AwarenessFaqs = lazy(() => import('@/views/AwarenessFaqs'));
const Areas = lazy(() => import('@/pages/Areas'));
const AreaDetail = lazy(() => import('@/pages/AreaDetail'));
const Situations = lazy(() => import('@/pages/Situations'));
const AskLocal = lazy(() => import('@/pages/AskLocal'));
const QuestionDetail = lazy(() => import('@/pages/QuestionDetail'));
const Offices = lazy(() => import('@/pages/Offices'));
const OfficeDetail = lazy(() => import('@/pages/OfficeDetail'));
const Jobs = lazy(() => import('@/pages/Jobs'));
const Scams = lazy(() => import('@/pages/Scams'));
const Help = lazy(() => import('@/pages/Help'));
const Community = lazy(() => import('@/pages/Community'));
const CommunityWins = lazy(() => import('@/views/CommunityWins'));
const Support = lazy(() => import('@/pages/Support'));
const AdminPhase8 = lazy(() => import('@/pages/admin/AdminPhase8'));
const AdminCommunity = lazy(() => import('@/pages/admin/AdminCommunity'));
const AdminContacts = lazy(() => import('@/pages/admin/AdminContacts'));
const Stay = lazy(() => import('@/pages/Stay'));
const AdminStay = lazy(() => import('@/pages/admin/AdminStay'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminCivicReceipts = lazy(() => import('@/pages/admin/AdminCivicReceipts'));
const AdminAwareness = lazy(() => import('@/views/admin/AdminAwareness'));
const LocalListings = lazy(() => import('@/pages/LocalListings'));
const CivicLeaderboard = lazy(() => import('@/pages/CivicLeaderboard'));
const RWADashboard = lazy(() => import('@/pages/RWADashboard'));
const CSRDashboard = lazy(() => import('@/pages/CSRDashboard'));
const AdminMonetization = lazy(() => import('@/pages/admin/AdminMonetization'));
const AdminSEO = lazy(() => import('@/views/admin/AdminSEO'));
const AdminTnToday = lazy(() => import('@/views/admin/AdminTnToday'));
const TnToday = lazy(() => import('@/views/TnToday'));
const TnTodayArticle = lazy(() => import('@/views/TnTodayArticle'));
const MyDashboard = lazy(() => import('@/pages/MyDashboard'));
const BribeDashboard = lazy(() => import('@/views/BribeDashboard'));
const AdminBribes = lazy(() => import('@/views/admin/AdminBribes'));
// Legal + SEO pages
const PrivacyPolicy  = lazy(() => import('@/views/PrivacyPolicy'));
const About          = lazy(() => import('@/views/About'));
const TermsOfService = lazy(() => import('@/views/TermsOfService'));
const HowToUse       = lazy(() => import('@/views/HowToUse'));

// Under Maintenance screen
function MaintenancePage({ logo, supportEmail }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 transition-colors duration-300">
      <div className="relative w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-3xl p-8 text-center overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col items-center gap-6">
          {/* Logo / Maintenance Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl animate-pulse pointer-events-none" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300">
              {logo ? (
                <img src={logo} alt="VizhiTN" className="w-10 h-10 object-contain rounded-lg" />
              ) : (
                <span className="text-white font-black text-2xl tracking-tighter">TN</span>
              )}
            </div>
            {/* Small tool overlay badge */}
            <div className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-1.5 rounded-xl border-2 border-white dark:border-slate-900 shadow-md">
              <Wrench className="w-3.5 h-3.5 animate-spin [animation-duration:4s]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2 mt-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl font-display">
              {T("Under Scheduled Maintenance", "திட்டமிட்ட பராமரிப்பில்")}
            </h1>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
              {T("We'll be right back", "விரைவில் திரும்புவோம்")}
            </p>
          </div>

          {/* Content divider */}
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            {T(
              "VizhiTN is currently undergoing scheduled maintenance to upgrade our civic infrastructure. We apologize for the temporary inconvenience.",
              "VizhiTN தளம் தற்போது மேம்படுத்தப்பட்டு வருகிறது. விரைவில் பயன்பாட்டிற்கு வரும். தங்களின் தற்காலிக சிரமத்திற்கு வருந்துகிறோம்."
            )}
          </p>

          {/* Contact Support */}
          <div className="w-full mt-2">
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors duration-200 border border-slate-200/40 dark:border-slate-700/40"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{T("Contact Support", "ஆதரவைத் தொடர்பு கொள்க")}</span>
            </a>
          </div>

          {/* PWA / Brand note */}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-none">
            © 2026 VizhiTN • {T("Civic Transparency Platform", "குடிமை வெளிப்படைத்தன்மை தளம்")}
          </div>
        </div>
      </div>
    </div>
  );
}

const AuthenticatedApp = ({ theme, toggleTheme }) => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  const { data: settings = {}, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  if (isLoadingPublicSettings || isLoadingAuth || isLoadingSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">TN</span>
          </div>
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    else if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  const isAdmin = user?.role === "admin";
  const isMaintenance = settings.maintenance_mode === "true";
  const isRoutingToAdmin = window.location.pathname.startsWith('/admin');

  if (isMaintenance && !isAdmin && !isRoutingToAdmin) {
    return <MaintenancePage logo={settings.site_logo_url} supportEmail={settings.support_email || "support@vizhitn.in"} />;
  }

  return (
    <Routes>
      <Route element={<Layout theme={theme} toggleTheme={toggleTheme} />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/districts" element={<Districts />} />
        <Route path="/district/:slug" element={<DistrictDetail />} />
        <Route path="/category/:slug" element={<CategoryDetail />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bribes" element={<BribeDashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/awareness/emergency" element={<AwarenessEmergency />} />
        <Route path="/awareness/guides" element={<AwarenessGuides />} />
        <Route path="/awareness/schemes" element={<AwarenessSchemes />} />
        <Route path="/awareness/portals" element={<AwarenessPortals />} />
        <Route path="/awareness/faqs" element={<AwarenessFaqs />} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/area/:slug" element={<AreaDetail />} />
        <Route path="/situations" element={settings.situations_enabled !== "false" ? <Situations /> : <PageNotFound />} />
        <Route path="/ask" element={settings.qa_enabled !== "false" ? <AskLocal /> : <PageNotFound />} />
        <Route path="/question/:id" element={settings.qa_enabled !== "false" ? <QuestionDetail /> : <PageNotFound />} />
        <Route path="/offices" element={settings.office_reports_enabled !== "false" ? <Offices /> : <PageNotFound />} />
        <Route path="/office/:slug" element={settings.office_reports_enabled !== "false" ? <OfficeDetail /> : <PageNotFound />} />
        <Route path="/jobs" element={settings.jobs_enabled !== "false" ? <Jobs /> : <PageNotFound />} />
        <Route path="/scams" element={settings.scam_alerts_enabled !== "false" ? <Scams /> : <PageNotFound />} />
        <Route path="/help" element={settings.emergency_enabled !== "false" ? <Help /> : <PageNotFound />} />
        <Route path="/community" element={settings.discussions_enabled !== "false" ? <Community /> : <PageNotFound />} />
        <Route path="/community/wins" element={settings.discussions_enabled !== "false" ? <CommunityWins /> : <PageNotFound />} />
        <Route path="/support" element={<Support />} />
        <Route path="/stay" element={<Stay />} />
        <Route path="/listings" element={<LocalListings />} />
        <Route path="/leaderboard" element={<CivicLeaderboard />} />
        <Route path="/rwa" element={settings.rwa_enabled !== "false" ? <RWADashboard /> : <PageNotFound />} />
        <Route path="/csr" element={settings.csr_enabled !== "false" ? <CSRDashboard /> : <PageNotFound />} />
        <Route path="/me" element={<MyDashboard />} />
        {/* TN Today public routes */}
        <Route path="/tn-today" element={<TnToday />} />
        <Route path="/tn-today/category/:category" element={<TnToday />} />
        <Route path="/tn-today/:slug" element={<TnTodayArticle />} />
        {/* Legal & SEO pages — required for Google AdSense */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about"          element={<About />} />
        <Route path="/terms"          element={<TermsOfService />} />
        <Route path="/how-to-use"     element={<HowToUse />} />
      </Route>
      {/* Admin Routes */}
      <Route path="/admin/login" element={
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        }>
          <AdminLogin />
        </Suspense>
      } />
      <Route path="/admin" element={<ErrorBoundary><AdminLayout /></ErrorBoundary>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="ads" element={<AdminAds />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="districts" element={<AdminDistricts />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="moderation-settings" element={<AdminModerationSettings />} />
        <Route path="phase8" element={<AdminPhase8 />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="stay" element={<AdminStay />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="civic" element={<AdminCivicReceipts />} />
        <Route path="awareness" element={<AdminAwareness />} />
        <Route path="monetization" element={<AdminMonetization />} />
        <Route path="seo" element={<AdminSEO />} />
        <Route path="tn-today" element={<AdminTnToday />} />
        <Route path="bribes" element={<AdminBribes />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tn_theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("tn_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <LanguageProvider>
          <AuthModalProvider>
          <Router>
            <OfflineBanner />
            <AuthenticatedApp theme={theme} toggleTheme={toggleTheme} />
            <AuthModal />
            <Toaster />
          </Router>
          </AuthModalProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;