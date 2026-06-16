import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Mail, Eye, Archive, Reply, Trash2, Search, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  read: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  replied: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-slate-100 text-slate-400",
};

const TOPIC_LABELS = {
  general: "General Feedback",
  content_report: "Content Report",
  support: "Support Request",
  advertising: "Advertising",
  other: "Other",
};

export default function AdminContacts() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: () => base44.entities.ContactMessage.list("-created_date", 200),
    staleTime: 0,
  });

  const filtered = messages.filter((m) => {
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || (m.name || "").toLowerCase().includes(q) || (m.email || "").toLowerCase().includes(q) || (m.subject || "").toLowerCase().includes(q) || (m.message || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: messages.length,
    new: messages.filter(m => m.status === "new").length,
    read: messages.filter(m => m.status === "read").length,
    replied: messages.filter(m => m.status === "replied").length,
    archived: messages.filter(m => m.status === "archived").length,
  };

  const update = async (id, data) => {
    await base44.entities.ContactMessage.update(id, data);
    qc.invalidateQueries({ queryKey: ["admin-contacts"] });
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyText("");
    if (msg.status === "new") {
      await update(msg.id, { status: "read" });
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    await base44.integrations.Core.SendEmail({
      to: selected.email,
      subject: `Re: ${selected.subject || "Your message to TN Voice"}`,
      body: replyText,
      from_name: "TN Voice Support",
    });
    await update(selected.id, { status: "replied", admin_reply: replyText });
    setReplyLoading(false);
    setSelected(null);
    toast({ description: "Reply sent successfully." });
  };

  const handleDelete = async (id) => {
    await base44.entities.ContactMessage.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-contacts"] });
    if (selected?.id === id) setSelected(null);
    toast({ description: "Message deleted." });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-600" /> Contact Messages
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Messages submitted via the public Contact Us page</p>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "new", "read", "replied", "archived"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-all border ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300"}`}>
            {s} {counts[s] > 0 && <span className={`ml-1 text-xs font-bold ${statusFilter === s ? "text-white/80" : s === "new" ? "text-blue-600" : "text-slate-400"}`}>({counts[s]})</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search by name, email, subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No messages found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <div key={msg.id} className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 transition-all hover:shadow-sm ${msg.status === "new" ? "border-blue-300 dark:border-blue-700" : "border-slate-200 dark:border-slate-700"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[msg.status]}`}>{msg.status}</span>
                    {msg.topic && <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{TOPIC_LABELS[msg.topic] || msg.topic}</span>}
                    <span className="text-xs text-slate-400">{msg.created_date ? format(new Date(msg.created_date), "dd MMM yyyy, h:mm a") : ""}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{msg.name} <span className="font-normal text-slate-400 text-xs">— {msg.email}</span></p>
                  {msg.subject && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">📌 {msg.subject}</p>}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{msg.message}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openMessage(msg)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View & Reply">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => update(msg.id, { status: "archived" })} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Archive">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Message from {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1">
                <p><span className="font-medium text-slate-600 dark:text-slate-400">From:</span> {selected.name} ({selected.email})</p>
                {selected.topic && <p><span className="font-medium text-slate-600 dark:text-slate-400">Topic:</span> {TOPIC_LABELS[selected.topic]}</p>}
                {selected.subject && <p><span className="font-medium text-slate-600 dark:text-slate-400">Subject:</span> {selected.subject}</p>}
                <p><span className="font-medium text-slate-600 dark:text-slate-400">Date:</span> {selected.created_date ? format(new Date(selected.created_date), "dd MMM yyyy, h:mm a") : ""}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Message:</p>
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              {selected.admin_reply && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 p-3">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">✓ Previous Reply Sent:</p>
                  <p className="text-slate-700 dark:text-slate-300 text-xs whitespace-pre-wrap">{selected.admin_reply}</p>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Internal Note (not sent to user)</label>
                <textarea
                  defaultValue={selected.admin_note || ""}
                  onBlur={(e) => update(selected.id, { admin_note: e.target.value })}
                  rows={2}
                  placeholder="Add internal note..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Reply */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Reply to {selected.email}</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleReply} disabled={replyLoading || !replyText.trim()} className="flex items-center gap-2 flex-1">
                  <Reply className="w-4 h-4" /> {replyLoading ? "Sending..." : "Send Reply"}
                </Button>
                <Button variant="outline" onClick={() => { update(selected.id, { status: "archived" }); setSelected(null); }} className="flex items-center gap-2">
                  <Archive className="w-4 h-4" /> Archive
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}