import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ShieldAlert, HeartHandshake,
  CheckCircle, XCircle, Trash2, Shield, MapPin, Plus, Award, Edit2, Eye
} from "lucide-react";
import { DISTRICTS } from "@/lib/districts";
import { formatDistanceToNow, format } from "date-fns";
import StatusBadge from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  getAllScamsAdmin, updateScam, deleteScam,
  getAllEmergenciesAdmin, updateEmergency,
  getAllRecognitions, createRecognition, revokeRecognition,
  getAllAreasAdmin, createArea, updateArea, deleteArea,
} from "@/services/admin/phase8";

const SECTIONS = [
  { key: "scams", label: "Scam Alerts", icon: ShieldAlert },
  { key: "emergency", label: "Emergency", icon: HeartHandshake },
  { key: "recognitions", label: "Recognitions", icon: Award },
  { key: "areas", label: "Areas", icon: MapPin },
];

function ActionBtn({ color, icon: Icon, label, onClick }) {
  const colors = {
    green: "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20",
    red: "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
    blue: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    orange: "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20",
  };
  return (
    <button onClick={onClick} title={label} className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}



// ─── Scams Panel ──────────────────────────────────────────────
function ScamsPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editItem, setEditItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", scam_type: "other", warning_level: "medium", district_slug: "", is_anonymous: true });

  const { data: scams = [], isLoading } = useQuery({ queryKey: ["admin-scams"], queryFn: () => getAllScamsAdmin(200), staleTime: 0 });
  const filtered = statusFilter === "all" ? scams : scams.filter(s => s.status === statusFilter);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-scams"] });

  const handleCreate = async (e) => {
    e.preventDefault();
    const d = DISTRICTS.find(d => d.slug === form.district_slug);
    await base44.entities.ScamAlert.create({ ...form, district_name: d?.name_en || "", status: "active" });
    invalidate(); setShowCreate(false);
    setForm({ title: "", description: "", scam_type: "other", warning_level: "medium", district_slug: "", is_anonymous: true });
    toast({ description: "Scam alert created." });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await updateScam(editItem.id, editItem);
    invalidate(); setEditItem(null); toast({ description: "Scam updated." });
  };

  if (isLoading) return <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {["all","pending","active","removed"].map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>{s}</button>)}
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" /> Add Scam Alert</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-sm">Create Scam Alert</h3>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title *" required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none resize-none" />
          <div className="grid grid-cols-3 gap-3">
            <select value={form.scam_type} onChange={e => setForm(f => ({ ...f, scam_type: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              {["fake_agent","fake_job","fraud_call","online_scam","fake_document","local_cheating","other"].map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
            </select>
            <select value={form.warning_level} onChange={e => setForm(f => ({ ...f, warning_level: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              {["low","medium","high","critical"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={form.district_slug} onChange={e => setForm(f => ({ ...f, district_slug: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="">All TN</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-slate-100 dark:border-slate-700">
            {["Title","Type","Level","District","Status","Date","Actions"].map(c => <th key={c} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-400">No scams found</td></tr>
              : filtered.map(s => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-4 text-sm text-slate-900 dark:text-white max-w-[160px] truncate">{s.title}</td>
                <td className="py-3 px-4 text-xs text-slate-500">{s.scam_type?.replace(/_/g," ")}</td>
                <td className="py-3 px-4 text-xs font-medium text-orange-600">{s.warning_level}</td>
                <td className="py-3 px-4 text-xs text-slate-500">{s.district_name || "All TN"}</td>
                <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                <td className="py-3 px-4 text-xs text-slate-400">{s.created_date ? formatDistanceToNow(new Date(s.created_date), { addSuffix: true }) : ""}</td>
                <td className="py-3 px-4"><div className="flex gap-1">
                  <ActionBtn color="blue" icon={Edit2} label="Edit" onClick={() => setEditItem({ ...s })} />
                  {s.status === "pending" && <ActionBtn color="green" icon={CheckCircle} label="Approve" onClick={() => updateScam(s.id, { status: "active" }).then(invalidate)} />}
                  {!s.is_verified && s.status === "active" && <ActionBtn color="blue" icon={Shield} label="Verify" onClick={() => updateScam(s.id, { is_verified: true }).then(invalidate)} />}
                  <ActionBtn color="red" icon={Trash2} label="Delete" onClick={() => deleteScam(s.id).then(() => { invalidate(); toast({ description: "Scam deleted." }); })} />
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Edit Scam Alert</DialogTitle></DialogHeader>
          {editItem && <form onSubmit={handleEdit} className="space-y-3">
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Title</label><Input value={editItem.title} onChange={e => setEditItem(i => ({ ...i, title: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Description</label><textarea value={editItem.description || ""} onChange={e => setEditItem(i => ({ ...i, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-slate-600 block mb-1">Status</label>
                <select value={editItem.status} onChange={e => setEditItem(i => ({ ...i, status: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none">
                  {["pending","active","removed"].map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
              <div><label className="text-xs font-medium text-slate-600 block mb-1">Warning Level</label>
                <select value={editItem.warning_level} onChange={e => setEditItem(i => ({ ...i, warning_level: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none">
                  {["low","medium","high","critical"].map(l => <option key={l} value={l}>{l}</option>)}
                </select></div>
            </div>
            <div className="flex gap-2"><Button type="submit" size="sm">Save</Button><Button type="button" variant="outline" size="sm" onClick={() => setEditItem(null)}>Cancel</Button></div>
          </form>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Emergency Panel ──────────────────────────────────────────
function EmergencyPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewItem, setViewItem] = useState(null);

  const { data: emergencies = [], isLoading } = useQuery({ queryKey: ["admin-emergency"], queryFn: () => getAllEmergenciesAdmin(200), staleTime: 0 });
  const filtered = statusFilter === "all" ? emergencies : emergencies.filter(e => e.status === statusFilter);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-emergency"] });

  if (isLoading) return <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all","active","resolved","removed"].map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>{s}</button>)}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-slate-100 dark:border-slate-700">
            {["Title","Type","Urgency","District","Verified","Status","Actions"].map(c => <th key={c} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-400">No emergencies found</td></tr>
              : filtered.map(e => (
              <tr key={e.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-4 text-sm text-slate-900 dark:text-white max-w-[150px] truncate">{e.title}</td>
                <td className="py-3 px-4 text-xs text-slate-500">{e.emergency_type?.replace(/_/g," ")}</td>
                <td className="py-3 px-4 text-xs font-medium text-red-600">{e.urgency}</td>
                <td className="py-3 px-4 text-xs text-slate-500">{e.district_name}</td>
                <td className="py-3 px-4 text-xs">{e.is_verified ? "✓" : "—"}</td>
                <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                <td className="py-3 px-4"><div className="flex gap-1">
                  <ActionBtn color="blue" icon={Eye} label="View" onClick={() => setViewItem(e)} />
                  {!e.is_verified && <ActionBtn color="blue" icon={Shield} label="Verify" onClick={() => updateEmergency(e.id, { is_verified: true }).then(invalidate)} />}
                  {e.status === "active" && <ActionBtn color="green" icon={CheckCircle} label="Resolve" onClick={() => updateEmergency(e.id, { status: "resolved", is_resolved: true }).then(invalidate)} />}
                  <ActionBtn color="red" icon={XCircle} label="Remove" onClick={() => updateEmergency(e.id, { status: "removed" }).then(invalidate)} />
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Emergency Detail</DialogTitle></DialogHeader>
          {viewItem && <div className="space-y-3 text-sm">
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={viewItem.status} />
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{viewItem.urgency}</span>
              {viewItem.is_verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
            </div>
            <p className="font-bold text-slate-900">{viewItem.title}</p>
            <p className="text-slate-600 whitespace-pre-wrap">{viewItem.description}</p>
            {viewItem.contact_info && <p className="text-xs text-slate-500">Contact: {viewItem.contact_info}</p>}
            <p className="text-xs text-slate-400">📍 {viewItem.district_name} {viewItem.area_name && `· ${viewItem.area_name}`}</p>
            <p className="text-xs text-slate-400">{viewItem.created_date ? format(new Date(viewItem.created_date), "dd MMM yyyy, h:mm a") : ""}</p>
            <div className="flex gap-2 pt-2">
              {!viewItem.is_verified && <Button size="sm" variant="outline" onClick={() => { updateEmergency(viewItem.id, { is_verified: true }).then(invalidate); setViewItem(v => ({ ...v, is_verified: true })); }}>✓ Verify</Button>}
              {viewItem.status === "active" && <Button size="sm" variant="outline" onClick={() => { updateEmergency(viewItem.id, { status: "resolved", is_resolved: true }).then(invalidate); setViewItem(null); }}>Resolve</Button>}
              <Button size="sm" variant="destructive" onClick={() => { updateEmergency(viewItem.id, { status: "removed" }).then(invalidate); setViewItem(null); }}>Remove</Button>
            </div>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}




// ─── Recognitions Panel ───────────────────────────────────────
function RecognitionsPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ session_ref: "", recognition_type: "helpful_community_member", district_slug: "", notes: "", expires_at: "", granted_by_admin: "admin" });

  const { data: recognitions = [] } = useQuery({ queryKey: ["admin-recognitions"], queryFn: getAllRecognitions, staleTime: 0 });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-recognitions"] });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.session_ref || !form.expires_at) return;
    await createRecognition({ ...form, is_active: true });
    invalidate(); setShowForm(false);
    setForm({ session_ref: "", recognition_type: "helpful_community_member", district_slug: "", notes: "", expires_at: "", granted_by_admin: "admin" });
    toast({ description: "Recognition granted." });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Community Recognitions</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" /> Grant</button>
      </div>
      <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
        ⚠ Recognition is internal and admin-controlled. Do not display as public rankings or scores.
      </p>
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <input value={form.session_ref} onChange={e => setForm(f => ({ ...f, session_ref: e.target.value }))} placeholder="Session Reference (internal ID) *" required className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          <select value={form.recognition_type} onChange={e => setForm(f => ({ ...f, recognition_type: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
            <option value="helpful_community_member">Helpful Community Member</option>
            <option value="verified_local_source">Verified Local Update Source</option>
            <option value="emergency_helper">Emergency Helper</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.district_slug} onChange={e => setForm(f => ({ ...f, district_slug: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="">District (optional)</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
            </select>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} required className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          </div>
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Grant Recognition</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-slate-100 dark:border-slate-700">
            {["Session Ref","Type","District","Expires","Active","Actions"].map(c => <th key={c} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>)}
          </tr></thead>
          <tbody>
            {recognitions.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-400">No recognitions</td></tr>
              : recognitions.map(r => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 font-mono">{r.session_ref?.substring(0, 14)}...</td>
                <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{r.recognition_type?.replace(/_/g," ")}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{r.district_slug || "—"}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{r.expires_at}</td>
                <td className="py-3 px-4 text-xs">{r.is_active ? <span className="text-green-600">✓ Active</span> : <span className="text-slate-400">Revoked</span>}</td>
                <td className="py-3 px-4">
                  {r.is_active && <ActionBtn color="red" icon={XCircle} label="Revoke" onClick={() => revokeRecognition(r.id).then(() => { invalidate(); toast({ description: "Recognition revoked." }); })} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Areas Panel ──────────────────────────────────────────────
function AreasPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [districtFilter, setDistrictFilter] = useState("");
  const [form, setForm] = useState({ district_slug: "", name_en: "", name_ta: "", slug: "", zone: "", description: "" });

  const { data: areas = [] } = useQuery({ queryKey: ["admin-areas"], queryFn: getAllAreasAdmin, staleTime: 0 });
  const filtered = districtFilter ? areas.filter(a => a.district_slug === districtFilter) : areas;
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-areas"] });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name_en || !form.district_slug || !form.slug) return;
    const d = DISTRICTS.find(d => d.slug === form.district_slug);
    await createArea({ ...form, district_name: d?.name_en || "", active: true });
    invalidate(); setShowCreate(false);
    setForm({ district_slug: "", name_en: "", name_ta: "", slug: "", zone: "", description: "" });
    toast({ description: "Area created." });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const d = DISTRICTS.find(d => d.slug === editItem.district_slug);
    await updateArea(editItem.id, { ...editItem, district_name: d?.name_en || editItem.district_name });
    invalidate(); setEditItem(null); toast({ description: "Area updated." });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 focus:outline-none">
          <option value="">All Districts ({areas.length} areas)</option>
          {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
        </select>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" /> Add Area</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 grid grid-cols-2 gap-3">
          <select value={form.district_slug} onChange={e => setForm(f => ({ ...f, district_slug: e.target.value }))} required className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 col-span-2 focus:outline-none">
            <option value="">Select District *</option>
            {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
          </select>
          <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} placeholder="Name (English) *" required className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          <input value={form.name_ta} onChange={e => setForm(f => ({ ...f, name_ta: e.target.value }))} placeholder="Name (Tamil)" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="Slug (e.g. anna-nagar) *" required className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          <input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} placeholder="Zone/Taluk (optional)" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" />
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Create Area</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-slate-100 dark:border-slate-700">
            {["Name (EN)","Name (TA)","District","Zone","Slug","Actions"].map(c => <th key={c} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>)}
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-400">No areas found.</td></tr>
              : filtered.map(a => (
              <tr key={a.id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-medium">{a.name_en}</td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{a.name_ta || "—"}</td>
                <td className="py-3 px-4 text-xs text-slate-500">{a.district_name}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{a.zone || "—"}</td>
                <td className="py-3 px-4 text-xs font-mono text-slate-400">{a.slug}</td>
                <td className="py-3 px-4"><div className="flex gap-1">
                  <ActionBtn color="blue" icon={Edit2} label="Edit" onClick={() => setEditItem({ ...a })} />
                  <ActionBtn color="red" icon={Trash2} label="Delete" onClick={() => deleteArea(a.id).then(() => { invalidate(); toast({ description: "Area deleted." }); })} />
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Edit Area</DialogTitle></DialogHeader>
          {editItem && <form onSubmit={handleEdit} className="space-y-3">
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Name (English)</label><Input value={editItem.name_en} onChange={e => setEditItem(i => ({ ...i, name_en: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Name (Tamil)</label><Input value={editItem.name_ta || ""} onChange={e => setEditItem(i => ({ ...i, name_ta: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">Zone/Taluk</label><Input value={editItem.zone || ""} onChange={e => setEditItem(i => ({ ...i, zone: e.target.value }))} /></div>
            <div><label className="text-xs font-medium text-slate-600 block mb-1">District</label>
              <select value={editItem.district_slug} onChange={e => setEditItem(i => ({ ...i, district_slug: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none">
                {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
              </select></div>
            <div className="flex gap-2"><Button type="submit" size="sm">Save</Button><Button type="button" variant="outline" size="sm" onClick={() => setEditItem(null)}>Cancel</Button></div>
          </form>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AdminPhase8() {
  const [section, setSection] = useState("scams");

  const { data: scams = [] } = useQuery({ queryKey: ["admin-scams"], queryFn: () => getAllScamsAdmin(200), staleTime: 30000 });
  const { data: emergencies = [] } = useQuery({ queryKey: ["admin-emergency"], queryFn: () => getAllEmergenciesAdmin(200), staleTime: 30000 });
  const { data: recognitions = [] } = useQuery({ queryKey: ["admin-recognitions"], queryFn: getAllRecognitions, staleTime: 30000 });
  const { data: areas = [] } = useQuery({ queryKey: ["admin-areas"], queryFn: getAllAreasAdmin, staleTime: 30000 });

  const countMap = { scams: scams.length, emergency: emergencies.length, recognitions: recognitions.length, areas: areas.length };
  const pendingMap = {
    scams: scams.filter(s => s.status === "pending").length,
    emergency: emergencies.filter(e => !e.is_verified && e.status === "active").length,
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Operations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Scam alerts, emergency incidents, recognitions, and areas</p>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setSection(key)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${section === key ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300"}`}>
            <Icon className="w-4 h-4" /> {label}
            {(pendingMap[key] > 0) && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">{pendingMap[key]}</span>
            )}
            {!pendingMap[key] && countMap[key] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${section === key ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}>{countMap[key]}</span>
            )}
          </button>
        ))}
      </div>

      {section === "scams" && <ScamsPanel />}
      {section === "emergency" && <EmergencyPanel />}
      {section === "recognitions" && <RecognitionsPanel />}
      {section === "areas" && <AreasPanel />}
    </div>
  );
}