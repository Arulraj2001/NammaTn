import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle, Trash2, Pin, Save, Archive, Lock, Unlock, Plus,
  Eye, EyeOff, Edit2, X, MessageSquare, Radio, Users, Send, AlertTriangle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { DISTRICTS } from "@/lib/districts";

const TABS = [
  { id: "donations", label: "💛 Donations" },
  { id: "live_rooms", label: "🔴 Live Rooms" },
  { id: "room_messages", label: "💬 Room Messages" },
  { id: "discussions", label: "🗨 Discussions" },
  { id: "chat", label: "📡 Live Chat" },
  { id: "donation_settings", label: "⚙️ Donation Settings" },
];

function StatusPill({ status }) {
  const map = {
    new: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    active: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    archived: "bg-slate-100 text-slate-500",
    locked: "bg-orange-100 text-orange-700",
    removed: "bg-red-100 text-red-600",
    spam: "bg-red-100 text-red-600",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || "bg-slate-100 text-slate-500"}`}>{status}</span>;
}

function Skeleton() {
  return <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>;
}

// ─── Donations Panel ──────────────────────────────────────────
function DonationsPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: () => base44.entities.DonationRecord.list("-created_date", 200),
  });

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);
  const total = items.filter(i => i.status === "confirmed").reduce((s, d) => s + (d.amount || 0), 0);

  const update = async (d, data) => {
    await base44.entities.DonationRecord.update(d.id, data);
    qc.invalidateQueries({ queryKey: ["admin-donations"] });
    qc.invalidateQueries({ queryKey: ["admin-donations-pending"] });
    toast({ description: `Donation ${data.status}.` });
  };

  const del = async (id) => {
    await base44.entities.DonationRecord.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-donations"] });
    toast({ description: "Donation record deleted." });
  };

  if (isLoading) return <Skeleton />;

  const counts = { all: items.length, pending: items.filter(i => i.status === "pending").length, confirmed: items.filter(i => i.status === "confirmed").length, rejected: items.filter(i => i.status === "rejected").length };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 p-3 col-span-2">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{total.toLocaleString()}</p>
          <p className="text-xs text-green-600">Total Confirmed Donations</p>
        </div>
        {[["pending", "Pending"], ["confirmed", "Confirmed"], ["rejected", "Rejected"]].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k === filter ? "all" : k)}
            className={`bg-white dark:bg-slate-800 rounded-xl border p-3 text-center transition-all ${filter === k ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200 dark:border-slate-700"}`}>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{counts[k]}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No donations found.</p>}
        {filtered.map(d => (
          <div key={d.id} className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 ${d.status === "pending" ? "border-yellow-300 dark:border-yellow-700" : "border-slate-200 dark:border-slate-700"}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <StatusPill status={d.status} />
                  <span className="text-xs text-slate-400">{d.created_date ? format(new Date(d.created_date), "dd MMM yyyy") : ""}</span>
                  {d.is_anonymous && <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">Anonymous</span>}
                </div>
                <p className="font-bold text-slate-900 dark:text-white">₹{d.amount} <span className="text-sm font-normal text-slate-500">via {d.payment_method?.toUpperCase()}</span></p>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  {d.transaction_ref && <p>Ref: <span className="font-mono text-slate-700 dark:text-slate-200">{d.transaction_ref}</span></p>}
                  {d.email && <p>Email: {d.email}</p>}
                  {d.message && <p className="italic text-slate-400">"{d.message}"</p>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 flex-wrap">
                {d.status === "pending" && (
                  <>
                    <button onClick={() => update(d, { status: "confirmed" })} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold">✓ Confirm</button>
                    <button onClick={() => update(d, { status: "rejected" })} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold">✗ Reject</button>
                  </>
                )}
                <button onClick={() => del(d.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Live Rooms Panel ─────────────────────────────────────────
function LiveRoomsPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [warningRoom, setWarningRoom] = useState(null);
  const [warningText, setWarningText] = useState("");
  const [sendingWarning, setSendingWarning] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", room_type: "community", district_slug: "", is_emergency: false });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["admin-live-rooms"],
    queryFn: () => base44.entities.LiveRoom.list("-created_date", 100),
    staleTime: 0,
  });

  const update = async (id, data) => {
    await base44.entities.LiveRoom.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-live-rooms"] });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    const district = DISTRICTS.find(d => d.slug === form.district_slug);
    await base44.entities.LiveRoom.create({ ...form, district_name: district?.name_en || "", status: "active", message_count: 0 });
    qc.invalidateQueries({ queryKey: ["admin-live-rooms"] });
    setShowCreate(false);
    setForm({ title: "", description: "", room_type: "community", district_slug: "", is_emergency: false });
    toast({ description: "Live room created." });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const district = DISTRICTS.find(d => d.slug === editRoom.district_slug);
    await update(editRoom.id, { title: editRoom.title, description: editRoom.description, pinned_notice: editRoom.pinned_notice, district_name: district?.name_en || editRoom.district_name });
    setEditRoom(null);
    toast({ description: "Room updated." });
  };

  const del = async (id) => {
    await base44.entities.LiveRoom.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-live-rooms"] });
    toast({ description: "Room deleted." });
  };

  const sendWarning = async () => {
    if (!warningText.trim() || !warningRoom) return;
    setSendingWarning(true);
    await base44.entities.LiveRoomMessage.create({
      room_id: warningRoom.id,
      content: warningText.trim(),
      message_type: "alert",
      author_session: "admin",
      author_label: "⚠️ Admin Warning",
      is_admin: true,
      is_pinned: true,
      status: "active",
    });
    // Also update room's pinned_notice
    await update(warningRoom.id, { pinned_notice: warningText.trim() });
    setSendingWarning(false);
    setWarningRoom(null);
    setWarningText("");
    toast({ description: "Warning sent to room." });
  };

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{rooms.length} rooms total</p>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Create Room
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Create Live Room</h3>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Room title *" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none" required />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.room_type} onChange={e => setForm(f => ({ ...f, room_type: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="community">Community</option>
              <option value="situation">Situation</option>
              <option value="emergency">Emergency</option>
              <option value="admin_created">Admin Created</option>
            </select>
            <select value={form.district_slug} onChange={e => setForm(f => ({ ...f, district_slug: e.target.value }))} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 focus:outline-none">
              <option value="">All Tamil Nadu</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.is_emergency} onChange={e => setForm(f => ({ ...f, is_emergency: e.target.checked }))} className="accent-red-500" /> Mark as Emergency
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {rooms.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No live rooms yet.</p>}
        {rooms.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <StatusPill status={r.status} />
                  {r.is_emergency && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">🚨 Emergency</span>}
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">{r.room_type}</span>
                  {r.district_name && <span className="text-xs text-slate-400">📍 {r.district_name}</span>}
                </div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{r.title}</p>
                {r.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>}
                <p className="text-xs text-slate-400 mt-0.5">{r.message_count || 0} messages · {r.created_date ? formatDistanceToNow(new Date(r.created_date), { addSuffix: true }) : ""}</p>
                {r.pinned_notice && <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mt-1">📌 {r.pinned_notice}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0 flex-wrap">
                <button onClick={() => setEditRoom({ ...r })} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                {(r.status === "active" || r.status === "locked") && (
                  <button onClick={() => { setWarningRoom(r); setWarningText(""); }} className="p-1.5 border border-orange-200 text-orange-500 rounded-lg hover:bg-orange-50" title="Send Warning"><AlertTriangle className="w-3.5 h-3.5" /></button>
                )}
                {r.status === "active" && (
                  <>
                    <button onClick={() => update(r.id, { status: "locked" })} className="p-1.5 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50" title="Lock"><Lock className="w-3.5 h-3.5" /></button>
                    <button onClick={() => update(r.id, { status: "archived" })} className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 rounded-lg hover:bg-slate-50" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
                  </>
                )}
                {r.status === "locked" && (
                  <button onClick={() => update(r.id, { status: "active" })} className="p-1.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50" title="Unlock"><Unlock className="w-3.5 h-3.5" /></button>
                )}
                {r.status === "archived" && (
                  <button onClick={() => update(r.id, { status: "active" })} className="p-1.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50" title="Unarchive"><Unlock className="w-3.5 h-3.5" /></button>
                )}
                <button onClick={() => del(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Dialog */}
      <Dialog open={!!warningRoom} onOpenChange={() => setWarningRoom(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>⚠️ Send Warning to Room</DialogTitle></DialogHeader>
          {warningRoom && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Room: <span className="font-semibold text-slate-700 dark:text-slate-200">{warningRoom.title}</span></p>
              <p className="text-xs text-slate-400">This will post a pinned admin warning message visible to all participants and update the room's pinned notice.</p>
              <textarea
                value={warningText}
                onChange={e => setWarningText(e.target.value)}
                placeholder="Type your warning message..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={sendWarning} disabled={!warningText.trim() || sendingWarning} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {sendingWarning ? "Sending..." : "Send Warning"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setWarningRoom(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editRoom} onOpenChange={() => setEditRoom(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Room</DialogTitle></DialogHeader>
          {editRoom && (
            <form onSubmit={handleEdit} className="space-y-3">
              <div><label className="text-xs font-medium text-slate-600 block mb-1">Title</label>
                <Input value={editRoom.title} onChange={e => setEditRoom(r => ({ ...r, title: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-slate-600 block mb-1">Description</label>
                <textarea value={editRoom.description || ""} onChange={e => setEditRoom(r => ({ ...r, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none" /></div>
              <div><label className="text-xs font-medium text-slate-600 block mb-1">Pinned Notice</label>
                <Input value={editRoom.pinned_notice || ""} onChange={e => setEditRoom(r => ({ ...r, pinned_notice: e.target.value }))} placeholder="Public notice shown to all participants" /></div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Changes</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditRoom(null)}>Cancel</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Room Messages Panel ──────────────────────────────────────
function RoomMessagesPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState("active");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-room-messages"],
    queryFn: () => base44.entities.LiveRoomMessage.list("-created_date", 200),
    staleTime: 0,
    refetchInterval: 15000,
  });

  const filtered = filterStatus === "all" ? messages : messages.filter(m => m.status === filterStatus);

  const update = async (id, data) => {
    await base44.entities.LiveRoomMessage.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-room-messages"] });
  };

  const del = async (id) => {
    await base44.entities.LiveRoomMessage.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-room-messages"] });
    toast({ description: "Message deleted." });
  };

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["all", "active", "removed", "spam"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize border transition-all ${filterStatus === s ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>{s}</button>
        ))}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} messages</span>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No messages found.</p>}
        {filtered.map(m => (
          <div key={m.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-3 flex items-start justify-between gap-3 ${m.status !== "active" ? "opacity-60 border-red-200" : "border-slate-200 dark:border-slate-700"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs text-slate-400 flex-wrap">
                <span className="font-medium text-slate-600 dark:text-slate-300">{m.author_label}</span>
                <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{m.message_type}</span>
                <StatusPill status={m.status} />
                {m.is_admin && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                {m.is_pinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">📌 Pinned</span>}
                <span>{m.created_date ? formatDistanceToNow(new Date(m.created_date), { addSuffix: true }) : ""}</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">{m.content}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {m.status === "active" && (
                <>
                  <button onClick={() => update(m.id, { is_pinned: !m.is_pinned })} className={`p-1.5 rounded-lg ${m.is_pinned ? "text-yellow-600 bg-yellow-50" : "text-slate-400 hover:bg-slate-100"}`} title="Toggle Pin"><Pin className="w-3.5 h-3.5" /></button>
                  <button onClick={() => update(m.id, { status: "spam" })} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg" title="Mark Spam"><EyeOff className="w-3.5 h-3.5" /></button>
                  <button onClick={() => update(m.id, { status: "removed" })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Remove"><X className="w-3.5 h-3.5" /></button>
                </>
              )}
              {m.status !== "active" && <button onClick={() => update(m.id, { status: "active" })} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Restore"><CheckCircle className="w-3.5 h-3.5" /></button>}
              <button onClick={() => del(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscussionRepliesList({ discussionId }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ["admin-discussion-replies", discussionId],
    queryFn: () => base44.entities.DiscussionReply.filter({ discussion_id: discussionId }, "-created_date", 100),
    enabled: !!discussionId,
  });

  const handleDelete = async (replyId) => {
    await base44.entities.DiscussionReply.delete(replyId);
    qc.invalidateQueries({ queryKey: ["admin-discussion-replies", discussionId] });
    qc.invalidateQueries({ queryKey: ["admin-discussions"] });
    toast({ description: "Reply deleted." });
  };

  const handleUpdateStatus = async (replyId, status) => {
    await base44.entities.DiscussionReply.update(replyId, { status });
    qc.invalidateQueries({ queryKey: ["admin-discussion-replies", discussionId] });
    toast({ description: `Reply status updated to ${status}.` });
  };

  if (isLoading) {
    return <div className="text-xs text-slate-400 animate-pulse py-2">Loading replies...</div>;
  }

  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Replies ({replies.length})</h4>
      {replies.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">No replies yet.</p>
      ) : (
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap text-[10px] text-slate-400">
                  <span className="font-bold text-slate-600 dark:text-slate-300">{reply.author_label || "Community Member"}</span>
                  <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{reply.reply_type}</span>
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${reply.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{reply.status}</span>
                  <span>{reply.created_date ? formatDistanceToNow(new Date(reply.created_date), { addSuffix: true }) : ""}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 break-words">{reply.content}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {reply.status === "active" ? (
                  <button onClick={() => handleUpdateStatus(reply.id, "removed")} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Hide/Remove"><EyeOff className="w-3.5 h-3.5" /></button>
                ) : (
                  <button onClick={() => handleUpdateStatus(reply.id, "active")} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Restore"><CheckCircle className="w-3.5 h-3.5" /></button>
                )}
                <button onClick={() => handleDelete(reply.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete Permanently"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Discussions Panel ────────────────────────────────────────
function DiscussionsPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewItem, setViewItem] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-discussions"],
    queryFn: () => base44.entities.CommunityDiscussion.list("-created_date", 200),
  });

  const filtered = statusFilter === "all" ? items : items.filter(d => d.status === statusFilter);

  const update = async (id, data) => {
    await base44.entities.CommunityDiscussion.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-discussions"] });
  };

  const del = async (id) => {
    await base44.entities.CommunityDiscussion.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-discussions"] });
    setViewItem(null);
    toast({ description: "Discussion deleted." });
  };

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["all", "active", "removed", "archived"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize border transition-all ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>{s}</button>
        ))}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} discussions</span>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">No discussions found.</p>}
        {filtered.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 px-2 py-0.5 rounded-full font-medium">{d.discussion_type}</span>
                  <span className="text-xs text-slate-400">{d.district_name || "All TN"}</span>
                  {d.is_pinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📌</span>}
                  {d.is_live && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🔴</span>}
                  {d.is_resolved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Resolved</span>}
                  <StatusPill status={d.status} />
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{d.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span>💬 {d.reply_count || 0}</span>
                  <span>👍 {d.helpful_count || 0}</span>
                  <span>✅ {d.confirm_count || 0}</span>
                  <span>{d.created_date ? formatDistanceToNow(new Date(d.created_date), { addSuffix: true }) : ""}</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setViewItem(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => update(d.id, { is_pinned: !d.is_pinned })} className={`p-1.5 rounded-lg ${d.is_pinned ? "text-yellow-600 bg-yellow-50" : "text-slate-400 hover:bg-slate-100"}`} title="Toggle Pin"><Pin className="w-3.5 h-3.5" /></button>
                <button onClick={() => update(d.id, { is_resolved: !d.is_resolved })} className={`p-1.5 rounded-lg ${d.is_resolved ? "text-green-600 bg-green-50" : "text-slate-400 hover:bg-slate-100"}`} title="Toggle Resolved"><CheckCircle className="w-3.5 h-3.5" /></button>
                {d.status !== "removed" ? (
                  <button onClick={() => update(d.id, { status: "removed" })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                ) : (
                  <button onClick={() => update(d.id, { status: "active" })} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg text-xs font-bold">↩</button>
                )}
                {d.status === "removed" && <button onClick={() => del(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Permanently"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Discussion Detail</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 flex-wrap">
                <StatusPill status={viewItem.status} />
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{viewItem.discussion_type}</span>
                <span className="text-xs text-slate-500">{viewItem.district_name || "All TN"}</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{viewItem.title}</p>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{viewItem.content}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["💬", "Replies", viewItem.reply_count], ["👍", "Helpful", viewItem.helpful_count], ["✅", "Confirmed", viewItem.confirm_count]].map(([icon, label, val]) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
                    <p className="font-bold text-slate-900 dark:text-white">{icon} {val || 0}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">By: {viewItem.author_label} · {viewItem.created_date ? format(new Date(viewItem.created_date), "dd MMM yyyy") : ""}</p>
              <DiscussionRepliesList discussionId={viewItem.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Live Chat Panel ──────────────────────────────────────────
function LiveChatPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-livechat"],
    queryFn: () => base44.entities.LiveChatMessage.list("-created_date", 200),
    refetchInterval: 15000,
  });

  const filtered = messages.filter(m => {
    const matchChannel = channelFilter === "all" || m.channel === channelFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchChannel && matchStatus;
  });

  const update = async (id, data) => {
    await base44.entities.LiveChatMessage.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-livechat"] });
  };

  const del = async (id) => {
    await base44.entities.LiveChatMessage.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-livechat"] });
    toast({ description: "Message deleted." });
  };

  const bulkClear = async () => {
    const removed = messages.filter(m => m.status === "removed");
    for (const m of removed) await base44.entities.LiveChatMessage.delete(m.id);
    qc.invalidateQueries({ queryKey: ["admin-livechat"] });
    toast({ description: `${removed.length} removed messages cleared.` });
  };

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {["all", "general", "nearby", "emergency", "questions", "alerts"].map(c => (
          <button key={c} onClick={() => setChannelFilter(c)} className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition-all ${channelFilter === c ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>#{c}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["all", "active", "removed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition-all ${statusFilter === s ? "bg-slate-700 text-white border-slate-700" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>{s}</button>
        ))}
        <span className="text-xs text-slate-400">{filtered.length} messages</span>
        <button onClick={bulkClear} className="ml-auto px-2.5 py-1 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50">Clear Removed</button>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">No messages found.</p>}
        {filtered.map(m => (
          <div key={m.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-3 flex items-start justify-between gap-3 ${m.status === "removed" ? "opacity-50 border-red-200" : "border-slate-200 dark:border-slate-700"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs text-slate-400 flex-wrap">
                <span className="font-medium text-slate-600 dark:text-slate-300">{m.author_label}</span>
                <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">#{m.channel}</span>
                <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{m.message_type}</span>
                {m.district_name && <span>📍 {m.district_name}</span>}
                <StatusPill status={m.status} />
                <span>{m.created_date ? formatDistanceToNow(new Date(m.created_date), { addSuffix: true }) : ""}</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 break-words">{m.content}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {m.status !== "removed" ? (
                <button onClick={() => update(m.id, { status: "removed" })} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Remove"><X className="w-3.5 h-3.5" /></button>
              ) : (
                <button onClick={() => update(m.id, { status: "active" })} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Restore"><CheckCircle className="w-3.5 h-3.5" /></button>
              )}
              <button onClick={() => del(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete Permanently"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Donation Settings Panel ──────────────────────────────────
const DEFAULT_SETTINGS_LIST = [];

function DonationSettingsPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});

  const { data: settings = DEFAULT_SETTINGS_LIST, isLoading } = useQuery({
    queryKey: ["admin-donation-settings"],
    queryFn: () => base44.entities.PaymentSettings.list("key", 50),
  });

  const FIELDS = [
    { key: "upi_id", label: "UPI ID", placeholder: "nammatn@upi", category: "upi" },
    { key: "upi_name", label: "UPI Display Name", placeholder: "NammaTN", category: "upi" },
    { key: "qr_image_url", label: "QR Code Image URL", placeholder: "https://...", category: "upi" },
    { key: "donation_message", label: "Donation Page Message", placeholder: "Your support keeps NammaTN free...", category: "general" },
    { key: "donation_enabled", label: "Donations Enabled (true/false)", placeholder: "true", category: "donation" },
    { key: "min_donation_amount", label: "Minimum Donation Amount (₹)", placeholder: "10", category: "donation" },
    { key: "buymecoffee_enabled", label: "Buy Me a Coffee Enabled (true/false)", placeholder: "false", category: "donation" },
    { key: "buymecoffee_link", label: "Buy Me a Coffee Link", placeholder: "https://buymeacoffee.com/...", category: "donation" },
    { key: "razorpay_enabled", label: "Razorpay Enabled (true/false)", placeholder: "false", category: "razorpay" },
    { key: "stripe_enabled", label: "Stripe Enabled (true/false)", placeholder: "false", category: "stripe" },
  ];

  React.useEffect(() => {
    if (settings && settings !== DEFAULT_SETTINGS_LIST) {
      const map = {};
      settings.forEach(s => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    for (const field of FIELDS) {
      if (values[field.key] === undefined) continue;
      const existing = settings.find(s => s.key === field.key);
      if (existing) await base44.entities.PaymentSettings.update(existing.id, { value: values[field.key] });
      else await base44.entities.PaymentSettings.create({ key: field.key, value: values[field.key], label: field.label, category: field.category, is_enabled: true });
    }
    qc.invalidateQueries({ queryKey: ["admin-donation-settings"] });
    setSaving(false);
    toast({ description: "Donation settings saved." });
  };

  if (isLoading) return <Skeleton />;

  const groups = [
    { title: "💱 UPI / QR Payment Details", keys: ["upi_id", "upi_name", "qr_image_url"] },
    { title: "💛 Donation Configuration", keys: ["donation_enabled", "donation_message", "min_donation_amount"] },
    { title: "☕ Buy Me a Coffee", keys: ["buymecoffee_enabled", "buymecoffee_link"] },
    { title: "💳 Online Payments (optional)", keys: ["razorpay_enabled", "stripe_enabled"] },
  ];

  return (
    <div className="space-y-5">
      {groups.map(group => (
        <div key={group.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">{group.title}</h3>
          <div className="space-y-3">
            {FIELDS.filter(f => group.keys.includes(f.key)).map(field => (
              <div key={field.key}>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">{field.label}</label>
                <input value={values[field.key] || ""} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))} placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Donation Settings"}
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState("donations");
  const { data: pendingDonations = [] } = useQuery({
    queryKey: ["admin-donations-pending"],
    queryFn: () => base44.entities.DonationRecord.filter({ status: "pending" }),
    refetchInterval: 30000,
  });
  const BADGES = { donations: pendingDonations.length };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Community & Donations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage live rooms, discussions, chat, and donations.</p>
      </div>
      <div className="flex gap-0 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            {tab.label}
            {BADGES[tab.id] > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{BADGES[tab.id]}</span>}
          </button>
        ))}
      </div>
      {activeTab === "donations" && <DonationsPanel />}
      {activeTab === "live_rooms" && <LiveRoomsPanel />}
      {activeTab === "room_messages" && <RoomMessagesPanel />}
      {activeTab === "discussions" && <DiscussionsPanel />}
      {activeTab === "chat" && <LiveChatPanel />}
      {activeTab === "donation_settings" && <DonationSettingsPanel />}
    </div>
  );
}