import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, Navigate } from "react-router-dom";
import { getSettingsMap } from "@/services/admin/settings";
import {
  Building2, CheckCircle, FileText, Shield, Clock, Users,
  TrendingUp, AlertTriangle, Plus, ChevronRight, BarChart3, X
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { RWA_PLANS } from "@/lib/listingCategories";
import RWARegisterModal from "@/components/rwa/RWARegisterModal";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import { getDaysOpen } from "@/lib/civicReceipt";
import { formatDistanceToNow } from "date-fns";
import { DISTRICTS } from "@/lib/districts";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

// ─── Area Civic Stats Panel ───────────────────────────────────────────────────
function AreaCivicStats({ districtSlug }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["rwa-civic-posts", districtSlug],
    queryFn: () => base44.entities.Post.filter(
      { district_slug: districtSlug, post_type: "complaint", status: "active" },
      "-created_date", 100
    ),
    enabled: !!districtSlug,
    staleTime: 60_000,
    select: (data) => data.filter(p => p.moderation_status !== "hidden" && p.is_publicly_visible !== false),
  });

  const stats = useMemo(() => {
    const total = posts.length;
    const verified = posts.filter(p => p.civic_status === "community_verified" || (p.verification_count || 0) >= 2).length;
    const needsComplaint = posts.filter(p => !p.official_complaint_id && ["reported", "community_verified", "complaint_needed"].includes(p.civic_status)).length;
    const complaintFiled = posts.filter(p => !!p.official_complaint_id).length;
    const underFollowup = posts.filter(p => p.civic_status === "under_followup").length;
    const escalated = posts.filter(p => p.civic_status === "unresolved_escalated").length;
    const claimedFixed = posts.filter(p => p.civic_status === "claimed_fixed").length;
    const verifiedFixed = posts.filter(p => p.civic_status === "citizen_verified_fixed").length;
    const longestOpen = [...posts]
      .filter(p => !["citizen_verified_fixed", "duplicate_invalid"].includes(p.civic_status))
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .slice(0, 5);
    const mostVerified = [...posts]
      .filter(p => !["citizen_verified_fixed", "duplicate_invalid"].includes(p.civic_status))
      .sort((a, b) => (b.verification_count || 0) - (a.verification_count || 0))
      .slice(0, 5);
    const missingComplaint = posts
      .filter(p => !p.official_complaint_id && ["community_verified", "complaint_needed", "complaint_filed"].includes(p.civic_status))
      .slice(0, 10);
    const needsFollowup = posts
      .filter(p => p.official_complaint_id && ["complaint_filed", "under_followup"].includes(p.civic_status))
      .slice(0, 10);
    // Category breakdown
    const cats = {};
    posts.forEach(p => {
      const c = p.category_name || "Other";
      cats[c] = (cats[c] || 0) + 1;
    });
    const catBreakdown = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { total, verified, needsComplaint, complaintFiled, underFollowup, escalated, claimedFixed, verifiedFixed, longestOpen, mostVerified, missingComplaint, needsFollowup, catBreakdown };
  }, [posts]);

  if (isLoading) return <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;
  if (!districtSlug || posts.length === 0) return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center">
      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
      <p className="text-sm text-slate-500">{T("No Civic Receipts found for this area.", "இந்த பகுதியில் குடிமை ரசீதுகள் இல்லை.")}</p>
    </div>
  );

  const statCards = [
    { label: T("Total Issues", "மொத்த சிக்கல்கள்"), value: stats.total, cls: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 text-blue-700" },
    { label: T("Community Verified", "சமூகம் சரிபார்த்தது"), value: stats.verified, cls: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 text-indigo-700" },
    { label: T("Needs Complaint ID", "புகார் ID தேவை"), value: stats.needsComplaint, cls: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 text-orange-700" },
    { label: T("Complaint Filed", "புகார் தாக்கல்"), value: stats.complaintFiled, cls: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 text-yellow-700" },
    { label: T("Under Follow-up", "கண்காணிப்பில்"), value: stats.underFollowup, cls: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 text-amber-700" },
    { label: T("Escalated", "நீட்டிக்கப்பட்டது"), value: stats.escalated, cls: "bg-red-50 dark:bg-red-900/20 border-red-100 text-red-600" },
    { label: T("Claimed Fixed", "சரி செய்யப்பட்டதாக கூறினர்"), value: stats.claimedFixed, cls: "bg-teal-50 dark:bg-teal-900/20 border-teal-100 text-teal-700" },
    { label: T("Verified Fixed", "சரிபார்க்கப்பட்டு சரி செய்யப்பட்டது"), value: stats.verifiedFixed, cls: "bg-green-50 dark:bg-green-900/20 border-green-100 text-green-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.cls}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 leading-tight font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {stats.catBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            {T("Issue Category Breakdown", "சிக்கல் வகை பிரிப்பு")}
          </h4>
          <div className="space-y-2">
            {stats.catBreakdown.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 w-36 truncate">{cat}</p>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (count / stats.total) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Longest open */}
        <IssueList title={T("Longest Open Issues", "நீண்ட காலமாக திறந்திருக்கும்")} icon={Clock} iconColor="text-red-500" items={stats.longestOpen}
          renderMeta={p => `${getDaysOpen(p.created_date)}d open`} />

        {/* Most verified unresolved */}
        <IssueList title={T("Most Verified (Unresolved)", "அதிகம் சரிபார்க்கப்பட்டவை")} icon={Users} iconColor="text-indigo-500" items={stats.mostVerified}
          renderMeta={p => `${p.verification_count || 0} verified`} />

        {/* Missing complaint ID */}
        {stats.missingComplaint.length > 0 && (
          <IssueList title={T("Complaint ID Missing", "புகார் ID இல்லை")} icon={AlertTriangle} iconColor="text-orange-500" items={stats.missingComplaint}
            renderMeta={p => p.civic_status?.replace(/_/g, " ") || "reported"} />
        )}

        {/* Needs follow-up */}
        {stats.needsFollowup.length > 0 && (
          <IssueList title={T("Follow-up Needed", "கண்காணிப்பு தேவை")} icon={TrendingUp} iconColor="text-amber-500" items={stats.needsFollowup}
            renderMeta={p => `ID: ${p.official_complaint_id}`} />
        )}
      </div>
    </div>
  );
}

function IssueList({ title, icon: Icon, iconColor, items, renderMeta }) {
  if (!items.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.map(p => (
          <Link key={p.id} to={`/post/${p.id}`}
            className="flex items-start gap-2 py-2 px-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-xl transition-colors group">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">{p.title_en}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <CivicStatusBadge status={p.civic_status || "reported"} size="xs" />
                <span className="text-[10px] text-slate-400">{renderMeta(p)}</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan }) {
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      requireAuth(() => setShowRegister(true), "Sign in to register RWA Group");
      return;
    }
    setShowRegister(true);
  };

  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 flex flex-col ${plan.highlight ? "border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20" : "border-slate-200 dark:border-slate-700"}`}>
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
      )}
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.label}</h3>
      <div className="mt-2 mb-3">
        {plan.price === 0 ? (
          <span className="text-2xl font-bold text-green-600">Free</span>
        ) : (
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{plan.price.toLocaleString()}</span>
            <span className="text-xs text-slate-500 ml-1">/{plan.billing}</span>
          </div>
        )}
      </div>
      <ul className="space-y-1.5 flex-1 mb-4">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      {plan.price > 0 && (
        <p className="text-[10px] text-slate-400 mb-3">Our team will contact you for payment after review. No automatic billing.</p>
      )}
      <button onClick={handleRegisterClick}
        className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${plan.highlight ? "bg-purple-600 hover:bg-purple-700 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
        {plan.price === 0 ? "Get Started Free" : "Register Group"}
      </button>
      {showRegister && <RWARegisterModal plan={plan} onClose={() => setShowRegister(false)} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RWADashboard() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  if (settings.rwa_enabled === "false") {
    return <Navigate to="/" replace />;
  }

  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      requireAuth(() => setShowRegister(true), T("Sign in to register your community", "சமூகத்தை பதிவு செய்ய உள்நுழையுங்கள்"));
      return;
    }
    setShowRegister(true);
  };

  const { data: groups = [] } = useQuery({
    queryKey: ["rwa-groups-public"],
    queryFn: () => base44.entities.RWAGroup.filter({ status: "active", is_verified: true }, "-created_date", 50),
    staleTime: 5 * 60_000,
  });

  const features = [
    { icon: "📋", title: T("Civic Receipt Tracker", "குடிமை ரசீது கண்காணிப்பு"), desc: T("Track all Civic Receipts in your area by status and category.", "உங்கள் பகுதியின் அனைத்து குடிமை ரசீதுகளையும் நிலை மற்றும் வகை மூலம் கண்காணியுங்கள்.") },
    { icon: "🔍", title: T("Complaint ID Tracker", "புகார் ID கண்காணிப்பு"), desc: T("See which issues have official complaint IDs and which are missing.", "எந்த சிக்கல்களுக்கு அதிகாரப்பூர்வ புகார் IDகள் உள்ளன என்று பார்க்கவும்.") },
    { icon: "📄", title: T("Printable Monthly Report", "அச்சிடக்கூடிய மாதாந்திர அறிக்கை"), desc: T("Generate and print area civic summary reports.", "பகுதி குடிமை சுருக்க அறிக்கைகளை உருவாக்கி அச்சிடுங்கள்.") },
    { icon: "🔔", title: T("Follow-up List", "கண்காணிப்பு பட்டியல்"), desc: T("Identify complaints needing follow-up and escalation.", "கண்காணிப்பு மற்றும் நீட்டிப்பு தேவைப்படும் புகார்களை அடையாளம் காணுங்கள்.") },
    { icon: "📊", title: T("Category Breakdown", "வகை பிரிப்பு"), desc: T("See which issue types are most common in your area.", "உங்கள் பகுதியில் எந்த சிக்கல் வகைகள் அதிகமாக உள்ளன என்று பார்க்கவும்.") },
    { icon: "👥", title: T("Community Verification", "சமூக சரிபார்ப்பு"), desc: T("Track citizen verification and complaint follow-up activity.", "குடிமக்கள் சரிபார்ப்பு மற்றும் புகார் கண்காணிப்பு செயல்பாட்டை கண்காணியுங்கள்.") },
    { icon: "📤", title: T("Export for Officials", "அதிகாரிகளுக்கு ஏற்றுமதி"), desc: T("Download formatted reports to share with government offices.", "அரசாங்க அலுவலகங்களுடன் பகிர்வதற்கு அறிக்கைகளை பதிவிறக்கவும்.") },
    { icon: "🚨", title: T("Escalation List", "நீட்டிப்பு பட்டியல்"), desc: T("Issues that need escalation beyond the local office.", "உள்ளூர் அலுவலகத்திற்கு அப்பால் நீட்டிப்பு தேவைப்படும் சிக்கல்கள்.") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {T("RWA & Community Dashboards", "RWA & சமூக கட்டுப்பாட்டு மையங்கள்")}
          </h1>
          <p className="text-purple-100 text-sm max-w-xl mx-auto leading-relaxed mb-5">
            {T("Organized civic tracking for Resident Welfare Associations, apartment associations, traders, and volunteer groups.", "குடியிருப்பு நல சங்கங்களுக்கும் சமூக குழுக்களுக்கும் அமைப்பு ரீதியான குடிமை கண்காணிப்பு.")}
          </p>
          <button onClick={handleRegisterClick}
            className="inline-flex items-center gap-2 bg-white text-purple-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-50 transition-all shadow-lg">
            <Plus className="w-4 h-4" />
            {T("Register Your Community", "உங்கள் சமூகத்தை பதிவு செய்யுங்கள்")}
          </button>
        </div>
      </div>

      {/* Trust disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800 py-2.5 px-4">
        <p className="text-xs text-amber-700 dark:text-amber-400 text-center max-w-3xl mx-auto">
          <strong>{T("Note:", "குறிப்பு:")}</strong> {T("RWA dashboards help local communities organize public Civic Receipts and complaint follow-up. They do not replace official grievance systems.", "RWA கட்டுப்பாட்டு மையங்கள் பொது குடிமை ரசீதுகள் மற்றும் புகார் கண்காணிப்பை ஒழுங்கமைக்க உதவுகின்றன. இவை அதிகாரப்பூர்வ புகார் அமைப்புகளை மாற்றாவு.")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Live Area Civic Data Explorer */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {T("Explore Civic Issues by District", "மாவட்டம் மூலம் குடிமை சிக்கல்களை ஆராயுங்கள்")}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            {T("Select a district to see the civic receipt stats your RWA would track.", "உங்கள் RWA கண்காணிக்கும் குடிமை ரசீது புள்ளிவிவரங்களை பார்க்க ஒரு மாவட்டத்தை தேர்ந்தெடுக்கவும்.")}
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">{T("Select District...", "மாவட்டத்தை தேர்ந்தெடுக்கவும்...")}</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
            </select>
            {selectedDistrict && (
              <button onClick={() => setSelectedDistrict("")} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-3 py-2 border border-slate-200 rounded-xl">
                <X className="w-3 h-3" /> {T("Clear", "அழி")}
              </button>
            )}
          </div>
          {selectedDistrict && <AreaCivicStats districtSlug={selectedDistrict} />}
          {!selectedDistrict && (
            <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">{T("Select a district above to preview live civic data.", "நேரடி குடிமை தரவை பார்க்க மேலே ஒரு மாவட்டத்தை தேர்ந்தெடுக்கவும்.")}</p>
            </div>
          )}
        </div>

        {/* Features grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 text-center">
            {T("What Your Community Gets", "உங்கள் சமூகம் என்ன பெறும்")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">
            {T("Community Plans", "சமூக திட்டங்கள்")}
          </h2>
          <p className="text-sm text-slate-500 text-center mb-5">
            {T("Start free. Upgrade when your community is ready.", "இலவசமாக தொடங்குங்கள். உங்கள் சமூகம் தயாரானவுடன் மேம்படுத்தவும்.")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RWA_PLANS.map((plan) => <PlanCard key={plan.key} plan={plan} />)}
          </div>
        </div>

        {/* Registered groups */}
        {groups.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {T("Verified Community Groups", "சரிபார்க்கப்பட்ட சமூக குழுக்கள்")} ({groups.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g) => (
                <div key={g.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    {g.logo_url ? (
                      <img src={g.logo_url} alt={g.group_name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{g.group_name}</p>
                        {g.is_verified && <Shield className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" title="Verified RWA" />}
                      </div>
                      <p className="text-xs text-slate-500">{g.area_name || g.district_name}</p>
                      <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                        <span title="Members">👥 {g.member_count || 0}</span>
                        <span title="Issues">📋 {g.issue_count || 0}</span>
                        <span title="Resolved">✅ {g.resolved_count || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400">
                    RWA Partner · {g.group_type?.replace("_", " ")} · {g.plan} plan
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions notice */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">⚖️ {T("RWA Permission Rules", "RWA அனுமதி விதிகள்")}</h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>✓ RWA admin can view all public Civic Receipts in their area</li>
            <li>✓ RWA admin can create Civic Receipts on behalf of the community</li>
            <li>✓ RWA admin can add follow-up notes and complaint IDs</li>
            <li>✓ RWA admin can export and share area reports</li>
            <li>✗ RWA admin cannot hide or remove public Civic Receipts</li>
            <li>✗ RWA admin cannot change official civic status (admin-only)</li>
            <li>✗ RWA admin cannot access platform admin controls</li>
          </ul>
        </div>

        {/* Trust note */}
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
          <p className="text-sm font-bold text-green-800 dark:text-green-300 mb-1">
            {T("Privacy First. Data Stays With You.", "தனியுரிமை முதல். தரவு உங்களிடமே இருக்கும்.")}
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 max-w-md mx-auto">
            {T("NammaTN never sells community data. Reports are generated from public Civic Receipt data and do not include private user information.", "NammaTN சமூக தரவை விற்காது. அறிக்கைகள் பொது குடிமை ரசீது தரவிலிருந்து உருவாக்கப்படுகின்றன.")}
          </p>
        </div>
      </div>

      {showRegister && <RWARegisterModal plan={RWA_PLANS[0]} onClose={() => setShowRegister(false)} />}
    </div>
  );
}