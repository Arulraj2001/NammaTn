import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  RefreshCw, CheckCircle, XCircle, Star, Leaf,
  AlertTriangle, Shield, PauseCircle, FileText, Search, RotateCcw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "@/lib/router-compat";
import {
  saveAdSenseConfig,
  getAdSenseConfig,
  getLocalCustomAds,
  saveLocalCustomAds
} from "@/services/adService";

const TABS = ["sponsors", "adsense"];

const PLAN_COLORS = {
  free: "text-slate-500 bg-slate-100",
  verified: "text-blue-600 bg-blue-50",
  featured: "text-amber-600 bg-amber-50",
  district_sponsor: "text-purple-600 bg-purple-50",
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-600",
  suspended: "bg-orange-100 text-orange-600",
  removed: "bg-red-100 text-red-600",
  completed: "bg-teal-100 text-teal-700",
};

export default function AdminMonetization() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sponsors");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminNotes, setAdminNotes] = useState({});

  // ── AdSense settings (persisted in DB & localStorage) ─────────────────────────
  const [adsense, setAdsense] = useState(() => {
    try {
      const saved = localStorage.getItem('VizhiTN_adsense_config');
      return saved ? JSON.parse(saved) : {
        pub_id: '',
        slot_banner: '',
        slot_sidebar: '',
        slot_infeed: '',
        enabled: false,
      };
    } catch { return { pub_id: '', slot_banner: '', slot_sidebar: '', slot_infeed: '', enabled: false }; }
  });
  const [adsenseSaved, setAdsenseSaved] = useState(false);

  useEffect(() => {
    getAdSenseConfig().then(cfg => {
      if (cfg) setAdsense(cfg);
    });
  }, []);

  const saveAdsense = async () => {
    try {
      await saveAdSenseConfig(adsense);
      setAdsenseSaved(true);
      toast({ description: '✅ AdSense settings saved & synchronized with database.' });
      setTimeout(() => setAdsenseSaved(false), 3000);
    } catch (e) {
      toast({ description: '❌ Failed to save AdSense settings.' });
    }
  };

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: sponsors = [], isLoading: loadS } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: () => base44.entities.CivicSponsor.list("-created_date", 200),
    staleTime: 0,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
  };

  // ── Mutations ───────────────────────────────────────────────────────────────
  const updateSponsor = async (id, data, msg) => {
    await base44.entities.CivicSponsor.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    toast({ description: msg });
  };

  const saveNote = async (type, id, note) => {
    if (!note?.trim()) return;
    await base44.entities.CivicSponsor.update(id, { admin_note: note.trim() });
    setAdminNotes(n => ({ ...n, [id]: "" }));
    toast({ description: "Admin note saved." });
    refresh();
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    sponsors: {
      total: sponsors.length,
      pending: sponsors.filter(s => s.status === "pending").length,
      active: sponsors.filter(s => s.status === "active").length,
      suspended: sponsors.filter(s => s.status === "suspended").length,
    },
  }), [sponsors]);

  // ── Filtered data ───────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredSponsors = useMemo(() => sponsors.filter(s => {
    const matchSearch = !q || s.sponsor_name?.toLowerCase().includes(q) || s.district_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  }), [sponsors, q, statusFilter]);

  // ── Common filters bar ──────────────────────────────────────────────────────
  const FiltersBar = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, district..."
          className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 focus:outline-none" />
      </div>
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800">
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="rejected">Rejected</option>
        <option value="removed">Removed</option>
      </select>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Monetization Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Manage sponsors and AdSense settings</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-slate-200 dark:border-slate-700 pb-3 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "sponsors", label: "Civic Sponsors",  icon: Leaf, count: stats.sponsors.pending },
            { key: "adsense",  label: "AdSense Settings", icon: Star, count: null },
          ].map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => { setActiveTab(key); setSearch(""); setStatusFilter("all"); }}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === key ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
              <Icon className="w-4 h-4" /> {label}
              {count > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>}
            </button>
          ))}
        </div>

        <Link
          to="/admin/ads"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-2xs transition-colors"
        >
          📢 Go to Ad Management (/admin/ads) →
        </Link>
      </div>

      {/* ── SPONSORS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "sponsors" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.sponsors.total, cls: "bg-emerald-50 border-emerald-100 text-emerald-600" },
              { label: "Pending", value: stats.sponsors.pending, cls: "bg-yellow-50 border-yellow-100 text-yellow-600" },
              { label: "Active", value: stats.sponsors.active, cls: "bg-green-50 border-green-100 text-green-600" },
              { label: "Suspended", value: stats.sponsors.suspended, cls: "bg-orange-50 border-orange-100 text-orange-600" },
            ].map(s => (
              <div key={s.label} className={`p-3 rounded-xl text-center border ${s.cls}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400">
            <strong>Approval workflow:</strong> Approve → activates sponsor. Verify → grants verified badge (admin has checked credentials). Suspend → removes from public immediately. Sponsors appear publicly only when status=active AND is_active=true AND is_verified=true.
          </div>
          <FiltersBar />
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Sponsor", "Type", "Plan", "Campaign", "District/Area", "Budget", "Status", "Actions"].map(c => (
                    <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadS ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-400">Loading...</td></tr>
                ) : filteredSponsors.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-400">No sponsors found.</td></tr>
                ) : filteredSponsors.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{s.sponsor_name}</p>
                      {s.contact_email && <p className="text-xs text-slate-400">{s.contact_email}</p>}
                      {s.is_verified && <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>}
                      {s.admin_note && <p className="text-xs text-amber-600 italic mt-0.5 max-w-[140px] truncate" title={s.admin_note}>📝 {s.admin_note}</p>}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 capitalize">{s.sponsor_type}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[s.plan] || "bg-slate-100 text-slate-600"}`}>{s.plan}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-300 max-w-[140px]">
                      <p className="truncate">{s.campaign_title || "—"}</p>
                      <p className="text-slate-400">{s.campaign_type?.replace("_", " ") || ""}</p>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500">{s.area_name ? `${s.area_name}, ` : ""}{s.district_name}</td>
                    <td className="py-2.5 px-3 text-xs font-mono text-slate-600 dark:text-slate-300">{s.budget_inr ? `₹${s.budget_inr.toLocaleString()}` : "—"}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || STATUS_COLORS.pending}`}>{s.status}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => updateSponsor(s.id, { status: "active", is_active: true }, "Sponsor activated (pending verification).")} title="Approve (activate)" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateSponsor(s.id, { is_verified: true }, "Verified badge granted.")} title="Grant Verified badge" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Shield className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateSponsor(s.id, { status: "completed", is_active: false }, "Campaign marked completed.")} title="Complete campaign" className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><FileText className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateSponsor(s.id, { status: "suspended", is_active: false, is_verified: false }, "Sponsor suspended.")} title="Suspend" className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg"><PauseCircle className="w-3.5 h-3.5" /></button>
                        {(s.status === "suspended" || s.status === "rejected") && <button onClick={() => updateSponsor(s.id, { status: "active", is_active: true }, "Sponsor restored.")} title="Restore" className="p-1.5 text-teal-500 hover:bg-teal-50 rounded-lg"><RotateCcw className="w-3.5 h-3.5" /></button>}
                        <button onClick={() => updateSponsor(s.id, { status: "rejected", is_active: false }, "Sponsor rejected.")} title="Reject" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <input value={adminNotes[s.id] || ""} onChange={e => setAdminNotes(n => ({ ...n, [s.id]: e.target.value }))}
                          placeholder="Admin note..." className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 w-28 focus:outline-none" />
                        <button onClick={() => saveNote("sponsor", s.id, adminNotes[s.id])} disabled={!adminNotes[s.id]?.trim()}
                          className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-40">💾</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ AdSense Settings Tab ══════════════════════════════════════════════ */}
      {activeTab === 'adsense' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Google AdSense Settings</h2>
                <p className="text-blue-100 text-sm">Configure your AdSense publisher ID and ad unit slots</p>
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className={`rounded-2xl border-2 p-4 flex items-start gap-3 ${adsense.pub_id && adsense.pub_id !== 'ca-pub-PLACEHOLDER' ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' : 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800'}`}>
            {adsense.pub_id && adsense.pub_id !== 'ca-pub-PLACEHOLDER'
              ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              : <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-sm font-semibold ${adsense.pub_id && adsense.pub_id !== 'ca-pub-PLACEHOLDER' ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}`}>
                {adsense.pub_id && adsense.pub_id !== 'ca-pub-PLACEHOLDER'
                  ? `✅ AdSense active: ${adsense.pub_id}`
                  : '⚠️ AdSense not configured — ads will not show'
                }
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {adsense.pub_id && adsense.pub_id !== 'ca-pub-PLACEHOLDER'
                  ? 'Your ads are live. Make sure ads.txt is updated on your server.'
                  : 'Enter your Publisher ID below to activate Google AdSense ads.'
                }
              </p>
            </div>
          </div>

          {/* Publisher ID */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">AdSense Verification & Account Setup</h3>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                Google AdSense Publisher ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adsense.pub_id}
                  onChange={e => setAdsense(a => ({ ...a, pub_id: e.target.value.trim() }))}
                  placeholder="ca-pub-1234567890123456"
                  className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Find this in your <a href="https://adsense.google.com/start" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AdSense Console</a> → <strong>Account</strong> → <strong>Settings</strong> → <strong>Account info</strong> → <strong>Publisher ID</strong>.
              </p>

              {/* Real-time validation indicator */}
              {adsense.pub_id && (
                <div className="mt-2.5">
                  {(adsense.pub_id.match(/\d{16}/) || [])[0] ? (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>
                        Valid 16-digit publisher ID detected: <strong>ca-pub-{(adsense.pub_id.match(/\d{16}/) || [])[0]}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        Waiting for full 16 digits. Example: <code>ca-pub-1234567890123456</code>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsense.enabled}
                  onChange={e => setAdsense(a => ({ ...a, enabled: e.target.checked }))}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Google AdSense across the site</span>
              </label>
            </div>
          </div>

          {/* Ad Slot IDs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Ad Unit Slot IDs (Optional for Auto Ads)</h3>
            <p className="text-xs text-slate-500">If using manual ad units instead of Google Auto Ads, enter the slot IDs generated in AdSense → Ads → By ad unit.</p>

            {[
              { key: 'slot_banner',  label: 'Banner Ad (728×90 / Responsive)', desc: 'Shown between news cards and header sections', placeholder: '1234567890' },
              { key: 'slot_sidebar', label: 'Sidebar Ad (300×250 / 300×600)',   desc: 'Shown in desktop right-hand column',         placeholder: '0987654321' },
              { key: 'slot_infeed',  label: 'In-Feed Ad (Native Fluid)',        desc: 'Shown natively inside infinite feed streams', placeholder: '1122334455' },
            ].map(({ key, label, desc, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">{label}</label>
                <input
                  type="text"
                  value={adsense[key]}
                  onChange={e => setAdsense(a => ({ ...a, [key]: e.target.value.trim() }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={saveAdsense}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${adsenseSaved ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {adsenseSaved ? <><CheckCircle className="w-5 h-5" /> AdSense Settings & ads.txt Synchronized!</> : <><Star className="w-5 h-5" /> Save AdSense Settings & Update ads.txt</>}
          </button>
        </div>
      )}
    </div>
  );
}