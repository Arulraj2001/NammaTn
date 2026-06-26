import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllPosts } from "@/services/admin/posts";
import { Search, ExternalLink, Image as ImageIcon, Plus, Copy, Check, Trash2, FileText, Film, Music, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import MediaUploader from "@/components/media/MediaUploader";
import { supabase } from "@/api/supabaseClient";

const getFileType = (url) => {
  if (!url) return "file";
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  return "file";
};

const getFileNameFromUrl = (url) => {
  try {
    const decoded = decodeURIComponent(url);
    return decoded.split("/").pop();
  } catch {
    return url;
  }
};

function FileIcon({ type }) {
  if (type === "video") return <Film className="w-8 h-8 text-purple-400" />;
  if (type === "audio") return <Music className="w-8 h-8 text-green-400" />;
  return <FileText className="w-8 h-8 text-slate-400" />;
}

export default function AdminMedia() {
  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "uploads"
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: uploadedFiles = [], isLoading: isLoadingUploads, refetch: refetchUploads, isRefetching } = useQuery({
    queryKey: ["admin-direct-uploads"],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .list("", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (error) throw error;

      return (data || []).map((file) => {
        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(file.name);

        let file_url = publicUrl;
        if (file_url && !file_url.includes("/storage/v1/object/public/")) {
          file_url = file_url.replace("/storage/v1/object/media/", "/storage/v1/object/public/media/");
        }

        return {
          name: file.name,
          url: file_url,
          created_at: file.created_at,
          size: file.metadata?.size || 0,
          mimetype: file.metadata?.mimetype || ""
        };
      });
    },
    enabled: activeTab === "uploads"
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-posts-all"],
    queryFn: () => getAllPosts(500),
  });

  // Collect all media from posts
  const mediaItems = posts
    .flatMap((p) => {
      const urls = [];
      if (Array.isArray(p.media_urls)) urls.push(...p.media_urls);
      if (Array.isArray(p.before_photos)) urls.push(...p.before_photos);
      if (Array.isArray(p.claimed_fixed_photos)) urls.push(...p.claimed_fixed_photos);
      if (Array.isArray(p.final_resolution_photos)) urls.push(...p.final_resolution_photos);
      if (p.complaint_screenshot_url) urls.push(p.complaint_screenshot_url);
      
      const uniqueUrls = [...new Set(urls.filter(Boolean))];
      
      return uniqueUrls.map((url) => ({
        url,
        post_id: p.id,
        post_title: p.title_en,
        district: p.district_name,
        created_date: p.created_date,
      }));
    })
    .filter((m) =>
      !search ||
      (m.post_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.district || "").toLowerCase().includes(search.toLowerCase())
    );

  const handleUrlsChange = (urls) => {
    queryClient.invalidateQueries({ queryKey: ["admin-direct-uploads"] });
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast({
      description: "Copied link to clipboard!",
    });
    setTimeout(() => {
      setCopiedUrl(null);
    }, 2000);
  };

  const handleRemoveUploadedFile = async (file) => {
    if (window.confirm(`Delete "${file.name}" permanently from Supabase Storage? This action cannot be undone and will break any posts linking to this media.`)) {
      try {
        const { error } = await supabase.storage.from("media").remove([file.name]);
        if (error) throw error;
        toast({ description: "File deleted successfully from storage." });
        queryClient.invalidateQueries({ queryKey: ["admin-direct-uploads"] });
      } catch (err) {
        toast({
          variant: "destructive",
          description: "Failed to delete file from storage.",
        });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Media</h1>
          <p className="text-sm text-slate-500 mt-1">Manage files and browse uploaded media</p>
        </div>
        <Button onClick={() => setActiveTab("uploads")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" /> Upload New Media
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-0">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            activeTab === "posts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          🖼️ Post Media
        </button>
        <button
          onClick={() => setActiveTab("uploads")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            activeTab === "uploads"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          📤 Direct Uploads
        </button>
      </div>

      {activeTab === "posts" && (
        <>
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
        </>
      )}

      {activeTab === "uploads" && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Upload files to Supabase Storage</h2>
            <MediaUploader onUrlsChange={handleUrlsChange} maxFiles={10} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Direct Upload Storage ({uploadedFiles.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchUploads()}
                disabled={isLoadingUploads || isRefetching}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {isLoadingUploads ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/40 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-400">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No direct uploads in storage bucket yet</p>
                <p className="text-xs text-slate-400/80 mt-1">Upload files above to generate shareable links</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uploadedFiles.map((file, idx) => {
                  const fileType = getFileType(file.url);
                  const isCopied = copiedUrl === file.url;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                      <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                        {fileType === "image" ? (
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileIcon type={fileType} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <input
                          type="text"
                          readOnly
                          value={file.url}
                          onClick={(e) => e.target.select()}
                          className="text-[10px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 mt-1 text-slate-500 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={isCopied ? "default" : "outline"}
                          onClick={() => handleCopy(file.url)}
                          className={`h-8 px-2 text-xs flex items-center gap-1 ${isCopied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isCopied ? "Copied" : "Copy"}</span>
                        </Button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 h-8 w-8 transition-colors"
                          title="Open Original"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleRemoveUploadedFile(file)}
                          className="inline-flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-500 text-slate-400 h-8 w-8 transition-colors"
                          title="Delete from storage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <DialogDescription className="sr-only">Detailed preview of selected media item</DialogDescription>
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