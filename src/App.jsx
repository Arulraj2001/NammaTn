import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import Districts from '@/pages/Districts';
import DistrictDetail from '@/pages/DistrictDetail';
import CategoryDetail from '@/pages/CategoryDetail';
import CreatePost from '@/pages/CreatePost';
import PostDetail from '@/pages/PostDetail';

// Admin Pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPosts from '@/pages/admin/AdminPosts';
import AdminComments from '@/pages/admin/AdminComments';
import AdminReports from '@/pages/admin/AdminReports';
import AdminAds from '@/pages/admin/AdminAds';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminDistricts from '@/pages/admin/AdminDistricts';
import AdminMedia from '@/pages/admin/AdminMedia';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminModeration from '@/pages/admin/AdminModeration';
import AdminModerationSettings from '@/pages/admin/AdminModerationSettings';
import Dashboard from '@/pages/Dashboard';
import Search from '@/pages/Search';
import Bookmarks from '@/pages/Bookmarks';
import Trending from '@/pages/Trending';
import Contact from '@/pages/Contact';
import Awareness from '@/pages/Awareness';
import Areas from '@/pages/Areas';
import AreaDetail from '@/pages/AreaDetail';
import Situations from '@/pages/Situations';
import AskLocal from '@/pages/AskLocal';
import QuestionDetail from '@/pages/QuestionDetail';
import Offices from '@/pages/Offices';
import OfficeDetail from '@/pages/OfficeDetail';
import Jobs from '@/pages/Jobs';
import Scams from '@/pages/Scams';
import Help from '@/pages/Help';
import Community from '@/pages/Community';
import Support from '@/pages/Support';
import AdminPhase8 from '@/pages/admin/AdminPhase8';
import AdminCommunity from '@/pages/admin/AdminCommunity';
import AdminContacts from '@/pages/admin/AdminContacts';
import Stay from '@/pages/Stay';
import AdminStay from '@/pages/admin/AdminStay';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminCivicReceipts from '@/pages/admin/AdminCivicReceipts';
import LocalListings from '@/pages/LocalListings';
import CivicLeaderboard from '@/pages/CivicLeaderboard';
import RWADashboard from '@/pages/RWADashboard';
import CSRDashboard from '@/pages/CSRDashboard';
import AdminMonetization from '@/pages/admin/AdminMonetization';
import MyDashboard from '@/pages/MyDashboard';

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
        <Route path="/support" element={<Support />} />
        <Route path="/stay" element={<Stay />} />
        <Route path="/listings" element={<LocalListings />} />
        <Route path="/leaderboard" element={<CivicLeaderboard />} />
        <Route path="/rwa" element={<RWADashboard />} />
        <Route path="/csr" element={<CSRDashboard />} />
        <Route path="/me" element={<MyDashboard />} />
      </Route>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
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
        <Route path="monetization" element={<AdminMonetization />} />
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