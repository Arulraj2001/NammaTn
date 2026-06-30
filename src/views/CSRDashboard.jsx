import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Leaf, BarChart3, Shield, ExternalLink, Plus, AlertTriangle, CheckCircle, Users, FileText, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import SponsorRegisterModal from "@/components/sponsors/SponsorRegisterModal";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { Navigate } from "@/lib/router-compat";
import { getSettingsMap } from "@/services/admin/settings";

const CAMPAIGN_TYPES = [
  { key: "clean_street", icon: "🧹", label: "Clean Street Awareness", allowed: true },
  { key: "garbage_hotspot", icon: "🗑️", label: "Garbage Hotspot Documentation", allowed: true },
  { key: "streetlight_mapping", icon: "💡", label: "Streetlight Safety Mapping", allowed: true },
  { key: "school_zone", icon: "🏫", label: "School Zone Awareness", allowed: true },
  { key: "flood_documentation", icon: "🌊", label: "Flood-Prone Area Documentation", allowed: true },
  { key: "awareness", icon: "📢", label: "Public Safety Awareness", allowed: true },
  { key: "scam_awareness", icon: "🚨", label: "Scam Awareness Campaign", allowed: true },
  { key: "volunteer_support", icon: "🤝", label: "Volunteer Support Campaign", allowed: true },
  { key: "dustbin_support", icon: "♻️", label: "Dustbin Placement (with permission)", allowed: true },
];

const NOT_ALLOWED = [
  "Road or drainage repairs without permission",
  "Electrical infrastructure repairs",
  "Government-only public works",
  "Political promotions or endorsements",
  "Misleading 'we fixed it' claims for government issues",
  "Fake before/after impact photos",
  "Sponsored content without clear label",
];

const CSR_FEATURES = [
  { icon: "📊", title: "Sponsored Area Reports", desc: "Get data-backed civic transparency reports for your sponsored areas." },
  { icon: "📸", title: "Before/After Proof", desc: "Document real civic impact with verified before-and-after photos." },
  { icon: "👥", title: "Community Engagement Stats", desc: "See citizen reach, verifications, and community responses." },
  { icon: "📄", title: "Monthly Impact Summary", desc: "Auto-generated monthly report for your CSR records." },
  { icon: "🌐", title: "Public Sponsor Profile", desc: "A verified public profile showing your supported campaign history." },
  { icon: "✅", title: "Admin-Verified Impact Claims", desc: "All impact claims reviewed by VizhiTN admin before publishing." },
  { icon: "💬", title: "Citizen Feedback Visibility", desc: "See real community feedback on your supported campaigns." },
  { icon: "📥", title: "Downloadable Reports", desc: "Download public impact reports for CSR documentation." },
];

