import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect, lazy } from 'react';
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
// Legal + SEO pages
const PrivacyPolicy  = lazy(() => import('@/views/PrivacyPolicy'));
const About          = lazy(() => import('@/views/About'));
const TermsOfService = lazy(() => import('@/views/TermsOfService'));

const AuthenticatedApp = ({ theme, toggleTheme }) => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
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
        <Route path="/situations" element={<Situations />} />
        <Route path="/ask" element={<AskLocal />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/offices" element={<Offices />} />
        <Route path="/office/:slug" element={<OfficeDetail />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/scams" element={<Scams />} />
        <Route path="/help" element={<Help />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/wins" element={<CommunityWins />} />
        <Route path="/support" element={<Support />} />
        <Route path="/stay" element={<Stay />} />
        <Route path="/listings" element={<LocalListings />} />
        <Route path="/leaderboard" element={<CivicLeaderboard />} />
        <Route path="/rwa" element={<RWADashboard />} />
        <Route path="/csr" element={<CSRDashboard />} />
        <Route path="/me" element={<MyDashboard />} />
        {/* TN Today public routes */}
        <Route path="/tn-today" element={<TnToday />} />
        <Route path="/tn-today/category/:category" element={<TnToday />} />
        <Route path="/tn-today/:slug" element={<TnTodayArticle />} />
        {/* Legal & SEO pages — required for Google AdSense */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about"          element={<About />} />
        <Route path="/terms"          element={<TermsOfService />} />
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