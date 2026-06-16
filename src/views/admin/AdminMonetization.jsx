import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  RefreshCw, CheckCircle, XCircle, Eye, Star, Building2, Leaf, BadgeCheck,
  AlertTriangle, Shield, Ban, RotateCcw, PauseCircle, FileText, Search, Filter
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { getCategoryMeta } from "@/lib/listingCategories";

const TABS = ["listings", "sponsors", "rwa"];

const PLAN_COLORS = {
  free: "text-slate-500 bg-slate-100",
  verified: "text-blue-600 bg-blue-50",
  featured: "text-amber-600 bg-amber-50",
  district_sponsor: "text-purple-600 bg-purple-50",
  free_community: "text-slate-500 bg-slate-100",
  rwa_basic: "text-blue-600 bg-blue-50",
  rwa_pro: "text-indigo-600 bg-indigo-50",
  csr_basic: "text-emerald-600 bg-emerald-50",
  csr_partner: "text-teal-600 bg-teal-50",
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
  const [activeTab, setActiveTab] = useState("listings");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminNotes, setAdminNotes] = useState({});

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: listings = [], isLoading: loadL } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: () => base44.entities.LocalListing.list("-created_date", 300),
    staleTime: 0,
  });
  const { data: sponsors = [], isLoading: loadS } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: () => base44.entities.CivicSponsor.list("-created_date", 200),
    staleTime: 0,
  });
  const { data: rwaGroups = [], isLoading: loadR } = useQuery({
    queryKey: ["admin-rwa"],
    queryFn: () => base44.entities.RWAGroup.list("-created_date", 200),
    staleTime: 0,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
    qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    qc.invalidateQueries({ queryKey: ["admin-rwa"] });
  };

  // ── Mutations ───────────────────────────────────────────────────────────────
  const updateListing = async (id, data, msg) => {
    await base44.entities.LocalListing.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
    toast({ description: msg });
  };
  const updateSponsor = async (id, data, msg) => {
    await base44.entities.CivicSponsor.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    toast({ description: msg });
  };
  const updateRWA = async (id, data, msg) => {
    await base44.entities.RWAGroup.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-rwa"] });
    toast({ description: msg });
  };
  const saveNote = async (type, id, note) => {
    if (!note?.trim()) return;
    if (type === "listing") await base44.entities.LocalListing.update(id, { admin_note: note.trim() });
    else if (type === "sponsor") await base44.entities.CivicSponsor.update(id, { admin_note: note.trim() });
    else await base44.entities.RWAGroup.update(id, { admin_note: note.trim() });
    setAdminNotes(n => ({ ...n, [id]: "" }));
    toast({ description: "Admin note saved." });
    refresh();
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    listings: {
      total: listings.length,
      pending: listings.filter(l => l.status === "pending").length,
      active: listings.filter(l => l.status === "active").length,
      verified: listings.filter(l => l.is_verified).length,
      featured: listings.filter(l => l.is_featured).length,
      sponsored: listings.filter(l => l.is_sponsored).length,
    },
    sponsors: {
      total: sponsors.length,
      pending: sponsors.filter(s => s.status === "pending").length,
      active: sponsors.filter(s => s.status === "active").length,
      suspended: sponsors.filter(s => s.status === "suspended").length,
    },
    rwa: {
      total: rwaGroups.length,
      pending: rwaGroups.filter(r => r.status === "pending").length,
      active: rwaGroups.filter(r => r.status === "active").length,
      suspended: rwaGroups.filter(r => r.status === "suspended").length,
    },
  }), [listings, sponsors, rwaGroups]);

  // ── Filtered data ───────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredListings = useMemo(() => listings.filter(l => {
    const matchSearch = !q || l.business_name?.toLowerCase().includes(q) || l.district_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  }), [listings, q, statusFilter]);

  const filteredSponsors = useMemo(() => sponsors.filter(s => {
    const matchSearch = !q || s.sponsor_name?.toLowerCase().includes(q) || s.district_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  }), [sponsors, q, statusFilter]);

  const filteredRWA = useMemo(() => rwaGroups.filter(r => {
    const matchSearch = !q || r.group_name?.toLowerCase().includes(q) || r.district_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }), [rwaGroups, q, statusFilter]);

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
          <p className="text-sm text-slate-500 mt-1">Manage listings, sponsors, RWA groups, and CSR campaigns</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-slate-200 dark:border-slate-700 pb-3 flex-wrap">
        {[
          { key: "listings", label: "Local Listings", icon: BadgeCheck, count: stats.listings.pending },
          { key: "sponsors", label: "Sponsors / CSR", icon: Leaf, count: stats.sponsors.pending },
          { key: "rwa", label: "RWA Groups", icon: Building2, count: stats.rwa.pending },
        ].map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => { setActiveTab(key); setSearch(""); setStatusFilter("all"); }}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === key ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
            <Icon className="w-4 h-4" /> {label}
            {count > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>}
          </button>
        ))}
      </div>

      {/* ── LISTINGS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: "Total", value: stats.listings.total, cls: "bg-blue-50 border-blue-100 text-blue-600" },
              { label: "Pending", value: stats.listings.pending, cls: "bg-yellow-50 border-yellow-100 text-yellow-600" },
              { label: "Active", value: stats.listings.active, cls: "bg-green-50 border-green-100 text-green-600" },
              { label: "Verified ✓", value: stats.listings.verified, cls: "bg-indigo-50 border-indigo-100 text-indigo-600" },
              { label: "Featured ⭐", value: stats.listings.featured, cls: "bg-amber-50 border-amber-100 text-amber-600" },
              { label: "Sponsored 💼", value: stats.listings.sponsored, cls: "bg-purple-50 border-purple-100 text-purple-600" },
            ].map(s => (
              <div key={s.label} className={`p-3 rounded-xl text-center border ${s.cls}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
            <strong>Badge Rules:</strong> Verified = admin reviewed content (trust label). Featured = highlighted placement. Sponsored = paid placement. These are separate actions — approve first, then grant badges as appropriate.
          </div>
          <FiltersBar />
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Business", "Category", "Plan", "District", "Status", "Badges", "Date", "Actions"].map(c => (
                    <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadL ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-400">Loading...</td></tr>
                ) : filteredListings.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-400">No listings found.</td></tr>
                ) : filteredListings.map(l => {
                  const cat = getCategoryMeta(l.category);
                  return (
                    <tr key={l.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-2.5 px-3">
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{l.business_name}</p>
                        {l.district_name && <p className="text-xs text-slate-500 font-semibold">{l.district_name}</p>}
                        
                        <div className="text-[11px] text-slate-400 mt-1 space-y-0.5 border-t border-slate-100 dark:border-slate-700/50 pt-1">
                          <p><span className="font-semibold text-slate-600 dark:text-slate-300">Public Phone:</span> {l.contact_phone || "—"}</p>
                          {(l.admin_email || l.admin_phone) && (
                            <p className="text-blue-600 dark:text-blue-400">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">Admin/Billing:</span> {l.admin_email || "—"} / {l.admin_phone || "—"}
                            </p>
                          )}
                        </div>

                        {l.admin_note && <p className="text-xs text-amber-600 italic mt-1.5 max-w-[140px] truncate" title={l.admin_note}>📝 {l.admin_note}</p>}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">{cat.icon} {cat.label}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[l.plan] || PLAN_COLORS.free}`}>{l.plan}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">{l.district_name}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status] || STATUS_COLORS.pending}`}>{l.status}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs space-x-1">
                        {l.is_verified && <span className="text-blue-600 font-bold">✓V</span>}
                        {l.is_featured && <span className="text-amber-600 font-bold">⭐F</span>}
                        {l.is_sponsored && <span className="text-purple-600 font-bold">💼S</span>}
                        {!l.is_verified && !l.is_featured && !l.is_sponsored && <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-400 whitespace-nowrap">{l.created_date ? formatDistanceToNow(new Date(l.created_date), { addSuffix: true }) : ""}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex gap-1 flex-wrap">
                          <button onClick={() => updateListing(l.id, { status: "active" }, "Listing activated.")} title="Approve (activate listing)" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button onClick={() => updateListing(l.id, { is_verified: true }, "Verified badge granted (admin reviewed).")} title="Grant Verified badge" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><BadgeCheck className="w-3.5 h-3.5" /></button>
                          <button onClick={() => updateListing(l.id, { is_featured: true, status: "active" }, "Featured.")} title="Feature listing" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"><Star className="w-3.5 h-3.5" /></button>
                          <button onClick={() => updateListing(l.id, { is_sponsored: true, status: "active" }, "Marked Sponsored (paid).")} title="Mark Sponsored" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => updateListing(l.id, { status: "rejected", is_verified: false, is_featured: false, is_sponsored: false }, "Rejected.")} title="Reject" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                        </div>
                        {/* Plan selection for admin */}
                        <div className="mt-1 flex items-center gap-1">
                          <label className="text-[10px] text-slate-500 font-semibold">Plan:</label>
                          <select
                            value={l.plan || "free"}
                            onChange={(e) => updateListing(l.id, { plan: e.target.value }, `Plan updated to ${e.target.value}`)}
                            className="text-[11px] px-1 py-0.5 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-white focus:outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="verified">Verified</option>
                            <option value="featured">Featured</option>
                            <option value="district_sponsor">Sponsored</option>
                          </select>
                        </div>
                        {/* Admin note inline */}
                        <div className="flex gap-1 mt-1">
                          <input value={adminNotes[l.id] || ""} onChange={e => setAdminNotes(n => ({ ...n, [l.id]: e.target.value }))}
                            placeholder="Admin note..." className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 w-28 focus:outline-none" />
                          <button onClick={() => saveNote("listing", l.id, adminNotes[l.id])} disabled={!adminNotes[l.id]?.trim()}
                            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-40">💾</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* ── RWA TAB ──────────────────────────────────────────────────────────── */}
      {activeTab === "rwa" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.rwa.total, cls: "bg-purple-50 border-purple-100 text-purple-600" },
              { label: "Pending", value: stats.rwa.pending, cls: "bg-yellow-50 border-yellow-100 text-yellow-600" },
              { label: "Active", value: stats.rwa.active, cls: "bg-green-50 border-green-100 text-green-600" },
              { label: "Suspended", value: stats.rwa.suspended, cls: "bg-orange-50 border-orange-100 text-orange-600" },
            ].map(s => (
              <div key={s.label} className={`p-3 rounded-xl text-center border ${s.cls}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 rounded-xl p-3 text-xs text-purple-700 dark:text-purple-400">
            <strong>RWA controls:</strong> Approve → activates dashboard access. Verify → grants verified RWA badge. Suspend → revokes access immediately. Rejected RWAs are shown rejection note. RWAs cannot access admin controls or change Civic Receipt status.
          </div>
          <FiltersBar />
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Group Name", "Type", "Plan", "Location", "Email", "Status", "Verified", "Actions"].map(c => (
                    <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadR ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-400">Loading...</td></tr>
                ) : filteredRWA.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-slate-400">No RWA groups found.</td></tr>
                ) : filteredRWA.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-sm text-slate-800 dark:text-white">{r.group_name}</p>
                      {r.description && <p className="text-xs text-slate-400 max-w-[140px] truncate">{r.description}</p>}
                      {r.admin_note && <p className="text-xs text-amber-600 italic mt-0.5 max-w-[140px] truncate" title={r.admin_note}>📝 {r.admin_note}</p>}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 capitalize">{r.group_type?.replace("_", " ")}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[r.plan] || PLAN_COLORS.free}`}>{r.plan}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500">{r.area_name ? `${r.area_name}, ` : ""}{r.district_name}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-400">{r.admin_email}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || STATUS_COLORS.pending}`}>{r.status}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-center">
                      {r.is_verified ? <span className="text-blue-600 font-bold">✓ Yes</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => updateRWA(r.id, { status: "active", is_active: true }, "RWA approved.")} title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateRWA(r.id, { is_verified: true }, "Verified badge granted.")} title="Verify" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Shield className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateRWA(r.id, { status: "suspended", is_active: false, is_verified: false }, "RWA suspended.")} title="Suspend" className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg"><PauseCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateRWA(r.id, { status: "active", is_active: true }, "RWA restored.")} title="Restore" className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><RotateCcw className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateRWA(r.id, { status: "rejected", is_active: false }, "RWA rejected.")} title="Reject" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <input value={adminNotes[r.id] || ""} onChange={e => setAdminNotes(n => ({ ...n, [r.id]: e.target.value }))}
                          placeholder="Admin note..." className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 w-28 focus:outline-none" />
                        <button onClick={() => saveNote("rwa", r.id, adminNotes[r.id])} disabled={!adminNotes[r.id]?.trim()}
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
    </div>
  );
}