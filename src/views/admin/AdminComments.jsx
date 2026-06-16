import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminTable, AdminTh, AdminTd, AdminTr } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ModerationActions from "@/components/admin/ModerationActions";
import { getAllComments, getFlaggedComments, updateCommentStatus, deleteComment } from "@/services/admin/comments";

const getCommentsByStatus = (status, limit) =>
  status === "flagged" ? getFlaggedComments(limit) : getAllComments(limit);

const approveComment = (id) => updateCommentStatus(id, "active");
const rejectComment = (id) => updateCommentStatus(id, "removed");
const flagComment = (id) => updateCommentStatus(id, "flagged");
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const STATUSES = ["all", "active", "flagged", "removed"];

export default function AdminComments() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments", status],
    queryFn: () => getCommentsByStatus(status, 100),
  });

  const filtered = comments.filter((c) =>
    (c.content || "").toLowerCase().includes(search.toLowerCase())
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] });

  const act = async (fn, id, note) => {
    await fn(id, note);
    refresh();
    toast({ description: "Action completed." });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Comments</h1>
        <p className="text-sm text-slate-500 mt-1">Review and moderate user comments</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search comments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                status === s ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Content</AdminTh>
              <AdminTh>Author</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Date</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No comments found</td></tr>
            )}
            {filtered.map((c) => (
              <AdminTr key={c.id}>
                <AdminTd><p className="line-clamp-2 max-w-xs text-slate-700">{c.content}</p></AdminTd>
                <AdminTd className="text-sm">{c.is_anonymous ? <span className="text-slate-400 italic">Anonymous</span> : c.author_name}</AdminTd>
                <AdminTd><StatusBadge status={c.status} /></AdminTd>
                <AdminTd className="text-xs text-slate-400">
                  {c.created_date ? formatDistanceToNow(new Date(c.created_date), { addSuffix: true }) : ""}
                </AdminTd>
                <AdminTd>
                  <ModerationActions
                    showFlag
                    onApprove={(note) => act(approveComment, c.id, note)}
                    onReject={(note) => act(rejectComment, c.id, note)}
                    onFlag={(note) => act(flagComment, c.id, note)}
                    onDelete={(note) => act(deleteComment, c.id, note)}
                  />
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}