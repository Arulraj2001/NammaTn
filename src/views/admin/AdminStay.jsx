import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle, XCircle, Trash2, Shield, Eye, Archive, Star,
  Search, RefreshCw, MapPin, BarChart2, AlertTriangle, Clock, Flag
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { updateListing, deleteListing } from "@/services/stayListings";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DISTRICTS } from "@/lib/districts";

const TYPE_LABELS = {
  pg_available: "PG", shared_room: "Shared Room", roommate_needed: "Roommate",
  temporary_stay: "Temp Stay", hostel: "Hostel",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-slate-100 text-slate-500",
  removed: "bg-red-100 text-red-600",
  archived: "bg-slate-100 text-slate-500",
};

function StatusPill({ status }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// ─── Overview ─────────────────────────────────────────────────
function OverviewPanel({ listings, reports }) {
  const byDistrict = useMemo(() => {
    const map = {};
    listings.forEach(l => {
      const name = l.district_name || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [listings]);

  const stats = [
    { label: "Total Listings", value: listings.length, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active", value: listings.filter(l => l.status === "active").length, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Review", value: listings.filter(l => l.status === "pending").length, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Removed/Archived", value: listings.filter(l => l.status === "removed" || l.status === "archived").length, color: "text-red-600", bg: "bg-red-50" },
    { label: "Verified", value: listings.filter(l => l.is_verified).length, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Trusted", value: listings.filter(l => l.is_trusted).length, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Reports", value: reports.length, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Pending Reports", value: reports.filter(r => r.status === "pending").length, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" /> Top Districts
          </h3>
          <div className="space-y-2">
            {byDistrict.map(([district, count]) => (
              <div key={district} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 w-32 truncate">{district}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${listings.length ? (count / listings.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-5 text-right">{count}</span>
              </div>
            ))}
            {byDistrict.length === 0 && <p className="text-xs text-slate-400">No data yet.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-500" /> Listing Types
          </h3>
          <div className="space-y-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = listings.filter(l => l.listing_type === key).length;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-300 w-28 truncate">{label}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${listings.length ? (count / listings.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-500" /> Recent Listings
        </h3>
        <div className="space-y-2">
          {[...listings].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6).map(l => (
            <div key={l.id} className="flex items-center gap-2 text-xs">
              <StatusPill status={l.status} />
              <span className="font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">{l.title}</span>
              <span className="text-slate-400 flex-shrink-0">{l.district_name}</span>
              <span className="text-slate-400 flex-shrink-0">{l.created_date ? formatDistanceToNow(new Date(l.created_date), { addSuffix: true }) : ""}</span>
            </div>
          ))}
          {listings.length === 0 && <p className="text-xs text-slate-400">No listings yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Listings Panel ────────────────────────────────────────────
function ListingsPanel({ listings, isLoading, onRefresh }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState(null);

  const filtered = useMemo(() => {
    let r = listings;
    if (statusFilter !== "all") r = r.filter(l => l.status === statusFilter);
    if (districtFilter) r = r.filter(l => l.district_slug === districtFilter);
    if (typeFilter) r = r.filter(l => l.listing_type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.area_name?.toLowerCase().includes(q) ||
        l.district_name?.toLowerCase().includes(q) ||
        l.landmark?.toLowerCase().includes(q)
      );
    }
    return r;
  }, [listings, statusFilter, districtFilter, typeFilter, search]);

  const counts = {
    all: listings.length,
    pending: listings.filter(l => l.status === "pending").length,
    active: listings.filter(l => l.status === "active").length,
    archived: listings.filter(l => l.status === "archived").length,
    removed: listings.filter(l => l.status === "removed").length,
  };

  const doAction = async (id, data, msg) => {
    await updateListing(id, data);
    qc.invalidateQueries({ queryKey: ["admin-stay-listings"] });
    toast({ description: msg });
  };

  if (isLoading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>;

  return (
    <div>
      {/* Status filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[["all", "All"], ["pending", "Pending"], ["active", "Active"], ["archived", "Archived"], ["removed", "Removed"]].map(([k, label]) => (
          <button key={k} onClick={() => setStatusFilter(k)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${statusFilter === k ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
            {label} <span className="text-xs opacity-70">({counts[k] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, area, landmark..."
            className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 focus:outline-none" />
        </div>
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 focus:outline-none">
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 focus:outline-none">
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={onRefresh} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-3">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</p>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              {["Title", "Type", "District / Area", "Rent", "Status", "V", "Reports", "Views", "Date", "Actions"].map(c => (
                <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="py-10 text-center text-sm text-slate-400">No listings found.</td></tr>
            ) : filtered.map(l => (
              <tr key={l.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="py-3 px-3 max-w-[180px]">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{l.title}</p>
                  {l.landmark && <p className="text-xs text-slate-400 truncate">📍 {l.landmark}</p>}
                </td>
                <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">{TYPE_LABELS[l.listing_type] || l.listing_type}</td>
                <td className="py-3 px-3 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{l.district_name}</span>
                  {l.area_name && <span className="block text-slate-400">{l.area_name}</span>}
                </td>
                <td className="py-3 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {l.rent_amount ? `₹${Number(l.rent_amount).toLocaleString()}` : "—"}
                </td>
                <td className="py-3 px-3"><StatusPill status={l.status} /></td>
                <td className="py-3 px-3 text-center text-xs">{l.is_verified ? <span className="text-blue-600 font-bold">✓</span> : <span className="text-slate-300">—</span>}</td>
                <td className="py-3 px-3 text-xs text-center">{(l.report_count || 0) > 0 ? <span className="text-red-600 font-bold">{l.report_count}</span> : "0"}</td>
                <td className="py-3 px-3 text-xs text-slate-400 text-center">{l.view_count || 0}</td>
                <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">{l.created_date ? formatDistanceToNow(new Date(l.created_date), { addSuffix: true }) : ""}</td>
                <td className="py-3 px-3">
                  <div className="flex gap-1">
                    <button onClick={() => setViewItem(l)} title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                    {l.status === "pending" && <>
                      <button onClick={() => doAction(l.id, { status: "active" }, "Approved.")} title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /></button>
                      <button onClick={() => doAction(l.id, { status: "removed" }, "Rejected.")} title="Reject" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                    </>}
                    {l.status === "active" && <>
                      <button onClick={() => doAction(l.id, { is_verified: !l.is_verified }, l.is_verified ? "Unverified." : "Verified.")} title="Toggle Verify" className={`p-1.5 rounded-lg ${l.is_verified ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:bg-slate-100"}`}><Shield className="w-3.5 h-3.5" /></button>
                      <button onClick={() => doAction(l.id, { is_trusted: !l.is_trusted }, l.is_trusted ? "Trust removed." : "Trusted.")} title="Toggle Trust" className={`p-1.5 rounded-lg ${l.is_trusted ? "text-yellow-600 bg-yellow-50" : "text-slate-400 hover:bg-slate-100"}`}><Star className="w-3.5 h-3.5" /></button>
                      <button onClick={() => doAction(l.id, { status: "archived" }, "Archived.")} title="Archive" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Archive className="w-3.5 h-3.5" /></button>
                      <button onClick={() => doAction(l.id, { status: "removed" }, "Removed.")} title="Remove" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                    </>}
                    {(l.status === "removed" || l.status === "archived") && (
                      <button onClick={() => doAction(l.id, { status: "active" }, "Restored.")} title="Restore" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /></button>
                    )}
                    <button onClick={async () => { await deleteListing(l.id); qc.invalidateQueries({ queryKey: ["admin-stay-listings"] }); toast({ description: "Deleted." }); }} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Listing Detail</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 flex-wrap">
                <StatusPill status={viewItem.status} />
                {viewItem.is_verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
                {viewItem.is_trusted && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">★ Trusted</span>}
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{TYPE_LABELS[viewItem.listing_type]}</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{viewItem.title}</p>
              {viewItem.description && <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-xs">{viewItem.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div><span className="text-slate-400">District:</span> {viewItem.district_name}</div>
                <div><span className="text-slate-400">Area:</span> {viewItem.area_name || "—"}</div>
                <div><span className="text-slate-400">Rent:</span> {viewItem.rent_amount ? `₹${viewItem.rent_amount}/${viewItem.rent_period}` : "—"}</div>
                <div><span className="text-slate-400">Gender:</span> {viewItem.gender_preference}</div>
                <div><span className="text-slate-400">Occupancy:</span> {viewItem.occupancy_type}</div>
                <div><span className="text-slate-400">Reports:</span> <span className="text-red-600 font-bold">{viewItem.report_count || 0}</span></div>
                <div><span className="text-slate-400">Views:</span> {viewItem.view_count || 0}</div>
                <div><span className="text-slate-400">Expires:</span> {viewItem.expires_at || "—"}</div>
              </div>
              {(viewItem.phone || viewItem.whatsapp || viewItem.telegram) && (
                <div className="text-xs bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">🔒 Contact (Admin Only):</p>
                  {viewItem.phone && <p>📞 {viewItem.phone}</p>}
                  {viewItem.whatsapp && <p>💬 {viewItem.whatsapp}</p>}
                  {viewItem.telegram && <p>✈️ @{viewItem.telegram}</p>}
                </div>
              )}
              {viewItem.image_urls?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {viewItem.image_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-slate-200" loading="lazy" />
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2 flex-wrap">
                {viewItem.status === "pending" && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { doAction(viewItem.id, { status: "active" }, "Approved."); setViewItem(null); }}>✓ Approve</Button>}
                {viewItem.status === "active" && <Button size="sm" variant="outline" onClick={() => { doAction(viewItem.id, { is_verified: !viewItem.is_verified }, "Toggled."); setViewItem(v => ({ ...v, is_verified: !v.is_verified })); }}>{viewItem.is_verified ? "Unverify" : "✓ Verify"}</Button>}
                {(viewItem.status === "removed" || viewItem.status === "archived") && <Button size="sm" variant="outline" className="text-green-600 border-green-300" onClick={() => { doAction(viewItem.id, { status: "active" }, "Restored."); setViewItem(null); }}>↩ Restore</Button>}
                <Button size="sm" variant="destructive" onClick={() => { doAction(viewItem.id, { status: "removed" }, "Removed."); setViewItem(null); }}>Remove</Button>
                <Button size="sm" variant="outline" onClick={() => setViewItem(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Reports Panel ─────────────────────────────────────────────
function ReportsPanel({ reports, isLoading, onRefresh }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = statusFilter === "all" ? reports : reports.filter(r => r.status === statusFilter);

  const doUpdate = async (id, data, msg) => {
    await base44.entities.StayReport.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-stay-reports"] });
    toast({ description: msg });
  };

  const doDel = async (id) => {
    await base44.entities.StayReport.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-stay-reports"] });
    toast({ description: "Deleted." });
  };

  if (isLoading) return <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["all", "pending", "reviewed", "dismissed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize border transition-all ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
            {s} <span className="text-xs opacity-70">({s === "all" ? reports.length : reports.filter(r => r.status === s).length})</span>
          </button>
        ))}
        <button onClick={onRefresh} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 ml-auto" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-3">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</p>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              {["Listing ID", "Reason", "Details", "Reporter", "Status", "Date", "Actions"].map(c => (
                <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">No reports found.</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="py-3 px-3 text-xs font-mono text-slate-500">{r.listing_id?.slice(-8) || "—"}</td>
                <td className="py-3 px-3">
                  <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded capitalize">
                    {r.reason?.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-3 px-3 text-xs text-slate-500 max-w-[160px] truncate">{r.details || "—"}</td>
                <td className="py-3 px-3 text-xs text-slate-400 font-mono">{r.session_ref?.slice(-6) || "—"}</td>
                <td className="py-3 px-3"><StatusPill status={r.status} /></td>
                <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">{r.created_date ? formatDistanceToNow(new Date(r.created_date), { addSuffix: true }) : ""}</td>
                <td className="py-3 px-3">
                  <div className="flex gap-1">
                    {r.status === "pending" && <>
                      <button onClick={() => doUpdate(r.id, { status: "reviewed" }, "Reviewed.")} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Review</button>
                      <button onClick={() => doUpdate(r.id, { status: "dismissed" }, "Dismissed.")} className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 hover:bg-slate-50">Dismiss</button>
                    </>}
                    <button onClick={() => doDel(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────
export default function AdminStay() {
  const [activeTab, setActiveTab] = useState("listings");
  const qc = useQueryClient();

  const { data: listings = [], isLoading: loadingListings } = useQuery({
    queryKey: ["admin-stay-listings"],
    queryFn: () => base44.entities.StayListing.list("-created_date", 500),
    staleTime: 0,
    refetchInterval: 30000,
  });

  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ["admin-stay-reports"],
    queryFn: () => base44.entities.StayReport.list("-created_date", 300),
    staleTime: 0,
    refetchInterval: 30000,
  });

  const pendingListings = listings.filter(l => l.status === "pending").length;
  const pendingReports = reports.filter(r => r.status === "pending").length;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-stay-listings"] });
    qc.invalidateQueries({ queryKey: ["admin-stay-reports"] });
  };

  const TABS = [
    { id: "overview", label: "📊 Overview" },
    { id: "listings", label: "📋 Listings", badge: pendingListings, badgeColor: "bg-yellow-500" },
    { id: "reports", label: "🚨 Reports", badge: pendingReports, badgeColor: "bg-red-500" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stay & Rooms Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {listings.length} total · {pendingListings} pending approval · {pendingReports} pending reports
          </p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex-shrink-0">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {pendingListings > 0 && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-sm text-yellow-800 dark:text-yellow-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><strong>{pendingListings}</strong> listing{pendingListings > 1 ? "s" : ""} awaiting approval.</span>
          <button onClick={() => setActiveTab("listings")} className="ml-auto text-xs underline">Review →</button>
        </div>
      )}

      <div className="flex gap-0 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            {tab.label}
            {tab.badge > 0 && <span className={`${tab.badgeColor} text-white text-xs px-1.5 py-0.5 rounded-full font-bold`}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewPanel listings={listings} reports={reports} />}
      {activeTab === "listings" && <ListingsPanel listings={listings} isLoading={loadingListings} onRefresh={refresh} />}
      {activeTab === "reports" && <ReportsPanel reports={reports} isLoading={loadingReports} onRefresh={refresh} />}
    </div>
  );
}