import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPosts } from "@/services/admin/posts";
import { Search, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AdminMedia() {
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts-all"],
    queryFn: () => getAllPosts(500),
  });

  // Collect all media from posts
  const mediaItems = posts
    .flatMap((p) =>
      (p.media_urls || []).map((url) => ({
        url,
        post_id: p.id,
        post_title: p.title_en,
        district: p.district_name,
        created_date: p.created_date,
      }))
    )
    .filter((m) =>
      !search ||
      (m.post_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.district || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Media</h1>
        <p className="text-sm text-slate-500 mt-1">Browse all uploaded media from posts</p>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search by post title or district..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No media uploaded yet</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-3">{mediaItems.length} media item{mediaItems.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {mediaItems.map((m, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => setPreview(m)}
              >
                <img
                  src={m.url}
                  alt={m.post_title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl">
          {preview && (
            <div className="space-y-3">
              <img src={preview.url} alt="" className="w-full rounded-xl object-contain max-h-[60vh]" />
              <div className="text-sm text-slate-700">
                <p className="font-medium">{preview.post_title}</p>
                <p className="text-xs text-slate-400 mt-1">{preview.district}</p>
                <a href={preview.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                  Open original
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}