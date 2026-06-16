import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Trash2, Flag, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminTable, AdminTh, AdminTd, AdminTr } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ModerationActions from "@/components/admin/ModerationActions";
import BulkActionBar from "@/components/admin/BulkActionBar";
import ModerationHistory from "@/components/admin/ModerationHistory";
import AiModerationAssistant from "@/components/admin/moderation/AiModerationAssistant";
import { getAllPosts, updatePostStatus, deletePost } from "@/services/admin/posts";
import { logModerationAction, bulkModeratePost } from "@/services/admin/moderation";
import { buildReportMap } from "@/services/ai/moderationQueue";
import { computeModerationPriority, getPriorityLabel } from "@/services/ai/trustScore";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const STATUSES = ["all", "active", "flagged", "removed"];

export default function AdminPosts() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts-all"],
    queryFn: () => getAllPosts(200),
    staleTime: 30_000,
  });

  const { data: reportMap = {} } = useQuery({
    queryKey: ["report-map"],
    queryFn: buildReportMap,
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || 
        (p.title_en || "").toLowerCase().includes(q) ||
        (p.district_name || "").toLowerCase().includes(q) ||
        (p.category_name || "").toLowerCase().includes(q) ||
        (p.author_name || "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [posts, statusFilter, search]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-posts-all"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const act = async (postId, status, action, note = "") => {
    await updatePostStatus(postId, status);
    await logModerationAction({ target_type: "post", target_id: postId, action, note, admin_email: "admin" });
    refresh();
    toast({ description: `Post ${action}.` });
  };

  const handleRemove = async (postId, note = "") => {
    try {
      await deletePost(postId);
      await logModerationAction({ target_type: "post", target_id: postId, action: "removed_db", note, admin_email: "admin" });
      refresh();
      toast({ description: "Post permanently removed from database." });
    } catch (err) {
      toast({ variant: "destructive", description: `Failed to remove post: ${err.message}` });
    }
  };

  const bulkAct = async (status, action) => {
    await bulkModeratePost(Array.from(selected), status, "admin");
    setSelected(new Set());
    refresh();
    toast({ description: `${selected.size} posts ${action}.` });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Posts</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and moderate all posts ({posts.length} total)</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by title, district, category, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search posts"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selected.size}
        onApprove={() => bulkAct("active", "approved")}
        onFlag={() => bulkAct("flagged", "flagged")}
        onRemove={() => bulkAct("removed", "removed")}
        onClearSelection={() => setSelected(new Set())}
      />

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="accent-blue-600"
                  aria-label="Select all"
                />
              </AdminTh>
              <AdminTh>Title</AdminTh>
              <AdminTh>District</AdminTh>
              <AdminTh>Type</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Risk</AdminTh>
              <AdminTh>Date</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                  No posts found
                </td>
              </tr>
            )}
            {filtered.map((post) => (
              <AdminTr key={post.id}>
                <AdminTd>
                  <input
                    type="checkbox"
                    checked={selected.has(post.id)}
                    onChange={() => toggleSelect(post.id)}
                    className="accent-blue-600"
                    aria-label={`Select ${post.title_en}`}
                  />
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => setPreview(post)}
                      className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                      aria-label="Preview post"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">
                      {post.title_en}
                    </span>
                  </div>
                </AdminTd>
                <AdminTd>{post.district_name}</AdminTd>
                <AdminTd>
                  <span className="capitalize text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                    {post.post_type?.replace("_", " ")}
                  </span>
                </AdminTd>
                <AdminTd><StatusBadge status={post.status} /></AdminTd>
                <AdminTd>
                  {(() => {
                    const rCount = reportMap[post.id] || 0;
                    const pri = computeModerationPriority(post, rCount);
                    const { label, color } = getPriorityLabel(pri);
                    return rCount > 0 || pri >= 20 ? (
                      <span className={cn("text-xs font-medium", color)}>
                        {label}{rCount > 0 ? ` (${rCount}⚑)` : ""}
                      </span>
                    ) : <span className="text-xs text-slate-300">—</span>;
                  })()}
                </AdminTd>
                <AdminTd className="text-xs text-slate-400">
                  {post.created_date
                    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
                    : ""}
                </AdminTd>
                <AdminTd>
                  <ModerationActions
                    showFlag
                    onApprove={(note) => act(post.id, "active", "approved", note)}
                    onReject={(note) => act(post.id, "removed", "deleted", note)}
                    onFlag={(note) => act(post.id, "flagged", "flagged", note)}
                    onDelete={(note) => act(post.id, "removed", "deleted", note)}
                    onRemove={(note) => handleRemove(post.id, note)}
                  />
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="line-clamp-2">{preview?.title_en}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4 text-sm">
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={preview.status} />
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs capitalize">
                  {preview.post_type?.replace("_", " ")}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                  {preview.district_name}
                </span>
                {preview.category_name && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {preview.category_name}
                  </span>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{preview.content_en}</p>
              {preview.media_urls?.length > 0 && (
                <img
                  src={preview.media_urls[0]}
                  alt=""
                  className="rounded-xl w-full object-cover max-h-52"
                  loading="lazy"
                />
              )}
              <div className="text-xs text-slate-400 flex flex-wrap gap-3">
                <span>By: {preview.is_anonymous ? "Anonymous" : preview.author_name || "—"}</span>
                <span>{preview.upvotes || 0} upvotes</span>
                <span>{preview.comment_count || 0} comments</span>
              </div>

              {/* AI Moderation Assistant */}
              <AiModerationAssistant post={preview} reportCount={reportMap[preview.id] || 0} />

              {/* Moderation History */}
              <div className="border-t border-slate-100 pt-3">
                <ModerationHistory target_id={preview.id} />
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { act(preview.id, "active", "approved"); setPreview(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => { act(preview.id, "flagged", "flagged"); setPreview(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium rounded-lg transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" /> Flag
                </button>
                <button
                  onClick={() => { act(preview.id, "removed", "deleted"); setPreview(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to permanently delete this post from the database? This action cannot be undone.")) {
                      handleRemove(preview.id);
                      setPreview(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove from DB
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}