// ─── Sponsor Card ─────────────────────────────────────────────────────────────
function SponsorCard({ s }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const campaignMeta = CAMPAIGN_TYPES.find(c => c.key === s.campaign_type);

  return (
    <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
      <div className="flex items-start gap-3 mb-3">
        {s.sponsor_logo_url ? (
          <img src={s.sponsor_logo_url} alt={s.sponsor_name} className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1 bg-white" />
        ) : (
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{s.sponsor_name}</p>
            {s.is_verified && <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" title="Verified by VizhiTN" />}
          </div>
          {s.campaign_title && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{s.campaign_title}</p>}
          <p className="text-xs text-slate-500 mt-0.5">{s.area_name ? `${s.area_name}, ` : ""}{s.district_name}</p>
        </div>
      </div>

      {/* Sponsor label — must always be visible */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700 rounded-lg px-2.5 py-1.5 mb-3">
        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
          🏷️ {T("Sponsored civic transparency support", "நிதியுதவி பெற்ற குடிமை வெளிப்படைத்தன்மை ஆதரவு")}
          {campaignMeta && ` · ${campaignMeta.icon} ${campaignMeta.label}`}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {T("Sponsorship does not affect Civic Receipt status or citizen verification.", "நிதியுதவி குடிமை ரசீது நிலை அல்லது சரிபார்ப்பை பாதிக்காது.")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
        <div>
          <p className="font-bold text-slate-800 dark:text-white">{s.issues_supported_count || 0}</p>
          <p className="text-slate-400">{T("Issues Documented", "சிக்கல்கள்")}</p>
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-white">{s.community_reach || 0}</p>
          <p className="text-slate-400">{T("Community Reach", "சமூக எட்டல்")}</p>
        </div>
        <div>
          <p className="font-bold text-emerald-600">
            {s.status === "active" ? "✓ Active" : s.status === "completed" ? "✔ Done" : "⏳"}
          </p>
          <p className="text-slate-400">{T("Status", "நிலை")}</p>
        </div>
      </div>

      {s.sponsor_note && (
        <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2 mb-3">
          "{s.sponsor_note}"
        </p>
      )}

      {/* Before/After if available */}
      {(s.before_photo_urls?.length > 0 || s.after_photo_urls?.length > 0) && (
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {s.before_photo_urls?.[0] && (
            <div className="relative">
              <img src={s.before_photo_urls[0]} alt="Before" className="w-full h-16 object-cover rounded-lg" />
              <span className="absolute bottom-1 left-1 text-[9px] bg-red-600 text-white px-1 py-0.5 rounded font-bold">BEFORE</span>
            </div>
          )}
          {s.after_photo_urls?.[0] && (
            <div className="relative">
              <img src={s.after_photo_urls[0]} alt="After" className="w-full h-16 object-cover rounded-lg" />
              <span className="absolute bottom-1 left-1 text-[9px] bg-green-600 text-white px-1 py-0.5 rounded font-bold">AFTER</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        <span className="text-[10px] text-slate-400">
          {T("Supported community action — not government work", "சமூக செயலை ஆதரித்தது — அரசு பணி அல்ல")}
        </span>
        {s.sponsor_website && (
          <a href={s.sponsor_website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CSRDashboard() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSettingsMap,
    staleTime: 60_000,
  });

  if (settings.csr_enabled === "false") {
    return <Navigate to="/" replace />;
  }

  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const [showRegister, setShowRegister] = useState(false);
  const [showNotAllowed, setShowNotAllowed] = useState(false);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      requireAuth(() => setShowRegister(true), T("Sign in to register as sponsor", "நிதியளிப்பாளராக பதிவு செய்ய உள்நுழையுங்கள்"));
      return;
    }
    setShowRegister(true);
  };

  const { data: sponsors = [] } = useQuery({
    queryKey: ["active-sponsors-public"],
    queryFn: () => base44.entities.CivicSponsor.filter({ status: "active", is_verified: true }, "-created_date", 30),
    staleTime: 5 * 60_000,
  });

  // Only show truly active approved sponsors with explicit campaign title
  const displaySponsors = sponsors.filter(s => s.is_active && s.is_verified);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {T("CSR Civic Impact Dashboard", "CSR குடிமை தாக்க கட்டுப்பாட்டு மையம்")}
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto leading-relaxed mb-5">
            {T("Support transparent civic awareness and documentation. Get verified impact data, community feedback, and public recognition for your CSR work in Tamil Nadu.", "வெளிப்படையான குடிமை விழிப்புணர்வையும் ஆவணப்படுத்தலையும் ஆதரியுங்கள். சரிபார்க்கப்பட்ட தாக்க தரவும் சமூக அங்கீகாரமும் பெறுங்கள்.")}
          </p>
          <button onClick={handleRegisterClick}
            className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-all shadow-lg">
            {T("Register as CSR Sponsor", "CSR நிதியளிப்பாளராக பதிவு செய்யுங்கள்")}
          </button>
        </div>
      </div>

      {/* Trust disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800 py-3 px-4">
        <p className="text-xs text-amber-700 dark:text-amber-400 text-center max-w-3xl mx-auto">
          <strong>{T("CSR Integrity Policy:", "CSR ஒழுக்கத்திட்டம்:")}</strong>{" "}
          {T("CSR dashboards show supported civic transparency and awareness efforts. Sponsors cannot change Civic Receipt status or citizen verification. Sponsored support is clearly labeled.", "CSR கட்டுப்பாட்டு மையங்கள் ஆதரிக்கப்பட்ட குடிமை வெளிப்படைத்தன்மை முயற்சிகளை காட்டுகின்றன. நிதியளிப்பாளர்கள் குடிமை ரசீது நிலையை மாற்ற முடியாது.")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Active Sponsors */}
        {displaySponsors.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {T("Active Civic Sponsors", "செயலில் உள்ள குடிமை நிதியளிப்பாளர்கள்")} ({displaySponsors.length})
              </h2>
              <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Admin-Verified
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displaySponsors.map(s => <SponsorCard key={s.id} s={s} />)}
            </div>
          </div>
        )}

        {/* Campaign types */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">
            {T("Eligible CSR Campaign Types", "தகுதியான CSR பிரச்சார வகைகள்")}
          </h2>
          <p className="text-xs text-slate-500 text-center mb-4">
            {T("Only community-safe, publicly visible, and legally permissible campaigns are accepted.", "சமூக-பாதுகாப்பான, பொதுவில் தெரியும், சட்டரீதியாக அனுமதிக்கப்பட்ட பிரச்சாரங்கள் மட்டுமே ஏற்றுக்கொள்ளப்படும்.")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {CAMPAIGN_TYPES.map((c) => (
              <div key={c.key} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1.5">{c.icon}</div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.label}</p>
                <span className="text-[10px] text-green-600 font-medium">✓ Allowed</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowNotAllowed(v => !v)}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:underline mx-auto">
            <AlertTriangle className="w-3.5 h-3.5" />
            {showNotAllowed ? T("Hide not-allowed list", "தகுதியற்ற பட்டியலை மறை") : T("What is NOT allowed?", "என்ன அனுமதிக்கப்படவில்லை?")}
          </button>
          {showNotAllowed && (
            <div className="mt-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">🚫 {T("Not Allowed in CSR Campaigns:", "CSR பிரச்சாரங்களில் அனுமதிக்கப்படாதவை:")}</h4>
              <ul className="space-y-1">
                {NOT_ALLOWED.map(item => (
                  <li key={item} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                    <span className="flex-shrink-0">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 text-center">
            {T("What Sponsors Get", "நிதியளிப்பாளர்கள் என்ன பெறுவார்கள்")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CSR_FEATURES.map((f) => (
              <div key={f.title} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="text-xl mb-2">{f.icon}</div>
                <p className="text-xs font-bold text-slate-800 dark:text-white mb-1">{f.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What sponsor can/cannot do */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">✓ {T("Sponsors Can:", "நிதியளிப்பாளர்கள் செய்யலாம்:")}</h4>
            <ul className="space-y-1 text-xs text-green-700 dark:text-green-400">
              <li>• Support area civic transparency dashboard</li>
              <li>• Support monthly proof reports</li>
              <li>• Run awareness and documentation campaigns</li>
              <li>• View aggregated civic impact reports</li>
              <li>• Share public sponsor profile</li>
              <li>• Download public reports for CSR records</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-2">✗ {T("Sponsors Cannot:", "நிதியளிப்பாளர்கள் செய்யக்கூடாது:")}</h4>
            <ul className="space-y-1 text-xs text-red-700 dark:text-red-400">
              <li>• Hide negative or unresolved civic issues</li>
              <li>• Remove or suppress citizen complaints</li>
              <li>• Change Civic Receipt status or proof</li>
              <li>• Manipulate issue rankings or visibility</li>
              <li>• Edit community verification numbers</li>
              <li>• Claim government issues were "solved"</li>
            </ul>
          </div>
        </div>

        {/* Wording note */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">{T("Correct Wording for Sponsor Contributions", "நிதியளிப்பாளர் பங்களிப்புக்கான சரியான வார்த்தைகள்")}</p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {T("We say:", "நாங்கள் சொல்வது:")} <em>"Supported community action for this issue"</em> or <em>"Supported civic awareness/proof campaign."</em>
              <br />
              {T("We never say:", "நாங்கள் சொல்வதில்லை:")} <em>"Sponsor solved this issue."</em>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">{T("Ready to Support Tamil Nadu's Civic Transparency?", "தமிழ்நாட்டின் குடிமை வெளிப்படைத்தன்மையை ஆதரிக்க தயாரா?")}</h3>
          <p className="text-emerald-100 text-sm mb-4 max-w-lg mx-auto">
            {T("Your CSR investment reaches verified civic issues and creates documented public impact. All campaigns are admin-reviewed before going public.", "உங்கள் CSR முதலீடு சரிபார்க்கப்பட்ட குடிமை சிக்கல்களை அடைகிறது மற்றும் ஆவணப்படுத்தப்பட்ட பொது தாக்கத்தை உருவாக்குகிறது.")}
          </p>
          <button onClick={handleRegisterClick}
            className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50">
            {T("Get Started", "தொடங்குங்கள்")}
          </button>
        </div>
      </div>

      {showRegister && <SponsorRegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}