import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Eye, RefreshCw, CheckCircle, XCircle, AlertTriangle, Copy, Tag, MapPin, Building2, ListChecks, FileWarning, Camera } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CIVIC_STATUSES, makeTimelineEvent, getUrgency } from "@/lib/civicReceipt";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import { DEPARTMENT_ROUTES } from "@/lib/departmentRouting";

const MODERATION_STATUSES = ["all", "approved", "pending", "hidden"];
const SPECIAL_FILTERS = [
  { key: "all_special", label: "All" },
  { key: "missing_complaint", label: "No Complaint ID" },
  { key: "fixed_proof_pending", label: "Fixed Proof Pending" },
  { key: "disputed", label: "Disputed (Still Not Fixed)" },
  { key: "high_duplicates", label: "High Duplicates" },
];

export default function AdminCivicReceipts() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("receipts");
  const [statusFilter, setStatusFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("");
  const [civicStatusFilter, setCivicStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [specialFilter, setSpecialFilter] = useState("all_special");
  const [adminNote, setAdminNote] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-civic-receipts"],
    queryFn: () => base44.entities.Post.filter({ post_type: "complaint" }, "-created_date", 300),
    staleTime: 0,
  });

  const { data: complaintTrackers = [] } = useQuery({
    queryKey: ["admin-complaint-trackers"],
    queryFn: () => base44.entities.ComplaintTracker.list("-created_date", 100),
    staleTime: 0,
  });

  const { data: civicActions = [] } = useQuery({
    queryKey: ["admin-civic-actions"],
    queryFn: () => base44.entities.CivicAction.list("-created_date", 200),
    staleTime: 0,
    enabled: activeTab === "actions",
  });

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchMod = statusFilter === "all" || (p.moderation_status || "approved") === statusFilter;
      const matchDistrict = !districtFilter || p.district_slug === districtFilter;
      const matchCivic = civicStatusFilter === "all" || p.civic_status === civicStatusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || p.title_en?.toLowerCase().includes(q) || p.civic_receipt_id?.toLowerCase().includes(q) || p.district_name?.toLowerCase().includes(q);
      // Special filters
      let matchSpecial = true;
      if (specialFilter === "missing_complaint") matchSpecial = !p.official_complaint_id;
      if (specialFilter === "fixed_proof_pending") matchSpecial = p.civic_status === "claimed_fixed";
      if (specialFilter === "disputed") matchSpecial = (p.still_not_fixed_count || 0) > 0;
      if (specialFilter === "high_duplicates") matchSpecial = (p.duplicate_count || 0) >= 2;
      return matchMod && matchDistrict && matchCivic && matchSearch && matchSpecial;
    });
  }, [posts, statusFilter, districtFilter, civicStatusFilter, search, specialFilter]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-civic-receipts"] });

  const doUpdate = async (post, data, msg) => {
    const timeline = Array.isArray(post.timeline_events) ? post.timeline_events : [];
    const updData = { ...data };
    if (data.civic_status) {
      updData.timeline_events = [...timeline, makeTimelineEvent(`Admin changed status to: ${data.civic_status}`, "NammaTN234 Admin")];
    }
    await base44.entities.Post.update(post.id, updData);
    refresh();
    toast({ description: msg });
  };

  const stats = {
    total: posts.length,
    pending: posts.filter(p => (p.moderation_status || "approved") === "pending").length,
    verified: posts.filter(p => p.civic_status === "community_verified").length,
    fixed: posts.filter(p => p.civic_status === "citizen_verified_fixed").length,
    escalated: posts.filter(p => p.civic_status === "unresolved_escalated").length,
  };

  if (isLoading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {Array(6).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Civic Receipts</h1>
          <p className="text-sm text-slate-500 mt-1">Moderate civic issues, manage routing, review complaints</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto scrollbar-hide">
        {[
          { key: "receipts", label: "Civic Receipts", icon: ListChecks },
          { key: "actions", label: "Community Actions", icon: Eye },
          { key: "routing", label: "Department Routing", icon: Building2 },
          { key: "complaints", label: "Complaint Records", icon: Tag },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === key ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* === COMMUNITY ACTIONS TAB === */}
      {activeTab === "actions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{civicActions.length} community actions recorded</p>
            <p className="text-xs text-slate-400">Each row = one unique user action on a civic receipt</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Action Type", "Post ID", "Actor ID", "Authenticated", "Date"].map(c => (
                    <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {civicActions.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No community actions yet.</td></tr>
                ) : civicActions.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        a.action_type === "verify" ? "bg-blue-100 text-blue-700" :
                        a.action_type === "citizen_verified_fixed" ? "bg-green-100 text-green-700" :
                        a.action_type === "still_not_fixed" ? "bg-red-100 text-red-700" :
                        a.action_type === "duplicate" ? "bg-slate-100 text-slate-600" :
                        "bg-teal-100 text-teal-700"
                      }`}>{a.action_type}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-blue-600 dark:text-blue-400">{a.post_id?.slice(0,12)}…</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{a.actor_id?.slice(0,12)}…</td>
                    <td className="py-2.5 px-3 text-xs">
                      <span className={`px-1.5 py-0.5 rounded ${a.is_authenticated ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {a.is_authenticated ? "✓ Logged in" : "Guest"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 whitespace-nowrap">
                      {a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === DEPARTMENT ROUTING TAB === */}
      {activeTab === "routing" && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> These are the default routing rules built into NammaTN234. Custom rules can be added via the DepartmentRoute entity. The table below shows the current default routes per category.
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Category", "Department", "Office Type", "Phone", "Follow-up Days", "Escalation Days"].map(c => (
                    <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(DEPARTMENT_ROUTES).map(([key, r]) => (
                  <tr key={key} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-300">{r.category}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400 max-w-[200px]">{r.department}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-500">{r.office_type}</td>
                    <td className="py-2.5 px-3 text-xs font-mono text-green-600 dark:text-green-400">{r.phone || "—"}</td>
                    <td className="py-2.5 px-3 text-xs text-center text-yellow-600">{r.follow_up_days}d</td>
                    <td className="py-2.5 px-3 text-xs text-center text-red-500">{r.escalation_days}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === COMPLAINT RECORDS TAB === */}
      {activeTab === "complaints" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{complaintTrackers.length} complaint records submitted by citizens</p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {["Receipt ID", "Complaint ID", "Department", "Filed Date", "Notes", "Date Added"].map(c => (
                    <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaintTrackers.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">No complaint records yet.</td></tr>
                ) : complaintTrackers.map(ct => (
                  <tr key={ct.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3 font-mono text-xs text-blue-600 dark:text-blue-400">{ct.civic_receipt_id || "—"}</td>
                    <td className="py-2.5 px-3 font-mono text-xs font-bold text-slate-800 dark:text-white">{ct.official_complaint_id || "—"}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{ct.department_name || "—"}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-500">{ct.complaint_filed_date || "—"}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 max-w-[160px] truncate">{ct.notes || "—"}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 whitespace-nowrap">{ct.created_date ? formatDistanceToNow(new Date(ct.created_date), { addSuffix: true }) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === CIVIC RECEIPTS TAB === */}
      {activeTab === "receipts" && <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Total", value: stats.total, cls: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600" },
          { label: "Needs Review", value: stats.pending, cls: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800 text-yellow-600" },
          { label: "Community Verified", value: stats.verified, cls: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-600" },
          { label: "Citizen Fixed", value: stats.fixed, cls: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600" },
          { label: "Escalated", value: stats.escalated, cls: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600" },
        ].map(s => (
          <div key={s.label} className={`p-3 rounded-xl text-center border ${s.cls}`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Special Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SPECIAL_FILTERS.map(f => (
          <button key={f.key} onClick={() => setSpecialFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${specialFilter === f.key ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, ID, district..."
            className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 focus:outline-none" />
        </div>
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800">
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
        </select>
        <select value={civicStatusFilter} onChange={e => setCivicStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800">
          <option value="all">All Civic Status</option>
          {CIVIC_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800">
          {MODERATION_STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Moderation" : s}</option>)}
        </select>
      </div>

      <p className="text-xs text-slate-400 mb-3">{filtered.length} receipts</p>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              {["Receipt ID", "Title", "District", "Civic Status", "Urgency", "Verifications", "Date", "Actions"].map(c => (
                <th key={c} className="py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-sm text-slate-400">No civic receipts found.</td></tr>
            ) : filtered.map(p => {
              const urgency = getUrgency(p.urgency_level);
              return (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-3 px-3 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{p.civic_receipt_id || "—"}</td>
                  <td className="py-3 px-3 max-w-[180px]">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{p.title_en}</p>
                    {p.location_text && <p className="text-xs text-slate-400 truncate">📍 {p.location_text}</p>}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-500">{p.district_name}</td>
                  <td className="py-3 px-3"><CivicStatusBadge status={p.civic_status || "reported"} size="sm" /></td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${urgency.bg} ${urgency.color}`}>{urgency.label}</span>
                  </td>
                  <td className="py-3 px-3 text-xs text-center text-slate-600 dark:text-slate-300">{p.verification_count || 0}</td>
                  <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">{p.created_date ? formatDistanceToNow(new Date(p.created_date), { addSuffix: true }) : ""}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setPreview(p)} title="View" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => doUpdate(p, { moderation_status: "approved", status: "active" }, "Approved.")} title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /></button>
                      <button onClick={() => doUpdate(p, { moderation_status: "hidden", status: "removed" }, "Hidden.")} title="Hide" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5" /></button>
                      <button onClick={() => doUpdate(p, { civic_status: "duplicate_invalid" }, "Marked duplicate.")} title="Duplicate" className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      </>}

      {/* Detail Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{preview?.civic_receipt_id} — {preview?.title_en}</DialogTitle></DialogHeader>
          {preview && (
            <div className="space-y-4 text-sm">
              <CivicStatusBadge status={preview.civic_status || "reported"} />
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-xs">{preview.content_en}</p>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div><span className="text-slate-400">District:</span> {preview.district_name}</div>
                <div><span className="text-slate-400">Category:</span> {preview.category_name}</div>
                <div><span className="text-slate-400">Urgency:</span> {preview.urgency_level}</div>
                <div><span className="text-slate-400">Verifications:</span> {preview.verification_count || 0}</div>
                <div><span className="text-slate-400">Still Not Fixed:</span> {preview.still_not_fixed_count || 0}</div>
                <div><span className="text-slate-400">Complaint ID:</span> {preview.official_complaint_id || "—"}</div>
                {preview.location_text && <div className="col-span-2"><span className="text-slate-400">Location:</span> {preview.location_text}</div>}
              </div>

              {/* Evidence Photos */}
              {((preview.before_photos && preview.before_photos.length > 0) || 
                (preview.media_urls && preview.media_urls.length > 0) || 
                (preview.claimed_fixed_photos && preview.claimed_fixed_photos.length > 0) ||
                (preview.final_resolution_photos && preview.final_resolution_photos.length > 0)) && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 block">Evidence Photos:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before Photos */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Before:</span>
                      {(() => {
                        const beforeList = [...(preview.before_photos || []), ...(preview.media_urls || [])].filter(Boolean);
                        if (beforeList.length === 0) {
                          return <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">No before photos</div>;
                        }
                        return (
                          <div className="space-y-1">
                            {beforeList.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl bg-slate-100">
                                <img src={url} alt={`Before ${index + 1}`} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200" />
                              </a>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    {/* After Photos */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">After:</span>
                      {(() => {
                        const afterList = [...(preview.claimed_fixed_photos || []), ...(preview.final_resolution_photos || [])].filter(Boolean);
                        if (afterList.length === 0) {
                          return <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">No after photos</div>;
                        }
                        return (
                          <div className="space-y-1">
                            {afterList.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl bg-slate-100">
                                <img src={url} alt={`After ${index + 1}`} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200" />
                              </a>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Change civic status */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Change Civic Status:</label>
                <select
                  defaultValue={preview.civic_status || "reported"}
                  onChange={e => doUpdate(preview, { civic_status: e.target.value }, `Status changed to ${e.target.value}.`)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800"
                >
                  {CIVIC_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>

              {/* Change category */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Change Category:</label>
                <select
                  defaultValue={preview.category_slug}
                  onChange={e => {
                    const cat = CATEGORIES.find(c => c.slug === e.target.value);
                    doUpdate(preview, { category_slug: e.target.value, category_name: cat?.name_en || "" }, "Category updated.");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800"
                >
                  {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name_en}</option>)}
                </select>
              </div>

              {/* Change district */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Change District:</label>
                <select
                  defaultValue={preview.district_slug}
                  onChange={e => {
                    const dist = DISTRICTS.find(d => d.slug === e.target.value);
                    doUpdate(preview, { district_slug: e.target.value, district_name: dist?.name_en || "" }, "District updated.");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800"
                >
                  {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
                </select>
              </div>

              {/* Admin note */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Admin Note (internal):</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Internal note for admin team..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs bg-white dark:bg-slate-800 focus:outline-none resize-none"
                />
                {adminNote.trim() && (
                  <button onClick={() => { doUpdate(preview, { admin_note: adminNote.trim() }, `Admin note added.`); setAdminNote(""); }}
                    className="mt-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium">
                    Save Note
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap pt-2">
                <button onClick={() => { doUpdate(preview, { moderation_status: "approved", status: "active" }, "Approved."); setPreview(null); }} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                {preview?.civic_status === "claimed_fixed" && (
                  <button onClick={() => { doUpdate(preview, { civic_status: "citizen_verified_fixed" }, "Fixed proof approved by admin."); setPreview(null); }}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> Approve Fixed Proof
                  </button>
                )}
                {preview?.civic_status === "claimed_fixed" && (
                  <button onClick={() => { doUpdate(preview, { civic_status: "under_followup" }, "Fixed claim rejected — back to follow-up."); setPreview(null); }}
                    className="px-3 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium flex items-center gap-1.5">
                    <FileWarning className="w-3.5 h-3.5" /> Reject Fixed Claim
                  </button>
                )}
                <button onClick={() => { doUpdate(preview, { civic_status: "duplicate_invalid" }, "Marked duplicate."); setPreview(null); }} className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-medium flex items-center gap-1.5 text-slate-600"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
                <button onClick={() => { doUpdate(preview, { moderation_status: "hidden", status: "removed" }, "Hidden."); setPreview(null); }} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Hide</button>
                <button onClick={() => { doUpdate(preview, { moderation_status: "approved", status: "active" }, "Restored."); setPreview(null); }} className="px-3 py-2 border border-green-300 text-green-600 hover:bg-green-50 rounded-xl text-xs font-medium flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Restore</button>
                <button onClick={() => { doUpdate(preview, { civic_status: "unresolved_escalated" }, "Escalated."); setPreview(null); }} className="px-3 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Escalate</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}